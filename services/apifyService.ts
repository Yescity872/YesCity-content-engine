/**
 * services/apifyService.ts
 * Placeholder for Apify scraper integration.
 *
 * TODO (Future Integration):
 * - Import the Apify client: `import { ApifyClient } from "apify-client"`
 * - Add APIFY_API_TOKEN to .env.local
 * - Implement scraper functions for:
 *   1. scrapeInstagramTrends(query: string) → trending reels/hashtags
 *   2. scrapeXTrends(query: string) → trending threads/topics
 *   3. scrapeCityContent(city: string) → UGC content about a city
 * - These results will feed into weeklyPlannerService and ideaGeneratorService
 *   to replace hardcoded seasonal data with live trending topics.
 */

export interface ApifyTrendResult {
  source: string;
  topic: string;
  url?: string;
  engagement?: number;
  scrapedAt: Date;
}

/**
 * Placeholder: Will scrape trending Instagram content for a given topic.
 * @param query - City, hashtag, or topic to search
 */
export async function scrapeInstagramTrends(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  query: string
): Promise<ApifyTrendResult[]> {
  // TODO: Implement with ApifyClient
  // const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
  // const run = await client.actor("apify/instagram-hashtag-scraper").call({ hashtags: [query] });
  // const dataset = await client.dataset(run.defaultDatasetId).listItems();
  // return dataset.items.map(item => ({ ... }));

  console.warn("[ApifyService] scrapeInstagramTrends not yet implemented.");
  return [];
}

/**
 * Placeholder: Will scrape trending X (Twitter) threads for a given topic.
 * @param query - Topic or keyword to search
 */
export async function scrapeXTrends(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  query: string
): Promise<ApifyTrendResult[]> {
  // TODO: Implement with ApifyClient
  console.warn("[ApifyService] scrapeXTrends not yet implemented.");
  return [];
}

/**
 * Placeholder: Will scrape UGC and city-specific content from social platforms.
 * @param city - City name to search content for
 */
export async function scrapeCityContent(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  city: string
): Promise<ApifyTrendResult[]> {
  // TODO: Implement with ApifyClient
  console.warn("[ApifyService] scrapeCityContent not yet implemented.");
  return [];
}
