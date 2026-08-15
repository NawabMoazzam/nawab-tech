/**
 * Convert legacy embedded BlogPost.category objects to Category references.
 *
 * Usage: npm run migrate:categories
 *
 * The migration is idempotent: categories are upserted by slug and only posts
 * that still contain an embedded category object are changed.
 */

import * as dotenv from "dotenv";
import mongoose from "mongoose";

import { slugify } from "../lib/slugify";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI is missing from the environment.");
  process.exit(1);
}

async function migrate() {
  await mongoose.connect(uri!);
  const db = mongoose.connection.db;

  if (!db) throw new Error("MongoDB connection was not initialised.");

  const posts = db.collection("blogposts");
  const categories = db.collection("categories");
  const legacyPosts = await posts
    .find({ "category.name": { $type: "string" } })
    .toArray();

  let migrated = 0;
  let skipped = 0;

  for (const post of legacyPosts) {
    const legacyCategory = post.category as {
      name?: unknown;
      slug?: unknown;
      description?: unknown;
    };
    const name =
      typeof legacyCategory.name === "string"
        ? legacyCategory.name.trim()
        : "";
    const slug = slugify(
      typeof legacyCategory.slug === "string" ? legacyCategory.slug : name,
    );
    const description =
      typeof legacyCategory.description === "string"
        ? legacyCategory.description.trim()
        : "";

    if (!name || !slug) {
      console.warn(`Skipping post ${post._id}: invalid legacy category.`);
      skipped += 1;
      continue;
    }

    const now = new Date();
    const result = await categories.findOneAndUpdate(
      { slug },
      {
        $setOnInsert: {
          name,
          slug,
          description,
          createdAt: now,
        },
        $set: { updatedAt: now },
      },
      { upsert: true, returnDocument: "after" },
    );

    if (!result) {
      console.warn(`Skipping post ${post._id}: category upsert failed.`);
      skipped += 1;
      continue;
    }

    await posts.updateOne(
      { _id: post._id },
      { $set: { category: result._id, updatedAt: now } },
    );
    migrated += 1;
  }

  await categories.createIndex({ slug: 1 }, { unique: true });
  await categories.createIndex({ name: 1 }, { unique: true });
  await posts.createIndex({ category: 1 });

  console.log(
    `Category migration complete: ${migrated} migrated, ${skipped} skipped.`,
  );
}

migrate()
  .catch((error) => {
    console.error("Category migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
