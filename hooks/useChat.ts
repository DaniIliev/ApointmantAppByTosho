"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { useAuthContext } from "@/context/AuthContext";
import {
  ChatChannel,
  ChatMessage,
  UnreadCounts,
} from "@/Global/Types/types";
import * as chatService from "@/app/Api/services/chatService";

export function useChat() {
  const { user } = useAuthContext();
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<ChatChannel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({
    total: 0,
    channels: {},
  });
  const [typingUsers, setTypingUsers] = useState<
    Record<string, { userId: string; userName: string }>
  >({});
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeChannelRef = useRef<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!user?._id) return;

    const socket = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    );

    socket.on("connect", () => {
      socket.emit("joinRoom", user._id);
    });

    // New message in current channel
    socket.on("newChatMessage", (message: ChatMessage) => {
      if (message.channel === activeChannelRef.current) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }

      // Update channel's lastMessage
      setChannels((prev) =>
        prev.map((ch) =>
          ch._id === message.channel
            ? {
                ...ch,
                lastMessage: {
                  text: message.text || "",
                  sender: message.sender._id,
                  senderName: `${message.sender.firstName} ${message.sender.lastName}`,
                  sentAt: message.createdAt,
                  type: message.type,
                },
                updatedAt: message.createdAt,
              }
            : ch
        )
      );
    });

    // Chat notification for badge
    socket.on(
      "chatNotification",
      ({ channelId }: { channelId: string; message: ChatMessage }) => {
        setUnreadCounts((prev) => ({
          total: prev.total + 1,
          channels: {
            ...prev.channels,
            [channelId]: (prev.channels[channelId] || 0) + 1,
          },
        }));
      }
    );

    // Typing indicators
    socket.on(
      "userTyping",
      ({
        channelId,
        userId,
        userName,
      }: {
        channelId: string;
        userId: string;
        userName: string;
      }) => {
        if (channelId === activeChannelRef.current) {
          setTypingUsers((prev) => ({
            ...prev,
            [userId]: { userId, userName },
          }));
        }
      }
    );

    socket.on(
      "userStopTyping",
      ({ userId }: { channelId: string; userId: string }) => {
        setTypingUsers((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      }
    );

    // Channel events
    socket.on("channelCreated", (channel: ChatChannel) => {
      setChannels((prev) => {
        if (prev.some((ch) => ch._id === channel._id)) return prev;
        return [channel, ...prev];
      });
    });

    socket.on("channelUpdated", (channel: ChatChannel) => {
      setChannels((prev) =>
        prev.map((ch) => (ch._id === channel._id ? channel : ch))
      );
      if (activeChannel?._id === channel._id) {
        setActiveChannel(channel);
      }
    });

    socket.on("channelArchived", ({ channelId }: { channelId: string }) => {
      setChannels((prev) => prev.filter((ch) => ch._id !== channelId));
      if (activeChannelRef.current === channelId) {
        setActiveChannel(null);
        setMessages([]);
      }
    });

    socket.on(
      "removedFromChannel",
      ({ channelId }: { channelId: string }) => {
        setChannels((prev) => prev.filter((ch) => ch._id !== channelId));
        if (activeChannelRef.current === channelId) {
          setActiveChannel(null);
          setMessages([]);
        }
      }
    );

    socket.on("messageEdited", (message: ChatMessage) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === message._id ? message : m))
      );
    });

    socket.on(
      "messageDeleted",
      ({ messageId }: { messageId: string }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? { ...m, isDeleted: true, text: "", attachments: [] }
              : m
          )
        );
      }
    );

    socket.on(
      "memberBlocked",
      ({
        channelId,
        isBlocked,
      }: {
        channelId: string;
        isBlocked: boolean;
      }) => {
        if (channelId === activeChannelRef.current) {
          setActiveChannel((prev) =>
            prev ? { ...prev, isBlocked } : prev
          );
        }
      }
    );

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  // Fetch channels
  const fetchChannels = useCallback(async () => {
    try {
      setIsLoadingChannels(true);
      const data = await chatService.getChannels();
      const loaded = Array.isArray(data) ? data : [];
      setChannels(loaded);
      
      if (activeChannelRef.current) {
        const stillExists = loaded.some(c => c._id === activeChannelRef.current);
        if (!stillExists) {
          setActiveChannel(null);
          activeChannelRef.current = null;
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
    } finally {
      setIsLoadingChannels(false);
    }
  }, []);

  // Fetch unread counts
  const fetchUnreadCounts = useCallback(async () => {
    try {
      const data = await chatService.getUnreadCounts();
      if (data) {
        setUnreadCounts(data);
      }
    } catch (error) {
      console.error("Error fetching unread counts:", error);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    if (user?._id) {
      fetchChannels();
      fetchUnreadCounts();
    }
  }, [user?._id, fetchChannels, fetchUnreadCounts]);

  // Select a channel
  const selectChannel = useCallback(
    async (channel: ChatChannel) => {
      // Leave previous channel room
      if (activeChannelRef.current && socketRef.current) {
        socketRef.current.emit("leaveChannel", activeChannelRef.current);
      }

      setActiveChannel(channel);
      activeChannelRef.current = channel._id;
      setMessages([]);
      setHasMoreMessages(true);
      setTypingUsers({});

      // Join new channel room
      if (socketRef.current) {
        socketRef.current.emit("joinChannel", channel._id);
      }

      // Load messages
      try {
        setIsLoadingMessages(true);
        const data = await chatService.getMessages(channel._id);
        setMessages(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length < 50) {
          setHasMoreMessages(false);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }

      // Mark as read
      try {
        await chatService.markAsRead(channel._id);
        setUnreadCounts((prev) => ({
          total: Math.max(0, prev.total - (prev.channels[channel._id] || 0)),
          channels: { ...prev.channels, [channel._id]: 0 },
        }));
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    },
    []
  );

  // Load older messages
  const loadMoreMessages = useCallback(async () => {
    if (!activeChannelRef.current || !hasMoreMessages || isLoadingMessages)
      return;

    const oldestMsg = messages[0];
    if (!oldestMsg) return;

    try {
      setIsLoadingMessages(true);
      const data = await chatService.getMessages(
        activeChannelRef.current,
        oldestMsg.createdAt
      );
      const older = Array.isArray(data) ? data : [];
      if (older.length < 50) setHasMoreMessages(false);
      setMessages((prev) => [...older, ...prev]);
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [messages, hasMoreMessages, isLoadingMessages]);

  // Send message
  const sendMsg = useCallback(
    async (data: {
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
    }) => {
      if (!activeChannelRef.current) return;
      try {
        const message = await chatService.sendMessage(
          activeChannelRef.current,
          data
        );
        // Message will arrive via socket, but add immediately for responsiveness
        if (message) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === message._id)) return prev;
            return [...prev, message];
          });
        }
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    },
    []
  );

  // Emit typing
  const emitTyping = useCallback(() => {
    if (!activeChannelRef.current || !socketRef.current || !user) return;

    socketRef.current.emit("typing", {
      channelId: activeChannelRef.current,
      userId: user._id,
      userName: `${user.firstName} ${user.lastName}`,
    });

    // Auto-stop typing after 3 seconds
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && activeChannelRef.current) {
        socketRef.current.emit("stopTyping", {
          channelId: activeChannelRef.current,
          userId: user._id,
        });
      }
    }, 3000);
  }, [user]);

  // Stop typing
  const emitStopTyping = useCallback(() => {
    if (!activeChannelRef.current || !socketRef.current || !user) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketRef.current.emit("stopTyping", {
      channelId: activeChannelRef.current,
      userId: user._id,
    });
  }, [user]);

  return {
    channels,
    activeChannel,
    messages,
    unreadCounts,
    typingUsers,
    isLoadingChannels,
    isLoadingMessages,
    hasMoreMessages,
    fetchChannels,
    fetchUnreadCounts,
    selectChannel,
    loadMoreMessages,
    sendMessage: sendMsg,
    emitTyping,
    emitStopTyping,
    setActiveChannel,
    setChannels,
  };
}
