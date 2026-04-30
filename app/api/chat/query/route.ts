import { NextResponse } from "next/server";
import { aiRouter } from "@/services/ai/aiRouter";
import { connectToDatabase } from "@/lib/mongodb";
import DailyTrend from "@/models/DailyTrend";
import TrendTopic from "@/models/TrendTopic";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query) return NextResponse.json({ success: false, error: "Missing query" }, { status: 400 });

    await connectToDatabase();
    
    // Fetch latest context to make the AI smarter
    const latestTrends = await DailyTrend.find().sort({ dateKey: -1 }).limit(1);
    const recentTopics = await TrendTopic.find().sort({ createdAt: -1 }).limit(10);
    
    const contextStr = `
      LATEST LIVE TRENDS (India): ${latestTrends[0]?.trends?.slice(0, 5).map((t: any) => t.title).join(", ") || "None found"}
      RECENT DISCOVERED TOPICS: ${recentTopics.map((t: any) => t.title).join(", ") || "None found"}
    `;

    console.log(`[ChatQuery] Processing with context grounded in live data...`);

    const result = await aiRouter.generateStructured({
      purpose: "platformQueries",
      systemPrompt: `You are the YesCity AI Content Engine assistant. 
          Ground your response in these LATEST LIVE TRENDS if relevant:
          ${contextStr}
          
          A user is asking about specific trends or marketing advice. 
          
          Guidelines:
          1. Provide a helpful, concise, and professional response.
          2. USE POINTS (bullet points) and clear headings. DO NOT use long paragraphs.
          3. Explain what is currently popular related to their query and WHY.
          4. Offer 1-2 actionable marketing strategies for YesCity (Indian city discovery).
          5. Include 3-5 suggested hashtags or search terms.
          6. Mention that live references and visual cards can be fetched using the "Discover Trends" feature.
          7. Be encouraging and human-readable.
          
          Return a JSON object with a single key "content" containing your full formatted response text.`,
      userPrompt: query,
      inputForCache: { query }
    });

    const responseText = result.content || "I'm sorry, I couldn't process that request right now.";

    return NextResponse.json({ success: true, content: responseText });

  } catch (error: any) {
    console.error("[ChatQuery] API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
