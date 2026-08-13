import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin as adminPlugin } from "better-auth/plugins";
import mongoose from "mongoose";
import { connectDB } from "./db";

// Lazy get MongoDB raw db + client instance from existing mongoose cache
async function getMongoDB() {
  const conn = await connectDB();
  const client = conn.connection.getClient();
  const db = client.db(); // uses default DB from URI
  return { db, client };
}

// We need to create auth lazily because connectDB is async
let authInstance: ReturnType<typeof betterAuth> | null = null;

export async function getAuth() {
  if (authInstance) return authInstance;

  // During build without DB, return a mock that won't be used at runtime
  // Next.js still tries to collect page data for API routes
  if (process.env.NEXT_PHASE === "phase-production-build" && !process.env.MONGODB_URI) {
    console.warn("Build phase without MONGODB_URI - returning placeholder auth");
    // Return minimal object that satisfies toNextJsHandler in build? 
    // Actually toNextJsHandler needs real auth, but build collection for /api routes should not happen if dynamic=force-dynamic
    // So we throw to skip? Let's create dummy adapter that won't connect
    const dummyDb = { collection: () => ({ findOne: async () => null, insertOne: async () => null }) } as any;
    const dummyClient = {} as any;
    authInstance = betterAuth({
      database: mongodbAdapter(dummyDb, { client: dummyClient }),
      emailAndPassword: { enabled: true },
      secret: process.env.BETTER_AUTH_SECRET || "build-placeholder-secret-must-be-32-chars-long",
      baseURL: "http://localhost:3000",
    });
    return authInstance;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI missing");
  }

  const { db, client } = await getMongoDB();

  authInstance = betterAuth({
    database: mongodbAdapter(db, {
      client,
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.NEXT_PUBLIC_BASE_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000",
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
    advanced: {
      defaultCookieAttributes: {
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
      },
    },
    trustedOrigins: [
      process.env.NEXT_PUBLIC_BASE_URL,
      process.env.BETTER_AUTH_URL,
      "http://localhost:3000",
      "http://localhost:3001",
    ].filter(Boolean) as string[],
    plugins: [
      adminPlugin({}),
    ],
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "user",
          input: false,
        },
      },
    },
  });

  return authInstance;
}

// Placeholder export for backwards compat - use getAuth() instead
export const auth = {} as ReturnType<typeof betterAuth>;
