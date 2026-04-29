export interface CuratedTopic {
  title: string;
  category: string;
  tags: string[];
  adaptabilityScore: number;
  freshnessWeight: number;
  lastUsed: Date | null;
}

export const curatedTopicBank: CuratedTopic[] = [
  // --- FESTIVALS (Indian Focus) ---
  {
    title: "Diwali Home Decor and Lighting Aesthetics",
    category: "festivals",
    tags: ["diwali", "festivevibes", "homedecor"],
    adaptabilityScore: 10,
    freshnessWeight: 2.0,
    lastUsed: null
  },
  {
    title: "Holi Color Celebration and Street Photography",
    category: "festivals",
    tags: ["holi", "colorfest", "streetstyle"],
    adaptabilityScore: 10,
    freshnessWeight: 2.0,
    lastUsed: null
  },
  {
    title: "Navratri Dandiya Nights and Ethnic Fashion",
    category: "festivals",
    tags: ["navratri", "dandiya", "ethnicwear"],
    adaptabilityScore: 10,
    freshnessWeight: 1.8,
    lastUsed: null
  },
  {
    title: "Ganesh Chaturthi Visarjan Energy and Processions",
    category: "festivals",
    tags: ["ganpati", "visarjan", "mumbaifestival"],
    adaptabilityScore: 9,
    freshnessWeight: 1.7,
    lastUsed: null
  },
  {
    title: "Durga Puja Pandal Hopping and Artistic Statues",
    category: "festivals",
    tags: ["durgapuja", "kolkata", "artistic"],
    adaptabilityScore: 9,
    freshnessWeight: 1.7,
    lastUsed: null
  },
  {
    title: "Eid Festivities and Traditional Food Markets",
    category: "festivals",
    tags: ["eid", "celebration", "foodmarket"],
    adaptabilityScore: 9,
    freshnessWeight: 1.6,
    lastUsed: null
  },
  {
    title: "Christmas in Old Goa and French Quarter Vibes",
    category: "festivals",
    tags: ["christmas", "goa", "pondicherry"],
    adaptabilityScore: 8,
    freshnessWeight: 1.5,
    lastUsed: null
  },
  {
    title: "Lohri and Baisakhi Farm Celebrations",
    category: "festivals",
    tags: ["lohri", "baisakhi", "punjabivibes"],
    adaptabilityScore: 8,
    freshnessWeight: 1.5,
    lastUsed: null
  },
  {
    title: "Onam Pookalam Designs and Boat Races",
    category: "festivals",
    tags: ["onam", "kerala", "tradition"],
    adaptabilityScore: 9,
    freshnessWeight: 1.6,
    lastUsed: null
  },
  {
    title: "Chhath Puja Sunrise Rituals and River Ghats",
    category: "festivals",
    tags: ["chhathpuja", "bihar", "devotion"],
    adaptabilityScore: 7,
    freshnessWeight: 1.5,
    lastUsed: null
  },

  // --- FOOD (Indian Focus) ---
  {
    title: "Old Delhi Street Food Trail: Paranthas and Jalebi",
    category: "food",
    tags: ["delhistreetfood", "chandnichowk", "foodie"],
    adaptabilityScore: 10,
    freshnessWeight: 1.9,
    lastUsed: null
  },
  {
    title: "Mumbai Vada Pav vs Lucknow Kebabs Debate",
    category: "food",
    tags: ["vadapav", "kebabs", "fooddebate"],
    adaptabilityScore: 10,
    freshnessWeight: 1.8,
    lastUsed: null
  },
  {
    title: "South Indian Breakfast: Filter Coffee and Podi Idli",
    category: "food",
    tags: ["southindian", "breakfast", "filtercoffee"],
    adaptabilityScore: 9,
    freshnessWeight: 1.7,
    lastUsed: null
  },
  {
    title: "Desi Chinese: The Viral Schezwan Street Magic",
    category: "food",
    tags: ["desichinese", "streetfood", "spicy"],
    adaptabilityScore: 10,
    freshnessWeight: 1.6,
    lastUsed: null
  },
  {
    title: "Unlimited Thali Experiences and Regional Flavors",
    category: "food",
    tags: ["thali", "indianfood", "culture"],
    adaptabilityScore: 8,
    freshnessWeight: 1.5,
    lastUsed: null
  },
  {
    title: "Night Food Markets: Indore Sarafa and Bangalore VV Puram",
    category: "food",
    tags: ["nightmarket", "indore", "bangalore"],
    adaptabilityScore: 9,
    freshnessWeight: 1.7,
    lastUsed: null
  },
  {
    title: "Traditional Sweets: Making of Rabri and Mysore Pak",
    category: "food",
    tags: ["mithai", "tradition", "sweets"],
    adaptabilityScore: 8,
    freshnessWeight: 1.4,
    lastUsed: null
  },
  {
    title: "Viral kulhad Pizza and Over-the-top Street Fusions",
    category: "food",
    tags: ["foodtrend", "viral", "streetfood"],
    adaptabilityScore: 10,
    freshnessWeight: 1.8,
    lastUsed: null
  },

  // --- TRAVEL / LOCATIONS (Indian Focus) ---
  {
    title: "Jaipur Pink City Walk and Hawa Mahal Aesthetics",
    category: "travel",
    tags: ["jaipur", "pinkcity", "rajasthan"],
    adaptabilityScore: 10,
    freshnessWeight: 1.9,
    lastUsed: null
  },
  {
    title: "Varanasi Ghats at Sunrise and Evening Aarti",
    category: "travel",
    tags: ["varanasi", "ghats", "spiritual"],
    adaptabilityScore: 9,
    freshnessWeight: 1.8,
    lastUsed: null
  },
  {
    title: "Manali Snowfall and Winter Cafe Hopping",
    category: "travel",
    tags: ["manali", "snowfall", "mountains"],
    adaptabilityScore: 9,
    freshnessWeight: 1.8,
    lastUsed: null
  },
  {
    title: "Goa Offbeat Beaches and Portuguese Architecture",
    category: "travel",
    tags: ["goa", "travelindia", "beaches"],
    adaptabilityScore: 10,
    freshnessWeight: 1.7,
    lastUsed: null
  },
  {
    title: "Kerala Backwaters and Houseboat Slow Living",
    category: "travel",
    tags: ["kerala", "backwaters", "nature"],
    adaptabilityScore: 8,
    freshnessWeight: 1.6,
    lastUsed: null
  },
  {
    title: "Meghalaya Living Root Bridges and Rain Trails",
    category: "travel",
    tags: ["meghalaya", "nature", "trekking"],
    adaptabilityScore: 8,
    freshnessWeight: 1.5,
    lastUsed: null
  },
  {
    title: "Mumbai Marine Drive Sunset and Night Life",
    category: "travel",
    tags: ["mumbai", "marinedrive", "citylife"],
    adaptabilityScore: 10,
    freshnessWeight: 1.8,
    lastUsed: null
  },
  {
    title: "Bangalore Cubbon Park Sunday Vibes and Pet Culture",
    category: "travel",
    tags: ["bangalore", "cubbonpark", "citynature"],
    adaptabilityScore: 9,
    freshnessWeight: 1.6,
    lastUsed: null
  },
  {
    title: "Hyderabad Charminar Shopping and Irani Chai",
    category: "travel",
    tags: ["hyderabad", "charminar", "shopping"],
    adaptabilityScore: 9,
    freshnessWeight: 1.7,
    lastUsed: null
  },

  // --- SPORTS (Indian Focus) ---
  {
    title: "Gully Cricket Legends and Local Match Energy",
    category: "sports",
    tags: ["gullycricket", "desi", "localmatch"],
    adaptabilityScore: 10,
    freshnessWeight: 2.0,
    lastUsed: null
  },
  {
    title: "IPL Fan Frenzy and Stadium Atmosphere",
    category: "sports",
    tags: ["ipl", "cricketlover", "stadium"],
    adaptabilityScore: 10,
    freshnessWeight: 1.9,
    lastUsed: null
  },
  {
    title: "Local Wrestling (Dangal) and Traditional Gyms (Akhada)",
    category: "sports",
    tags: ["dangal", "wrestling", "tradition"],
    adaptabilityScore: 7,
    freshnessWeight: 1.4,
    lastUsed: null
  },
  {
    title: "Football Fever in Kolkata and Kerala",
    category: "sports",
    tags: ["football", "kerala", "kolkata"],
    adaptabilityScore: 8,
    freshnessWeight: 1.6,
    lastUsed: null
  },
  {
    title: "Marathon Runners and Early Morning City Fitness",
    category: "sports",
    tags: ["marathon", "fitness", "earlymorning"],
    adaptabilityScore: 8,
    freshnessWeight: 1.5,
    lastUsed: null
  },

  // --- MEMES / CULTURE (Indian Focus) ---
  {
    title: "Relatable Indian Parent Tropes and Desi Wisdom",
    category: "memes",
    tags: ["desi", "parents", "relatable"],
    adaptabilityScore: 10,
    freshnessWeight: 1.8,
    lastUsed: null
  },
  {
    title: "Auto-Rickshaw Wisdom: Funny Quotes and Back-side Art",
    category: "memes",
    tags: ["rickshaw", "cityhumor", "autoart"],
    adaptabilityScore: 10,
    freshnessWeight: 1.7,
    lastUsed: null
  },
  {
    title: "Desi Wedding Chaos: From Baraat to Buffet",
    category: "memes",
    tags: ["wedding", "desiwedding", "funny"],
    adaptabilityScore: 10,
    freshnessWeight: 1.9,
    lastUsed: null
  },
  {
    title: "Corporate India: Commute Struggles and Coffee Breaks",
    category: "memes",
    tags: ["corporate", "officehumor", "commute"],
    adaptabilityScore: 10,
    freshnessWeight: 1.6,
    lastUsed: null
  },
  {
    title: "Student Life: Exams, Maggi, and Hostel Memories",
    category: "student life",
    tags: ["student", "hostel", "maggi"],
    adaptabilityScore: 10,
    freshnessWeight: 1.8,
    lastUsed: null
  },
  {
    title: "Local Market Haggling and Bargain Queens",
    category: "memes",
    tags: ["shopping", "bargain", "localmarket"],
    adaptabilityScore: 10,
    freshnessWeight: 1.7,
    lastUsed: null
  },

  // --- TECH / AI (Indian Focus) ---
  {
    title: "UPI Convenience and The Death of Cash in India",
    category: "tech/AI",
    tags: ["upi", "digitalindia", "fintech"],
    adaptabilityScore: 9,
    freshnessWeight: 1.5,
    lastUsed: null
  },
  {
    title: "Smart City Innovations: Improving Traffic and Safety",
    category: "tech/AI",
    tags: ["smartcity", "innovation", "tech"],
    adaptabilityScore: 8,
    freshnessWeight: 1.3,
    lastUsed: null
  },
  {
    title: "AI Reimagining Indian Cities in the Future",
    category: "tech/AI",
    tags: ["aifuture", "art", "india"],
    adaptabilityScore: 9,
    freshnessWeight: 1.6,
    lastUsed: null
  },

  // --- MISC / CREATIVE ---
  {
    title: "Cinematic City Walk: From Chaos to Calm",
    category: "travel",
    tags: ["cinematic", "citywalk", "visuals"],
    adaptabilityScore: 10,
    freshnessWeight: 1.9,
    lastUsed: null
  },
  {
    title: "Street Style Fashion: Sarojini Nagar vs Colaba Causeway",
    category: "entertainment",
    tags: ["fashion", "streetstyle", "shopping"],
    adaptabilityScore: 9,
    freshnessWeight: 1.7,
    lastUsed: null
  },
  {
    title: "Indie Music Scene: Local Gigs and Jam Sessions",
    category: "entertainment",
    tags: ["indie", "localmusic", "vibe"],
    adaptabilityScore: 8,
    freshnessWeight: 1.5,
    lastUsed: null
  },
  {
    title: "POV: You are traveling in a General Coach of Indian Railways",
    category: "memes",
    tags: ["indianrailways", "travelindia", "pov"],
    adaptabilityScore: 10,
    freshnessWeight: 1.8,
    lastUsed: null
  },
  {
    title: "The Art of Making Masala Chai on the Street",
    category: "food",
    tags: ["chai", "streetart", "aesthetic"],
    adaptabilityScore: 10,
    freshnessWeight: 1.9,
    lastUsed: null
  }
];
