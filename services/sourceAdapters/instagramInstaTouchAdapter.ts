export interface ScrapedLink {
  url: string;
  mediaType: "reel" | "post";
  caption: string;
}

/**
 * Placeholder adapter for InstaTouch or similar public scraping tools.
 */
export async function scrapeWithInstaTouch(hashtag: string, maxResults: number = 5): Promise<ScrapedLink[]> {
  console.log(`[Adapter: InstaTouch] Attempting to scrape #${hashtag}...`);
  // Phase 0 placeholder: return empty to signal graceful unavailability
  return [];
}
