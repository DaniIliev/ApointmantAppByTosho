"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { usePaddingControl } from "@/context/PaddingContext";
import { useEffect } from "react";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
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
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {t("Privacy Policy")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("Last updated: May 2026. Your privacy is our top priority.")}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">1. {t("Introduction")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("Welcome to AppointDI. We are committed to protecting your personal information and your right to privacy. ")}
              {t("AppointDI is operated by")} <strong>{t("Company Name")}</strong>, {t("with headquarters in")} {t("Company Address")}.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website ")}
              {t("or use our application. In accordance with GDPR, we act as the")} <strong>{t("Data Controller")}</strong>.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">2. {t("Information We Collect")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("We collect personal information that you voluntarily provide to us when you register on the Services, ")}
              {t("express an interest in obtaining information about us or our products and Services, or otherwise when ")}
              {t("you contact us.")}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>{t("Personal Data: Name, email address, phone number, etc.")}</li>
              <li>{t("Usage Data: IP address, browser type, pages visited.")}</li>
              <li>{t("Business Data: Business name, services, staff details.")}</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">3. {t("How We Use Your Information")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("We use personal information collected via our Services for a variety of business purposes described below. ")}
              {t("We process your personal information for these purposes in reliance on our legitimate business interests, ")}
              {t("in order to enter into or perform a contract with you, with your consent, and/or for compliance with our ")}
              {t("legal obligations.")}
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">4. {t("Data Security")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("We have implemented appropriate technical and organizational security measures designed to protect the ")}
              {t("security of any personal information we process. However, please also remember that we cannot guarantee ")}
              {t("that the internet itself is 100% secure.")}
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">5. {t("Contact Us")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("If you have questions or comments about this policy, you may email us at support@appointdi.com.")}
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
