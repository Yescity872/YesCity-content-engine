export interface ScoredReference {
  platform: string;
  url: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  score: number;
  decisions: {
    topicMatch: number;
    regionMatch: number;
    indiaRelevance: number;
    freshness: number;
    quality: number;
  };
  decision: "accept" | "reject";
}

/**
 * Smart Relevance Engine (Phase 7)
 * A deterministic scoring utility to filter and rank references.
 */
export function scoreReference(ref: any, topicContext: string, region: string = "IN"): ScoredReference {
  const topic = topicContext.toLowerCase();
  const title = (ref.title || "").toLowerCase();
  const description = (ref.description || "").toLowerCase();
  const text = `${title} ${description}`;
  
  let topicMatch = 0;
  let regionMatch = 0;
  let indiaRelevance = 0;
  let freshness = 0;
  let quality = 0;

  // 1. Topic Match (0-40 points)
  const topicTerms = topic.split(/\s+/).filter(t => t.length > 2);
  let termHits = 0;
  topicTerms.forEach(term => {
    if (text.includes(term)) termHits++;
  });
  topicMatch = topicTerms.length > 0 ? (termHits / topicTerms.length) * 40 : 20;

  // 2. Region Match (0-20 points)
  if (region === "IN") {
    const indiaTerms = ["india", "mumbai", "delhi", "bangalore", "desi", "local", "street", "indian", "bollywood", "cricket"];
    if (indiaTerms.some(term => text.includes(term))) {
      regionMatch = 20;
    }
  }

  // 3. India Relevance (0-15 points)
  // Check for currency or domain
  if (ref.url.includes(".in") || text.includes("₹") || text.includes("rs.") || text.includes("rupees")) {
    indiaRelevance = 15;
  }

  // 4. Freshness (0-15 points)
  const publishedAt = ref.publishedAt ? new Date(ref.publishedAt) : new Date();
  const daysOld = (new Date().getTime() - publishedAt.getTime()) / (1000 * 3600 * 24);
  if (daysOld < 7) freshness = 15;
  else if (daysOld < 30) freshness = 10;
  else if (daysOld < 90) freshness = 5;

  // 5. Quality (0-10 points)
  if (ref.thumbnailUrl) quality += 5;
  if (title.length > 10) quality += 5;

  const totalScore = topicMatch + regionMatch + indiaRelevance + freshness + quality;

  return {
    ...ref,
    score: totalScore,
    decisions: {
      topicMatch,
      regionMatch,
      indiaRelevance,
      freshness,
      quality
    },
    decision: totalScore >= 45 ? "accept" : "reject"
  };
}

/**
 * Filters and ranks a batch of references.
 */
export function filterAndRankReferences(refs: any[], topicContext: string, region: string = "IN"): any[] {
  const scored = refs
    .map(ref => scoreReference(ref, topicContext, region))
    .filter(res => res.decision === "accept")
    .sort((a, b) => b.score - a.score);

  // Deduplicate by URL
  const seenUrls = new Set<string>();
  const unique = [];
  for (const item of scored) {
    if (!seenUrls.has(item.url)) {
      unique.push(item);
      seenUrls.add(item.url);
    }
  }

  return unique;
}
