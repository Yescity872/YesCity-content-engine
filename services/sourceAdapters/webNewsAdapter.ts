export interface WebScrapedReference {
  platform: "web";
  sourceName: "news" | "rss" | "web";
  url: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  mediaType: "article";
  sourceType: "live";
  publishedAt?: Date;
  fetchedAt: Date;
}

/**
 * Fetches public news/web links using Google News RSS for a topic.
 */
export async function scrapeWebNews(topic: string, query: string): Promise<WebScrapedReference[]> {
  console.log(`[Adapter: Web] Fetching news for: ${topic} (${query})`);
  const encodedQuery = encodeURIComponent(`${topic} ${query}`);
  const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-IN&gl=IN&ceid=IN:en`;

  try {
    const response = await fetch(rssUrl);
    const text = await response.text();
    
    // Very simple regex-based XML parsing to avoid large dependencies
    const items = text.match(/<item>[\s\S]*?<\/item>/g) || [];
    const results: WebScrapedReference[] = [];

    for (const item of items.slice(0, 3)) {
      const title = item.match(/<title>(.*?)<\/title>/)?.[1] || "";
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];

      if (title && link) {
        results.push({
          platform: "web",
          sourceName: "news",
          url: link,
          title: title.replace("<![CDATA[", "").replace("]]>", ""),
          mediaType: "article",
          sourceType: "live",
          publishedAt: pubDate ? new Date(pubDate) : undefined,
          fetchedAt: new Date()
        });
      }
    }

    return results;
  } catch (error) {
    console.error("[Adapter: Web] Error:", error);
    return [];
  }
}
