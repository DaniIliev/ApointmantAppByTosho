"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/context/PageTitleContext";
import { BusinessHeader } from "@/components/sections/business-header";
import Chatbot from "@/components/chatBot/Chatbot";
import callApi from "@/app/Api/callApi";
import { useRouter } from "next/navigation";
import { LocationsSection } from "@/components/sections/locations-section";
import { Business, Location } from "@/Global/Types/types";

function PublicBusinessPageContent() {
  const params = useParams();
  const [businessData, setBusinessData] = useState<Business | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
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
        const [backendData, locationsData]: [Business, Location[]] = await Promise.all([
          callApi(`/api/business/${resolvedBusinessId}`, "GET"),
          callApi(`/api/locations?businessId=${resolvedBusinessId}`, "GET")
        ]);
        setBusinessData(backendData);
        setLocations(locationsData);
        if (locationsData.length > 0) {
          setSelectedLocationId(locationsData[0]?._id || "");
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
    <div >
      <div className="space-y-10">
        <BusinessHeader business={businessData} />
        {locations.length > 0 && (
          <LocationsSection 
            locations={locations} 
            selectedLocationId={selectedLocationId}
            onLocationSelect={(id) => {
              router.push(`/business/${resolvedBusinessId}/location/${id}`);
            }}
          />
        )}

      </div>
      <Chatbot businessId={businessData._id} />
    </div>
  );
}

export default function PublicBusinessPage() {
  return <PublicBusinessPageContent />;
}
