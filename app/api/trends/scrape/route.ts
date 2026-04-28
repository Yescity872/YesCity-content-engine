import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import TrendSession from "@/models/TrendSession";
import { scrapeReferencesForTopic } from "@/services/topicReferenceScraper";

export async function POST(request: Request) {
  try {
    const { sessionId, topicIds: providedTopicIds } = await request.json();
    if (!sessionId) throw new Error("sessionId is required");

    await connectToDatabase();

    // 1. Get topic IDs (from request or session lookup)
    let topicIds = providedTopicIds;
    if (!topicIds || topicIds.length === 0) {
      const session = await TrendSession.findOne({ sessionId });
      if (!session) throw new Error("Session not found");
      topicIds = session.topicIds;
    }

    console.log(`[Scrape] Starting sequential batch scrape for session ${sessionId} (${topicIds.length} topics)...`);

    // 2. Sequential Scrape
    for (const topicId of topicIds) {
      try {
        await scrapeReferencesForTopic(topicId);
        
        // Small delay between topics to be gentle on Instagram/Network
        await new Promise(r => setTimeout(r, 1000));
      } catch (err) {
        console.error(`[Scrape] Failed for topic ${topicId}:`, err);
        // Continue with next topic even if one fails
      }
    }

    console.log(`[Scrape] Completed batch scrape for session ${sessionId}.`);

    return NextResponse.json({ success: true, message: "Scrape batch completed" });

  } catch (error: any) {
    console.error("[Scrape] API Route Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
