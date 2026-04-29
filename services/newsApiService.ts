export interface NewsSignal {
  title: string;
  description: string;
  source: string;
  publishedAt: Date;
  url: string;
  platform: "news";
}

/**
 * Fetches current news signals. 
 * If API key is missing, returns empty array gracefully.
 */
export async function fetchNewsSignals(): Promise<NewsSignal[]> {
  const apiKey = process.env.NEWS_API_KEY;
  
  try {
    if (apiKey) {
      console.log("[NewsAPI] Fetching via API...");
      const res = await fetch(`https://newsapi.org/v2/top-headlines?country=in&apiKey=${apiKey}`);
      const data = await res.json();
      if (data.articles) {
        return data.articles.slice(0, 10).map((a: any) => ({
          title: a.title,
          description: a.description || "",
          source: a.source?.name || "News",
          publishedAt: new Date(a.publishedAt),
          url: a.url,
          platform: "news"
        }));
      }
    }

    // Fallback: Google News India RSS
    console.log("[NewsAPI] Falling back to Google News India RSS...");
    const RSS_URL = "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en";
    const response = await fetch(RSS_URL);
    const xmlData = await response.text();
    const titles = [...xmlData.matchAll(/<title>(.*?)<\/title>/g)].map(m => m[1]);
    
    return titles.slice(1, 12).map(title => ({
      title,
      description: "Trending news story from India.",
      source: "Google News IN",
      publishedAt: new Date(),
      url: "#",
      platform: "news"
    }));
  } catch (error) {
    console.error("[NewsAPI] Failed to fetch signals:", error);
    return [];
  }
}
