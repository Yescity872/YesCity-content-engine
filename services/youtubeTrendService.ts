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
    // 1. Pick the best query or combine them
    const searchQuery = `${topicTitle} ${queries.slice(0, 2).join(" ")} ${region === "IN" ? "India" : ""}`;
    console.log(`[YouTube] Searching for: "${searchQuery}"`);

    const params = new URLSearchParams({
      part: "snippet",
      q: searchQuery,
      maxResults: "5",
      relevanceLanguage: "en",
      regionCode: region,
      type: "video",
      videoEmbeddable: "true",
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
      // Determine if it's a Short (naive check: duration < 60s or aspect ratio, but YouTube API doesn't explicitly flag Shorts easily)
      // We'll use duration if possible. ISO 8601 duration format: PT#M#S
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

    return references;

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
