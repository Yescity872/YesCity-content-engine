import { chromium } from "playwright";
import { ScrapedLink } from "./instagramInstaTouchAdapter";

const randomDelay = (min = 500, max = 2000) => 
  new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1) + min)));

/**
 * Public/Unauthenticated Puppeteer Scraper for Instagram.
 * This is the fallback if other API-based public scrapers fail.
 */
export async function scrapeWithPuppeteer(hashtag: string, maxResults: number = 5): Promise<ScrapedLink[]> {
  console.log(`[Adapter: Puppeteer] Collecting ${maxResults} public results for #${hashtag}...`);

  const browser = await chromium.launch({ headless: true });
  const links: ScrapedLink[] = [];

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 1000 },
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    const page = await context.newPage();

    // DOM Fallback Method (Public Pages)
    const domUrl = `https://www.instagram.com/explore/tags/${hashtag}/`;
    
    // Attempt with a slightly longer timeout and better wait condition
    await page.goto(domUrl, { waitUntil: "networkidle", timeout: 45000 });
    await randomDelay(2000, 4000);
    
    // Check for login wall
    const isLoginWall = await page.evaluate(() => {
      return document.body.innerText.includes("Log In") && document.querySelectorAll('a[href^="/p/"]').length === 0;
    });

    if (isLoginWall) {
      console.log(`[Adapter: Puppeteer] 🛑 Login wall detected for #${hashtag}.`);
    }

    // Attempt to extract from JSON in script tags if present
    const scriptData = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      const sharedData = scripts.find(s => s.innerText.includes('window._sharedData'));
      if (sharedData) {
        try {
          const jsonStr = sharedData.innerText.split('window._sharedData = ')[1].split(';')[0];
          return JSON.parse(jsonStr);
        } catch (e) { return null; }
      }
      return null;
    });

    if (scriptData?.entry_data?.TagPage?.[0]?.graphql?.hashtag) {
      const hashtagData = scriptData.entry_data.TagPage[0].graphql.hashtag;
      const edges = [
        ...(hashtagData.edge_hashtag_to_media?.edges || []),
        ...(hashtagData.edge_hashtag_to_top_posts?.edges || [])
      ];

      for (const edge of edges.slice(0, maxResults)) {
        links.push({
          url: `https://www.instagram.com/p/${edge.node.shortcode}/`,
          mediaType: edge.node.is_video ? "reel" : "post",
          caption: edge.node.edge_media_to_caption?.edges[0]?.node?.text || ""
        });
      }
    }

    if (links.length === 0) {
      // Final attempt: Direct DOM scrape
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
              caption: ""
            };
          })
          .filter(link => link !== null)
          .slice(0, limit);
      }, maxResults);

      links.push(...domLinks);
    }

    if (links.length === 0) {
      console.log(`[Adapter: Puppeteer] ⚠️ No links found for #${hashtag}. Public access may be restricted.`);
    }

  } catch (err: any) {
    console.error(`[Adapter: Puppeteer] Critical failure for #${hashtag}: ${err.message}`);
  } finally {
    await browser.close();
  }

  return links;
}
