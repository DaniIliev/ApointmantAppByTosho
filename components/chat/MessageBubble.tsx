"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChatMessage } from "@/Global/Types/types";
import { useAuthContext } from "@/context/AuthContext";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import {
  MoreVertical,
  Reply,
  Pencil,
  Trash2,
  Download,
  Play,
  Pause,
  SmilePlus,
} from "lucide-react";
import { useTheme } from "next-themes";
import * as chatService from "@/app/Api/services/chatService";
import useClickOutside from "@/Global/Hooks/useClickOutside";

import dynamic from "next/dynamic";
const EmojiPickerComponent = dynamic(
  () =>
    import("@emoji-mart/react").then((mod) => {
      return { default: mod.default };
    }),
  { ssr: false }
);

interface MessageBubbleProps {
  message: ChatMessage;
  previousMessage?: ChatMessage;
  onReply: (message: ChatMessage) => void;
  onEdit: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
}

function formatMessageTime(dateStr: string) {
  return format(new Date(dateStr), "HH:mm");
}

function formatDateSeparator(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMMM d, yyyy");
}

function shouldShowDateSeparator(
  current: ChatMessage,
  previous?: ChatMessage
): boolean {
  if (!previous) return true;
  return !isSameDay(new Date(current.createdAt), new Date(previous.createdAt));
}

// Simple voice player component inline
function VoicePlayerInline({
  url,
  duration,
}: {
  url: string;
  duration?: number;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const pct =
      (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(pct);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="flex items-center gap-2 min-w-[180px]">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
      <button
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 hover:bg-primary-dark transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5 text-white" />
        ) : (
          <Play className="w-3.5 h-3.5 text-white ml-0.5" />
        )}
      </button>
      <div className="flex-1">
        <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        {duration && (
          <span className="text-[10px] text-text-secondary mt-0.5 block">
            {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, "0")}
          </span>
        )}
      </div>
    </div>
  );
}

