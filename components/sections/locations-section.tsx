"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Location } from "@/Global/Types/types";
import { LocationCard } from "@/components/business/LocationCard";

interface LocationsSectionProps {
  locations: Location[];
  selectedLocationId: string | null;
  onLocationSelect: (id: string) => void;
}

export function LocationsSection({
  locations,
  selectedLocationId,
  onLocationSelect,
}: LocationsSectionProps) {
  const { t } = useTranslation();

  if (locations.length <= 1 && !selectedLocationId) {
    // If only one location, we might want to skip the selection but still show info
    // However, for the booking flow, selecting it helps filter.
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center pb-4 border-b">
        <MapPin className="h-6 w-6 text-primary mr-2" />
        <CardTitle className="font-bold text-2xl font-sans text-primary">
          {t("Our Locations")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {locations.map((loc) => (
            <LocationCard
              key={loc._id}
              location={loc}
              isSelected={selectedLocationId === loc._id}
              onClick={() => onLocationSelect(loc._id || "")}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
