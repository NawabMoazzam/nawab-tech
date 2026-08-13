/**
 * Seed script to make first user admin
 * Usage: npx tsx scripts/seed-admin.ts your-email@example.com
 * 
 * This sets role = "admin" for your user in Better Auth's user collection.
 * Better Auth stores users in "user" collection (default).
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI;
const email = process.argv[2];

if (!MONGODB_URI) {
  console.error("MONGODB_URI missing in .env");
  process.exit(1);
}

if (!email) {
  console.error("Usage: npx tsx scripts/seed-admin.ts your-email@example.com");
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGODB_URI!);
  const db = mongoose.connection.getClient().db();
  
  const result = await db.collection("user").findOneAndUpdate(
    { email: email.toLowerCase() },
    { $set: { role: "admin" } },
    { returnDocument: "after" }
  );

  if (!result) {
    console.error(`User with email ${email} not found in 'user' collection. Did you sign up at /admin/login first?`);
  } else {
    console.log(`✅ User ${email} is now admin:`, result);
  }

  await mongoose.disconnect();
}

main().catch(console.error);
