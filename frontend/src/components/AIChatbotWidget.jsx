import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ChevronDown,
  BookOpen,
  RotateCcw,
  ExternalLink,
  HelpCircle,
  Briefcase,
  Code2,
  FileCheck,
} from "lucide-react";
import { sendChatMessage, getChatbotSuggestions } from "../api/chatbot";

// Simple robust markdown-to-JSX parser
function renderMarkdown(text) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements = [];
  let inList = false;
  let listItems = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-2 space-y-1.5 list-disc pl-5">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {parseInline(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const parseInline = (str) => {
    // Split by code blocks or bold
    const parts = [];
    let remaining = str;

    // Replace bold **text** and `code`
    const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }
      const raw = match[0];
      if (raw.startsWith("**") && raw.endsWith("**")) {
        parts.push(
          <strong key={match.index} className="font-semibold text-emerald-400">
            {raw.slice(2, -2)}
          </strong>
        );
      } else if (raw.startsWith("`") && raw.endsWith("`")) {
        parts.push(
          <code
            key={match.index}
            className="px-1.5 py-0.5 rounded text-xs font-mono bg-black/20 text-emerald-300"
          >
            {raw.slice(1, -1)}
          </code>
        );
      } else if (raw.startsWith("*") && raw.endsWith("*")) {
        parts.push(<em key={match.index}>{raw.slice(1, -1)}</em>);
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }
    return parts.length > 0 ? parts : str;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("### ") || trimmed.startsWith("#### ")) {
      flushList();
      const level = trimmed.startsWith("### ") ? "text-sm font-bold" : "text-xs font-semibold";
      const content = trimmed.replace(/^#+\s*/, "");
      elements.push(
        <div key={index} className={`mt-3 mb-1 text-emerald-400 ${level}`}>
          {parseInline(content)}
        </div>
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      inList = true;
      listItems.push(trimmed.slice(2));
    } else if (/^\d+\.\s/.test(trimmed)) {
      flushList();
      elements.push(
        <div key={index} className="my-1.5 pl-2 leading-relaxed">
          {parseInline(trimmed)}
        </div>
      );
    } else if (trimmed.startsWith("---")) {
      flushList();
      elements.push(<hr key={index} className="my-2.5 border-white/10" />);
    } else if (trimmed.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote
          key={index}
          className="my-2 pl-3 py-1 border-l-2 border-emerald-400 bg-emerald-500/10 rounded-r text-xs leading-relaxed"
        >
          {parseInline(trimmed.slice(2))}
        </blockquote>
      );
    } else if (trimmed.length === 0) {
      flushList();
    } else {
      flushList();
      elements.push(
        <p key={index} className="my-1 leading-relaxed">
          {parseInline(line)}
        </p>
      );
    }
  });

  flushList();
  return elements;
}

const STARTER_PROMPTS = [
  { label: "Google SDE Roadmap", query: "What is the Google SDE interview roadmap and rounds?" },
  { label: "STAR Method", query: "How do I use the STAR method in behavioral interview questions?" },
  { label: "ATS Resume Scanner", query: "How does the HireLoop ATS Resume Scanner evaluate resumes?" },
  { label: "Process vs Thread", query: "Explain Process vs Thread and context switching in OS" },
];

