"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Plus,
  Hash,
  Shield,
  Building2,
  MapPin,
  Users,
  MessageCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { ChatChannel, ChannelType } from "@/Global/Types/types";
import { useAuthContext } from "@/context/AuthContext";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";

interface ChannelSidebarProps {
  channels: ChatChannel[];
  activeChannel: ChatChannel | null;
  unreadCounts: Record<string, number>;
  onSelectChannel: (channel: ChatChannel) => void;
  onNewChat: () => void;
  isLoading: boolean;
}

const channelTypeIcon: Record<ChannelType, React.ElementType> = {
  admin_support: Shield,
  location: MapPin,
  business: Building2,
  direct: MessageCircle,
  group: Users,
  client_location: Hash,
};

const channelTypeLabel: Record<ChannelType, string> = {
  admin_support: "Support",
  business: "Business",
  location: "Locations",
  client_location: "Client Channels",
  direct: "Direct Messages",
  group: "Groups",
};

function getChannelDisplayName(
  channel: ChatChannel,
  currentUserId?: string
): string {
  if (channel.type === "direct") {
    const other = channel.members.find(
      (m) => m.user._id !== currentUserId
    );
    if (other) {
      return `${other.user.firstName} ${other.user.lastName}`;
    }
    return "Direct Message";
  }
  return channel.name || "Unnamed Channel";
}

function getChannelAvatar(
  channel: ChatChannel,
  currentUserId?: string
): string | null {
  if (channel.avatar) return channel.avatar;
  if (channel.type === "direct") {
    const other = channel.members.find(
      (m) => m.user._id !== currentUserId
    );
    return other?.user.profilePictureUrl || null;
  }
  return null;
}

function formatLastMessageTime(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffH < 24) return `${diffH}h`;
  if (diffD < 7) return `${diffD}d`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ChannelSidebar({
  channels,
  activeChannel,
  unreadCounts,
  onSelectChannel,
  onNewChat,
  isLoading,
}: ChannelSidebarProps) {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const [search, setSearch] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});

  // Group channels by type
  const groupOrder: ChannelType[] = [
    "admin_support",
    "business",
    "location",
    "client_location",
    "direct",
    "group",
  ];

  const filtered = channels.filter((ch) => {
    if (!search) return true;
    const name = getChannelDisplayName(ch, user?._id);
    return name.toLowerCase().includes(search.toLowerCase());
  });

  let grouped: Record<string, ChatChannel[]> = {};

  if (user?.role === "admin") {
    filtered.forEach((ch) => {
      const businessName = ch.businessId?.businessName || "Platform";
      if (!grouped[businessName]) grouped[businessName] = [];
      grouped[businessName].push(ch);
    });
  } else {
    grouped = groupOrder.reduce(
      (acc, type) => {
        const items = filtered.filter((ch) => ch.type === type);
        if (items.length > 0) acc[type] = items;
        return acc;
      },
      {} as Record<string, ChatChannel[]>
    );
  }

  const toggleGroup = (type: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="flex flex-col h-full bg-primary-foreground border-r border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-text-primary">
            {t("Messages")}
          </h2>
          <button
            onClick={onNewChat}
            className="p-2 rounded-lg bg-primary hover:bg-primary-dark transition-colors duration-200"
            title={t("New Chat")}
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <LabeledInput
            id="search-conversations"
            label={t("Search conversations...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            icon={<Search className="w-4 h-4 text-text-secondary" />}
          />
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="flex flex-col gap-3 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-14 rounded-lg bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <MessageCircle className="w-10 h-10 text-text-secondary mb-3 opacity-50" />
            <p className="text-sm text-text-secondary">
              {search ? t("No conversations found") : t("No messages yet")}
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([type, items]) => {
            const TypeIcon =
              user?.role === "admin"
                ? Building2
                : channelTypeIcon[type as ChannelType] || MessageCircle;
            const isCollapsed = collapsedGroups[type];

            return (
              <div key={type} className="mb-1">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(type)}
                  className="flex items-center w-full px-4 py-1.5 text-xs font-semibold text-text-secondary uppercase tracking-wider hover:text-text-primary transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3 mr-1" />
                  ) : (
                    <ChevronDown className="w-3 h-3 mr-1" />
                  )}
                  <TypeIcon className="w-3 h-3 mr-1.5" />
                  {t(channelTypeLabel[type as ChannelType] || type)}
                  {(() => {
                    const groupUnread = items.reduce(
                      (sum, ch) => sum + (unreadCounts[ch._id] || 0),
                      0
                    );
                    return groupUnread > 0 ? (
                      <span className="ml-auto flex-shrink-0 min-w-[18px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {groupUnread > 99 ? "99+" : groupUnread}
                      </span>
                    ) : null;
                  })()}
                </button>

                {/* Channel Items */}
                {!isCollapsed &&
                  items.map((channel) => {
                    const name = getChannelDisplayName(channel, user?._id);
                    const avatar = getChannelAvatar(channel, user?._id);
                    const unread = unreadCounts[channel._id] || 0;
                    const isActive = activeChannel?._id === channel._id;

                    return (
                      <button
                        key={channel._id}
                        onClick={() => onSelectChannel(channel)}
                        className={`flex items-center w-full px-4 py-2.5 transition-all duration-200 ${
                          isActive
                            ? "bg-primary/20 border-l-2 border-primary"
                            : "hover:bg-white/5 border-l-2 border-transparent"
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center overflow-hidden mr-3">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt={name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <TypeIcon className="w-5 h-5 text-primary" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-sm truncate ${
                                unread > 0
                                  ? "font-semibold text-text-primary"
                                  : "font-medium text-text-primary/80"
                              }`}
                            >
                              {name}
                            </span>
                            <span className="text-[10px] text-text-secondary ml-2 flex-shrink-0">
                              {formatLastMessageTime(
                                channel.lastMessage?.sentAt
                              )}
                            </span>
                          </div>
                          {channel.lastMessage && (
                            <p
                              className={`text-xs truncate mt-0.5 ${
                                unread > 0
                                  ? "text-text-primary/70"
                                  : "text-text-secondary"
                              }`}
                            >
                              {channel.lastMessage.senderName &&
                                `${channel.lastMessage.senderName.split(" ")[0]}: `}
                              {channel.lastMessage.text || "..."}
                            </p>
                          )}
                        </div>

                        {/* Unread Badge */}
                        {unread > 0 && (
                          <span className="ml-2 flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {unread > 99 ? "99+" : unread}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
