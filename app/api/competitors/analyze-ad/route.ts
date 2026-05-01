import { NextResponse } from "next/server";
import { analyzeAdObservation } from "@/services/competitorInsightService";

export async function POST(request: Request) {
  try {
    const { adContent } = await request.json();
    if (!adContent) {
      return NextResponse.json({ success: false, error: "No content provided" }, { status: 400 });
    }

    const analysis = await analyzeAdObservation(adContent);
    return NextResponse.json({ success: true, data: analysis });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
