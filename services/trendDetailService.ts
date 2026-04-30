import { connectToDatabase } from "@/lib/mongodb";
import TrendTopic from "@/models/TrendTopic";
import TrendReference from "@/models/TrendReference";
import TrendDetail from "@/models/TrendDetail";
import { aiRouter } from "./ai/aiRouter";

/**
 * Generates or retrieves detailed trend analysis and content ideas.
 */
export async function getOrCreateTrendDetail(topicId: string): Promise<any> {
  await connectToDatabase();

  // 1. Check cache
  const existing = await TrendDetail.findOne({ topicId });
  if (existing) {
    const topic = await TrendTopic.findOne({ topicId });
    if (topic) {
      const { expandTopicIntelligence } = await import("./topicExpansionService");
      const expansion = await expandTopicIntelligence(topic.title, topic.category, "IN");
      return {
        ...existing.toObject(),
        topicExpansion: expansion
      };
    }
    return existing;
  }

  // 2. Fetch context
  const topic = await TrendTopic.findOne({ topicId });
  if (!topic) throw new Error("Topic not found");

  const references = await TrendReference.find({ topicId });
  const referenceCaptions = references.map(r => r.aiCaption).join(" | ");

  // 3. AI Generation
  console.log(`[TrendDetail] Generating AI analysis for "${topic.title}"...`);
  
  const systemPrompt = `You are the Lead Creative Director for YesCity.
YesCity is a premium city-discovery and brand storytelling agency. 
Your goal is to transform raw trends into "YesCity-style" content concepts.

CRITICAL IDENTITY RULES:
1. NEVER suggest generic lifestyle advice (e.g., "how to be happy").
2. ALWAYS tie the trend to local city exploration (Food, Shopping, Hidden Gems, Local Events, Cultural Nuances).
3. THEME: "Discovering your city through this trend."

Topic: ${topic.title}
Category: ${topic.category}
Context: ${topic.contextSummary}

Return a JSON object:
{
  "aiAnalysis": {
    "whatItIs": "Deep explanation of the trend in the Indian context",
    "whyTrending": "The specific cultural or social trigger",
    "howPeopleUsing": "Current social media patterns",
    "brandSafetyNote": "Safety for premium brands",
    "yesCityAngle": "A specific strategy to pivot this trend into a city discovery story."
  },
  "postIdeas": [ // MUST BE EXACTLY 5
    {
      "title": "Specific strategy-driven title",
      "conceptSummary": "Clear explanation of the post concept and visual direction",
      "hook": "Strong opening text for the visual/caption",
      "whyItWorks": "Why this specific angle hits the trend's sweet spot in India",
      "caption": "Full caption with local hashtags",
      "cta": "Specific call to action",
      "sceneBreakdown": ["Slide 1 content", "..."],
      "aiVideoPrompt": "Detailed prompt for AI image generation"
    }
  ],
  "reelIdeas": [ // MUST BE EXACTLY 5
    {
      "title": "Specific viral/relatable title",
      "conceptSummary": "Clear explanation of the reel concept and editing style",
      "hook": "Strong verbal or visual hook",
      "whyItWorks": "Why this format will perform well with the current audience sentiment",
      "format": "e.g., 'POV', 'Vlog', 'Listicle'",
      "caption": "Full reel caption",
      "cta": "Specific call to action",
      "sceneBreakdown": ["0-3s: Action", "..."],
      "aiVideoPrompt": "Detailed prompt for AI video generation"
    }
  ]
}

MANDATORY: 
- AVOID generic titles like 'City Guide' or 'Community Discussion'. 
- Be highly specific to the TOPIC and Indian cultural nuances.
- Ensure ideas are actionable and clear for a new user.`;

  // 3. AI Generation via Router
  console.log(`[TrendDetail] Requesting analysis for "${topic.title}"...`);
  
  const aiResult = await aiRouter.generateStructured({
    purpose: "trendDetail",
    systemPrompt: systemPrompt,
    userPrompt: `Generate analysis and ideas for the "${topic.title}" trend.`,
    inputForCache: { topicId, title: topic.title, category: topic.category }
  });

  // 4. Normalize and Save to DB
  const normalizeIdeas = (ideas: any[]) => ideas.map(idea => ({
    ...idea,
    sceneBreakdown: Array.isArray(idea.sceneBreakdown) 
      ? idea.sceneBreakdown 
      : typeof idea.sceneBreakdown === "string" 
        ? [idea.sceneBreakdown] 
        : []
  }));

  // Clean up any old failed records for this topic before saving new one
  await TrendDetail.deleteMany({ topicId });

  const detail = await TrendDetail.create({
    topicId,
    topicTitle: topic.title,
    aiAnalysis: aiResult.aiAnalysis,
    postIdeas: normalizeIdeas(aiResult.postIdeas || []),
    reelIdeas: normalizeIdeas(aiResult.reelIdeas || []),
  });
  
  // Phase 2: Add Topic Expansion to detail response
  const { expandTopicIntelligence } = await import("./topicExpansionService");
  const expansion = await expandTopicIntelligence(topic.title, topic.category, "IN");

  return {
    ...detail.toObject(),
    topicExpansion: expansion
  };
}
