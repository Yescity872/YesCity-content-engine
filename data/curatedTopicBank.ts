export interface CuratedTopic {
  title: string;
  category: string;
  tags: string[];
  adaptabilityScore: number;
  freshnessWeight: number;
  lastUsed: Date | null;
}

export const curatedTopicBank: CuratedTopic[] = [
  // Geopolitics
  {
    title: "Global conflict awareness and peace initiatives",
    category: "geopolitics",
    tags: ["awareness", "peace", "globalmatters"],
    adaptabilityScore: 4,
    freshnessWeight: 1.0,
    lastUsed: null
  },
  {
    title: "Diplomatic travel and international relations",
    category: "geopolitics",
    tags: ["diplomacy", "international", "globalconnect"],
    adaptabilityScore: 6,
    freshnessWeight: 1.0,
    lastUsed: null
  },
  // Sports
  {
    title: "Major sporting event fan culture and celebrations",
    category: "sports",
    tags: ["fanculture", "stadiumvibes", "sportscelebration"],
    adaptabilityScore: 9,
    freshnessWeight: 1.2,
    lastUsed: null
  },
  {
    title: "Athlete fitness regimes and morning routines",
    category: "sports",
    tags: ["fitness", "athlete", "discipline"],
    adaptabilityScore: 8,
    freshnessWeight: 1.0,
    lastUsed: null
  },
  // Entertainment
  {
    title: "Behind-the-scenes movie set aesthetics",
    category: "entertainment",
    tags: ["bts", "filmmaking", "cinemaaesthetics"],
    adaptabilityScore: 9,
    freshnessWeight: 1.0,
    lastUsed: null
  },
  {
    title: "Viral concert moments and fan experiences",
    category: "entertainment",
    tags: ["concert", "livemusic", "fanpov"],
    adaptabilityScore: 10,
    freshnessWeight: 1.5,
    lastUsed: null
  },
  // Anime
  {
    title: "Anime-inspired lifestyle and aesthetic spaces",
    category: "anime",
    tags: ["animeaesthetic", "otaku", "cosplayvibes"],
    adaptabilityScore: 8,
    freshnessWeight: 1.1,
    lastUsed: null
  },
  {
    title: "Iconic anime food recreations",
    category: "anime",
    tags: ["animefood", "cooking", "studioghibli"],
    adaptabilityScore: 7,
    freshnessWeight: 1.0,
    lastUsed: null
  },
  // Student Life
  {
    title: "Late-night study sessions and productive spaces",
    category: "student life",
    tags: ["studygram", "productivity", "studentpov"],
    adaptabilityScore: 9,
    freshnessWeight: 1.0,
    lastUsed: null
  },
  {
    title: "Hostel life hacks and roommate dynamics",
    category: "student life",
    tags: ["hostellife", "collegememories", "hacks"],
    adaptabilityScore: 10,
    freshnessWeight: 1.3,
    lastUsed: null
  },
  // Food
  {
    title: "Hidden street food treasures in urban cities",
    category: "food",
    tags: ["streetfood", "hiddengems", "foodie"],
    adaptabilityScore: 10,
    freshnessWeight: 1.4,
    lastUsed: null
  },
  {
    title: "Traditional recipes with a modern fusion twist",
    category: "food",
    tags: ["fusionfood", "moderncook", "recipe"],
    adaptabilityScore: 9,
    freshnessWeight: 1.1,
    lastUsed: null
  },
  // Travel
  {
    title: "Offbeat weekend getaways for city dwellers",
    category: "travel",
    tags: ["weekendtrip", "offbeat", "citybreak"],
    adaptabilityScore: 10,
    freshnessWeight: 1.5,
    lastUsed: null
  },
  {
    title: "Sustainable travel and eco-conscious exploration",
    category: "travel",
    tags: ["sustainabletravel", "nature", "conscious"],
    adaptabilityScore: 8,
    freshnessWeight: 1.2,
    lastUsed: null
  },
  // Memes
  {
    title: "Relatable workplace POV and corporate humor",
    category: "memes",
    tags: ["corporate", "workplacehumor", "relatable"],
    adaptabilityScore: 10,
    freshnessWeight: 1.2,
    lastUsed: null
  },
  {
    title: "Expectation vs Reality of viral trends",
    category: "memes",
    tags: ["expectationvsreality", "funny", "memetrend"],
    adaptabilityScore: 10,
    freshnessWeight: 1.5,
    lastUsed: null
  },
  // Tech/AI
  {
    title: "AI-powered creative tools and digital art",
    category: "tech/AI",
    tags: ["aitools", "digitalart", "techfuture"],
    adaptabilityScore: 9,
    freshnessWeight: 1.3,
    lastUsed: null
  },
  {
    title: "Gadgets that improve daily city life efficiency",
    category: "tech/AI",
    tags: ["smartcity", "techhacks", "efficiency"],
    adaptabilityScore: 8,
    freshnessWeight: 1.1,
    lastUsed: null
  },
  // Festivals
  {
    title: "Traditional festival preparation and family vibes",
    category: "festivals",
    tags: ["festivals", "tradition", "culture"],
    adaptabilityScore: 10,
    freshnessWeight: 1.4,
    lastUsed: null
  },
  {
    title: "Community-driven celebration of local heritage",
    category: "festivals",
    tags: ["heritage", "community", "celebration"],
    adaptabilityScore: 9,
    freshnessWeight: 1.2,
    lastUsed: null
  }
];
