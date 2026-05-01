import CompetitorNewsCache from "@/models/CompetitorNewsCache";
import { connectToDatabase } from "@/lib/mongodb";

export interface SearchParams {
  competitorName: string;
  domain?: string;
  topic?: string;
  region?: string;
  lookbackDays?: number;
}

/**
 * Competitor News Adapter (Phase 4.1 Upgrade)
 * Cascading priority: RSS -> GNews -> NewsAPI.ai -> Mediastack
 */
export async function searchCompetitorNews(params: SearchParams) {
  const { competitorName, topic, region = "IN", lookbackDays = 7 } = params;
  await connectToDatabase();

  const normalizedComp = competitorName.toLowerCase().trim();
  const normalizedTopic = (topic || "").toLowerCase().trim();

  // 1. Check 24-hour cache
  const cached = await CompetitorNewsCache.findOne({
    normalizedCompetitor: normalizedComp,
    normalizedTopic: normalizedTopic,
    region,
    expiresAt: { $gt: new Date() }
  });

  if (cached && cached.sources.length > 0) {
    console.log(`[NewsAdapter] Serving cache for ${competitorName}`);
    return cached.sources;
  }

  // 2. Query Pipeline (Cascading Priority)
  let results: any[] = [];
  let sourceUsed = "None";

  // A. Google News RSS (Primary - Free/Vercel-Safe)
  results = await fetchGoogleNewsRSS(competitorName, topic);
  if (results.length > 0) {
    sourceUsed = "Google News RSS";
  }

  // B. GNews (First Backup)
  if (results.length < 2 && process.env.ENABLE_GNEWS === "true" && process.env.GNEWS_API_KEY) {
    const backup = await fetchGNews(competitorName, topic);
    if (backup.length > 0) {
      results = [...results, ...backup];
      sourceUsed = (sourceUsed === "None") ? "GNews" : `${sourceUsed} + GNews`;
    }
  }

  // C. NewsAPI.ai (Second Backup)
  if (results.length < 2 && process.env.ENABLE_NEWSAPI_AI === "true" && process.env.NEWSAPI_AI_KEY) {
    const backup = await fetchNewsApiAi(competitorName, topic);
    if (backup.length > 0) {
      results = [...results, ...backup];
      sourceUsed = (sourceUsed === "None") ? "NewsAPI.ai" : `${sourceUsed} + NewsAPI.ai`;
    }
  }

  // D. Mediastack (Emergency Third Backup)
  if (results.length < 2 && process.env.ENABLE_MEDIASTACK === "true" && process.env.MEDIASTACK_API_KEY) {
    const backup = await fetchMediastack(competitorName, topic);
    if (backup.length > 0) {
      results = [...results, ...backup];
      sourceUsed = (sourceUsed === "None") ? "Mediastack" : `${sourceUsed} + Mediastack`;
    }
  }

  // 3. Normalization & Deduplication
  const unique = deduplicateSources(results);

  // 4. Caching
  if (unique.length > 0) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await CompetitorNewsCache.findOneAndUpdate(
      { normalizedCompetitor: normalizedComp, normalizedTopic: normalizedTopic, region },
      {
        competitorName,
        normalizedCompetitor: normalizedComp,
        topic,
        normalizedTopic,
        region,
        lookbackDays,
        sources: unique,
        sourceUsed,
        expiresAt
      },
      { upsert: true }
    );
  }

  return unique;
}

async function fetchGoogleNewsRSS(competitor: string, topic?: string) {
  const query = topic ? `${competitor} ${topic}` : `${competitor} India travel campaign`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;

  try {
    const res = await fetch(url);
    const xml = await res.text();
    const items = xml.split("<item>").slice(1);
    return items.map(item => {
      const title = item.match(/<title>(.*?)<\/title>/)?.[1] || "Untitled";
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
      const source = item.match(/<source.*?>(.*?)<\/source>/)?.[1] || "Google News";
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || null;
      return {
        title: title.split(" - ")[0],
        url: link,
        source: source,
        publishedAt: pubDate,
        snippet: title,
        freshness: calculateFreshness(pubDate),
        type: "google-news-rss"
      };
    }).slice(0, 5);
  } catch (err) {
    console.error("[NewsAdapter] RSS Error:", err);
    return [];
  }
}

