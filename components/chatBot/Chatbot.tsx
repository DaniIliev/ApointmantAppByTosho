"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { X, Mic, MicOff, Send, ChevronDown } from "lucide-react";
const SpeechRecognition =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    : null;
import callApi from "@/app/Api/callApi";
import { useAuthContext } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

/* ─── AI Robot SVG Icon ─────────────────────────────────────────── */
const AiRobotIcon = ({ className = "", size = 28 }: { className?: string; size?: number }) => (
  <svg
    viewBox="0 0 64 64"
    width={size}
    height={size}
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Antenna */}
    <circle cx="32" cy="6" r="3.5" fill="#60a5fa" />
    <rect x="30.5" y="9" width="3" height="7" rx="1.5" fill="#93c5fd" />
    {/* Head */}
    <rect x="12" y="16" width="40" height="28" rx="10" fill="url(#headGrad)" stroke="#60a5fa" strokeWidth="1.5" />
    {/* Eyes */}
    <ellipse cx="23" cy="30" rx="5" ry="5.5" fill="#1e293b" />
    <ellipse cx="41" cy="30" rx="5" ry="5.5" fill="#1e293b" />
    <circle cx="24.2" cy="28.5" r="2" fill="#60a5fa" />
    <circle cx="42.2" cy="28.5" r="2" fill="#60a5fa" />
    <circle cx="25" cy="29.5" r="0.8" fill="#fff" />
    <circle cx="43" cy="29.5" r="0.8" fill="#fff" />
    {/* Mouth */}
    <path d="M24 37 C28 41, 36 41, 40 37" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* Ears */}
    <rect x="6" y="25" width="6" height="12" rx="3" fill="#3b82f6" opacity="0.7" />
    <rect x="52" y="25" width="6" height="12" rx="3" fill="#3b82f6" opacity="0.7" />
    {/* Body */}
    <rect x="18" y="44" width="28" height="14" rx="6" fill="url(#bodyGrad)" stroke="#60a5fa" strokeWidth="1.5" />
    {/* Body detail - chest light */}
    <circle cx="32" cy="51" r="3" fill="#60a5fa" opacity="0.6" />
    <circle cx="32" cy="51" r="1.5" fill="#fff" opacity="0.8" />
    {/* Gradients */}
    <defs>
      <linearGradient id="headGrad" x1="12" y1="16" x2="52" y2="44">
        <stop offset="0%" stopColor="#1e3a5f" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="bodyGrad" x1="18" y1="44" x2="46" y2="58">
        <stop offset="0%" stopColor="#1e3a5f" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
    </defs>
  </svg>
);

