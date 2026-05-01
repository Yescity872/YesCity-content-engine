// @ts-ignore
import googleTrends from "google-trends-api";
import DailyTrend from "@/models/DailyTrend";
import { connectToDatabase } from "@/lib/mongodb";
import { aiRouter } from "./ai/aiRouter";
import { curatedTopicBank } from "@/data/curatedTopicBank";
import { expandTopicIntelligence } from "./topicExpansionService";
import TrendReference from "@/models/TrendReference";
import { getLiveReferencesForTopic } from "./liveReferenceService";
import TrendTopic from "@/models/TrendTopic";
import { getXResearchSuggestions } from "./sourceAdapters/xAdapter";
import { getLinkedInResearchSuggestions } from "./sourceAdapters/linkedinAdapter";
import { getCompetitorAnalysisForTrend } from "./competitorInsightService";

export interface TrendItem {
  title: string;
  traffic: string;
  relatedQueries: string[];
  relatedTopics: string[];
  articles: Array<{ title: string; source: string; url: string }>;
  fetchedAt: Date;
  isFallback: boolean;
  sourceType?: string;
}

/**
 * PHASE 1.5: getDailyTopTrends(country = "IN")
 * 
 * STRICT PRIORITY:
 * 1. LIVE RSS (Primary)
 * 2. LIVE API (Secondary)
 * 3. CACHED REAL DATA (Tertiary - up to 48h old)
 * 4. EMERGENCY AI SUGGESTIONS (Last Resort - separated in UI)
 */
export async function getDailyTopTrends(country = "IN") {
  await connectToDatabase();
  const dateKey = new Date().toISOString().split("T")[0];
  
  // 1. Try LIVE RSS (Primary)
  console.log(`[GoogleTrends] Attempting RSS fetch...`);
  const rssTrends = await fetchDailyTrendsFromRSS(country);
  if (rssTrends && rssTrends.length > 0) {
    console.log(`[GoogleTrends] RSS success`);
    console.log(`[GoogleTrends] Count: ${rssTrends.length}`);
    console.log(`[GoogleTrends] First trend: ${rssTrends[0].title}`);
    await saveTrendsToCache(dateKey, country, rssTrends, "rss", false);
    console.log(`[GoogleTrends] Cache stored`);
    return { trends: rssTrends, source: "Google Trends RSS", isFallback: false, success: true, dateKey };
  }

  // 2. Try LIVE API (Secondary)
  console.log(`[GoogleTrends] RSS failed. Attempting API fallback...`);
  const apiTrends = await fetchDailyTrendsFromLibrary(country);
  if (apiTrends && apiTrends.length > 0) {
    console.log(`[GoogleTrends] API success`);
    console.log(`[GoogleTrends] Count: ${apiTrends.length}`);
    console.log(`[GoogleTrends] First trend: ${apiTrends[0].title}`);
    await saveTrendsToCache(dateKey, country, apiTrends, "google-trends-api", false);
    console.log(`[GoogleTrends] Cache stored`);
    return { trends: apiTrends, source: "Google Trends API", isFallback: false, success: true, dateKey };
  }

  // 3. Try CACHED REAL DATA (Tertiary)
  console.log(`[GoogleTrends] All live sources failed. Checking cache...`);
  const cachedReal = await DailyTrend.findOne({ country, isFallback: false }).sort({ dateKey: -1 });
  if (cachedReal && cachedReal.trends?.length > 0) {
    console.log(`[GoogleTrends] Cache success`);
    console.log(`[GoogleTrends] Count: ${cachedReal.trends.length}`);
    console.log(`[GoogleTrends] First trend: ${cachedReal.trends[0].title}`);
    console.log(`[GoogleTrends] Source: Cached (${cachedReal.dateKey})`);
    return { 
      trends: cachedReal.trends, 
      source: `Cached Google Trends (${cachedReal.dateKey})`, 
      isFallback: false, 
      success: true, 
      dateKey: cachedReal.dateKey 
    };
  }

  // 4. EMERGENCY AI SUGGESTIONS (Last Resort)
  console.log(`[GoogleTrends] Fallback triggered: Activating AI Synthesis`);
  const aiTrends = await generateAIFallbackTrends();
  console.log(`[GoogleTrends] AI success`);
  console.log(`[GoogleTrends] Count: ${aiTrends.length}`);
  return { 
    trends: aiTrends, 
    source: "AI Suggested Ideas", 
    isFallback: true, 
    success: true, 
    dateKey 
  };
}

/**
 * Compatibility wrapper for Discovery Engine
 */
export async function fetchGoogleTrendSignals(country = "IN"): Promise<TrendItem[]> {
  const result = await getDailyTopTrends(country);
  return result.trends || [];
}


/**
 * RSS Parser with Strict Validation
 */
