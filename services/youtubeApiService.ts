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

  try {
    if (apiKey) {
      console.log("[YouTubeAPI] Fetching via API...");
      const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=IN&key=${apiKey}`);
      const data = await res.json();
      if (data.items) {
        return data.items.map((item: any) => ({
          title: item.snippet.title,
          description: item.snippet.description,
          channelTitle: item.snippet.channelTitle,
          publishedAt: new Date(item.snippet.publishedAt),
          thumbnailUrl: item.snippet.thumbnails.high.url,
          videoUrl: `https://youtube.com/watch?v=${item.id}`,
          platform: "youtube"
        }));
      }
    }

    // Fallback: Trending RSS
    console.log("[YouTubeAPI] Falling back to Public Trending signals...");
    const RSS_URL = "https://www.youtube.com/feeds/videos.xml?chart=mostPopular&region_code=IN";
    const response = await fetch(RSS_URL);
    const xmlData = await response.text();
    const titles = [...xmlData.matchAll(/<title>(.*?)<\/title>/g)].map(m => m[1]);
    
    return titles.slice(1, 10).map(title => ({
      title,
      description: "Trending video in India.",
      channelTitle: "YouTube Trending",
      publishedAt: new Date(),
      thumbnailUrl: "",
      videoUrl: "#",
      platform: "youtube"
    }));
  } catch (error) {
    console.error("[YouTubeAPI] Failed to fetch signals:", error);
    return [];
  }
}
