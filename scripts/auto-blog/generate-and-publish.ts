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
 *      times out, hits quota/rate limits, or produces sub-par/incomplete output,
 *      automatically falls back to the next model in the chain.
 *   3. Queries the Pexels API for a relevant, high-quality landscape photo.
 *   4. Uploads the cover image to ImageKit.
 *   5. Inserts the finished post directly into MongoDB with
 *      status: "published".
 *   6. Pings the site's /api/revalidate endpoint so the new post shows up
 *      immediately instead of waiting for the hourly ISR refresh.
 *
 * Run locally:
 *   npx tsx scripts/auto-blog/generate-and-publish.ts
 *
 * Required environment variables (see .env.example / README):
 *   MONGODB_URI
 *   GEMINI_API_KEY
 *   PEXELS_API_KEY
 *   IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT
 *
 * Optional:
 *   GEMINI_MODEL - primary model override (prepended to the fallback chain)
 *   GEMINI_MODELS - comma-separated custom model chain (prepended to defaults)
 *   NEXT_PUBLIC_BASE_URL / BETTER_AUTH_URL - used to call /api/revalidate
 *   BLOG_REVALIDATE_SECRET - shared secret for /api/revalidate
 *   DRY_RUN=true - do everything except writing to MongoDB (safe test run)
 */

import * as dotenv from "dotenv";
import mongoose from "mongoose";
import ImageKit from "imagekit";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { slugify } from "../../lib/slugify";

const MONGODB_URI = process.env.MONGODB_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || process.env.BETTER_AUTH_URL || "";
const REVALIDATE_SECRET = process.env.BLOG_REVALIDATE_SECRET;
const DRY_RUN = process.env.DRY_RUN === "true";

type GeminiModelSpec = {
  id: string;
  label: string;
  role: string;
  temperature: number;
  maxAttempts: number;
  timeoutMs: number;
};

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
  if (!IMAGEKIT_PUBLIC_KEY) missing.push("IMAGEKIT_PUBLIC_KEY");
  if (!IMAGEKIT_PRIVATE_KEY) missing.push("IMAGEKIT_PRIVATE_KEY");
  if (!IMAGEKIT_URL_ENDPOINT) missing.push("IMAGEKIT_URL_ENDPOINT");

  if (missing.length) {
    console.error(
      `Missing required environment variable(s): ${missing.join(", ")}`,
    );
    process.exit(1);
  }
}

// Categories the site already understands (matches app/services/* and the
// contact form's service enum). The AI picks one of these per post.
const CATEGORIES = [
  {
    name: "Web Development",
    slug: "web-development",
    servicePath: "/services/web-development",
    description: "Websites, performance, SEO, design, and digital presence.",
  },
  {
    name: "Business Websites",
    slug: "business-websites",
    servicePath: "/services/web-development",
    description: "Guidance for small and medium businesses building a website.",
  },
  {
    name: "Custom Web Applications",
    slug: "custom-web-applications",
    servicePath: "/services/custom-web-applications",
    description: "Purpose-built software that replaces manual workflows.",
  },
  {
    name: "Dashboard Development",
    slug: "dashboard-development",
    servicePath: "/services/dashboard-development",
    description:
      "Dashboards, internal tools, and data visibility for businesses.",
  },
  {
    name: "Automation & Integrations",
    slug: "automation-integrations",
    servicePath: "/services/automation-integrations",
    description: "AI automation, integrations, and workflow tooling.",
  },
] as const;

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
  modelUsed: string;
};

class FatalGeminiAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FatalGeminiAuthError";
  }
}

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

  const normalizedTitleLower = title.toLowerCase();
  if (
    recentTitles.some(
      (recent) => recent.trim().toLowerCase() === normalizedTitleLower,
    )
  ) {
    throw new Error(`Generated title duplicates a recent post: "${title}".`);
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

  const wordCount = countWords(content);
  if (wordCount < 550) {
    throw new Error(
      `Article content is too short (${wordCount} words). Minimum required is 550 words for SEO depth.`,
    );
  }

  const h2Matches = content.match(/^##\s+.+/gm) || [];
  if (h2Matches.length < 3) {
    throw new Error(
      `Article content has only ${h2Matches.length} H2 (##) headings. At least 3 are required for SEO structure.`,
    );
  }

  const categoryName =
    typeof raw.category === "string" ? raw.category.trim() : "";
  const matchedCategory =
    CATEGORIES.find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
    ) || CATEGORIES[0];

  // Ensure the article contains at least one internal link to Nawab Tech's
  // core service/contact pages for internal link equity and conversion.
  const hasInternalLink =
    /\]\((\/(services|contact|about|faq|blog)[^\s)]*)\)/i.test(content);
  if (!hasInternalLink) {
    content = `${content}\n\n---\n\nReady to put these ideas into practice? Explore our [${matchedCategory.name} services](${matchedCategory.servicePath}) or [get in touch with Nawab Tech](/contact) to discuss your project.`;
  }

  const focusKeyword =
    typeof raw.focusKeyword === "string" && raw.focusKeyword.trim().length >= 3
      ? raw.focusKeyword.trim().toLowerCase()
      : matchedCategory.name.toLowerCase();

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
    modelUsed: modelId,
  };
}

