import { connectToDatabase } from "@/lib/mongodb";
import TrendReference, { ITrendReference } from "@/models/TrendReference";
import { searchYouTubeReferences, YouTubeReference } from "./youtubeTrendService";
import { scrapeWithPicuki } from "./sourceAdapters/instagramPicukiAdapter";
import { scrapeWithSnapscrape } from "./sourceAdapters/instagramSnapscrapeAdapter";
import { scrapeWithInstaTouch, InstagramScrapedReference } from "./sourceAdapters/instagramInstaTouchAdapter";
import { scrapeWebNews, WebScrapedReference } from "./sourceAdapters/webNewsAdapter";
import { aiRouter } from "./ai/aiRouter";
import { filterAndRankReferences } from "./relevanceEngine";

interface LiveReferenceInput {
  topicId: string;
  topic: string;
  category: string;
  region?: string;
  topicExpansion?: any;
}

/**
 * Orchestrates the Live Reference Engine priority chain.
 */
export async function getLiveReferencesForTopic(input: LiveReferenceInput): Promise<ITrendReference[]> {
  const { topicId, topic, category, region = "IN", topicExpansion } = input;
  
  await connectToDatabase();

  // 1. Check Cache (Reduced to 4 hours for better variety)
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
  const existing = await TrendReference.find({ 
    topicId, 
    createdAt: { $gt: fourHoursAgo } 
  });
  
  // Only use cache if we have enough results
  if (existing.length >= 4) {
    console.log(`[LiveRefs] Cache HIT for topic: ${topicId}`);
    return existing.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0)).slice(0, 5);
  }

  console.log(`[LiveRefs] Cache MISS. Fetching fresh references for: ${topic}`);
  const allReferences: any[] = [];
  const usedUrls = new Set<string>();

  // 2. Fetch YouTube & Web (Priority Sources)
  const youtubeQueries = topicExpansion?.youtubeQueries || [topic];
  const ytResults = await Promise.all(
    youtubeQueries.slice(0, 2).map((q: string) => searchYouTubeReferences(topic, [q], region).catch(() => []))
  );
  const webResults = await scrapeWebNews(topic, category).catch(() => []);

  // Add YT & Web to collection
  [...ytResults.flat(), ...webResults].forEach(res => {
    if (res && res.url && !usedUrls.has(res.url)) {
      allReferences.push(res);
      usedUrls.add(res.url);
    }
  });

  // 3. Relevance Scoring & Selection (Targeted Mix)
  // Sort by score first
  const scoredRefs = filterAndRankReferences(allReferences, topic, region);
  
  const youtubeRefs = scoredRefs.filter(r => r.platform === "youtube").slice(0, 4);
  const webRefs = scoredRefs.filter(r => r.platform === "web").slice(0, 2);

  const selectedRefs = [...youtubeRefs, ...webRefs];
  const validReferences: ITrendReference[] = [];
  
  for (const ref of selectedRefs) {
    try {
      const aiNote = await generateAiMarketingNote(topic, ref);
      
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const saved = await TrendReference.findOneAndUpdate(
        { url: ref.url },
        {
          ...ref,
          topicId,
          topic,
          relevanceScore: ref.score,
          aiMarketingNote: aiNote,
          expiresAt
        },
        { upsert: true, new: true }
      );
      validReferences.push(saved);
    } catch (err) {
      console.error(`[LiveRefs] Failed to save/note reference: ${ref.url}`, err);
    }
  }

  // 4. Final Result set (Deduplicated and Sorted)
  const results = validReferences
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

  return results;
}

/**
 * Generates an AI Marketing Note using the AI Router.
 */
async function generateAiMarketingNote(topic: string, ref: YouTubeReference | InstagramScrapedReference | WebScrapedReference): Promise<string> {
  try {
    const result = await aiRouter.generateStructured({
      purpose: "trendDetail",
      systemPrompt: "You are a YesCity production strategist. Explain how this reference inspires content. Focus on visual hooks and local angles. Return ONLY JSON in this format: { \"instruction\": \"3-sentence strategy\" }. Do not include any other text.",
      userPrompt: `Topic: ${topic}\nReference Title: ${ref.title || "Social Media Post"}\nReference Context: ${ref.description || "N/A"}`,
      inputForCache: { topic, url: ref.url }
    });
    
    return result.instruction || result.note || "Adapt this creative format to showcase local city culture.";
  } catch (err) {
    return "Adapt this viral format to showcase a unique city experience.";
  }
}
