"use client";

import { useEffect, useState } from "react";
import { BusinessInfo } from "@/components/sections/business-info";
import { ServicesSection } from "@/components/sections/services-section";
import { StaffSection } from "@/components/sections/staff-section";
import { BusinessMap } from "@/components/sections/business-map";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/context/PageTitleContext";
import { BusinessHeader } from "@/components/sections/business-header";
import callApi from "@/app/Api/callApi";
import { BusinessData } from "../[id]/page";
import { useAuthContext } from "@/context/AuthContext";

export default function OwnerPage() {
  const { user } = useAuthContext();
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle(t("My Public Page"));
    return () => setPageTitle(null);
  }, [setPageTitle, t]);

  useEffect(() => {
    const fetchBusinessConfig = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const backendData: BusinessData = await callApi(
          `/api/business/${user?.businessId}`,
          "GET"
        );

        setBusinessData(backendData);
      } catch (e) {
        console.error("Failed to fetch business configuration:", e);
        setError("Не успяхме да заредим конфигурацията на бизнеса.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessConfig();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-lg">
        Зареждане на бизнес конфигурация...
      </div>
    );
  }

  if (error || !businessData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        Грешка: {error || "Няма данни за бизнеса."}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="space-y-10">
        <BusinessHeader business={businessData} />
        <BusinessInfo business={businessData} />
        <ServicesSection businessId={businessData._id} />
        <StaffSection businessId={businessData._id} />
        <BusinessMap business={businessData} />
      </div>
    </div>
  );
}
