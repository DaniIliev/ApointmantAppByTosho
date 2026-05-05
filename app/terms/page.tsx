"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { usePaddingControl } from "@/context/PaddingContext";
import { useEffect } from "react";
import { FileText } from "lucide-react";

export default function TermsPage() {
  const { t } = useTranslation();
  const { setRemovePadding } = usePaddingControl();

  useEffect(() => {
    setRemovePadding(true);
    return () => setRemovePadding(false);
  }, [setRemovePadding]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-primary/5 py-16 md:py-24 border-b border-border/50">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {t("Terms & Conditions")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("Please read these terms carefully before using AppointDI.")}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">1. {t("Agreement to Terms")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("By accessing or using AppointDI, you agree to be bound by these Terms & Conditions and our Privacy Policy. ")}
              {t("AppointDI is a service provided by")} <strong>{t("Company Name")}</strong>, {t("located in")} {t("Company Address")}.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("If you do not agree to all these terms, then you may not access the Service.")}
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">2. {t("Use of Service")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("You are responsible for maintaining the confidentiality of your account and password. You agree to accept ")}
              {t("responsibility for all activities that occur under your account.")}
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">3. {t("Fees and Payments")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring ")}
              {t("and periodic basis. Billing cycles are set either on a monthly or annual basis.")}
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">4. {t("Intellectual Property")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("The Service and its original content, features, and functionality are and will remain the exclusive ")}
              {t("property of AppointDI and its licensors.")}
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">5. {t("Limitation of Liability")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("In no event shall AppointDI, nor its directors, employees, partners, agents, suppliers, or affiliates, ")}
              {t("be liable for any indirect, incidental, special, consequential or punitive damages.")}
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