/* ─── Typing Indicator ──────────────────────────────────────────── */
const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-3 max-w-[80%] mr-auto">
    <div className="flex items-center gap-1.5 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl px-4 py-2.5 shadow-sm">
      <AiRobotIcon size={18} className="opacity-60 mr-1" />
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            style={{
              animation: `chatbotBounce 1.2s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </span>
    </div>
  </div>
);

/* ─── Chat Message ──────────────────────────────────────────────── */
interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

const ChatMessage = ({ message, isUser, timestamp }: ChatMessageProps) => (
  <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} mb-3 animate-chatbotSlideIn`}>
    <div className="flex items-end gap-2 max-w-[85%]">
      {!isUser && (
        <div className="shrink-0 w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
          <AiRobotIcon size={16} />
        </div>
      )}
      <div
        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md shadow-lg shadow-primary/20"
            : "bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-md shadow-sm"
        }`}
      >
        {message}
      </div>
    </div>
    {timestamp && (
      <span className={`text-[10px] text-slate-400 dark:text-slate-500 mt-1 ${isUser ? "mr-1" : "ml-9"}`}>
        {timestamp}
      </span>
    )}
  </div>
);

/* ─── Main Chatbot Component ────────────────────────────────────── */
export default function Chatbot({
  businessId,
  locationId,
  mode = "customer",
}: {
  businessId?: string;
  locationId?: string;
  mode?: "customer" | "business-help";
}) {
  const isHelpMode = mode === "business-help";
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { t, i18n } = useTranslation();
  const isBg = i18n.language?.startsWith("bg");

  const [messages, setMessages] = useState<ChatMessageProps[]>([
    {
      message: isHelpMode
        ? (isBg
          ? "Здравейте! 💡 Аз съм вашият AI помощник за AppointDI. Мога да ви помогна с въпроси като:\n\n• Как да създам нова услуга?\n• Как да настроя график?\n• Как да добавя служител?\n• Как да управлявам локации?\n\nПитайте ме каквото и да е!"
          : "Hello! 💡 I'm your AppointDI AI helper. I can assist you with questions like:\n\n• How to create a new service?\n• How to set up a schedule?\n• How to add staff members?\n• How to manage locations?\n\nAsk me anything!")
        : (isBg
          ? "Здравейте! 👋 Аз съм вашият AI асистент. Мога да ви помогна с информация за услуги, работно време, свободни часове и запазване на час. Как мога да ви бъда полезен?"
          : "Hello! 👋 I'm your AI assistant. I can help you with services info, working hours, availability and booking appointments. How can I help you?"),
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const { user } = useAuthContext();
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [listening, setListening] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Scroll button logic
  const handleScroll = useCallback(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollBtn(!isNearBottom);
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Voice recognition
  const toggleMic = () => {
    if (!SpeechRecognition) {
      alert(
        isBg
          ? "Гласовото разпознаване не се поддържа в този браузър."
          : "Speech recognition is not supported in this browser."
      );
      return;
    }
    if (listening && recognition) {
      recognition.stop();
      setListening(false);
      return;
    }
    const recog = new SpeechRecognition();
    // Auto-detect language: try Bulgarian first, then English
    recog.lang = isBg ? "bg-BG" : "en-US";
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
      setListening(false);
    };
    recog.onerror = () => setListening(false);
    recog.onend = () => setListening(false);
    setRecognition(recog);
    setListening(true);
    recog.start();
  };

  // Send message
  const handleSendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMessage: ChatMessageProps = {
      message: trimmed,
      isUser: true,
      timestamp: now,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response: { response: string } = await callApi(
        isHelpMode ? "/api/chatbot/business-help" : "/api/chatbot",
        "POST",
        isHelpMode
          ? {
              message: trimmed,
              userId: user?._id || "guest",
            }
          : {
              message: trimmed,
              userId: user?._id || "guest",
              businessId,
              locationId,
            }
      );

      const aiTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        {
          message: response.response,
          isUser: false,
          timestamp: aiTime,
        },
      ]);
    } catch (error) {
      const errTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        {
          message: isBg
            ? "⚠️ Има проблем със свързването. Моля, опитайте по-късно."
            : "⚠️ Connection error. Please try again later.",
          isUser: false,
          timestamp: errTime,
        },
      ]);
      console.error("Chatbot API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* CSS animations */}
      <style jsx global>{`
        @keyframes chatbotBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes chatbotSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-chatbotSlideIn {
          animation: chatbotSlideIn 0.25s ease-out;
        }
        @keyframes chatbotPulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--primary) 40%, transparent); }
          50% { box-shadow: 0 0 0 10px transparent; }
        }
        .chatbot-glow {
          animation: chatbotPulseGlow 2.5s ease-in-out infinite;
        }
        @keyframes chatbotOpen {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .chatbot-window-enter {
          animation: chatbotOpen 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>

      <div className="fixed bottom-5 right-5 z-50">
        {isOpen ? (
          <div className="chatbot-window-enter w-[380px] h-[540px] rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/50 flex flex-col overflow-hidden border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm bg-white/95 dark:bg-slate-900/95">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/5 rounded-full" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full" />

              <div className="relative w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <AiRobotIcon size={24} />
              </div>
              <div className="flex-1 relative">
                <h3 className="font-bold text-sm tracking-tight">{isHelpMode ? (isBg ? "💡 AI Помощник" : "💡 AI Helper") : `AI ${isBg ? "Асистент" : "Assistant"}`}</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                  <span className="text-xs text-primary-foreground/80">Online</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="relative w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 px-4 py-3 overflow-y-auto scroll-smooth relative"
              style={{ scrollbarWidth: "thin" }}
            >
              {messages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  message={msg.message}
                  isUser={msg.isUser}
                  timestamp={msg.timestamp}
                />
              ))}
              {loading && <TypingIndicator />}
              <div ref={chatEndRef} />

              {/* Scroll to bottom button */}
              {showScrollBtn && (
                <button
                  onClick={scrollToBottom}
                  className="sticky bottom-2 left-1/2 -translate-x-1/2 z-10 w-8 h-8 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-all"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Recording indicator */}
            {listening && (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800/30">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-medium text-red-600 dark:text-red-400">
                  {isBg ? "Записване..." : "Recording..."}
                </span>
              </div>
            )}

            {/* Input area */}
            <div className="p-3 border-t border-slate-200/80 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    isBg
                      ? "Напишете съобщение..."
                      : "Type a message..."
                  }
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-600 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 min-h-[40px] max-h-28 transition-all"
                  style={{ lineHeight: "1.4" }}
                />

                {/* Mic button */}
                <button
                  type="button"
                  className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
                    listening
                      ? "bg-red-100 dark:bg-red-900/30 text-red-500 shadow-sm"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                  onClick={toggleMic}
                  disabled={loading}
                  aria-label={listening ? "Stop" : "Voice"}
                >
                  {listening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>

                {/* Send button */}
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !input.trim()}
                  className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:opacity-90 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200"
                  aria-label="Send"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2 select-none">
                {isHelpMode
                  ? (isBg ? "💡 Помощник за AppointDI • БГ & EN" : "💡 AppointDI Helper • BG & EN")
                  : `AI ${isBg ? "асистент" : "assistant"} • ${isBg ? "Поддържа БГ и EN" : "Supports BG & EN"}`}
              </p>
            </div>
          </div>
        ) : (
          /* ─── Floating AI Robot Button ───────────────────────────── */
          <button
            onClick={() => setIsOpen(true)}
            className="chatbot-glow group relative w-14 h-14 rounded-2xl bg-primary shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center border border-primary-foreground/10"
            aria-label="Open AI Chat"
          >
            <AiRobotIcon size={30} />
            {/* Online indicator */}
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 shadow-sm" />
          </button>
        )}
      </div>
    </>
  );
}
