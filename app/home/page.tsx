"use client";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import { HeroSection } from "@/components/HeroSection/HeroSection";
import { BenefitsSection } from "@/components/sections/benefits-section";
import { BusinessList } from "@/components/sections/business-list";
import { BusinessOwnerCTA } from "@/components/sections/business-owner-cta";
import { SearchFilters } from "@/components/sections/search-filters";
import { usePaddingControl } from "@/context/PaddingContext";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { setRemovePadding } = usePaddingControl();
  useEffect(() => {
    setRemovePadding(true);
    return () => {
      setRemovePadding(false);
    };
  }, [setRemovePadding]);
  return (
    <div className="min-h-screen">
      <HeroSection />

      {/* Benefits Section */}
      <BenefitsSection type="benefits" />
      <section className="py-16   bg-gray-50 dark:bg-gray-900 ">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center ">
            <h2 className="text-3xl font-bold mb-2 font-sans">
              Popular businesses near you
            </h2>
            <p className="text-muted-foreground">
              Discover highly-rated professionals ready to serve you
            </p>
          </div>
          <BusinessList />
        </div>
      </section>
    </div>
  );
}
