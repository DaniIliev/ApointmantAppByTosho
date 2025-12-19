"use client";
import { BenefitsSection } from "@/components/sections/benefits-section";
import { BusinessList } from "@/components/sections/business-list";
import { usePaddingControl } from "@/context/PaddingContext";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function HomePage() {
  const { t } = useTranslation();
  const { setRemovePadding } = usePaddingControl();
  useEffect(() => {
    setRemovePadding(true);
    return () => {
      setRemovePadding(false);
    };
  }, [setRemovePadding]);
  return (
    <div className="min-h-screen">
      {/* <HeroSection /> */}

      {/* Benefits Section */}
      <BenefitsSection type="benefits" />
      <section className="py-16 bg-background ">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center ">
            <h2 className="text-3xl font-bold mb-2 font-sans">
              {t("Popular businesses near you")}
            </h2>
            <p className="text-muted-foreground">
              {t("Discover highly-rated professionals ready to serve you")}
            </p>
          </div>
          <BusinessList />
        </div>
      </section>
    </div>
  );
}
