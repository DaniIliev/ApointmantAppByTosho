"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/context/PageTitleContext";
import { MapPin, Phone, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { ServicesSection } from "@/components/sections/services-section";
import { StaffSection } from "@/components/sections/staff-section";
import callApi from "@/app/Api/callApi";
import { useAuthContext } from "@/context/AuthContext";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { Location } from "@/Global/Types/types";
import { BusinessMap } from "@/components/sections/business-map";

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
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Button onClick={() => router.push("/business/locations")} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("Back to Locations")}
        </Button>
      </div>

      {/* Header Image */}
      <div className="w-full h-64 sm:h-96 rounded-2xl overflow-hidden relative shadow-md">
        <img
          src={location.imageUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"}
          alt={location.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg mb-3">{location.name}</h2>
          <div className="flex flex-wrap items-center gap-4 mt-1 text-white/95">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium border border-white/10">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{location.address}, {location.city}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium border border-white/10">
              <Phone className="h-4 w-4 text-primary" />
              <span>{location.phone}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium border border-white/10">
              <Mail className="h-4 w-4 text-primary" />
              <span>{location.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="mt-8">
        <ServicesSection businessId={businessId || ''} locationId={location._id || ''} />
      </div>

      {/* Staff */}
      <div className="mt-8">
        <StaffSection businessId={businessId || ''} locationId={location._id || ''} />
      </div>

      {/* Map */}
      <div className="pt-8">
        <BusinessMap selectedLocation={location} />
      </div>
    </div>
  );
}

export default function AdminLocationPage() {
  return (
    <ProtectedRoute requiredRoles={["business"]}>
      <AdminLocationPageContent />
    </ProtectedRoute>
  );
}
