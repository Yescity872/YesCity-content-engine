import { GroupedTrend } from "./trendGroupingService";

export interface ScoredTrend extends GroupedTrend {
  score: number;
  whyItMatters: string;
  yesCityAngle: string;
  classification: "direct" | "indirect" | "sensitive";
}

const SENSITIVE_KEYWORDS = ["war", "conflict", "death", "tragedy", "violence", "politics", "protest", "disaster", "border", "tensions"];
const TRAVEL_KEYWORDS = ["travel", "bali", "mountain", "beach", "hotel", "resort", "explore", "vacation", "trip", "destination", "culture", "festival", "sightseeing", "itinerary"];
const MEME_KEYWORDS = ["meme", "funny", "relatable", "humor", "joke", "viral", "pov", "expectation", "reality", "main character", "slang"];

export function scoreTrends(trends: any[]): ScoredTrend[] {
  return trends.map((trend) => {
    let score = 0;
    const rawTitle = trend.title;
    let conceptTitle = rawTitle;

    // 1. Concept Refinement (Hashtag to Concept)
    const conceptMap: Record<string, string> = {
      "maincharacter": "Main Character Energy",
      "expectationvsreality": "Expectation vs Reality",
      "airportfit": "Airport Fit Check",
      "coldplay": "Concert Travel Rush",
      "aiyearbook": "AI Yearbook Trend",
      "streetfood": "Street Food Challenge",
      "hiddengems": "Hidden Gem Discovery",
      "asmr": "ASMR Travel Experience",
      "pov": "POV Travel Perspective"
    };
    
    if (conceptMap[rawTitle.toLowerCase()]) {
      conceptTitle = conceptMap[rawTitle.toLowerCase()];
    }

    const captionLower = trend.posts.map((p: any) => p.caption.toLowerCase()).join(" ");
    const hashtags = trend.hashtags.map((h: string) => h.toLowerCase());
    const fullText = `${conceptTitle.toLowerCase()} ${captionLower} ${hashtags.join(" ")}`;

    // 2. Brand Safety / Sensitivity Check (MANDATORY OVERRIDE)
    const isSensitive = SENSITIVE_KEYWORDS.some(kw => fullText.includes(kw));
    
    // 3. Scoring Weights
    score += 30; // Base virality
    const totalLikes = trend.posts.reduce((sum: number, p: any) => sum + (p.engagement?.likes || 0), 0);
    const avgLikes = totalLikes / trend.posts.length;
    if (avgLikes > 50000) score += 30;
    else if (avgLikes > 10000) score += 15;

    const isDirectTravel = TRAVEL_KEYWORDS.some(kw => fullText.includes(kw));
    if (isDirectTravel) score += 20;

    const isAdaptable = MEME_KEYWORDS.some(kw => fullText.includes(kw));
    if (isAdaptable) score += 20;

    // Classification
    let classification: "direct" | "indirect" | "sensitive" = "indirect";
    if (isSensitive) classification = "sensitive";
    else if (isDirectTravel) classification = "direct";

    // Why it matters logic
    let whyItMatters = "";
    if (isSensitive) {
      whyItMatters = "Critical global news/event. Impacting public safety and information flow.";
    } else if (isDirectTravel) {
      whyItMatters = "High travel intent. People are actively exploring destinations and experiences.";
    } else if (isAdaptable) {
      whyItMatters = "Viral cultural format. Relatable and easily adaptable for creative marketing.";
    } else {
      whyItMatters = "Broad viral interest. Significant attention across digital platforms.";
    }

    // YesCity Angle (Strict Safety Override)
    let yesCityAngle = "";
    if (isSensitive) {
      yesCityAngle = "Provide a travel advisory, safety awareness update, or responsible city update for Indian travelers.";
    } else if (isDirectTravel) {
      yesCityAngle = `Connect this to a hidden gem in India (e.g., "The Bali of India in Gokarna").`;
    } else if (conceptTitle.includes("Expectation")) {
      yesCityAngle = "Show the Expectation vs Reality of a popular Indian city weekend getaway.";
    } else if (conceptTitle.includes("Main Character")) {
      yesCityAngle = "POV: Exploring the heritage old-city streets of Jaipur or Varanasi as the main character.";
    } else if (conceptTitle.includes("Airport")) {
      yesCityAngle = "Airport fit check and travel essentials for your next Indian city hop.";
    } else if (conceptTitle.includes("Concert")) {
      yesCityAngle = "The ultimate guide to planning a city trip around major Indian concerts or festivals.";
    } else {
      yesCityAngle = "Adapt this viral format to showcase a unique city experience or local culture in India.";
    }

    return {
      ...trend,
      title: conceptTitle,
      score,
      classification,
      whyItMatters,
      yesCityAngle
    };
  }).sort((a, b) => b.score - a.score);
}
