import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin as adminPlugin } from "better-auth/plugins";
import type { Db, MongoClient } from "mongodb";

import ResetPasswordEmail from "@/app/emails/reset-password";
import { connectDB } from "@/lib/db";
import { resend } from "@/lib/resend";

async function getMongoDB() {
  const connection = await connectDB();
  const client = connection.connection.getClient();
  return { db: client.db(), client };
}

async function sendResetPassword({
  user,
  url,
}: {
  user: { email: string; name: string };
  url: string;
  token: string;
}) {
  const from = process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL;

  if (!process.env.RESEND_API_KEY || !from) {
    throw new Error(
      "Password reset email is not configured. Set RESEND_API_KEY and FROM_EMAIL (or RESEND_FROM_EMAIL).",
    );
  }

  const { error } = await resend.emails.send({
    from,
    to: user.email,
    subject: "Reset your Nawab Tech admin password",
    react: ResetPasswordEmail({
      name: user.name,
      resetUrl: url,
    }),
  });

  if (error) {
    throw new Error(error.message || "Resend could not send the reset email.");
  }
}

let authInstance: ReturnType<typeof betterAuth> | null = null;

export async function getAuth() {
  if (authInstance) return authInstance;

  const baseURL =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000";

  // Route modules are evaluated during production builds even when runtime
  // infrastructure is unavailable. This adapter is never used for a request.
  if (
    process.env.NEXT_PHASE === "phase-production-build" &&
    !process.env.MONGODB_URI
  ) {
    const dummyDb = {
      collection: () => ({
        findOne: async () => null,
        insertOne: async () => null,
      }),
    } as unknown as Db;
    const dummyClient = {} as unknown as MongoClient;

    authInstance = betterAuth({
      database: mongodbAdapter(dummyDb, { client: dummyClient }),
      emailAndPassword: {
        enabled: true,
        disableSignUp: true,
        sendResetPassword,
      },
      secret:
        process.env.BETTER_AUTH_SECRET ||
        "build-placeholder-secret-must-be-32-chars-long",
      baseURL,
    });

    return authInstance;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI missing");
  }

  const { db, client } = await getMongoDB();

  authInstance = betterAuth({
    database: mongodbAdapter(db, { client }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      autoSignIn: true,
      minPasswordLength: 8,
      resetPasswordTokenExpiresIn: 60 * 60,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword,
    },
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL,
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
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
    plugins: [adminPlugin({})],
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

// Kept for compatibility with modules that import the configured auth type.
export const auth = {} as ReturnType<typeof betterAuth>;