async function fetchDailyTrendsFromRSS(country: string): Promise<TrendItem[] | null> {
  try {
    const RSS_URL = `https://trends.google.com/trending/rss?geo=${country}`;
    const response = await fetch(RSS_URL);
    if (!response.ok) {
      console.log(`[GoogleTrends][RSS] HTTP Error: ${response.status}`);
      return null;
    }

    const xmlData = await response.text();
    const items = xmlData.split("<item>").slice(1);
    
    if (items.length === 0) {
      console.log(`[GoogleTrends][RSS] Validation Failed: Zero items in feed.`);
      return null;
    }

    const trends: TrendItem[] = [];
    for (const item of items) {
      const titleMatch = item.match(/<title>(.*?)<\/title>/);
      const trafficMatch = item.match(/<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/);
      
      const title = titleMatch ? decodeHtmlEntities(titleMatch[1]) : "";
      const traffic = trafficMatch ? trafficMatch[1] : "Trending";
      
      // Strict: A trend without a title is invalid
      if (!title || title.length < 2) continue;

      const articles: any[] = [];
      const newsMatches = [...item.matchAll(/<ht:news_item>([\s\S]*?)<\/ht:news_item>/g)];
      for (const news of newsMatches) {
        articles.push({
          title: decodeHtmlEntities(news[1].match(/<ht:news_item_title>(.*?)<\/ht:news_item_title>/)?.[1] || "Related Story"),
          source: decodeHtmlEntities(news[1].match(/<ht:news_item_source>(.*?)<\/ht:news_item_source>/)?.[1] || "News"),
          url: news[1].match(/<ht:news_item_url>(.*?)<\/ht:news_item_url>/)?.[1] || "#"
        });
      }

      trends.push({
        title,
        traffic,
        relatedQueries: [],
        relatedTopics: [],
        articles: articles.slice(0, 3),
        fetchedAt: new Date(),
        isFallback: false
      });
    }

    return trends.length > 0 ? trends : null;
  } catch (e) {
    console.error("[GoogleTrends][RSS] Error:", e);
    return null;
  }
}

/**
 * Hardened Trend Detail (Intelligence Modal)
 */
export async function getTrendDetails(keyword: string, country = "IN") {
  const detail: any = { 
    keyword, 
    interestOverTime: [], 
    interestByRegion: [], 
    relatedQueries: [], 
    relatedTopics: [],
    source: "Live Intelligence"
  };
  
  const safeParse = (str: string) => {
    try {
      if (str.trim().startsWith("<")) return null;
      return JSON.parse(str);
    } catch (e) { return null; }
  };

  // 1. Fetch Real Signal Charts
  try {
    const [iot, ibr, rq, rt] = await Promise.all([
      googleTrends.interestOverTime({ keyword, geo: country }).catch(() => null),
      googleTrends.interestByRegion({ keyword, geo: country }).catch(() => null),
      googleTrends.relatedQueries({ keyword, geo: country }).catch(() => null),
      googleTrends.relatedTopics({ keyword, geo: country }).catch(() => null)
    ]);

    if (iot) {
      const p = safeParse(iot);
      if (p) detail.interestOverTime = p.default?.timelineData || [];
    }
    if (ibr) {
      const p = safeParse(ibr);
      if (p) detail.interestByRegion = p.default?.geoMapData || [];
    }
    if (rq) {
      const p = safeParse(rq);
      if (p) detail.relatedQueries = p.default?.rankedList?.[0]?.rankedKeyword?.map((k: any) => k.query) || [];
    }
    if (rt) {
      const p = safeParse(rt);
      if (p) detail.relatedTopics = p.default?.rankedList?.[0]?.rankedKeyword?.map((k: any) => k.topic.title) || [];
    }
  } catch (e) {
    console.warn("[GoogleTrends] Signal extraction partial fail.");
  }

  // 2. AI Enrichment (MANDATORY High-Fidelity)
  // Optimization: Trim chart data to stay within Token Limits
  const trimmedData = {
    keyword: detail.keyword,
    relatedQueries: detail.relatedQueries?.slice(0, 5),
    relatedTopics: detail.relatedTopics?.slice(0, 5)
  };

  const enrichment = await enrichTrendWithAI(keyword, trimmedData);
  
  // 3. PHASE 2: Topic Expansion Engine
  const expansion = await expandTopicIntelligence(keyword, "Daily Trend", country);
  
    // 4. PHASE 3: Live Reference Engine
    let references = await TrendReference.find({ 
      topic: keyword, 
      expiresAt: { $gt: new Date() } 
    });

    // Shuffle and limit to 6 for UI diversity
    references = references.sort(() => Math.random() - 0.5).slice(0, 6);

    // If no fresh references, trigger a background scrape (fire and forget for this request)
    if (references.length === 0) {
      console.log(`[GoogleTrends] No references for "${keyword}". Triggering background live search...`);
      getLiveReferencesForTopic({
        topicId: `daily_${keyword.replace(/\s+/g, '_')}_${new Date().getTime()}`,
        topic: keyword,
        category: "Daily Trend",
        topicExpansion: expansion
      }).catch(err => console.error("[GoogleTrends] Background ref search failed:", err));
    }
  
  return {
    ...detail,
    ...enrichment,
    relatedQueries: (detail.relatedQueries?.length > 0 ? detail.relatedQueries : enrichment.relatedQueries) || [],
    relatedTopics: (detail.relatedTopics?.length > 0 ? detail.relatedTopics : enrichment.relatedTopics) || [],
    platformQueries: { 
      instagram: expansion?.instagramHashtags || enrichment.platformQueries?.instagram || [],
      youtube: expansion?.youtubeQueries || enrichment.platformQueries?.youtube || [],
      news: expansion?.newsQueries || enrichment.platformQueries?.news || [],
      x: expansion?.xQueries || [],
      linkedin: expansion?.linkedinQueries || []
    },
    topicExpansion: expansion,
    references: references, // Pass existing references to UI
    researchSuggestions: {
      x: await getXResearchSuggestions(keyword),
      linkedin: await getLinkedInResearchSuggestions(keyword)
    },
    competitorAnalysis: await getCompetitorAnalysisForTrend(keyword, country)
  };
}

