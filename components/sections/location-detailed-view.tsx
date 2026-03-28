"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Clock, MapPin, Phone, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServicesSection } from "@/components/sections/services-section";
import { StaffSection } from "@/components/sections/staff-section";
import { BusinessMap } from "@/components/sections/business-map";
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
  const router = useRouter();
  const { t } = useTranslation();

  const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
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
      <div className="flex items-center justify-between mb-2">
        <Button onClick={() => router.push(backUrl)} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Button>
      </div>

      {/* Header Image */}
      <div className="w-full h-48 md:h-96 rounded-2xl overflow-hidden relative shadow-md">
        <img
          src={location.imageUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"}
          alt={location.name}
          className="w-full h-full object-cover"
        />
        {/* Desktop Overlay Content */}
        <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex-col justify-end p-8">
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
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium border border-white/10 shrink-0">
              <Mail className="h-4 w-4 text-primary" />
              <span>{location.email}</span>
            </div>
          </div>

          {/* Permanent 7-Day Schedule Overlay */}
          <div className="mt-6 grid grid-cols-7 gap-2">
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
                dayHours === t("Не е зададено") ||
                dayHours === "Не е зададено";

              let displayStatus = isDayOff ? t("Day Off") : isNotSet ? t("Not Set") : dayHours;

              return (
                <div
                  key={dayKey}
                  className={cn(
                    "flex flex-col items-center p-2 rounded-xl backdrop-blur-md border border-white/10 transition-all duration-300",
                    isToday 
                      ? "bg-primary/30 border-primary/50 ring-1 ring-primary/30 scale-105 z-10" 
                      : "bg-black/30 opacity-80 hover:bg-black/40"
                  )}
                >
                  <span className={cn(
                    "text-[10px] uppercase font-bold tracking-wider mb-1",
                    isToday ? "text-primary-foreground" : "text-white/60"
                  )}>
                    {dayName.slice(0, 3)}
                  </span>
                  <div className="flex items-center gap-1">
                    {isToday && !isDayOff && !isNotSet && <Clock className="h-3 w-3 text-primary-foreground animate-pulse" />}
                    <span className={cn(
                      "text-[11px] font-medium whitespace-nowrap",
                      isToday ? "text-white font-bold" : "text-white/90",
                      (isDayOff || isNotSet) && !isToday && "text-red-400/80"
                    )}>
                      {displayStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Info Box */}
      <div className="md:hidden mt-4 bg-card rounded-2xl border border-border shadow-sm p-5 space-y-5">
        <div>
          <h2 className="text-2xl font-bold mb-4">{location.name}</h2>
          <div className="flex flex-col gap-3 text-muted-foreground">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm leading-tight">{location.address}, {location.city}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm">{location.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm break-all">{location.email}</span>
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
                dayHours === t("Не е зададено") ||
                dayHours === "Не е зададено";

              let displayStatus = isDayOff ? t("Day Off") : isNotSet ? t("Not Set") : dayHours;

              return (
                <div
                  key={dayKey}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-xl text-sm transition-colors",
                    isToday 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <span className={isToday ? "font-bold" : "font-medium"}>{dayName}</span>
                  <span className={cn(
                    isToday ? "font-bold" : "font-medium",
                    (isDayOff || isNotSet) && !isToday && "text-destructive"
                  )}>{displayStatus}</span>
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
