"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User, Building2, CheckCircle2, ChevronRight } from "lucide-react";
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
      const userData = await callApi("/api/auth/update-role", "PUT", { role });
      if (setUser && userData) {
        setUser(userData);
      }
      onNext(role);
    } catch (error) {
      console.error("Failed to update role:", error);
      // Even if API fails, if we want to proceed we can, but usually we shouldn't if it's a critical step.
      // However, for onboarding we might want to be resilient.
      // But the user says it "supposedly updates but doesn't lead to next step".
      // If it fails, we should probably show an error and stay on the page.
      // callApi already shows a toast.
    }
  };

  const roles = [
    {
      id: "business",
      title: t("I'm a Business"),
      desc: t("Manage appointments and staff"),
      icon: Building2,
      color: "bg-primary/10 text-primary",
    },
    {
      id: "personal",
      title: t("I'm a Client"),
      desc: t("Find and book local services"),
      icon: User,
      color: "bg-primary/10 text-primary",
    },
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
          {t("Welcome to AppointDI")}
        </h2>
        <p className="text-sm text-muted-foreground font-medium">
          {t("How would you like to use the platform?")}
        </p>
      </div>

      {/* Cards Container */}
      <div className="flex flex-col gap-3 w-full">
        {roles.map((role) => {
          const isSelected = user?.role === role.id;
          return (
            <button
              key={role.id}
              onClick={() => handleSelectRole(role.id as any)}
              className="group text-left focus:outline-none"
            >
              <Card className={cn(
                "relative overflow-hidden transition-all duration-200 border-2",
                isSelected 
                  ? "border-primary bg-card shadow-md shadow-primary/5" 
                  : "border-card/80 hover:border-primary/20 bg-card "
              )}>
                <CardContent className="p-4 flex items-center gap-4">
                  {/* Icon Box */}
                  <div className={cn(
                    "h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl transition-transform group-hover:scale-110",
                    role.color
                  )}>
                    <role.icon className="h-6 w-6" />
                  </div>
                  
                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-[15px] leading-tight">
                      {role.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {role.desc}
                    </p>
                  </div>

                  {/* End Element */}
                  <div className="shrink-0 ml-2">
                    {isSelected ? (
                      <CheckCircle2 className="h-5 w-5 text-primary fill-primary/10 animate-in zoom-in duration-300" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      {/* Footer hint */}
      <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
        {t("Secure setup • Change anytime")}
      </p>
    </div>
  );
}