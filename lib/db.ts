import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

function getMongoUri() {
  if (!MONGODB_URI) {
    // During build, env may not be set - allow build to continue, but fail at runtime
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return "mongodb://localhost:27017/build-placeholder";
    }
    throw new Error("Please define the MONGODB_URI environment variable.");
  }
  return MONGODB_URI;
}

// if (MONGODB_URI.startsWith("mongodb+srv://")) {
//   throw new Error(
//     "MONGODB_URI is still using mongodb+srv://. Update to a non-SRV URI and restart Next.js."
//   );
// }

declare global {
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const cached = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = getMongoUri();
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
      })
      .then((mongoose) => {
        return mongoose;
      });
  }

  cached.conn = await cached.promise;

  return cached.conn;
}
