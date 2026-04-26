// Seasonal calendar with India-specific travel context
// Used by weeklyPlannerService to pick relevant seasonal themes

export interface SeasonalContext {
  month: string;
  monthNumber: number;
  season: string;
  themes: string[];
  destinations: string[];
  festivals: string[];
  travelType: string;
  contentAngle: string;
}

export const seasonalCalendar: SeasonalContext[] = [
  {
    month: "January",
    monthNumber: 1,
    season: "Winter",
    themes: ["Winter travel", "Hill stations", "Literature festivals"],
    destinations: ["Jaipur", "Shimla", "Manali", "Ooty", "Coorg"],
    festivals: ["Jaipur Literature Festival", "Makar Sankranti", "Republic Day"],
    travelType: "Winter Getaways",
    contentAngle: "Best winter destinations + festival season travel in Rajasthan",
  },
  {
    month: "February",
    monthNumber: 2,
    season: "Winter/Spring",
    themes: ["Valentine's travel", "Romantic destinations", "Flower festivals"],
    destinations: ["Udaipur", "Goa", "Coorg", "Cherrapunji"],
    festivals: ["Valentine's Day", "Vasant Panchami"],
    travelType: "Romantic & Couple Travel",
    contentAngle: "Romantic getaways and couple travel destinations in India",
  },
  {
    month: "March",
    monthNumber: 3,
    season: "Spring",
    themes: ["Holi travel", "Spring destinations", "Pre-summer getaways"],
    destinations: ["Mathura", "Vrindavan", "Jaipur", "Barsana"],
    festivals: ["Holi", "Shivratri"],
    travelType: "Festival Travel",
    contentAngle: "Holi celebration destinations — Mathura, Vrindavan, Jaipur guide",
  },
  {
    month: "April",
    monthNumber: 4,
    season: "Summer Start",
    themes: ["Summer planning", "Hill station escapes", "Beat the heat"],
    destinations: ["Shimla", "Mussoorie", "Nainital", "Darjeeling"],
    festivals: ["Baisakhi", "Tamil New Year", "Gudi Padwa"],
    travelType: "Summer Escapes",
    contentAngle: "Best hill stations to beat the summer heat — planning guide",
  },
  {
    month: "May",
    monthNumber: 5,
    season: "Summer Peak",
    themes: ["Peak summer travel", "International travel", "Budget summer trips"],
    destinations: ["Leh-Ladakh", "Spiti Valley", "Sikkim", "Meghalaya"],
    festivals: ["Buddha Purnima"],
    travelType: "Adventure & Mountain Travel",
    contentAngle: "Leh-Ladakh and Spiti Valley summer expedition planning",
  },
  {
    month: "June",
    monthNumber: 6,
    season: "Pre-Monsoon",
    themes: ["Monsoon prep", "Last summer trips", "International Southeast Asia"],
    destinations: ["Leh-Ladakh", "Spiti", "Uttarakhand"],
    festivals: ["Eid al-Adha (varies)", "Jagannath Puri Rath Yatra"],
    travelType: "Mountain & Pre-Monsoon",
    contentAngle: "Final call for Himalayas before monsoon — what to book now",
  },
  {
    month: "July",
    monthNumber: 7,
    season: "Monsoon",
    themes: ["Monsoon travel", "Waterfall destinations", "Green landscapes"],
    destinations: ["Kerala", "Meghalaya", "Coorg", "Lonavala", "Munnar"],
    festivals: ["Guru Purnima", "Bakri Eid"],
    travelType: "Monsoon Travel",
    contentAngle: "Monsoon magic — Kerala backwaters, Meghalaya waterfalls, lush Coorg",
  },
  {
    month: "August",
    monthNumber: 8,
    season: "Monsoon",
    themes: ["Monsoon road trips", "Independence Day travel", "Waterfall tourism"],
    destinations: ["Goa", "Western Ghats", "Cherrapunji", "Valley of Flowers"],
    festivals: ["Independence Day", "Janmashtami", "Onam"],
    travelType: "Monsoon & National Pride",
    contentAngle: "Independence Day long weekend travel ideas and monsoon road trips",
  },
  {
    month: "September",
    monthNumber: 9,
    season: "Late Monsoon",
    themes: ["Post-monsoon planning", "Ganesh Chaturthi", "Wildlife"],
    destinations: ["Mumbai", "Pune", "Ranthambore", "Jim Corbett"],
    festivals: ["Ganesh Chaturthi", "Navratri start"],
    travelType: "Wildlife & Festival",
    contentAngle: "Ganesh Chaturthi travel to Mumbai + best wildlife sanctuaries post-monsoon",
  },
  {
    month: "October",
    monthNumber: 10,
    season: "Autumn/Peak Season Start",
    themes: ["Durga Puja", "Festival travel", "Post-monsoon destinations"],
    destinations: ["Kolkata", "Mysore", "Jaisalmer", "Rajasthan"],
    festivals: ["Durga Puja", "Dussehra", "Navratri"],
    travelType: "Festival Tourism",
    contentAngle: "Durga Puja in Kolkata — the ultimate guide + Dussehra travel destinations",
  },
  {
    month: "November",
    monthNumber: 11,
    season: "Peak Season",
    themes: ["Diwali travel", "Rajasthan peak season", "Beach destinations"],
    destinations: ["Jaipur", "Varanasi", "Goa", "Pushkar"],
    festivals: ["Diwali", "Pushkar Camel Fair", "Guru Nanak Jayanti"],
    travelType: "Peak Season & Festival",
    contentAngle: "Diwali celebrations across India — Jaipur, Varanasi, and Pushkar Fair",
  },
  {
    month: "December",
    monthNumber: 12,
    season: "Peak Season / Winter",
    themes: ["Year-end travel", "Christmas", "New Year destinations"],
    destinations: ["Goa", "Rajasthan", "Kerala", "Andaman"],
    festivals: ["Christmas", "New Year's Eve"],
    travelType: "Year-End Celebrations",
    contentAngle: "Best New Year destinations in India — Goa, Rajasthan, and Andaman",
  },
];

export function getCurrentSeasonalContext(): SeasonalContext {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-indexed
  return (
    seasonalCalendar.find((s) => s.monthNumber === currentMonth) ||
    seasonalCalendar[0]
  );
}
