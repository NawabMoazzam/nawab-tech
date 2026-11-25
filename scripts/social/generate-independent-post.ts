import * as dotenv from "dotenv";
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import mongoose from "mongoose";
import { DEFAULT_GEMINI_MODEL_CHAIN } from "../auto-blog/generate-and-publish";
import { publishCarouselToFacebook, publishCommentToFacebook, publishPhotoToFacebook, publishReelToFacebook } from "./facebook";
import { renderCarouselSlideCard, renderSocialCard } from "../../lib/social/render";
import { SOCIAL_LAYOUTS, type CarouselSlide, type SocialLayout, type SocialLayoutPayload, type SocialThemeName } from "../../lib/social/types";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DRY_RUN = process.env.DRY_RUN === "true";
const ENABLE_REELS = process.env.ENABLE_REELS === "true";
const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || process.env.BETTER_AUTH_URL || "https://nawab-tech.vercel.app").replace(/\/$/, "");

type Format = "image" | "carousel";

type GeneratedImagePost = {
  format: "image";
  topic: string;
  hook: string;
  caption: string;
  layout: SocialLayout;
  layoutPayload: Omit<SocialLayoutPayload, "layout"> & { layout?: SocialLayout };
};

type GeneratedCarouselPost = {
  format: "carousel";
  topic: string;
  hook: string;
  caption: string;
  slides: CarouselSlide[];
};

type GeneratedPost = GeneratedImagePost | GeneratedCarouselPost;

function karachiParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
  return { year: get("year"), month: get("month"), day: get("day"), weekday: get("weekday") };
}

function pakistanDateKey(date = new Date()): string {
  const p = karachiParts(date);
  return `${p.year}-${p.month}-${p.day}`;
}

function karachiWeekday(date = new Date()): string {
  return karachiParts(date).weekday; // Mon, Tue, ...
}

function planForWeekday(weekday: string): { format: Format; allowedLayouts: SocialLayout[]; blogTakeaways: boolean } | null {
  switch (weekday) {
    case "Mon":
      return { format: "carousel", allowedLayouts: [], blogTakeaways: false };
    case "Tue":
      return { format: "image", allowedLayouts: ["opinion-quote", "checklist"], blogTakeaways: false };
    case "Wed":
      return { format: "carousel", allowedLayouts: [], blogTakeaways: true };
    case "Thu":
      return { format: "image", allowedLayouts: ["big-number", "myth-vs-reality"], blogTakeaways: false };
    case "Fri":
      return { format: "image", allowedLayouts: ["opinion-quote", "checklist"], blogTakeaways: false };
    default:
      return null; // Sat/Sun none
  }
}

async function loadFacts(): Promise<string> {
  const factsPath = path.join(process.cwd(), "content/facts.md");
  try {
    const raw = await fs.readFile(factsPath, "utf8");
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.startsWith("- ") && !l.includes("<!--") && !l.toLowerCase().includes("replace with your own"));
    return lines.length ? lines.map((l) => `  ${l}`).join("\n") : "  - (No verified facts added yet. Do not cite any numbers, clients, or results.)";
  } catch {
    return "  - (facts.md missing. Do not cite any numbers, clients, or results.)";
  }
}

async function loadFeedback(db: mongoose.mongo.Db): Promise<string> {
  const social = db.collection("socialpublishes");
  const posts = await social
    .find({ status: "published", metrics: { $exists: true } })
    .sort({ publishedAt: -1 })
    .limit(50)
    .toArray();

  const scored = posts.map((p) => {
    const m = (p.metrics || {}) as Record<string, unknown>;
    const score =
      (Number(m.reach) || 0) +
      (Number(m.impressions) || 0) * 0.2 +
      (Number(m.reactions) || 0) * 3 +
      (Number(m.comments) || 0) * 5 +
      (Number(m.shares) || 0) * 6;
    return {
      score,
      layout: String(p.layout || ""),
      format: String(p.format || p.type || ""),
      topic: String(p.topic || "").slice(0, 80),
      hook: String(p.hook || "").slice(0, 90),
      metrics: m,
    };
  }).filter((p) => p.score > 0 || p.topic);

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 5);
  const bottom = scored.slice(-5).reverse();
  const fmt = (p: (typeof scored)[number]) =>
    `  - ${p.format}/${p.layout} | hook: "${p.hook}" | topic: "${p.topic}" | metrics: ${JSON.stringify(p.metrics)}`;

  if (!top.length) return "  No performance data yet.";
  return `What worked (top):\n${top.map(fmt).join("\n")}\nWhat didn't (bottom):\n${bottom.map(fmt).join("\n")}`;
}

