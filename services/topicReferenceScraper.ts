import TrendTopic, { ITrendTopic } from "@/models/TrendTopic";
import TrendReference from "@/models/TrendReference";
import { connectToDatabase } from "@/lib/mongodb";
import { scrapeWithInstaTouch } from "./sourceAdapters/instagramInstaTouchAdapter";
import { scrapeWithSnapscrape } from "./sourceAdapters/instagramSnapscrapeAdapter";
import { scrapeWithPuppeteer } from "./sourceAdapters/instagramPuppeteerAdapter";
import { generateFallbackIntelligence } from "./trendTopicService";
import { aiRouter } from "./ai/aiRouter";

async function generateAiMarketingNote(topicTitle: string, caption: string): Promise<string> {
  const result = await aiRouter.generateStructured({
    purpose: "trendDetail",
    systemPrompt: "You are a YesCity production strategist. Analyze the content of this reel (via its caption) and give a 1-sentence instruction on EXACTLY how to replicate its visual style or hook for an Indian city guide. Focus on creative shots and local vibes.",
    userPrompt: `Trend Topic: ${topicTitle}\nReel Content/Caption: ${caption}`,
    inputForCache: { topicTitle, caption: caption.slice(0, 100) }
  });

  return result.instruction || result.note || "Replicate this creative format to showcase local city culture.";
}

/**
 * Orchestrates scraping with strict relevance filtering and fallback adapters.
 */
export async function scrapeReferencesForTopic(topicId: string): Promise<void> {
  await connectToDatabase();
  
  const topic = await TrendTopic.findOne({ topicId });
  if (!topic) return;

  topic.status = "scraping";
  await topic.save();

  try {
    console.log(`[Scrape] Starting topic: "${topic.title}"`);
    await TrendReference.deleteMany({ topicId: topic.topicId });

    const usedUrls = new Set<string>();
    let relevantCount = 0;

    // Prioritize Indian-specific hashtags if not provided
    const tagsToTry = topic.hashtags?.length > 0 ? topic.hashtags : [`${topic.title.replace(/\s+/g, '')}india`, "indianfestivals", "creativereelsindia"];

    for (let rawHashtag of tagsToTry) {
      const hashtag = rawHashtag.replace(/^#/, ''); // Strip '#' to avoid double hashing
      console.log(`[Scrape] Trying hashtag: #${hashtag}`);
      let results: any[] = [];
      
      // Fallback Architecture Chain
      try {
        results = await scrapeWithInstaTouch(hashtag, 6);
        if (results.length === 0) {
          console.log(`[Scrape Fallback] InstaTouch returned 0 results for #${hashtag}. Trying Snapscrape...`);
          results = await scrapeWithSnapscrape(hashtag, 6);
        }
        if (results.length === 0) {
          console.log(`[Scrape Fallback] Snapscrape returned 0 results for #${hashtag}. Trying Puppeteer Public...`);
          results = await scrapeWithPuppeteer(hashtag, 6);
        }
      } catch (err: any) {
        console.error(`[Scrape Fallback] Chain failed for #${hashtag}:`, err.message);
      }
      
      for (const res of results) {
        if (usedUrls.has(res.url)) continue;

        const caption = res.caption?.toLowerCase() || "";
        
        // RELEVANCE VALIDATION: Reject foreign context and generic junk
        const poisonKeywords = [
          "hidden camera", "spy cam", "security camera", "mcdonalds", "burger king", "starbucks", 
          "usa", "nyc", "london", "pakistan", "uae", "dubai", "europe", "western", "brand history"
        ];
        
        const isPoison = poisonKeywords.some(word => caption.includes(word));
        
        // Strict Category-specific sanity check for Indian/Local focus
        const indianMarkers = ["india", "desi", "bharat", "indian", "festival", "bollywood", "city", "mumbai", "delhi", "bangalore", "pune", "lucknow"];
        const hasIndianContext = indianMarkers.some(marker => caption.includes(marker)) || hashtag.toLowerCase().includes("india");

        let isRelevant = !isPoison && hasIndianContext;
        
        if (!isRelevant) {
          console.log(`[Filter] Discarded non-Indian/irrelevant post for "${topic.title}": ${res.url}`);
          usedUrls.add(res.url); // Mark as used
          continue;
        }

        try {
          const improvedCaption = res.caption || `Verified creative reference for ${topic.title}.`;
          const aiMarketingNote = await generateAiMarketingNote(topic.title, improvedCaption);

          await TrendReference.create({
            topicId: topic.topicId,
            platform: "instagram",
            url: res.url,
            mediaType: res.mediaType,
            aiCaption: improvedCaption,
            aiMarketingNote,
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
    // NEW LOGIC: If no live references were found, generate the heavy Intelligence Fallback Report
    if (relevantCount === 0) {
      console.log(`[Scrape] No live references for "${topic.title}". Generating fallback intelligence...`);
      await generateFallbackIntelligence(topic.topicId);
      // Re-fetch topic to get the intelligenceReport from DB
      const updatedTopic = await TrendTopic.findOne({ topicId });
      if (updatedTopic) {
        updatedTopic.status = "ready";
        await updatedTopic.save();
      }
    } else {
      topic.status = "ready";
      await topic.save();
    }
    console.log(`[Scrape] Topic "${topic.title}" complete. references=${relevantCount}. Status: ready`);

  } catch (error) {
    console.error(`[Scrape] Critical failure for ${topicId}:`, error);
    topic.status = "ready";
    await topic.save();
  }
}
