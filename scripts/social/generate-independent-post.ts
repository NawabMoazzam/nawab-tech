import * as dotenv from "dotenv";
import mongoose from "mongoose";
import {
  DEFAULT_GEMINI_MODEL_CHAIN,
} from "../auto-blog/generate-and-publish";
import {
  createSocialCardSvg,
  publishPngToFacebook,
  renderSvgToPng,
} from "./facebook";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

type SocialPost = {
  category: string;
  topic: string;
  caption: string;
  imageHeadline: string;
  imageSubtitle: string;
};

const CATEGORIES = [
  "Educational web development tip",
  "Business problem and practical solution",
  "Custom web application use case",
  "AI automation and integration idea",
  "Website performance or SEO lesson",
  "Myth versus reality about business technology",
  "Soft service promotion",
];

function pakistanDateKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function parseJson(text: string): SocialPost {
  const cleaned = text.trim().replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`$/, "");
  const parsed = JSON.parse(cleaned) as Partial<SocialPost>;
  const post = {
    category: String(parsed.category || "").trim(),
    topic: String(parsed.topic || "").trim(),
    caption: String(parsed.caption || "").trim(),
    imageHeadline: String(parsed.imageHeadline || "").trim(),
    imageSubtitle: String(parsed.imageSubtitle || "").trim(),
  };
  if (
    !post.category ||
    post.topic.length < 8 ||
    post.caption.length < 80 ||
    post.caption.length > 1800 ||
    post.imageHeadline.length < 8 ||
    post.imageHeadline.length > 90 ||
    post.imageSubtitle.length < 12
  ) {
    throw new Error("Gemini returned incomplete or out-of-range Facebook post fields.");
  }
  return post;
}

async function generatePost(recentTopics: string[], category: string): Promise<SocialPost> {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is required.");
  const systemInstruction = `You are the social content strategist for Nawab Tech (https://nawab-tech.vercel.app), a small software agency offering business websites, custom web applications, dashboards, and AI automation/integrations. Write original, useful English Facebook content for small-business owners and founders. Do not write a blog article or merely announce a blog. Never invent clients, testimonials, project results, statistics, or features. Avoid generic motivational quotes, exaggerated promises, and spammy engagement bait. Provide one practical idea, a natural CTA, and a short headline/subtitle for a clean branded graphic. Keep the caption around 100-180 words, use short paragraphs, and include the website URL only when it naturally fits. Return JSON only.`;

  const userPrompt = `Create one fresh independent Facebook post for today's category: "${category}". Avoid these recent topics: ${recentTopics.length ? recentTopics.join(" | ") : "No previous topics recorded."}. The post should be useful on its own and not depend on a new blog article. Return exactly this JSON shape: {"category":"short category","topic":"specific topic","caption":"complete English Facebook caption","imageHeadline":"short graphic headline","imageSubtitle":"one concise supporting sentence"}.`;

  const schema = {
    type: "OBJECT",
    properties: {
      category: { type: "STRING" },
      topic: { type: "STRING" },
      caption: { type: "STRING" },
      imageHeadline: { type: "STRING" },
      imageSubtitle: { type: "STRING" },
    },
    required: ["category", "topic", "caption", "imageHeadline", "imageSubtitle"],
  };

  const models = DEFAULT_GEMINI_MODEL_CHAIN.map((model) => model.id);
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
              temperature: 0.8,
              maxOutputTokens: 1200,
              responseMimeType: "application/json",
              responseSchema: schema,
            },
          }),
          signal: AbortSignal.timeout(45_000),
        },
      );
      const body = (await response.json()) as {
        candidates?: Array<{ finishReason?: string; content?: { parts?: Array<{ text?: string }> } }>;
        error?: { message?: string };
      };
      if (!response.ok) {
        lastError = new Error(`${model} returned HTTP ${response.status}: ${body.error?.message || "unknown error"}`);
        console.warn(
          "[facebook-content] Model fallback:",
          lastError instanceof Error ? lastError.message : String(lastError),
        );
        continue;
      }
      const candidate = body.candidates?.[0];
      const text = candidate?.content?.parts?.map((part) => part.text || "").join("") || "";
      if (!text || (candidate?.finishReason && candidate.finishReason !== "STOP")) {
        lastError = new Error(`${model} returned no complete JSON response.`);
        continue;
      }
      const generated = parseJson(text);
      if (recentTopics.some((topic) => topic.toLowerCase() === generated.topic.toLowerCase())) {
        lastError = new Error(`Generated topic duplicates recent content: ${generated.topic}`);
        continue;
      }
      console.log(`[facebook-content] Generated "${generated.topic}" using ${model}.`);
      return generated;
    } catch (error) {
      lastError = error;
      console.warn(`[facebook-content] ${model} failed; trying next model.`);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("All Gemini models failed to generate Facebook content.");
}

async function main() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI is required.");
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is required.");
  if (!process.env.META_PAGE_ID || !process.env.META_PAGE_ACCESS_TOKEN) {
    throw new Error("META_PAGE_ID and META_PAGE_ACCESS_TOKEN GitHub Actions secrets are required.");
  }

  await mongoose.connect(MONGODB_URI);
  try {
    const db = mongoose.connection.getClient().db();
    const history = db.collection("socialpublishes");
    const dateKey = pakistanDateKey();
    const key = `independent:${dateKey}`;
    const existing = await history.findOne({ key });
    if (existing?.status === "published") {
      console.log(`[facebook-content] Already published independent content for ${dateKey}; skipping.`);
      return;
    }
    if (existing?.status === "pending") {
      const createdAt = existing.createdAt instanceof Date ? existing.createdAt : new Date(existing.createdAt);
      if (Date.now() - createdAt.getTime() < 2 * 60 * 60 * 1000) {
        console.log("[facebook-content] A recent run is already pending; skipping to avoid duplicates.");
        return;
      }
      await history.deleteOne({ key, status: "pending" });
    }

    const recent = await history.find(
      { type: "independent", status: "published" },
      { projection: { topic: 1 } },
    ).sort({ publishedAt: -1 }).limit(30).toArray();
    const recentTopics = recent.map((item) => String(item.topic || "")).filter(Boolean);
    const dayNumber = Math.floor(Date.now() / 86_400_000);
    const category = CATEGORIES[dayNumber % CATEGORIES.length];

    await history.insertOne({
      key,
      type: "independent",
      status: "pending",
      createdAt: new Date(),
    });

    try {
      const post = await generatePost(recentTopics, category);
      const svg = createSocialCardSvg({
        headline: post.imageHeadline,
        subtitle: post.imageSubtitle,
        category: post.category || category,
      });
      const png = renderSvgToPng(svg);
      const facebookPostId = await publishPngToFacebook({ png, caption: post.caption });
      await history.updateOne(
        { key },
        {
          $set: {
            type: "independent",
            status: "published",
            topic: post.topic,
            category: post.category,
            caption: post.caption,
            facebookPostId,
            publishedAt: new Date(),
          },
        },
      );
      console.log(`[facebook-content] Published "${post.topic}" to Facebook (post ID ${facebookPostId}).`);
    } catch (error) {
      await history.deleteOne({ key, status: "pending" });
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