async function loadRecentHistory(db: mongoose.mongo.Db) {
  const social = db.collection("socialpublishes");
  const recent = await social
    .find({ status: "published" }, { projection: { layout: 1, theme: 1, topic: 1, hook: 1, type: 1, publishedAt: 1 } })
    .sort({ publishedAt: -1 })
    .limit(30)
    .toArray();
  return recent;
}

function pickTheme(recent: Array<Record<string, unknown>>): SocialThemeName {
  const lastTheme = recent[0]?.theme;
  if (lastTheme === "light") return "dark";
  if (lastTheme === "dark") return "light";
  // Default rotate by day
  return Math.floor(Date.now() / 86_400_000) % 2 === 0 ? "light" : "dark";
}

function pickLayout(allowed: SocialLayout[], recent: Array<Record<string, unknown>>): SocialLayout {
  const lastLayout = recent[0]?.layout as SocialLayout | undefined;
  const options = allowed.filter((l) => l !== lastLayout);
  const pool = options.length ? options : allowed;
  return pool[Math.floor(Date.now() / 86_400_000) % pool.length];
}

function cleanJson(text: string): string {
  return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
}

async function callGemini(systemInstruction: string, userPrompt: string, responseSchema: Record<string, unknown>): Promise<Record<string, unknown>> {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is required.");
  const models = DEFAULT_GEMINI_MODEL_CHAIN.map((m) => m.id);
  let lastError: unknown;
  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1800,
              responseMimeType: "application/json",
              responseSchema,
            },
          }),
          signal: AbortSignal.timeout(60_000),
        },
      );
      const body = (await response.json()) as {
        error?: { message?: string };
        candidates?: Array<{ finishReason?: string; content?: { parts?: Array<{ text?: string }> } }>;
      };
      if (!response.ok) {
        const msg = `${model} HTTP ${response.status}: ${body.error?.message || "unknown"}`;
        lastError = new Error(msg);
        console.warn(`[facebook-content] ${msg}`);
        continue;
      }
      const candidate = body.candidates?.[0];
      const text = candidate?.content?.parts?.map((p) => p.text || "").join("") || "";
      if (!text || (candidate?.finishReason && candidate.finishReason !== "STOP")) {
        lastError = new Error(`${model} returned incomplete response`);
        continue;
      }
      return JSON.parse(cleanJson(text));
    } catch (error) {
      lastError = error;
      console.warn(`[facebook-content] ${model} failed; trying next.`);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("All Gemini models failed");
}

function layoutSchema(layout: SocialLayout): Record<string, unknown> {
  const base: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  } = {
    type: "OBJECT",
    properties: {
      topic: { type: "STRING" },
      hook: { type: "STRING" },
      caption: { type: "STRING" },
      layout: { type: "STRING", enum: [layout] },
      eyebrow: { type: "STRING" },
    },
    required: ["topic", "hook", "caption", "layout", "eyebrow"],
  };

  switch (layout) {
    case "big-number":
      base.properties.stat = { type: "STRING" };
      base.properties.statLabel = { type: "STRING" };
      base.properties.body = { type: "STRING" };
      base.required.push("stat", "statLabel", "body");
      break;
    case "myth-vs-reality":
      base.properties.myth = { type: "STRING" };
      base.properties.reality = { type: "STRING" };
      base.required.push("myth", "reality");
      break;
    case "checklist":
      base.properties.title = { type: "STRING" };
      base.properties.items = { type: "ARRAY", items: { type: "STRING" } };
      base.required.push("title", "items");
      break;
    case "before-after":
      base.properties.beforeTitle = { type: "STRING" };
      base.properties.beforePoints = { type: "ARRAY", items: { type: "STRING" } };
      base.properties.afterTitle = { type: "STRING" };
      base.properties.afterPoints = { type: "ARRAY", items: { type: "STRING" } };
      base.required.push("beforeTitle", "beforePoints", "afterTitle", "afterPoints");
      break;
    case "opinion-quote":
      base.properties.quote = { type: "STRING" };
      base.properties.context = { type: "STRING" };
      base.required.push("quote", "context");
      break;
    case "terminal-snippet":
      base.properties.title = { type: "STRING" };
      base.properties.codeLines = { type: "ARRAY", items: { type: "STRING" } };
      base.properties.captionDetail = { type: "STRING" };
      base.required.push("title", "codeLines", "captionDetail");
      break;
  }
  return base;
}