async function fetchNewsApiAi(competitor: string, topic?: string) {
  const apiKey = process.env.NEWSAPI_AI_KEY;
  if (!apiKey) return [];
  const query = topic ? `${competitor} ${topic}` : competitor;
  const url = `https://eventregistry.org/api/v1/article/getArticles?action=getArticles&keyword=${encodeURIComponent(query)}&articlesPage=1&articlesCount=5&articlesSortBy=date&resultType=articles&apiKey=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.articles || !data.articles.results) return [];
    return data.articles.results.map((art: any) => ({
      title: art.title,
      url: art.url,
      source: art.source?.title || "NewsAPI.ai",
      publishedAt: art.date,
      snippet: art.body ? art.body.substring(0, 150) + "..." : art.title,
      freshness: calculateFreshness(art.date),
      type: "news-api-ai"
    }));
  } catch (err) {
    console.error("[NewsAdapter] NewsAPI.ai Error:", err);
    return [];
  }
}

async function fetchGNews(competitor: string, topic?: string) {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return [];
  const query = topic ? `"${competitor}" ${topic}` : `"${competitor}"`;
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=in&max=5&apikey=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.articles) return [];
    return data.articles.map((art: any) => ({
      title: art.title,
      url: art.url,
      source: art.source?.name || "GNews",
      publishedAt: art.publishedAt,
      snippet: art.description,
      freshness: calculateFreshness(art.publishedAt),
      type: "gnews"
    }));
  } catch (err) {
    console.error("[NewsAdapter] GNews Error:", err);
    return [];
  }
}

async function fetchMediastack(competitor: string, topic?: string) {
  const apiKey = process.env.MEDIASTACK_API_KEY;
  if (!apiKey) return [];
  const query = topic ? `${competitor} ${topic}` : competitor;
  const url = `http://api.mediastack.com/v1/news?access_key=${apiKey}&keywords=${encodeURIComponent(query)}&countries=in&languages=en&limit=5`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.data) return [];
    return data.data.map((art: any) => ({
      title: art.title,
      url: art.url,
      source: art.source || "Mediastack",
      publishedAt: art.published_at,
      snippet: art.description,
      freshness: calculateFreshness(art.published_at),
      type: "mediastack"
    }));
  } catch (err) {
    console.error("[NewsAdapter] Mediastack Error:", err);
    return [];
  }
}

function calculateFreshness(dateStr: string | null): "recent" | "historical" | "undated" {
  if (!dateStr) return "undated";
  try {
    const date = new Date(dateStr);
    const diffDays = (new Date().getTime() - date.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 7 ? "recent" : "historical";
  } catch {
    return "undated";
  }
}

function deduplicateSources(sources: any[]) {
  const uniqueUrls = new Set();
  const uniqueTitles: string[] = [];
  
  return sources.filter(s => {
    // 1. URL Check
    if (s.url && uniqueUrls.has(s.url)) return false;
    if (s.url) uniqueUrls.add(s.url);

    // 2. Title Similarity Check (Simple)
    const normalizedTitle = s.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    // Check if a very similar title already exists
    const isDuplicate = uniqueTitles.some(existing => {
      const dist = levenshtein(normalizedTitle, existing);
      const similarity = 1 - dist / Math.max(normalizedTitle.length, existing.length);
      return similarity > 0.7; // 70% similarity threshold
    });

    if (isDuplicate) {
      // If we already have 2 similar ones, skip
      const similarCount = uniqueTitles.filter(existing => {
         const dist = levenshtein(normalizedTitle, existing);
         return (1 - dist / Math.max(normalizedTitle.length, existing.length)) > 0.7;
      }).length;
      
      if (similarCount >= 2) return false;
    }

    uniqueTitles.push(normalizedTitle);
    return true;
  });
}

function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}
