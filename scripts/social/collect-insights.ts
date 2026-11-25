import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { getPostInsights } from "./facebook";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI is required.");
  if (!process.env.META_PAGE_ID || !process.env.META_PAGE_ACCESS_TOKEN) {
    console.log("[social-insights] Missing Meta credentials; skipping.");
    return;
  }

  await mongoose.connect(MONGODB_URI);
  try {
    const db = mongoose.connection.getClient().db();
    const social = db.collection("socialpublishes");
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const posts = await social
      .find(
        {
          status: "published",
          facebookPostId: { $exists: true, $ne: "" },
          publishedAt: { $gte: cutoff },
        },
        { projection: { key: 1, facebookPostId: 1, topic: 1 } },
      )
      .sort({ publishedAt: -1 })
      .limit(100)
      .toArray();

    console.log(`[social-insights] Fetching insights for ${posts.length} post(s)...`);

    for (const post of posts) {
      const postId = String(post.facebookPostId);
      try {
        const metrics = await getPostInsights(postId);
        await social.updateOne(
          { _id: post._id },
          { $set: { metrics: { ...metrics, fetchedAt: new Date() } } },
        );
        console.log(`[social-insights] Updated ${post.key}: ${JSON.stringify(metrics)}`);
      } catch (error) {
        console.warn(
          `[social-insights] Failed for ${post.key} (${postId}):`,
          error instanceof Error ? error.message : error,
        );
      }
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("[social-insights] Failed:", error);
  process.exitCode = 1;
});
