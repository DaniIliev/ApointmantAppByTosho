"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle } from "lucide-react";
import { ChatChannel, ChatMessage } from "@/Global/Types/types";
import ChannelSidebar from "../chat/ChannelSidebar";
import MessageArea from "../chat/MessageArea";

export function ChatPreview() {
  const { t } = useTranslation();
  
  // Using undefined for my _id so `message.sender._id === user?._id` evaluates to true (undefined === undefined) 
  // when AuthContext is not present on the landing page.
  const meId = undefined as unknown as string;

const mockChannels: ChatChannel[] = [
  {
    _id: "support-1",
    type: "admin_support",
    name: t("System Support"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    members: [
      { user: { _id: meId, firstName: "Me", lastName: "" }, role: "member", isBlocked: false, isMuted: false },
      { user: { _id: "support-agent", firstName: "Admin", lastName: "Team" }, role: "member", isBlocked: false, isMuted: false }
    ],
    lastMessage: { text: t("Hello, how can I help you?"), senderName: "Admin Team", sentAt: new Date().toISOString() }
  },
  {
    _id: "business-1",
    type: "business",
    name: t("Salon 'Elegance' Team"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    members: [
      { user: { _id: meId, firstName: "Me", lastName: "" }, role: "member", isBlocked: false, isMuted: false },
    ]
  },
  {
    _id: "location-1",
    type: "location",
    name: t("Downtown Salon - Inventory"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    members: [
      { user: { _id: meId, firstName: "Me", lastName: "" }, role: "member", isBlocked: false, isMuted: false },
      { user: { _id: "other-2", firstName: "Maria", lastName: "Cosmetician" }, role: "member", isBlocked: false, isMuted: false }
    ],
    lastMessage: { text: t("We've run out of professional hair dye #6.1."), senderName: "Maria", sentAt: new Date().toISOString() }
  },
  {
    _id: "client-1",
    type: "client_location",
    name: t("Jane Doe (Client)"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    members: [
      { user: { _id: meId, firstName: "Me", lastName: "" }, role: "member", isBlocked: false, isMuted: false },
    ]
  },
  {
    _id: "dm-1",
    type: "direct",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    members: [
      { user: { _id: meId, firstName: "Me", lastName: "" }, role: "member", isBlocked: false, isMuted: false },
      { user: { _id: "other-1", firstName: "John", lastName: "Stylist" }, role: "member", isBlocked: false, isMuted: false }
    ],
    lastMessage: { text: t("I'll be 10 minutes late for my first appointment."), senderName: "John", sentAt: new Date().toISOString() }
  }
];

const mockMessages: Record<string, ChatMessage[]> = {
  "support-1": [
    {
      _id: "msg-2", channel: "support-1", sender: { _id: "support-agent", firstName: "Admin", lastName: "(Support)" },
      type: "text", text: t("Hello, how can I help you?"), createdAt: new Date(Date.now() - 3500000).toISOString()
    }
  ],
  "business-1": [
    {
      _id: "msg-b1", channel: "business-1", sender: { _id: "emp-1", firstName: "John", lastName: "" },
      type: "text", text: t("Team, just a reminder that we have ventilation maintenance tomorrow at 9:00 AM."), createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      _id: "msg-b2", channel: "business-1", sender: { _id: meId, firstName: "Me", lastName: "" },
      type: "text", text: t("Understood, I'll prepare the workspace."), createdAt: new Date(Date.now() - 7100000).toISOString()
    }
  ],
  "location-1": [
    {
      _id: "msg-l1", channel: "location-1", sender: { _id: "other-2", firstName: "Maria", lastName: "" },
      type: "text", text: t("Hi, I've just finished checking the inventory."), createdAt: new Date(Date.now() - 8000000).toISOString()
    },
    {
      _id: "msg-l2", channel: "location-1", sender: { _id: "other-2", firstName: "Maria", lastName: "" },
      type: "text", text: t("We've run out of professional hair dye #6.1. We need to order more."), createdAt: new Date(Date.now() - 7900000).toISOString()
    }
  ],
  "client-1": [
    {
      _id: "msg-c1", channel: "client-1", sender: { _id: "client", firstName: "Jane", lastName: "Doe" },
      type: "text", text: t("Hi! I'd like to book an appointment for a haircut and color this Saturday."), createdAt: new Date(Date.now() - 9000000).toISOString()
    },
    {
      _id: "msg-c2", channel: "client-1", sender: { _id: meId, firstName: "Me", lastName: "" },
      type: "text", text: t("Hi Jane! We have a slot available at 10:30 AM. Would that work for you?"), createdAt: new Date(Date.now() - 8900000).toISOString()
    }
  ],
  "dm-1": [
    {
      _id: "msg-4", channel: "dm-1", sender: { _id: meId, firstName: "Me", lastName: "" },
      type: "text", text: t("John, did you see the application for the new nail technician?"), createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      _id: "msg-5", channel: "dm-1", sender: { _id: "other-1", firstName: "John", lastName: "" },
      type: "text", text: t("I'll be 10 minutes late for my first appointment. Sorry!"), createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ]
};

  const [activeChannel, setActiveChannel] = useState<ChatChannel>(mockChannels[4]);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages["dm-1"]);

  const handleSelectChannel = (channel: ChatChannel) => {
    setActiveChannel(channel);
    setMessages(mockMessages[channel._id] || []);
  };

  return (
    <div className="flex h-[600px] max-w-[1000px] mx-auto rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-primary-foreground shadow-lg text-left relative">
      <div className="hidden md:flex flex-col w-[300px] flex-shrink-0 border-r border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 z-10 relative">
        <ChannelSidebar
          channels={mockChannels}
          activeChannel={activeChannel}
          unreadCounts={{}}
          onSelectChannel={handleSelectChannel}
          onNewChat={() => {}}
          isLoading={false}
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0 bg-background z-10 relative">
        {activeChannel ? (
          <MessageArea
            channel={activeChannel}
            messages={messages}
            isLoading={false}
            hasMore={false}
            typingUsers={{}}
            onLoadMore={() => {}}
            onSend={async () => {}}
            onTyping={() => {}}
            onStopTyping={() => {}}
            onOpenSettings={() => {}}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-5">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {t("Welcome to Messages")}
            </h3>
            <p className="text-sm text-text-secondary max-w-sm">
              {t("Select a conversation from the sidebar or start a new one to begin chatting")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
