"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { usePaddingControl } from "@/context/PaddingContext";
import { useEffect } from "react";
import { Cookie } from "lucide-react";

export default function CookiesPage() {
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
            <Cookie className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {t("Cookie Policy")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("This policy explains how we use cookies and similar technologies.")}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">1. {t("What are Cookies?")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("Cookies are small text files that are placed on your computer or mobile device when you visit a website. ")}
              {t("They are widely used to make websites work, or work more efficiently, as well as to provide reporting ")}
              {t("information and personalize your experience.")}
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">2. {t("How We Use Cookies")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("We use first-party and third-party cookies for several reasons. Some cookies are required for technical ")}
              {t("reasons in order for our Services to operate, and we refer to these as \"essential\" or \"strictly necessary\" ")}
              {t("cookies.")}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>{t("Essential Cookies")}</strong>: {t("Necessary for core functionality (login, security).")}</li>
              <li><strong>{t("Performance Cookies")}</strong>: {t("Help us understand how visitors use our site.")}</li>
              <li><strong>{t("Functionality Cookies")}</strong>: {t("Remember your preferences (language, theme).")}</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">3. {t("Managing Cookies")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, ")} 
              {t("you may still use our website though your access to some functionality and areas of our website may be ")} 
              {t("restricted.")}
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">4. {t("Updates to this Policy")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies ")}
              {t("we use or for other operational, legal or regulatory reasons.")}
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
