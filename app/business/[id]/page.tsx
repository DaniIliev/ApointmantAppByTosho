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
import { useParams } from "next/navigation";

export interface BusinessData {
  _id: string;
  owner: string;
  aboutUs: string;
  businessName: string;
  phone: string;
  qrCodeUrl: string;
  address: string;
  addressLine2: string;
  businessImageUrl: string;
  category: string;
  city: string;
  country: string;
  email: string;
  postalCode: string;
  website: string;
  schedule: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

export default function BusinessConfigurationPage() {
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const businessId = params.id as string;
  const { t } = useTranslation();
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle(t("Business Configuration"));
    return () => setPageTitle(null);
  }, [setPageTitle, t]);

  useEffect(() => {
    const fetchBusinessConfig = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const backendData: BusinessData = await callApi(
          `/api/business/${businessId}`,
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

  // 3. Зареждащ екран / Обработка на грешки
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 text-center text-lg">
        Зареждане на бизнес конфигурация...
      </div>
    );
  }

  if (error || !businessData) {
    return (
      <div className="container mx-auto px-4 text-center text-red-500">
        Грешка: {error || "Няма данни за бизнеса."}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 min-h-screen">
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
