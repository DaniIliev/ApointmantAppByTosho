"use client";

import { useTranslation } from "react-i18next";
import { Mic, Send } from "lucide-react";

const AiRobotIcon = ({ className = "", size = 28 }: { className?: string; size?: number }) => (
  <svg
    viewBox="0 0 64 64"
    width={size}
    height={size}
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="32" cy="6" r="3.5" fill="#60a5fa" />
    <rect x="30.5" y="9" width="3" height="7" rx="1.5" fill="#93c5fd" />
    <rect x="12" y="16" width="40" height="28" rx="10" fill="url(#headGrad)" stroke="#60a5fa" strokeWidth="1.5" />
    <ellipse cx="23" cy="30" rx="5" ry="5.5" fill="#1e293b" />
    <ellipse cx="41" cy="30" rx="5" ry="5.5" fill="#1e293b" />
    <circle cx="24.2" cy="28.5" r="2" fill="#60a5fa" />
    <circle cx="42.2" cy="28.5" r="2" fill="#60a5fa" />
    <circle cx="25" cy="29.5" r="0.8" fill="#fff" />
    <circle cx="43" cy="29.5" r="0.8" fill="#fff" />
    <path d="M24 37 C28 41, 36 41, 40 37" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" fill="none" />
    <rect x="6" y="25" width="6" height="12" rx="3" fill="#3b82f6" opacity="0.7" />
    <rect x="52" y="25" width="6" height="12" rx="3" fill="#3b82f6" opacity="0.7" />
    <rect x="18" y="44" width="28" height="14" rx="6" fill="url(#bodyGrad)" stroke="#60a5fa" strokeWidth="1.5" />
    <circle cx="32" cy="51" r="3" fill="#60a5fa" opacity="0.6" />
    <circle cx="32" cy="51" r="1.5" fill="#fff" opacity="0.8" />
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

const ChatMessage = ({ message, isUser, timestamp }: { message: React.ReactNode; isUser: boolean; timestamp?: string }) => (
  <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} mb-3`}>
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

export function AiAssistantPreview() {
  const { t, i18n } = useTranslation();
  const isBg = i18n.language?.startsWith("bg");

  return (
    <div className="w-[380px] h-[540px] max-w-full mx-auto rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/50 flex flex-col overflow-hidden border border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 text-left relative transform hover:scale-[1.02] transition-transform duration-500">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/5 rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full" />
        <div className="relative w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
          <AiRobotIcon size={24} />
        </div>
        <div className="flex-1 relative">
          <h3 className="font-bold text-sm tracking-tight">AI {t("Assistant")}</h3>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <span className="text-xs text-primary-foreground/80">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-3 overflow-y-auto scrollbar-hide relative flex flex-col gap-1">
        <ChatMessage
          message={t("Hello! 👋 I'm your AI assistant. I can help you with services info, working hours, availability and booking appointments. How can I help you?")}
          isUser={false}
          timestamp="10:00"
        />
        <ChatMessage
          message={t("Hi, I want to book an appointment for tomorrow afternoon.")}
          isUser={true}
          timestamp="10:02"
        />
        <ChatMessage
          message={
            <>
              {t("Great! We have the following services available:")}
              <ul className="list-disc pl-4 mt-2">
                <li>{t('Haircut (30 min, 20 €)')}</li>
                <li>{t('Beard Trim (15 min, 10 €)')}</li>
              </ul>
              <br />
              {t("Which one would you like to book?")}
            </>
          }
          isUser={false}
          timestamp="10:02"
        />
        <ChatMessage
          message={t("Haircut please. What times do you have?")}
          isUser={true}
          timestamp="10:04"
        />
        <ChatMessage
          message={t("Tomorrow afternoon we have openings with George at 14:00, 15:30, and 17:00. Which time works best for you?")}
          isUser={false}
          timestamp="10:04"
        />
        <ChatMessage
          message={t("15:30 is perfect!")}
          isUser={true}
          timestamp="10:05"
        />
        <ChatMessage
          message={
            <>
              ✅ {t("Appointment successfully booked!")}<br />
              📋 {t("Haircut")}<br />
              👤 {t("George")}<br />
              📅 {t("Tomorrow at 15:30")}<br />
              ⏱️ 30 min | 💰 20 €
            </>
          }
          isUser={false}
          timestamp="10:05"
        />
      </div>

      {/* Input area mock */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50 pointer-events-none">
        <div className="flex items-end gap-2">
          <div className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-400">
            {t("Type a message...")}
          </div>
          <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500">
            <Mic className="w-5 h-5" />
          </div>
          <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground opacity-60">
            <Send className="w-5 h-5" />
          </div>
        </div>
        <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2 select-none">
          AI {t("assistant")} • {isBg ? "Поддържа БГ и EN" : "Supports BG & EN"}
        </p>
      </div>
    </div>
  );
}
