"use client";

import { useState } from "react";
import {
  Lightbulb,
  Zap,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  ChevronDown,
  ChevronUp,
  Film,
  Eye,
  ExternalLink,
  BookOpen,
  Palette,
  Link2,
  Music,
  Video,
  Layers,
  Target,
  Sparkles,
  Info,
  TrendingUp,
} from "lucide-react";
import type { ContentIdea, GeneratedIdea, ReferencePost, ProductionPrompt } from "@/types";

const PLATFORMS = ["Instagram", "LinkedIn", "X", "WhatsApp"];
const TONES = ["Inspirational", "Educational", "Fun", "Witty", "Professional"];

const PLATFORM_EMOJI: Record<string, string> = {
  Instagram: "📸",
  LinkedIn: "💼",
  X: "🐦",
  WhatsApp: "💬",
};

// ─── Reference Post Card ──────────────────────────────────────────────────────

function ReferenceCard({ ref: post }: { ref: ReferencePost }) {
  const formatNum = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-[#0F1117] border border-[#2A2D3E] hover:border-[#53A9EF]/30 transition-colors">
      <span className="text-base shrink-0 mt-0.5">
        {PLATFORM_EMOJI[post.platform] || "📱"}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="badge-gray text-xs">{post.platform}</span>
          {!post.isScraped && (
            <span className="badge-yellow text-xs">Mock Inspiration</span>
          )}
        </div>
        <p className="text-xs text-[#8B90A7] leading-relaxed mb-1.5">
          {post.description}
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          {post.likes !== undefined && (
            <span className="flex items-center gap-1 text-xs text-[#555870]">
              ❤️ {formatNum(post.likes)}
            </span>
          )}
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-[#53A9EF] hover:underline"
          >
            <ExternalLink size={10} /> View post
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Idea Card ─────────────────────────────────────────────────────────────────

function IdeaCard({ idea, index, generationSource }: { idea: any; index: number; generationSource?: string }) {
  const [scenesExpanded, setScenesExpanded] = useState(false);

  return (
    <div className="card flex flex-col gap-0 relative overflow-hidden group">
      {/* Header */}
      <div className="flex items-start gap-2.5 mb-3 pr-20">
        <div className="w-7 h-7 rounded-full bg-[#53A9EF]/10 border border-[#53A9EF]/20 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xs font-bold text-[#53A9EF]">{index + 1}</span>
        </div>
        <h3 className="text-sm font-bold text-[#F0F2F8] leading-snug">{idea.title || idea.ideaTitle}</h3>
      </div>

      {/* Strategy Section */}
      <div className="p-3 rounded-lg bg-[#53A9EF]/5 border border-[#53A9EF]/15 mb-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Info size={11} className="text-[#53A9EF]" />
          <p className="text-[10px] font-bold text-[#53A9EF] uppercase tracking-wider">Concept Summary</p>
        </div>
        <p className="text-xs text-[#F0F2F8] leading-relaxed italic mb-3">
          &quot;{idea.conceptSummary}&quot;
        </p>
      </div>

      <div className="space-y-3">
        {/* Hook */}
        <div className="p-3 rounded-lg bg-[#1A1D27] border border-[#2A2D3E]">
          <p className="text-[10px] font-bold text-[#8B90A7] mb-1.5 uppercase tracking-widest">🪝 The Hook</p>
          <p className="text-sm text-[#F0F2F8] leading-relaxed font-medium">{idea.hook}</p>
        </div>

        {/* Scene-by-scene breakdown */}
        <div className="p-3 rounded-lg bg-[#1A1D27] border border-[#2A2D3E]">
          <p className="text-[10px] font-bold text-[#8B90A7] mb-1.5 uppercase tracking-widest">🎬 Scene Breakdown</p>
          <p className="text-xs text-[#8B90A7] leading-relaxed">{idea.sceneBreakdown}</p>
        </div>

        {/* AI Video Prompt */}
        <div className="bg-[#53A9EF]/10 border border-dashed border-[#53A9EF]/30 p-3 rounded-lg">
          <p className="text-[10px] font-bold text-[#53A9EF] mb-1 uppercase tracking-widest">🤖 AI Video Prompt</p>
          <p className="text-[11px] text-[#8B90A7] italic">{idea.aiVideoPrompt}</p>
        </div>

        {/* Caption */}
        <div>
          <p className="text-[10px] font-bold text-[#8B90A7] mb-1.5 uppercase tracking-widest">📝 Caption</p>
          <div className="p-3 rounded-lg bg-[#0F1117] border border-[#2A2D3E]">
            <p className="text-xs text-[#8B90A7] leading-relaxed whitespace-pre-line">
              {idea.caption}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-3 rounded-lg bg-[#53A9EF]/5 border border-[#53A9EF]/15">
          <p className="text-[10px] font-bold text-[#53A9EF] mb-1 uppercase tracking-widest">📣 Call to Action</p>
          <p className="text-sm text-[#F0F2F8] font-medium">{idea.cta}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Saved Ideas Row ────────────────────────────────────────────────────────────

function SavedIdeaRow({
  saved,
}: {
  saved: GeneratedIdea & { _id: string; createdAt: string };
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card">
      <button
        className="w-full flex items-center justify-between text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="text-xl">{PLATFORM_EMOJI[saved.platform] || "📱"}</span>
            {saved.generationSource === "AI" && (
              <Sparkles size={10} className="absolute -top-1 -right-1 text-[#53A9EF]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-[#F0F2F8]">{saved.inputTopic}</p>
              {saved.generationSource === "AI" && (
                <span className="text-[8px] bg-[#53A9EF]/10 text-[#53A9EF] px-1 rounded font-bold uppercase tracking-tighter border border-[#53A9EF]/20">AI</span>
              )}
            </div>
            <p className="text-xs text-[#555870]">
              {saved.platform} · {saved.tone} · {saved.targetAudience}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-gray text-[10px]">{saved.ideas.length} ideas</span>
          {open ? (
            <ChevronUp size={14} className="text-[#555870]" />
          ) : (
            <ChevronDown size={14} className="text-[#555870]" />
          )}
        </div>
      </button>
      {open && (
        <div className="mt-4 space-y-2">
          {saved.ideas.map((idea, i) => (
            <div key={i} className="p-3 rounded-lg bg-[#0F1117] border border-[#2A2D3E]">
              <div className="flex items-start gap-2">
                <span className="text-xs font-bold text-[#53A9EF] shrink-0 mt-0.5">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#F0F2F8] truncate">{idea.ideaTitle}</p>
                  <p className="text-[10px] text-[#555870] mt-0.5 line-clamp-1 italic">Concept: {idea.conceptSummary}</p>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    <span className="badge-gray text-[9px] uppercase">{idea.format}</span>
                    <span className="badge-blue text-[9px] uppercase">{idea.contentAngle}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

import { Header } from "@/components/Header";

export default function IdeaGeneratorPage() {
  const [topic, setTopic] = useState("");
  // ... rest of state stays the same
  const [platform, setPlatform] = useState("Instagram");
  const [tone, setTone] = useState("Inspirational");
  const [targetAudience, setTargetAudience] = useState("");
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [generationSource, setGenerationSource] = useState<"AI" | "Rule-based" | null>(null);
  const [savedIdeas, setSavedIdeas] = useState<
    (GeneratedIdea & { _id: string; createdAt: string })[]
  >([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showAlert = (type: "success" | "error" | "info", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      showAlert("error", "Please enter a topic or city.");
      return;
    }
    if (!targetAudience.trim()) {
      showAlert("error", "Please enter a target audience.");
      return;
    }
    setGenerating(true);
    setAlert(null);
    try {
      const res = await fetch("/api/ideas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform, tone, targetAudience }),
      });
      const json = await res.json();
      if (json.success) {
        setIdeas(json.data.ideas);
        setGenerationSource(json.data.source);
        showAlert("success", `Generated via ${json.data.source === "AI" ? "AI Strategist" : "Fallback Template"}`);
      } else {
        showAlert("error", json.error || "Generation failed");
      }
    } catch {
      showAlert("error", "Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (ideas.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/ideas/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          inputTopic: topic, 
          platform, 
          tone, 
          targetAudience, 
          ideas,
          generationSource 
        }),
      });
      const json = await res.json();
      if (json.success) {
        showAlert("success", "Ideas saved to MongoDB!");
      } else {
        showAlert("error", json.error || "Save failed");
      }
    } catch {
      showAlert("error", "Network error. Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/ideas");
      const json = await res.json();
      if (json.success) {
        setSavedIdeas(json.data || []);
        if ((json.data || []).length === 0) {
          showAlert("info", "No saved ideas yet.");
        }
      } else {
        showAlert("error", json.error || "Could not load history");
      }
    } catch {
      showAlert("error", "Network error. Could not load history.");
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0F111A]">
      <Header />

      <main className="flex-1 overflow-y-auto scrollbar-thin scroll-smooth">
        <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
          {/* Header Title */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb size={18} className="text-[#53A9EF]" />
              <h1 className="section-title text-xl">Quick Idea Generator</h1>
            </div>
            <p className="section-sub">
              AI Content Strategist + Production Planner. Get 5 complete execution packages with concepts, strategy, and frame-by-frame prompts.
            </p>
          </div>

          {/* Alert */}
          {alert && (
            <div className={`alert-${alert.type} animate-in fade-in duration-300`}>
              {alert.type === "error" ? (
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
              ) : (
                <CheckCircle size={15} className="mt-0.5 shrink-0" />
              )}
              <span>{alert.message}</span>
            </div>
          )}

          {/* Form */}
          <div className="card">
            <h2 className="text-sm font-bold text-[#F0F2F8] mb-4 flex items-center gap-2">
              <Zap size={14} className="text-[#53A9EF]" />
              Define Your Content Goals
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="sm:col-span-2">
                <label className="label">Topic / City / Campaign Need *</label>
                <input
                  className="input"
                  placeholder="e.g. Jaipur travel, Monsoon getaways, Diwali in Varanasi"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                />
              </div>
              <div>
                <label className="label">Platform *</label>
                <select
                  className="select"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {PLATFORM_EMOJI[p]} {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Tone *</label>
                <select
                  className="select"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  {TONES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Target Audience *</label>
                <input
                  className="input"
                  placeholder="e.g. Solo travelers, Startup founders, Budget backpackers"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>
            </div>
            <button onClick={handleGenerate} disabled={generating} className="btn-primary w-full">
              {generating ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> 
                  Consulting AI Strategist...
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Generate 5 AI Concepts
                </>
              )}
            </button>
          </div>

          {/* Generated ideas */}
          {ideas.length > 0 && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="section-title">Execution Packages</h2>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${generationSource === 'AI' ? 'bg-[#53A9EF]/10 text-[#53A9EF] border-[#53A9EF]/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                      {generationSource === 'AI' ? 'POWERED BY GROQ' : 'FALLBACK MODE'}
                    </span>
                  </div>
                  <p className="section-sub">
                    Targeting {targetAudience} on {platform}
                  </p>
                </div>
                <button onClick={handleSave} disabled={saving} className="btn-secondary">
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} /> Save Strategy
                    </>
                  )}
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {ideas.map((idea, i) => (
                  <IdeaCard key={i} idea={idea} index={i} generationSource={generationSource || "Rule-based"} />
                ))}
              </div>
            </div>
          )}

          {/* History */}
          <div className="divider" />
          <div className="pb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Saved Strategy History</h2>
              <button
                onClick={loadHistory}
                disabled={loadingHistory}
                className="btn-secondary text-xs"
              >
                {loadingHistory ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Loading...
                  </>
                ) : (
                  <>
                    <Clock size={12} /> Load Recent
                  </>
                )}
              </button>
            </div>
            {savedIdeas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedIdeas.map((s) => (
                  <SavedIdeaRow key={s._id} saved={s} />
                ))}
              </div>
            ) : (
              <div className="card border-dashed text-center py-8">
                <Lightbulb size={24} className="text-[#555870] mx-auto mb-2" />
                <p className="text-sm text-[#555870]">
                  No saved strategies yet. Click &quot;Load Recent&quot; after saving.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
