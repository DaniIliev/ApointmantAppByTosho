"use client";
import { useTranslation } from "react-i18next";

export default function ContactHero() {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden py-12 isolate">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/15 via-background to-background" />
      <div className="absolute inset-0 -z-10 opacity-60 [background-image:radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.2)_1px,transparent_0)] [background-size:24px_24px]" />
      <div className="absolute -left-16 top-0 -z-10 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute right-0 top-20 -z-10 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 -z-10 h-48 w-[40rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center relative">
          <div className="absolute left-1/2 top-0 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-white/60 blur-3xl dark:bg-white/10" />

          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/80 px-4 py-2 shadow-sm backdrop-blur">
            <span className="theme-logo-mask" aria-hidden="true" />
            <span className="text-sm font-semibold text-primary">
              {t("Contact Us")}
            </span>
          </div>

          {/* Heading */}
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-text-primary sm:text-5xl md:text-5xl leading-tight">
            {t("Get in Touch")}
          </h1>

          {/* Description */}
          <p className="mx-auto max-w-2xl text-base text-muted-foreground leading-relaxed">
            {t(
              "Have questions about our appointment scheduling software? We're here to help you streamline your booking process."
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
