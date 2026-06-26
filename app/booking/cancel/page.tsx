"use client";

import { useRouter } from "next/navigation";
import { XCircle, ArrowLeft, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import React from "react";

export default function BookingCancelPage() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="h-full bg-background flex items-center justify-center px-4">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center rounded-3xl border border-border bg-card p-8 text-center shadow-2xl">
        <div className="mb-6 rounded-full bg-red-500/10 p-4">
          <XCircle className="h-12 w-12 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {t("Payment Cancelled")}
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          {t(
            "Your payment process was cancelled. Don't worry, no charges were made and your appointment hasn't been scheduled yet.",
          )}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <Button
            className="w-full flex-1 gap-2"
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            {t("Go Back")}
          </Button>
        </div>
      </div>
    </div>
  );
}
