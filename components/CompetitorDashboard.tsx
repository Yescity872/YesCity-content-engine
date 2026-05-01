"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  ExternalLink, 
  Target, 
  Zap, 
  ShieldCheck, 
  RefreshCcw,
  BarChart3,
  Search,
  Eye,
  ArrowRight,
  Info,
  Users,
  Briefcase,
  AlertTriangle,
  Lightbulb,
  Send
} from "lucide-react";

export function CompetitorDashboard() {
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"default" | "live" | "giants">("default");
  

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const fetchCompetitors = async (force: boolean = false) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/competitors?forceRefresh=${force}`);
      const data = await res.json();
      if (data.success) {
        setCompetitors(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch competitors", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getSortedCompetitors = () => {
    const list = [...competitors];
    if (sortBy === "live") {
      return list.sort((a, b) => {
        const aHasLive = a.publicSignals?.some((s: any) => s.freshness === "recent") ? 1 : 0;
        const bHasLive = b.publicSignals?.some((s: any) => s.freshness === "recent") ? 1 : 0;
        return bHasLive - aHasLive;
      });
    }
    if (sortBy === "giants") {
      const giants = ["MakeMyTrip", "Goibibo", "Yatra", "Cleartrip", "Ixigo", "EaseMyTrip"];
      return list.sort((a, b) => {
        const aVal = giants.includes(a.competitorName) ? 1 : 0;
        const bVal = giants.includes(b.competitorName) ? 1 : 0;
        return bVal - aVal;
      });
    }
    return list;
  };

  const sortedList = getSortedCompetitors();


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCcw size={40} className="text-[#53A9EF] animate-spin mb-4" />
        <p className="text-[#8B90A7] font-medium">Building competitor intelligence profiles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">

      {/* Header & Disclaimer */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Competitor Intelligence</h2>
          <p className="text-[#8B90A7] text-sm mb-4">Internal strategy profiles of top Indian travel players.</p>
          <div className="flex gap-3 p-4 rounded-2xl bg-[#53A9EF]/5 border border-[#53A9EF]/10 items-start">
             <AlertTriangle size={18} className="text-[#53A9EF] shrink-0 mt-0.5" />
             <p className="text-[10px] text-[#8B90A7] leading-relaxed">
              <strong className="text-[#53A9EF] uppercase">AI-Inferred Strategy:</strong> This data is generated via AI analysis of public positioning and market behavior. Use "Optional Ad Verification" to confirm with live data.
             </p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex bg-[#1A1D27] border border-[#2A2D3E] rounded-xl p-1">
             <button 
               onClick={() => setSortBy("default")}
               className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${sortBy === "default" ? 'bg-[#53A9EF] text-white' : 'text-[#555870] hover:text-white'}`}
             >
               Normal
             </button>
             <button 
               onClick={() => setSortBy("live")}
               className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${sortBy === "live" ? 'bg-[#53A9EF] text-white' : 'text-[#555870] hover:text-white'}`}
             >
               Live News First
             </button>
             <button 
               onClick={() => setSortBy("giants")}
               className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${sortBy === "giants" ? 'bg-[#53A9EF] text-white' : 'text-[#555870] hover:text-white'}`}
             >
               Market Giants
             </button>
          </div>

          <button 
            onClick={() => fetchCompetitors(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1A1D27] border border-[#2A2D3E] text-[10px] font-black uppercase tracking-widest text-[#53A9EF] hover:bg-[#2A2D3E] transition-all"
          >
            <RefreshCcw size={14} /> REFRESH PROFILES
          </button>
        </div>
      </div>

      {/* Competitor Grid */}
      <div className="grid grid-cols-1 gap-12">
        {sortedList.map((comp) => (
          <EnrichedCompetitorCard key={comp._id} competitor={comp} />
        ))}
      </div>
    </div>
  );
}

