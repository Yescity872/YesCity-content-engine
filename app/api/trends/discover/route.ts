import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getOrCreateWeeklyTopics } from "@/services/trendTopicService";
import TrendSession from "@/models/TrendSession";
import { getCurrentWeekId } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";


export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const { sessionId: existingSessionId, forceRefresh = false, batchNumber: requestedBatchNumber } = await request.json().catch(() => ({}));
    await connectToDatabase();

    const weekId = getCurrentWeekId();

    let batchTopics: any[] = [];
    let batchNumber = 1;

    // A. Batch Rotation Mode
    if (existingSessionId && requestedBatchNumber) {
      batchNumber = requestedBatchNumber;
      console.log(`[Discover] Serving batch ${batchNumber} for session: ${existingSessionId}`);
      const allTopics = await getOrCreateWeeklyTopics(weekId, forceRefresh);
      batchTopics = allTopics.filter(t => t.batchNumber === batchNumber);
    } 
    // B. Initial Discovery Mode
    else {
      const allTopics = await getOrCreateWeeklyTopics(weekId, forceRefresh);
      // Randomize the selection from the week's 10 topics
      batchTopics = allTopics.sort(() => Math.random() - 0.5).slice(0, 5);
      batchNumber = 1; // We'll call this batch 1 for simplicity
    }

    if (batchTopics.length === 0) {
      return NextResponse.json({
        success: true,
        sessionId: existingSessionId || uuidv4(),
        batchNumber,
        topics: [],
        responseTime: `${Date.now() - startTime}ms`
      });
    }

    const topicIds = batchTopics.map(t => t.topicId);
    const topicTitles = batchTopics.map(t => t.title).join(", ");
    console.log(`[Discover] Batch ${batchNumber} topics: [${topicTitles}]`);

    // 3. Create or Update Session
    const sessionId = uuidv4();
    await TrendSession.create({
      sessionId,
      weekId,
      batchNumber,
      topicIds
    });

    console.log(`[Discover] Session created: ${sessionId} with ${topicIds.length} topics`);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const allWeeklyTopics = await getOrCreateWeeklyTopics(weekId);
    const allTopicIds = allWeeklyTopics.map(t => t.topicId);

    // Trigger background scrape for ALL topics in the week to have them cached
    fetch(`${baseUrl}/api/trends/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, topicIds: allTopicIds })
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
        aiSimulation: t.aiSimulation,
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