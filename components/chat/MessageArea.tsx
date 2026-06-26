"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Settings,
  Users,
  Hash,
  Shield,
  Building2,
  MapPin,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { ChatChannel, ChatMessage, ChannelType } from "@/Global/Types/types";
import { useAuthContext } from "@/context/AuthContext";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import * as chatService from "@/app/Api/services/chatService";

interface MessageAreaProps {
  channel: ChatChannel;
  messages: ChatMessage[];
  isLoading: boolean;
  hasMore: boolean;
  typingUsers: Record<string, { userId: string; userName: string }>;
  onLoadMore: () => void;
  onSend: (data: {
    text?: string;
    type?: string;
    attachments?: Array<{
      url: string;
      type: string;
      name?: string;
      size?: number;
      duration?: number;
      mimeType?: string;
    }>;
    replyTo?: string;
  }) => Promise<void>;
  onTyping: () => void;
  onStopTyping: () => void;
  onOpenSettings: () => void;
}

const channelTypeIcon: Record<ChannelType, React.ElementType> = {
  admin_support: Shield,
  location: MapPin,
  business: Building2,
  direct: MessageCircle,
  group: Users,
  client_location: Hash,
};

export default function MessageArea({
  channel,
  messages,
  isLoading,
  hasMore,
  typingUsers,
  onLoadMore,
  onSend,
  onTyping,
  onStopTyping,
  onOpenSettings,
}: MessageAreaProps) {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editMsg, setEditMsg] = useState<ChatMessage | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, shouldAutoScroll]);

  // Detect if user scrolled up
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isAtBottom);

    // Load more when scrolled to top
    if (scrollTop < 100 && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore]);

  // Get channel display name
  const getDisplayName = () => {
    if (channel.type === "direct") {
      const other = channel.members.find((m) => m.user._id !== user?._id);
      return other
        ? `${other.user.firstName} ${other.user.lastName}`
        : "Direct Message";
    }
    return channel.name || "Channel";
  };

  const handleReply = (msg: ChatMessage) => {
    setReplyTo(msg);
    setEditMsg(null);
  };

  const handleEdit = (msg: ChatMessage) => {
    setEditMsg(msg);
    setReplyTo(null);
  };

  const handleDelete = async (msgId: string) => {
    try {
      await chatService.deleteMessage(msgId);
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  const handleEditSubmit = async (msgId: string, text: string) => {
    try {
      await chatService.editMessage(msgId, text);
    } catch (err) {
      console.error("Error editing message:", err);
    }
  };

  const TypeIcon = channelTypeIcon[channel.type] || MessageCircle;
  const typingList = Object.values(typingUsers).filter(
    (tu) => tu.userId !== user?._id
  );

  // Check if current user is blocked
  const currentMember = channel.members.find(
    (m) => m.user._id === user?._id
  );
  const isBlocked = currentMember?.isBlocked || false;

  // Get other member for direct channels
  const otherMember =
    channel.type === "direct"
      ? channel.members.find((m) => m.user._id !== user?._id)
      : null;

  return (
    <div className="flex flex-col h-full bg-primary-foreground/50">
      {/* Channel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-primary-foreground">
        <div className="flex items-center gap-3 min-w-0">
          {/* Channel avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center overflow-hidden flex-shrink-0">
            {otherMember?.user.profilePictureUrl ? (
              <img
                src={otherMember.user.profilePictureUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : channel.avatar ? (
              <img
                src={channel.avatar}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <TypeIcon className="w-5 h-5 text-primary" />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-text-primary truncate">
              {getDisplayName()}
            </h3>
            <p className="text-[11px] text-text-secondary">
              {channel.members.length} {t("members")}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title={t("Channel Settings")}
        >
          <Settings className="w-5 h-5 text-text-secondary" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        {/* Load more indicator */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
              <TypeIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              {t("No messages yet")}
            </h3>
            <p className="text-sm text-text-secondary">
              {t("Start the conversation by sending a message!")}
            </p>
          </div>
        )}

        {/* Messages list */}
        {messages.map((msg, idx) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            previousMessage={idx > 0 ? messages[idx - 1] : undefined}
            onReply={handleReply}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}

        {/* Typing indicator */}
        {typingList.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex gap-1">
              <div
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
            <span className="text-xs text-text-secondary">
              {typingList.length === 1
                ? `${typingList[0].userName} ${t("is typing")}...`
                : `${typingList.length} ${t("people are typing")}...`}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={onSend}
        onTyping={onTyping}
        onStopTyping={onStopTyping}
        replyTo={replyTo}
        editMessage={editMsg}
        onCancelReply={() => setReplyTo(null)}
        onCancelEdit={() => setEditMsg(null)}
        onEditSubmit={handleEditSubmit}
        isBlocked={isBlocked}
      />
    </div>
  );
}
