import { NextResponse } from "next/server";
import * as GoogleTrendsService from "@/services/googleTrendsService";

export async function POST() {
  try {
    const data = await GoogleTrendsService.refreshDailyTrends("IN");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API RefreshTrends] Error:", error);
    return NextResponse.json({
      success: false,
      message: "Could not refresh trends."
    }, { status: 500 });
  }
}
