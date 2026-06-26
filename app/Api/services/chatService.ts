import callApi from "../callApi";

// ─── Channels ────────────────────────────────────────────────────

export const getChannels = () => callApi("/api/chat/channels", "GET");

export const getChannel = (id: string) =>
  callApi(`/api/chat/channels/${id}`, "GET");

export const createChannel = (data: {
  type: "direct" | "group";
  name?: string;
  description?: string;
  memberIds: string[];
}) => callApi("/api/chat/channels", "POST", data);

export const updateChannel = (
  id: string,
  data: { name?: string; description?: string; avatar?: string }
) => callApi(`/api/chat/channels/${id}`, "PUT", data);

export const deleteChannel = (id: string) =>
  callApi(`/api/chat/channels/${id}`, "DELETE");

// ─── Members ─────────────────────────────────────────────────────

export const addMembers = (channelId: string, userIds: string[]) =>
  callApi(`/api/chat/channels/${channelId}/members`, "POST", { userIds });

export const removeMember = (channelId: string, userId: string) =>
  callApi(`/api/chat/channels/${channelId}/members/${userId}`, "DELETE");

export const toggleBlockMember = (channelId: string, userId: string) =>
  callApi(`/api/chat/channels/${channelId}/members/${userId}/block`, "PUT");

// ─── Messages ────────────────────────────────────────────────────

export const getMessages = (
  channelId: string,
  before?: string,
  limit = 50
) => {
  const params = new URLSearchParams();
  if (before) params.set("before", before);
  params.set("limit", String(limit));
  return callApi(
    `/api/chat/channels/${channelId}/messages?${params.toString()}`,
    "GET"
  );
};

export const sendMessage = (
  channelId: string,
  data: {
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
  }
) => callApi(`/api/chat/channels/${channelId}/messages`, "POST", data);

export const editMessage = (msgId: string, text: string) =>
  callApi(`/api/chat/messages/${msgId}`, "PUT", { text });

export const deleteMessage = (msgId: string) =>
  callApi(`/api/chat/messages/${msgId}`, "DELETE");

// ─── Read / Unread ───────────────────────────────────────────────

export const markAsRead = (channelId: string) =>
  callApi(`/api/chat/channels/${channelId}/read`, "POST");

export const getUnreadCounts = () => callApi("/api/chat/unread", "GET");

// ─── File Upload ─────────────────────────────────────────────────

export const uploadChatFile = (file: File) =>
  callApi("/api/chat/upload", "POST", { file }, true);

// ─── User Search ─────────────────────────────────────────────────

export const searchChatUsers = (q: string, businessId?: string) => {
  const params = new URLSearchParams({ q });
  if (businessId) params.set("businessId", businessId);
  return callApi(`/api/chat/users/search?${params.toString()}`, "GET");
};

// ─── Client Channel ──────────────────────────────────────────────

export const joinClientChannel = (locationId: string) =>
  callApi(`/api/chat/client-channel/${locationId}/join`, "POST");
export const toggleReaction = async (messageId: string, emoji: string) => {
  return await callApi(`/api/chat/messages/${messageId}/react`, "POST", { emoji });
};

export const generateInvite = async (channelId: string) => {
  return await callApi(`/api/chat/channels/${channelId}/invite`, "POST");
};

export const getInviteInfo = async (code: string) => {
  return await callApi(`/api/chat/invite/${code}`, "GET");
};

export const joinInvite = async (code: string) => {
  return await callApi(`/api/chat/invite/${code}/join`, "POST");
};
