import { connectToDatabase } from "@/lib/mongodb";
import TopicExpansion from "@/models/TopicExpansion";
import { aiRouter } from "./ai/aiRouter";

function normalize(topic: string): string {
  return topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const FALLBACK_EXPANSION = {
  instagramHashtags: ["#IndiaContent", "#TrendingNow", "#DiscoverIndia"],
  youtubeQueries: ["Latest trends in India", "What is trending today"],
  googleTrendQueries: ["India trending news", "Current events India"],
  newsQueries: ["India news", "Top stories India"],
  xQueries: ["#India", "Trending in India"],
  linkedinQueries: ["Indian market trends", "Industry insights India"],
  competitorKeywords: ["India content strategy", "Regional trends"],
  localAngles: ["Impact on local communities", "Regional perspectives"],
  contentFormats: ["Short-form video", "Quick news updates", "Local guides"],
};

export async function expandTopicIntelligence(topic: string, category: string, region = "IN", forceRefresh = false) {
  try {
    await connectToDatabase();
    const normalizedTopic = normalize(topic);
    
    const systemPrompt = `You are a localized Indian social media strategist and SEO expert.
Your goal is to take a given topic, category, and region, and expand it into a comprehensive, highly localized set of search queries and content angles.

MANDATORY RULES:
1. STRICTLY focus on India and regional nuances (YesCity relevance).
2. Prefer local Indian cities, tier-2 cities, local travel, food, festivals, and culture.
3. AVOID generic global keywords (e.g., "#travel", "#food"). Use specific local versions (e.g., "#DelhiStreetFood", "#JaipurCafeHopping").
4. DIVERSITY: If a topic is broad (like "Festivals"), ensure hashtags and queries cover DIFFERENT sub-topics (e.g., for festivals, include Holi, Eid, Ganesh Chaturthi, etc., not just Diwali).
5. Output must be realistic search phrases and hashtags that users actually use.

You must return ONLY a JSON object with the following exact keys and string array values:
{
  "instagramHashtags": ["5-7 highly specific, localized hashtags"],
  "youtubeQueries": ["3-5 long-tail youtube search queries"],
  "googleTrendQueries": ["3-5 high-intent google search queries"],
  "newsQueries": ["3-5 editorial news search queries"],
  "xQueries": ["3-5 trending discussion queries or hashtags for Twitter/X"],
  "linkedinQueries": ["2-3 professional, B2B, or industry-focused queries"],
  "competitorKeywords": ["3-5 keywords competitors might bid on or target"],
  "localAngles": ["3 specific local cultural angles or perspectives to cover"],
  "contentFormats": ["3 best content formats to execute this (e.g., '60s POV Reel', 'Carousel Guide')"]
}`;

    console.log(`[TopicExpansion] Requesting expansion for: ${topic}...`);
    
    const aiResponse = await aiRouter.generateStructured({
      purpose: "topicExpansion",
      systemPrompt: systemPrompt,
      userPrompt: `Topic: ${topic}\nCategory: ${category}\nRegion: ${region}`,
      inputForCache: { topic, category, region }
    });

    if (!aiResponse) {
        console.warn(`[TopicExpansion] AI Router failed for ${topic}.`);
        return null;
    }

    // Validate expected structure briefly
    const resultData = {
      instagramHashtags: aiResponse.instagramHashtags || [],
      youtubeQueries: aiResponse.youtubeQueries || [],
      googleTrendQueries: aiResponse.googleTrendQueries || [],
      newsQueries: aiResponse.newsQueries || [],
      xQueries: aiResponse.xQueries || [],
      linkedinQueries: aiResponse.linkedinQueries || [],
      competitorKeywords: aiResponse.competitorKeywords || [],
      localAngles: aiResponse.localAngles || [],
      contentFormats: aiResponse.contentFormats || [],
    };

    // Save to cache (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await TopicExpansion.findOneAndUpdate(
      { normalizedTopic, region, category },
      {
        topic,
        normalizedTopic,
        category,
        region,
        data: resultData,
        source: "groq",
        expiresAt,
      },
      { upsert: true }
    );

    return {
      ...resultData,
      source: "groq",
    };
  } catch (error) {
    console.error(`[TopicExpansion] Critical failure expanding topic ${topic}:`, error);
    return null;
  }
}
