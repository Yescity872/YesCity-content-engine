import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { discoverSpecificTopic } from "@/services/trendTopicService";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ success: false, error: "Query is required" }, { status: 400 });
    }

    console.log(`[DiscoveryAPI] Running auto-discovery for: ${query}`);
    
    // Use the specific discovery service to create/fetch the topic record
    const topics = await discoverSpecificTopic(query);

    return NextResponse.json({ 
      success: true, 
      topics,
      source: "live_discovery"
    });

  } catch (error: any) {
    console.error("[DiscoveryAPI] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
