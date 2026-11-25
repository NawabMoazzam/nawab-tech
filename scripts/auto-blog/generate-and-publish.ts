/**
 * Daily automated blog publisher with a capability-ordered Gemini model
 * fallback chain and strict SEO / editorial quality validation.
 *
 * What this does, end to end:
 *   1. Walks a capability-ordered fallback chain of Google Gemini models to
 *      generate a brand-new, SEO-optimized blog post: title, slug, excerpt,
 *      full markdown content, category, tags, dedicated SEO metadata
 *      (focusKeyword, seoTitle, seoDescription, seoKeywords), and a stock-photo
 *      search phrase for the cover image.
 *   2. Validates that the model actually completed its job (HTTP status,
 *      finishReason, valid JSON, word count, heading hierarchy, internal links,
 *      non-duplicate topic, and SEO metadata constraints). If a model fails,
 *      times out, hits quota/rate limits, rejects this key for its token type
 *      (401), or produces sub-par/incomplete output, the chain advances to the
 *      next model. A models.list preflight checks the sanitized key first.
 *   3. Queries the Pexels API for a relevant, high-quality landscape photo and
 *      stores that URL on the post, so automated covers use no ImageKit
 *      storage. Set AUTO_BLOG_UPLOAD_COVER=true to copy the photo into
 *      ImageKit instead (older behaviour).
 *   4. Saves the finished post as a draft by default; AUTO_PUBLISH=true keeps
 *      the previous immediate-publishing behavior.
 *   5. Pings the site's /api/revalidate endpoint so the new post shows up
 *      immediately instead of waiting for the hourly ISR refresh.
 *
 * Run locally:
 *   npx tsx scripts/auto-blog/generate-and-publish.ts
 *
 * Required environment variables (see .env.example / README):
 *   MONGODB_URI
 *   GEMINI_API_KEY
 *   PEXELS_API_KEY
 *
 * Optional:
 *   AUTO_BLOG_UPLOAD_COVER=true - upload the Pexels photo to ImageKit instead
 *     of linking it (requires IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and
 *     IMAGEKIT_URL_ENDPOINT)
 *   GEMINI_MODEL - primary model override (prepended to the fallback chain)
 *   GEMINI_MODELS - comma-separated custom model chain (prepended to defaults)
 *   NEXT_PUBLIC_BASE_URL / BETTER_AUTH_URL - used to call /api/revalidate
 *   BLOG_REVALIDATE_SECRET - shared secret for /api/revalidate
 *   AUTO_PUBLISH=true - publish immediately; default is draft
 *   DRY_RUN=true - do everything except writing to MongoDB (safe test run)
 */

import * as dotenv from "dotenv";
import mongoose from "mongoose";
import ImageKit from "imagekit";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { slugify } from "../../lib/slugify";
import { contentStrategy } from "../../lib/content-strategy";
import { siteConfig } from "../../lib/site";

