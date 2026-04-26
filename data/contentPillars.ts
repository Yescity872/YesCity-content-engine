// Content Pillars for YesCity - these are the core themes all content revolves around

export const contentPillars = [
  {
    id: "city-discovery",
    name: "City Discovery",
    description: "Unveiling hidden gems, neighborhoods, and experiences in cities",
    emoji: "🏙️",
    hashtags: ["#CityDiscovery", "#YesCity", "#HiddenGems"],
  },
  {
    id: "local-experiences",
    name: "Local Experiences",
    description: "Authentic local food, culture, festivals, and daily life",
    emoji: "🎭",
    hashtags: ["#LocalExperiences", "#LocalLife", "#AuthenticTravel"],
  },
  {
    id: "travel-knowledge",
    name: "Travel Knowledge",
    description: "Tips, hacks, budget guides, and travel planning advice",
    emoji: "✈️",
    hashtags: ["#TravelKnowledge", "#TravelTips", "#BudgetTravel"],
  },
  {
    id: "community-stories",
    name: "Community Stories",
    description: "Stories from travelers, locals, founders, and users",
    emoji: "🤝",
    hashtags: ["#CommunityStories", "#TravelStories", "#UGC"],
  },
  {
    id: "platform-awareness",
    name: "Platform Awareness",
    description: "How YesCity works, new features, and product updates",
    emoji: "📱",
    hashtags: ["#YesCityApp", "#TravelTech", "#AppUpdates"],
  },
];

export type ContentPillar = (typeof contentPillars)[0];
export const contentPillarNames = contentPillars.map((p) => p.name);