function carouselSchema(): Record<string, unknown> {
  return {
    type: "OBJECT",
    properties: {
      topic: { type: "STRING" },
      hook: { type: "STRING" },
      caption: { type: "STRING" },
      slides: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            eyebrow: { type: "STRING" },
            title: { type: "STRING" },
            body: { type: "STRING" },
          },
          required: ["eyebrow", "title", "body"],
        },
      },
    },
    required: ["topic", "hook", "caption", "slides"],
  };
}

function buildSystemPrompt(facts: string, feedback: string): string {
  return `You are the social media strategist for Nawab Tech, a web development agency serving international founders and small-business owners (US/EU/UK). Write in plain English.

COPY RULES (strict):
- Hook in the first line (max ~90 chars), then a specific opinion or concrete example.
- Short paragraphs, 80-150 words total, plain English, no corporate buzzwords.
- End with ONE genuine, specific question. No engagement bait (no "like/tag/share if...").
- No invented statistics, clients, or results. You may ONLY cite facts from the VERIFIED FACTS block below.
- Avoid repeating recent topics and recent hooks.

VERIFIED FACTS (only source for factual claims):
${facts}

PERFORMANCE FEEDBACK:
${feedback}`;
}

async function generateImagePost(opts: {
  layout: SocialLayout;
  facts: string;
  feedback: string;
  recentTopics: string[];
  recentHooks: string[];
}): Promise<GeneratedImagePost> {
  const system = buildSystemPrompt(opts.facts, opts.feedback);
  const prompt = `Create one independent Facebook image post for Nawab Tech.
Layout: ${opts.layout}
Avoid recent topics: ${opts.recentTopics.join(" | ") || "none"}
Avoid recent hooks: ${opts.recentHooks.join(" | ") || "none"}

Return JSON matching the schema. The "caption" is the Facebook post caption (80-150 words, first line is the hook). The layout fields are for the image card. Keep image text short and punchy.`;
  const raw = await callGemini(system, prompt, layoutSchema(opts.layout));
  const layoutPayload: Record<string, unknown> = { layout: opts.layout, eyebrow: String(raw.eyebrow || "Nawab Tech") };
  if (opts.layout === "big-number") {
    layoutPayload.stat = String(raw.stat || "");
    layoutPayload.statLabel = String(raw.statLabel || "");
    layoutPayload.body = String(raw.body || "");
  } else if (opts.layout === "myth-vs-reality") {
    layoutPayload.myth = String(raw.myth || "");
    layoutPayload.reality = String(raw.reality || "");
  } else if (opts.layout === "checklist") {
    layoutPayload.title = String(raw.title || "");
    layoutPayload.items = Array.isArray(raw.items) ? raw.items.map(String).slice(0, 5) : [];
  } else if (opts.layout === "before-after") {
    layoutPayload.beforeTitle = String(raw.beforeTitle || "Before");
    layoutPayload.beforePoints = Array.isArray(raw.beforePoints) ? raw.beforePoints.map(String).slice(0, 4) : [];
    layoutPayload.afterTitle = String(raw.afterTitle || "After");
    layoutPayload.afterPoints = Array.isArray(raw.afterPoints) ? raw.afterPoints.map(String).slice(0, 4) : [];
  } else if (opts.layout === "opinion-quote") {
    layoutPayload.quote = String(raw.quote || "");
    layoutPayload.context = String(raw.context || "");
  } else if (opts.layout === "terminal-snippet") {
    layoutPayload.title = String(raw.title || "");
    layoutPayload.codeLines = Array.isArray(raw.codeLines) ? raw.codeLines.map(String).slice(0, 8) : [];
    layoutPayload.caption = String(raw.captionDetail || raw.caption || "");
  }
  return {
    format: "image",
    topic: String(raw.topic || opts.layout),
    hook: String(raw.hook || "").slice(0, 90),
    caption: String(raw.caption || "").trim(),
    layout: opts.layout,
    layoutPayload: layoutPayload as unknown as Omit<SocialLayoutPayload, "layout"> & { layout?: SocialLayout },
  };
}

