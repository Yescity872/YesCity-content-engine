import { NextRequest, NextResponse } from "next/server";
import { getCompetitorInsights } from "@/services/competitorInsightService";

/**
 * GET /api/competitors
 * Returns competitor insights for the region.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region") || "IN";
    const forceRefresh = searchParams.get("forceRefresh") === "true";

    const insights = await getCompetitorInsights(region, forceRefresh);

    return NextResponse.json({
      success: true,
      data: insights
    });
  } catch (error: any) {
    console.error("[/api/competitors]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch competitor insights" },
      { status: 500 }
    );
  }
}
