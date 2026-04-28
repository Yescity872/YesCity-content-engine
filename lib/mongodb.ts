/**
 * lib/mongodb.ts
 * MongoDB connection utility using Mongoose.
 * Implements connection caching to avoid creating multiple connections
 * during Next.js hot-reloads in development.
 */

import mongoose from "mongoose";

function getMongoUri() {
  return process.env.MONGODB_URI || "";
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

  const uri = getMongoUri();

  if (!uri) {
    throw new Error(
      "MongoDB URI is not configured. Add MONGODB_URI to your .env.local file."
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Reset promise on failure so we can retry
    throw e;
  }
  
  return cached.conn;
}

export function isMongoDBConfigured(): boolean {
  return Boolean(getMongoUri());
}
