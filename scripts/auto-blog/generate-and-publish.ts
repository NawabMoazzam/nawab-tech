/**
 * Daily automated blog publisher.
 *
 * What this does, end to end:
 *   1. Asks Google Gemini (free tier) for a brand-new blog post: title,
 *      excerpt, full markdown content, tags, category, and a short
 *      stock-photo search phrase for the cover image.
 *   2. Asks the Pexels API (genuinely free, just needs a free API key) for
 *      a relevant, high-quality photo using that search phrase.
 *   3. Uploads the cover image to ImageKit (the same media host the admin
 *      panel already uses).
 *   4. Inserts the finished post directly into MongoDB with
 *      status: "published" - exactly the same shape the admin panel's
 *      "New Post" form creates.
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
 *   IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT
 *
 * Optional:
 *   NEXT_PUBLIC_BASE_URL / BETTER_AUTH_URL - used to call /api/revalidate
 *   BLOG_REVALIDATE_SECRET - shared secret for /api/revalidate
 *   DRY_RUN=true - do everything except writing to MongoDB (safe test run)
 *
 * Note on image providers: Pollinations.ai's old "no key needed" free image
 * endpoint was retired in favor of a paid credit system, so it is no longer
 * a reliable free option. Pexels is used instead - it is a real stock photo
 * library, free forever with just a free sign-up (no credit card), and much
 * more reliable for unattended daily automation.
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

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

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
    description: "Websites, performance, SEO, design, and digital presence.",
  },
  {
    name: "Business Websites",
    slug: "business-websites",
    description: "Guidance for small and medium businesses building a website.",
  },
  {
    name: "Custom Web Applications",
    slug: "custom-web-applications",
    description: "Purpose-built software that replaces manual workflows.",
  },
  {
    name: "Dashboard Development",
    slug: "dashboard-development",
    description: "Dashboards, internal tools, and data visibility for businesses.",
  },
  {
    name: "Automation & Integrations",
    slug: "automation-integrations",
    description: "AI automation, integrations, and workflow tooling.",
  },
] as const;

type GeneratedPost = {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  category: string;
  imageSearchQuery: string;
};

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
      lastError = new Error(`Request failed (${res.status}): ${await res.text()}`);
    } catch (error) {
      lastError = error;
    }
    if (i < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
  throw lastError;
}

async function generatePostWithGemini(
  recentTitles: string[],
): Promise<GeneratedPost> {
  const categoryNames = CATEGORIES.map((c) => c.name);

  const prompt = `You are the ghostwriter for "Nawab Tech", a web development
and digital products agency. Write ONE brand-new, original blog article for
their public blog. Audience: business owners and founders considering a
website, custom software, dashboard, or automation project.

Rules:
- Pick ONE category from this exact list: ${categoryNames.join(", ")}.
- Do NOT reuse any of these already-published titles or their exact ideas:
  ${recentTitles.length ? recentTitles.join(" | ") : "(none yet)"}
- Content must be original, practical, and specific (no vague filler).
- Write the article body in Markdown (use ## headings, short paragraphs,
  bullet lists where useful). Length: 700-1100 words.
- excerpt: 1-2 sentences, max 280 characters, no markdown.
- tags: 3-6 short lowercase tags.
- imageSearchQuery: a short (2-4 word) stock-photo search phrase in English
  for a real photo that fits this article's topic (e.g. "team laptop
  meeting", "server room technology", "designer sketching wireframes").
  Keep it generic enough that a stock photo library will have good matches.`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.9,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          title: { type: "string" },
          excerpt: { type: "string" },
          content: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          category: { type: "string", enum: categoryNames },
          imageSearchQuery: { type: "string" },
        },
        required: [
          "title",
          "excerpt",
          "content",
          "tags",
          "category",
          "imageSearchQuery",
        ],
      },
    },
  };

  const res = await fetchWithRetry(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY as string,
      },
      body: JSON.stringify(body),
    },
  );

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error(`Gemini returned no content: ${JSON.stringify(json)}`);
  }

  const parsed = JSON.parse(text) as GeneratedPost;
  return parsed;
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
    const fallbackJson = (await fallbackRes.json()) as { photos?: PexelsPhoto[] };
    const fallbackPhotos = fallbackJson.photos || [];
    if (!fallbackPhotos.length) {
      throw new Error("Pexels returned no photos, even for the fallback query.");
    }
    const pick = fallbackPhotos[Math.floor(Math.random() * fallbackPhotos.length)];
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
  const words = content.trim().split(/\s+/).filter(Boolean).length;
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

  // Give the AI a bit of context so it doesn't repeat itself day after day.
  const recent = await posts
    .find({}, { projection: { title: 1 } })
    .sort({ createdAt: -1 })
    .limit(25)
    .toArray();
  const recentTitles = recent.map((p) => String(p.title));

  console.log("[auto-blog] Asking Gemini for a new article...");
  const generated = await generatePostWithGemini(recentTitles);
  console.log(`[auto-blog] Got topic: "${generated.title}" (${generated.category})`);

  const baseSlug = slugify(generated.title);
  const slug = await ensureUniqueSlug(posts, baseSlug);

  console.log(`[auto-blog] Finding a cover photo on Pexels ("${generated.imageSearchQuery}")...`);
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
    tags: (generated.tags || []).map((t) => t.toLowerCase().trim()).slice(0, 8),
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
      title: `${generated.title} | Nawab Tech`,
      description: excerpt,
      keywords: generated.tags || [],
      ogImage: upload.url,
    },
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  if (DRY_RUN) {
    console.log("[auto-blog] DRY_RUN is on - not writing to MongoDB.");
    console.log(JSON.stringify({ ...doc, content: `${doc.content.slice(0, 200)}...` }, null, 2));
  } else {
    await posts.insertOne(doc);
    console.log(`[auto-blog] Published: /blog/${slug}`);

    if (BASE_URL && REVALIDATE_SECRET) {
      try {
        const revalidateUrl = `${BASE_URL.replace(/\/$/, "")}/api/revalidate?secret=${encodeURIComponent(
          REVALIDATE_SECRET,
        )}&slug=${encodeURIComponent(slug)}&category=${encodeURIComponent(category.slug)}`;
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

main().catch(async (error) => {
  console.error("[auto-blog] Failed:", error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exitCode = 1;
});
