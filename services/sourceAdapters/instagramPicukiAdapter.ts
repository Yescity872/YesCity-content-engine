import { InstagramScrapedReference } from "./instagramInstaTouchAdapter";

/**
 * Vercel-Compatible Public scraper using Picuki.com (Fetch-based).
 * Highly hardened headers to bypass Cloudflare.
 */
export async function scrapeWithPicuki(hashtag: string, maxResults: number = 5): Promise<InstagramScrapedReference[]> {
  const cleanTag = hashtag.replace('#', '');
  console.log(`[Adapter: Picuki] Deep-fetching #${cleanTag}...`);
  
  try {
    const url = `https://www.picuki.com/tag/${cleanTag}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "max-age=0",
        "Referer": "https://www.google.com/",
        "Sec-Ch-Ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1"
      }
    });

    if (!response.ok) {
      console.warn(`[Adapter: Picuki] HTTP ${response.status}`);
      return [];
    }

    const html = await response.text();
    
    // Check for Cloudflare block
    if (html.includes("challenge-platform") || html.includes("cloudflare") || html.length < 10000) {
      console.warn(`[Adapter: Picuki] 🛑 Blocked by Cloudflare (HTML length: ${html.length})`);
      return [];
    }

    const links: InstagramScrapedReference[] = [];

    // Extract using a very broad regex for links and thumbnails
    const regex = /href="(https:\/\/www\.picuki\.com\/media\/.*?)"[\s\S]*?src="(https:\/\/.*?\.cdninstagram\.com\/.*?)"/g;
    const matches = html.matchAll(regex);
    
    for (const match of matches) {
      if (links.length >= maxResults) break;
      links.push({
        platform: "instagram",
        sourceName: "picuki",
        url: match[1],
        thumbnailUrl: match[2],
        description: "",
        mediaType: "post",
        sourceType: "live",
        fetchedAt: new Date()
      });
    }

    console.log(`[Adapter: Picuki] Found ${links.length} results.`);
    return links;

  } catch (err: any) {
    console.error(`[Adapter: Picuki] Error: ${err.message}`);
    return [];
  }
}
