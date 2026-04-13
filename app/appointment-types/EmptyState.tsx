// components/EmptyStateCard.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

type EmptyStateProps = {
  onOpenModal: () => void;
};

const EmptyState = ({ onOpenModal }: EmptyStateProps) => {
  const {t} = useTranslation()
  return (
      <div className="flex-1 flex items-center justify-center min-h-[500px] p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm shadow-xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Plus className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("No appointment types configured")}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                "Create your first appointment type to get started"
              )}
            </p>
          </div>
          <Button
            onClick={() => onOpenModal()}
            className="w-full sm:w-auto px-8 h-11 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("Create Appointment Type")}
          </Button>
        </div>
      </div>
  );
};

export default EmptyState;
