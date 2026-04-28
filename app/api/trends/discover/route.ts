import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getOrCreateWeeklyTopics } from "@/services/trendTopicService";
import TrendSession from "@/models/TrendSession";
import { getCurrentWeekId } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";


export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const { sessionId: existingSessionId, forceRefresh = false, query, nextBatch } = await request.json().catch(() => ({}));
    await connectToDatabase();

    const weekId = getCurrentWeekId();

    let batchTopics: any[] = [];
    let batchNumber = 1;

    // A. Custom Query Mode
    if (query) {
      console.log(`[Discover] Custom query search: "${query}"`);
      const customTopic = await getOrCreateWeeklyTopics(weekId, false, query);
      batchTopics = [customTopic];
    } 
    // B. Batch Rotation Mode
    else if (existingSessionId && nextBatch) {
      const prevSession = await TrendSession.findOne({ sessionId: existingSessionId });
      batchNumber = 2; // Explicitly request batch 2
      console.log(`[Discover] Serving batch 2 for session: ${existingSessionId}`);
      const allTopics = await getOrCreateWeeklyTopics(weekId, forceRefresh);
      batchTopics = allTopics.filter(t => t.batchNumber === 2);
    } 
    // C. Initial Discovery Mode
    else {
      const allTopics = await getOrCreateWeeklyTopics(weekId, forceRefresh);
      batchTopics = allTopics.filter(t => t.batchNumber === 1);
    }

    const topicIds = batchTopics.map(t => t.topicId);

    // 3. Create Session (Await explicitly to avoid race condition)
    const sessionId = uuidv4();
    await TrendSession.create({
      sessionId,
      weekId,
      batchNumber,
      topicIds
    });

    console.log(`[Discover] Session created: ${sessionId} with ${topicIds.length} topics`);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    // Use a slightly more robust background trigger
    const scrapePromise = fetch(`${baseUrl}/api/trends/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, topicIds }) // Pass topicIds directly as fallback
    }).catch(err => console.error("[Discover] Background scrape trigger failed:", err));

    const response = NextResponse.json({
      success: true,
      sessionId,
      batchNumber,
      topics: batchTopics.map(t => ({
        topicId: t.topicId,
        title: t.title,
        category: t.category,
        contextSummary: t.contextSummary,
        classification: t.classification,
        yesCityAngle: t.yesCityAngle,
        status: t.status,
        references: []
      })),
      responseTime: `${Date.now() - startTime}ms`
    });

    return response;

  } catch (error: any) {
    console.error("[Discover] API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}