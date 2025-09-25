// ChatInterface.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Send, Plus, Trash2, Clock, User, Bot } from "lucide-react";
import LightRays from "@/components/ui/LightRays";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const ChatInterface = ({ initialMessage, chatId }: { initialMessage?: string; chatId: string }) => {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: chatId,
      title: initialMessage?.slice(0, 50) + (initialMessage && initialMessage.length > 50 ? "..." : "") || "New Chat",
      messages: initialMessage ? [
        {
          id: "1",
          content: initialMessage,
          role: "user",
          timestamp: new Date(),
        }
      ] : [],
      createdAt: new Date(),
    },
  ]);
  const [activeChatId, setActiveChatId] = useState(chatId);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find(chat => chat.id === activeChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: "user",
      timestamp: new Date(),
    };

    // Update chat with user message
    const updatedChats = chats.map(chat =>
      chat.id === activeChatId
        ? {
            ...chat,
            messages: [...chat.messages, newMessage],
            title: chat.title === "New Chat" ? inputMessage.slice(0, 50) + (inputMessage.length > 50 ? "..." : "") : chat.title,
          }
        : chat
    );

    setChats(updatedChats);
    setInputMessage("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you're asking about "${inputMessage}". As an AI specialized in ARGO oceanographic data, I can help you analyze temperature patterns, salinity data, or ocean currents. What specific aspect would you like to explore?`,
        role: "assistant",
        timestamp: new Date(),
      };

      const finalChats = updatedChats.map(chat =>
        chat.id === activeChatId
          ? { ...chat, messages: [...chat.messages, aiMessage] }
          : chat
      );

      setChats(finalChats);
      setIsLoading(false);
    }, 2000);
  };

  const createNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChat: Chat = {
      id: newChatId,
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChatId);
  };

  const deleteChat = (chatIdToDelete: string) => {
    if (chats.length <= 1) return;
    
    const filteredChats = chats.filter(chat => chat.id !== chatIdToDelete);
    setChats(filteredChats);
    
    if (chatIdToDelete === activeChatId) {
      setActiveChatId(filteredChats[0]?.id || "");
    }
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
              onClick={createNewChat}
              className="w-full flex items-center justify-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 rounded-xl px-4 py-3 text-cyan-300 transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                    activeChatId === chat.id
                      ? "bg-cyan-500/20 border border-cyan-400/30 shadow-lg shadow-cyan-500/10"
                      : "bg-white/5 hover:bg-white/10 border border-transparent hover:border-cyan-400/20"
                  }`}
                  onClick={() => setActiveChatId(chat.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate text-sm">
                        {chat.title}
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        {chat.messages.length} messages
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-transparent">
          {/* Chat Header */}
          <div className="border-b border-cyan-500/20 p-6 bg-black/10 backdrop-blur-sm">
            <h1 className="text-2xl font-bold text-white">FloatChat</h1>
            <p className="text-cyan-300/80 text-sm">AI-Powered Oceanographic Data Assistant</p>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeChat?.messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-cyan-300/60">
                <div className="text-center">
                  <Bot className="w-16 h-16 mx-auto mb-4 text-cyan-400 opacity-50" />
                  <p className="text-lg">Start a conversation about ARGO data</p>
                  <p className="text-sm mt-2">Ask about ocean temperature, salinity, or currents</p>
                </div>
              </div>
            ) : (
              activeChat?.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-2xl rounded-2xl p-4 backdrop-blur-sm ${
                      message.role === "user"
                        ? "bg-cyan-500/20 border border-cyan-400/30 rounded-br-none shadow-lg shadow-cyan-500/10"
                        : "bg-white/5 border border-cyan-400/20 rounded-bl-none shadow-lg shadow-cyan-500/5"
                    }`}
                  >
                    <p className="text-white">{message.content}</p>
                    <p className="text-xs text-cyan-300/60 mt-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white/5 border border-cyan-400/20 rounded-2xl rounded-bl-none p-4 backdrop-blur-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-cyan-500/20 p-6 bg-black/10 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto">
              <div className="relative group">
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
                  disabled={isLoading || !inputMessage.trim()}
                  className="absolute bottom-3 right-3 p-2 bg-cyan-500/10 border border-cyan-400/30 rounded-full 
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