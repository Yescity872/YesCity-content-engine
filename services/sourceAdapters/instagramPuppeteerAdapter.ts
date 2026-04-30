import { chromium } from "playwright";
import { InstagramScrapedReference } from "./instagramInstaTouchAdapter";

const randomDelay = (min = 500, max = 2000) => 
  new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1) + min)));

/**
 * Public/Unauthenticated Puppeteer Scraper for Instagram.
 */
export async function scrapeWithPuppeteer(hashtag: string, maxResults: number = 5): Promise<InstagramScrapedReference[]> {
  console.log(`[Adapter: Puppeteer] Collecting ${maxResults} public results for #${hashtag}...`);

  const browser = await chromium.launch({ headless: true });
  const links: InstagramScrapedReference[] = [];

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 1000 },
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    const page = await context.newPage();
    const domUrl = `https://www.instagram.com/explore/tags/${hashtag.replace('#', '')}/`;
    
    // Set 12s timeout as requested
    await page.goto(domUrl, { waitUntil: "networkidle", timeout: 12000 });
    await randomDelay(1000, 2000);
    
    // Check for login wall
    const isLoginWall = await page.evaluate(() => {
      return document.body.innerText.includes("Log In") && document.querySelectorAll('a[href^="/p/"]').length === 0;
    });

    if (isLoginWall) {
      console.log(`[Adapter: Puppeteer] 🛑 Login wall detected for #${hashtag}.`);
      return [];
    }

    // Direct DOM scrape
    const domLinks = await page.evaluate((limit) => {
      const anchors = Array.from(document.querySelectorAll('a[href^="/p/"], a[href^="/reels/"], a[href^="/reel/"]'));
      const shortcodeRegex = /\/(p|reels|reel)\/([A-Za-z0-9_-]+)/;
      
      return anchors
        .map(a => {
          const href = (a as HTMLAnchorElement).href;
          const match = href.match(shortcodeRegex);
          if (!match) return null;
          
          return {
            url: href,
            mediaType: href.includes('/reels/') || href.includes('/reel/') ? ("reel" as const) : ("post" as const),
            description: "",
            sourceName: "puppeteer-public" as const
          };
        })
        .filter(link => link !== null)
        .slice(0, limit);
    }, maxResults);

    for (const link of domLinks) {
      links.push({
        ...link,
        platform: "instagram",
        sourceType: "live",
        fetchedAt: new Date()
      });
    }

  } catch (err: any) {
    console.error(`[Adapter: Puppeteer] Error for #${hashtag}: ${err.message}`);
  } finally {
    await browser.close();
  }

  return links;
}
