import TrendReference from "@/models/TrendReference";
import { connectToDatabase } from "@/lib/mongodb";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_VIDEO_URL = "https://www.googleapis.com/youtube/v3/videos";

export interface YouTubeReference {
  platform: "youtube";
  sourceName: "youtube";
  url: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: Date;
  mediaType: "video" | "short";
  engagement?: {
    views?: number;
    likes?: number;
    comments?: number;
  };
  sourceType: "live";
}

/**
 * Searches YouTube for relevant videos/shorts based on topic and queries.
 */
export async function searchYouTubeReferences(
  topicTitle: string, 
  queries: string[], 
  region = "IN"
): Promise<YouTubeReference[]> {
  if (!YOUTUBE_API_KEY) {
    console.log("[YouTube] ⚠️ YOUTUBE_API_KEY missing. Skipping YouTube search.");
    return [];
  }

  try {
    // 1. Refined Search Strategy
    const subQuery = queries.length > 0 ? queries[Math.floor(Math.random() * queries.length)] : "";
    
    // We use subQuery variations instead of a random string to avoid confusing the search engine
    const queryPool = [
      `${topicTitle} shorts India`,
      `${topicTitle} ${subQuery} shorts`,
      `${topicTitle} viral shorts India`,
      `${topicTitle} trends shorts`
    ];
    const searchQuery = queryPool[Math.floor(Math.random() * queryPool.length)].trim();
    
    // Logic to avoid broad religious matches for lifestyle/fashion topics
    const isReligiousTopic = topicTitle.toLowerCase().match(/puja|prayer|mantra|bhajan|god|temple|ritual/i);
    const isFashionDance = topicTitle.toLowerCase().match(/fashion|dandiya|dance|party|outfit|style|look|wear/i);
    
    let negativeFilters = "-cricket -ipl -dhoni -kohli";
    if (isFashionDance && !isReligiousTopic) {
      negativeFilters += " -puja -prayer -bhajan -mantra -aarti -temple";
    }

    const finalQuery = `${searchQuery} ${negativeFilters}`.trim();
    console.log(`[YouTube] 🔍 Searching: "${finalQuery}"`);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6); // Wider window to catch seasonal trends

    const params = new URLSearchParams({
      part: "snippet",
      q: finalQuery,
      maxResults: "25", // Fetch more to increase chances of finding vertical content
      relevanceLanguage: "en",
      regionCode: region,
      type: "video",
      videoDuration: "short", 
      videoEmbeddable: "true",
      publishedAfter: sixMonthsAgo.toISOString(),
      key: YOUTUBE_API_KEY
    });

    const response = await fetch(`${YOUTUBE_SEARCH_URL}?${params.toString()}`);
    const data = await response.json();

    if (data.error) {
      console.error("[YouTube] API Error:", data.error.message);
      return [];
    }

    if (!data.items || data.items.length === 0) return [];

    const videoIds = data.items.map((item: any) => item.id.videoId).join(",");
    
    // 2. Get video details (Duration check is CRITICAL)
    const detailsParams = new URLSearchParams({
      part: "statistics,contentDetails,snippet",
      id: videoIds,
      key: YOUTUBE_API_KEY
    });

    const detailsResponse = await fetch(`${YOUTUBE_VIDEO_URL}?${detailsParams.toString()}`);
    const detailsData = await detailsResponse.json();

    // 3. Process and Filter
    const references: YouTubeReference[] = detailsData.items
      .map((item: any) => {
        const duration = item.contentDetails.duration;
        const minutesMatch = duration.match(/PT(\d+)M/);
        const secondsMatch = duration.match(/(\d+)S/);
        const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
        const seconds = secondsMatch ? parseInt(secondsMatch[1]) : 0;
        const totalSeconds = (minutes * 60) + seconds;

        return {
          item,
          totalSeconds
        };
      })
      .filter(({ totalSeconds }: { totalSeconds: number }) => {
        // Vertical/Shorts check: Mostly < 90s for this platform
        return totalSeconds > 0 && totalSeconds <= 90; 
      })
      .map(({ item }: { item: any }) => ({
        platform: "youtube",
        sourceName: "youtube",
        url: `https://www.youtube.com/watch?v=${item.id}`,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: new Date(item.snippet.publishedAt),
        mediaType: "short",
        engagement: {
          views: parseInt(item.statistics.viewCount) || 0,
          likes: parseInt(item.statistics.likeCount) || 0,
          comments: parseInt(item.statistics.commentCount) || 0
        },
        sourceType: "live"
      }));

    // 4. Smart AI Validation (The "Security Guard")
    // To ensure 'Dandiya' isn't 'Puja', we let AI check the metadata of the top candidates.
    console.log(`[YouTube] 🧠 AI-Filtering ${references.length} candidates for "${topicTitle}"...`);
    
    if (references.length === 0) return [];

    try {
      const { aiRouter } = await import("./ai/aiRouter");
      
      // We take the top 12 candidates by engagement to analyze
      const candidatesToAnalyze = references
        .sort((a, b) => (b.engagement?.views || 0) - (a.engagement?.views || 0))
        .slice(0, 12);

      const validationPrompt = `Evaluate these ${candidatesToAnalyze.length} content items for the trend topic: "${topicTitle}".
      
      CRITICAL INSTRUCTION: Only approve items that match the CREATIVE AND MARKETING INTENT.
      
      Logic:
      - If the topic is 'Food', REJECT generic health advice or news about prices.
      - If the topic is 'Fashion/Lifestyle', REJECT generic news, tutorials that are too basic, or religious/unrelated content.
      - If the topic is 'Tech', REJECT scammy looking content or unrelated 'how-to' videos.
      - We want VIRAL, INSPIRATIONAL, or HIGH-PRODUCTION content that a creator can use as a reference.
      
      Content Items:
      ${candidatesToAnalyze.map((v, i) => `[ID:${i}] Title: ${v.title} | Context: ${v.description.substring(0, 120)}`).join("\n")}
      
      Return ONLY a JSON array of IDs that are high-quality and intent-matched (e.g. [0, 2, 4]). Return empty array if none are perfect.`;

      const validationResponse = await aiRouter.generateStructured({
        purpose: "trendDetail",
        systemPrompt: "You are a content quality filter. Be extremely strict about intent matching.",
        userPrompt: validationPrompt,
        inputForCache: { topicTitle, candidates: candidatesToAnalyze.map(c => c.url) }
      });

      const validIds = Array.isArray(validationResponse) ? validationResponse : validationResponse.ids || [];
      
      const filteredResults = candidatesToAnalyze.filter((_, i) => validIds.includes(i));
      
      console.log(`[YouTube] ✅ AI Filtered: ${filteredResults.length}/${candidatesToAnalyze.length} matched perfectly.`);
      
      // If AI was too strict and returned 0, but we have some, return the top 2 as fallback 
      // but only if they don't contain hard negative words.
      if (filteredResults.length === 0) {
        return candidatesToAnalyze
          .filter(v => !v.title.toLowerCase().match(/puja|mantra|bhajan|aarti|prayer/))
          .slice(0, 3);
      }

      return filteredResults.slice(0, 5);

    } catch (aiErr) {
      console.error("[YouTube] Smart Filter failed, falling back to keyword filter:", aiErr);
      return references
        .filter(v => !v.title.toLowerCase().match(/puja|mantra|bhajan|aarti|prayer/))
        .slice(0, 5);
    }

  } catch (error) {
    console.error("[YouTube] Critical Error:", error);
    return [];
  }
}

/**
 * Gets cached YouTube references for a topic.
 */
export async function getYouTubeReferencesForTopic(topicId: string) {
  await connectToDatabase();
  return await TrendReference.find({ 
    topicId, 
    platform: "youtube",
    expiresAt: { $gt: new Date() }
  });
}
