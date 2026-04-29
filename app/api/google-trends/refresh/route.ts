import { NextResponse } from "next/server";
import { refreshDailyTrends } from "@/services/googleTrendsService";

export async function POST() {
  try {
    const data = await refreshDailyTrends("IN");
    return NextResponse.json({
      success: true,
      ...data
    });
  } catch (error: any) {
    console.error("[API RefreshTrends] Error:", error);
    return NextResponse.json({
      success: false,
      message: "Could not refresh trends."
    }, { status: 500 });
  }
}
