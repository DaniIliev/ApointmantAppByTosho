"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export interface Location {
  _id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  openingHours: string;
}

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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc) => {
            const isSelected = selectedLocationId === loc._id;
            return (
              <div
                key={loc._id}
                onClick={() => onLocationSelect(loc._id)}
                className={cn(
                  "flex flex-col p-6 rounded-xl border cursor-pointer transition-all duration-300 transform hover:scale-[1.02]",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                    : "border-border bg-white/80 dark:bg-slate-900/60 hover:shadow-lg hover:border-primary/50"
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-text-primary capitalize">
                    {loc.name}
                  </h3>
                  {isSelected && (
                    <span className="bg-primary text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                      {t("Selected")}
                    </span>
                  )}
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-primary/70 shrink-0" />
                    <span>{loc.address}, {loc.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary/70 shrink-0" />
                    <span>{loc.phone}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
