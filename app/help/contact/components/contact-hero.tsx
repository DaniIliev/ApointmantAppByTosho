"use client";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export default function ContactHero() {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary/70 to-accent/40 py-16 lg:py-32">
      {/* Decorative background blurs for a premium feel */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-500 items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 backdrop-blur-md shadow-xl transition-transform hover:scale-105 hover:bg-white/20">
            <span className="theme-logo-mask !h-5 !w-5 !bg-white !bg-[image:none]" aria-hidden="true" />
            <span className="sr-only" suppressHydrationWarning>{t("AppointDI")}</span>
            <span className="text-sm font-black tracking-[0.2em] text-white drop-shadow-sm" suppressHydrationWarning>
              {t("AppointDI")}
            </span>
          </div>

          <h1 className="mb-6 text-balance text-2xl font-semibold tracking-tight text-white drop-shadow-md sm:text-5xl lg:text-7xl animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
            {t("Get in Touch")}
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-lg font-medium leading-relaxed text-white/90 drop-shadow-sm lg:text-xl animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
            {t(
              "Have questions about our appointment scheduling software? We're here to help you streamline your booking process."
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
