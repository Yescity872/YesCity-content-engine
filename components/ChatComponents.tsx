import { Zap, ArrowRight, Video, FileText, ChevronLeft, RefreshCcw, ExternalLink } from "lucide-react";

export interface IReferenceItem {
  url: string;
  caption: string;
  mediaType: "post" | "reel";
  sourceType: "live" | "curated" | "demo";
  engagement?: string;
}

export interface TrendCardProps {
  title: string;
  summary: string;
  hashtags: string[];
  whyItMatters: string;
  yesCityAngle: string;
  classification?: "direct" | "indirect" | "sensitive";
  referencePosts?: IReferenceItem[];
  referenceReels?: IReferenceItem[];
  onKnowMore: () => void;
}

export const TrendCard: React.FC<TrendCardProps> = ({
  title,
  summary,
  hashtags,
  whyItMatters,
  yesCityAngle,
  classification,
  referencePosts = [],
  referenceReels = [],
  onKnowMore,
}) => {
  const getBadge = () => {
    switch (classification) {
      case "sensitive": return <span className="badge-red text-[9px] uppercase tracking-wider px-2 py-0.5">Sensitive Topic</span>;
      case "direct": return <span className="badge-green text-[9px] uppercase tracking-wider px-2 py-0.5">Direct Travel</span>;
      default: return <span className="badge-blue text-[9px] uppercase tracking-wider px-2 py-0.5">Adaptable Trend</span>;
    }
  };

  const allRefs = [...referenceReels, ...referencePosts].slice(0, 3);

  return (
    <div className="card bg-[#1A1C2E] border-[#2A2D3E] p-5 hover:border-[#53A9EF]/40 transition-all flex flex-col h-full">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-[#F0F2F8] leading-tight">{title}</h3>
        {getBadge()}
      </div>
      
      <p className="text-sm text-[#8B90A7] mb-4 leading-relaxed italic">"{summary}"</p>
      
      <div className="space-y-4 mb-5 flex-1">
        <div>
          <p className="text-[10px] uppercase text-[#555870] font-bold tracking-widest mb-1.5 flex items-center gap-1.5">
            🌍 Why this matters
          </p>
          <p className="text-xs text-[#8B90A7] leading-relaxed">{whyItMatters}</p>
        </div>

        <div className="bg-[#53A9EF]/10 border border-[#53A9EF]/20 rounded-xl p-3.5">
          <p className="text-[10px] uppercase text-[#53A9EF] font-bold tracking-widest mb-1.5">⚡ YesCity Angle</p>
          <p className="text-xs text-[#F0F2F8] font-medium leading-relaxed">{yesCityAngle}</p>
        </div>

        {allRefs.length > 0 && (
          <div className="pt-2">
            <p className="text-[10px] uppercase text-[#555870] font-bold tracking-widest mb-2">📍 References</p>
            <div className="flex flex-col gap-2">
              {allRefs.map((ref, i) => (
                <a 
                  key={i}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded bg-[#0F111A] border border-[#2A2D3E] hover:border-brand/30 transition-all group/ref"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {ref.mediaType === "reel" ? <Video size={12} className="text-purple-400" /> : <FileText size={12} className="text-blue-400" />}
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#8B90A7] truncate max-w-[120px]">{ref.caption}</span>
                      {ref.sourceType === "demo" && <span className="text-[8px] text-amber-500/70 font-bold uppercase tracking-tighter">Demo Reference</span>}
                    </div>
                  </div>
                  <ExternalLink size={10} className="text-[#555870] group-hover/ref:text-brand" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {hashtags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-[10px] text-[#555870] font-bold uppercase tracking-tight">#{tag}</span>
        ))}
      </div>

      <button
        onClick={onKnowMore}
        className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2 group"
      >
        Know More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export interface ContentIdeaProps {
  title: string;
  conceptSummary: string;
  hook: string;
  caption: string;
  cta: string;
  sceneBreakdown: string;
  aiVideoPrompt: string;
  type: "post" | "reel";
}

export const ContentIdea: React.FC<ContentIdeaProps> = ({
  title,
  conceptSummary,
  hook,
  caption,
  cta,
  sceneBreakdown,
  aiVideoPrompt,
  type,
}) => {
  return (
    <div className="bg-[#161827] border border-[#2A2D3E] rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        {type === "reel" ? <Video size={16} className="text-purple-400" /> : <FileText size={16} className="text-blue-400" />}
        <h4 className="text-sm font-bold text-[#F0F2F8]">{title}</h4>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-[10px] uppercase text-[#555870] font-bold">Concept</p>
          <p className="text-xs text-[#8B90A7]">{conceptSummary}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] uppercase text-[#555870] font-bold">Hook</p>
            <p className="text-xs text-[#F0F2F8]">"{hook}"</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-[#555870] font-bold">CTA</p>
            <p className="text-xs text-[#F0F2F8]">{cta}</p>
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase text-[#555870] font-bold">Caption</p>
          <p className="text-xs text-[#8B90A7] bg-[#0F111A] p-2 rounded border border-[#2A2D3E] mt-1 whitespace-pre-wrap">{caption}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-[#555870] font-bold">Scene Breakdown</p>
          <p className="text-xs text-[#8B90A7] mt-1">{sceneBreakdown}</p>
        </div>
        <div className="bg-[#53A9EF]/5 border border-dashed border-[#53A9EF]/20 rounded p-2">
          <p className="text-[10px] uppercase text-[#53A9EF] font-bold">AI Video Prompt</p>
          <p className="text-[11px] text-[#8B90A7] mt-1 italic">{aiVideoPrompt}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-bold text-purple-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Video size={16} /> Reference Reels
          </h3>
          <div className="space-y-3">
            {detail.relatedReels && detail.relatedReels.length > 0 ? (
              detail.relatedReels.map((ref: any, i: number) => (
                <div key={i} className="p-3 rounded-lg bg-[#161827] border border-[#2A2D3E] hover:border-purple-500/30 transition-all flex flex-col gap-2">
                   <p className="text-[11px] text-[#8B90A7] leading-relaxed line-clamp-2 italic">"{ref.caption}"</p>
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <span className="text-[9px] text-[#555870] font-bold">REEL</span>
                       {ref.sourceType === "demo" && <span className="text-[8px] text-amber-500/70 font-bold uppercase tracking-tighter">Demo Reference</span>}
                     </div>
                     <a href={ref.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] text-purple-400 font-bold hover:underline">
                       Open Reel <ExternalLink size={10} />
                     </a>
                   </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#555870] italic">No reference reels found.</p>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-blue-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
            <FileText size={16} /> Reference Posts
          </h3>
          <div className="space-y-3">
             {detail.relatedPosts && detail.relatedPosts.length > 0 ? (
              detail.relatedPosts.map((ref: any, i: number) => (
                <div key={i} className="p-3 rounded-lg bg-[#161827] border border-[#2A2D3E] hover:border-blue-500/30 transition-all flex flex-col gap-2">
                   <p className="text-[11px] text-[#8B90A7] leading-relaxed line-clamp-2 italic">"{ref.caption}"</p>
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <span className="text-[9px] text-[#555870] font-bold">POST</span>
                       {ref.sourceType === "demo" && <span className="text-[8px] text-amber-500/70 font-bold uppercase tracking-tighter">Demo Reference</span>}
                     </div>
                     <a href={ref.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] text-blue-400 font-bold hover:underline">
                       Open Post <ExternalLink size={10} />
                     </a>
                   </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#555870] italic">No reference posts found.</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-[#F0F2F8] mb-4 flex items-center gap-2">
          <FileText size={18} className="text-blue-400" /> 5 Strategic Post Ideas
        </h3>
        {detail.postIdeas.map((idea: any, i: number) => (
          <ContentIdea key={i} {...idea} type="post" />
        ))}
      </div>

      <div>
        <h3 className="text-lg font-bold text-[#F0F2F8] mb-4 flex items-center gap-2">
          <Video size={18} className="text-purple-400" /> 5 Instagram Reel Ideas
        </h3>
        {detail.reelIdeas.map((idea: any, i: number) => (
          <ContentIdea key={i} {...idea} type="reel" />
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
