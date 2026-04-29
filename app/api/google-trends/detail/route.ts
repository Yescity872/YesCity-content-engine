import { NextResponse } from "next/server";
import { getTrendDetails, enrichTrendWithAI } from "@/services/googleTrendsService";

export async function POST(request: Request) {
  try {
    const { keyword, country = "IN" } = await request.json();
    
    if (!keyword) {
      return NextResponse.json({ success: false, message: "Keyword is required" }, { status: 400 });
    }

    // 1. Fetch raw data
    const details = await getTrendDetails(keyword, country);
    
    // 2. Enrich with AI
    const enrichment = await enrichTrendWithAI(keyword, details);

    return NextResponse.json({
      success: true,
      ...details,
      ...enrichment
    });

  } catch (error: any) {
    console.error("[API TrendDetail] Error:", error);
    return NextResponse.json({
      success: false,
      message: "Could not fetch trend details."
    }, { status: 500 });
  }
}