function sanitizeGeminiApiKey(value: string | undefined): string | undefined {
  let key = value?.trim() ?? "";
  key = key.replace(/^['"]|['"]$/g, "").trim();
  key = key.replace(/^Bearer\s+/i, "").trim();
  key = key.replace(/^['"]|['"]$/g, "").trim();
  return key || undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;
const GEMINI_API_KEY = sanitizeGeminiApiKey(process.env.GEMINI_API_KEY);
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || process.env.BETTER_AUTH_URL || siteConfig.url;
const AUTO_PUBLISH = process.env.AUTO_PUBLISH === "true";
const REVALIDATE_SECRET = process.env.BLOG_REVALIDATE_SECRET;
const DRY_RUN = process.env.DRY_RUN === "true";
/**
 * Covers are stored as Pexels URLs by default: the photo is served from the
 * Pexels CDN, so automated posts use no ImageKit storage. Flip this to "true"
 * to copy the photo into ImageKit instead.
 */
const UPLOAD_COVER = process.env.AUTO_BLOG_UPLOAD_COVER === "true";

type GeminiModelSpec = {
  id: string;
  label: string;
  role: string;
  temperature: number;
  maxAttempts: number;
  timeoutMs: number;
};

const GEMINI_CHAIN_BUDGET_MS = 8 * 60 * 1000;
const GEMINI_PREFLIGHT_TIMEOUT_MS = 15_000;

/**
 * Default Gemini fallback chain ordered by capability for long-form B2B SEO
 * content generation, E-E-A-T depth, and structured JSON schema reliability.
 *
 * Why this order:
 *   1. gemini-3.8-flash       - Latest flagship Gemini 3.8 Flash (GA, Free Tier).
 *                               Engineered for long-horizon tasks, high reasoning,
 *                               and strict structured output adherence.
 *   2. gemini-2.5-pro         - Full Pro reasoning model (GA, Free Tier).
 *                               Excels at deep technical/business analysis,
 *                               authority content, and nuanced SEO copywriting.
 *   3. gemini-3.1-pro-preview - Flagship Gemini 3 Pro reasoning model (Preview).
 *                               Top-tier intelligence if billing is active;
 *                               gracefully skipped immediately if free-tier 0-quota.
 *   4. gemini-3.7-flash       - High-capability Gemini 3.7 Flash (GA, Free Tier).
 *                               Strong multi-step execution & structured writing.
 *   5. gemini-3.6-flash       - Balanced Gemini 3.6 Flash (GA, Free Tier).
 *                               Reliable long-form prose & separate quota bucket.
 *   6. gemini-3.5-flash       - Proven Gemini 3.5 Flash (GA, Free Tier).
 *   7. gemini-3-flash-preview - Gemini 3 Flash Preview (Free Tier) with Pro-grade
 *                               intelligence at Flash speed.
 *   8. gemini-2.5-flash       - Hybrid-reasoning 2.5 workhorse (GA, Free Tier).
 *   9. gemini-3.5-flash-lite  - High-throughput 3.5 Flash-Lite (GA, Free Tier).
 *  10. gemini-3.1-flash-lite  - Frontier-efficiency 3.1 Flash-Lite (GA, Free Tier).
 *  11. gemini-2.5-flash-lite  - Final high-RPD-quota safety net (GA, Free Tier).
 */
const DEFAULT_GEMINI_MODEL_CHAIN: readonly GeminiModelSpec[] = [
  {
    id: "gemini-3.8-flash",
    label: "Gemini 3.8 Flash",
    role: "Primary flagship Flash (deep thinking, long-form SEO & structured JSON)",
    temperature: 0.8,
    maxAttempts: 2,
    timeoutMs: 90_000,
  },
  {
    id: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    role: "Pro-tier deep reasoning & authoritative B2B technical writing",
    temperature: 0.8,
    maxAttempts: 2,
    timeoutMs: 100_000,
  },
  {
    id: "gemini-3.1-pro-preview",
    label: "Gemini 3.1 Pro Preview",
    role: "Gemini 3 Pro flagship reasoning (used when project tier permits)",
    temperature: 0.8,
    maxAttempts: 1,
    timeoutMs: 100_000,
  },
  {
    id: "gemini-3.7-flash",
    label: "Gemini 3.7 Flash",
    role: "High-capability 3.7 Flash for structured editorial & SEO execution",
    temperature: 0.8,
    maxAttempts: 2,
    timeoutMs: 85_000,
  },
  {
    id: "gemini-3.6-flash",
    label: "Gemini 3.6 Flash",
    role: "Balanced 3.6 Flash for general long-form content & schema fidelity",
    temperature: 0.8,
    maxAttempts: 2,
    timeoutMs: 80_000,
  },
  {
    id: "gemini-3.5-flash",
    label: "Gemini 3.5 Flash",
    role: "Stable 3.5 Flash workhorse with independent per-model quota",
    temperature: 0.8,
    maxAttempts: 2,
    timeoutMs: 80_000,
  },
  {
    id: "gemini-3-flash-preview",
    label: "Gemini 3 Flash Preview",
    role: "Gemini 3 Flash preview with high reasoning-to-latency ratio",
    temperature: 0.8,
    maxAttempts: 2,
    timeoutMs: 80_000,
  },
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    role: "Proven 2.5 hybrid-reasoning workhorse for reliable JSON generation",
    temperature: 0.8,
    maxAttempts: 2,
    timeoutMs: 75_000,
  },
  {
    id: "gemini-3.5-flash-lite",
    label: "Gemini 3.5 Flash-Lite",
    role: "High-throughput 3.5 Lite fallback with generous rate limits",
    temperature: 0.75,
    maxAttempts: 2,
    timeoutMs: 65_000,
  },
  {
    id: "gemini-3.1-flash-lite",
    label: "Gemini 3.1 Flash-Lite",
    role: "Cost-efficient 3.1 Lite fallback rivaling larger models",
    temperature: 0.75,
    maxAttempts: 2,
    timeoutMs: 65_000,
  },
  {
    id: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash-Lite",
    role: "Final high-availability safety net with maximum free-tier RPD quota",
    temperature: 0.7,
    maxAttempts: 2,
    timeoutMs: 60_000,
  },
] as const;

/**
 * Builds the effective Gemini model fallback chain, honoring optional
 * GEMINI_MODELS (comma-separated) and GEMINI_MODEL environment overrides
 * while keeping the default capability-ordered chain as fallbacks.
 */
function buildGeminiModelChain(): GeminiModelSpec[] {
  const byId = new Map<string, GeminiModelSpec>(
    DEFAULT_GEMINI_MODEL_CHAIN.map((spec) => [spec.id, spec]),
  );

  const customIds: string[] = [];
  if (process.env.GEMINI_MODELS) {
    for (const raw of process.env.GEMINI_MODELS.split(",")) {
      const id = raw.trim();
      if (id) customIds.push(id);
    }
  }
  if (process.env.GEMINI_MODEL) {
    const primary = process.env.GEMINI_MODEL.trim();
    if (primary) customIds.unshift(primary);
  }

  const seen = new Set<string>();
  const chain: GeminiModelSpec[] = [];

  for (const id of customIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    const existing = byId.get(id);
    chain.push(
      existing ?? {
        id,
        label: id,
        role: "Custom environment-configured Gemini model",
        temperature: 0.8,
        maxAttempts: 2,
        timeoutMs: 85_000,
      },
    );
  }

  for (const spec of DEFAULT_GEMINI_MODEL_CHAIN) {
    if (seen.has(spec.id)) continue;
    seen.add(spec.id);
    chain.push(spec);
  }

  return chain;
}

function requireEnv() {
  const missing: string[] = [];
  if (!MONGODB_URI) missing.push("MONGODB_URI");
  if (!GEMINI_API_KEY) missing.push("GEMINI_API_KEY");
  if (!PEXELS_API_KEY) missing.push("PEXELS_API_KEY");
  if (UPLOAD_COVER) {
    if (!IMAGEKIT_PUBLIC_KEY) missing.push("IMAGEKIT_PUBLIC_KEY");
    if (!IMAGEKIT_PRIVATE_KEY) missing.push("IMAGEKIT_PRIVATE_KEY");
    if (!IMAGEKIT_URL_ENDPOINT) missing.push("IMAGEKIT_URL_ENDPOINT");
  }

  if (missing.length) {
    console.error(
      `Missing required environment variable(s): ${missing.join(", ")}`,
    );
    process.exit(1);
  }
}

async function preflightGeminiApiKey(): Promise<void> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing or empty after sanitising.");
  }

  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models",
    {
      method: "GET",
      headers: { "x-goog-api-key": GEMINI_API_KEY },
      signal: AbortSignal.timeout(GEMINI_PREFLIGHT_TIMEOUT_MS),
    },
  );
  const responseText = await res.text();

  if (!res.ok) {
    throw new Error(
      `Gemini models.list preflight failed (HTTP ${res.status}): ${responseText.slice(0, 500)}. Check that GEMINI_API_KEY is a valid Google AI Studio key with Gemini API access.`,
    );
  }

  let response: unknown;
  try {
    response = JSON.parse(responseText) as unknown;
  } catch {
    throw new Error("Gemini models.list preflight returned invalid JSON.");
  }

  const models =
    response !== null && typeof response === "object" && "models" in response
      ? (response as { models?: unknown }).models
      : undefined;
  if (!Array.isArray(models) || models.length === 0) {
    throw new Error(
      "Gemini models.list preflight succeeded but returned no models. Check the key's project and Gemini API access.",
    );
  }

  console.log(
    `[auto-blog] Gemini API-key preflight passed (models.list returned ${models.length} models).`,
  );
}

// Category definitions and allowed editorial categories come from the shared niche config.
const CATEGORIES = contentStrategy.allowedCategories;

type RawGeneratedPost = {
  title?: unknown;
  slug?: unknown;
  excerpt?: unknown;
  content?: unknown;
  tags?: unknown;
  category?: unknown;
  imageSearchQuery?: unknown;
  focusKeyword?: unknown;
  seoTitle?: unknown;
  seoDescription?: unknown;
  seoKeywords?: unknown;
  originalityPrompts?: unknown;
};

type GeneratedPost = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  category: string;
  imageSearchQuery: string;
  focusKeyword: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  originalityPrompts: string[];
  modelUsed: string;
};

class NonRetryableModelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NonRetryableModelError";
  }
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  attempts = 3,
): Promise<Response> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      lastError = new Error(
        `Request failed (${res.status}): ${await res.text()}`,
      );
    } catch (error) {
      lastError = error;
    }
    if (i < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
  throw lastError;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function stripJsonCodeFences(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

function stripLeadingH1(markdown: string): string {
  // The blog page template (app/blog/[slug]/page.tsx) already renders post.title
  // inside an <h1>. Stripping any leading "# Heading" prevents duplicate H1 tags,
  // which is a critical on-page SEO best practice.
  return markdown.replace(/^\s*#\s+[^\n]+\n+/, "").trim();
}

function normalizeSeoTitle(rawTitle: string, fallbackTitle: string): string {
  // Root layout (app/layout.tsx) defines title.template = "%s | Nawab Tech".
  // Keep seo.title clean of duplicate "| Nawab Tech" suffixes and within ~60 chars.
  const cleaned = (rawTitle || fallbackTitle)
    .replace(/\s*\|\s*Nawab\s*Tech.*$/i, "")
    .replace(/\s*-\s*Nawab\s*Tech.*$/i, "")
    .trim();

  if (cleaned.length <= 65) return cleaned;
  const truncated = cleaned.slice(0, 62);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 35 ? truncated.slice(0, lastSpace) : truncated).trim();
}

function normalizeSeoDescription(
  rawDescription: string,
  fallbackExcerpt: string,
): string {
  const base = (rawDescription || fallbackExcerpt)
    .replace(/[#*_`>\[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (base.length <= 160) return base;
  const truncated = base.slice(0, 157);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${(lastSpace > 100 ? truncated.slice(0, lastSpace) : truncated).trim()}...`;
}

/**
 * Validates and normalizes the parsed JSON from Gemini to guarantee that the
 * model genuinely completed its job with SEO and editorial best practices.
 * Throws an error if the output is incomplete, off-schema, or low quality,
 * triggering a retry or fallback to the next model in the chain.
 */
function validateAndNormalizeGeneratedPost(
  raw: RawGeneratedPost,
  recentTitles: string[],
  modelId: string,
  existingFocusKeywords: string[] = [],
): GeneratedPost {
  if (!raw || typeof raw !== "object") {
    throw new Error("Parsed response is not a JSON object.");
  }

  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (title.length < 20 || title.length > 140) {
    throw new Error(
      `Invalid title length (${title.length} chars). Expected 20-140 chars.`,
    );
  }

  const titleTokens = (value: string) => new Set(
    value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((token) => token.length > 2),
  );
  const generatedTokens = titleTokens(title);
  for (const recent of recentTitles) {
    const priorTokens = titleTokens(recent);
    const union = new Set([...generatedTokens, ...priorTokens]);
    const intersection = [...generatedTokens].filter((token) => priorTokens.has(token)).length;
    if (union.size > 0 && intersection / union.size > 0.5) {
      throw new Error(`Generated title is too similar to an existing post: "${recent}".`);
    }
  }

  const rawExcerpt =
    typeof raw.excerpt === "string"
      ? raw.excerpt.replace(/[#*_`]/g, "").replace(/\s+/g, " ").trim()
      : "";
  if (rawExcerpt.length < 50) {
    throw new Error(
      `Excerpt is too short (${rawExcerpt.length} chars). Expected at least 50 chars.`,
    );
  }
  const excerpt = rawExcerpt.slice(0, 280);

  const rawContent = typeof raw.content === "string" ? raw.content : "";
  let content = stripLeadingH1(rawContent);
  // Strip $...$ LaTeX/math wrappers (LLM artifact). Preserve simple currency amounts.
  content = content.replace(
    /\$(?!\s)((?:\\.|[^$\n\\])+?)(?<!\s)\$/g,
    (match, inner: string) => (/^\d[\d,.]*$/.test(inner) ? match : inner),
  );

  const wordCount = countWords(content);
  if (wordCount < 1100) {
    throw new Error(`Article content is too short (${wordCount} words). Minimum required is 1100.`);
  }

  const banned = contentStrategy.bannedPhrases.find((phrase) =>
    `${title} ${content}`.toLowerCase().includes(phrase.toLowerCase()),
  );
  if (banned) throw new Error(`Banned filler phrase found: "${banned}".`);
  if (
    /\$[^\n$]+\$/.test(content) ||
    /\\(?:\(|\[|begin\{|frac\b|sqrt\b|sum\b|int\b)/.test(content)
  ) {
    throw new Error("LaTeX and math markup are not allowed; use plain text.");
  }
  if (!/##\s+What I would do\b/i.test(content)) {
    throw new Error('Article needs a first-person "What I would do" section.');
  }
  if (!/(worked example|example:|for example)[\s\S]{0,700}(assumption|assume|assuming)/i.test(content)) {
    throw new Error("Include a concrete worked example with stated assumptions.");
  }
  if (!/^\|.+\|$/m.test(content) && !/^[-*] \[ \] /m.test(content) && !/^[-*] \[[xX ]\] /m.test(content)) {
    throw new Error("Include at least one checklist or a Markdown table.");
  }
  for (const line of content.split("\n")) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith("|") && trimmedLine.endsWith("|")) {
      const columnCount = trimmedLine.slice(1, -1).split("|").length;
      if (columnCount > 3) {
        throw new Error("Markdown tables may have no more than 3 columns.");
      }
    }
  }
  const faqHeadingIndex = content.search(/^##\s+Frequently Asked Questions\s*$/im);
  if (faqHeadingIndex < 0 || !/^###\s+.+\?/m.test(content.slice(faqHeadingIndex))) {
    throw new Error("Include an FAQ section with question headings.");
  }
  const internalLinks = [...content.matchAll(/\]\((\/(?:services|contact|about|faq|blog)[^\s)]*)\)/gi)];
  if (internalLinks.length < 2 || internalLinks.length > 3) {
    throw new Error(`Include 2-3 internal links (found ${internalLinks.length}).`);
  }

  const h2Matches = content.match(/^##\s+.+/gm) || [];
  if (h2Matches.length < 3) {
    throw new Error(
      `Article content has only ${h2Matches.length} H2 (##) headings. At least 3 are required for SEO structure.`,
    );
  }

  const categoryName =
    typeof raw.category === "string" ? raw.category.trim() : "";
  const matchedCategory = CATEGORIES.find(
    (category) => category.name.toLowerCase() === categoryName.toLowerCase(),
  );
  if (!matchedCategory) throw new Error(`Category is not allowed: "${categoryName}".`);

  const focusKeyword =
    typeof raw.focusKeyword === "string" && raw.focusKeyword.trim().length >= 3
      ? raw.focusKeyword.trim().toLowerCase()
      : matchedCategory.name.toLowerCase();
  if (existingFocusKeywords.some((keyword) => keyword.trim().toLowerCase() === focusKeyword)) {
    throw new Error(`Focus keyword already exists: "${focusKeyword}".`);
  }

  const rawTags = Array.isArray(raw.tags)
    ? raw.tags
        .map((t) => (typeof t === "string" ? t.toLowerCase().trim() : ""))
        .filter((t) => t.length >= 2 && t.length <= 45)
    : [];

  const tags = Array.from(new Set([focusKeyword, ...rawTags])).slice(0, 8);
  if (tags.length < 3) {
    throw new Error(`Insufficient valid tags (${tags.length}). Need at least 3.`);
  }

  const rawSeoKeywords = Array.isArray(raw.seoKeywords)
    ? raw.seoKeywords
        .map((k) => (typeof k === "string" ? k.toLowerCase().trim() : ""))
        .filter((k) => k.length >= 2 && k.length <= 60)
    : [];

  const seoKeywords = Array.from(
    new Set([focusKeyword, ...rawSeoKeywords, ...tags]),
  ).slice(0, 10);

  const rawSlug =
    typeof raw.slug === "string" && raw.slug.trim()
      ? slugify(raw.slug.trim())
      : slugify(title);
  const slug = rawSlug || slugify(title);
  if (!slug || slug.length < 5) {
    throw new Error("Generated slug is invalid or too short.");
  }

  const seoTitle = normalizeSeoTitle(
    typeof raw.seoTitle === "string" ? raw.seoTitle : "",
    title,
  );
  const seoDescription = normalizeSeoDescription(
    typeof raw.seoDescription === "string" ? raw.seoDescription : "",
    excerpt,
  );

  const originalityPrompts = Array.isArray(raw.originalityPrompts)
    ? raw.originalityPrompts.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 3)
    : [];
  if (originalityPrompts.length !== 3) {
    throw new Error("Return exactly three originality prompts for the author.");
  }

  const imageSearchQuery =
    typeof raw.imageSearchQuery === "string" &&
    raw.imageSearchQuery.trim().length >= 3
      ? raw.imageSearchQuery.trim()
      : `${matchedCategory.name} workspace technology`;

  return {
    title,
    slug,
    excerpt,
    content,
    tags,
    category: matchedCategory.name,
    imageSearchQuery,
    focusKeyword,
    seoTitle,
    seoDescription,
    seoKeywords,
    originalityPrompts,
    modelUsed: modelId,
  };
}

function buildSeoPrompt(
  recentTitles: string[],
  topic: { query: string; intent: string; originalAngle: string; proofElement: string },
): {
  systemInstruction: string;
  userPrompt: string;
  responseSchema: Record<string, unknown>;
} {
  const categoryNames = CATEGORIES.map((c) => c.name);

  const systemInstruction = `You are the practical editorial writer for ${siteConfig.name} (${siteConfig.url}). Niche: ${contentStrategy.niche}. Audience: ${contentStrategy.audience} Tone: ${contentStrategy.tone}`;

  const userPrompt = `Write ONE brand-new, original, high-ranking blog article for the Nawab Tech Insights blog.

### 1. Topic & Category Selection
- Available categories: ${categoryNames.join(", ")}.
- Approved buyer query: "${topic.query}". Search intent: ${topic.intent}.
- Required original angle: ${topic.originalAngle}
- Include this proof element honestly (state assumptions where needed; do not fabricate client results): ${topic.proofElement}
- Do NOT reuse or closely paraphrase any of these recently published titles:
  ${recentTitles.length ? recentTitles.map((t) => `• ${t}`).join("\n  ") : "• (none yet)"}
- Stay tightly on the approved query and practical small-business buyer needs. Do not invent search volumes, market research, client stories, or measured outcomes.

### 2. On-Page SEO & E-E-A-T Best Practices
- Write in ${contentStrategy.language} for this audience: ${contentStrategy.audience}
- Use this tone: ${contentStrategy.tone}
- Never use these phrases: ${contentStrategy.bannedPhrases.join(", ")}
- **Focus Keyword**: Identify a primary long-tail search query (3-5 words) with clear business intent.
- **Title (H1)**: Compelling, specific, human-first headline (50-75 characters ideal) that naturally incorporates the primary keyword or core concept.
- **SEO Title (meta title)**: 45-60 characters, front-loading the focus keyword for search results. Do NOT append "| Nawab Tech" (the site template appends it automatically).
- **SEO Description (meta description)**: 135-158 characters. Include the focus keyword, a concrete value proposition, and an implicit call-to-action to maximize organic click-through rate (CTR).
- **Slug**: Short, keyword-rich URL slug (4-7 lowercase words separated by hyphens, avoiding unnecessary filler stop words).
- **Heading Hierarchy**:
  - Do NOT start \`content\` with a \`# Title\` H1 heading (the page template already renders the H1).
  - Structure the body with clear, keyword-informed \`## \` (H2) section headings and \`### \` (H3) subheadings.
- **Content Depth & Formatting (1100-1500 words)**:
  - Open with a sharp hook addressing the reader's exact business pain point and previewing the actionable outcome within the first 100 words.
  - Provide concrete numbers, realistic implementation ranges, architectural comparisons, checklists, or step-by-step frameworks—never generic AI fluff.
  - Use short paragraphs (2-4 sentences), bulleted/numbered lists, bold key takeaways, and a comparison table or structured checklist where helpful.
  - Include a first-person ## What I would do section.
  - Include one concrete worked example and explicitly state its assumptions.
  - Include one useful checklist or a table with no more than 3 columns.
  - Include a concise **"Frequently Asked Questions"** section (\`## Frequently Asked Questions\`) near the end with 3 specific Q&As (\`### Question?\`) targeting "People Also Ask" long-tail queries.
- **Internal Linking (Required)**:
  - Naturally weave exactly 2-3 contextual Markdown links into the body pointing to real pages using relative paths:
    - \`/services/web-development\` (Web Development & Business Websites)
    - \`/services/custom-web-applications\` (Custom Web Applications)
    - \`/services/dashboard-development\` (Dashboard Development & Internal Tools)
    - \`/services/automation-integrations\` (AI Automation & API Integrations)
    - \`/services\` (All Services)
    - \`/contact\` (Start a Project / Consultation)
- **Originality prompts**: Return exactly three specific questions for the human author to answer before publication. At least one should request a real project number, decision, or firsthand observation. These are editorial prompts, not article content.
- **Cover Image Search Query**:
  - Provide a 2-4 word English stock-photo search phrase for Pexels (e.g., "software team analytics dashboard", "modern office developer laptop").
- **Formatting constraints (strict)**:
  - No LaTeX or \`$...$\` math notation. Use plain text instead (for example, write O(1), not \`$O(1)$\`).
  - Comparison tables must have at most 3 columns with short cell text.
  - No code block line wider than ~60 characters; wrap or shorten code examples.`;

  const responseSchema = {
    type: "object",
    properties: {
      title: {
        type: "string",
        description:
          "Article headline (H1), specific and compelling, 50-85 characters.",
      },
      slug: {
        type: "string",
        description:
          "SEO-friendly URL slug, 4-7 lowercase hyphen-separated words containing the focus keyword.",
      },
      focusKeyword: {
        type: "string",
        description:
          "Primary long-tail search keyword targeted by the article (lowercase).",
      },
      seoTitle: {
        type: "string",
        description:
          "SERP meta title (45-60 characters, keyword-frontloaded, without '| Nawab Tech').",
      },
      seoDescription: {
        type: "string",
        description:
          "SERP meta description (135-158 characters, includes focus keyword and clear value proposition).",
      },
      seoKeywords: {
        type: "array",
        items: { type: "string" },
        description:
          "5-8 targeted SEO keywords (primary focus keyword + semantic/long-tail variations).",
      },
      excerpt: {
        type: "string",
        description:
          "1-2 sentence plain-text summary for blog cards (120-240 characters, no markdown).",
      },
      content: {
        type: "string",
        description:
          "Full article body in Markdown (850-1250 words). Use ## and ### headings, lists, internal links to /services/* and /contact, and a brief FAQ section. Do not include a leading # H1.",
      },
      tags: {
        type: "array",
        items: { type: "string" },
        description: "4-6 short lowercase topic tags.",
      },
      category: {
        type: "string",
        enum: categoryNames,
      },
      originalityPrompts: {
        type: "array",
        items: { type: "string" },
        description: "Exactly three specific questions the author must answer before publication.",
      },
      imageSearchQuery: {
        type: "string",
        description:
          "Short (2-4 word) English stock-photo search phrase for Pexels.",
      },
    },
    required: [
      "title",
      "slug",
      "focusKeyword",
      "seoTitle",
      "seoDescription",
      "seoKeywords",
      "excerpt",
      "content",
      "tags",
      "category",
      "imageSearchQuery",
      "originalityPrompts",
    ],
  };

  return { systemInstruction, userPrompt, responseSchema };
}

/**
 * Inspects an HTTP error from the Gemini endpoint and determines whether
 * retrying the SAME model makes sense or if we should immediately advance to
 * the next model in the fallback chain.
 */
function classifyGeminiHttpError(
  status: number,
  bodyText: string,
  modelId: string,
): { retrySameModel: boolean; error: Error; retryAfterMs?: number } {
  const summary = bodyText.slice(0, 500);

  if (status === 401) {
    // Some Gemini models reject an API key with ACCESS_TOKEN_TYPE_UNSUPPORTED
    // even though that same key works with other models. The models.list
    // preflight catches globally invalid keys; treat generateContent 401s as
    // model-specific so the fallback chain can continue.
    const detail = /ACCESS_TOKEN_TYPE_UNSUPPORTED/i.test(bodyText)
      ? "ACCESS_TOKEN_TYPE_UNSUPPORTED"
      : "authentication rejected for this model";
    return {
      retrySameModel: false,
      error: new NonRetryableModelError(
        `[${modelId}] HTTP 401 (${detail}); advancing to the next model: ${summary}`,
      ),
    };
  }

  // 400 (unsupported model feature/schema), 403 (tier/permission restriction),
  // 404 (model retired, preview ended, or unavailable in region) -> switch model immediately.
  if (status === 400 || status === 403 || status === 404) {
    return {
      retrySameModel: false,
      error: new NonRetryableModelError(
        `[${modelId}] HTTP ${status} (non-retryable for this model): ${summary}`,
      ),
    };
  }

  if (status === 429) {
    // Distinguish zero-quota / daily quota exhaustion from transient RPM spikes.
    const isHardQuotaExhausted =
      /limit:\s*0\b/i.test(bodyText) ||
      /GenerateRequestsPerDay/i.test(bodyText) ||
      /PerDay/i.test(bodyText) ||
      /check your plan and billing/i.test(bodyText) ||
      /billing account/i.test(bodyText);

    if (isHardQuotaExhausted) {
      return {
        retrySameModel: false,
        error: new NonRetryableModelError(
          `[${modelId}] Quota exhausted (429 daily/tier limit) - switching to next model immediately: ${summary}`,
        ),
      };
    }

    // Parse optional retryDelay (e.g. "retryDelay": "8s") if small enough
    let retryAfterMs: number | undefined;
    const delayMatch = bodyText.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/i);
    if (delayMatch) {
      const seconds = Number.parseFloat(delayMatch[1]);
      if (Number.isFinite(seconds) && seconds > 0) {
        if (seconds > 20) {
          // If the model asks us to wait >20s, falling back to the next model is faster and safer.
          return {
            retrySameModel: false,
            error: new NonRetryableModelError(
              `[${modelId}] Rate limited (429) with long retryDelay (${seconds}s) - falling back to next model.`,
            ),
          };
        }
        retryAfterMs = Math.ceil(seconds * 1000) + 500;
      }
    }

    return {
      retrySameModel: true,
      retryAfterMs,
      error: new Error(`[${modelId}] Rate limited (429): ${summary}`),
    };
  }

  // 500, 502, 503, 504 or other server errors are retryable up to maxAttempts
  return {
    retrySameModel: status >= 500,
    error: new Error(`[${modelId}] HTTP ${status}: ${summary}`),
  };
}

/**
 * Calls a single Gemini model once and validates that the response completed
 * and meets all structural and SEO requirements.
 */
async function callGeminiModelOnce(
  model: GeminiModelSpec,
  payload: {
    systemInstruction: string;
    userPrompt: string;
    responseSchema: Record<string, unknown>;
  },
  recentTitles: string[],
  timeoutMs = model.timeoutMs,
  existingFocusKeywords: string[] = [],
): Promise<GeneratedPost> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model.id,
  )}:generateContent`;

  const body = {
    systemInstruction: {
      parts: [{ text: payload.systemInstruction }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: payload.userPrompt }],
      },
    ],
    generationConfig: {
      temperature: model.temperature,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      responseSchema: payload.responseSchema,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY as string,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const errText = await res.text();
    const classified = classifyGeminiHttpError(res.status, errText, model.id);
    if (classified.retryAfterMs) {
      (
        classified.error as Error & { retryAfterMs?: number }
      ).retryAfterMs = classified.retryAfterMs;
    }
    throw classified.error;
  }

  const json = (await res.json()) as {
    promptFeedback?: { blockReason?: string };
    candidates?: Array<{
      finishReason?: string;
      content?: {
        parts?: Array<{ text?: string; thought?: boolean }>;
      };
    }>;
  };

  if (json.promptFeedback?.blockReason) {
    throw new NonRetryableModelError(
      `[${model.id}] Prompt blocked by safety filter (${json.promptFeedback.blockReason}).`,
    );
  }

  const candidate = json.candidates?.[0];
  if (!candidate) {
    throw new Error(
      `[${model.id}] Gemini returned no candidates: ${JSON.stringify(json).slice(0, 400)}`,
    );
  }

  const finishReason = candidate.finishReason;
  if (
    finishReason &&
    finishReason !== "STOP" &&
    finishReason !== "FINISH_REASON_UNSPECIFIED"
  ) {
    throw new Error(
      `[${model.id}] Generation did not finish cleanly (finishReason=${finishReason}).`,
    );
  }

  const parts = candidate.content?.parts || [];
  // Thinking-capable models may include a part with `thought: true` before the
  // final JSON text part. Always prefer the non-thought text part.
  const textPart =
    parts.find((p) => !p.thought && typeof p.text === "string" && p.text.trim()) ??
    parts.find((p) => typeof p.text === "string" && p.text.trim());

  if (!textPart?.text) {
    throw new Error(
      `[${model.id}] Candidate contained no text output: ${JSON.stringify(candidate).slice(0, 400)}`,
    );
  }

  let parsed: RawGeneratedPost;
  try {
    parsed = JSON.parse(stripJsonCodeFences(textPart.text)) as RawGeneratedPost;
  } catch (parseErr) {
    throw new Error(
      `[${model.id}] Failed to parse JSON output (${
        parseErr instanceof Error ? parseErr.message : String(parseErr)
      }). Snippet: ${textPart.text.slice(0, 250)}`,
    );
  }

  return validateAndNormalizeGeneratedPost(parsed, recentTitles, model.id, existingFocusKeywords);
}

/**
 * Executes the Gemini fallback chain in capability sequence until a model
 * successfully generates and validates the complete SEO blog post.
 */
async function generatePostWithGeminiFallbackChain(
  recentTitles: string[],
  topic: { query: string; intent: string; originalAngle: string; proofElement: string },
  existingFocusKeywords: string[] = [],
): Promise<GeneratedPost> {
  const chain = buildGeminiModelChain();
  const promptPayload = buildSeoPrompt(recentTitles, topic);
  const failures: Array<{ model: string; error: string }> = [];
  const deadline = Date.now() + GEMINI_CHAIN_BUDGET_MS;
  let budgetExceeded = false;

  console.log(
    `[auto-blog] Gemini fallback chain (${chain.length} models): ${chain
      .map((m) => m.id)
      .join(" -> ")}`,
  );
  console.log(
    `[auto-blog] Gemini generation budget: ${GEMINI_CHAIN_BUDGET_MS / 60_000} minutes.`,
  );

  for (
    let modelIndex = 0;
    modelIndex < chain.length && !budgetExceeded;
    modelIndex++
  ) {
    const model = chain[modelIndex];

    for (let attempt = 1; attempt <= model.maxAttempts; attempt++) {
      const remainingMs = deadline - Date.now();
      if (remainingMs <= 0) {
        budgetExceeded = true;
        console.warn("[auto-blog] Gemini chain budget exhausted before the next attempt.");
        break;
      }

      try {
        console.log(
          `[auto-blog] [${modelIndex + 1}/${chain.length}] Trying ${model.label} (${model.id}) — attempt ${attempt}/${model.maxAttempts} [${model.role}]...`,
        );

        const result = await callGeminiModelOnce(
          model,
          promptPayload,
          recentTitles,
          Math.min(model.timeoutMs, remainingMs),
          existingFocusKeywords,
        );

        console.log(
          `[auto-blog] Success with ${model.label} (${model.id}) on attempt ${attempt}!`,
        );
        return result;
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        failures.push({
          model: `${model.id} (attempt ${attempt})`,
          error: errMsg,
        });

        const isNonRetryable = error instanceof NonRetryableModelError;
        const hasMoreAttempts = !isNonRetryable && attempt < model.maxAttempts;

        if (hasMoreAttempts) {
          const customDelay = (error as { retryAfterMs?: number })?.retryAfterMs;
          const backoffMs =
            customDelay ?? Math.min(10_000, 2_500 * attempt + Math.floor(Math.random() * 1_000));
          const budgetLeftMs = deadline - Date.now();

          if (budgetLeftMs <= 0) {
            budgetExceeded = true;
            console.warn("[auto-blog] Gemini chain budget exhausted while attempting a model.");
            break;
          }
          if (backoffMs >= budgetLeftMs) {
            console.warn(
              `[auto-blog] Not enough chain budget to retry ${model.id} after ${backoffMs}ms; advancing to the next model.`,
            );
            break;
          }

          console.warn(
            `[auto-blog] ${errMsg} — retrying ${model.id} in ${backoffMs}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        } else {
          const nextModel = chain[modelIndex + 1];
          if (nextModel) {
            console.warn(
              `[auto-blog] ${model.id} failed to complete job (${errMsg}). Falling back to ${nextModel.id}...`,
            );
          } else {
            console.error(
              `[auto-blog] Final fallback model ${model.id} failed (${errMsg}).`,
            );
          }
          break;
        }
      }
    }
  }

  const failureReport = failures
    .map((f, idx) => `  ${idx + 1}. ${f.model}: ${f.error}`)
    .join("\n");
  const summary = budgetExceeded
    ? `Gemini fallback chain exhausted its ${GEMINI_CHAIN_BUDGET_MS / 60_000}-minute budget`
    : `All ${chain.length} Gemini models in the fallback chain failed to generate a valid blog post`;
  throw new Error(`${summary}:\n${failureReport}`);
}

