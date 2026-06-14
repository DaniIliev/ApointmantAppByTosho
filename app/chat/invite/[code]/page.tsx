"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/context/AuthContext";
import * as chatService from "@/app/Api/services/chatService";
import { Loader2, Users, Building2 } from "lucide-react";

export default function InvitePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthContext();
  const inviteCode = params.code as string;

  const [inviteInfo, setInviteInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!inviteCode) return;

    const fetchInfo = async () => {
      try {
        const info = await chatService.getInviteInfo(inviteCode);
        setInviteInfo(info);
      } catch (err) {
        console.error("Error fetching invite info:", err);
        setError(t("Invalid or expired invite link."));
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfo();
  }, [inviteCode, t]);

  const handleJoin = async () => {
    if (!user) {
      // Not logged in, redirect to login with return path
      router.push(`/login?redirect=/chat/invite/${inviteCode}`);
      return;
    }

    try {
      setIsJoining(true);
      await chatService.joinInvite(inviteCode);
      router.push("/chat");
    } catch (err) {
      console.error("Error joining group:", err);
      setError(t("Failed to join the group. Please try again."));
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("Oops!")}</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/chat")}
            className="w-full py-3 px-4 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
          >
            {t("Go to Chat")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
        <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 overflow-hidden">
          {inviteInfo?.avatar ? (
            <img src={inviteInfo.avatar} alt={inviteInfo.name} className="w-full h-full object-cover" />
          ) : (
            <Building2 className="w-10 h-10 text-primary" />
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {inviteInfo?.name || t("Group Chat")}
        </h1>
        
        <div className="flex items-center justify-center gap-2 text-gray-500 mb-8">
          <Users className="w-4 h-4" />
          <span>{inviteInfo?.memberCount || 0} {t("members")}</span>
        </div>

        {!user ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {t("You must log in to join this group.")}
            </p>
            <button
              onClick={handleJoin}
              className="w-full py-3 px-4 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
            >
              {t("Log In to Join")}
            </button>
          </div>
        ) : (
          <button
            onClick={handleJoin}
            disabled={isJoining}
            className="w-full py-3 px-4 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
          >
            {isJoining ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t("Joining...")}
              </>
            ) : (
              t("Join Group")
            )}
          </button>
        )}
      </div>
    </div>
  );
}
