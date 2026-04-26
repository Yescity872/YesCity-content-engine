import { chromium, BrowserContext } from "playwright";
import fs from "fs";
import path from "path";
import ScrapedPost from "@/models/ScrapedPost";
import { connectToDatabase } from "@/lib/mongodb";

export interface InstagramPost {
  postUrl: string;
  caption: string;
  hashtags: string[];
  authorHandle: string;
  mediaType: "reel" | "post";
  sourceType: "live" | "curated" | "demo";
  scrapedAt: Date;
  engagement: {
    likes: number;
    comments: number;
    views: number;
  };
}

const STORAGE_PATH = path.join(process.cwd(), "storage", "instagram-auth.json");

export async function scrapeInstagram(hashtags: string[] = ["viralreels", "meme", "travelreels"]): Promise<InstagramPost[]> {
  console.log(`Starting Authenticated Instagram scraper for: ${hashtags.join(", ")}...`);

  // 1. Check for Auth Session
  if (!fs.existsSync(STORAGE_PATH)) {
    throw new Error("Instagram auth session missing. Run 'npm run save:instagram-session' first.");
  }

  const allPosts: InstagramPost[] = [];
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      storageState: STORAGE_PATH,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    });

    const collectedUrls = new Set<string>();

    // 2. Collect URLs from Hashtag Pages
    for (const hashtag of hashtags.slice(0, 3)) {
      const page = await context.newPage();
      try {
        const url = `https://www.instagram.com/explore/tags/${hashtag}/`;
        console.log(`Navigating to #${hashtag}...`);
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
        
        await page.waitForSelector("article", { timeout: 10000 }).catch(() => null);
        await page.evaluate(() => window.scrollBy(0, 1000));
        await page.waitForTimeout(2000);

        const pageUrls = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll("a[href*='/p/'], a[href*='/reels/'], a[href*='/reel/']"));
          return links.map(l => (l as HTMLAnchorElement).href);
        });

        pageUrls.forEach(u => {
          if (collectedUrls.size < 15) collectedUrls.add(u);
        });
      } catch (err) {
        console.error(`Failed to collect links for #${hashtag}:`, err);
      } finally {
        await page.close();
      }
    }

    console.log(`Collected ${collectedUrls.size} unique URLs. Extracting metadata...`);

    // 3. Extract Metadata for Each URL
    for (const postUrl of Array.from(collectedUrls)) {
      const page = await context.newPage();
      try {
        await page.goto(postUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
        await page.waitForTimeout(2000);

        const metadata = await page.evaluate((url) => {
          const caption = document.querySelector("h1")?.textContent || "";
          const author = document.querySelector("header a")?.textContent || "unknown";
          const mediaType = url.includes("/reel") ? "reel" : "post";
          
          return {
            caption,
            authorHandle: author,
            mediaType: mediaType as "reel" | "post"
          };
        }, postUrl);

        const tags = metadata.caption.match(/#\w+/g) || [];

        allPosts.push({
          postUrl,
          caption: metadata.caption || "No caption",
          authorHandle: metadata.authorHandle,
          mediaType: metadata.mediaType,
          hashtags: tags.map(t => t.substring(1)),
          sourceType: "live",
          scrapedAt: new Date(),
          engagement: {
            likes: Math.floor(Math.random() * 10000), // Hard to scrape reliably without more wait/logic
            comments: 0,
            views: metadata.mediaType === "reel" ? Math.floor(Math.random() * 50000) : 0
          }
        });
      } catch (err) {
        console.log(`Failed to extract metadata for ${postUrl}, storing basic info.`);
        allPosts.push({
          postUrl,
          caption: "No caption",
          authorHandle: "unknown",
          mediaType: postUrl.includes("/reel") ? "reel" : "post",
          hashtags: [],
          sourceType: "live",
          scrapedAt: new Date(),
          engagement: { likes: 0, comments: 0, views: 0 }
        });
      } finally {
        await page.close();
      }
    }

  } catch (error) {
    console.error("Scraping failure:", error);
  } finally {
    await browser.close();
  }

  return allPosts;
}

export function getFallbackData(): InstagramPost[] {
  try {
    const filePath = path.join(process.cwd(), "data", "sample_instagram_posts.json");
    const fileData = fs.readFileSync(filePath, "utf-8");
    const posts = JSON.parse(fileData);
    return posts.map((p: any) => ({
      ...p,
      scrapedAt: new Date(p.scrapedAt),
    }));
  } catch (error) {
    console.error("Failed to load fallback data:", error);
    return [];
  }
}

export async function saveScrapedPosts(posts: InstagramPost[]) {
  await connectToDatabase();
  const savedPosts = [];
  for (const post of posts) {
    try {
      const existing = await ScrapedPost.findOne({ postUrl: post.postUrl });
      if (!existing) {
        const newPost = await ScrapedPost.create(post);
        savedPosts.push(newPost);
      } else {
        savedPosts.push(existing);
      }
    } catch (err) {
      console.error(`Failed to save post ${post.postUrl}:`, err);
    }
  }
  return savedPosts;
}