type PexelsPhoto = {
  src: {
    large2x?: string;
    large?: string;
    original?: string;
  };
};

async function findCoverImageUrl(searchQuery: string): Promise<string> {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
    searchQuery,
  )}&orientation=landscape&per_page=10`;

  const res = await fetchWithRetry(url, {
    method: "GET",
    headers: { Authorization: PEXELS_API_KEY as string },
  });

  const json = (await res.json()) as { photos?: PexelsPhoto[] };
  const photos = json.photos || [];

  if (!photos.length) {
    // Fall back to a generic, always-populated query rather than failing
    // the whole run over one oddly specific search phrase.
    const fallbackRes = await fetchWithRetry(
      `https://api.pexels.com/v1/search?query=technology%20office&orientation=landscape&per_page=10`,
      { method: "GET", headers: { Authorization: PEXELS_API_KEY as string } },
    );
    const fallbackJson = (await fallbackRes.json()) as {
      photos?: PexelsPhoto[];
    };
    const fallbackPhotos = fallbackJson.photos || [];
    if (!fallbackPhotos.length) {
      throw new Error(
        "Pexels returned no photos, even for the fallback query.",
      );
    }
    const pick =
      fallbackPhotos[Math.floor(Math.random() * fallbackPhotos.length)];
    return (pick.src.large2x || pick.src.large || pick.src.original) as string;
  }

  const pick = photos[Math.floor(Math.random() * photos.length)];
  return (pick.src.large2x || pick.src.large || pick.src.original) as string;
}

