"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/context/PageTitleContext";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import callApi from "@/app/Api/callApi";
import { useAuthContext } from "@/context/AuthContext";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { Location } from "@/Global/Types/types";
import { LocationDetailedView } from "@/components/sections/location-detailed-view";

function AdminLocationPageContent() {
  const { locationId } = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { setPageTitle } = usePageTitle();
  const { user } = useAuthContext();
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (location?.name) {
      setPageTitle(location.name);
    }
    return () => setPageTitle(null);
  }, [setPageTitle, location]);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!locationId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await callApi(`/api/locations/${locationId}`, "GET");
        setLocation(data);
      } catch (err) {
        console.error(err);
        setError(t("Failed to load location details."));
      } finally {
        setIsLoading(false);
      }
    };
    fetchLocation();
  }, [locationId, t]);

  if (isLoading) {
    return <div className="p-8 text-center text-lg">{t("Loading location details...")}</div>;
  }

  if (error || !location) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error || t("Location not found.")}</p>
        <Button onClick={() => router.push("/business/locations")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("Back to Locations")}
        </Button>
      </div>
    );
  }

  const businessId = user?.businessId || location.businessId;

  return (
    <LocationDetailedView
      location={location}
      businessId={businessId as string || ""}
      backUrl="/business/locations"
      backLabel={t("Back to Locations")}
    />
  );
}

export default function AdminLocationPage() {
  return (
    <ProtectedRoute requiredRoles={["business"]}>
      <AdminLocationPageContent />
    </ProtectedRoute>
  );
}