function EnrichedCompetitorCard({ competitor }: { competitor: any }) {
  return (
    <div className="bg-[#1A1D27] border border-[#2A2D3E] rounded-[48px] overflow-hidden flex flex-col shadow-2xl relative">
      <div className="absolute top-8 right-8 px-4 py-1.5 rounded-full bg-[#53A9EF]/10 border border-[#53A9EF]/20 flex items-center gap-2">
         <ShieldCheck size={12} className="text-[#53A9EF]" />
         <span className="text-[9px] font-bold text-[#53A9EF] uppercase tracking-widest">Market Leader</span>
      </div>

      {/* Header */}
      <div className="p-10 border-b border-[#2A2D3E] bg-gradient-to-br from-[#1F222F] to-[#1A1D27]">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 rounded-3xl bg-[#53A9EF] flex items-center justify-center shadow-2xl shadow-[#53A9EF]/30">
              <Building2 size={32} className="text-white" />
           </div>
           <div>
              <h3 className="text-3xl font-black text-white leading-tight">{competitor.competitorName}</h3>
              <div className="flex items-center gap-3 mt-1">
                 <span className="text-[10px] font-black text-[#53A9EF] uppercase tracking-widest">Real-Time 2026 Strategy</span>
                 <span className="w-1 h-1 rounded-full bg-[#2A2D3E]" />
                 <span className="text-[10px] font-bold text-[#555870] uppercase">{competitor.region}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="p-10 space-y-8">
        <div className="flex flex-col lg:flex-row gap-8">
           {/* Main Action Block */}
           <div className="flex-1 space-y-8">
              <div>
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                       <Zap size={18} className="text-[#53A9EF]" />
                       <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">What They Are Doing Right Now</h4>
                    </div>
                    {competitor.isAIInferred ? (
                       <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[8px] font-black text-amber-500 uppercase">
                          <Info size={10} /> AI Inferred
                       </span>
                    ) : (
                       <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[8px] font-black text-[#10B981] uppercase">
                          <ShieldCheck size={10} /> Verified Signals
                       </span>
                    )}
                 </div>
                 <div className="p-6 rounded-3xl bg-[#0F111A] border border-[#2A2D3E] shadow-inner">
                    <p className="text-base font-bold text-white leading-relaxed italic">
                       "{competitor.whatTheyAreDoingNow}"
                    </p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="p-6 rounded-3xl bg-[#53A9EF]/5 border border-[#53A9EF]/10">
                    <div className="flex items-center gap-2 mb-3">
                       <Target size={14} className="text-[#53A9EF]" />
                       <h4 className="text-[10px] font-black text-[#53A9EF] uppercase tracking-[0.2em]">The Attraction Secret</h4>
                    </div>
                    <p className="text-sm text-[#F0F2F8] leading-relaxed">
                       {competitor.attractionSecret}
                    </p>
                 </div>

                 <div className="p-6 rounded-3xl bg-[#10B981]/5 border border-[#10B981]/10">
                    <div className="flex items-center gap-2 mb-3">
                       <Send size={14} className="text-[#10B981]" />
                       <h4 className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.2em]">Live Tactical Move</h4>
                    </div>
                    <p className="text-sm text-[#F0F2F8] font-bold">
                       {competitor.liveTacticalMove}
                    </p>
                 </div>
              </div>
           </div>

           {/* Public Signals Sidebar */}
           <div className="w-full lg:w-80 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                 <BarChart3 size={16} className="text-[#555870]" />
                 <h4 className="text-[10px] font-black text-[#555870] uppercase tracking-[0.2em]">Recent Public Signals</h4>
              </div>
              <div className="space-y-3">
                 {competitor.publicSignals && competitor.publicSignals.length > 0 ? (
                   competitor.publicSignals.slice(0, 3).map((sig: any, idx: number) => (
                     <a 
                       key={idx}
                       href={sig.url}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="block p-5 rounded-2xl bg-[#0F111A] border border-[#2A2D3E] hover:border-[#53A9EF]/30 transition-all group"
                     >
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] text-[#555870] font-black uppercase tracking-widest">{sig.source}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase ${
                            sig.freshness === 'recent' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#555870]/10 text-[#555870]'
                          }`}>
                            {sig.freshness === 'recent' ? 'Latest' : 'Historical'}
                          </span>
                       </div>
                       <p className="text-[12px] font-black text-white leading-tight group-hover:text-[#53A9EF] mb-2">{sig.title}</p>
                       <p className="text-[10px] text-[#8B90A7] leading-relaxed line-clamp-3 italic">
                         {sig.snippet || "Click to read the full tactical signal..."}
                       </p>
                     </a>
                   ))
                 ) : (
                   <div className="p-8 rounded-2xl border border-dashed border-[#2A2D3E] text-center">
                      <p className="text-[10px] text-[#555870] italic">No recent public signals found.<br/>Using AI inference only.</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

        <div className="pt-8 border-t border-[#2A2D3E] flex flex-col md:flex-row justify-between items-end gap-6">
           <div className="flex-1">
              <span className="text-[10px] font-black text-[#555870] uppercase tracking-widest block mb-1">Latest May 2026 Campaign</span>
              <p className="text-lg font-black text-white">{competitor.latestCampaign}</p>
           </div>
           
           <div className="flex gap-3 shrink-0">
              {competitor.proofLinks?.map((link: any, i: number) => (
                <a 
                 key={i}
                 href={link.url}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1F222F] border border-[#2A2D3E] hover:border-[#53A9EF]/50 transition-all group"
                >
                  <span className="text-[10px] font-black text-white uppercase">{link.title}</span>
                  <ExternalLink size={12} className="text-[#555870] group-hover:text-white" />
                </a>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
