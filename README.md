# 🚀 YesCity Content Engine

**YesCity Content Engine** is an industry-grade, AI-powered platform designed to bridge the gap between emerging trends and high-impact content. It aggregates real-time data from multiple social and news sources, analyzes them using state-of-the-art LLMs, and generates actionable content ideas for creators and brands.

---

## 🌟 Key Features

- **Multi-Source Trend Discovery**: Aggregates trends from YouTube, Google Trends, NewsAPI.ai, GNews, and social media scrapers (Instagram, X, LinkedIn).
- **AI-Driven Analysis**: Leverages **Groq (Llama-3)** and **Sarvam AI** for lightning-fast trend expansion, relevance scoring, and content idea generation.
- **Indic Language Support**: Native support for Indian languages via Sarvam AI integration.
- **Intelligent Relevance Engine**: Filters and ranks trends based on custom relevance metrics.
- **Specialized Workflows**: Dedicated engines for competitor insights, quick idea generation, and trend detail deep-dives.
- **Instagram Session Management**: Built-in scripts for handling headless browser sessions for social scraping.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **AI Models**: 
  - **Groq SDK** (Llama-3-70b/8b) for high-speed reasoning.
  - **Sarvam AI** for specialized Indic language processing.
- **Automation**: [Playwright](https://playwright.dev/) for robust web scraping.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📂 Project Structure

```text
├── app/                # Next.js App Router (UI & API Routes)
├── components/         # Reusable React components
├── services/           # Core Business Logic
│   ├── ai/             # LLM orchestration (Groq, Sarvam)
│   ├── sourceAdapters/ # Scrapers and API adapters for social sources
│   └── ...             # Trend, Idea, and News services
├── scripts/            # Utility scripts (DB tests, Session management)
├── types/              # Centralized TypeScript interfaces
├── public/             # Static assets (thumbnails, icons)
├── .env.local.example  # Environment template
└── next.config.ts      # Next.js configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.x or higher
- **MongoDB**: A running instance (local or Atlas)
- **API Keys**: Groq, YouTube Data API, NewsAPI, etc.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Yescity872/YesCity-content-engine.git
   cd YesCity-content-engine
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Copy the example environment file and fill in your credentials:
   ```bash
   cp .env.local.example .env.local
   ```
   *See the comments in `.env.local` for details on each key.*

4. **Run the development server**:
   ```bash
   npm run dev
   ```

---

## 📜 Available Scripts

- `npm run dev`: Starts the development server with hot-reload.
- `npm run build`: Compiles the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run save:instagram-session`: Specialized script to save Instagram login sessions for the scraper.

---

## 🤝 Contributing

1. **Create a Branch**: `git checkout -b feature/amazing-feature`
2. **Commit Changes**: `git commit -m 'Add some amazing feature'`
3. **Push to Branch**: `git push origin feature/amazing-feature`
4. **Open a Pull Request**

### Code Standards
- Always use TypeScript for new files.
- Follow the established service-adapter pattern for new data sources.
- Ensure all environment variables are documented in `.env.local.example`.

---

## 📄 License

This project is private and proprietary. Unauthorized copying or distribution is strictly prohibited.

---

**Built with ❤️ by the YesCity Team.**
