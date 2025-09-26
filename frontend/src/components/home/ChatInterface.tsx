// ChatInterface.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Plus, Trash2, User, Bot, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { addMessage, setSelectedMapData, setIsChatMapOpen, clearThoughts } from "@/slices/chatSlice";
import LightRays from "@/components/ui/LightRays";
import socketService from "@/services/socketService";
import Analysis from "./Analysis";
import TypewriterThoughts from "@/components/ui/TypewriterThoughts";

const ChatInterface = () => {
  const dispatch = useDispatch();
  const chats = useSelector((state: RootState) => state.chat.chats);
  const thoughts = useSelector((state: RootState) => state.chat.thoughts);
  const queryType = useSelector((state: RootState) => state.chat.queryType);
  const isResult = useSelector((state: RootState) => state.chat.isResult);

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const scrollToBottom = (force = false) => {
    if (messagesEndRef.current && (!isScrolling || force)) {
      setIsScrolling(true);
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      // Reset scrolling flag after animation
      setTimeout(() => setIsScrolling(false), 500);
    }
  };

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chats.length, isResult]);

  // Auto-scroll when thoughts are being written (more frequent)
  useEffect(() => {
    if (thoughts.length > 0 && !isResult) {
      // Scroll immediately when new thoughts arrive
      scrollToBottom(true);
      
      // Set up interval to scroll during typewriter animation
      const interval = setInterval(() => {
        if (!isResult && thoughts.length > 0) {
          scrollToBottom();
        }
      }, 100); // Check every 100ms during animation

      return () => clearInterval(interval);
    }
  }, [thoughts.length, isResult]);

  // Auto-scroll when query type changes (shows loader)
  useEffect(() => {
    if (queryType) {
      scrollToBottom();
    }
  }, [queryType]);

  const handleSendMessage = () => {
    const text = inputMessage.trim();
    if (!text) return;
    dispatch(clearThoughts());
    dispatch(
      addMessage({
      role: "user",
        message: text,
        timestamp: new Date().toISOString(),
      }) as any
    );
    socketService.connect();
    socketService.sendQuery(text);
    setInputMessage("");
    
    // Scroll immediately when user sends message
    setTimeout(() => scrollToBottom(true), 100);
  };

  return (
    <div className="home-container relative w-full h-screen overflow-hidden">
      {/* Background LightRays matching home page */}
      <div className="fixed inset-0 z-0">
        <LightRays 
          raysColor="#00f5ff" 
          raysOrigin="top-center"
          raysSpeed={1.2}
          lightSpread={1.5}
          rayLength={2.5}
          fadeDistance={1.2}
        />
      </div>

      <div className="relative z-20 flex h-full bg-transparent">
        {/* Sidebar */}
        <div className="w-80 bg-black/20 backdrop-blur-lg border-r border-cyan-500/20 flex flex-col">
          <div className="p-6 border-b border-cyan-500/20">
            <button
              className="w-full flex items-center justify-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 rounded-xl px-4 py-3 text-cyan-300 transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-2">
              {/* Single current chat summary derived from store */}
              <div className="group relative p-3 rounded-lg cursor-pointer transition-all duration-300 bg-cyan-500/20 border border-cyan-400/30 shadow-lg shadow-cyan-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate text-sm">Current Chat</p>
                    <p className="text-slate-400 text-xs mt-1">{chats.length} messages</p>
                    </div>
                  <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all duration-200">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-transparent">
          {/* Chat Header */}
          <div className="border-b border-cyan-500/20 px-6 py-2 bg-black/10 backdrop-blur-sm">
            <h1 className="text-xl font-bold text-white">FloatChat</h1>
            <p className="text-cyan-300/80 text-sm">AI-Powered Oceanographic Data Assistant</p>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {chats.length === 0 ? (
              <div className="flex items-center justify-center h-full text-cyan-300/60">
                <div className="text-center">
                  <Bot className="w-16 h-16 mx-auto mb-4 text-cyan-400 opacity-50" />
                  <p className="text-lg">Start a conversation about ARGO data</p>
                  <p className="text-sm mt-2">Ask about ocean temperature, salinity, or currents</p>
                </div>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex gap-4 ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {chat.role !== 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-2xl rounded-2xl p-4 backdrop-blur-sm ${
                      chat.role === 'user'
                        ? 'bg-cyan-500/20 border border-cyan-400/30 rounded-br-none shadow-lg shadow-cyan-500/10'
                        : chat.report?.title === 'Error'
                          ? 'bg-red-900/20 border border-red-500/40 rounded-bl-none shadow-lg shadow-red-600/20'
                          : 'bg-white/5 border border-cyan-400/20 rounded-bl-none shadow-lg shadow-cyan-500/5'
                    }`}
                  >
                    {chat.role === 'user' ? (
                      <p className="text-white">{(chat as any).message}</p>
                    ) : (
                      <div className="space-y-3">
                        {chat.report?.title && (
                          <h3 className="text-lg font-semibold text-white">{chat.report.title}</h3>
                        )}
                        {chat.report?.content && (
                          <p className="text-cyan-100/90 whitespace-pre-wrap">{chat.report.content}</p>
                        )}
                        {Array.isArray(chat.graphs) && chat.graphs.length > 0 && (
                          <Analysis graphs={chat.graphs as any} />
                        )}
                        {Array.isArray(chat.maps) && chat.maps.length > 0 && (
                          <div className="pt-1">
                            <button
                              className="inline-flex items-center gap-2 rounded-md bg-slate-900 text-white px-3 py-1.5 text-sm hover:bg-slate-700"
                              onClick={() => { dispatch(setSelectedMapData({ chatId: chat.id })); dispatch(setIsChatMapOpen(true)); }}
                            >
                              View map
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {chat.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Hide live thoughts when a result or error arrived */}
            {!isResult && (
              <div>
                {queryType && (
                  <div className="flex gap-4 justify-start mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white/5 border border-cyan-400/20 rounded-2xl rounded-bl-none p-4 backdrop-blur-sm flex items-center gap-3">
                      <span className="inline-block text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {queryType}
                      </span>
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                    </div>
                  </div>
                )}
                <TypewriterThoughts 
                  thoughts={thoughts} 
                  isVisible={!isResult} 
                  onContentChange={() => scrollToBottom()}
                />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-cyan-500/20 px-6 py-2 bg-black/10 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto">
              <div className="relative group flex items-center justify-between">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask anything about ARGO oceanographic data..."
                  className="w-full h-20 bg-[#010f1a] border border-cyan-500/30 rounded-xl resize-none outline-none p-4 text-white placeholder-cyan-200/60
                            transition-all duration-500 focus:border-cyan-400 group-hover:border-cyan-400/60
                            shadow-lg shadow-cyan-500/10 focus:shadow-cyan-400/30
                            text-lg font-light pr-14 backdrop-blur-sm"
                  rows={3}
                />
                
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="absolute bottom-6 right-3 p-2 bg-cyan-500/10 border border-cyan-400/30 rounded-full 
                           hover:bg-cyan-400/20 hover:border-cyan-400/50 transition-all duration-300
                           disabled:opacity-30 disabled:cursor-not-allowed
                           shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/40"
                >
                  <Send className="text-cyan-300 w-5 h-5" />
                </button>

                <div className="absolute -inset-2 rounded-xl bg-gradient-to-r from-cyan-400/30 via-cyan-400/60 to-cyan-400/30 
                              opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-700 blur-lg z-[-1]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;