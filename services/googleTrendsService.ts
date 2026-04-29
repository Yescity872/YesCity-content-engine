// @ts-ignore
import googleTrends from "google-trends-api";
import DailyTrend from "@/models/DailyTrend";
import { connectToDatabase } from "@/lib/mongodb";
import Groq from "groq-sdk";
import { curatedTopicBank } from "@/data/curatedTopicBank";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

/**
 * Translates regional language trend titles into English.
 */
async function translateTrendTitles(trends: any[]) {
  try {
    const titles = trends.map(t => t.title);
    const systemPrompt = `Translate these Indian trending topics into professional, natural English.
Keep specific names of people or cities as they are.
Return ONLY a JSON object with key "translated" as an array of strings in the same order.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: JSON.stringify(titles) }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const translated = JSON.parse(completion.choices[0].message.content || "{}").translated || [];
    
    return trends.map((t, i) => ({
      ...t,
      title: translated[i] || t.title
    }));
  } catch (error) {
    console.warn("[GoogleTrends] Translation failed, using originals.");
    return trends;
  }
}

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
 * 1. getDailyTopTrends(country = "IN")
 */
export async function getDailyTopTrends(country = "IN") {
  await connectToDatabase();
  const dateKey = new Date().toISOString().split("T")[0];
  
  // A. Check for REAL cached data first
  const cachedReal = await DailyTrend.findOne({ dateKey, country, isFallback: false });
  if (cachedReal && cachedReal.trends?.length > 0) {
    console.log(`[GoogleTrends][Final] Serving real cached trends (${cachedReal.source})`);
    return { 
      trends: cachedReal.trends, 
      source: `Cached ${cachedReal.source.toUpperCase()}`, 
      count: cachedReal.trends.length,
      isFallback: false,
      success: true 
    };
  }

  // B. Try RSS (Primary)
  console.log(`[GoogleTrends][RSS] URL: https://trends.google.com/trending/rss?geo=${country}`);
  let rssTrends = await fetchDailyTrendsFromRSS(country);
  if (rssTrends && rssTrends.length > 0) {
    console.log(`[GoogleTrends][RSS] Translating ${rssTrends.length} titles...`);
    rssTrends = await translateTrendTitles(rssTrends);
    
    console.log(`[GoogleTrends][Final] Source: RSS | Count: ${rssTrends.length}`);
    await saveTrendsToCache(dateKey, country, rssTrends, "rss", false);
    return { 
      trends: rssTrends, 
      source: "Google Trends RSS", 
      count: rssTrends.length, 
      firstTrendTitle: rssTrends[0].title,
      isFallback: false,
      success: true 
    };
  }

  // C. Try Library (Secondary)
  console.log(`[GoogleTrends][Library] Attempting fallback to API library...`);
  let apiTrends = await fetchDailyTrendsFromLibrary(country);
  if (apiTrends && apiTrends.length > 0) {
    console.log(`[GoogleTrends][Library] Translating ${apiTrends.length} titles...`);
    apiTrends = await translateTrendTitles(apiTrends);

    console.log(`[GoogleTrends][Final] Source: API | Count: ${apiTrends.length}`);
    await saveTrendsToCache(dateKey, country, apiTrends, "google-trends-api", false);
    return { 
      trends: apiTrends, 
      source: "Google Trends API", 
      count: apiTrends.length, 
      isFallback: false,
      success: true 
    };
  }

  // D. Emergency AI Fallback (Tertiary) - NEVER CACHE AS PRIMARY
  console.log(`[GoogleTrends][Final] All real sources failed. Using Emergency AI Fallback.`);
  const aiTrends = await generateAIFallbackTrends();
  return { 
    trends: aiTrends, 
    source: "ai-fallback", 
    count: aiTrends.length, 
    isFallback: true,
    success: true 
  };
}

/**
 * Robust RSS Parser
 */
async function fetchDailyTrendsFromRSS(country: string): Promise<TrendItem[] | null> {
  try {
    const RSS_URL = `https://trends.google.com/trending/rss?geo=${country}`;
    const response = await fetch(RSS_URL);
    console.log(`[GoogleTrends][RSS] HTTP status: ${response.status}`);
    
    if (!response.ok) return null;

    const xmlData = await response.text();
    console.log(`[GoogleTrends][RSS] Raw XML length: ${xmlData.length}`);

    // Split by <item>
    const items = xmlData.split("<item>").slice(1);
    console.log(`[GoogleTrends][RSS] Parsed item count: ${items.length}`);

    const trends: TrendItem[] = [];
    for (const item of items) {
      const title = item.match(/<title>(.*?)<\/title>/)?.[1] || "";
      const traffic = item.match(/<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/)?.[1] || "Trending";
      
      // Extract news items
      const articles: any[] = [];
      const newsMatches = [...item.matchAll(/<ht:news_item>([\s\S]*?)<\/ht:news_item>/g)];
      for (const news of newsMatches) {
        articles.push({
          title: news[1].match(/<ht:news_item_title>(.*?)<\/ht:news_item_title>/)?.[1] || "Related Article",
          source: news[1].match(/<ht:news_item_source>(.*?)<\/ht:news_item_source>/)?.[1] || "Source",
          url: news[1].match(/<ht:news_item_url>(.*?)<\/ht:news_item_url>/)?.[1] || "#"
        });
      }

      if (title) {
        trends.push({
          title: decodeHtmlEntities(title),
          traffic,
          relatedQueries: [],
          relatedTopics: [],
          articles: articles.slice(0, 3),
          fetchedAt: new Date(),
          isFallback: false,
          sourceType: "rss"
        });
      }
    }

    console.log(`[GoogleTrends][RSS] Normalized trend count: ${trends.length}`);
    if (trends.length > 0) console.log(`[GoogleTrends][RSS] First trend: ${trends[0].title}`);
    
    return trends.length > 0 ? trends : null;
  } catch (e) {
    console.error("[GoogleTrends][RSS] Error:", e);
    return null;
  }
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
      isFallback: false,
      sourceType: "api"
    }));
  } catch (e) {
    return null;
  }
}