/**
 * Force refresh the trends (used by the Sync button)
 */
export async function refreshDailyTrends(country = "IN") {
  // getDailyTopTrends already prioritizes live data, so we can just call it
  return await getDailyTopTrends(country);
}

export async function enrichTrendWithAI(keyword: string, trendData: any) {
  const systemPrompt = `You are a YesCity production strategist.
MISSION: Convert this trend into high-velocity content for Indian city discovery (food, travel, culture, events).
VOICE: Premium, insider-focused, deeply local. NEVER generic facts.

Return exactly this JSON:
{
  "explanation": "2-3 sentences on what this is and why it's trending in India.",
  "whyTrending": "Cultural or news trigger.",
  "yesCityAngle": "Specific content strategy connecting this to local discovery.",
  "relatedQueries": ["term 1", "term 2"],
  "relatedTopics": ["topic 1", "topic 2"],
  "platformQueries": { "instagram": ["#1"], "youtube": ["search 1"], "news": ["search 1"] },
  "postIdeas": [{ "title": "...", "concept": "...", "hook": "...", "whyItWorks": "...", "caption": "...", "cta": "...", "sceneBreakdown": ["..."], "aiPrompt": "..." }],
  "reelIdeas": [{ "title": "...", "concept": "...", "hook": "...", "format": "...", "whyItWorks": "...", "caption": "...", "cta": "...", "sceneBreakdown": ["..."], "aiPrompt": "..." }],
  "strategicRec": "Expert tip."
}`;

  console.log(`[GoogleTrends] Requesting enrichment for: ${keyword}...`);

  const response = await aiRouter.generateStructured({
    purpose: "dailyTrendAnalysis",
    systemPrompt: systemPrompt,
    userPrompt: `Trend Data Context: ${JSON.stringify(trendData)}`,
    inputForCache: { keyword, trendData: JSON.stringify(trendData).slice(0, 500) }
  });

  return response;
}

/**
 * Cache Rules: Preserve Real Data
 */
async function saveTrendsToCache(dateKey: string, country: string, trends: any[], source: string, isFallback: boolean) {
  if (!trends || trends.length === 0) return;
  
  // NEVER overwrite a Real Cache with a Fallback Cache for the same day
  if (isFallback) {
    const existing = await DailyTrend.findOne({ dateKey, country });
    if (existing && !existing.isFallback) {
      console.log(`[Cache] Protecting Real data. Skipping fallback cache write.`);
      return;
    }
  }

  await DailyTrend.findOneAndUpdate(
    { dateKey, country },
    { dateKey, country, source, isFallback, trends, updatedAt: new Date() },
    { upsert: true }
  );
}

function decodeHtmlEntities(text: string) {
  return text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

async function fetchDailyTrendsFromLibrary(country: string): Promise<TrendItem[] | null> {
  try {
    const results = await googleTrends.dailyTrends({ trendDate: new Date(), geo: country });
    if (results.trim().startsWith("<")) return null;
    const parsed = JSON.parse(results);
    const dayData = parsed.default.trendingSearchesDays?.[0];
    if (!dayData) return null;
    return dayData.trendingSearches.map((t: any) => ({
      title: t.title.query,
      traffic: t.formattedTraffic,
      relatedQueries: t.relatedQueries.map((rq: any) => rq.query),
      relatedTopics: [],
      articles: t.articles.map((a: any) => ({ title: a.title, source: a.source, url: a.url })),
      fetchedAt: new Date(),
      isFallback: false
    }));
  } catch (e) { return null; }
}

async function generateAIFallbackTrends(): Promise<TrendItem[]> {
  return [...curatedTopicBank].sort(() => Math.random() - 0.5).slice(0, 10).map(c => ({
    title: c.title,
    traffic: "High Demand",
    relatedQueries: c.tags,
    relatedTopics: [],
    articles: [],
    fetchedAt: new Date(),
    isFallback: true
  }));
}
