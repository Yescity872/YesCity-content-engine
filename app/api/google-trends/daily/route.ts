import { NextResponse } from "next/server";
import { getDailyTopTrends } from "@/services/googleTrendsService";

export async function GET() {
  try {
    const data = await getDailyTopTrends("IN");
    
    // Safety check: Never return success: true with empty trends
    if (!data.trends || data.trends.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No trends available from any source."
      }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API DailyTrends] Error:", error);
    return NextResponse.json({
      success: false,
      message: "Google Trends unavailable right now."
    }, { status: 500 });
  }
}
