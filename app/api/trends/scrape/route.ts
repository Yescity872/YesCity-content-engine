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

    // 2. Sequential Scrape (Limited to 5 topics)
    const batchStartTime = Date.now();
    const TIMEOUT_MS = 150000; // 150 seconds

    const topicsToScrape = topicIds.slice(0, 5); // ONLY scrape 5 topics maximum
    console.log(`[Scrape] Processing top 5 topics for session ${sessionId}...`);

    for (const topicId of topicsToScrape) {
      // Check if we've exceeded our time limit
      if (Date.now() - batchStartTime > TIMEOUT_MS) {
        console.log(`[Scrape] ⏱️ Batch timeout reached. Stopping further processing.`);
        break;
      }

      try {
        await scrapeReferencesForTopic(topicId);
        // Sequential delay to be safe (2 seconds between topics)
        await new Promise(r => setTimeout(r, 2000));
      } catch (err) {
        console.error(`[Scrape] Failed for topic ${topicId}:`, err);
      }
    }

    console.log(`[Scrape] Completed batch scrape for session ${sessionId}.`);

    return NextResponse.json({ success: true, message: "Scrape batch completed" });

  } catch (error: any) {
    console.error("[Scrape] API Route Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