async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetchWithRetry(url, { method: "GET" }, 4);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function computeReadingTime(content: string) {
  const words = countWords(content);
  return Math.max(1, Math.ceil(words / 200));
}

async function ensureUniqueSlug(
  posts: mongoose.mongo.Collection,
  baseSlug: string,
) {
  let slug = baseSlug;
  let suffix = 2;
  for (;;) {
    const existing = await posts.findOne({ slug });
    if (!existing) return slug;
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function ensureCategory(
  categories: mongoose.mongo.Collection,
  name: string,
) {
  const match = CATEGORIES.find((c) => c.name === name) || CATEGORIES[0];
  const now = new Date();

  const result = await categories.findOneAndUpdate(
    { slug: match.slug },
    {
      $setOnInsert: {
        name: match.name,
        slug: match.slug,
        description: match.description,
        createdAt: now,
      },
      $set: { updatedAt: now },
    },
    { upsert: true, returnDocument: "after" },
  );

  if (!result) throw new Error(`Could not create/find category ${match.slug}`);
  return result;
}

async function main() {
  requireEnv();

  console.log(`[auto-blog] Starting run${DRY_RUN ? " (DRY_RUN)" : ""}...`);
  await preflightGeminiApiKey();

  await mongoose.connect(MONGODB_URI as string);
  const db = mongoose.connection.getClient().db();
  const posts = db.collection("blogposts");
  const categories = db.collection("categories");

  // Pick the next approved backlog idea in stable order; do not invent query-volume data.
  const ideas = db.collection("topicideas");
  const topic = await ideas.findOne({ status: "approved" }, { sort: { createdAt: 1, _id: 1 } });
  if (!topic) throw new Error("No approved topic ideas remain. Seed or approve ideas in the topicideas collection.");

  const existing = await posts.find({}, { projection: { title: 1, focusKeyword: 1, tags: 1, seo: 1 } }).toArray();
  const recentTitles = existing.map((post) => String(post.title || ""));
  const existingFocusKeywords = existing.flatMap((post) => {
    const direct = typeof post.focusKeyword === "string" ? [post.focusKeyword] : [];
    const legacy = Array.isArray(post.seo?.keywords) ? post.seo.keywords.slice(0, 1) : [];
    return [...direct, ...legacy].filter((value): value is string => typeof value === "string");
  });
  const generationTopic = {
    query: String(topic.query),
    intent: String(topic.intent),
    originalAngle: String(topic.originalAngle),
    proofElement: String(topic.proofElement),
  };

  console.log(`[auto-blog] Generating from approved topic: "${generationTopic.query}"...`);
  const generated = await generatePostWithGeminiFallbackChain(
    recentTitles,
    generationTopic,
    existingFocusKeywords,
  );
  console.log(
    `[auto-blog] Generated "${generated.title}" [${generated.category}] via ${generated.modelUsed} (focus keyword: "${generated.focusKeyword}", ${countWords(generated.content)} words)`,
  );

  const baseSlug = slugify(generated.slug || generated.title);
  const slug = await ensureUniqueSlug(posts, baseSlug);

  console.log(
    `[auto-blog] Finding a cover photo on Pexels ("${generated.imageSearchQuery}")...`,
  );
  const pexelsUrl = await findCoverImageUrl(generated.imageSearchQuery);

  let coverImage = pexelsUrl;
  let coverImageFileId = "";
  let coverImageSource: "upload" | "external" = "external";

  if (UPLOAD_COVER) {
    console.log("[auto-blog] Uploading cover image to ImageKit...");
    const imageBuffer = await downloadImage(pexelsUrl);

    const imagekit = new ImageKit({
      publicKey: IMAGEKIT_PUBLIC_KEY as string,
      privateKey: IMAGEKIT_PRIVATE_KEY as string,
      urlEndpoint: IMAGEKIT_URL_ENDPOINT as string,
    });

    const upload = await imagekit.upload({
      file: imageBuffer,
      fileName: `${slug}.png`,
      folder: "/nawab-tech/blog",
      useUniqueFileName: true,
    });

    coverImage = upload.url;
    coverImageFileId = upload.fileId;
    coverImageSource = "upload";
  } else {
    console.log(
      "[auto-blog] Using the Pexels URL directly (no ImageKit upload).",
    );
  }

  console.log("[auto-blog] Ensuring category exists...");
  const category = await ensureCategory(categories, generated.category);

  const now = new Date();
  const readingTime = computeReadingTime(generated.content);
  const excerpt = generated.excerpt.slice(0, 300);

  const doc = {
    slug,
    title: generated.title,
    excerpt,
    content: generated.content,
    category: category._id,
    tags: generated.tags,
    author: {
      name: siteConfig.author.name,
      role: siteConfig.author.role,
      url: siteConfig.author.url,
    },
    focusKeyword: generated.focusKeyword,
    originalityPrompts: generated.originalityPrompts,
    originalityAnswers: ["", "", ""],
    noindex: false,
    redirectTo: "",
    coverImage,
    coverImageFileId,
    coverImageSource,
    status: (AUTO_PUBLISH ? "published" : "draft") as "published" | "draft",
    featured: false,
    readingTime,
    views: 0,
    seo: {
      title: generated.seoTitle,
      description: generated.seoDescription,
      keywords: generated.seoKeywords,
      ogImage: coverImage,
    },
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  if (DRY_RUN) {
    console.log("[auto-blog] DRY_RUN is on - not writing to MongoDB.");
    console.log(
      JSON.stringify(
        {
          modelUsed: generated.modelUsed,
          ...doc,
          content: `${doc.content.slice(0, 250)}...`,
        },
        null,
        2,
      ),
    );
  } else {
    const inserted = await posts.insertOne(doc);
    await ideas.updateOne({ _id: topic._id, status: "approved" }, { $set: { status: "drafted", postId: inserted.insertedId, updatedAt: now } });
    console.log(`[auto-blog] Saved ${AUTO_PUBLISH ? "published post" : "draft"}: /blog/${slug} (generated by ${generated.modelUsed})`);

    if (AUTO_PUBLISH && BASE_URL && REVALIDATE_SECRET) {
      try {
        const revalidateUrl = `${BASE_URL.replace(
          /\/$/,
          "",
        )}/api/revalidate?secret=${encodeURIComponent(
          REVALIDATE_SECRET,
        )}&slug=${encodeURIComponent(slug)}&category=${encodeURIComponent(
          category.slug,
        )}`;
        const res = await fetch(revalidateUrl);
        console.log(`[auto-blog] Revalidate call status: ${res.status}`);
      } catch (error) {
        console.warn("[auto-blog] Revalidate call failed (non-fatal):", error);
      }
    } else if (AUTO_PUBLISH) {
      console.warn("[auto-blog] Skipping revalidation because base URL or secret is missing.");
    }
  }

  await mongoose.disconnect();
  console.log("[auto-blog] Done.");
}

export {
  DEFAULT_GEMINI_MODEL_CHAIN,
  buildGeminiModelChain,
  classifyGeminiHttpError,
  validateAndNormalizeGeneratedPost,
  generatePostWithGeminiFallbackChain,
};

const isDirectExecution =
  typeof process.argv[1] === "string" &&
  process.argv[1].replace(/\\/g, "/").endsWith("generate-and-publish.ts");

if (isDirectExecution) {
  main().catch(async (error) => {
    console.error("[auto-blog] Failed:", error);
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
    process.exitCode = 1;
  });
}
