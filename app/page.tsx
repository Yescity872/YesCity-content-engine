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
    
    // 1. Batch Rotation Detection (Asking for "more")
    const isMoreRequest = normalizedText.includes("more") || normalizedText.includes("other") || normalizedText.includes("next");
    const isDiscovery = normalizedText.includes("current trends") || normalizedText.includes("discover trends") || normalizedText.includes("know trends");

    if (isDiscovery || (isMoreRequest && currentSession)) {
      await handleTrendDiscovery(isMoreRequest);
    } 
    // 2. Custom Specific Trend Search Detection
    else if (
      normalizedText.includes("find") || 
      normalizedText.includes("search") || 
      normalizedText.includes("show") || 
      normalizedText.includes("give me") || 
      normalizedText.includes("about") ||
      normalizedText.length > 3 // Assume short specific queries are topics
    ) {
      await handleCustomTrendSearch(text);
    }
    else {
      setIsLoading(true);
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: "I can help you discover current trends or search for specific topics. Try 'Discover trends' or 'Find airport fit check trends'!",
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 600);
    }
  };

  const handleTrendDiscovery = async (isMoreRequest = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const payload: any = { forceRefresh: false };
      if (isMoreRequest && currentSession) {
        payload.sessionId = currentSession.sessionId;
        payload.nextBatch = true;
      }

      const res = await fetch("/api/trends/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        if (!isMoreRequest) setCurrentSession(data);
        
        const sessionId = data.sessionId;
        const assistantMessageId = Date.now().toString();
        const assistantMessage: Message = {
          id: assistantMessageId,
          type: "assistant",
          content: isMoreRequest 
            ? "Finding the next set of trends from this week's batch..." 
            : "I'm identifying current trends for you. Topics will appear below as they are verified with live references:",
          data: data.topics,
          dataType: "trends",
        };
        setMessages((prev) => [...prev, assistantMessage]);
        startPolling(sessionId, assistantMessageId);
      } else {
        throw new Error(data.error || "Failed to start discovery");
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleCustomTrendSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`[CustomSearch] Initiating: ${query}`);
      const res = await fetch("/api/trends/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      const data = await res.json();

      if (data.success) {
        const sessionId = data.sessionId;
        const assistantMessageId = Date.now().toString();
        const assistantMessage: Message = {
          id: assistantMessageId,
          type: "assistant",
          content: `Searching for trends related to "${query}" and validating evidence...`,
          data: data.topics,
          dataType: "trends",
        };
        setMessages((prev) => [...prev, assistantMessage]);
        startPolling(sessionId, assistantMessageId);
      } else {
        throw new Error(data.error || "Search failed");
      }
    } catch (err: any) {
      console.error("[CustomSearch] Error:", err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const startPolling = (sessionId: string, assistantMessageId: string) => {
    let isComplete = false;
    let pollCount = 0;

    const pollInterval = setInterval(async () => {
      try {
        pollCount++;
        const statusRes = await fetch("/api/trends/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId })
        });
        const statusData = await statusRes.json();

        if (statusData.success && statusData.topics && statusData.topics.length > 0) {
          setMessages(prev => prev.map(m => {
            if (m.id === assistantMessageId) {
              return { ...m, data: statusData.topics };
            }
            return m;
          }));

          const allDone = statusData.topics.every((t: any) => t.status === "ready" || t.status === "failed");
          if (allDone) {
            isComplete = true;
            clearInterval(pollInterval);
            setIsLoading(false);
          }
        } else if (pollCount > 20) { 
          // Timeout after 1 minute (20 * 3s)
          console.error("[Polling] Timeout reached for session:", sessionId);
          clearInterval(pollInterval);
          setIsLoading(false);
        }
      } catch (pollErr) {
        console.error("Polling error:", pollErr);
      }
    }, 3000);
  };

  const handleKnowMore = async (topicId: string) => {
    if (!topicId) {
      console.error("Missing topicId for Know More request");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat/detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId }),
      });
      const data = await res.json();
      if (data.success) {
        const detailMessage: Message = {
          id: Date.now().toString(),
          type: "assistant",
          content: `Deep dive analysis for this trend:`,
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
      content: "Back to your last trend discovery:",
      data: currentSession.topics,
      dataType: "trends",
    };
    setMessages((prev) => [...prev, assistantMessage]);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0F111A]">
      <header className="h-16 border-b border-[#2A2D3E] flex items-center px-6 justify-between shrink-0 bg-[#0F111A]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#53A9EF] rounded-lg flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-bold text-white tracking-tight">YesCity AI Content Engine</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] uppercase font-bold text-[#53A9EF] tracking-widest bg-[#53A9EF]/10 px-2 py-1 rounded border border-[#53A9EF]/20">
            Product v1.0 - Live Intelligence
          </span>
        </div>
      </header>

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
                      Discover broad trends or search for specific niches to adapt into high-converting city content.
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
                        onClick={() => handleSend("Find street food trends")}
                        className="p-4 rounded-xl bg-[#1A1D27] border border-[#2A2D3E] hover:border-[#53A9EF]/50 transition-all text-left group"
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <Search size={18} className="text-purple-400" />
                          <span className="text-sm font-semibold text-white group-hover:text-purple-400">Search specific niche</span>
                        </div>
                        <p className="text-xs text-[#8B90A7]">Target a specific category or topic</p>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 rounded-2xl ${
                    m.type === "user" ? "bg-[#53A9EF] text-white" : "bg-[#1A1D27] border border-[#2A2D3E] text-[#F0F2F8]"
                  }`}>
                    <p className="text-sm leading-relaxed">{m.content}</p>
                  </div>
                )}
                
                {m.dataType === "trends" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {m.data?.map((trend: any, idx: number) => (
                      <TrendCard 
                        key={trend.topicId || `loading-${idx}`} 
                        {...trend} 
                        onKnowMore={() => handleKnowMore(trend.topicId)} 
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
                      onGenerateMore={() => handleKnowMore(m.data.topicId)}
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

      <footer className="p-6 shrink-0 bg-[#0F111A]">
        <div className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about current trends or search for topics..."
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
