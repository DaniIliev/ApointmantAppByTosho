"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  CreditCard, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Wallet,
  Lock,
  Sparkles
} from "lucide-react";
import callApi from "@/app/Api/callApi";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import React from "react";
import { useAuthContext } from "@/context/AuthContext";

export default function PaymentsSettingsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user && user.role !== "business") {
      router.push("/dashboard");
      toast.error(t("You do not have permission to access this page."));
    }
  }, [user, router, t]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await callApi("/api/stripe/connect/status", "GET");
      setStatus(data);
    } catch (error) {
      console.error("Error fetching stripe status:", error);
      toast.error(t("Failed to load payment settings."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnect = async () => {
    setActionLoading(true);
    try {
      const res = await callApi("/api/stripe/connect/link", "POST", {
        returnUrl: window.location.href,
        refreshUrl: window.location.href,
      });
      if (res?.url) {
        window.location.href = res.url;
      }
    } catch (error) {
      console.error("Error creating connect link:", error);
      toast.error(t("Failed to start Stripe onboarding."));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDashboard = async () => {
    setActionLoading(true);
    try {
      const res = await callApi("/api/stripe/connect/dashboard", "POST");
      if (res?.url) {
        window.location.href = res.url;
      }
    } catch (error) {
      console.error("Error creating dashboard link:", error);
      toast.error(t("Failed to open Stripe dashboard."));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-background to-accent/5 border border-primary/10 p-8 md:p-12">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
              <Sparkles className="w-4 h-4" />
              {t("Professional Payments")}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              {t("Accept Card Payments")} <br/>
              <span className="text-primary">{t("Directly on AppointDI")}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              {t("Enable professional card payments for your business. Link your Stripe account to allow clients to pay securely when booking appointments. No hidden fees, instant authorization.")}
            </p>
          </div>
          
          <div className="w-full md:w-auto">
            <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 min-w-[300px]">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-primary/20 rounded-2xl">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                {status?.ready ? (
                  <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {t("Active")}
                  </div>
                ) : (
                  <div className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase tracking-wider">
                    {t("Not Connected")}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t("Status")}</p>
                <p className="text-2xl font-bold">
                  {status?.ready ? t("Ready to earn") : t("Setup Required")}
                </p>
              </div>

              {!status?.ready ? (
                <Button 
                  onClick={handleConnect} 
                  disabled={actionLoading}
                  className="w-full h-12 text-lg font-semibold rounded-2xl shadow-lg shadow-primary/20 group transition-all"
                >
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("Start Setup")}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={handleDashboard}
                  disabled={actionLoading}
                  className="w-full h-12 text-lg font-semibold rounded-2xl group border-primary/20 hover:bg-primary/5"
                >
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("Manage Payments")}
                  <Globe className="w-5 h-5 ml-2 text-primary" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Why Stripe Section */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-card border border-border/50 rounded-3xl p-8 hover:border-primary/30 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold mb-3">{t("Safe & Secure")}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("Transactions are encrypted and handled by Stripe. Your business is protected by world-class fraud prevention systems.")}
          </p>
        </div>
        
        <div className="bg-card border border-border/50 rounded-3xl p-8 hover:border-primary/30 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6 text-orange-500" />
          </div>
          <h3 className="text-xl font-bold mb-3">{t("Boost Conversions")}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("Clients are 40% more likely to show up for appointments that are pre-paid. Reduce no-shows and stabilize your income.")}
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded-3xl p-8 hover:border-primary/30 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Wallet className="w-6 h-6 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold mb-3">{t("Automated Payouts")}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("Forget manual tracking. Payments are automatically processed and transferred to your bank account on a regular schedule.")}
          </p>
        </div>
      </div>

      {/* Integration Details Card */}
      <div className="bg-card border border-border rounded-[2rem] p-8 md:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <Lock className="w-32 h-32" />
        </div>
        
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t("Configuration Checklist")}</h2>
              <p className="text-muted-foreground">{t("Follow these steps to complete your payment integration")}</p>
            </div>
            {status?.ready && (
              <div className="flex items-center gap-2 text-green-500 font-medium bg-green-500/5 px-4 py-2 rounded-xl border border-green-500/20">
                <CheckCircle2 className="w-5 h-5" />
                {t("Everything is set up correctly")}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border/50">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${status?.details_submitted ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                  {status?.details_submitted ? <CheckCircle2 className="w-4 h-4" /> : "1"}
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-lg">{t("Register Business Details")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("Verify your identity and provide legal business information to Stripe.")}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${status?.charges_enabled ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                  {status?.charges_enabled ? <CheckCircle2 className="w-4 h-4" /> : "2"}
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-lg">{t("Enable Card Payments")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("Activate the capability to accept payments from Visa, Mastercard, and more.")}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${status?.payouts_enabled ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                  {status?.payouts_enabled ? <CheckCircle2 className="w-4 h-4" /> : "3"}
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-lg">{t("Set Payout Account")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("Link your bank account where you want to receive your earnings.")}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${status?.ready ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                   {status?.ready ? <CheckCircle2 className="w-4 h-4" /> : "4"}
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-lg">{t("Ready for Bookings")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("Once configured, card payment options will automatically appear on your booking form.")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA if not ready */}
      {!status?.ready && (
        <div className="bg-primary p-1 rounded-[2rem]">
          <div className="bg-background rounded-[1.9rem] p-10 text-center space-y-6">
             <h2 className="text-3xl font-bold">{t("Ready to scale your business?")}</h2>
             <p className="text-muted-foreground max-w-2xl mx-auto">
               {t("Join thousands of professionals who have simplified their workflow with automated card payments. Setting up takes less than 5 minutes.")}
             </p>
             <Button 
                onClick={handleConnect} 
                disabled={actionLoading}
                size="lg"
                className="h-14 px-10 text-lg font-bold rounded-2xl shadow-xl shadow-primary/30"
              >
                {t("Complete Configuration Now")}
                <ArrowRight className="ml-2 w-5 h-5" />
             </Button>
          </div>
        </div>
      )}
    </div>
  );
}