export default function MessageBubble({
  message,
  previousMessage,
  onReply,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const { theme } = useTheme();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiData, setEmojiData] = useState<any>(null);
  
  const emojiRef = useRef<HTMLDivElement>(null);
  useClickOutside(emojiRef, () => setShowEmojiPicker(false));

  const isOwn = message.sender._id === user?._id;
  const showDate = shouldShowDateSeparator(message, previousMessage);

  // Consecutive messages from same sender (group)
  const isConsecutive =
    previousMessage &&
    !showDate &&
    previousMessage.sender._id === message.sender._id &&
    new Date(message.createdAt).getTime() -
      new Date(previousMessage.createdAt).getTime() <
      300000; // 5 min

  if (message.isDeleted) {
    return (
      <>
        {showDate && (
          <div className="flex justify-center my-4">
            <span className="px-3 py-1 rounded-full bg-white/5 text-[11px] text-text-secondary">
              {formatDateSeparator(message.createdAt)}
            </span>
          </div>
        )}
        <div
          className={`flex ${isOwn ? "justify-end" : "justify-start"} px-4 py-0.5`}
        >
          <div className="px-3 py-2 rounded-xl bg-white/5 text-xs text-text-secondary italic">
            {t("Message deleted")}
          </div>
        </div>
      </>
    );
  }

  if (message.type === "system") {
    return (
      <>
        {showDate && (
          <div className="flex justify-center my-4">
            <span className="px-3 py-1 rounded-full bg-white/5 text-[11px] text-text-secondary">
              {formatDateSeparator(message.createdAt)}
            </span>
          </div>
        )}
        <div className="flex justify-center my-2 px-4">
          <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-text-secondary text-center">
            {message.text}
          </span>
        </div>
      </>
    );
  }

  return (
    <>
      {showDate && (
        <div className="flex justify-center my-4">
          <span className="px-3 py-1 rounded-full bg-white/5 text-[11px] text-text-secondary">
            {formatDateSeparator(message.createdAt)}
          </span>
        </div>
      )}

      <div
        className={`group flex ${isOwn ? "justify-end" : "justify-start"} px-4 ${isConsecutive ? "py-0.5" : "pt-2 pb-0.5"}`}
      >
        <div className={`flex gap-2 max-w-[75%] ${isOwn ? "flex-row-reverse" : ""}`}>
          {/* Avatar (only for first message in group) */}
          {!isOwn && !isConsecutive && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center overflow-hidden mt-auto">
              {message.sender.profilePictureUrl ? (
                <img
                  src={message.sender.profilePictureUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-primary">
                  {message.sender.firstName?.[0]}
                  {message.sender.lastName?.[0]}
                </span>
              )}
            </div>
          )}
          {!isOwn && isConsecutive && <div className="w-8 flex-shrink-0" />}

          {/* Message content */}
          <div className="flex flex-col">
            {/* Sender name */}
            {!isOwn && !isConsecutive && (
              <span className="text-xs font-semibold text-primary mb-1 ml-1">
                {message.sender.firstName} {message.sender.lastName}
              </span>
            )}

            {/* Reply preview */}
            {message.replyTo && (
              <div className="px-3 py-1.5 mb-1 rounded-lg bg-white/5 border-l-2 border-primary text-xs">
                <span className="font-semibold text-primary">
                  {message.replyTo.sender?.firstName}
                </span>
                <p className="text-text-secondary truncate">
                  {message.replyTo.text || "Attachment"}
                </p>
              </div>
            )}

            <div
              className={`relative rounded-2xl px-3.5 py-2 ${
                isOwn
                  ? "bg-primary text-white rounded-br-md"
                  : "bg-gray-100 dark:bg-white/10 text-text-primary rounded-bl-md"
              }`}
            >
              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mb-1.5 space-y-2">
                  {message.attachments.map((att, idx) => {
                    if (att.type === "image") {
                      return (
                        <img
                          key={idx}
                          src={att.url}
                          alt={att.name || "Image"}
                          className="max-w-[280px] max-h-[200px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-cover"
                          onClick={() => setImagePreview(att.url)}
                        />
                      );
                    }
                    if (att.type === "voice") {
                      return (
                        <VoicePlayerInline
                          key={idx}
                          url={att.url}
                          duration={att.duration}
                        />
                      );
                    }
                    // File
                    return (
                      <a
                        key={idx}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isOwn ? "bg-white/20 hover:bg-white/30" : "bg-white/5 hover:bg-white/10"} transition-colors`}
                      >
                        <Download className="w-4 h-4 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm truncate">{att.name || "File"}</p>
                          {att.size && (
                            <p className="text-[10px] opacity-70">
                              {(att.size / 1024).toFixed(1)} KB
                            </p>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Text */}
              {message.text && (
                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                  {message.text}
                </p>
              )}

              {/* Time + edited */}
              <div
                className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}
              >
                {message.isEdited && (
                  <span className="text-[10px] opacity-50 italic">
                    {t("edited")}
                  </span>
                )}
                <span className="text-[10px] opacity-50">
                  {formatMessageTime(message.createdAt)}
                </span>
              </div>

              {/* Reactions */}
              {message.reactions && message.reactions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(
                    message.reactions.reduce(
                      (acc, r) => {
                        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                        return acc;
                      },
                      {} as Record<string, number>
                    )
                  ).map(([emoji, count]) => {
                    const hasReacted = message.reactions?.some(
                      (r) => r.emoji === emoji && r.user === user?._id
                    );
                    return (
                      <button
                        key={emoji}
                        onClick={() => chatService.toggleReaction(message._id, emoji)}
                        className={`px-1.5 py-0.5 rounded-full text-xs hover:bg-white/20 transition-colors ${
                          hasReacted ? "bg-primary/50 text-white" : "bg-white/10"
                        }`}
                      >
                        {emoji} {count > 1 && count}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div
            className={`flex items-center gap-0.5 self-center transition-opacity opacity-70 hover:opacity-100 ${isOwn ? "flex-row-reverse" : ""} relative`}
          >
            <div ref={emojiRef} className="relative">
              <button
                onClick={() => {
                  if (!emojiData) {
                    import("@emoji-mart/data").then((mod) => setEmojiData(mod.default));
                  }
                  setShowEmojiPicker(!showEmojiPicker);
                }}
                className="p-1 rounded hover:bg-white/10 transition-colors"
                title={t("React")}
              >
                <SmilePlus className="w-3.5 h-3.5 text-text-secondary" />
              </button>
              {showEmojiPicker && emojiData && (
                <div 
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 backdrop-blur-[1px]"
                  onClick={() => setShowEmojiPicker(false)}
                >
                  <div 
                    className="shadow-2xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <EmojiPickerComponent
                      data={emojiData}
                      onEmojiSelect={(emoji: any) => {
                        chatService.toggleReaction(message._id, emoji.native);
                        setShowEmojiPicker(false);
                      }}
                      theme={theme === "dark" ? "dark" : "light"}
                      previewPosition="none"
                      skinTonePosition="search"
                      maxFrequentRows={1}
                    />
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => onReply(message)}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title={t("Reply")}
            >
              <Reply className="w-3.5 h-3.5 text-text-secondary" />
            </button>
            {isOwn && (
              <>
                <button
                  onClick={() => onEdit(message)}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                  title={t("Edit")}
                >
                  <Pencil className="w-3.5 h-3.5 text-text-secondary" />
                </button>
                <button
                  onClick={() => onDelete(message._id)}
                  className="p-1 rounded hover:bg-red-500/20 transition-colors group/delete"
                  title={t("Delete")}
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500 group-hover/delete:text-red-400" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {imagePreview && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center"
          onClick={() => setImagePreview(null)}
        >
          <img
            src={imagePreview}
            alt="Preview"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
}
