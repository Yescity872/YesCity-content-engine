import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  RefreshCcw, 
  Lightbulb, 
  ArrowRight, 
  ChevronRight, 
  BarChart3, 
  Globe2, 
  Search, 
  X,
  Zap,
  Info,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  FileText,
  Video
} from "lucide-react";

export const DailyTrendView = () => {
  const [trends, setTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTrend, setSelectedTrend] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>({});

  const fetchTrends = async (isRefresh = false) => {
    try {
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      
      const endpoint = isRefresh ? "/api/google-trends/refresh" : "/api/google-trends/daily";
      const res = await fetch(endpoint, { method: isRefresh ? "POST" : "GET" });
      const data = await res.json();
      
      if (data.success) {
        setTrends(data.trends);
        setMeta({ 
          source: data.source, 
          isFallback: data.isFallback,
          dateKey: data.dateKey 
        });
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Daily Trends are unavailable right now.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="h-40 bg-[#1A1D27] border border-[#2A2D3E] rounded-3xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center bg-[#1A1D27] rounded-[32px] border border-[#2A2D3E]">
        <ShieldAlert className="mx-auto text-rose-500 mb-4" size={40} />
        <p className="text-[#8B90A7]">{error}</p>
        <button onClick={() => fetchTrends()} className="mt-4 text-[#53A9EF] text-sm font-bold uppercase tracking-widest">Retry Connection</button>
      </div>
    );
  }

  const isFallback = meta.isFallback;

  return (
    <div className="space-y-8">
      {/* Header & Source Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1A1D27]/50 p-6 rounded-[32px] border border-[#2A2D3E]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-white">
              {isFallback ? "Suggested Trend Ideas" : "Top 10 Trends (India)"}
            </h2>
            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-[0.2em] border ${
              isFallback 
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            }`}>
              {meta.source || "Live"}
            </span>
          </div>
          <p className="text-[10px] text-[#555870] font-bold uppercase tracking-widest">
            {isFallback 
              ? "Emergency fallback triggered: Live Google data restricted." 
              : `Real-time intelligence from ${meta.source}`}
          </p>
        </div>
        
        <button 
          onClick={() => fetchTrends(true)}
          disabled={isRefreshing}
          className="px-6 py-3 rounded-2xl bg-[#0F111A] border border-[#2A2D3E] text-[#53A9EF] hover:border-[#53A9EF]/40 transition-all flex items-center gap-2 shadow-xl group"
        >
          <RefreshCcw size={16} className={`${isRefreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Force Refresh</span>
        </button>
      </div>

      {isFallback && (
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10">
          <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-500/80 leading-relaxed font-medium">
            Google Trends is currently restricting automated access. The topics shown below are **AI-Suggested Ideas** based on your target Indian niches and historical demand patterns.
          </p>
        </div>
      )}

      {/* Trends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trends.map((trend, idx) => (
          <div key={trend.title} className="group relative bg-[#0F111A] border border-[#2A2D3E] p-8 rounded-[40px] hover:border-[#53A9EF]/50 transition-all shadow-2xl overflow-hidden">
            {/* Index Background */}
            <span className="absolute -right-4 -bottom-6 text-9xl font-black text-[#1A1D27] group-hover:text-[#53A9EF]/5 transition-colors select-none pointer-events-none">
              {String(idx + 1).padStart(2, '0')}
            </span>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#53A9EF] transition-colors leading-tight">{trend.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/5 px-2 py-1 rounded-md border border-emerald-400/10">
                      <TrendingUp size={12} /> {trend.traffic}
                    </span>
                  </div>
                </div>
              </div>

              {/* Related Preview */}
              {trend.articles?.length > 0 ? (
                <div className="space-y-2 mb-8">
                  <p className="text-[9px] font-black text-[#555870] uppercase tracking-[0.2em] mb-2">Recent News Coverage</p>
                  {trend.articles.slice(0, 2).map((art: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-[#8B90A7] hover:text-[#53A9EF] transition-colors cursor-pointer">
                      <ExternalLink size={10} className="shrink-0 opacity-50" />
                      <span className="truncate underline decoration-[#2A2D3E] underline-offset-4">{art.title}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mb-8">
                  {trend.relatedQueries?.slice(0, 3).map((q: string) => (
                    <span key={q} className="text-[9px] font-bold text-[#555870] bg-[#1A1D27] px-3 py-1.5 rounded-full border border-[#2A2D3E]">
                      {q}
                    </span>
                  ))}
                </div>
              )}

              <button 
                onClick={() => setSelectedTrend(trend)}
                className="w-full py-4 rounded-[20px] bg-[#53A9EF] text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#2B90E6] shadow-xl hover:shadow-[#53A9EF]/20 transition-all flex items-center justify-center gap-2 group/btn"
              >
                <Sparkles size={14} className="group-hover/btn:rotate-12 transition-transform" /> 
                Build Intelligence
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedTrend && (
        <DailyTrendDetail 
          keyword={selectedTrend.title} 
          onClose={() => setSelectedTrend(null)} 
        />
      )}
    </div>
  );
};

const DailyTrendDetail = ({ keyword, onClose }: { keyword: string, onClose: () => void }) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-[#0F111A]/95 backdrop-blur-2xl overflow-hidden">
      <div className="bg-[#0F111A] border border-[#2A2D3E] w-full max-w-5xl h-full max-h-[95vh] overflow-y-auto rounded-[48px] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative scrollbar-thin flex flex-col">
        
        {/* Detail Header */}
        <div className="sticky top-0 bg-[#0F111A]/80 backdrop-blur-md p-8 md:p-12 border-b border-[#2A2D3E] z-20 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-8 rounded-lg bg-[#53A9EF]/10 flex items-center justify-center border border-[#53A9EF]/20">
                <TrendingUp size={18} className="text-[#53A9EF]" />
              </span>
              <p className="text-[10px] font-black text-[#53A9EF] uppercase tracking-[0.4em]">Intelligence Report</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">{keyword}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-4 rounded-2xl bg-[#1A1D27] border border-[#2A2D3E] text-[#555870] hover:text-white hover:border-white/20 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20">
            <div className="relative mb-10">
              <RefreshCcw size={64} className="text-[#53A9EF] animate-spin opacity-20" />
              <Sparkles size={32} className="text-[#53A9EF] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-lg font-bold text-white mb-2">Synthesizing Signal Intelligence</p>
            <p className="text-sm text-[#555870] uppercase font-black tracking-[0.3em] animate-pulse">Groq Llama-3.3 Processing...</p>
          </div>
        ) : (
          <div className="flex-1 p-8 md:p-12 space-y-16">
            
            {/* Top Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-10">
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <Info size={16} className="text-[#53A9EF]" />
                    <h4 className="text-[11px] font-black text-[#555870] uppercase tracking-[0.3em]">Trend Background</h4>
                  </div>
                  <p className="text-xl text-[#F0F2F8] leading-relaxed font-semibold italic border-l-4 border-[#53A9EF] pl-6 py-2">
                    "{detail?.explanation}"
                  </p>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart3 size={16} className="text-[#53A9EF]" />
                    <h4 className="text-[11px] font-black text-[#555870] uppercase tracking-[0.3em]">Why it's trending</h4>
                  </div>
                  <p className="text-base text-[#8B90A7] leading-relaxed">
                    {detail?.whyTrending}
                  </p>
                </section>
              </div>

              <div className="bg-[#53A9EF]/10 border border-[#53A9EF]/20 p-8 rounded-[40px] flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <Zap size={20} className="text-[#53A9EF]" />
                  <h4 className="text-[11px] font-black text-[#53A9EF] uppercase tracking-[0.3em]">YesCity Angle</h4>
                </div>
                <p className="text-base text-white font-bold leading-relaxed flex-1">
                  {detail?.yesCityAngle}
                </p>
              </div>
            </div>

            {/* Execution Strategy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-[#2A2D3E]">
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1D27] flex items-center justify-center">
                    <FileText size={18} className="text-[#53A9EF]" />
                  </div>
                  <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Post Execution ideas</h4>
                </div>
                <div className="space-y-4">
                  {detail?.postIdeas?.map((idea: string, i: number) => (
                    <div key={i} className="group p-5 rounded-2xl bg-[#1A1D27]/40 border border-[#2A2D3E] hover:border-[#53A9EF]/30 transition-all">
                      <div className="flex gap-4">
                        <span className="text-[#53A9EF] font-black text-lg">0{i+1}</span>
                        <p className="text-sm text-[#F0F2F8] font-medium leading-relaxed">{idea}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1D27] flex items-center justify-center">
                    <Video size={18} className="text-[#53A9EF]" />
                  </div>
                  <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Reel / Short angles</h4>
                </div>
                <div className="space-y-4">
                  {detail?.reelIdeas?.map((idea: string, i: number) => (
                    <div key={i} className="group p-5 rounded-2xl bg-[#1A1D27]/40 border border-[#2A2D3E] hover:border-[#53A9EF]/30 transition-all">
                      <div className="flex gap-4">
                        <span className="text-[#53A9EF] font-black text-lg">0{i+1}</span>
                        <p className="text-sm text-[#F0F2F8] font-medium leading-relaxed">{idea}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Signal Context */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#2A2D3E]">
              <section>
                <h4 className="text-[10px] font-black text-[#555870] uppercase tracking-[0.3em] mb-6">Related Search Queries</h4>
                <div className="flex flex-wrap gap-2">
                  {detail?.relatedQueries?.map((q: string) => (
                    <span key={q} className="px-3 py-2 rounded-xl bg-[#1A1D27] border border-[#2A2D3E] text-[11px] text-[#8B90A7] font-medium hover:text-[#53A9EF] transition-colors">{q}</span>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-black text-[#555870] uppercase tracking-[0.3em] mb-6">Regional Hotspots</h4>
                <div className="space-y-3">
                  {detail?.interestByRegion?.length > 0 ? (
                    detail.interestByRegion.slice(0, 5).map((reg: any) => (
                      <div key={reg.geoName} className="flex justify-between items-center bg-[#1A1D27] p-3 rounded-xl border border-[#2A2D3E]">
                        <span className="text-xs text-[#F0F2F8] font-bold">{reg.geoName}</span>
                        <div className="flex items-center gap-3">
                           <div className="w-16 h-1 bg-[#0F111A] rounded-full overflow-hidden">
                            <div className="h-full bg-[#53A9EF]" style={{ width: `${reg.value[0]}%` }} />
                          </div>
                          <span className="text-[10px] text-[#53A9EF] font-black">{reg.value[0]}%</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-[#2A2D3E] text-center">
                      <p className="text-[10px] text-[#555870] uppercase font-bold tracking-widest">Regional data unavailable</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="p-6 bg-[#1A1D27] rounded-3xl border border-[#2A2D3E]">
                <h4 className="text-[10px] font-black text-[#555870] uppercase tracking-[0.3em] mb-6">Platform Discovery</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#555870] font-bold uppercase tracking-widest">Instagram</span>
                    <span className="text-[#53A9EF] font-black">#{detail?.platformQueries?.instagram?.[0] || keyword}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#555870] font-bold uppercase tracking-widest">YouTube</span>
                    <span className="text-[#F0F2F8] font-bold">{detail?.platformQueries?.youtube?.[0] || keyword}</span>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="pb-12 text-center">
               <button 
                onClick={onClose}
                className="px-12 py-5 rounded-[24px] bg-[#1A1D27] border border-[#2A2D3E] text-[#555870] text-xs font-black uppercase tracking-[0.4em] hover:text-white hover:border-[#53A9EF]/50 transition-all"
              >
                Close Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
