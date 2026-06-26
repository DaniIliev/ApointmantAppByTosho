"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import callApi from "@/app/Api/callApi";

export default function ProfilePicturePrompt() {
  const { user, setUser } = useAuthContext();
  const { t } = useTranslation();
  const [oauthPicture, setOauthPicture] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Only proceed if user is logged in
    if (!user) return;

    const picture = sessionStorage.getItem("pendingOauthPicture");
    if (picture) {
      // Check if it's different from current picture
      if (picture !== user.profilePictureUrl) {
        setOauthPicture(picture);
      } else {
        // Already matching, just clear it
        sessionStorage.removeItem("pendingOauthPicture");
      }
    }
  }, [user]);

  const handleAccept = async () => {
    if (!oauthPicture || !user?._id) return;
    setIsUpdating(true);
    
    try {
      const response = await callApi(
        `/api/auth/user/${user._id}`,
        "PUT",
        { profilePictureUrl: oauthPicture },
        false,
        false
      );
      
      if (response) {
        // Merge the updated data, including the new profilePictureUrl
        setUser((prevUser) => {
          if (!prevUser) return prevUser;
          return {
            ...prevUser,
            profilePictureUrl: response.profilePictureUrl,
          };
        });
        toast.success(t("Profile picture updated successfully"));
      }
    } catch (error) {
      console.error("Failed to update profile picture", error);
      toast.error(t("Failed to update profile picture"));
    } finally {
      setIsUpdating(false);
      sessionStorage.removeItem("pendingOauthPicture");
      setOauthPicture(null);
    }
  };

  const handleDecline = () => {
    sessionStorage.removeItem("pendingOauthPicture");
    setOauthPicture(null);
  };

  if (!oauthPicture) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold mb-4 text-center">
          {t("Profile Picture Found")}
        </h3>
        <p className="text-text-secondary text-center mb-6 text-sm">
          {t("We found your profile picture from your linked social account. Would you like to set it as your AppointDI profile picture?")}
        </p>
        
        <div className="flex justify-center mb-8">
          <div className="relative">
            <img 
              src={oauthPicture} 
              alt="Profile" 
              referrerPolicy="no-referrer"
              className="w-32 h-32 rounded-full object-cover border-4 border-primary/20 shadow-lg"
              onError={(e) => {
                console.error("Failed to load OAuth picture:", oauthPicture);
                // Optionally show a fallback image here
              }}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            disabled={isUpdating}
            className="flex-1 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-text-primary transition-colors disabled:opacity-50"
          >
            {t("Not Now")}
          </button>
          <button
            onClick={handleAccept}
            disabled={isUpdating}
            className="flex-1 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {isUpdating ? t("Updating...") : t("Use Picture")}
          </button>
        </div>
      </div>
    </div>
  );
}
