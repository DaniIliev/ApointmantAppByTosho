"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Download, Loader2 } from "lucide-react";
import callApi from "@/app/Api/callApi";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import React from "react";

function PaymentSuccessContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = useMemo(
    () => searchParams.get("session_id") || "",
    [searchParams],
  );

  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleInvoiceDownload = async () => {
    if (!sessionId) {
      toast.error(
        t(
          "Invoice session ID is missing. Please try again or contact support.",
        ),
      );
      return;
    }

    setLoadingInvoice(true);
    setMessage(null);

    try {
      const result = await callApi(
        `/api/stripe/checkout-invoice?sessionId=${encodeURIComponent(sessionId)}`,
        "GET",
        null,
      );

      if (result?.invoiceUrl) {
        window.open(result.invoiceUrl, "_blank", "noopener,noreferrer");
      } else {
        toast.error(t("Failed to retrieve invoice. Please try again later."));
      }
    } catch (error) {
      const fallback = t(
        "An error occurred while fetching the invoice. Please try again later.",
      );
      toast.error(
        error instanceof Error ? error.message || fallback : fallback,
      );
    } finally {
      setLoadingInvoice(false);
    }
  };

  return (
    <div className="bg-background px-4 py-16">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <CheckCircle2 className="mb-4 h-10 w-10 text-green-600" />
        <h1 className="text-2xl font-bold text-foreground">
          {t("Payment Successful")}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t(
            "Your subscription is now active. You can download your invoice from Stripe.",
          )}
        </p>

        <Button
          onClick={handleInvoiceDownload}
          className="mt-6"
          iconType="download"
          disabled={loadingInvoice}
        >
          {loadingInvoice ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("Fetching Invoice...")}
            </>
          ) : (
            <>{t("Download Invoice")}</>
          )}
        </Button>

        {message ? (
          <p className="mt-3 text-sm text-muted-foreground">{message}</p>
        ) : null}

        <div className="mt-6 flex items-center gap-3">
          <Button
            iconType="back"
            variant="outline"
            onClick={() => router.push("/pricing")}
          >
            {t("Back to Plans")}
          </Button>
          <Button iconType="next" onClick={() => router.push("/dashboard")}>
            {t("Go to Dashboard")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <React.Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <PaymentSuccessContent />
    </React.Suspense>
  );
}
