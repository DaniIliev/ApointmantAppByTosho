"use client";
import { useTranslation } from "react-i18next";
import { Info, MapPin, Phone, Mail } from "lucide-react";
import { ServicesSection } from "@/components/sections/services-section";
import { StaffSection } from "@/components/sections/staff-section";
import { BusinessMap } from "@/components/sections/business-map";
import { HoverImagePreview } from "@/components/customUIComponents/HoverImagePreview";
import { Location } from "@/Global/Types/types";
import { getTodayDayName } from "@/Global/Utils/commonFn";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LocationDetailedViewProps {
  location: Location;
  businessId: string;
  backUrl: string;
  backLabel: string;
}

export function LocationDetailedView({
  location,
  businessId,
  backUrl: _backUrl,
  backLabel: _backLabel,
}: LocationDetailedViewProps) {
  const { t } = useTranslation();

  const dayKeys = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const dayNames = [
    t("Monday"),
    t("Tuesday"),
    t("Wednesday"),
    t("Thursday"),
    t("Friday"),
    t("Saturday"),
    t("Sunday"),
  ];

  return (
    <div className="w-full">
      {/* Info Card */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row justify-between items-center border-b p-4">
          <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
            <Info className="h-6 w-6 text-primary" />
            {t("Location Information")}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 lg:p-6">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[400px_minmax(0,1fr)_360px]">
            <div className="bg-muted/10 p-2 lg:p-3">
              <HoverImagePreview
                className="h-[250px] w-full sm:h-[300px] xl:h-[320px]"
                imageClassName="object-cover"
                src={
                  typeof location.imageUrl === "string"
                    ? location.imageUrl
                    : null
                }
                fallbackSrc="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
                alt={location.name}
                previewTitle={location.name}
              />
            </div>

            <div className="bg-muted/10 p-2 lg:p-3">
              <h2 className="mb-3 text-xl font-bold leading-tight lg:text-2xl">
                {location.name}
              </h2>
              <div className="flex flex-col gap-3 text-muted-foreground">
                <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-background/80 px-3 py-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm leading-tight break-words">
                    {location.address}, {location.city}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-background/80 px-3 py-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm">{location.phone}</span>
                </div>
                <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-background/80 px-3 py-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm break-all">{location.email}</span>
                </div>
              </div>
            </div>

            <div className="h-full bg-muted/10 p-2 lg:p-3">
              <h3 className="flex items-center gap-2 text-xl font-semibold">
                {t("Working Hours")}
              </h3>
              <div className="grid grid-cols-1 gap-0.5">
                {dayKeys.map((dayKey, index) => {
                  const schedule = location.schedule as any;
                  const dayHours = schedule?.[dayKey];
                  const dayName = dayNames[index];
                  const isToday = dayKey === getTodayDayName();

                  const isDayOff =
                    dayHours === "Day Off" ||
                    dayHours === "Closed" ||
                    dayHours === t("Day Off") ||
                    dayHours === t("Closed");

                  const isNotSet =
                    dayHours === "Not Set" ||
                    dayHours === t("Not Set");

                  const displayStatus = isDayOff
                    ? t("Day Off")
                    : isNotSet
                      ? t("Not Set")
                      : dayHours;

                  return (
                    <div
                      key={dayKey}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors",
                        isToday
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-muted/30 text-muted-foreground hover:bg-muted/50",
                      )}
                    >
                      <span className={isToday ? "font-bold" : "font-medium"}>
                        {dayName}
                      </span>
                      <span
                        className={cn(
                          isToday ? "font-bold" : "font-medium",
                          (isDayOff || isNotSet) &&
                            !isToday &&
                            "text-destructive",
                        )}
                      >
                        {displayStatus}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <div className="mt-8">
        <ServicesSection businessId={businessId} locationId={location._id} />
      </div>

      {/* Staff */}
      <div className="mt-8">
        <StaffSection businessId={businessId} locationId={location._id} />
      </div>

      {/* Map */}
      <div className="pt-8">
        <BusinessMap selectedLocation={location} />
      </div>
    </div>
  );
}
