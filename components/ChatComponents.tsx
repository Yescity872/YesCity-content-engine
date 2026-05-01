import React from 'react';
import { Zap, ArrowRight, Video, FileText, ChevronLeft, RefreshCcw, ExternalLink, Play, Sparkles, Clock, Users, Globe, ChevronRight, BarChart3, Target, Building2, Info, Search, Eye } from "lucide-react";

export interface IReferenceItem {
  platform: "youtube" | "instagram" | "web";
  sourceName: string;
  url: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  channelTitle?: string;
  mediaType: "video" | "short" | "reel" | "post" | "article";
  engagement?: {
    views?: number;
    likes?: number;
    comments?: number;
  };
  sourceType: "live" | "demo";
  aiMarketingNote: string;
}

export const ThumbnailCard: React.FC<{ item: IReferenceItem }> = ({ item }) => {
  const displayTitle = item.title || item.description || "Reference Link";
  const platformColor = 
    item.platform === "youtube" ? "bg-red-600" : 
    item.platform === "instagram" ? "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]" : 
    "bg-blue-600";
  
  return (
    <a 
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col rounded-xl overflow-hidden bg-[#0F111A] border border-[#2A2D3E] hover:border-[#53A9EF]/40 transition-all group/card h-full"
    >
      <div className="relative w-full aspect-video overflow-hidden">
        {/* Platform Badge */}
        <div className="absolute top-2 left-2 z-10 flex gap-1">
          <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded shadow-lg text-white ${platformColor}`}>
            {item.platform}
          </span>
          <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded shadow-lg bg-black/50 text-white/80 backdrop-blur-sm border border-white/10">
            {item.sourceName}
          </span>
        </div>

        {item.thumbnailUrl ? (
          <img 
            src={item.thumbnailUrl} 
            alt={displayTitle} 
            className="w-full h-full object-cover transition-transform group-hover/card:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1A1D27]">
             <Globe size={24} className="text-[#2A2D3E]" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/20 group-hover/card:bg-transparent transition-all flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-md rounded-full p-2 border border-white/10 opacity-0 group-hover/card:opacity-100 transition-opacity">
            <ExternalLink size={12} className="text-white" />
          </div>
        </div>
      </div>
      
      <div className="p-3 flex-1 flex flex-col">
        <h4 className="text-[10px] font-bold text-white line-clamp-1 mb-1">{displayTitle}</h4>
        
        {item.channelTitle && (
          <p className="text-[8px] text-[#53A9EF] font-bold mb-2 uppercase tracking-tighter">@{item.channelTitle}</p>
        )}

        <div className="mt-auto border-t border-[#2A2D3E] pt-2">
          <p className="text-[7px] uppercase font-black text-[#53A9EF] mb-1 tracking-widest opacity-70">Production Hint</p>
          <p className="text-[9px] text-[#8B90A7] leading-relaxed italic">
            "{item.aiMarketingNote}"
          </p>
        </div>
      </div>
    </a>
  );
};

const ExecutionPlanCard: React.FC<{ plan: any }> = ({ plan }) => {
  return (
    <div className="flex flex-col rounded-2xl bg-[#0F111A] border border-[#2A2D3E] p-4 hover:border-[#53A9EF]/30 transition-all group/plan h-fit">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {plan.type === "reel" ? <Video size={14} className="text-purple-400" /> : <FileText size={14} className="text-blue-400" />}
          <span className="text-xs font-bold text-white uppercase tracking-tight">{plan.title}</span>
        </div>
        <span className={`text-[8px] font-black uppercase px-2 py-1 rounded ${
          plan.difficulty === "Easy" ? "bg-green-500/10 text-green-400" : 
          plan.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"
        }`}>
          {plan.difficulty}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[8px] font-black uppercase text-[#53A9EF] mb-1">Concept</p>
          <p className="text-xs text-[#F0F2F8] leading-relaxed">{plan.concept}</p>
        </div>

        <div className="bg-[#53A9EF]/5 rounded-xl p-3 border border-[#53A9EF]/10">
          <p className="text-[8px] font-black uppercase text-[#53A9EF] mb-1">Viral Hook</p>
          <p className="text-xs text-white font-bold italic">"{plan.hook}"</p>
        </div>

        <div>
          <p className="text-[8px] font-black uppercase text-[#555870] mb-1">Scene Breakdown & Shooting</p>
          <div className="space-y-2">
            {plan.sceneBreakdown?.map((s: string, i: number) => (
              <p key={i} className="text-[11px] text-[#8B90A7] flex gap-2">
                <span className="text-[#53A9EF] font-bold">{i+1}.</span> {s}
              </p>
            ))}
            <p className="text-[11px] text-[#8B90A7] mt-2">
              <span className="text-white/50 uppercase text-[8px] font-bold">What to shoot:</span> {plan.whatToShoot}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#2A2D3E]">
          <div>
            <p className="text-[8px] font-black uppercase text-[#555870] mb-1">Editing Style</p>
            <p className="text-[10px] text-[#8B90A7]">{plan.editingStyle}</p>
          </div>
          <div>
            <p className="text-[8px] font-black uppercase text-[#555870] mb-1">Recommended Team</p>
            <p className="text-[10px] text-[#8B90A7]">{plan.team}</p>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-[8px] font-black uppercase text-[#555870] mb-1">Caption & CTA</p>
          <p className="text-[11px] text-[#8B90A7] mb-1">{plan.caption}</p>
          <p className="text-[11px] text-[#53A9EF] font-bold">{plan.cta}</p>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {plan.hashtags?.map((h: string) => (
            <span key={h} className="text-[9px] text-[#555870]">#{h.replace("#", "")}</span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-6 border-t border-[#2A2D3E] pt-3 text-[9px] text-[#555870] font-bold uppercase tracking-widest">
        <div className="flex items-center gap-1.5"><Clock size={12} /> {plan.time}</div>
      </div>
    </div>
  );
};

export const PaginatedTrendView = ({ topics, onKnowMore }: { topics: any[], onKnowMore: (id: string) => void }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const topic = topics[currentIndex];

  if (!topic) return null;

  return (
    <div className="relative group max-w-2xl mx-auto">
      <div className="bg-[#0F111A] border border-[#2A2D3E] rounded-[32px] overflow-hidden shadow-2xl transition-all duration-500">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-[10px] font-bold text-[#53A9EF] uppercase tracking-[0.2em] mb-1">Intelligence Package {currentIndex + 1} of {topics.length}</p>
              <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">{topic.title}</h3>
            </div>
          </div>

          <TrendCard {...topic} onKnowMore={() => onKnowMore(topic.topicId)} />
        </div>
      </div>

      {/* Navigation Controls */}
      {topics.length > 1 && (
        <div className="flex justify-center gap-4 mt-8">
          <button 
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => prev - 1)}
            className="w-12 h-12 rounded-full bg-[#1A1D27] border border-[#2A2D3E] flex items-center justify-center text-white hover:bg-[#53A9EF] hover:border-[#53A9EF] transition-all disabled:opacity-20 disabled:cursor-not-allowed group/btn shadow-lg"
          >
            <ChevronLeft size={20} className="transition-transform group-hover/btn:-translate-x-0.5" />
          </button>
          
          <div className="flex items-center gap-2 px-8 rounded-full bg-[#1A1D27] border border-[#2A2D3E] text-[11px] font-black text-white uppercase tracking-widest shadow-lg">
            {currentIndex + 1} / {topics.length}
          </div>

          <button 
            disabled={currentIndex === topics.length - 1}
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="w-12 h-12 rounded-full bg-[#1A1D27] border border-[#2A2D3E] flex items-center justify-center text-white hover:bg-[#53A9EF] hover:border-[#53A9EF] transition-all disabled:opacity-20 disabled:cursor-not-allowed group/btn shadow-lg"
          >
            <ChevronRight size={20} className="transition-transform group-hover/btn:translate-x-0.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export interface TrendCardProps {
  topicId: string;
  title: string;
  category: string;
  contextSummary: string;
  classification: "direct" | "adaptable" | "sensitive";
  yesCityAngle: string;
  status: "pending" | "scraping" | "ready" | "failed";
  references: IReferenceItem[];
  intelligenceReport?: {
    trendPatterns: string;
    reelSimulation: string;
    executionPlans: any[];
    suggestedHashtags: string[];
  };
  onKnowMore: () => void;
}

export const TrendCard: React.FC<TrendCardProps> = ({
  title,
  category,
  contextSummary,
  classification,
  yesCityAngle,
  status,
  references = [],
  intelligenceReport,
  onKnowMore,
}) => {
  const getBadge = () => {
    switch (classification) {
      case "sensitive": return <span className="badge-red text-[9px] uppercase tracking-wider px-2 py-0.5">Sensitive</span>;
      case "direct": return <span className="badge-green text-[9px] uppercase tracking-wider px-2 py-0.5">Direct Travel</span>;
      default: return <span className="badge-blue text-[9px] uppercase tracking-wider px-2 py-0.5">Adaptable</span>;
    }
  };

  const isWorking = status === "pending" || status === "scraping";

  return (
    <div className="card bg-[#1A1C2E] border-[#2A2D3E] p-5 hover:border-[#53A9EF]/40 transition-all flex flex-col h-full">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-[#F0F2F8] leading-tight">{title}</h3>
        {getBadge()}
      </div>
      
      <p className="text-sm text-[#8B90A7] mb-4 leading-relaxed italic">"{contextSummary}"</p>
      
      <div className="space-y-4 mb-5 flex-1">
        <div className="bg-[#53A9EF]/10 border border-[#53A9EF]/20 rounded-xl p-3.5">
          <p className="text-[10px] uppercase text-[#53A9EF] font-bold tracking-widest mb-1.5">⚡ YesCity Angle</p>
          <p className="text-xs text-[#F0F2F8] font-medium leading-relaxed">{yesCityAngle}</p>
        </div>

        <div className="flex-1">
          <p className="text-[10px] uppercase text-[#53A9EF] font-bold tracking-widest mb-3 flex items-center gap-2">
            {references.length > 0 ? "📍 Visual References" : "✨ Trend Intelligence & Execution Strategy"}
          </p>
          
          <div className={`grid ${references.length > 0 ? "grid-cols-3" : "grid-cols-1"} gap-4`}>
            {isWorking ? (
              // Skeleton loaders while scraping
              [1, 2, 3].map((i) => (
                <div key={i} className="aspect-video rounded-xl bg-[#0F111A] border border-[#2A2D3E] animate-pulse flex items-center justify-center">
                  <Play size={12} className="text-[#2A2D3E]" />
                </div>
              ))
            ) : references.length > 0 ? (
              references.map((ref) => (
                <ThumbnailCard key={ref.url} item={ref} />
              ))
            ) : (intelligenceReport && intelligenceReport.executionPlans?.length > 0) ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-[#0F111A] border border-[#2A2D3E] shadow-inner">
                    <p className="text-[8px] font-black uppercase text-[#53A9EF] mb-2 tracking-widest">Trend Behavior</p>
                    <p className="text-xs text-[#8B90A7] leading-relaxed italic">"{intelligenceReport.trendPatterns}"</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#0F111A] border border-[#2A2D3E] shadow-inner">
                    <p className="text-[8px] font-black uppercase text-[#53A9EF] mb-2 tracking-widest">Social Format</p>
                    <p className="text-xs text-[#8B90A7] leading-relaxed italic">"{intelligenceReport.reelSimulation}"</p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] font-bold text-white uppercase tracking-widest mb-4 border-b border-[#2A2D3E] pb-2">
                    Actionable Campaign Strategies
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    {intelligenceReport.executionPlans.map((plan: any, i: number) => (
                      <ExecutionPlanCard key={i} plan={plan} />
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] text-[#555870] font-bold uppercase tracking-tight bg-[#0F111A] px-2 py-0.5 rounded border border-[#2A2D3E]">
          {category}
        </span>
      </div>


      <button
        onClick={onKnowMore}
        disabled={status !== "ready"}
        className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:grayscale"
      >
        {status === "ready" ? "Detailed Analysis & Ideas" : "Discovery in progress..."} 
        <ArrowRight size={14} className={status === "ready" ? "group-hover:translate-x-1 transition-transform" : "opacity-0"} />
      </button>
    </div>
  );
};

export interface ContentIdeaProps {
  title: string;
  conceptSummary: string;
  hook: string;
  whyItWorks?: string;
  format?: string;
  caption: string;
  cta: string;
  sceneBreakdown: string[]; 
  aiVideoPrompt: string;
  type: "post" | "reel";
}

export const ContentIdea: React.FC<ContentIdeaProps> = ({
  title,
  conceptSummary,
  hook,
  whyItWorks,
  format,
  caption,
  cta,
  sceneBreakdown,
  aiVideoPrompt,
  type,
}) => {
  return (
    <div className="bg-[#161827] border border-[#2A2D3E] rounded-3xl p-6 mb-6 hover:border-[#53A9EF]/30 transition-all">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${type === "reel" ? "bg-purple-500/10" : "bg-blue-500/10"}`}>
            {type === "reel" ? <Video size={16} className="text-purple-400" /> : <FileText size={16} className="text-blue-400" />}
          </div>
          <h4 className="text-sm font-black text-[#F0F2F8] uppercase tracking-tight">{title}</h4>
        </div>
        {format && <span className="px-2 py-0.5 rounded-md bg-[#53A9EF]/10 text-[#53A9EF] text-[8px] font-bold uppercase">{format}</span>}
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-[10px] uppercase text-[#555870] font-black tracking-widest mb-1.5">Concept</p>
          <p className="text-[13px] text-[#F0F2F8] leading-relaxed font-medium">{conceptSummary}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0F111A] p-3 rounded-xl border border-[#2A2D3E]">
            <p className="text-[9px] uppercase text-[#555870] font-black tracking-widest mb-1">Hook</p>
            <p className="text-[12px] text-[#53A9EF] font-bold italic">"{hook}"</p>
          </div>
          {whyItWorks && (
            <div className="bg-[#0F111A] p-3 rounded-xl border border-[#2A2D3E]">
              <p className="text-[9px] uppercase text-[#555870] font-black tracking-widest mb-1">Why it works</p>
              <p className="text-[11px] text-[#8B90A7] font-medium leading-tight">{whyItWorks}</p>
            </div>
          )}
        </div>

        <div className="bg-[#0F111A] p-4 rounded-xl border border-[#2A2D3E]">
          <p className="text-[10px] uppercase text-[#555870] font-black tracking-widest mb-2">Content Execution Breakdown</p>
          <ul className="space-y-2">
            {sceneBreakdown.map((step, i) => (
              <li key={i} className="text-[11px] text-[#8B90A7] flex gap-3 leading-relaxed">
                <span className="text-[#53A9EF] font-black">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4 p-4 bg-[#53A9EF]/5 border border-[#53A9EF]/10 rounded-2xl">
          <div>
            <p className="text-[10px] uppercase text-[#53A9EF] font-black tracking-widest mb-1.5">Strategic Caption</p>
            <p className="text-[11px] text-[#8B90A7] leading-relaxed whitespace-pre-wrap">{caption}</p>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-[#555870] font-bold uppercase tracking-widest">CTA:</span>
            <span className="text-[#F0F2F8] font-black underline underline-offset-4 decoration-[#53A9EF]">{cta}</span>
          </div>
        </div>

        <div className="bg-[#0F111A] p-4 rounded-xl border border-dashed border-[#2A2D3E]">
          <p className="text-[10px] uppercase text-[#555870] font-black tracking-widest mb-2">AI Visual Prompt</p>
          <p className="text-[11px] text-[#555870] italic leading-relaxed">"{aiVideoPrompt}"</p>
        </div>
      </div>
    </div>
  );
};

export const TrendDetailView: React.FC<{
  detail: any;
  onBack: () => void;
  onExploreAnother: () => void;
  onGenerateMore: () => void;
}> = ({ detail, onBack, onExploreAnother, onGenerateMore }) => {
  if (!detail || !detail.aiAnalysis) {
    return (
      <div className="p-10 text-center">
        <RefreshCcw size={32} className="text-[#53A9EF] animate-spin mx-auto mb-4" />
        <p className="text-[#8B90A7]">Preparing your deep-dive analysis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[#2A2D3E] pb-4">
        <h2 className="text-2xl font-black text-[#F0F2F8] mb-2">{detail.topic}</h2>
        <p className="text-sm text-[#8B90A7] leading-relaxed">{detail.aiAnalysis.whatItIs}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1A1C2E] p-4 rounded-xl border border-[#2A2D3E]">
          <h3 className="text-xs font-bold text-[#53A9EF] uppercase mb-2">Why it's trending</h3>
          <p className="text-xs text-[#8B90A7]">{detail.aiAnalysis.whyTrending}</p>
        </div>
        <div className="bg-[#1A1C2E] p-4 rounded-xl border border-[#2A2D3E]">
          <h3 className="text-xs font-bold text-[#53A9EF] uppercase mb-2">How people use it</h3>
          <p className="text-xs text-[#8B90A7]">{detail.aiAnalysis.howPeopleUsing}</p>
        </div>
      </div>

      <div className="bg-[#53A9EF]/10 border border-[#53A9EF]/30 p-4 rounded-xl">
        <h3 className="text-sm font-bold text-[#F0F2F8] mb-2 flex items-center gap-2">
          <Zap size={16} className="text-[#53A9EF]" /> YesCity Adaptation Angle
        </h3>
        <p className="text-xs text-[#8B90A7] leading-relaxed">{detail.aiAnalysis.yesCityAngle}</p>
      </div>

      {/* Phase 3: Live References */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-[#F0F2F8] flex items-center gap-2">
              <Sparkles size={18} className="text-[#53A9EF]" /> Live Content References
            </h3>
            <p className="text-[10px] text-[#555870] font-medium uppercase tracking-widest ml-7">Real-world examples from YouTube, Instagram & News</p>
          </div>
        </div>
        
        {detail.references && detail.references.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {detail.references.map((ref: any, i: number) => (
              <ThumbnailCard key={i} item={ref} />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-[#1A1C2E] border border-[#2A2D3E] border-dashed text-center">
            <p className="text-xs text-[#555870] italic">Live references unavailable right now. Use the content strategy and execution ideas below.</p>
          </div>
        )}
      </div>

      {/* Phase 6: X / LinkedIn Research Suggestions */}
      {detail.researchSuggestions && (
        <div className="bg-[#1A1C2E] border border-[#2A2D3E] p-6 rounded-[32px] overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BarChart3 size={80} className="text-[#53A9EF]" />
          </div>
          
          <div className="flex flex-col gap-2 mb-6 relative z-10">
            <h3 className="text-sm font-bold text-[#F0F2F8] flex items-center gap-2">
              <Zap size={16} className="text-[#53A9EF]" /> X / LinkedIn Research Pathways
            </h3>
            <p className="text-[10px] text-[#555870] font-black uppercase tracking-widest leading-relaxed">
              {detail.researchSuggestions.x.notice}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {/* X (Twitter) Suggestions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                  <span className="text-[10px] font-black text-white">X</span>
                </div>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Search Directions</span>
              </div>
              <div className="space-y-2">
                {detail.researchSuggestions.x.pathways.map((path: any, i: number) => (
                  <a 
                    key={i} 
                    href={path.searchQuery} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-3 rounded-xl bg-[#0F111A] border border-[#2A2D3E] hover:border-[#53A9EF]/30 transition-all group/path"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold text-[#F0F2F8]">{path.title}</span>
                      <ExternalLink size={10} className="text-[#555870] group-hover/path:text-[#53A9EF]" />
                    </div>
                    <p className="text-[10px] text-[#8B90A7] leading-relaxed italic">"{path.instruction}"</p>
                  </a>
                ))}
              </div>
            </div>

            {/* LinkedIn Suggestions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#0A66C2]/10 flex items-center justify-center border border-[#0A66C2]/20">
                  <span className="text-[10px] font-black text-[#0A66C2]">in</span>
                </div>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Industry Directions</span>
              </div>
              <div className="space-y-2">
                {detail.researchSuggestions.linkedin.pathways.map((path: any, i: number) => (
                  <a 
                    key={i} 
                    href={path.searchQuery} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-3 rounded-xl bg-[#0F111A] border border-[#2A2D3E] hover:border-[#53A9EF]/30 transition-all group/path"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold text-[#F0F2F8]">{path.title}</span>
                      <ExternalLink size={10} className="text-[#555870] group-hover/path:text-[#53A9EF]" />
                    </div>
                    <p className="text-[10px] text-[#8B90A7] leading-relaxed italic">"{path.instruction}"</p>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#2A2D3E] flex items-center gap-3">
            <Target size={14} className="text-[#53A9EF]" />
            <p className="text-[10px] text-[#8B90A7] font-medium leading-relaxed">
              <span className="text-[#53A9EF] font-bold uppercase mr-1">Strategic Advice:</span> 
              {detail.researchSuggestions.x.strategicInference}
            </p>
          </div>
        </div>
      )}

      {/* Phase 4 Overhaul: Competitor Strategy Matrix */}
      {detail.competitorAnalysis && detail.competitorAnalysis.matrix && (
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              <BarChart3 size={24} className="text-[#53A9EF]" /> Competitor Strategy Matrix
            </h3>
            <div className="flex gap-3 p-4 rounded-2xl bg-[#53A9EF]/5 border border-[#53A9EF]/10 items-start max-w-2xl">
              <Zap size={16} className="text-[#53A9EF] shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#8B90A7] leading-relaxed font-medium italic">
                <strong className="text-[#53A9EF] uppercase not-italic mr-1">Strategic Matrix:</strong> How top Indian travel players are likely positioning against this trend.
              </p>
            </div>
          </div>

          <div className="bg-[#1A1D27] border border-[#2A2D3E] rounded-[32px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1F222F] border-b border-[#2A2D3E]">
                    <th className="p-6 text-[10px] font-black text-[#555870] uppercase tracking-widest">Competitor</th>
                    <th className="p-6 text-[10px] font-black text-[#555870] uppercase tracking-widest">Likely Angle</th>
                    <th className="p-6 text-[10px] font-black text-[#555870] uppercase tracking-widest">Format</th>
                    <th className="p-6 text-[10px] font-black text-[#10B981] uppercase tracking-widest">YesCity Opportunity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2D3E]">
                  {detail.competitorAnalysis.matrix.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-[#1F222F]/40 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#53A9EF]/10 flex items-center justify-center border border-[#53A9EF]/20">
                            <Building2 size={14} className="text-[#53A9EF]" />
                          </div>
                          <span className="text-sm font-bold text-white">{row.competitor}</span>
                        </div>
                      </td>
                      <td className="p-6 text-[13px] text-[#8B90A7] leading-relaxed italic">"{row.likelyAngle}"</td>
                      <td className="p-6">
                        <span className="px-3 py-1 rounded-full bg-[#1A1D27] border border-[#2A2D3E] text-[10px] font-bold text-white uppercase tracking-tighter">
                          {row.format}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-start gap-2 max-w-xs">
                           <ArrowRight size={14} className="text-[#10B981] mt-1 shrink-0" />
                           <p className="text-[12px] text-[#F0F2F8] font-bold leading-relaxed">{row.yesCityOpportunity}</p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
             <div className="flex-1 p-5 rounded-3xl bg-[#0F111A] border border-[#2A2D3E]">
                <span className="text-[10px] font-black text-[#555870] uppercase tracking-widest block mb-1">Overall Market Sentiment</span>
                <p className="text-[11px] text-[#8B90A7] italic">{detail.competitorAnalysis.marketSentiment}</p>
             </div>
             <div className="p-5 rounded-3xl bg-[#53A9EF]/5 border border-[#53A9EF]/10 flex items-center gap-4">
                <Info size={16} className="text-[#53A9EF]" />
                <p className="text-[9px] text-[#8B90A7] leading-relaxed max-w-xs">
                  Strategy inferred from public brand behavior. Use the "Optional Ad Verification" in the main Competitor Dashboard to check live campaigns.
                </p>
             </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex flex-col gap-1 mb-4">
          <h3 className="text-lg font-bold text-[#F0F2F8] flex items-center gap-2">
            <FileText size={18} className="text-blue-400" /> Suggested Post Concepts
          </h3>
          <p className="text-[10px] text-[#555870] font-medium uppercase tracking-widest ml-7">Strategic concepts designed for static or carousel formats</p>
        </div>
        {detail.postIdeas.map((idea: any, i: number) => (
          <ContentIdea key={`${detail.topicId}-post-${i}`} {...idea} type="post" />
        ))}
      </div>

      <div>
        <div className="flex flex-col gap-1 mb-4">
          <h3 className="text-lg font-bold text-[#F0F2F8] flex items-center gap-2">
            <Video size={18} className="text-purple-400" /> Suggested Reel Concepts
          </h3>
          <p className="text-[10px] text-[#555870] font-medium uppercase tracking-widest ml-7">High-impact short-form video concepts tailored for this trend</p>
        </div>
        {detail.reelIdeas.map((idea: any, i: number) => (
          <ContentIdea key={`${detail.topicId}-reel-${i}`} {...idea} type="reel" />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#2A2D3E]">
        <button onClick={onBack} className="btn-secondary text-xs flex-1 py-3 flex items-center justify-center gap-2">
          <ChevronLeft size={16} /> Back to All Trends
        </button>
        <button onClick={onExploreAnother} className="btn-secondary text-xs flex-1 py-3 flex items-center justify-center gap-2">
          Explore Another Trend
        </button>
        <button onClick={onGenerateMore} className="btn-primary text-xs flex-1 py-3 flex items-center justify-center gap-2">
          <RefreshCcw size={16} /> Generate More Ideas
        </button>
      </div>
    </div>
  );
};
