"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  TrendingUp, 
  Search, 
  Send, 
  Sparkles, 
  Globe, 
  ArrowRight,
  ChevronLeft,
  RefreshCcw,
  Zap,
  FileText,
  Video
} from "lucide-react";
import { TrendCard, TrendDetailView } from "@/components/ChatComponents";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  data?: any;
  dataType?: "trends" | "detail";
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: "welcome", // Handled by conditional rendering
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSourceUsed, setLastSourceUsed] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleTrendDiscovery = async () => {
    setIsLoading(true);
    setError(null);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const res = await fetch("/api/scrape/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: currentSession?._id }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      console.log("Trend Discovery Response:", data);

      if (data.success) {
        setCurrentSession(data.session);
        setLastSourceUsed(data.sourceUsed);
        const content = data.sourceUsed === "fallback" 
          ? "I couldn't find usable live results right now, so I loaded sample trend data for testing:" 
          : "I've discovered some broad trends that we can adapt for YesCity:";
        
        const assistantMessage: Message = {
          id: Date.now().toString(),
          type: "assistant",
          content,
          data: data.session.trendCards,
          dataType: "trends",
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || "Failed to find trends");
      }
    } catch (err: any) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: `Sorry, I encountered an error: ${err.message}. Please try again.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (overrideText?: string) => {
    const text = overrideText || input;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    
    const normalizedText = text.toLowerCase();
    if (normalizedText.includes("current trends") || normalizedText.includes("discover trends") || normalizedText.includes("know trends")) {
      await handleTrendDiscovery();
    } else {
      setIsLoading(true);
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: "I'm currently specialized in tracking trends across domains. Try asking me to 'Discover current trends'!",
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 600);
    }
  };

  const handleKnowMore = async (trend: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat/detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSession?.sessionId,
          trendId: trend.trendId,
          trendTitle: trend.title,
          hashtags: trend.hashtags,
          classification: trend.classification,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const detailMessage: Message = {
          id: Date.now().toString(),
          type: "assistant",
          content: `Deep dive: ${trend.title}`,
          data: data.detail,
          dataType: "detail",
        };
        setMessages((prev) => [...prev, detailMessage]);
      } else {
        throw new Error(data.error || "Failed to get trend details");
      }
    } catch (err: any) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: `Failed to load details: ${err.message}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToTrends = () => {
    if (!currentSession) return;
    
    const assistantMessage: Message = {
      id: Date.now().toString(),
      type: "assistant",
      content: "Back to all trends:",
      data: currentSession.trendCards,
      dataType: "trends",
    };
    setMessages((prev) => [...prev, assistantMessage]);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0F111A]">
      {/* Header */}
      <header className="h-16 border-b border-[#2A2D3E] flex items-center px-6 justify-between shrink-0 bg-[#0F111A]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#53A9EF] rounded-lg flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-bold text-white tracking-tight">YesCity AI Content Engine</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] uppercase font-bold text-[#555870] tracking-widest bg-[#1A1D27] px-2 py-1 rounded border border-[#2A2D3E]">
            MVP v2.0 - Broad Search
          </span>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-4xl mx-auto py-10 px-6">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-4 mb-8 ${m.type === "user" ? "justify-end" : ""}`}>
              {m.type === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-[#1A1D27] border border-[#2A2D3E] flex items-center justify-center shrink-0 mt-1">
                  <Sparkles size={14} className="text-[#53A9EF]" />
                </div>
              )}
              
              <div className={`flex-1 max-w-[85%] ${m.type === "user" ? "ml-auto" : ""}`}>
                {m.id === "welcome" ? (
                  <div className="text-center mb-10 mt-10">
                    <div className="w-16 h-16 bg-[#53A9EF]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#53A9EF]/20">
                      <TrendingUp size={32} className="text-[#53A9EF]" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">YesCity AI Content Engine</h1>
                    <p className="text-[#8B90A7] max-w-md mx-auto mb-8">
                      Discover broad trends across news, memes, and culture, and adapt them into high-converting city-discovery content.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => handleSend("Discover current trends")}
                        className="p-4 rounded-xl bg-[#1A1D27] border border-[#2A2D3E] hover:border-[#53A9EF]/50 transition-all text-left group"
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <Globe size={18} className="text-[#53A9EF]" />
                          <span className="text-sm font-semibold text-white group-hover:text-[#53A9EF]">Discover broad trends</span>
                        </div>
                        <p className="text-xs text-[#8B90A7]">Search across memes, news, and more</p>
                      </button>
                      <button
                        onClick={() => handleSend("Tell me about recent viral memes")}
                        className="p-4 rounded-xl bg-[#1A1D27] border border-[#2A2D3E] hover:border-[#53A9EF]/50 transition-all text-left group"
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <Zap size={18} className="text-purple-400" />
                          <span className="text-sm font-semibold text-white group-hover:text-purple-400">Adapt viral memes</span>
                        </div>
                        <p className="text-xs text-[#8B90A7]">Convert internet culture into brand content</p>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 rounded-2xl ${
                    m.type === "user" 
                      ? "bg-[#53A9EF] text-white" 
                      : "bg-[#1A1D27] border border-[#2A2D3E] text-[#F0F2F8]"
                  }`}>
                    <p className="text-sm leading-relaxed">{m.content}</p>
                    
                    {m.type === "assistant" && m.dataType === "trends" && lastSourceUsed && (
                      <div className="mt-2 flex items-center gap-1.5 opacity-50">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          lastSourceUsed === "live" ? "bg-green-400" : lastSourceUsed === "cache" ? "bg-blue-400" : "bg-amber-400"
                        }`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Source: {lastSourceUsed === "fallback" ? "Demo Data" : lastSourceUsed === "live" ? "Live Instagram" : "Cached"}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {m.dataType === "trends" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {m.data.map((trend: any) => (
                      <TrendCard 
                        key={trend.trendId} 
                        {...trend} 
                        onKnowMore={() => handleKnowMore(trend)} 
                      />
                    ))}
                  </div>
                )}

                {m.dataType === "detail" && (
                  <div className="mt-6 p-6 bg-[#1A1D27] border border-[#2A2D3E] rounded-3xl">
                    <TrendDetailView 
                      detail={m.data} 
                      onBack={handleBackToTrends}
                      onExploreAnother={() => setMessages(prev => prev.slice(0, prev.length - 1))}
                      onGenerateMore={() => handleKnowMore(m.data)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4 mb-8">
              <div className="w-8 h-8 rounded-lg bg-[#1A1D27] border border-[#2A2D3E] flex items-center justify-center shrink-0">
                <RefreshCcw size={14} className="text-[#53A9EF] animate-spin" />
              </div>
              <div className="flex-1 max-w-[85%]">
                <div className="p-4 rounded-2xl bg-[#1A1D27] border border-[#2A2D3E] text-[#555870] flex items-center gap-2">
                  <span className="text-xs">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-6 shrink-0 bg-[#0F111A]">
        <div className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about current trends or adaptation ideas..."
            className="w-full bg-[#1A1D27] border border-[#2A2D3E] text-white rounded-2xl px-6 py-4 focus:outline-none focus:border-[#53A9EF]/50 transition-all pr-16 shadow-2xl"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-3 w-10 h-10 bg-[#53A9EF] text-white rounded-xl flex items-center justify-center hover:bg-[#2B90E6] transition-all disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-center text-[10px] text-[#555870] mt-4 uppercase tracking-widest font-bold">
          Powered by Groq Llama-3.3 70B & YesCity Intel
        </p>
      </footer>
    </div>
  );
}
