"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/context/PageTitleContext";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import callApi from "@/app/Api/callApi";
import { Business, Location } from "@/Global/Types/types";
import { LocationDetailedView } from "@/components/sections/location-detailed-view";

function PublicLocationPageContent() {
  const { id, locationId } = useParams();
  const { t } = useTranslation();
  const { setPageTitle } = usePageTitle();
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const resolvedBusinessId = (id as string) || "";

  useEffect(() => {
    if (location?.name) {
      setPageTitle(location.name);
    }
    return () => setPageTitle(null);
  }, [setPageTitle, location]);

  useEffect(() => {
    const fetchData = async () => {
      if (!locationId || !resolvedBusinessId) return;
      setIsLoading(true);
      setError(null);
      try {
        const locationRes = await callApi(`/api/locations/${locationId}`, "GET");
        setLocation(locationRes);
      } catch (err) {
        console.error(err);
        setError(t("Failed to load details."));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [locationId, resolvedBusinessId, t]);

  if (isLoading) {
    return <div className="p-8 text-center text-lg">{t("Loading location details...")}</div>;
  }

  if (error || !location) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error || t("Location not found.")}</p>
        <Button onClick={() => window.history.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("Back")}
        </Button>
      </div>
    );
  }

  return (
    <LocationDetailedView
      location={location}
      businessId={resolvedBusinessId}
      backUrl={`/business/${resolvedBusinessId}`}
      backLabel={t("Back to Business")}
    />
  );
}

export default function PublicLocationPage() {
  return <PublicLocationPageContent />;
}
