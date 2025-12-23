"use client";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export default function ContactHero() {
  const { t } = useTranslation();
  return (
    <section className="bg-gradient-to-br from-primary/90 via-primary/70 to-accent/40 py-10 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/AppointmantPro.png"
            alt="Appointment Scheduling Logo"
            width={120}
            height={120}
            className="mb-8"
            priority
          />
          <h1 className="text-balance text-4xl font-bold tracking-tight text-white lg:text-6xl">
            {t("Get in Touch")}
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-white/90 lg:text-xl">
            {t(
              "Have questions about our appointment scheduling software? We're here to help you streamline your booking process."
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
