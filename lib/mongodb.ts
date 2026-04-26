/**
 * lib/mongodb.ts
 * MongoDB connection utility using Mongoose.
 * Implements connection caching to avoid creating multiple connections
 * during Next.js hot-reloads in development.
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI && process.env.NODE_ENV !== "development") {
  throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

/** Cached connection state to prevent multiple connections in dev */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the global object to store the cache across hot-reloads
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error(
      "MongoDB URI is not configured. Add MONGODB_URI to your .env.local file."
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export function isMongoDBConfigured(): boolean {
  return Boolean(MONGODB_URI);
}
