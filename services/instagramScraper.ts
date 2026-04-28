import { chromium, Page } from "playwright";
import fs from "fs";
import path from "path";

export interface ScrapedLink {
  url: string;
  mediaType: "reel" | "post";
  caption: string;
}

const STORAGE_PATH = path.join(process.cwd(), "storage", "instagram-auth.json");

const randomDelay = (min = 500, max = 2000) => 
  new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1) + min)));

/**
 * Core Instagram Scraper utility. 
 * Refactored to be a pure utility for collecting links per hashtag.
 */
export async function scrapeHashtag(hashtag: string, maxResults: number = 5): Promise<ScrapedLink[]> {
  console.log(`[Scraper] Collecting ${maxResults} results for #${hashtag}...`);

  if (!fs.existsSync(STORAGE_PATH)) {
    throw new Error("Instagram auth session missing. Run 'npm run save:instagram-session' first.");
  }

  const browser = await chromium.launch({ headless: true });
  const links: ScrapedLink[] = [];

  try {
    const context = await browser.newContext({
      storageState: STORAGE_PATH,
      viewport: { width: 1280, height: 1000 },
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    // 1. JSON Method Attempt
    const jsonUrl = `https://www.instagram.com/explore/tags/${hashtag}/?__a=1&__d=dis`;
    try {
      const response = await page.goto(jsonUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
      await randomDelay(1000, 2000);

      if (response && response.status() === 200 && !page.url().includes("login")) {
        const bodyText = await page.evaluate(() => document.body.innerText);
        if (bodyText.startsWith('{')) {
          const data = JSON.parse(bodyText);
          const hashtagData = data.graphql?.hashtag;
          if (hashtagData) {
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
            if (links.length > 0) return links;
          }
        }
      }
    } catch (e) {
      console.log(`[JSON] ❌ Method failed for #${hashtag}. Falling back to DOM.`);
    }

    // 2. DOM Fallback Method
    const domUrl = `https://www.instagram.com/explore/tags/${hashtag}/`;
    await page.goto(domUrl, { waitUntil: "load", timeout: 45000 });
    await page.evaluate(() => window.scrollBy(0, 800));
    await randomDelay(1500, 2500);

    const domLinks = await page.evaluate((limit) => {
      const anchors = Array.from(document.querySelectorAll('a[href^="/p/"], a[href^="/reels/"]'));
      const shortcodeRegex = /\/(p|reels|reel)\/([A-Za-z0-9_-]+)\//;
      
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

  } catch (err) {
    console.error(`[Scraper] Critical failure for #${hashtag}:`, err);
  } finally {
    await browser.close();
  }

  return links;
}

/**
 * @deprecated Use scrapeHashtag() for the new topic-first flow.
 */
export async function scrapeInstagram(hashtags: string[]) {
  const results = [];
  for (const tag of hashtags) {
    results.push(...(await scrapeHashtag(tag, 5)));
  }
  return results;
}

/**
 * @deprecated Fallback logic is now handled in trendTopicService.
 */
export function getFallbackData(): any[] {
  return [];
}

/**
 * @deprecated Use saveTrendReferences in topicReferenceScraper.
 */
export async function saveScrapedPosts(posts: any[]) {
  return posts;
}
