import { connectToDatabase } from "@/lib/mongodb";
import TrendReference, { ITrendReference } from "@/models/TrendReference";
import { searchYouTubeReferences, YouTubeReference } from "./youtubeTrendService";
import { scrapeWithPicuki } from "./sourceAdapters/instagramPicukiAdapter";
import { scrapeWithPuppeteer } from "./sourceAdapters/instagramPuppeteerAdapter";
import { scrapeWithSnapscrape } from "./sourceAdapters/instagramSnapscrapeAdapter";
import { scrapeWithInstaTouch, InstagramScrapedReference } from "./sourceAdapters/instagramInstaTouchAdapter";
import { scrapeWebNews, WebScrapedReference } from "./sourceAdapters/webNewsAdapter";
import { aiRouter } from "./ai/aiRouter";

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

  // 1. Check Cache
  const existing = await TrendReference.find({ 
    topicId, 
    expiresAt: { $gt: new Date() } 
  });
  
  if (existing.length >= 3) {
    console.log(`[LiveRefs] Cache HIT for topic: ${topicId}`);
    return existing;
  }

  console.log(`[LiveRefs] Cache MISS. Fetching fresh references for: ${topic}`);
  const allReferences: any[] = [];
  const usedUrls = new Set<string>();

  // 3. Parallel Search Chain (YouTube + Instagram + Web)
  console.log(`[LiveRefs] Launching parallel adapters for: ${topic}`);
  
  const igTags = topicExpansion?.instagramHashtags || [`#${topic.replace(/\s+/g, '')}`];
  const youtubeQueries = topicExpansion?.youtubeQueries || [topic];

  // We run the top-tier adapters in parallel
  const searchPromises = [
    searchYouTubeReferences(topic, youtubeQueries, region).catch(() => []),
    scrapeWithPicuki(igTags[0], 3).catch(() => []), // Picuki is our best IG bet
    scrapeWebNews(topic, category).catch(() => [])
  ];

  const results = await Promise.all(searchPromises);
  
  for (const batch of results) {
    for (const res of batch) {
      if (!usedUrls.has(res.url)) {
        allReferences.push(res);
        usedUrls.add(res.url);
      }
    }
  }

  // 4. Secondary Fallbacks (only if still empty)
  if (allReferences.length < 2) {
    console.log(`[LiveRefs] Low results. Trying Puppeteer fallback...`);
    const puppeteerResults = await scrapeWithPuppeteer(igTags[0], 3).catch(() => []);
    for (const res of puppeteerResults) {
      if (!usedUrls.has(res.url)) {
        allReferences.push(res);
        usedUrls.add(res.url);
      }
    }
  }

  // 5. Relevance Scoring & AI Note Generation
  const validReferences: any[] = [];
  
  for (const ref of allReferences) {
    const score = calculateRelevanceScore(ref, topic, region);
    if (score >= 50) { // Threshold
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
            relevanceScore: score,
            aiMarketingNote: aiNote,
            expiresAt
          },
          { upsert: true, new: true }
        );
        validReferences.push(saved);
      } catch (err) {
        console.error(`[LiveRefs] Failed to save/note reference: ${ref.url}`, err);
      }
    } else {
      console.log(`[LiveRefs] Discarded low-score reference: ${ref.url} (Score: ${score})`);
    }

    if (validReferences.length >= 8) break; // Cap
  }

  return validReferences;
}

/**
 * Simple relevance scoring logic.
 */
function calculateRelevanceScore(ref: any, topic: string, region: string): number {
  let score = 50; // Base
  
  const textToAnalyze = `${ref.title || ""} ${ref.description || ""}`.toLowerCase();
  const topicTerms = topic.toLowerCase().split(" ");
  
  // Topic Match
  let matchCount = 0;
  for (const term of topicTerms) {
    if (textToAnalyze.includes(term)) matchCount++;
  }
  score += (matchCount / topicTerms.length) * 30;

  // Region Match
  if (region === "IN") {
    const indiaTerms = ["india", "mumbai", "delhi", "bangalore", "desi", "local", "street", "food"];
    if (indiaTerms.some(term => textToAnalyze.includes(term))) score += 15;
  }

  // Quality Penalty
  if (!ref.thumbnailUrl) score -= 20;
  if (!ref.title && !ref.description) score -= 30;

  return Math.min(100, Math.max(0, score));
}

/**
 * Generates an AI Marketing Note using the AI Router.
 */
async function generateAiMarketingNote(topic: string, ref: any): Promise<string> {
  try {
    const result = await aiRouter.generateStructured({
      purpose: "trendDetail",
      systemPrompt: "You are a YesCity production strategist. Explain exactly how this external reference (YouTube/IG/Web) can inspire a YesCity content package for an Indian city guide. Focus on the visual hook, editing style, or local angle.",
      userPrompt: `Topic: ${topic}\nReference Title: ${ref.title || "Social Media Post"}\nReference Context: ${ref.description || "N/A"}`,
      inputForCache: { topic, url: ref.url }
    });
    
    return result.instruction || result.note || "Adapt this creative format to showcase local city culture.";
  } catch (err) {
    return "Adapt this viral format to showcase a unique city experience.";
  }
}
