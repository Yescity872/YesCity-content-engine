import { NextResponse } from "next/server";
import { scrapeInstagram, saveScrapedPosts, getFallbackData } from "@/services/instagramScraper";
import { groupPostsIntoTrends } from "@/services/trendGroupingService";
import { scoreTrends } from "@/services/trendScoringService";
import { connectToDatabase } from "@/lib/mongodb";
import TrendSession from "@/models/TrendSession";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  const log: string[] = [];
  let sourceUsed: "live" | "cache" | "fallback" = "live";

  try {
    const rootTopics = [
      "viral", "trending", "meme", "reels", "popculture", 
      "sports", "food", "fashion", "ai", "news", 
      "music", "movies", "lifestyle"
    ];
    // Expand topics for broader search
    const hashtags = rootTopics.flatMap(topic => [
      topic, 
      `${topic}2026`, 
      `${topic}trends`, 
      `world${topic}`
    ]).slice(0, 20); // Keep it manageable
    const { query = "travel", sessionId: existingSessionId } = await request.json();
    log.push(`Request query: ${query}`);
    
    await connectToDatabase();

    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
    log.push(`DEMO_MODE: ${isDemoMode}`);

    // 1. Caching Check
    if (existingSessionId) {
       const session = await TrendSession.findOne({ sessionId: existingSessionId });
       if (session) {
         log.push(`Using cached session: ${existingSessionId}`);
         return NextResponse.json({ success: true, session, sourceUsed: "cache", log: log.join(" | ") });
       }
    }

    let scrapedPosts: any[] = [];
    
    if (isDemoMode) {
      log.push("Demo Mode active: Skipping live scrape.");
      sourceUsed = "fallback";
    } else {
      // 2. Scrape
      try {
        log.push("Starting live scrape...");
        scrapedPosts = await scrapeInstagram(hashtags);
        log.push(`Live scraped posts: ${scrapedPosts.length}`);
      } catch (err: any) {
        log.push(`Live scrape failed: ${err.message}`);
      }
    }

    if (scrapedPosts.length === 0) {
      log.push("Using fallback data (Live scrape failed or Demo Mode).");
      scrapedPosts = getFallbackData();
      sourceUsed = "fallback";
      log.push(`Fallback posts loaded: ${scrapedPosts.length}`);
    }

    const savedPosts = await saveScrapedPosts(scrapedPosts);
    log.push(`Saved/Normalized posts: ${savedPosts.length}`);
    
    // 3. Intelligence Layer
    log.push("Grouping posts into trends...");
    let groupedTrends = groupPostsIntoTrends(savedPosts);
    log.push(`Grouped trends: ${groupedTrends.length}`);

    if (groupedTrends.length === 0) {
      log.push("Grouping returned 0 results. Re-trying with fallback data.");
      const fallbackPosts = getFallbackData();
      const savedFallback = await saveScrapedPosts(fallbackPosts);
      groupedTrends = groupPostsIntoTrends(savedFallback);
      sourceUsed = "fallback";
      log.push(`Post-fallback grouped trends: ${groupedTrends.length}`);
    }

    log.push("Scoring trends...");
    const scoredTrends = scoreTrends(groupedTrends);

    // 4. Create Trend Session
    const trendCards = scoredTrends.map((t) => ({
      trendId: t.trendId,
      title: t.title,
      summary: t.summary,
      hashtags: t.hashtags,
      captionSnippet: t.posts[0]?.caption.substring(0, 100) + "...",
      whyItMatters: t.whyItMatters,
      whyThisMatters: t.whyItMatters, // Support legacy/cached schema
      yesCityAngle: t.yesCityAngle,
      classification: t.classification,
      referencePosts: t.posts
        .filter((p: any) => p.mediaType === "post")
        .slice(0, 5)
        .map((p: any) => ({
          url: p.postUrl,
          caption: p.caption,
          mediaType: "post",
          sourceType: p.sourceType || "live",
          engagement: `${p.engagement?.likes || 0} likes`
        })),
      referenceReels: t.posts
        .filter((p: any) => p.mediaType === "reel")
        .slice(0, 5)
        .map((p: any) => ({
          url: p.postUrl,
          caption: p.caption,
          mediaType: "reel",
          sourceType: p.sourceType || "live",
          engagement: `${p.engagement?.views || 0} views`
        })),
    }));
    log.push(`Final trendCards count: ${trendCards.length}`);

    if (trendCards.length === 0) {
      throw new Error("Critical Failure: No trends could be generated even after fallback.");
    }

    const sessionId = uuidv4();
    const session = await TrendSession.create({
      sessionId,
      query,
      trendCards,
    });

    console.log("Scrape Pipeline Log:", log.join(" -> "));

    return NextResponse.json({
      success: true,
      session,
      sourceUsed,
      log: log.join(" | ")
    });
  } catch (error: any) {
    console.error("API Route Error:", error);
    console.log("Partial Log before error:", log.join(" -> "));
    return NextResponse.json(
      { success: false, error: error.message, log: log.join(" | ") },
      { status: 500 }
    );
  }
}
