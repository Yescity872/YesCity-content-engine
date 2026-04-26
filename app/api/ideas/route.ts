import { NextResponse } from "next/server";
import { connectToDatabase, isMongoDBConfigured } from "@/lib/mongodb";
import GeneratedIdea from "@/models/GeneratedIdea";
import type { ApiResponse } from "@/types";

/**
 * GET /api/ideas
 * Returns all saved idea sets from MongoDB, newest first.
 * Requires MONGODB_URI to be configured.
 */
export async function GET() {
  if (!isMongoDBConfigured()) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Database not configured. Add MONGODB_URI to your .env.local file to enable fetching saved ideas.",
        data: [],
      },
      { status: 503 }
    );
  }

  try {
    await connectToDatabase();
    const ideas = await GeneratedIdea.find({}).sort({ createdAt: -1 }).limit(20).lean();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: ideas,
    });
  } catch (error) {
    console.error("[/api/ideas GET]", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json<ApiResponse>(
      { success: false, error: `Failed to fetch ideas: ${message}`, data: [] },
      { status: 500 }
    );
  }
}
