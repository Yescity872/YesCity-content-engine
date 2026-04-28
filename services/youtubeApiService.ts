export interface YouTubeSignal {
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: Date;
  thumbnailUrl: string;
  videoUrl: string;
  platform: "youtube";
}

/**
 * Fetches trending YouTube signals.
 * If API key is missing, returns empty array gracefully.
 */
export async function fetchYouTubeSignals(): Promise<YouTubeSignal[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.log("[YouTubeAPI] Skipped: YOUTUBE_API_KEY not found.");
    return [];
  }

  try {
    // In a real implementation, we would call YouTube Data API v3 here
    // const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=IN&key=${apiKey}`);
    // const data = await res.json();
    // return data.items.map(...)
    
    console.log("[YouTubeAPI] Signal fetching placeholder called.");
    return [];
  } catch (error) {
    console.error("[YouTubeAPI] Failed to fetch signals:", error);
    return [];
  }
}
