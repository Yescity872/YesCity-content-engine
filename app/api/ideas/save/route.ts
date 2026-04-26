import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, isMongoDBConfigured } from "@/lib/mongodb";
import GeneratedIdea from "@/models/GeneratedIdea";
import type { ApiResponse, GeneratedIdea as GeneratedIdeaType } from "@/types";

/**
 * POST /api/ideas/save
 * Saves generated ideas to MongoDB.
 * Requires MONGODB_URI to be configured.
 */
export async function POST(request: NextRequest) {
  if (!isMongoDBConfigured()) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Database not configured. Add MONGODB_URI to your .env.local file to enable saving.",
      },
      { status: 503 }
    );
  }

  try {
    await connectToDatabase();
    const body: GeneratedIdeaType = await request.json();

    if (!body.inputTopic || !body.platform || !body.ideas || body.ideas.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Missing required fields: inputTopic, platform, ideas" },
        { status: 400 }
      );
    }

    const saved = await GeneratedIdea.create({
      inputTopic: body.inputTopic,
      platform: body.platform,
      tone: body.tone,
      targetAudience: body.targetAudience,
      ideas: body.ideas,
      generationSource: body.generationSource || "Rule-based",
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: saved.toObject(),
      message: "Ideas saved successfully!",
    });
  } catch (error) {
    console.error("[/api/ideas/save]", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json<ApiResponse>(
      { success: false, error: `Failed to save ideas: ${message}` },
      { status: 500 }
    );
  }
}