async function generateCarouselPost(opts: {
  facts: string;
  feedback: string;
  recentTopics: string[];
  recentHooks: string[];
  blog?: { title: string; excerpt: string; content: string; slug: string } | null;
}): Promise<GeneratedCarouselPost> {
  const system = buildSystemPrompt(opts.facts, opts.feedback);
  const blogContext = opts.blog
    ? `Create a carousel of 4-5 takeaways from this Nawab Tech blog post. Do not write a link post; put takeaways on slides.\nBlog title: ${opts.blog.title}\nExcerpt: ${opts.blog.excerpt}\nContent (markdown, truncated): ${opts.blog.content.slice(0, 6000)}`
    : `Create an educational carousel (5-7 slides) with a clear practical point for founders/small-business owners.`;
  const prompt = `${blogContext}

Avoid recent topics: ${opts.recentTopics.join(" | ") || "none"}
Avoid recent hooks: ${opts.recentHooks.join(" | ") || "none"}

Return JSON. "caption" is the Facebook post caption (80-150 words, first line is hook, end with ONE genuine specific question; no engagement bait). "slides" should have 5-7 slides (or 4-5 for blog takeaways) each with eyebrow, title, body. First slide is the cover/hook, last slide is a practical CTA/question slide. Keep slide text short.`;
  const raw = await callGemini(system, prompt, carouselSchema());
  const slides: CarouselSlide[] = (Array.isArray(raw.slides) ? raw.slides : [])
    .slice(0, 7)
    .map((s: Record<string, unknown>, i: number, arr: unknown[]) => ({
      eyebrow: String(s.eyebrow || "Nawab Tech"),
      title: String(s.title || ""),
      body: String(s.body || ""),
      kind: i === 0 ? "cover" : i === arr.length - 1 ? "cta" : "point",
    }));
  if (slides.length < 4) throw new Error("Carousel generation returned too few slides.");
  return {
    format: "carousel",
    topic: String(raw.topic || opts.blog?.title || "Carousel"),
    hook: String(raw.hook || "").slice(0, 90),
    caption: String(raw.caption || "").trim(),
    slides,
  };
}

async function imageResponseToPng(res: Response): Promise<Buffer> {
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

async function slidesToReelMp4(pngs: Buffer[]): Promise<Buffer> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "nawab-reel-"));
  try {
    for (let i = 0; i < pngs.length; i++) {
      await fs.writeFile(path.join(dir, `slide-${String(i).padStart(2, "0")}.png`), pngs[i]);
    }
    const inputPattern = path.join(dir, "slide-%02d.png");
    const outPath = path.join(dir, "reel.mp4");
    // 3s per slide, 1080x1920 vertical canvas, centered slide.
    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-framerate",
        "1/3",
        "-i",
        inputPattern,
        "-vf",
        "scale=1080:1350:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=#100D0A,format=yuv420p",
        "-c:v",
        "libx264",
        "-r",
        "30",
        "-movflags",
        "+faststart",
        outPath,
      ],
      { stdio: "pipe" },
    );
    return await fs.readFile(outPath);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

