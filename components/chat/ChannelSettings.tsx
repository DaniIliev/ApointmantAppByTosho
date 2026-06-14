"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  Shield,
  ShieldOff,
  UserMinus,
  UserPlus,
  Search,
  Crown,
  Loader2,
  Check,
  Trash2,
  Link,
  Copy,
} from "lucide-react";
import { ChatChannel, ChatMember } from "@/Global/Types/types";
import { useAuthContext } from "@/context/AuthContext";
import * as chatService from "@/app/Api/services/chatService";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";

interface ChannelSettingsProps {
  channel: ChatChannel;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ChannelSettings({
  channel,
  isOpen,
  onClose,
  onUpdate,
}: ChannelSettingsProps) {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const [name, setName] = useState(channel.name || "");
  const [description, setDescription] = useState(channel.description || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [addUserSearch, setAddUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      profilePictureUrl?: string;
    }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  const currentMember = channel.members.find(
    (m) => m.user._id === user?._id
  );
  const isOwnerOrAdmin =
    currentMember?.role === "owner" || currentMember?.role === "admin";
  const canEdit =
    isOwnerOrAdmin && ["group", "client_location"].includes(channel.type);

  const canDelete =
    ["direct", "group"].includes(channel.type) &&
    (channel.type === "direct" || currentMember?.role === "owner");

  const handleSave = async () => {
    if (!canEdit) return;
    setIsSaving(true);
    try {
      await chatService.updateChannel(channel._id, { name, description });
      onUpdate();
    } catch (err) {
      console.error("Error updating channel:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlock = async (userId: string) => {
    try {
      await chatService.toggleBlockMember(channel._id, userId);
      onUpdate();
    } catch (err) {
      console.error("Error blocking member:", err);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      await chatService.removeMember(channel._id, userId);
      onUpdate();
    } catch (error) {
      console.error("Error removing user:", error);
    }
  };

  const handleGenerateInvite = async () => {
    try {
      setIsGeneratingInvite(true);
      await chatService.generateInvite(channel._id);
      onUpdate(); // Will refresh channel and get the new inviteCode
    } catch (error) {
      console.error("Error generating invite:", error);
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const handleCopyInvite = () => {
    if (!channel.inviteCode) return;
    const inviteUrl = `${window.location.origin}/chat/invite/${channel.inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const handleSearchUsers = async (q: string) => {
    setAddUserSearch(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const data = await chatService.searchChatUsers(q, user?.businessId);
      const existing = new Set(channel.members.map((m) => m.user._id));
      setSearchResults(
        (Array.isArray(data) ? data : []).filter(
          (u: { _id: string }) => !existing.has(u._id)
        )
      );
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddUser = async (userId: string) => {
    try {
      await chatService.addMembers(channel._id, [userId]);
      setAddUserSearch("");
      setSearchResults([]);
      onUpdate();
    } catch (err) {
      console.error("Error adding member:", err);
    }
  };

  const handleDeleteChannel = async () => {
    if (!confirm(t("Are you sure you want to delete this conversation? This action cannot be undone."))) return;
    setIsDeleting(true);
    try {
      await chatService.deleteChannel(channel._id);
      onUpdate(); // This should trigger a refresh that removes the channel
      onClose();
    } catch (err) {
      console.error("Error deleting channel:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-primary-foreground border border-white/10 rounded-2xl shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <h3 className="text-lg font-semibold text-text-primary">
            {t("Channel Settings")}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Channel Info */}
          {canEdit && (
            <div className="px-5 py-4 border-b border-white/10 space-y-3">
              <div className="space-y-4 mb-4">
                <LabeledInput
                  id="channel-name"
                  label={t("Channel Name")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <LabeledInput
                  id="channel-desc"
                  label={t("Description")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  rows={2}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("Save Changes")}
              </button>
            </div>
          )}

          {/* Add Members */}
          {isOwnerOrAdmin && (
            <div className="px-5 py-4 border-b border-white/10">
              <h4 className="text-sm font-semibold text-text-primary mb-2">
                {t("Add Members")}
              </h4>
              <div className="relative mb-2 mt-2">
                <LabeledInput
                  id="search-users"
                  label={t("Search users...")}
                  value={addUserSearch}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  onClear={() => handleSearchUsers("")}
                  icon={<Search className="w-4 h-4 text-text-secondary" />}
                />
              </div>
              {isSearching && (
                <div className="flex justify-center py-3">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </div>
              )}
              {searchResults.map((u) => (
                <button
                  key={u._id}
                  onClick={() => handleAddUser(u._id)}
                  className="flex items-center w-full px-2 py-2 rounded-lg hover:bg-white/5 transition-colors mt-1"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center overflow-hidden mr-2 flex-shrink-0">
                    {u.profilePictureUrl ? (
                      <img
                        src={u.profilePictureUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-primary">
                        {u.firstName?.[0]}
                        {u.lastName?.[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm text-text-primary truncate">
                      {u.firstName} {u.lastName}
                    </p>
                  </div>
                  <UserPlus className="w-4 h-4 text-primary" />
                </button>
              ))}
            </div>
          )}

          {/* Invite Link */}
          {channel.type === "group" && isOwnerOrAdmin && (
            <div className="px-5 py-4 border-b border-white/5">
              <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                <Link className="w-4 h-4 text-primary" />
                {t("Invite Link")}
              </h4>
              <div className="bg-white/5 rounded-lg p-3">
                {channel.inviteCode ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/chat/invite/${channel.inviteCode}`}
                      className="flex-1 bg-transparent border-none text-xs text-text-secondary focus:outline-none truncate"
                    />
                    <button
                      onClick={handleCopyInvite}
                      className="p-1.5 rounded-md hover:bg-white/10 transition-colors shrink-0"
                      title={t("Copy link")}
                    >
                      {copiedInvite ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateInvite}
                    disabled={isGeneratingInvite}
                    className="text-xs text-primary hover:text-primary-light transition-colors flex items-center gap-2 w-full justify-center"
                  >
                    {isGeneratingInvite ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      t("Generate Invite Link")
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="px-5 py-4">
            <h4 className="text-sm font-semibold text-text-primary mb-3">
              {t("Members")} ({channel.members.length})
            </h4>
            <div className="space-y-1">
              {channel.members.map((member) => (
                <div
                  key={member.user._id}
                  className="flex items-center px-2 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center overflow-hidden mr-3 flex-shrink-0">
                    {member.user.profilePictureUrl ? (
                      <img
                        src={member.user.profilePictureUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-primary">
                        {member.user.firstName?.[0]}
                        {member.user.lastName?.[0]}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm text-text-primary truncate">
                        {member.user.firstName} {member.user.lastName}
                      </p>
                      {member.role === "owner" && (
                        <Crown className="w-3 h-3 text-amber-400" />
                      )}
                      {member.isBlocked && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">
                          {t("Blocked")}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-secondary">
                      {member.user.email}
                    </p>
                  </div>

                  {/* Actions */}
                  {isOwnerOrAdmin &&
                    member.user._id !== user?._id &&
                    member.role !== "owner" && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleBlock(member.user._id)}
                          className="p-1.5 rounded hover:bg-white/10 transition-colors"
                          title={
                            member.isBlocked ? t("Unblock") : t("Block")
                          }
                        >
                          {member.isBlocked ? (
                            <ShieldOff className="w-4 h-4 text-green-400" />
                          ) : (
                            <Shield className="w-4 h-4 text-text-secondary" />
                          )}
                        </button>
                        <button
                          onClick={() => handleRemoveUser(member.user._id)}
                          className="p-1.5 rounded hover:bg-white/10 transition-colors"
                          title={t("Remove")}
                        >
                          <UserMinus className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>

          {/* Delete Channel Button */}
          {canDelete && (
            <div className="px-5 py-4 border-t border-white/10 mt-auto">
              <button
                onClick={handleDeleteChannel}
                disabled={isDeleting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 text-red-500 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {t("Delete Conversation")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
