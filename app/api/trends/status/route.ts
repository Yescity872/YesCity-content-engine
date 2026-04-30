import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import TrendTopic from "@/models/TrendTopic";
import TrendReference from "@/models/TrendReference";
import TrendSession from "@/models/TrendSession";

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const { sessionId } = await request.json();
    if (!sessionId) throw new Error("sessionId is required");

    await connectToDatabase();

    // 1. Find session
    const session = await TrendSession.findOne({ sessionId });
    if (!session) throw new Error("Session not found");

    // 2. Fetch current state of topics in this session
    const topics = await TrendTopic.find({ topicId: { $in: session.topicIds } });
    
    // 3. Fetch references for ready topics
    const readyTopicIds = topics.filter(t => t.status === "ready").map(t => t.topicId);
    const references = await TrendReference.find({ topicId: { $in: readyTopicIds } });

    // 4. Combine and Sanitize
    const shortcodeRegex = /\/(p|reels|reel)\/([A-Za-z0-9_-]+)/; // Match regex with scraper
    const genericCaption = "Trending reference for";
    const genericAngle = "Adapt this viral format to showcase a unique city experience in India.";

    const results = topics.map(t => ({
      topicId: t.topicId,
      title: t.title,
      category: t.category,
      contextSummary: t.contextSummary,
      classification: t.classification,
      yesCityAngle: t.yesCityAngle,
      status: t.status,
      intelligenceReport: t.intelligenceReport,
      references: (references.filter(r => r.topicId === t.topicId) || [])
        .map(r => ({
          platform: r.platform,
          sourceName: r.sourceName,
          url: r.url,
          title: r.title,
          description: r.description,
          thumbnailUrl: r.thumbnailUrl,
          channelTitle: r.channelTitle,
          mediaType: r.mediaType,
          sourceType: r.sourceType,
          aiMarketingNote: r.aiMarketingNote
        }))
        .slice(0, 5) // Return top 5 for UI
    }));

    return NextResponse.json({
      success: true,
      topics: results,
      responseTime: `${Date.now() - startTime}ms`
    });

  } catch (error: any) {
    console.error("[Status] API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
