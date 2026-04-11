"use client";
import { useTranslation } from "react-i18next";
import { Clock, MapPin, Phone, Mail } from "lucide-react";
import { ServicesSection } from "@/components/sections/services-section";
import { StaffSection } from "@/components/sections/staff-section";
import { BusinessMap } from "@/components/sections/business-map";
import { HoverImagePreview } from "@/components/customUIComponents/HoverImagePreview";
import { Location } from "@/Global/Types/types";
import { getTodayDayName } from "@/Global/Utils/commonFn";
import { cn } from "@/lib/utils";

interface LocationDetailedViewProps {
  location: Location;
  businessId: string;
  backUrl: string;
  backLabel: string;
}

export function LocationDetailedView({
  location,
  businessId,
  backUrl,
  backLabel,
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
      {/* Mobile Info Box */}
      <div className="mt-4 bg-card rounded-2xl border border-border shadow-sm p-5 space-y-5">
        <div className="flex gap-4">
          <HoverImagePreview
            className="w-28 h-28 shrink-0"
            src={
              typeof location.imageUrl === "string" ? location.imageUrl : null
            }
            fallbackSrc="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
            alt={location.name}
            previewTitle={location.name}
          />

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold mb-3 leading-tight">
              {location.name}
            </h2>
            <div className="flex flex-col gap-2.5 text-muted-foreground">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm leading-tight break-words">
                  {location.address}, {location.city}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm">{location.phone}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm break-all">{location.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {t("Working Hours")}
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {dayKeys.map((dayKey, index) => {
              const schedule = location.schedule as any;
              const dayHours = schedule?.[dayKey];
              const dayName = dayNames[index];
              const isToday = dayKey === getTodayDayName();

              const isDayOff =
                dayHours === t("Почивен Ден") ||
                dayHours === t("Затворено") ||
                dayHours === "Почивен Ден" ||
                dayHours === "Затворено";

              const isNotSet =
                dayHours === t("Не е зададено") || dayHours === "Не е зададено";

              let displayStatus = isDayOff
                ? t("Day Off")
                : isNotSet
                  ? t("Not Set")
                  : dayHours;

              return (
                <div
                  key={dayKey}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-xl text-sm transition-colors",
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
                      (isDayOff || isNotSet) && !isToday && "text-destructive",
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
