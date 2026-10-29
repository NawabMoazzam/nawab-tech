import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { publishLinkToFacebook } from "./facebook";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI;
const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || "https://nawab-tech.vercel.app").replace(/\/$/, "");

async function main() {
  if (!process.env.META_PAGE_ID || !process.env.META_PAGE_ACCESS_TOKEN) {
    console.log("[facebook-blog] Skipping: META_PAGE_ID / META_PAGE_ACCESS_TOKEN are not configured.");
    return;
  }
  if (!MONGODB_URI) throw new Error("MONGODB_URI is required.");

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

    const key = `blog:${String(blog.slug)}`;
    const previous = await social.findOne({ key, status: "published" });
    if (previous) {
      console.log(`[facebook-blog] Blog already shared; skipping ${String(blog.slug)}.`);
      return;
    }

    const title = String(blog.title || "New article from Nawab Tech");
    const excerpt = String(blog.excerpt || "").trim();
    const link = `${BASE_URL}/blog/${encodeURIComponent(String(blog.slug))}`;
    const message = [
      `New on the Nawab Tech blog: ${title}`,
      excerpt,
      "Read the full article:",
    ].filter(Boolean).join("\n\n");

    const result = await social.updateOne(
      { key },
      { $setOnInsert: { key, type: "blog", topic: title, status: "pending", createdAt: new Date() } },
      { upsert: true },
    );
    const current = await social.findOne({ key });
    if (current?.status === "published") {
      console.log("[facebook-blog] Blog was shared by another run; skipping.");
      return;
    }

    try {
      const facebookPostId = await publishLinkToFacebook({ message, link });
      await social.updateOne(
        { key },
        { $set: { status: "published", facebookPostId, publishedAt: new Date(), link } },
      );
      console.log(`[facebook-blog] Published ${String(blog.slug)} to Facebook (post ID ${facebookPostId}).`);
    } catch (error) {
      await social.deleteOne({ key, status: "pending" });
      throw error;
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  // Blog publication already succeeded; a Facebook error must not mark the
  // core blog generation as failed or encourage rerunning it and creating a duplicate blog.
  console.error("[facebook-blog] Facebook sharing failed (blog remains published):", error);
  process.exitCode = 0;
});
