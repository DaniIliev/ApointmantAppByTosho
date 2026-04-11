"use client";

import React, { useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import callApi from "@/app/Api/callApi";
import type { PaymentOption } from "@/Global/Types/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PaymentOptionSelectorProps = {
  value?: PaymentOption;
  onChange: (option: PaymentOption) => void;
  disabled?: boolean;
};

export function PaymentOptionSelector({
  value,
  onChange,
  disabled = false,
}: PaymentOptionSelectorProps) {
  const { t } = useTranslation();
  const [checkingStripe, setCheckingStripe] = useState(false);
  const [stripeMessage, setStripeMessage] = useState<string | null>(null);
  const [showStripePrompt, setShowStripePrompt] = useState(false);
  const [pendingPaymentOption, setPendingPaymentOption] =
    useState<PaymentOption | null>(null);

  const paymentOptions = useMemo(
    () => [
      {
        value: "cash" as PaymentOption,
        title: t("Cash only"),
        description: t("Customer pays in person."),
      },
      {
        value: "card" as PaymentOption,
        title: t("Card only"),
        description: t("Require online payment during booking."),
      },
      {
        value: "cash_and_card" as PaymentOption,
        title: t("Cash or card"),
        description: t("Allow customer to choose at checkout."),
      },
    ],
    [t],
  );

  const currentPaymentOption: PaymentOption = value || "cash";

  const ensureStripeReady = async (option: PaymentOption) => {
    setStripeMessage(null);

    if (option === "cash") {
      onChange(option);
      return;
    }

    setCheckingStripe(true);
    try {
      const status = await callApi("/api/stripe/connect/status", "GET");
      const ready = Boolean(
        status?.ready ?? status?.details_submitted ?? status?.charges_enabled,
      );

      if (!ready) {
        setPendingPaymentOption(option);
        setShowStripePrompt(true);
        return;
      }

      onChange(option);
      setStripeMessage(t("Stripe account ready for card payments."));
    } catch (error: any) {
      console.error("Stripe connect check failed", error);
      setStripeMessage(
        error?.message || t("Connect Stripe to enable card payments."),
      );
      onChange("cash");
      setPendingPaymentOption(null);
      setShowStripePrompt(false);
    } finally {
      setCheckingStripe(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {paymentOptions.map((option) => {
          const selected = currentPaymentOption === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => ensureStripeReady(option.value)}
              disabled={checkingStripe || disabled}
              className={cn(
                "w-full text-left border rounded-lg p-3 transition focus:outline-none",
                "hover:border-primary/60 hover:shadow-sm",
                selected
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-card/60",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{option.title}</span>
                {selected && <Check className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
      {checkingStripe && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("Checking Stripe status...")}
        </div>
      )}
      {stripeMessage && (
        <p className="text-sm text-muted-foreground">{stripeMessage}</p>
      )}

      <Dialog open={showStripePrompt} onOpenChange={setShowStripePrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("Connect Stripe to take card payments")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "You'll be redirected to Stripe to complete onboarding. It takes about 2 minutes.",
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowStripePrompt(false);
                setPendingPaymentOption(null);
                onChange("cash");
              }}
            >
              {t("Later")}
            </Button>
            <Button
              disabled={checkingStripe}
              onClick={async () => {
                if (!pendingPaymentOption) {
                  setShowStripePrompt(false);
                  return;
                }
                setCheckingStripe(true);
                try {
                  const returnUrl =
                    typeof window !== "undefined"
                      ? window.location.href
                      : undefined;
                  const link = await callApi(
                    "/api/stripe/connect/link",
                    "POST",
                    {
                      returnUrl,
                      refreshUrl: returnUrl,
                    },
                  );
                  const onboardingUrl = link?.url || link?.onboardingUrl;
                  if (onboardingUrl && typeof window !== "undefined") {
                    window.location.href = onboardingUrl;
                    return;
                  }
                  throw new Error("Stripe onboarding link not available");
                } catch (error: any) {
                  console.error("Stripe onboarding launch failed", error);
                  setStripeMessage(
                    error?.message ||
                      t("Connect Stripe to enable card payments."),
                  );
                  setShowStripePrompt(false);
                  setPendingPaymentOption(null);
                  onChange("cash");
                } finally {
                  setCheckingStripe(false);
                }
              }}
            >
              {checkingStripe ? t("Opening...") : t("Connect now")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