async function renderDryRunPreviews() {
  const outDir = path.join(process.cwd(), "tmp/social-preview");
  await fs.mkdir(outDir, { recursive: true });
  const themes: SocialThemeName[] = ["light", "dark"];
  let count = 0;

  for (const layout of SOCIAL_LAYOUTS) {
    for (const theme of themes) {
      const payload = samplePayload(layout);
      const img = await renderSocialCard(payload, theme);
      const png = await imageResponseToPng(img);
      const file = path.join(outDir, `${layout}-${theme}.png`);
      await fs.writeFile(file, png);
      console.log(`[facebook-content] DRY_RUN wrote ${file}`);
      count++;
    }
  }

  // Carousel sample
  const sampleSlides: CarouselSlide[] = [
    { eyebrow: "Nawab Tech", title: "3 website fixes that usually matter more than a redesign", body: "A short carousel for founders.", kind: "cover" },
    { eyebrow: "Takeaway 1", title: "Speed first", body: "Slow pages lose trust before your copy gets read.", kind: "point" },
    { eyebrow: "Takeaway 2", title: "Clear offer", body: "Visitors should understand what you do in five seconds.", kind: "point" },
    { eyebrow: "Takeaway 3", title: "One next step", body: "Each page should guide people to one clear action.", kind: "point" },
    { eyebrow: "Question", title: "What is your site doing today?", body: "Which of these three is weakest on your current website?", kind: "cta" },
  ];
  for (const theme of themes) {
    for (let i = 0; i < sampleSlides.length; i++) {
      const img = await renderCarouselSlideCard(sampleSlides[i], theme, i, sampleSlides.length);
      const png = await imageResponseToPng(img);
      const file = path.join(outDir, `carousel-${theme}-${String(i + 1).padStart(2, "0")}.png`);
      await fs.writeFile(file, png);
      console.log(`[facebook-content] DRY_RUN wrote ${file}`);
      count++;
    }
  }

  console.log(`[facebook-content] DRY_RUN complete: ${count} preview image(s) in ${outDir}`);
}

function samplePayload(layout: SocialLayout): SocialLayoutPayload {
  switch (layout) {
    case "big-number":
      return { layout, eyebrow: "Web Performance", stat: "53%", statLabel: "of mobile visits leave after 3 seconds", body: "Speed is often the first conversion fix, not a redesign." };
    case "myth-vs-reality":
      return { layout, eyebrow: "Myth vs Reality", myth: "A new website redesign will fix low leads.", reality: "Clear offer, fast pages, and one strong CTA usually matter more." };
    case "checklist":
      return { layout, eyebrow: "Website Checklist", title: "Before you rebuild your site", items: ["Clarify the one action you want", "Check mobile speed", "Simplify your offer", "Fix broken forms"] };
    case "before-after":
      return { layout, eyebrow: "Before / After", beforeTitle: "Before", beforePoints: ["Slow load", "Unclear CTA", "Generic copy"], afterTitle: "After", afterPoints: ["Fast pages", "One clear action", "Specific offer"] };
    case "opinion-quote":
      return { layout, eyebrow: "Perspective", quote: "Most small business websites don't need more pages. They need a clearer first page.", context: "Clarity usually beats complexity when you want leads." };
    case "terminal-snippet":
      return { layout, eyebrow: "Developer Tip", title: "Measure before you optimize", codeLines: ["$ npx lighthouse https://example.com", "--only-categories=performance", "", "✓ Performance: 62 -> 91"], caption: "Start with a baseline, then fix the biggest bottleneck." };
  }
}

