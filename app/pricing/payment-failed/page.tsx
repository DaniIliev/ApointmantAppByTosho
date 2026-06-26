"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function PaymentFailedPage() {
  const { t } = useTranslation();
  return (
    <div className="bg-background px-4 py-16">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <AlertTriangle className="mb-4 h-10 w-10 text-destructive" />
        <h1 className="text-2xl font-bold text-foreground">
          {t("Payment Failed")}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t(
            "Your payment attempt failed. Please try again or contact support.",
          )}
        </p>

        <Button asChild className="mt-6">
          <Link href="/pricing">{t("Back to Plans")}</Link>
        </Button>
      </div>
    </div>
  );
}