function buildSeoPrompt(
  recentTitles: string[],
  suggestedCategoryName: string,
): {
  systemInstruction: string;
  userPrompt: string;
  responseSchema: Record<string, unknown>;
} {
  const categoryNames = CATEGORIES.map((c) => c.name);

  const systemInstruction = `You are the Principal Technical Content Strategist and Ghostwriter for "Nawab Tech" (https://nawabtech.com), a premier software engineering agency specializing in high-performing business websites, custom web applications, executive dashboards, and AI/workflow automation.

Your job is to write authoritative, deeply practical, conversion-aware, and search-engine-optimized (SEO) articles for founders, CTOs, operations leaders, and business owners.`;

  const userPrompt = `Write ONE brand-new, original, high-ranking blog article for the Nawab Tech Insights blog.

### 1. Topic & Category Selection
- Available categories: ${categoryNames.join(", ")}.
- Preferred category for today's rotation (unless you have an exceptional high-intent angle in another category): "${suggestedCategoryName}".
- Do NOT reuse or closely paraphrase any of these recently published titles:
  ${recentTitles.length ? recentTitles.map((t) => `• ${t}`).join("\n  ") : "• (none yet)"}
- Choose a high-intent commercial or informational topic that real decision-makers search for on Google (e.g., build-vs-buy trade-offs, cost & ROI breakdowns, architecture pitfalls, operational bottlenecks solved by custom web apps/dashboards/automation, performance & Core Web Vitals impact on revenue).

### 2. On-Page SEO & E-E-A-T Best Practices
- **Focus Keyword**: Identify a primary long-tail search query (3-5 words) with clear business intent.
- **Title (H1)**: Compelling, specific, human-first headline (50-75 characters ideal) that naturally incorporates the primary keyword or core concept.
- **SEO Title (meta title)**: 45-60 characters, front-loading the focus keyword for search results. Do NOT append "| Nawab Tech" (the site template appends it automatically).
- **SEO Description (meta description)**: 135-158 characters. Include the focus keyword, a concrete value proposition, and an implicit call-to-action to maximize organic click-through rate (CTR).
- **Slug**: Short, keyword-rich URL slug (4-7 lowercase words separated by hyphens, avoiding unnecessary filler stop words).
- **Heading Hierarchy**:
  - Do NOT start \`content\` with a \`# Title\` H1 heading (the page template already renders the H1).
  - Structure the body with clear, keyword-informed \`## \` (H2) section headings and \`### \` (H3) subheadings.
- **Content Depth & Formatting (850-1250 words)**:
  - Open with a sharp hook addressing the reader's exact business pain point and previewing the actionable outcome within the first 100 words.
  - Provide concrete numbers, realistic implementation ranges, architectural comparisons, checklists, or step-by-step frameworks—never generic AI fluff.
  - Use short paragraphs (2-4 sentences), bulleted/numbered lists, bold key takeaways, and a comparison table or structured checklist where helpful.
  - Include a concise **"Frequently Asked Questions"** section (\`## Frequently Asked Questions\`) near the end with 3 specific Q&As (\`### Question?\`) targeting "People Also Ask" long-tail queries.
- **Internal Linking (Required)**:
  - Naturally weave 2-3 contextual Markdown links into the body pointing to Nawab Tech's real pages using relative paths:
    - \`/services/web-development\` (Web Development & Business Websites)
    - \`/services/custom-web-applications\` (Custom Web Applications)
    - \`/services/dashboard-development\` (Dashboard Development & Internal Tools)
    - \`/services/automation-integrations\` (AI Automation & API Integrations)
    - \`/services\` (All Services)
    - \`/contact\` (Start a Project / Consultation)
- **Cover Image Search Query**:
  - Provide a 2-4 word English stock-photo search phrase for Pexels (e.g., "software team analytics dashboard", "modern office developer laptop").`;

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
    return {
      retrySameModel: false,
      error: new FatalGeminiAuthError(
        `[${modelId}] Authentication failed (401). Check GEMINI_API_KEY: ${summary}`,
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
    signal: AbortSignal.timeout(model.timeoutMs),
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

  return validateAndNormalizeGeneratedPost(parsed, recentTitles, model.id);
}

/**
 * Executes the Gemini fallback chain in capability sequence until a model
 * successfully generates and validates the complete SEO blog post.
 */
async function generatePostWithGeminiFallbackChain(
  recentTitles: string[],
  suggestedCategoryName: string,
): Promise<GeneratedPost> {
  const chain = buildGeminiModelChain();
  const promptPayload = buildSeoPrompt(recentTitles, suggestedCategoryName);
  const failures: Array<{ model: string; error: string }> = [];

  console.log(
    `[auto-blog] Gemini fallback chain (${chain.length} models): ${chain
      .map((m) => m.id)
      .join(" -> ")}`,
  );

  for (let modelIndex = 0; modelIndex < chain.length; modelIndex++) {
    const model = chain[modelIndex];

    for (let attempt = 1; attempt <= model.maxAttempts; attempt++) {
      try {
        console.log(
          `[auto-blog] [${modelIndex + 1}/${chain.length}] Trying ${model.label} (${model.id}) — attempt ${attempt}/${model.maxAttempts} [${model.role}]...`,
        );

        const result = await callGeminiModelOnce(
          model,
          promptPayload,
          recentTitles,
        );

        console.log(
          `[auto-blog] Success with ${model.label} (${model.id}) on attempt ${attempt}!`,
        );
        return result;
      } catch (error) {
        if (error instanceof FatalGeminiAuthError) {
          throw error;
        }

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
  throw new Error(
    `All ${chain.length} Gemini models in the fallback chain failed to generate a valid blog post:\n${failureReport}`,
  );
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

  await mongoose.connect(MONGODB_URI as string);
  const db = mongoose.connection.getClient().db();
  const posts = db.collection("blogposts");
  const categories = db.collection("categories");

  // Give the AI context on recent titles so it doesn't repeat topics day after day.
  const recent = await posts
    .find({}, { projection: { title: 1 } })
    .sort({ createdAt: -1 })
    .limit(30)
    .toArray();
  const recentTitles = recent.map((p) => String(p.title));

  // Rotate suggested category daily across the 5 service pillars for balanced topical authority.
  const dayIndex = Math.floor(Date.now() / 86_400_000) % CATEGORIES.length;
  const suggestedCategoryName = CATEGORIES[dayIndex].name;

  console.log(
    `[auto-blog] Requesting new SEO article (suggested category: "${suggestedCategoryName}")...`,
  );
  const generated = await generatePostWithGeminiFallbackChain(
    recentTitles,
    suggestedCategoryName,
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
  const imageBuffer = await downloadImage(pexelsUrl);

  console.log("[auto-blog] Uploading cover image to ImageKit...");
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
      name: "Nawab Tech",
      role: "Web Development & Digital Products",
    },
    coverImage: upload.url,
    coverImageFileId: upload.fileId,
    status: "published" as const,
    featured: false,
    readingTime,
    views: 0,
    seo: {
      title: generated.seoTitle,
      description: generated.seoDescription,
      keywords: generated.seoKeywords,
      ogImage: upload.url,
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
          focusKeyword: generated.focusKeyword,
          ...doc,
          content: `${doc.content.slice(0, 250)}...`,
        },
        null,
        2,
      ),
    );
  } else {
    await posts.insertOne(doc);
    console.log(
      `[auto-blog] Published: /blog/${slug} (generated by ${generated.modelUsed})`,
    );

    if (BASE_URL && REVALIDATE_SECRET) {
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
    } else {
      console.log(
        "[auto-blog] Skipping revalidate call (BASE_URL / BLOG_REVALIDATE_SECRET not set). The page will still update via ISR within an hour.",
      );
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
