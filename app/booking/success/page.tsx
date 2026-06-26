"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import React from "react";

function BookingSuccessContent() {
  const { t } = useTranslation();

  return (
    <div className="bg-background h-full flex items-center justify-center px-4">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center rounded-3xl border border-border bg-card p-8 text-center shadow-2xl">
        <div className="mb-6 rounded-full bg-green-500/10 p-4">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {t("Booking Successful!")}
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          {t(
            "Your appointment has been successfully scheduled and your payment has been authorized.",
          )}
        </p>

      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <React.Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <BookingSuccessContent />
    </React.Suspense>
  );
}
