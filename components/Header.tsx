"use client";

import Link from "next/link";
import { Sparkles, Lightbulb, TrendingUp, Zap } from "lucide-react";
import { usePathname } from "next/navigation";

export const Header = ({ 
  activeTab, 
  setActiveTab 
}: { 
  activeTab?: string, 
  setActiveTab?: (tab: any) => void 
}) => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 h-20 border-b border-[#2A2D3E] flex items-center px-10 justify-between shrink-0 bg-[#0F111A]/80 backdrop-blur-xl z-50">
      <div className="flex items-center gap-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#53A9EF] rounded-xl flex items-center justify-center shadow-lg shadow-[#53A9EF]/20 group-hover:scale-110 transition-transform">
            <Sparkles size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-white text-lg tracking-tight leading-none uppercase">YesCity AI</span>
            <span className="text-[10px] text-[#53A9EF] font-black uppercase tracking-[0.3em] mt-1">Intelligence</span>
          </div>
        </Link>

        {/* Unified Navigation Tabs */}
        <nav className="flex bg-[#1A1D27] p-1.5 rounded-2xl border border-[#2A2D3E] shadow-inner">
          {setActiveTab ? (
            <>
              <button 
                onClick={() => setActiveTab("discover")}
                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  activeTab === "discover" ? "bg-[#53A9EF] text-white shadow-xl scale-105" : "text-[#555870] hover:text-[#8B90A7]"
                }`}
              >
                <Lightbulb size={14} /> Discovery
              </button>
              <button 
                onClick={() => setActiveTab("daily")}
                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  activeTab === "daily" ? "bg-[#53A9EF] text-white shadow-xl scale-105" : "text-[#555870] hover:text-[#8B90A7]"
                }`}
              >
                <TrendingUp size={14} /> Daily Trends
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/"
                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  pathname === "/" ? "bg-[#53A9EF] text-white shadow-xl scale-105" : "text-[#555870] hover:text-[#8B90A7]"
                }`}
              >
                <Lightbulb size={14} /> Discovery
              </Link>
              <Link 
                href="/?tab=daily"
                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  false ? "text-white bg-[#53A9EF]" : "text-[#555870] hover:text-[#8B90A7]"
                }`}
              >
                <TrendingUp size={14} /> Daily Trends
              </Link>
            </>
          )}
        </nav>

        <Link 
          href="/idea-generator"
          className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors flex items-center gap-2 ${
            pathname === "/idea-generator" ? "text-[#53A9EF]" : "text-[#555870] hover:text-[#53A9EF]"
          }`}
        >
          <Zap size={14} /> Idea Generator
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-black text-[#53A9EF] tracking-[0.3em]">Phase 1 Active</span>
          <span className="text-[8px] text-[#555870] font-bold uppercase tracking-widest mt-0.5">Live Intelligence Engine</span>
        </div>
        <div className="w-10 h-10 rounded-full border border-[#2A2D3E] bg-[#1A1D27] flex items-center justify-center overflow-hidden">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        </div>
      </div>
    </header>
  );
};
