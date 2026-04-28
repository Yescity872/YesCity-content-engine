import { scrapeHashtag } from "./instagramScraper";
import TrendTopic, { ITrendTopic } from "@/models/TrendTopic";
import TrendReference from "@/models/TrendReference";
import { connectToDatabase } from "@/lib/mongodb";
import { curatedReferences } from "@/data/curatedReferences";

/**
 * Orchestrates scraping with strict relevance filtering.
 */
export async function scrapeReferencesForTopic(topicId: string): Promise<void> {
  await connectToDatabase();
  
  const topic = await TrendTopic.findOne({ topicId });
  if (!topic) return;

  try {
    topic.status = "scraping";
    await topic.save();

    console.log(`[Scrape] Starting topic: "${topic.title}"`);
    await TrendReference.deleteMany({ topicId: topic.topicId });

    const usedUrls = new Set<string>();
    const shortcodeRegex = /\/(p|reels|reel)\/([A-Za-z0-9_-]+)/;
    let relevantCount = 0;

    // 1. Live Scraping Phase
    for (const hashtag of topic.hashtags) {
      console.log(`[Scrape] Trying hashtag: #${hashtag}`);
      const results = await scrapeHashtag(hashtag, 6);
      
      for (const res of results) {
        if (usedUrls.has(res.url) || !shortcodeRegex.test(res.url)) continue;

        const caption = res.caption?.toLowerCase() || "";
        
        // RELEVANCE VALIDATION: Reject "Poison" keywords and irrelevant context
        const poisonKeywords = [
          "hidden camera", "spy cam", "security camera", "mcdonalds", "burger king", "starbucks", 
          "usa", "nyc", "london", "pakistan", "brand history", "founder story", "unrelated"
        ];
        
        const isPoison = poisonKeywords.some(word => caption.includes(word));
        
        // Category-specific sanity check
        let isRelevant = !isPoison;
        if (topic.category === "food" && !caption.includes("food") && !caption.includes("street") && !caption.includes("eat")) {
          isRelevant = false;
        }

        if (!isRelevant) {
          console.log(`[Filter] Discarded irrelevant post for "${topic.title}": ${res.url}`);
          usedUrls.add(res.url); // Mark as used so we don't try again
          continue;
        }

        try {
          const displayType = res.mediaType === "reel" ? "Reel" : "Post";
          const improvedCaption = res.caption || `Verified reference for ${topic.title}.`;

          await TrendReference.create({
            topicId: topic.topicId,
            platform: "instagram",
            url: res.url,
            mediaType: res.mediaType,
            aiCaption: improvedCaption,
            sourceType: "live",
            scrapedAt: new Date()
          });
          
          usedUrls.add(res.url);
          relevantCount++;
          console.log(`[Validation] Saved relevant live ref (${relevantCount}/4): ${res.url}`);
        } catch (dbErr: any) {
          if (dbErr.code !== 11000) console.error("[Scrape] DB Error:", dbErr);
        }
        
        if (relevantCount >= 4) break;
      }
      if (relevantCount >= 4) break;
    }

    // 2. Aggressive Fallback Rule
    // If we couldn't find at least 2 RELEVANT live refs, dump them and use curated
    if (relevantCount < 2) {
      console.log(`[Fallback] Topic "${topic.title}" only had ${relevantCount} relevant refs. Switching to curated bank.`);
      
      // Clear the weak live results to ensure quality
      await TrendReference.deleteMany({ topicId: topic.topicId, sourceType: "live" });
      
      const fallbackBank = curatedReferences[topic.category.toLowerCase()] || curatedReferences["memes"];
      let injected = 0;

      for (const f of fallbackBank) {
        try {
          await TrendReference.create({
            topicId: topic.topicId,
            platform: "instagram",
            url: f.url,
            mediaType: f.mediaType,
            aiCaption: f.aiCaption,
            sourceType: "curated",
            scrapedAt: new Date()
          });
          injected++;
        } catch (dbErr: any) {
          if (dbErr.code !== 11000) console.error("[Scrape] DB Error:", dbErr);
        }
        if (injected >= 3) break;
      }
      console.log(`[Fallback] Injected ${injected} curated Indian refs for "${topic.title}".`);
    }

    // 3. Final Status Update
    const finalCount = await TrendReference.countDocuments({ topicId: topic.topicId });
    topic.status = finalCount >= 2 ? "ready" : "failed";
    await topic.save();
    console.log(`[Scrape] Topic "${topic.title}" complete. Status: ${topic.status}`);

  } catch (error) {
    console.error(`[Scrape] Critical failure for ${topicId}:`, error);
    topic.status = "failed";
    await topic.save();
  }
}
