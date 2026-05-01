import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  RefreshCcw,
  ChevronRight,
  BarChart3,
  X,
  Zap,
  Info,
  Sparkles,
  FileText,
  Video,
  ShieldAlert,
  ArrowRight,
  Globe
} from "lucide-react";
import { ThumbnailCard, IReferenceItem } from "./ChatComponents";

/**
 * REFINED LIST CARD (Vertical Grid)
 */
const TrendCard = ({ trend, idx, onAnalyze, source, isFallback }: any) => {
  return (
    <div className={`group relative bg-[#0F111A] border p-8 rounded-[48px] transition-all shadow-2xl overflow-hidden ${isFallback ? "border-amber-500/10 hover:border-amber-500/40" : "border-[#2A2D3E] hover:border-[#53A9EF]/40"
      }`}>
      {/* Index Number Background */}
      <span className="absolute -right-6 -bottom-8 text-[12rem] font-black text-[#1A1D27] group-hover:text-[#53A9EF]/5 transition-colors select-none pointer-events-none leading-none">
        {String(idx + 1).padStart(2, '0')}
      </span>

      <div className="relative z-10">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border ${isFallback
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                : "bg-[#53A9EF]/10 text-[#53A9EF] border-[#53A9EF]/20"
                }`}>
                {isFallback ? "AI Suggested" : source.replace("Google Trends ", "")}
              </span>
              {!isFallback && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase tracking-[0.2em]">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                </span>
              )}
            </div>
            <p className="text-[10px] text-[#555870] font-black uppercase tracking-widest">{trend.traffic || "High Demand"}</p>
          </div>
          <h3 className="text-2xl font-bold text-white group-hover:text-[#53A9EF] transition-colors leading-tight line-clamp-2">
            {trend.title}
          </h3>
        </div>

        <div className="space-y-3 mb-10 min-h-[60px]">
          {trend.articles && trend.articles.length > 0 ? (
            trend.articles.slice(0, 2).map((art: any, i: number) => (
              <div key={i} className="flex items-start gap-3 text-[11px] text-[#8B90A7] leading-relaxed">
                <ArrowRight size={10} className="mt-1 shrink-0 text-[#53A9EF] opacity-40" />
                <span className="line-clamp-1">{art.title}</span>
              </div>
            ))
          ) : (
            <div className="flex flex-wrap gap-2">
              {trend.relatedQueries?.slice(0, 3).map((q: string) => (
                <span key={q} className="text-[10px] font-bold text-[#555870] bg-[#1A1D27] px-4 py-2 rounded-full border border-[#2A2D3E]">
                  {q}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => onAnalyze(trend.title)}
          className={`w-full py-5 rounded-[24px] text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-xl transition-all flex items-center justify-center gap-3 group/btn ${isFallback ? "bg-amber-500 hover:bg-amber-600" : "bg-[#53A9EF] hover:bg-[#2B90E6]"
            }`}
        >
          <Zap size={16} className="group-hover/btn:scale-125 transition-transform" />
          Analyze Signal
        </button>
      </div>
    </div>
  );
};

/**
 * MAIN DASHBOARD COMPONENT (Vertical List)
 */
export const DailyTrendDashboard = ({ onDiveDeeper }: { onDiveDeeper: (k: string) => void }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);

  const fetchTrends = async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const endpoint = forceRefresh ? "/api/google-trends/refresh" : "/api/google-trends/daily";
      const res = await fetch(endpoint, { method: forceRefresh ? "POST" : "GET" });
      const json = await res.json();

      console.log(`[Frontend] Sync complete. Source: ${json.source} | Count: ${json.trends?.length}`);
      if (json.success) setData(json);
    } catch (err) {
      console.error("[Frontend] Sync failed:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchTrends(); }, []);

  if (loading) return (
    <div className="w-full h-[400px] flex flex-col items-center justify-center bg-[#0F111A]/50 rounded-[60px] border border-[#2A2D3E] mt-10">
      <div className="w-16 h-16 relative mb-6">
        <div className="absolute inset-0 border-3 border-[#53A9EF]/20 rounded-full" />
        <div className="absolute inset-0 border-3 border-[#53A9EF] rounded-full border-t-transparent animate-spin" />
        <TrendingUp size={24} className="text-[#53A9EF] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="text-lg font-black text-white tracking-tight">Syncing Google Trends</p>
    </div>
  );

  const isFallback = data?.source === "AI Fallback Engine";

  return (
    <div className="space-y-12">
      {/* 1. Dashboard Header */}
      <div className="flex justify-between items-end px-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-3xl font-black text-white tracking-tight">
              {isFallback ? "Suggested Discoveries" : "Top 10 Trends"}
            </h2>
            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border ${isFallback ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              }`}>
              {isFallback ? "Fallback Active" : "Verified Source"}
            </span>
          </div>
          <p className="text-sm text-[#8B90A7] font-medium max-w-xl leading-relaxed">
            {isFallback
              ? "Live Google feeds restricted. Displaying AI-Synthesized Roadmap."
              : `Processing ${data?.trends?.length} high-velocity signals via ${data?.source}.`}
          </p>
        </div>

        <button
          onClick={() => fetchTrends(true)}
          disabled={isRefreshing}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#1A1D27] border border-[#2A2D3E] text-white font-black text-[11px] uppercase tracking-[0.3em] hover:bg-[#53A9EF] hover:border-[#53A9EF] transition-all group disabled:opacity-50"
        >
          <RefreshCcw size={16} className={`${isRefreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
          {isRefreshing ? "Syncing..." : "Refresh Signals"}
        </button>
      </div>

      {/* 2. List Grid Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        {data?.trends?.map((trend: any, idx: number) => (
          <TrendCard
            key={idx}
            trend={trend}
            idx={idx}
            onAnalyze={(k: string) => setSelectedKeyword(k)}
            source={data.source}
            isFallback={isFallback}
          />
        ))}
      </div>

      {/* 3. Detail Modal Integration */}
      {selectedKeyword && (
        <DailyTrendDetail
          keyword={selectedKeyword}
          onClose={() => setSelectedKeyword(null)}
          onDiveDeeper={onDiveDeeper}
        />
      )}
    </div>
  );
};

/**
 * PREMIUM INTELLIGENCE MODAL
 */
const DailyTrendDetail = ({ keyword, onClose, onDiveDeeper }: { keyword: string, onClose: () => void, onDiveDeeper: (k: string) => void }) => {
  const [detail, setDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch("/api/google-trends/detail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword })
        });
        const data = await res.json();
        if (data.success) setDetail(data);
      } catch (err) {
        console.error("Failed to fetch details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [keyword]);

  const hasRegionData = detail?.interestByRegion?.some((r: any) => r.value[0] > 0);

  return (
    <div className="fixed top-20 inset-x-0 bottom-0 z-[100] flex items-center justify-center p-6 md:p-10 bg-[#0A0C14]/20 backdrop-blur-2xl overflow-hidden">
      <div className="bg-[#0F111A] border border-[#2A2D3E] w-full max-w-4xl h-full max-h-[85vh] overflow-y-auto rounded-[40px] shadow-[0_20px_100px_rgba(0,0,0,0.5)] relative scrollbar-thin flex flex-col">

        {/* Detail Header */}
        <div className="sticky top-0 bg-[#0F111A]/95 backdrop-blur-md p-8 md:p-10 border-b border-[#2A2D3E] z-20 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#53A9EF]/10 text-[#53A9EF] border border-[#53A9EF]/20 text-[9px] font-black uppercase tracking-[0.4em]">
                Intelligence Report
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">{keyword}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-[#1A1D27] border border-[#2A2D3E] text-[#555870] hover:text-white hover:border-white/20 transition-all flex items-center justify-center group"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-16">
            <div className="w-16 h-16 relative mb-8">
              <div className="absolute inset-0 border-3 border-[#53A9EF]/10 rounded-full" />
              <div className="absolute inset-0 border-3 border-[#53A9EF] rounded-full border-t-transparent animate-spin" />
              <Sparkles size={24} className="text-[#53A9EF] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-xl font-black text-white mb-2">Analyzing Signal</p>
            <p className="text-[10px] text-[#555870] uppercase font-black tracking-[0.4em] animate-pulse">Llama-3.3 Intelligence</p>
          </div>
        ) : (
          <div className="flex-1 p-8 md:p-10 space-y-16">

            {/* Top Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                <section>
                  <h4 className="text-[10px] font-black text-[#555870] uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                    <Info size={14} className="text-[#53A9EF]" /> Background
                  </h4>
                  <p className="text-xl text-[#F0F2F8] leading-relaxed font-bold border-l-4 border-[#53A9EF] pl-6 py-2 italic">
                    "{detail?.explanation}"
                  </p>
                </section>

                <section>
                  <h4 className="text-[10px] font-black text-[#555870] uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                    <BarChart3 size={14} className="text-[#53A9EF]" /> Trigger
                  </h4>
                  <p className="text-sm text-[#8B90A7] leading-relaxed font-medium">
                    {detail?.whyTrending}
                  </p>
                </section>
              </div>

              <div className="space-y-6">
                <div className="bg-[#53A9EF]/5 border border-[#53A9EF]/20 p-8 rounded-[32px] relative overflow-hidden group">
                  <h4 className="text-[9px] font-black text-[#53A9EF] uppercase tracking-[0.4em] mb-4">YesCity Strategy</h4>
                  <p className="text-lg text-white font-black leading-tight relative z-10">
                    {detail?.yesCityAngle}
                  </p>
                </div>

                {detail?.strategicRec && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[32px]">
                    <h4 className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-4">Expert Tip</h4>
                    <p className="text-[11px] text-emerald-100 font-medium leading-relaxed italic">
                      "{detail.strategicRec}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Execution Strategy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-12 border-t border-[#2A2D3E]">
              {/* POST STRATEGY */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1D27] flex items-center justify-center border border-[#2A2D3E]">
                    <FileText size={18} className="text-[#53A9EF]" />
                  </div>
                  <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Post Execution Blueprint</h4>
                </div>

                {detail?.postIdeas?.slice(0, 1).map((idea: any, i: number) => (
                  <div key={i} className="space-y-6">
                    <div className="p-6 rounded-[32px] bg-[#1A1D27] border border-[#2A2D3E]">
                      <h5 className="text-lg text-white font-black mb-2 tracking-tight">{idea.title}</h5>
                      <p className="text-sm text-[#8B90A7] leading-relaxed mb-6">{idea.concept}</p>
                      
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-[#0F111A] border border-[#2A2D3E]/50">
                          <span className="text-[8px] text-[#555870] font-black uppercase tracking-widest block mb-2">Caption & CTA</span>
                          <p className="text-xs text-[#F0F2F8] leading-relaxed italic">"{idea.caption}"</p>
                          <p className="text-[10px] text-[#53A9EF] font-bold mt-3">👉 {idea.cta}</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#0F111A] border border-[#2A2D3E]/50">
                          <span className="text-[8px] text-[#555870] font-black uppercase tracking-widest block mb-2">Scene / Slide Breakdown</span>
                          <div className="space-y-2">
                            {idea.sceneBreakdown?.map((step: string, idx: number) => (
                              <div key={idx} className="flex gap-3 text-[11px]">
                                <span className="text-[#53A9EF] font-black">{idx + 1}.</span>
                                <span className="text-[#F0F2F8]/80">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#53A9EF]/5 border border-[#53A9EF]/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={10} className="text-[#53A9EF]" />
                            <span className="text-[8px] text-[#53A9EF] font-black uppercase tracking-widest">AI Image Generation Prompt</span>
                          </div>
                          <p className="text-[11px] text-[#F0F2F8] font-medium leading-relaxed bg-[#0F111A]/50 p-3 rounded-xl border border-[#2A2D3E]">
                            {idea.aiPrompt || "Cinematic street photography of Mumbai during twilight, vibrant local culture, 8k resolution."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              {/* REEL STRATEGY */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1D27] flex items-center justify-center border border-[#2A2D3E]">
                    <Video size={18} className="text-[#53A9EF]" />
                  </div>
                  <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Reel Production Blueprint</h4>
                </div>

                {detail?.reelIdeas?.slice(0, 1).map((idea: any, i: number) => (
                  <div key={i} className="space-y-6">
                    <div className="p-6 rounded-[32px] bg-[#1A1D27] border border-[#2A2D3E]">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="text-lg text-white font-black tracking-tight">{idea.title}</h5>
                        <span className="px-3 py-1 rounded-lg bg-[#53A9EF]/10 text-[#53A9EF] text-[9px] font-black uppercase tracking-wider border border-[#53A9EF]/20">{idea.format}</span>
                      </div>
                      <p className="text-sm text-[#8B90A7] leading-relaxed mb-6">{idea.concept}</p>
                      
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-[#0F111A] border border-[#2A2D3E]/50">
                          <span className="text-[8px] text-[#555870] font-black uppercase tracking-widest block mb-2">Visual Hook</span>
                          <p className="text-[13px] text-[#53A9EF] font-black italic leading-tight">"{idea.hook}"</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#0F111A] border border-[#2A2D3E]/50">
                          <span className="text-[8px] text-[#555870] font-black uppercase tracking-widest block mb-2">Storyboard Breakdown</span>
                          <div className="space-y-2">
                            {idea.sceneBreakdown?.map((step: string, idx: number) => (
                              <div key={idx} className="flex gap-3 text-[11px]">
                                <span className="text-[#53A9EF] font-black">{idx + 1}.</span>
                                <span className="text-[#F0F2F8]/80">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#53A9EF]/5 border border-[#53A9EF]/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={10} className="text-[#53A9EF]" />
                            <span className="text-[8px] text-[#53A9EF] font-black uppercase tracking-widest">AI Video Creation Prompt</span>
                          </div>
                          <p className="text-[11px] text-[#F0F2F8] font-medium leading-relaxed bg-[#0F111A]/50 p-3 rounded-xl border border-[#2A2D3E]">
                            {idea.aiPrompt || "High-energy drone shot passing through a bustling Mumbai market, cinematic lighting, 4k 60fps."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            </div>


            {/* Signal Context */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-[#2A2D3E]">
              {/* Phase 3: Live References */}
              <section className="md:col-span-3">
                <div className="flex flex-col gap-1 mb-6">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-2">
                    <Sparkles size={14} className="text-[#53A9EF]" /> Live Content References
                  </h4>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <p className="text-[10px] text-[#555870] font-medium leading-relaxed max-w-lg">
                      Real-world examples analyzed by AI for production strategy.
                    </p>
                    {/* Budget Protection Message */}
                    {detail?.references?.find((r: any) => r._apifySkipReason && r._apifySkipReason.includes('budget')) && (
                      <span className="text-[9px] text-amber-500/80 font-black uppercase tracking-widest italic bg-amber-500/5 px-3 py-1 rounded-full border border-amber-500/10">
                        ⚠️ Instagram skipped: {detail.references.find((r: any) => r._apifySkipReason)._apifySkipReason.replace(/-/g, ' ')}
                      </span>
                    )}
                  </div>
                </div>
                
                {detail?.references && detail.references.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {detail.references.map((ref: any, i: number) => (
                      <ThumbnailCard key={i} item={ref} />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-[40px] bg-[#1A1D27]/50 border border-[#2A2D3E] border-dashed text-center">
                    <p className="text-[10px] text-[#555870] uppercase font-black tracking-widest italic">Live references unavailable right now.</p>
                  </div>
                )}
              </section>

              {/* Regional Interest */}
              <section className="md:col-span-1">
                <h4 className="text-[10px] font-black text-[#555870] uppercase tracking-[0.4em] mb-6">Regional Interest</h4>
                <div className="space-y-3">
                  {hasRegionData ? (
                    detail.interestByRegion.slice(0, 5).map((reg: any) => (
                      <div key={reg.geoName} className="flex justify-between items-center bg-[#1A1D27] p-3 rounded-xl border border-[#2A2D3E]">
                        <span className="text-[10px] text-[#F0F2F8] font-black">{reg.geoName}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-1 bg-[#0F111A] rounded-full overflow-hidden">
                            <div className="h-full bg-[#53A9EF]" style={{ width: `${reg.value[0]}%` }} />
                          </div>
                          <span className="text-[10px] text-[#53A9EF] font-black">{reg.value[0]}%</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 rounded-[24px] border border-dashed border-[#2A2D3E] text-center bg-[#1A1D27]/20">
                      <p className="text-[9px] text-[#555870] uppercase font-black tracking-[0.4em]">Data restricted</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Phase 2: Platform Research Pathways */}
              <section className="p-8 bg-[#1A1D27]/50 rounded-[40px] border border-[#2A2D3E] md:col-span-2">
                <div className="flex flex-col gap-2 mb-8">
                  <div className="flex items-center gap-3">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Platform Research Pathways</h4>
                    {detail?.topicExpansion ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-bold uppercase">Enhanced</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[8px] font-bold uppercase">Basic</span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#555870] font-medium leading-relaxed max-w-lg">
                    Use these suggested search pathways to research how this trend is appearing across platforms and discover local market angles.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-3">
                    <span className="text-[8px] text-[#555870] font-black uppercase tracking-widest flex items-center gap-1">Instagram</span>
                    <div className="flex flex-wrap gap-2">
                      {(detail?.topicExpansion?.instagramHashtags || detail?.platformQueries?.instagram || []).slice(0, 5).map((q: string) => (
                        <span key={q} className="text-[10px] text-[#53A9EF] font-bold bg-[#53A9EF]/10 px-2.5 py-1.5 rounded-lg border border-[#53A9EF]/10">{q}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <span className="text-[8px] text-[#555870] font-black uppercase tracking-widest flex items-center gap-1">YouTube Search</span>
                    <div className="flex flex-col gap-2">
                      {(detail?.topicExpansion?.youtubeQueries || detail?.platformQueries?.youtube || []).slice(0, 3).map((q: string) => (
                        <span key={q} className="text-[10px] text-[#F0F2F8] bg-[#2A2D3E]/50 px-3 py-2 rounded-xl border border-[#2A2D3E] leading-relaxed">{q}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <span className="text-[8px] text-[#555870] font-black uppercase tracking-widest flex items-center gap-1">LinkedIn / X Context</span>
                    <div className="flex flex-col gap-2">
                      {(detail?.topicExpansion?.linkedinQueries || detail?.platformQueries?.linkedin || []).slice(0, 2).map((q: string) => (
                        <span key={q} className="text-[10px] text-[#8B90A7] bg-[#2A2D3E]/50 px-3 py-2 rounded-xl border border-[#2A2D3E] leading-relaxed">{q}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <span className="text-[8px] text-[#555870] font-black uppercase tracking-widest flex items-center gap-1">Local Discovery Angles</span>
                    <div className="flex flex-col gap-2">
                      {(detail?.topicExpansion?.localAngles || []).slice(0, 2).map((q: string) => (
                        <span key={q} className="text-[10px] text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl leading-relaxed border border-emerald-500/10 font-medium">{q}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="pb-10 text-center">
              <button
                onClick={onClose}
                className="px-10 py-4 rounded-[24px] bg-[#1A1D27] border border-[#2A2D3E] text-[#555870] text-[10px] font-black uppercase tracking-[0.5em] hover:text-white hover:border-[#53A9EF]/50 transition-all shadow-xl"
              >
                Close Intelligence
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