export default function AIChatbotWidget({ dark = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! 👋 I'm your **HireLoop AI Career Mentor**.\n\nAsk me about **tech roadmaps** (Google, Microsoft, Amazon), **Core CS fundamentals** (OS, DBMS, Networks), **behavioral prep** (STAR method, HR rounds), or **how HireLoop works**.",
      citations: [],
      suggested_followups: [
        "Google SDE interview roadmap",
        "How do I use the STAR method?",
        "How to book a mock interview on HireLoop?",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unreadBadge, setUnreadBadge] = useState(true);
  const [showCitationsFor, setShowCitationsFor] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Theme styles matching HireLoop LandingPage
  const theme = {
    bg: dark ? "#0a0e17" : "#ffffff",
    surface: dark ? "#111827" : "#f8fafc",
    card: dark ? "#1e293b" : "#f1f5f9",
    border: dark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
    text: dark ? "#f3f4f6" : "#0f172a",
    muted: dark ? "#9ca3af" : "#64748b",
    green: "#10b981",
    greenLight: "#34d399",
    accentGlow: "rgba(16, 185, 129, 0.2)",
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadBadge(false);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages]);

  const handleSend = async (messageText = null) => {
    const query = (messageText || input).trim();
    if (!query || isLoading) return;

    setInput("");

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Build history payload
      const historyPayload = messages
        .filter((m) => m.id !== "welcome")
        .slice(-4)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await sendChatMessage(query, historyPayload, "guest");

      const botMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: res.answer || "I received your query.",
        citations: res.citations || [],
        suggested_followups: res.suggested_followups || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "I encountered a temporary connection issue. Please make sure the service is online or try asking again shortly.";

      const errorMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `⚠️ ${detail}`,
        citations: [],
        suggested_followups: ["Google SDE roadmap", "HireLoop ATS resume scanner"],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Conversation cleared! How can I assist with your interview prep or placements today?",
        citations: [],
        suggested_followups: [
          "Google SDE interview roadmap",
          "Explain Process vs Thread",
          "How does the HireLoop ATS Resume Scanner work?",
        ],
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* --- FLOATING LAUNCHER BUTTON --- */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="relative flex items-center gap-2.5 px-4 py-3 rounded-full text-white shadow-2xl transition-all"
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.5), 0 8px 10px -6px rgba(16, 185, 129, 0.3)",
          }}
          aria-label="Open AI Career Assistant"
        >
          <div className="relative">
            <Bot size={22} className="text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-emerald-600 animate-ping" />
          </div>
          <span className="font-semibold text-sm tracking-wide">Ask HireLoop AI</span>
          <Sparkles size={16} className="text-amber-300" />

          {unreadBadge && (
            <span className="absolute -top-1.5 -left-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900 shadow">
              RAG AI
            </span>
          )}
        </motion.button>
      )}

      {/* --- EXPANDED CHAT DRAWER / WINDOW --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-[92vw] sm:w-105 h-150 max-h-[85vh] rounded-2xl flex flex-col shadow-2xl border overflow-hidden backdrop-blur-xl"
            style={{
              background: theme.surface,
              borderColor: theme.border,
              color: theme.text,
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3.5 border-b flex items-center justify-between"
              style={{
                background: dark ? "rgba(17, 24, 39, 0.95)" : "rgba(248, 250, 252, 0.95)",
                borderColor: theme.border,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                >
                  <Bot size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm leading-tight">HireLoop AI</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      RAG Agent
                    </span>
                  </div>
                  <p className="text-[11px] leading-tight" style={{ color: theme.muted }}>
                    Placement & Interview Advisor
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  title="Clear conversation"
                  className="p-1.5 rounded-lg text-xs transition-colors hover:bg-white/10"
                  style={{ color: theme.muted }}
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize chat"
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: theme.muted }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Quick Starter Chips (shown when only greeting exists) */}
            {messages.length === 1 && (
              <div
                className="px-4 py-2.5 border-b flex items-center gap-2 overflow-x-auto text-xs scrollbar-none"
                style={{ borderColor: theme.border, background: dark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)" }}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider shrink-0" style={{ color: theme.muted }}>
                  Quick:
                </span>
                {STARTER_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p.query)}
                    className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all hover:scale-105 border"
                    style={{
                      background: dark ? "rgba(255,255,255,0.05)" : "#ffffff",
                      borderColor: dark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
                      color: dark ? "#d1d5db" : "#334155",
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
              {messages.map((msg) => {
                const isBot = msg.role === "assistant";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isBot ? "items-start" : "items-end"}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm ${
                        isBot
                          ? dark
                            ? "bg-slate-800/90 text-slate-100 border border-slate-700/60"
                            : "bg-white text-slate-900 border border-slate-200"
                          : "bg-emerald-600 text-white rounded-br-none"
                      }`}
                    >
                      {isBot ? renderMarkdown(msg.content) : msg.content}

                      {/* Source Citations Collapsible */}
                      {isBot && msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-white/10">
                          <button
                            onClick={() =>
                              setShowCitationsFor(showCitationsFor === msg.id ? null : msg.id)
                            }
                            className="flex items-center gap-1.5 text-[11px] text-emerald-400 hover:underline font-medium"
                          >
                            <BookOpen size={12} />
                            <span>
                              {msg.citations.length} verified knowledge source
                              {msg.citations.length > 1 ? "s" : ""}
                            </span>
                            <ChevronDown
                              size={12}
                              className={`transition-transform ${
                                showCitationsFor === msg.id ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {showCitationsFor === msg.id && (
                            <div className="mt-2 space-y-1.5">
                              {msg.citations.map((c, cIdx) => (
                                <div
                                  key={cIdx}
                                  className="p-2 rounded-lg text-[11px] border"
                                  style={{
                                    background: dark ? "rgba(0,0,0,0.3)" : "#f8fafc",
                                    borderColor: dark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                                  }}
                                >
                                  <div className="font-semibold text-emerald-400 flex items-center justify-between">
                                    <span>{c.title}</span>
                                    <span className="text-[10px] opacity-75">
                                      Match: {Math.round(c.similarity * 100)}%
                                    </span>
                                  </div>
                                  <p className="mt-1 line-clamp-2" style={{ color: theme.muted }}>
                                    {c.snippet}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Follow-up suggestion pills */}
                    {isBot && msg.suggested_followups && msg.suggested_followups.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5 max-w-[88%]">
                        {msg.suggested_followups.slice(0, 3).map((sugg, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleSend(sugg)}
                            className="px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors hover:border-emerald-400 hover:text-emerald-400 text-left"
                            style={{
                              background: dark ? "rgba(255, 255, 255, 0.03)" : "#ffffff",
                              borderColor: dark ? "rgba(255, 255, 255, 0.1)" : "#e2e8f0",
                              color: theme.muted,
                            }}
                          >
                            💡 {sugg}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-center gap-2 text-xs" style={{ color: theme.muted }}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-emerald-500/20 text-emerald-400">
                    <Bot size={14} />
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Synthesizing RAG answer</span>
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div
              className="p-3 border-t"
              style={{
                borderColor: theme.border,
                background: dark ? "rgba(17, 24, 39, 0.95)" : "rgba(248, 250, 252, 0.95)",
              }}
            >
              <div className="relative flex items-center">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about roadmaps, STAR method, ATS score..."
                  rows={1}
                  className="w-full pl-3 pr-11 py-2.5 text-xs sm:text-sm rounded-xl resize-none outline-none transition-all border"
                  style={{
                    background: dark ? "#1e293b" : "#ffffff",
                    borderColor: dark ? "rgba(255,255,255,0.12)" : "#cbd5e1",
                    color: theme.text,
                  }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                  }}
                  title="Send message"
                >
                  <Send size={14} />
                </button>
              </div>
              <div className="mt-1.5 px-1 flex items-center justify-between text-[10px]" style={{ color: theme.muted }}>
                <span>Shift + Enter for new line</span>
                <span className="flex items-center gap-1">
                  <Sparkles size={10} className="text-emerald-400" />
                  ML Hybrid RAG Pipeline
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
