"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { ChatChannel, ChatMessage } from "@/Global/Types/types";
import { useChat } from "@/hooks/useChat";
import ChannelSidebar from "./ChannelSidebar";
import MessageArea from "./MessageArea";
import NewChatModal from "./NewChatModal";
import ChannelSettings from "./ChannelSettings";

export default function ChatLayout() {
  const { t } = useTranslation();
  const {
    channels,
    activeChannel,
    messages,
    unreadCounts,
    typingUsers,
    isLoadingChannels,
    isLoadingMessages,
    hasMoreMessages,
    fetchChannels,
    selectChannel,
    loadMoreMessages,
    sendMessage,
    emitTyping,
    emitStopTyping,
  } = useChat();

  const [showNewChat, setShowNewChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);

  const handleSelectChannel = (channel: ChatChannel) => {
    selectChannel(channel);
    setShowMobileSidebar(false); // Hide sidebar on mobile
  };

  const handleChannelCreated = () => {
    fetchChannels();
    setShowNewChat(false);
  };

  return (
    <div className="flex h-full rounded-2xl border border-gray-200 dark:border-white/10 bg-primary-foreground shadow-lg overflow-hidden">
      {/* Sidebar — Always visible on desktop, toggleable on mobile */}
      <div
        className={`${
          showMobileSidebar ? "flex" : "hidden"
        } md:flex flex-col w-full md:w-80 lg:w-[320px] flex-shrink-0 border-r border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/20`}
      >
        <ChannelSidebar
          channels={channels}
          activeChannel={activeChannel}
          unreadCounts={unreadCounts.channels}
          onSelectChannel={handleSelectChannel}
          onNewChat={() => setShowNewChat(true)}
          isLoading={isLoadingChannels}
        />
      </div>

      {/* Message Area */}
      <div
        className={`${
          showMobileSidebar ? "hidden" : "flex"
        } md:flex flex-1 flex-col min-w-0`}
      >
        {activeChannel ? (
          <>
            {/* Mobile back button */}
            <div className="md:hidden flex items-center px-2 pt-2">
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-text-primary" />
              </button>
            </div>

            <MessageArea
              channel={activeChannel}
              messages={messages}
              isLoading={isLoadingMessages}
              hasMore={hasMoreMessages}
              typingUsers={typingUsers}
              onLoadMore={loadMoreMessages}
              onSend={sendMessage}
              onTyping={emitTyping}
              onStopTyping={emitStopTyping}
              onOpenSettings={() => setShowSettings(true)}
            />
          </>
        ) : (
          /* Empty state — no channel selected */
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-5">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {t("Welcome to Messages")}
            </h3>
            <p className="text-sm text-text-secondary max-w-sm">
              {t(
                "Select a conversation from the sidebar or start a new one to begin chatting"
              )}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewChatModal
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        onChannelCreated={handleChannelCreated}
      />

      {activeChannel && showSettings && (
        <ChannelSettings
          channel={activeChannel}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onUpdate={() => {
            fetchChannels();
            setShowSettings(false);
          }}
        />
      )}
    </div>
  );
}