async function generateAIFallbackTrends(): Promise<TrendItem[]> {
  return [...curatedTopicBank]
    .sort(() => Math.random() - 0.5)
    .slice(0, 10)
    .map(c => ({
      title: c.title,
      traffic: "High Demand",
      relatedQueries: c.tags,
      relatedTopics: [],
      articles: [],
      fetchedAt: new Date(),
      isFallback: true,
      sourceType: "ai-fallback"
    }));
}

async function saveTrendsToCache(dateKey: string, country: string, trends: any[], source: string, isFallback: boolean) {
  if (!trends || trends.length === 0) return;
  await DailyTrend.findOneAndUpdate(
    { dateKey, country },
    { dateKey, country, source, isFallback, trends, updatedAt: new Date() },
    { upsert: true }
  );
}

/**
 * 2. getTrendDetails(keyword, country = "IN")
 */
export async function getTrendDetails(keyword: string, country = "IN") {
  const detail: any = { keyword, interestOverTime: [], interestByRegion: [], relatedQueries: [], relatedTopics: [] };
  
  const safeParse = (str: string) => {
    try {
      if (str.trim().startsWith("<")) return null;
      return JSON.parse(str);
    } catch (e) { return null; }
  };

  // 1. Try Live Google Data (Partial fail ok)
  try {
    const iot = await googleTrends.interestOverTime({ keyword, geo: country }).catch(() => null);
    if (iot) {
      const parsed = safeParse(iot);
      if (parsed) detail.interestOverTime = parsed.default?.timelineData || [];
    }

    const ibr = await googleTrends.interestByRegion({ keyword, geo: country }).catch(() => null);
    if (ibr) {
      const parsed = safeParse(ibr);
      if (parsed) detail.interestByRegion = parsed.default?.geoMapData || [];
    }
  } catch (e) {}

  // 2. Enrich with AI (ALWAYS provide strong content)
  const enrichment = await enrichTrendWithAI(keyword, detail);
  
  return {
    ...detail,
    ...enrichment,
    // Fill gaps if AI didn't return some fields
    relatedQueries: (detail.relatedQueries?.length > 0 ? detail.relatedQueries : enrichment.relatedQueries) || [],
    relatedTopics: (detail.relatedTopics?.length > 0 ? detail.relatedTopics : enrichment.relatedTopics) || []
  };
}

export async function enrichTrendWithAI(keyword: string, trendData: any) {
  try {
    const systemPrompt = `Analyze Google Trend: "${keyword}". 
You MUST provide high-fidelity marketing intelligence. No generic placeholders.

Return exactly this JSON structure:
{
  "explanation": "Detailed explanation of what is happening (2-3 sentences)",
  "whyTrending": "Specific reason why this is exploding in India right now",
  "yesCityAngle": "Strong marketing concept for a city discovery brand",
  "relatedQueries": ["query 1", "query 2", "query 3"],
  "relatedTopics": ["topic 1", "topic 2", "topic 3"],
  "platformQueries": {
    "instagram": ["reels", "hashtags"],
    "youtube": ["search terms"],
    "news": ["search phrases"]
  },
  "postIdeas": ["Detailed post idea 1", "Detailed post idea 2", "Detailed post idea 3"],
  "reelIdeas": ["POV reel idea 1", "Vlog style idea 2", "Interview idea 3"]
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: `Raw Data Context: ${JSON.stringify(trendData)}` }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content || "{}";
    return JSON.parse(content);
  } catch (error) {
    console.error("[GoogleTrends] AI Enrichment failed:", error);
    return {
      explanation: `Trending search for ${keyword} in India.`,
      whyTrending: "Increased local search volume across multiple regions.",
      yesCityAngle: "Focus on community engagement and city discovery around this theme.",
      relatedQueries: [`${keyword} today`, `${keyword} india`, `${keyword} meaning`],
      relatedTopics: ["Current Events", "India", "Social Trends"],
      platformQueries: { instagram: [keyword], youtube: [keyword], news: [keyword] },
      postIdeas: ["Top 5 things about " + keyword, "City reaction to " + keyword, "Community guide"],
      reelIdeas: ["POV: Living through " + keyword, "Quick facts", "Street vibe"]
    };
  }
}

export async function refreshDailyTrends(country = "IN") {
  const dateKey = new Date().toISOString().split("T")[0];
  // Only refresh if we want to force new RSS/API data
  await DailyTrend.deleteOne({ dateKey, country });
  return await getDailyTopTrends(country);
}
