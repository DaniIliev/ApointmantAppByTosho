"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import callApi from "@/app/Api/callApi";
import { useAuthContext } from "@/context/AuthContext";

interface RoleSelectionProps {
  onNext: (role: "personal" | "business") => void;
}

export default function RoleSelection({ onNext }: RoleSelectionProps) {
  const { t } = useTranslation();
  const { user, setUser } = useAuthContext();

  const handleSelectRole = async (role: "personal" | "business") => {
    if (user?.role === role) {
      onNext(role);
      return;
    }
    
    try {
      // Update role on backend
      const updatedUser = await callApi("/api/auth/update-role", "PUT", { role });
      if (setUser) setUser(updatedUser.user);
      onNext(role);
    } catch (error) {
      console.error("Failed to update role:", error);
      // Fallback for demo if endpoint doesn't exist yet
      onNext(role);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-4 text-center">
        {t("Welcome! How will you use AppointDI?")}
      </h2>
      <p className="text-muted-foreground mb-12 text-center max-w-md">
        {t("Choose the account type that best fits your needs. You can always change this later.")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        <div
          className="relative cursor-pointer group"
          onClick={() => handleSelectRole("personal")}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-500 via-primary to-pink-500 rounded-3xl opacity-40 blur-sm group-hover:opacity-75 transition-opacity" />
          <Card className={cn(
            "relative h-full transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm bg-white dark:bg-gray-900 border",
            user?.role === "personal" ? "border-primary ring-2 ring-primary/20" : "border-primary/20"
          )}>
            <CardContent className="flex flex-col items-center p-10 space-y-6">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary group-hover:scale-110 transition-transform">
                <User className="h-16 w-16" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-2xl mb-2">{t("I'm a Client")}</h3>
                <p className="text-muted-foreground">
                  {t("I want to find and book appointments with local businesses.")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div
          className="relative cursor-pointer group"
          onClick={() => handleSelectRole("business")}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-500 via-primary to-pink-500 rounded-3xl opacity-40 blur-sm group-hover:opacity-75 transition-opacity" />
          <Card className={cn(
            "relative h-full transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm bg-white dark:bg-gray-900 border",
            user?.role === "business" ? "border-primary ring-2 ring-primary/20" : "border-primary/20"
          )}>
            <CardContent className="flex flex-col items-center p-10 space-y-6">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary group-hover:scale-110 transition-transform">
                <Building2 className="h-16 w-16" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-2xl mb-2">{t("I'm a Business")}</h3>
                <p className="text-muted-foreground">
                  {t("I want to manage my appointments, staff, and services.")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
