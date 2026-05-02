"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Send, 
  RefreshCcw, 
  Lightbulb, 
  Layout, 
  Video, 
  Clock, 
  Target, 
  ChevronDown, 
  ChevronUp,
  Workflow,
  Zap
} from "lucide-react";

export function IdeaGeneratorDashboard() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [audience, setAudience] = useState("Local Explorers");
  const [tone, setTone] = useState("Witty & Insider");
  const [objective, setObjective] = useState("Engagement");
  
  const [ideas, setIdeas] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setIdeas(null);
    try {
      const res = await fetch("/api/ideas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic, 
          platform, 
          targetAudience: audience, 
          tone, 
          objective 
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIdeas(data.data);
      }
    } catch (err) {
      console.error("Failed to generate ideas", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Input Header */}
      <div className="bg-[#1A1D27] border border-[#2A2D3E] rounded-[40px] p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#53A9EF]/10 flex items-center justify-center border border-[#53A9EF]/20">
            <Lightbulb size={24} className="text-[#53A9EF]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Quick Idea Generator</h2>
            <p className="text-[#8B90A7] text-sm">Transform any topic into a 10-part production sprint.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-[#555870] uppercase tracking-widest block mb-2">Primary Topic</label>
            <input 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Best butter chicken in South Delhi"
              className="w-full bg-[#0F111A] border border-[#2A2D3E] text-white rounded-2xl px-6 py-4 focus:border-[#53A9EF]/50 transition-all outline-none"
            />
          </div>
          
          <div>
            <label className="text-[10px] font-bold text-[#555870] uppercase tracking-widest block mb-2">Platform</label>
            <select 
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-[#0F111A] border border-[#2A2D3E] text-white rounded-2xl px-6 py-4 focus:border-[#53A9EF]/50 transition-all outline-none appearance-none"
            >
              <option>Instagram</option>
              <option>YouTube</option>
              <option>LinkedIn</option>
              <option>X (Twitter)</option>
              <option>Blog</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#555870] uppercase tracking-widest block mb-2">Target Audience</label>
            <input 
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full bg-[#0F111A] border border-[#2A2D3E] text-white rounded-2xl px-6 py-4 focus:border-[#53A9EF]/50 transition-all outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#555870] uppercase tracking-widest block mb-2">Desired Tone</label>
            <input 
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-[#0F111A] border border-[#2A2D3E] text-white rounded-2xl px-6 py-4 focus:border-[#53A9EF]/50 transition-all outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#555870] uppercase tracking-widest block mb-2">Marketing Objective</label>
            <select 
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full bg-[#0F111A] border border-[#2A2D3E] text-white rounded-2xl px-6 py-4 focus:border-[#53A9EF]/50 transition-all outline-none appearance-none"
            >
              <option>Engagement</option>
              <option>Brand Awareness</option>
              <option>Traffic / Clicks</option>
              <option>Community Growth</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isLoading || !topic.trim()}
          className="w-full mt-8 py-4 rounded-2xl bg-[#53A9EF] text-white font-bold flex items-center justify-center gap-3 hover:bg-[#2B90E6] transition-all disabled:opacity-50"
        >
          {isLoading ? <RefreshCcw className="animate-spin" /> : <Sparkles />}
          {isLoading ? "CRAFTING YOUR STRATEGY..." : "GENERATE PRODUCTION PACKAGES"}
        </button>
      </div>

      {/* Results */}
      {ideas && (
        <div className="space-y-12">
          {/* Posts Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Layout className="text-[#53A9EF]" size={20} />
              <h3 className="text-xl font-bold text-white">Static & Carousel Posts</h3>
              <span className="text-xs font-bold text-[#555870] bg-[#1A1D27] px-3 py-1 rounded-full border border-[#2A2D3E]">5 STRATEGIES</span>
            </div>

            <div className="space-y-4">
              {ideas.postIdeas?.map((idea: any, idx: number) => (
                <IdeaCard 
                  key={`post-${idx}`} 
                  idea={idea} 
                  type="post" 
                  idx={idx}
                  isExpanded={expandedId === `post-${idx}`}
                  onToggle={() => setExpandedId(expandedId === `post-${idx}` ? null : `post-${idx}`)}
                />
              ))}
              {(!ideas.postIdeas || ideas.postIdeas.length === 0) && (
                <div className="p-8 text-center border border-dashed border-[#2A2D3E] rounded-3xl text-[#555870]">
                  No post ideas generated.
                </div>
              )}
            </div>
          </section>

          {/* Reels Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Video className="text-[#F87171]" size={20} />
              <h3 className="text-xl font-bold text-white">Reels & Short Video</h3>
              <span className="text-xs font-bold text-[#555870] bg-[#1A1D27] px-3 py-1 rounded-full border border-[#2A2D3E]">5 STRATEGIES</span>
            </div>

            <div className="space-y-4">
              {ideas.reelIdeas?.map((idea: any, idx: number) => (
                <IdeaCard 
                  key={`reel-${idx}`} 
                  idea={idea} 
                  type="reel" 
                  isExpanded={expandedId === `reel-${idx}`}
                  onToggle={() => setExpandedId(expandedId === `reel-${idx}` ? null : `reel-${idx}`)}
                />
              ))}
              {(!ideas.reelIdeas || ideas.reelIdeas.length === 0) && (
                <div className="p-8 text-center border border-dashed border-[#2A2D3E] rounded-3xl text-[#555870]">
                  No reel ideas generated.
                </div>
              )}
            </div>
          </section>

          {/* Platform Recs */}
          <div className="p-8 rounded-[40px] bg-[#53A9EF]/5 border border-[#53A9EF]/10 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h4 className="text-lg font-bold text-white mb-2">Strategic Recommendation</h4>
              <p className="text-sm text-[#8B90A7] leading-relaxed">{ideas.contentCalendarSuggestion || "Start posting consistently to see better results."}</p>
            </div>
            <div className="flex gap-2">
              {ideas.recommendedPlatforms?.map((p: string, i: number) => (
                <span key={i} className="px-4 py-2 rounded-xl bg-[#1A1D27] border border-[#2A2D3E] text-xs font-bold text-white">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IdeaCard({ idea, type, idx, isExpanded, onToggle }: { idea: any, type: "post" | "reel", idx: number, isExpanded: boolean, onToggle: () => void }) {
  return (
    <div className={`bg-[#1A1D27] border ${isExpanded ? 'border-[#53A9EF]/50' : 'border-[#2A2D3E]'} rounded-3xl overflow-hidden transition-all`}>
      <button 
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl ${type === 'reel' ? 'bg-[#F87171]/10' : 'bg-[#53A9EF]/10'} flex items-center justify-center border ${type === 'reel' ? 'border-[#F87171]/20' : 'border-[#53A9EF]/20'}`}>
            {type === 'reel' ? <Video size={18} className="text-[#F87171]" /> : <Layout size={18} className="text-[#53A9EF]" />}
          </div>
          <div>
            <h4 className="font-bold text-white leading-tight">{idea.title}</h4>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-bold text-[#555870] uppercase tracking-widest">{idea.difficulty}</span>
              <span className="w-1 h-1 rounded-full bg-[#2A2D3E]" />
              <span className="text-[10px] font-bold text-[#555870] uppercase tracking-widest">{idea.estimatedTime}</span>
            </div>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="text-[#555870]" /> : <ChevronDown className="text-[#555870]" />}
      </button>

      {isExpanded && (
        <div className="px-6 pb-8 pt-2 space-y-6 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold text-[#53A9EF] uppercase tracking-[0.2em] block mb-2">The Concept</span>
                <p className="text-sm text-[#F0F2F8] leading-relaxed">{idea.concept}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#53A9EF] uppercase tracking-[0.2em] block mb-2">Visual Hook</span>
                <p className="text-sm font-bold text-white bg-[#0F111A] p-4 rounded-2xl border border-[#2A2D3E]">"{idea.hook}"</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#53A9EF] uppercase tracking-[0.2em] block mb-2">The Caption</span>
                <div className="text-xs text-[#8B90A7] bg-[#0F111A] p-4 rounded-2xl border border-[#2A2D3E] whitespace-pre-wrap leading-relaxed italic">
                  {idea.caption}
                  <div className="mt-4 text-[#53A9EF] font-bold uppercase tracking-widest">{idea.CTA}</div>
                  <div className="mt-2 text-[#555870]">{idea.hashtags}</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold text-[#53A9EF] uppercase tracking-[0.2em] block mb-3">Execution Steps</span>
                <div className="space-y-2">
                  {(idea.executionSteps || idea.sceneBreakdown || []).map((step: any, i: number) => (
                    <div key={i} className="flex gap-3 items-start p-3 rounded-xl bg-[#0F111A] border border-[#2A2D3E]">
                      <div className="w-5 h-5 rounded-md bg-[#1A1D27] flex items-center justify-center text-[10px] font-bold text-[#53A9EF] shrink-0 border border-[#2A2D3E]">{i+1}</div>
                      <div className="flex flex-col gap-0.5">
                        {typeof step === 'object' && step.time && (
                          <span className="text-[9px] font-black text-[#53A9EF] uppercase tracking-widest">{step.time}</span>
                        )}
                        <p className="text-xs text-[#F0F2F8]">
                          {typeof step === 'object' 
                            ? (
                                <span className="flex flex-col gap-1">
                                  <span>{step.step || step.instruction || step.scene || JSON.stringify(step)}</span>
                                  {step.location && <span className="text-[10px] text-emerald-400 font-bold italic">📍 {step.location}</span>}
                                </span>
                              )
                            : step}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[#53A9EF]/5 border border-[#53A9EF]/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[#53A9EF]" />
                    <span className="text-[10px] font-black text-[#53A9EF] uppercase tracking-widest">AI Asset Generation Prompt</span>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(idea.aiPrompt);
                      const btn = document.getElementById(`copy-btn-${idx}-${type}`);
                      if (btn) {
                        btn.innerHTML = 'COPIED!';
                        setTimeout(() => { btn.innerHTML = 'COPY'; }, 2000);
                      }
                    }}
                    id={`copy-btn-${idx}-${type}`}
                    className="text-[9px] font-black text-white bg-[#53A9EF] px-3 py-1 rounded-lg hover:bg-[#2B90E6] transition-all"
                  >
                    COPY
                  </button>
                </div>
                <div className="relative group/prompt">
                  <p className="text-[11px] text-[#F0F2F8] font-medium leading-relaxed bg-[#0F111A]/80 p-4 rounded-2xl border border-[#2A2D3E] group-hover/prompt:border-[#53A9EF]/30 transition-all italic">
                    {idea.aiPrompt || "Cinematic shot, 8k resolution, highly detailed."}
                  </p>
                </div>
              </div>

              {idea.editingStyle && (
                 <div>
                 <span className="text-[10px] font-bold text-[#F87171] uppercase tracking-[0.2em] block mb-2">Editing Style</span>
                 <p className="text-xs text-[#F87171] font-medium px-4 py-2 rounded-xl bg-[#F87171]/5 border border-[#F87171]/10 inline-block">{idea.editingStyle}</p>
               </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
