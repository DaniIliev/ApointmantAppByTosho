"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BusinessInfo } from "@/components/sections/business-info";
import { ServicesSection } from "@/components/sections/services-section";
import { StaffSection } from "@/components/sections/staff-section";
import { BusinessMap } from "@/components/sections/business-map";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/context/PageTitleContext";
import { BusinessHeader } from "@/components/sections/business-header";
import callApi from "@/app/Api/callApi";
import Chatbot from "@/components/chatBot/Chatbot";
import { LocationsSection, Location } from "@/components/sections/locations-section";

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
function PublicBusinessPageContent() {
  const params = useParams();
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const { setPageTitle } = usePageTitle();
  const resolvedBusinessId = (params.id as string) || "";

  useEffect(() => {
    setPageTitle(businessData?.businessName || "");
    return () => setPageTitle(null);
  }, [setPageTitle, businessData]);

  useEffect(() => {
    // If we cannot resolve a business id, show an error state.
    if (!resolvedBusinessId) {
      setError(t("No business id provided."));
      setIsLoading(false);
      return;
    }

    const fetchBusinessConfig = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [backendData, locationsData]: [BusinessData, Location[]] = await Promise.all([
          callApi(`/api/business/${resolvedBusinessId}`, "GET"),
          callApi(`/api/locations?businessId=${resolvedBusinessId}`, "GET")
        ]);
        setBusinessData(backendData);
        setLocations(locationsData);
        if (locationsData.length > 0) {
          setSelectedLocationId(locationsData[0]._id);
        }
      } catch (e) {
        console.error("Failed to fetch business configuration:", e);
        setError(t("Failed to load business configuration."));
      } finally {
        setIsLoading(false);
      }
    };
    fetchBusinessConfig();
  }, [resolvedBusinessId, t]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4  text-center text-lg">
        {t("Loading business configuration...")}
      </div>
    );
  }

  if (error || !businessData) {
    return (
      <div className="container mx-auto px-4  text-center text-red-500">
        {t("Error")}: {error || t("No business data available.")}
      </div>
    );
  }

  const selectedLocation = locations.find(l => l._id === selectedLocationId) || locations[0];

  return (
    <div className="container mx-auto px-4 min-h-screen">
      <div className="space-y-10">
        <BusinessHeader business={businessData} />
        <BusinessInfo business={businessData} selectedLocation={selectedLocation} />
        {locations.length > 0 && (
          <LocationsSection 
            locations={locations} 
            selectedLocationId={selectedLocationId}
            onLocationSelect={setSelectedLocationId}
          />
        )}
        <ServicesSection 
          businessId={resolvedBusinessId} 
          locationId={selectedLocationId || undefined} 
        />
        <StaffSection 
          businessId={resolvedBusinessId} 
          locationId={selectedLocationId || undefined} 
        />
        <BusinessMap business={businessData} selectedLocation={selectedLocation} />
      </div>
      <Chatbot businessId={businessData._id} />
    </div>
  );
}

export default function PublicBusinessPage() {
  return <PublicBusinessPageContent />;
}
