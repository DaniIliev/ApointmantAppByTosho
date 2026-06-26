"use client";

import React from "react";
import { Modal } from "./Modal";
import { Button } from "../ui/button";
import { TrendingUp, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
}

export const UpgradeModal = ({
  open,
  onOpenChange,
  title,
  description,
}: UpgradeModalProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  const handleUpgrade = () => {
    onOpenChange(false);
    router.push("/pricing");
  };

  return (
    <Modal label={title} open={open} onOpenChange={onOpenChange} width="md">
      <div className="text-center space-y-6 py-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-amber-100 p-4">
            <TrendingUp className="h-8 w-8 text-amber-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-muted-foreground text-lg">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button onClick={handleUpgrade} size="lg" className="w-full">
            {t("Upgrade Plan")} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Modal>
  );
};
