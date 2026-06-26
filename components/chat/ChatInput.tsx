"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Send,
  Smile,
  Plus,
  X,
  Mic,
  Paperclip,
  Image as ImageIcon,
  Camera,
  Square,
  StopCircle,
} from "lucide-react";
import { ChatMessage, ChatAttachment } from "@/Global/Types/types";
import * as chatService from "@/app/Api/services/chatService";
import useClickOutside from "@/Global/Hooks/useClickOutside";

// Dynamic import for emoji picker to avoid SSR issues
import dynamic from "next/dynamic";
const EmojiPickerComponent = dynamic(
  () =>
    import("@emoji-mart/react").then((mod) => {
      return { default: mod.default };
    }),
  { ssr: false }
);

interface ChatInputProps {
  onSend: (data: {
    text?: string;
    type?: string;
    attachments?: ChatAttachment[];
    replyTo?: string;
  }) => Promise<void>;
  onTyping: () => void;
  onStopTyping: () => void;
  replyTo: ChatMessage | null;
  editMessage: ChatMessage | null;
  onCancelReply: () => void;
  onCancelEdit: () => void;
  onEditSubmit: (msgId: string, text: string) => Promise<void>;
  isBlocked?: boolean;
}

export default function ChatInput({
  onSend,
  onTyping,
  onStopTyping,
  replyTo,
  editMessage,
  onCancelReply,
  onCancelEdit,
  onEditSubmit,
  isBlocked,
}: ChatInputProps) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [audioPreviewFile, setAudioPreviewFile] = useState<File | null>(null);
  const [audioPreviewDuration, setAudioPreviewDuration] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [emojiData, setEmojiData] = useState<any>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const attachRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useClickOutside(emojiRef, () => setShowEmoji(false));
  useClickOutside(attachRef, () => setShowAttachMenu(false));

  // Load emoji data lazily
  useEffect(() => {
    if (showEmoji && !emojiData) {
      import("@emoji-mart/data").then((mod) => {
        setEmojiData(mod.default);
      });
    }
  }, [showEmoji, emojiData]);

  // Pre-fill when editing
  useEffect(() => {
    if (editMessage) {
      setText(editMessage.text || "");
      inputRef.current?.focus();
    }
  }, [editMessage]);

  const handleSubmit = async () => {
    if (isSending) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      setIsSending(true);

      if (editMessage) {
        await onEditSubmit(editMessage._id, trimmed);
        onCancelEdit();
      } else {
        await onSend({
          text: trimmed,
          type: "text",
          replyTo: replyTo?._id,
        });
        onCancelReply();
      }

      setText("");
      onStopTyping();
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTyping();

    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
    setText((prev) => prev + emoji.native);
    inputRef.current?.focus();
  };

  // File upload helper
  const uploadAndSend = async (file: File, type: "image" | "file") => {
    try {
      setIsSending(true);
      const result = await chatService.uploadChatFile(file);
      if (result) {
        await onSend({
          type,
          attachments: [
            {
              url: result.url,
              type,
              name: result.name || file.name,
              size: result.size || file.size,
              mimeType: result.mimeType || file.type,
            },
          ],
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsSending(false);
      setShowAttachMenu(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAndSend(file, "file");
    }
    e.target.value = "";
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAndSend(file, "image");
    }
    e.target.value = "";
  };

  // Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordingChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordingChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(recordingChunksRef.current, {
          type: "audio/webm",
        });
        const file = new File([blob], `voice-${Date.now()}.webm`, {
          type: "audio/webm",
        });

        const url = URL.createObjectURL(blob);
        setAudioPreviewUrl(url);
        setAudioPreviewFile(file);
        setAudioPreviewDuration(recordingDuration);
        setIsRecording(false);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingDuration(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

  const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
    setRecordingDuration(0);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  const clearAudioPreview = () => {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioPreviewUrl(null);
    setAudioPreviewFile(null);
    setAudioPreviewDuration(0);
  };

  const sendVoiceMessage = async () => {
    if (!audioPreviewFile) return;
    try {
      setIsSending(true);
      const result = await chatService.uploadChatFile(audioPreviewFile);
      if (result) {
        await onSend({
          type: "voice",
          attachments: [
            {
              url: result.url,
              type: "voice",
              name: audioPreviewFile.name,
              size: result.size || audioPreviewFile.size,
              duration: audioPreviewDuration,
              mimeType: "audio/webm",
            },
          ],
        });
      }
      clearAudioPreview();
    } catch (err) {
      console.error("Voice upload error:", err);
    } finally {
      setIsSending(false);
    }
  };

  if (isBlocked) {
    return (
      <div className="px-4 py-4 border-t border-white/10 bg-primary-foreground">
        <div className="text-center text-sm text-text-secondary py-2">
          {t("You are blocked from sending messages in this channel")}
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 dark:border-white/10 bg-primary-foreground">
      {/* Reply/Edit Preview */}
      {(replyTo || editMessage) && (
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/10">
          <div className="w-0.5 h-8 bg-primary rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary">
              {editMessage
                ? t("Editing message")
                : `${t("Reply to")} ${replyTo?.sender.firstName}`}
            </p>
            <p className="text-xs text-text-secondary truncate">
              {(editMessage || replyTo)?.text || t("Attachment")}
            </p>
          </div>
          <button
            onClick={editMessage ? onCancelEdit : onCancelReply}
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      )}

      {/* Recording State */}
      {isRecording ? (
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-text-primary font-medium">
              {Math.floor(recordingDuration / 60)}:
              {String(recordingDuration % 60).padStart(2, "0")}
            </span>
            <div className="flex-1 flex items-center gap-0.5">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 20 + 4}px`,
                    animationDelay: `${i * 50}ms`,
                  }}
                />
              ))}
            </div>
          </div>
          <button
            onClick={cancelRecording}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-red-400" />
          </button>
          <button
            onClick={stopRecording}
            className="p-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors"
          >
            <StopCircle className="w-5 h-5 text-white" />
          </button>
        </div>
      ) : audioPreviewUrl ? (
        <div className="flex items-center gap-3 px-4 py-3">
          <audio src={audioPreviewUrl} controls className="flex-1 h-10" />
          <button
            onClick={clearAudioPreview}
            disabled={isSending}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-red-400" />
          </button>
          <button
            onClick={sendVoiceMessage}
            disabled={isSending}
            className="p-2 rounded-lg bg-primary hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      ) : (
        <div className="flex items-end gap-2 px-4 py-3">
          {/* Attachment button */}
          <div className="relative mb-[3px]" ref={attachRef}>
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <Plus className="w-6 h-6 text-primary" />
            </button>

            {showAttachMenu && (
              <div className="absolute bottom-12 left-0 w-48 bg-primary-foreground border border-white/15 rounded-xl shadow-2xl overflow-hidden z-50">
                <button
                  onClick={startRecording}
                  className="flex items-center w-full px-4 py-3 text-sm text-text-primary hover:bg-white/10 transition-colors"
                >
                  <Mic className="w-4 h-4 mr-3 text-text-secondary" />
                  {t("Record voice clip")}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center w-full px-4 py-3 text-sm text-text-primary hover:bg-white/10 transition-colors"
                >
                  <Paperclip className="w-4 h-4 mr-3 text-text-secondary" />
                  {t("Attach file")}
                </button>
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center w-full px-4 py-3 text-sm text-text-primary hover:bg-white/10 transition-colors"
                >
                  <ImageIcon className="w-4 h-4 mr-3 text-text-secondary" />
                  {t("Attach image")}
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={text}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={t("Write a new message...")}
              rows={1}
              className="w-full px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-text-primary placeholder:text-text-secondary text-sm resize-none focus:outline-none focus:border-primary transition-colors max-h-[120px]"
              style={{ minHeight: "40px", marginBottom: "-5px" }}
            />
          </div>

          {/* Emoji button */}
          <div className="relative mb-[3px]" ref={emojiRef}>
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <Smile className="w-6 h-6 text-primary" />
            </button>

            {showEmoji && emojiData && (
              <div className="absolute bottom-12 right-0 z-50">
                <EmojiPickerComponent
                  data={emojiData}
                  onEmojiSelect={handleEmojiSelect}
                  theme="dark"
                  previewPosition="none"
                  skinTonePosition="search"
                  maxFrequentRows={2}
                />
              </div>
            )}
          </div>

          {/* Send button */}
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || isSending}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary hover:bg-primary-dark transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed mb-[3px]"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
