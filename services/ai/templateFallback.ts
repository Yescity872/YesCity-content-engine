/**
 * Zero-AI Safety Layer
 * Generates realistic marketing content using rules and pre-defined structures.
 */

export const getTemplateFallback = (purpose: string, input: any) => {
  console.warn(`[AI Router] Falling back to templates for purpose: ${purpose}`);

  switch (purpose) {
    case "trendAnalysis":
      return {
        isFallback: true,
        aiAnalysis: {
          whatItIs: `This trend focuses on ${input.keyword || "emerging cultural patterns"} in the current Indian landscape.`,
          whyTrending: "Increased digital conversation and seasonal relevance among urban audiences.",
          howPeopleUsing: "Content creators are leveraging this for relatable storytelling and local discovery.",
          brandSafetyNote: "Safe for premium brand association with a focus on community building.",
          yesCityAngle: "Focus on how this trend manifests in local city hubs and lifestyle venues."
        },
        postIdeas: [
          {
            title: `City Guide: ${input.keyword}`,
            concept: "A curated carousel showing the best ways to experience this trend in your city.",
            hook: `Stop scrolling! Here is how ${input.keyword} is changing your city.`,
            whyItWorks: "Local relevance combined with trending keywords.",
            caption: `The ${input.keyword} vibe is taking over! 🏙️ Here is our guide to experiencing it like a local. #YesCity #LocalVibes`,
            cta: "Save this for your next weekend outing!",
            sceneBreakdown: ["Slide 1: Visual Hook", "Slide 2: Context", "Slide 3: Best Spots", "Slide 4: Tips"],
            aiPrompt: `Cinematic street photography of an Indian city square, vibrant ${input.keyword} themes, high-end lifestyle aesthetic.`
          }
        ],
        reelIdeas: [
          {
            title: `POV: ${input.keyword} in 2024`,
            concept: "Fast-paced POV transitions showing the trend's impact on urban life.",
            hook: "POV: You discovered the real heart of your city.",
            format: "POV / Cinematic",
            whyItWorks: "Relatable, high-energy format that drives engagement.",
            caption: `Experience ${input.keyword} through our lens. 🎥 The city has never looked better. #UrbanDiscovery #TrendingIndia`,
            cta: "Share this with your city crew!",
            sceneBreakdown: ["0-3s: Establishing shot", "3-10s: Lifestyle montages", "10-15s: Conclusion"],
            aiPrompt: `High-energy drone shot passing through a modern Indian market, cinematic lighting, 4k 60fps.`
          }
        ]
      };

    case "topicExpansion":
      return {
        isFallback: true,
        instagramHashtags: ["#IndiaTrends", "#CityDiscovery", "#YesCityIntelligence", "#LocalCulture", "#ModernIndia"],
        youtubeQueries: ["Understanding " + input.topic, "Impact of " + input.topic + " in India", "Latest news " + input.topic],
        googleTrendQueries: [input.topic + " analysis", input.topic + " in Indian cities", "Why is " + input.topic + " trending"],
        newsQueries: [input.topic + " news India", "Editorial on " + input.topic],
        xQueries: ["#" + input.topic, "Trending " + input.topic],
        linkedinQueries: ["Business impact of " + input.topic + " in India", "Industry trends: " + input.topic],
        competitorKeywords: [input.topic + " marketing", "Regional trends India"],
        localAngles: ["Impact on Tier-1 cities", "Cultural nuances in the North vs South", "Gen-Z adaptation"],
        contentFormats: ["60s POV Reel", "In-depth Carousel Guide", "Expert Commentary Video"]
      };

    case "postReelIdeas":
      return {
        isFallback: true,
        ideas: [
          {
            ideaTitle: `Ultimate Guide to ${input.topic} for ${input.targetAudience}`,
            conceptSummary: `A comprehensive ${input.platform} guide exploring the best of ${input.topic}.`,
            whyItWorks: "Educational content tailored to niche audiences.",
            contentAngle: "Educational",
            hook: `Stop scrolling! This is the only ${input.topic} guide you need.`,
            caption: `Everything you need to know about ${input.topic}. 🌍 #YesCity #${input.topic.replace(/\s+/g, "")}`,
            cta: `Follow us for more ${input.topic} updates!`,
            format: input.platform === "Instagram" ? "Reel" : "Post",
            visualStyle: "Modern, clean typography",
            audioMood: "Upbeat instrumental",
            productionPrompts: [{ sceneNumber: 1, whatHappens: "Cinematic intro", videoPrompt: `Modern shot of ${input.topic}`, duration: "3s" }]
          },
          {
            ideaTitle: `5 Reasons to Love ${input.topic}`,
            conceptSummary: "Relatable lifestyle content highlighting the unique benefits of this topic.",
            whyItWorks: "Relatability and social proof.",
            contentAngle: "Lifestyle",
            hook: "POV: You found the perfect local gem.",
            caption: `Here's why ${input.topic} is trending right now. ✨ #LocalCulture`,
            cta: "Tell us your favorite spot in the comments!",
            format: "Post",
            visualStyle: "Vibrant and warm colors",
            audioMood: "Lofi beats",
            productionPrompts: [{ sceneNumber: 1, whatHappens: "POV transition", videoPrompt: "Atmospheric street shot", duration: "2s" }]
          }
        ].concat(Array(3).fill({
            ideaTitle: `Exploring ${input.topic}: Local Insights`,
            conceptSummary: "Community-driven insights into the trend.",
            whyItWorks: "Drives community engagement.",
            contentAngle: "Community",
            hook: "The locals won't tell you this, but...",
            caption: `Inside look at ${input.topic}. 🏙️ #YesCityInsights`,
            cta: "Join the conversation below!",
            format: "Carousel",
            visualStyle: "Authentic, raw footage style",
            audioMood: "Ambient city sounds",
            productionPrompts: []
        }))
      };

    case "competitorAnalysis":
      return {
        isFallback: true,
        latestFocus: `Expanding ${input.competitorName} Presence in Indian Local Markets`,
        strategySummary: `${input.competitorName} is currently focusing on hyper-local community discovery and influencer-led travel storytelling across Tier-1 and Tier-2 cities.`,
        contentThemes: ["Authentic Local Stays", "Hidden Culinary Gems", "Budget-Friendly Luxury"],
        audienceTargeting: ["Gen-Z Solo Travelers", "Urban Family Explorers"],
        campaignStyle: ["User-Generated Content", "Cinematic Travelogues"],
        strengths: ["Brand Trust", "Deep Inventory", "App Ecosystem"],
        yesCityOpportunities: ["Focus on 'The Insider Secret' angle which bigger brands miss", "Hyper-local community interaction"],
        proofLinks: [
          { title: `${input.competitorName} Official Blog`, url: `https://www.google.com/search?q=${input.competitorName}+official+blog`, source: "Public Search" }
        ]
      };

    case "quickIdeaUpgrade":
      return {
        isFallback: true,
        postIdeas: Array(5).fill({
          title: `Guide to ${input.topic}`,
          concept: `Curated carousel for ${input.audience}`,
          hook: `The ultimate ${input.topic} guide you missed.`,
          caption: `Discover ${input.topic} like never before.`,
          CTA: "Save this post",
          hashtags: "#YesCity #LocalVibes",
          whyItWorks: "High utility value",
          executionSteps: ["Step 1: Research", "Step 2: Design", "Step 3: Post"],
          difficulty: "Beginner",
          estimatedTime: "2 hours",
          assignedRole: "Designer"
        }),
        reelIdeas: Array(5).fill({
          title: `${input.topic} in 60 seconds`,
          concept: "Cinematic montage",
          hook: "POV: You found the heart of the city",
          sceneBreakdown: ["0-5s: Hook", "5-15s: Body", "15-60s: Outro"],
          caption: "City vibes only.",
          CTA: "Share this reel",
          hashtags: "#ReelsIndia #CityLife",
          editingStyle: "Fast-cuts",
          whyItWorks: "Visual engagement",
          difficulty: "Intermediate",
          estimatedTime: "4 hours",
          assignedRole: "Video Editor"
        }),
        recommendedPlatforms: ["Instagram", "YouTube"],
        contentCalendarSuggestion: "Post during peak evening hours for maximum engagement."
      };

    default:
      return {
        isFallback: true,
        status: "fallback",
        message: "General template generated.",
        data: input
      };
  }
};
