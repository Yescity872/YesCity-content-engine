"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
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
  Video,
  Lightbulb
} from "lucide-react";
import { TrendCard, TrendDetailView, PaginatedTrendView } from "@/components/ChatComponents";
import { DailyTrendDashboard } from "@/components/DailyTrendComponents";
import { Header } from "@/components/Header";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  data?: any;
  dataType?: "trends" | "detail";
}

export default function ChatAssistant() {
  const [activeTab, setActiveTab] = useState<"discover" | "daily">("discover");
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
  const [currentBatchNumber, setCurrentBatchNumber] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [lastSourceUsed, setLastSourceUsed] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    // If user is within 100px of bottom, enable auto-scroll
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isAtBottom);
  };

  const scrollToBottom = (force = false) => {
    if (force || shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
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

    // 2. Intent Detection
    // We only block/redirect if they explicitly ask for a LIVE search/scrape process.
    const isSearchRequest = 
      normalizedText.includes("scrape") || 
      normalizedText.includes("live search") || 
      normalizedText.includes("find live") || 
      normalizedText.includes("generate topics for") || 
      normalizedText.includes("run a search") ||
      (normalizedText.includes("search") && normalizedText.includes("topics"));

    if (isDiscovery || (isMoreRequest && currentSession)) {
      await handleTrendDiscovery(isMoreRequest);
    } 
    else if (isSearchRequest) {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: "Custom live search and reference scraping is coming soon. For now, you can use 'Discover Trends' for this week's broad trends, or just ask me any question about trends for marketing advice!",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }
    else {
      await handleCustomQuery(text);
    }
  };

  const handleCustomQuery = async (query: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      if (data.success) {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          type: "assistant",
          content: data.content,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (err: any) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: `I can help you discover current trends or provide marketing advice! I'm having a little trouble with that specific niche right now, but feel free to ask about broad trends.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrendDiscovery = async (isMoreRequest = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const payload: any = { forceRefresh: false };
      let requestedBatchNumber = 1;

      if (isMoreRequest && currentSession) {
        requestedBatchNumber = currentBatchNumber + 1;
        payload.sessionId = currentSession.sessionId;
        payload.batchNumber = requestedBatchNumber;
      }

      const res = await fetch("/api/trends/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        if (!data.topics || data.topics.length === 0) {
          const assistantMessage: Message = {
            id: Date.now().toString(),
            type: "assistant",
            content: "No more weekly topics available. Please refresh to generate a new set.",
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setIsLoading(false);
          return;
        }

        setCurrentSession(data); // Will update sessionId
        setCurrentBatchNumber(data.batchNumber || requestedBatchNumber);
        
        const sessionId = data.sessionId;
        const assistantMessageId = Date.now().toString();
        const assistantMessage: Message = {
          id: assistantMessageId,
          type: "assistant",
          content: isMoreRequest 
            ? `Finding batch ${data.batchNumber || requestedBatchNumber} of trends from this week...` 
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
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: `Error: ${err.message}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
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
          const totalCount = statusData.topics.length;
          const readyWithDataCount = statusData.topics.filter((t: any) => 
            t.status === "ready" && t.references?.length >= 3
          ).length;
          
          let dynamicContent = "Identifying trends...";
          if (readyWithDataCount < totalCount) {
            dynamicContent = `⚡ Getting trends ready...`;
          } else {
            dynamicContent = "✨ Trends identified! All cards are now complete with live references or full AI execution strategies:";
          }

          setMessages(prev => prev.map(m => {
            if (m.id === assistantMessageId) {
              return { ...m, content: dynamicContent, data: statusData.topics };
            }
            return m;
          }));

          const allFullyReady = statusData.topics.every((t: any) => 
            (t.status === "ready" && t.references?.length >= 3) || t.status === "failed"
          );

          // Success condition: at least 3 topics ready AND we've polled for at least 15s
          const enoughReady = readyWithDataCount >= 3 && pollCount > 5;

          if (allFullyReady || enoughReady) {
            isComplete = true;
            clearInterval(pollInterval);
            setIsLoading(false);
            
            setMessages(prev => prev.map(m => {
              if (m.id === assistantMessageId) {
                return { 
                  ...m, 
                  content: allFullyReady 
                    ? "✨ Trends identified! All cards are now complete with live references:" 
                    : "⚡ Partial intelligence window ready! Explore these 3 verified strategies while I finish the rest in the background.",
                  data: statusData.topics 
                };
              }
              return m;
            }));
          } else if (pollCount > 25) { 
            // Stop loader after ~75 seconds max
            isComplete = true;
            clearInterval(pollInterval);
            setIsLoading(false);
          }
        } else if (pollCount > 25) { 
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

  const handleDiveDeeper = async (topic: string) => {
    setActiveTab("discover");
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: `Deep research on: ${topic}`,
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsLoading(true);
    try {
      // Step 1: Trigger discovery/scrape to ensure the topic exists in our DB
      const res = await fetch("/api/chat/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: topic }),
      });
      const data = await res.json();

      if (data.success && data.topics && data.topics.length > 0) {
        // Step 2: Use the newly created/found topicId to trigger the deep-dive
        const topicId = data.topics[0].topicId;
        await handleKnowMore(topicId);
      } else {
        throw new Error("Could not initialize research for this topic.");
      }
    } catch (err: any) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: `Failed to initialize deep research: ${err.message}`,
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
      {/* Unified Premium Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-thin scroll-smooth"
      >
        <div className="max-w-4xl mx-auto py-10 px-6">
          {activeTab === "daily" ? (
            <DailyTrendDashboard onDiveDeeper={handleDiveDeeper} />
          ) : (
            <>
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
                        className="p-4 rounded-xl bg-[#1A1D27] border border-[#2A2D3E] hover:border-[#53A9EF]/50 transition-all text-left group md:col-span-2"
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <Globe size={18} className="text-[#53A9EF]" />
                          <span className="text-sm font-semibold text-white group-hover:text-[#53A9EF]">Discover broad trends</span>
                        </div>
                        <p className="text-xs text-[#8B90A7]">Search across memes, news, and more</p>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 rounded-2xl ${
                    m.type === "user" ? "bg-[#53A9EF] text-white" : "bg-[#1A1D27] border border-[#2A2D3E] text-[#F0F2F8]"
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  </div>
                )}
                
                {m.dataType === "trends" && (
                  <div className="mt-6">
                    {(() => {
                      const readyTopics = m.data?.filter((t: any) => 
                        t.status === "ready" && t.references?.length >= 3
                      ) || [];
                      
                      const isStillProcessing = m.data && 
                                               m.data.some((t: any) => t.status !== "ready" && t.status !== "failed") &&
                                               !m.content.includes("complete");

                      if (readyTopics.length === 0 && isStillProcessing) {
                        return (
                          <div className="py-16 flex flex-col items-center justify-center bg-[#0F111A] rounded-[32px] border border-dashed border-[#2A2D3E]">
                            <RefreshCcw size={40} className="text-[#53A9EF] animate-spin mb-6 opacity-40" />
                            <p className="text-sm font-bold text-[#53A9EF] uppercase tracking-[0.3em] animate-pulse">
                              Assembling Intelligence...
                            </p>
                            <p className="text-xs text-[#555870] mt-3">Synthesizing live references and execution strategies</p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          <PaginatedTrendView 
                            topics={readyTopics} 
                            onKnowMore={handleKnowMore} 
                          />
                          
                          {isStillProcessing && (
                            <div className="flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-[#53A9EF]/5 border border-[#53A9EF]/10 mx-auto w-fit">
                              <RefreshCcw size={12} className="text-[#53A9EF] animate-spin" />
                              <span className="text-[10px] font-bold text-[#53A9EF] uppercase tracking-widest">
                                Building More Strategy Packages...
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
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
            </>
          )}
        </div>
      </main>

      {activeTab === "discover" && (
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
      )}
    </div>
  );
}
