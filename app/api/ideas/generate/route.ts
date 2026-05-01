import { NextRequest, NextResponse } from "next/server";
import { generateQuickIdeas, QuickIdeaInput } from "@/services/quickIdeaService";

/**
 * POST /api/ideas/generate
 * Upgraded Quick Idea Generator (Phase 5).
 * Generates 10 structured production packages.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.topic || !body.platform) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: topic, platform" },
        { status: 400 }
      );
    }

    const input: QuickIdeaInput = {
      topic: body.topic,
      platform: body.platform,
      audience: body.targetAudience || body.audience || "General",
      tone: body.tone || "Creative",
      cityOrRegion: body.cityOrRegion || "India",
      objective: body.objective || "Engagement"
    };

    const data = await generateQuickIdeas(input);

    if (!data) {
      throw new Error("AI generation failed");
    }

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error: any) {
    console.error("[/api/ideas/generate]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate ideas" },
      { status: 500 }
    );
  }
}
