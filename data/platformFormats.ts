// Platform formats and content behavior guide for YesCity social channels

export const platformFormats = {
  Instagram: {
    label: "Instagram",
    emoji: "📸",
    formats: ["Reel", "Carousel", "Story", "Single Post", "UGC Repost"],
    bestFor: "Visual storytelling, travel aesthetics, UGC, and short-form video",
    tones: ["Inspirational", "Fun", "Authentic", "Aspirational"],
    defaultCTA: "Save this for your next trip! 🗺️",
    contentTypes: [
      {
        format: "Reel",
        description: "Short 30–60s video, hook in first 3 seconds",
        tips: "Use trending audio, text overlays, quick cuts",
      },
      {
        format: "Carousel",
        description: "3–10 slides, educational or list-style content",
        tips: "First slide is the hook, last slide is CTA",
      },
      {
        format: "Story",
        description: "24h content, polls, Q&A, behind the scenes",
        tips: "Use stickers, polls, and question boxes for engagement",
      },
      {
        format: "UGC Repost",
        description: "User-generated content from travelers",
        tips: "Tag original creator, add context caption",
      },
    ],
  },
  LinkedIn: {
    label: "LinkedIn",
    emoji: "💼",
    formats: ["Founder Story", "Startup Update", "Travel-Tech Insight", "Work Culture Post", "Thread"],
    bestFor: "B2B, investor updates, founder brand, startup journey",
    tones: ["Professional", "Thought Leadership", "Authentic", "Insightful"],
    defaultCTA: "What's your take? Drop a comment below. 👇",
    contentTypes: [
      {
        format: "Founder Story",
        description: "Personal narrative about building YesCity",
        tips: "Start with a bold statement or personal moment",
      },
      {
        format: "Startup Update",
        description: "Milestones, metrics, learnings",
        tips: "Be transparent, share both wins and lessons",
      },
      {
        format: "Travel-Tech Insight",
        description: "Industry perspective on travel and technology",
        tips: "Use data points, share a unique POV",
      },
      {
        format: "Work Culture Post",
        description: "Team, culture, behind-the-scenes at YesCity",
        tips: "Include photos or videos of team moments",
      },
    ],
  },
  X: {
    label: "X (Twitter)",
    emoji: "🐦",
    formats: ["Thread", "Budget Breakdown", "Quick Insight", "Poll", "Hot Take"],
    bestFor: "Real-time updates, opinions, travel hacks, community threads",
    tones: ["Witty", "Direct", "Conversational", "Informative"],
    defaultCTA: "RT if you agree 🔁 | Follow for more travel insights",
    contentTypes: [
      {
        format: "Thread",
        description: "Multi-tweet series on a topic",
        tips: "Hook tweet must be standalone, number each tweet",
      },
      {
        format: "Budget Breakdown",
        description: "Cost analysis of a trip or city",
        tips: "Use numbers and bullet-style formatting",
      },
      {
        format: "Quick Insight",
        description: "Single punchy tweet with a travel fact or tip",
        tips: "Keep it under 200 chars, end with a question",
      },
    ],
  },
  WhatsApp: {
    label: "WhatsApp",
    emoji: "💬",
    formats: ["Community Post", "Broadcast Message", "Status Update"],
    bestFor: "Community engagement, UGC prompts, travel updates",
    tones: ["Friendly", "Personal", "Community-driven"],
    defaultCTA: "Share this with your travel buddy! 🌍",
    contentTypes: [
      {
        format: "Community Post",
        description: "Post in YesCity WhatsApp community groups",
        tips: "Keep it conversational, use emojis",
      },
    ],
  },
} as const;

export type Platform = keyof typeof platformFormats;
export const platformNames = Object.keys(platformFormats) as Platform[];