async function main() {
  if (DRY_RUN) {
    await renderDryRunPreviews();
    return;
  }

  if (!MONGODB_URI) throw new Error("MONGODB_URI is required.");
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is required.");
  if (!process.env.META_PAGE_ID || !process.env.META_PAGE_ACCESS_TOKEN) {
    throw new Error("META_PAGE_ID and META_PAGE_ACCESS_TOKEN secrets are required.");
  }

  const weekday = karachiWeekday();
  const plan = planForWeekday(weekday);
  if (!plan) {
    console.log(`[facebook-content] ${weekday} is a no-post day; skipping.`);
    return;
  }

  await mongoose.connect(MONGODB_URI);
  try {
    const db = mongoose.connection.getClient().db();
    const social = db.collection("socialpublishes");
    const dateKey = pakistanDateKey();
    const key = `independent:${dateKey}`;
    const existing = await social.findOne({ key });
    if (existing?.status === "published") {
      console.log(`[facebook-content] Already published for ${dateKey}; skipping.`);
      return;
    }
    if (existing?.status === "pending") {
      const createdAt = existing.createdAt instanceof Date ? existing.createdAt : new Date(existing.createdAt);
      if (Date.now() - createdAt.getTime() < 2 * 60 * 60 * 1000) {
        console.log("[facebook-content] Recent pending run exists; skipping.");
        return;
      }
      await social.deleteOne({ key, status: "pending" });
    }

    const recent = await loadRecentHistory(db);
    const recentTopics = recent.map((r) => String(r.topic || "")).filter(Boolean).slice(0, 30);
    const recentHooks = recent.map((r) => String(r.hook || "")).filter(Boolean).slice(0, 30);
    const facts = await loadFacts();
    const feedback = await loadFeedback(db);
    const theme = pickTheme(recent);

    await social.insertOne({ key, type: "independent", status: "pending", format: plan.format, createdAt: new Date() });

    try {
      let post: GeneratedPost;
      let layout: string;
      let facebookPostId = "";
      let commentId: string | undefined;
      let reelId: string | undefined;

      if (plan.format === "carousel") {
        let blog = null;
        if (plan.blogTakeaways) {
          const latestBlog = await db.collection("blogposts").findOne(
            { status: "published" },
            { sort: { publishedAt: -1, createdAt: -1 } },
          );
          if (latestBlog) {
            blog = {
              title: String(latestBlog.title || ""),
              excerpt: String(latestBlog.excerpt || ""),
              content: String(latestBlog.content || ""),
              slug: String(latestBlog.slug || ""),
            };
          }
        }
        post = await generateCarouselPost({ facts, feedback, recentTopics, recentHooks, blog });
        layout = "carousel";
        const pngs: Buffer[] = [];
        for (let i = 0; i < post.slides.length; i++) {
          const img = await renderCarouselSlideCard(post.slides[i], theme, i, post.slides.length);
          pngs.push(await imageResponseToPng(img));
        }
        let caption = post.caption;
        if (blog?.slug) {
          const url = `${BASE_URL}/blog/${encodeURIComponent(blog.slug)}`;
          caption = `${caption}\n\nRead the full article: ${url}`;
          post = { ...post, caption };
        }
        facebookPostId = await publishCarouselToFacebook({ slides: pngs, caption });
        if (blog?.slug) {
          const url = `${BASE_URL}/blog/${encodeURIComponent(blog.slug)}`;
          try {
            commentId = await publishCommentToFacebook({ postId: facebookPostId, message: `Read the full article: ${url}` });
          } catch (err) {
            console.warn(
              "[facebook-content] WARNING: Comment permission missing or comment failed; URL was included in caption as fallback.",
              err,
            );
          }
        }
      } else {
        const layoutName = pickLayout(plan.allowedLayouts, recent);
        post = await generateImagePost({ layout: layoutName, facts, feedback, recentTopics, recentHooks });
        layout = layoutName;
        const img = await renderSocialCard(post.layoutPayload as SocialLayoutPayload, theme);
        const png = await imageResponseToPng(img);
        facebookPostId = await publishPhotoToFacebook({ png, caption: post.caption });
      }

      if (ENABLE_REELS) {
        try {
          const reelPngs =
            post.format === "carousel"
              ? await Promise.all(post.slides.map((s, i) => renderCarouselSlideCard(s, theme, i, post.slides.length).then(imageResponseToPng)))
              : [await imageResponseToPng(await renderSocialCard(post.layoutPayload as SocialLayoutPayload, theme))];
          const mp4 = await slidesToReelMp4(reelPngs);
          reelId = await publishReelToFacebook({ video: mp4, description: post.caption.slice(0, 2200) });
          console.log(`[facebook-content] Published Reel ${reelId}`);
        } catch (err) {
          console.warn("[facebook-content] ENABLE_REELS is set but Reel publishing failed:", err);
        }
      }

      await social.updateOne(
        { key },
        {
          $set: {
            status: "published",
            format: post.format,
            layout,
            theme,
            topic: post.topic,
            hook: post.hook,
            caption: post.caption,
            facebookPostId,
            commentId,
            reelId,
            publishedAt: new Date(),
          },
        },
      );
      console.log(`[facebook-content] Published ${post.format} (${layout}) for ${dateKey}: ${facebookPostId}`);
    } catch (error) {
      await social.deleteOne({ key, status: "pending" });
      throw error;
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("[facebook-content] Failed:", error);
  process.exitCode = 1;
});
