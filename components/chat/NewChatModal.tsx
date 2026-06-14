"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Search, Users, MessageCircle, Loader2, Check } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import * as chatService from "@/app/Api/services/chatService";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChannelCreated: () => void;
}

interface SearchUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string;
  role?: string;
}

export default function NewChatModal({
  isOpen,
  onClose,
  onChannelCreated,
}: NewChatModalProps) {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const [mode, setMode] = useState<"direct" | "group">("direct");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SearchUser[]>([]);
  const [groupName, setGroupName] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleSearch = useCallback(
    async (q: string) => {
      setSearch(q);
      if (q.length > 0 && q.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const data = await chatService.searchChatUsers(
          q,
          user?.businessId
        );
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    },
    [user?.businessId]
  );

  // Load business colleagues initially
  useEffect(() => {
    if (isOpen && user?.businessId) {
      handleSearch("");
    }
  }, [isOpen, user?.businessId, handleSearch]);

  const toggleUser = (u: SearchUser) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((p) => p._id === u._id);
      if (exists) return prev.filter((p) => p._id !== u._id);
      if (mode === "direct") return [u]; // Only one for direct
      return [...prev, u];
    });
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0) return;

    setIsCreating(true);
    try {
      await chatService.createChannel({
        type: mode,
        name: mode === "group" ? groupName || "New Group" : undefined,
        memberIds: selectedUsers.map((u) => u._id),
      });
      onChannelCreated();
      handleReset();
    } catch (err) {
      console.error("Error creating channel:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleReset = () => {
    setSearch("");
    setSearchResults([]);
    setSelectedUsers([]);
    setGroupName("");
    setMode("direct");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-primary-foreground border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-text-primary">
            {t("New Conversation")}
          </h3>
          <button
            onClick={handleReset}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 px-5 py-3 border-b border-white/10">
          <button
            onClick={() => {
              setMode("direct");
              setSelectedUsers([]);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === "direct"
                ? "bg-primary text-white"
                : "bg-white/5 text-text-secondary hover:text-text-primary hover:bg-white/10"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            {t("Direct Message")}
          </button>
          <button
            onClick={() => setMode("group")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === "group"
                ? "bg-primary text-white"
                : "bg-white/5 text-text-secondary hover:text-text-primary hover:bg-white/10"
            }`}
          >
            <Users className="w-4 h-4" />
            {t("Group Chat")}
          </button>
        </div>

        {/* Group Name */}
        {mode === "group" && (
          <div className="px-5 py-3 border-b border-white/10">
            <LabeledInput
              id="group-name"
              label={t("Group name...")}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
        )}

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 px-5 py-2 border-b border-white/10">
            {selectedUsers.map((u) => (
              <span
                key={u._id}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-xs text-primary"
              >
                {u.firstName} {u.lastName}
                <button
                  onClick={() => toggleUser(u)}
                  className="ml-0.5 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="px-5 py-3">
          <div className="relative mb-2">
            <LabeledInput
              id="search-people"
              label={t("Search people...")}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              onClear={() => handleSearch("")}
              icon={<Search className="w-4 h-4 text-text-secondary" />}
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-60 overflow-y-auto px-2">
          {isSearching ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((u) => {
              const isSelected = selectedUsers.some((s) => s._id === u._id);
              return (
                <button
                  key={u._id}
                  onClick={() => toggleUser(u)}
                  className={`flex items-center w-full px-3 py-2.5 rounded-lg transition-colors ${
                    isSelected
                      ? "bg-primary/10"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center overflow-hidden mr-3 flex-shrink-0">
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
                    <p className="text-sm font-medium text-text-primary truncate">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      {u.email}
                    </p>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                </button>
              );
            })
          ) : search.length > 0 && search.length < 2 ? (
            <p className="text-sm text-text-secondary text-center py-6">
              {t("Type at least 2 characters")}
            </p>
          ) : (
            <p className="text-sm text-text-secondary text-center py-6">
              {t("No users found")}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-white/10">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg bg-white/5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
          >
            {t("Cancel")}
          </button>
          <button
            onClick={handleCreate}
            disabled={selectedUsers.length === 0 || isCreating}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
            {t("Start Chat")}
          </button>
        </div>
      </div>
    </div>
  );
}
