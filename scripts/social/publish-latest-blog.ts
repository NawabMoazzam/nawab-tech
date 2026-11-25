import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { DEFAULT_GEMINI_MODEL_CHAIN } from "../auto-blog/generate-and-publish";
import { publishCarouselToFacebook, publishCommentToFacebook } from "./facebook";
import { renderCarouselSlideCard } from "../../lib/social/render";
import type { CarouselSlide, SocialThemeName } from "../../lib/social/types";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || process.env.BETTER_AUTH_URL || "https://nawab-tech.vercel.app").replace(/\/$/, "");

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
              maxOutputTokens: 1600,
              responseMimeType: "application/json",
              responseSchema,
            },
          }),
          signal: AbortSignal.timeout(60_000),
        },
      );
      const body = (await response.json()) as {
        error?: { message?: string };
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      if (!response.ok) {
        lastError = new Error(`${model} HTTP ${response.status}: ${body.error?.message || "unknown"}`);
        continue;
      }
      const text = body.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
      if (!text) { lastError = new Error(`${model} returned empty response`); continue; }
      return JSON.parse(cleanJson(text));
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("All Gemini models failed");
}

function pickTheme(): SocialThemeName {
  return Math.floor(Date.now() / 86_400_000) % 2 === 0 ? "light" : "dark";
}

async function imageResponseToPng(res: Response): Promise<Buffer> {
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI is required.");
  if (!process.env.META_PAGE_ID || !process.env.META_PAGE_ACCESS_TOKEN) {
    console.log("[facebook-blog] Skipping: META_PAGE_ID / META_PAGE_ACCESS_TOKEN are not configured.");
    return;
  }

  await mongoose.connect(MONGODB_URI);
  try {
    const db = mongoose.connection.getClient().db();
    const posts = db.collection("blogposts");
    const social = db.collection("socialpublishes");
    const cutoff = new Date(Date.now() - 36 * 60 * 60 * 1000);
    const blog = await posts.findOne(
      { status: "published", publishedAt: { $gte: cutoff } },
      { sort: { publishedAt: -1 } },
    );

    if (!blog) {
      console.log("[facebook-blog] No recently published blog post found; nothing to share.");
      return;
    }

    const slug = String(blog.slug || "");
    const title = String(blog.title || "New article from Nawab Tech");
    const excerpt = String(blog.excerpt || "").trim();
    const content = String(blog.content || "");
    const url = `${BASE_URL}/blog/${encodeURIComponent(slug)}`;
    const key = `blog:${slug}`;

    const previous = await social.findOne({ key, status: "published" });
    if (previous) {
      console.log(`[facebook-blog] Blog already shared; skipping ${slug}.`);
      return;
    }

    const current = await social.findOne({ key });
    if (current?.status === "pending") {
      const createdAt = current.createdAt instanceof Date ? current.createdAt : new Date(current.createdAt);
      if (Date.now() - createdAt.getTime() < 2 * 60 * 60 * 1000) {
        console.log("[facebook-blog] Recent pending share exists; skipping.");
        return;
      }
      await social.deleteOne({ key, status: "pending" });
    }

    await social.updateOne(
      { key },
      { $setOnInsert: { key, type: "blog-share", status: "pending", topic: title, createdAt: new Date() } },
      { upsert: true },
    );

    try {
      const system = `You are the social media strategist for Nawab Tech. Write in plain English for international founders and small-business owners (US/EU/UK).
Rules: Hook in first line (max ~90 chars). Short paragraphs, 80-150 words. End with ONE genuine, specific question. No engagement bait. No invented statistics, clients, or results. Plain English, no corporate buzzwords.`;
      const prompt = `Create a Facebook carousel (4-5 slides) of takeaways from this Nawab Tech blog post. Do NOT make it a link post. The blog URL will be posted as the first comment.
Blog title: ${title}
Excerpt: ${excerpt}
Content (markdown, truncated): ${content.slice(0, 6000)}

Return JSON with: topic, hook, caption (80-150 words, first line is hook, ends with ONE genuine specific question), slides (4-5 items, each with eyebrow,title,body). First slide is cover, last is a practical closing/question slide. Keep slide text short.`;
      const schema = {
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

      const generated = await callGemini(system, prompt, schema);
      const slides: CarouselSlide[] = (Array.isArray(generated.slides) ? generated.slides : [])
        .slice(0, 5)
        .map((s: Record<string, unknown>, i: number, arr: unknown[]) => ({
          eyebrow: String(s.eyebrow || "Nawab Tech"),
          title: String(s.title || ""),
          body: String(s.body || ""),
          kind: i === 0 ? "cover" : i === arr.length - 1 ? "cta" : "point",
        }));
      if (slides.length < 4) throw new Error("Generated too few carousel slides for blog share.");

      const captionBase = String(generated.caption || "").trim();
      // Primary: URL in first comment. Fallback: URL also included at end of caption for safety.
      const caption = `${captionBase}\n\nRead the full article: ${url}`;

      const theme = pickTheme();
      const pngs: Buffer[] = [];
      for (let i = 0; i < slides.length; i++) {
        const img = await renderCarouselSlideCard(slides[i], theme, i, slides.length);
        pngs.push(await imageResponseToPng(img));
      }

      const facebookPostId = await publishCarouselToFacebook({ slides: pngs, caption });

      let commentId: string | undefined;
      let usedCaptionFallback = false;
      try {
        commentId = await publishCommentToFacebook({ postId: facebookPostId, message: `Read the full article: ${url}` });
      } catch (err) {
        usedCaptionFallback = true;
        console.warn(
          "[facebook-blog] WARNING: Comment permission missing or comment failed; URL included in caption as fallback. Error:",
          err instanceof Error ? err.message : err,
        );
      }

      await social.updateOne(
        { key },
        {
          $set: {
            status: "published",
            type: "blog-share",
            format: "carousel",
            layout: "carousel",
            theme,
            topic: String(generated.topic || title),
            hook: String(generated.hook || "").slice(0, 90),
            caption,
            facebookPostId,
            commentId,
            link: url,
            blogSlug: slug,
            usedCaptionFallback,
            publishedAt: new Date(),
          },
        },
      );
      console.log(`[facebook-blog] Shared ${slug} as carousel (post ID ${facebookPostId}).`);
    } catch (error) {
      await social.deleteOne({ key, status: "pending" });
      throw error;
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("[facebook-blog] Facebook sharing failed (blog remains published):", error);
  process.exitCode = 0;
});
