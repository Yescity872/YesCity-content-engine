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
    // 1. Randomize query selection and add 'shorts' focus with a random seed for diversity
    const randomSeed = Math.random().toString(36).substring(2, 10);
    const randomSubQuery = queries.length > 0 ? queries[Math.floor(Math.random() * queries.length)] : "";
    // Use quotes for exact topic matching and negative keywords to avoid cricket crossover for non-cricket topics
    const isCricketTopic = topicTitle.toLowerCase().includes("cricket") || topicTitle.toLowerCase().includes("ipl");
    const negativeFilters = isCricketTopic ? "" : "-cricket -ipl -dhoni -kohli";
    // Inject random seed into the query itself to force YouTube to vary the ranking
    const searchQuery = `"${topicTitle}" ${randomSubQuery} ${randomSeed} ${negativeFilters} shorts India`.trim();
    console.log(`[YouTube] Searching for: "${searchQuery}" (High Jitter Focus)`);

    // Get date for last 30 days to ensure fresh content
    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);

    const params = new URLSearchParams({
      part: "snippet",
      q: searchQuery,
      maxResults: "10", // Fetch more to allow for diversity
      relevanceLanguage: "en",
      regionCode: region,
      type: "video",
      videoDuration: "short", // < 4 minutes
      videoEmbeddable: "true",
      publishedAfter: lastMonth.toISOString(),
      key: YOUTUBE_API_KEY
    });

    const response = await fetch(`${YOUTUBE_SEARCH_URL}?${params.toString()}`);
    const data = await response.json();

    if (data.error) {
      console.error("[YouTube] API Error:", data.error.message);
      return [];
    }

    if (!data.items || data.items.length === 0) {
      return [];
    }

    const videoIds = data.items.map((item: any) => item.id.videoId).join(",");
    
    // 2. Get video details (for engagement and duration/type)
    const detailsParams = new URLSearchParams({
      part: "statistics,contentDetails,snippet",
      id: videoIds,
      key: YOUTUBE_API_KEY
    });

    const detailsResponse = await fetch(`${YOUTUBE_VIDEO_URL}?${detailsParams.toString()}`);
    const detailsData = await detailsResponse.json();

    const references: YouTubeReference[] = detailsData.items.map((item: any) => {
      const duration = item.contentDetails.duration;
      const isShort = duration.includes("S") && !duration.includes("H") && (!duration.includes("M") || duration.match(/PT(\d+)M/)?.[1] === "0");

      return {
        platform: "youtube",
        sourceName: "youtube",
        url: `https://www.youtube.com/watch?v=${item.id}`,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: new Date(item.snippet.publishedAt),
        mediaType: isShort ? "short" : "video",
        engagement: {
          views: parseInt(item.statistics.viewCount) || 0,
          likes: parseInt(item.statistics.likeCount) || 0,
          comments: parseInt(item.statistics.commentCount) || 0
        },
        sourceType: "live"
      };
    });

    // Shuffle and take 5 for diversity
    return references.sort(() => Math.random() - 0.5).slice(0, 5);

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
