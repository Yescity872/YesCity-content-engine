import { Zap, ArrowRight, Video, FileText, ChevronLeft, RefreshCcw, ExternalLink, Play } from "lucide-react";

export interface IReferenceItem {
  url: string;
  caption: string;
  mediaType: "post" | "reel";
  sourceType: "live" | "curated" | "demo";
  thumbnailUrl?: string;
  aiCaption?: string;
}

const ThumbnailCard: React.FC<{ item: IReferenceItem }> = ({ item }) => {
  const isReel = item.mediaType === "reel";
  const displayCaption = item.aiCaption || item.caption;
  
  return (
    <a 
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col rounded-xl overflow-hidden bg-[#0F111A] border border-[#2A2D3E] hover:border-[#53A9EF]/40 transition-all group/card h-full"
    >
      <div className={`relative w-full ${isReel ? 'aspect-[4/5]' : 'aspect-square'} overflow-hidden`}>
        <div className="absolute top-1 right-1 z-10">
          <span className={`text-[7px] font-black uppercase px-1 py-0.5 rounded shadow-lg border ${
            item.sourceType === "curated" 
              ? "bg-blue-500/80 text-white border-blue-400/50" 
              : "bg-green-500/80 text-white border-green-400/50"
          }`}>
            {item.sourceType === "curated" ? "Curated" : "Live"}
          </span>
        </div>
        {item.thumbnailUrl ? (
          <img 
            src={item.thumbnailUrl} 
            alt="Instagram reference" 
            className="w-full h-full object-cover transition-transform group-hover/card:scale-105"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center p-4 text-center ${
            isReel 
              ? 'bg-gradient-to-b from-purple-600/20 to-blue-600/20' 
              : 'bg-gradient-to-br from-blue-600/20 to-teal-600/20'
          }`}>
            <div className="flex flex-col items-center gap-2">
              {isReel ? <Video size={20} className="text-purple-400" /> : <FileText size={20} className="text-blue-400" />}
              <span className="text-[8px] font-bold text-[#555870] uppercase tracking-widest">
                {isReel ? 'Reel' : 'Post'}
              </span>
            </div>
          </div>
        )}
        
        <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md rounded-full p-1.5 border border-white/10 opacity-0 group-hover/card:opacity-100 transition-opacity">
          <ExternalLink size={10} className="text-white" />
        </div>
      </div>
      
      <div className="p-2 flex-1 flex flex-col justify-between">
        <p className="text-[9px] text-[#8B90A7] line-clamp-2 leading-tight mb-1">
          {displayCaption}
        </p>
      </div>
    </a>
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

        <div>
          <p className="text-[10px] uppercase text-[#555870] font-bold tracking-widest mb-3 flex items-center gap-2">
            📍 Visual References
            {isWorking && <RefreshCcw size={10} className="animate-spin text-[#53A9EF]" />}
          </p>
          
          <div className="grid grid-cols-3 gap-2 min-h-[100px]">
            {isWorking ? (
              // Skeleton loaders while scraping
              [1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-xl bg-[#0F111A] border border-[#2A2D3E] animate-pulse flex items-center justify-center">
                  <Play size={12} className="text-[#2A2D3E]" />
                </div>
              ))
            ) : references.length > 0 ? (
              references.map((ref) => (
                <ThumbnailCard key={ref.url} item={ref} />
              ))
            ) : (
              <div className="col-span-3 py-4 text-center text-[10px] text-[#555870] bg-[#0F111A] rounded-xl border border-dashed border-[#2A2D3E]">
                No live references found for this topic.
              </div>
            )}
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
        {status === "ready" ? "Know More" : "Discovery in progress..."} 
        <ArrowRight size={14} className={status === "ready" ? "group-hover:translate-x-1 transition-transform" : "opacity-0"} />
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
  sceneBreakdown: string[]; // Updated type
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
          <p className="text-[10px] uppercase text-[#555870] font-bold mb-1">
            {type === "reel" ? "Scene Breakdown" : "Image/Slide Breakdown"}
          </p>
          <ul className="space-y-1">
            {sceneBreakdown.map((step, i) => (
              <li key={i} className="text-xs text-[#8B90A7] flex gap-2">
                <span className="text-[#53A9EF] font-bold">•</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-[#53A9EF]/5 border border-dashed border-[#53A9EF]/20 rounded p-2">
          <p className="text-[10px] uppercase text-[#53A9EF] font-bold">
            {type === "reel" ? "AI Video Prompt" : "AI Image Prompt"}
          </p>
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

      <div>
        <h3 className="text-lg font-bold text-[#F0F2F8] mb-4 flex items-center gap-2">
          <FileText size={18} className="text-blue-400" /> 5 Strategic Post Ideas
        </h3>
        {detail.postIdeas.map((idea: any, i: number) => (
          <ContentIdea key={`${detail.topicId}-post-${i}`} {...idea} type="post" />
        ))}
      </div>

      <div>
        <h3 className="text-lg font-bold text-[#F0F2F8] mb-4 flex items-center gap-2">
          <Video size={18} className="text-purple-400" /> 5 Instagram Reel Ideas
        </h3>
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
