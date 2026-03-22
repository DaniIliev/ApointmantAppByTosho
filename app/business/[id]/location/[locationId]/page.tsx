"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/context/PageTitleContext";
import { Clock, MapPin, Phone, ArrowLeft, Mail, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServicesSection } from "@/components/sections/services-section";
import { StaffSection } from "@/components/sections/staff-section";
import callApi from "@/app/Api/callApi";
import { BusinessMap } from "@/components/sections/business-map";
import { Business, Location } from "@/Global/Types/types";
import { getTodayDayName } from "@/Global/Utils/commonFn";
import { cn } from "@/lib/utils";

function PublicLocationPageContent() {
  const { id, locationId } = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { setPageTitle } = usePageTitle();
  const [location, setLocation] = useState<Location | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const resolvedBusinessId = (id as string) || "";

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
        const [locationRes, businessRes] = await Promise.all([
          callApi(`/api/locations/${locationId}`, "GET"),
          callApi(`/api/business/${resolvedBusinessId}`, "GET")
        ]);
        setLocation(locationRes);
        setBusiness(businessRes);
      } catch (err) {
        console.error(err);
        setError(t("Failed to load details."));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [locationId, resolvedBusinessId, t]);

  const getTodayHours = () => {
    if (!location?.schedule) return null;
    const todayKey = getTodayDayName();
    const schedule = location.schedule;
    
    if (typeof schedule === "string") return schedule;
    
    const dayHours = (schedule as any)[todayKey];
    if (!dayHours) return null;

    const isDayOff =
      dayHours === t("Почивен Ден") ||
      dayHours === t("Затворено") ||
      dayHours === "Почивен Ден" ||
      dayHours === "Затворено";
    
    const isNotSet =
      dayHours === t("Не е зададено") ||
      dayHours === "Не е зададено";

    if (isDayOff) return t("Day Off");
    if (isNotSet) return t("Not Set");
    
    return dayHours;
  };

  if (isLoading) {
    return <div className="p-8 text-center text-lg">{t("Loading location details...")}</div>;
  }

  if (error || !location) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error || t("Location not found.")}</p>
        <Button onClick={() => router.push(`/business/${resolvedBusinessId}`)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("Back to Business")}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <Button onClick={() => router.push(`/business/${resolvedBusinessId}`)} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("Back to Business")}
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
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium border border-white/10 shrink-0">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>{location.email}</span>
                </div>
              </div>

              {/* Permanent 7-Day Schedule Overlay */}
              <div className="mt-6 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
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

          {/* Services */}
          <div className="mt-8">
            <ServicesSection businessId={resolvedBusinessId} locationId={location._id} />
          </div>

          {/* Staff */}
          <div className="mt-8">
            <StaffSection businessId={resolvedBusinessId} locationId={location._id} />
          </div>

          {/* Map */}
          <div className="pt-8">
            <BusinessMap selectedLocation={location} />
          </div>
    </div>
  );
}

export default function PublicLocationPage() {
  return <PublicLocationPageContent />;
}
