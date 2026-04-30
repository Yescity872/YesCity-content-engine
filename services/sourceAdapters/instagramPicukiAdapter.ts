import { chromium } from "playwright";

export interface InstagramScrapedReference {
  platform: "instagram";
  sourceName: "picuki" | "instatouch" | "snapscrape" | "puppeteer-public";
  url: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  mediaType: "reel" | "post";
  engagement?: {
    views?: number;
    likes?: number;
    comments?: number;
  };
  sourceType: "live";
  fetchedAt: Date;
}

/**
 * Public scraper using Picuki.com (Instagram Web Viewer).
 */
export async function scrapeWithPicuki(hashtag: string, maxResults: number = 5): Promise<InstagramScrapedReference[]> {
  console.log(`[Adapter: Picuki] Scraping #${hashtag} via Web Viewer...`);
  
  const browser = await chromium.launch({ headless: true });
  const links: InstagramScrapedReference[] = [];

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 1000 },
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    });
    const page = await context.newPage();
    
    // Picuki Hashtag URL
    const url = `https://www.picuki.com/tag/${hashtag.replace('#', '')}`;
    
    // Set a timeout of 10 seconds as requested
    await page.goto(url, { waitUntil: "networkidle", timeout: 10000 });

    // Extract posts
    const posts = await page.evaluate((limit) => {
      const items = Array.from(document.querySelectorAll('.post-info-container'));
      return items.slice(0, limit).map(item => {
        const link = item.querySelector('a')?.href || "";
        const caption = item.querySelector('.photo-description')?.textContent?.trim() || "";
        const isVideo = item.querySelector('.video-icon') !== null;
        const thumbnail = item.querySelector('.post-image')?.getAttribute('src') || "";
        
        return {
          url: link,
          mediaType: isVideo ? ("reel" as const) : ("post" as const),
          description: caption,
          thumbnailUrl: thumbnail,
          sourceName: "picuki" as const
        };
      });
    }, maxResults);

    for (const post of posts) {
      links.push({
        ...post,
        platform: "instagram",
        sourceType: "live",
        fetchedAt: new Date()
      });
    }

    console.log(`[Adapter: Picuki] Found ${links.length} results for #${hashtag}.`);

  } catch (err: any) {
    console.error(`[Adapter: Picuki] Error: ${err.message}`);
  } finally {
    await browser.close();
  }

  return links;
}
