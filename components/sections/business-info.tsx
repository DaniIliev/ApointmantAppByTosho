"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Info, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BusinessData } from "@/app/business/[id]/page";
import { getTodayDayName } from "@/Global/Utils/commonFn";

import { Location } from "./locations-section";

interface BusinessInfoProps {
  business: BusinessData;
  selectedLocation?: Location;
}

export function BusinessInfo({ business, selectedLocation }: BusinessInfoProps) {
  const { t } = useTranslation();

  // Day keys in English (matching backend keys)
  const dayKeys = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  // Translated day names for display
  const dayNames = [
    t("Monday"),
    t("Tuesday"),
    t("Wednesday"),
    t("Thursday"),
    t("Friday"),
    t("Saturday"),
    t("Sunday"),
  ];

  const todayKey = getTodayDayName();
  
  // Use business schedule as fallback if no location-specific logic is implemented yet
  const schedule = business.schedule;
  const isScheduleObject = typeof schedule === "object" && schedule !== null;
  const isScheduleString = typeof schedule === "string" && schedule !== "";

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center space-x-2 p-4 border-b">
          <Info className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl font-bold tracking-tight text-primary">
            {t("About us")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-muted-foreground whitespace-pre-wrap text-base leading-relaxed">
            {business.aboutUs || t("No description available.")}
          </p>
        </CardContent>
      </Card>

      {/* Hours Section - Takes 1 column */}
      <Card>
        <CardHeader className={`p-4 border-b `}>
          <div className="flex items-center space-x-2">
            <Clock className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold tracking-tight text-primary">
              {t("Working Hours")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 pb-4">
          <div className="space-y-3">
            {!isScheduleObject && !isScheduleString && (
              <div className="flex items-center space-x-2 text-center py-4 bg-muted/50 rounded-lg">
                <XCircle className="h-5 w-5 text-red-500 ml-4" />
                <span className="font-semibold text-muted-foreground">
                  {schedule as any}
                </span>
              </div>
            )}

            {isScheduleString && (
              <div className="flex items-center space-x-2 py-4 bg-muted/50 rounded-lg">
                <Clock className="h-5 w-5 text-primary ml-4 shrink-0" />
                <span className="font-medium text-foreground">
                  {schedule as string}
                </span>
              </div>
            )}

            {isScheduleObject &&
              dayKeys.map((dayKey, index) => {
                // Get daily hours from schedule using English key
                const dayHours = (schedule as any)[dayKey];
                const dayName = dayNames[index]; // Get translated day name
                const isToday = dayKey === todayKey;
                const isDayOff =
                  dayHours === t("Почивен Ден") ||
                  dayHours === t("Затворено") ||
                  dayHours === "Почивен Ден" ||
                  dayHours === "Затворено";
                const isNotSet =
                  dayHours === t("Не е зададено") ||
                  dayHours === "Не е зададено";

                // Determine display status (e.g., "08:00-17:00" or "Day Off")
                let displayStatus;
                if (isDayOff) {
                  displayStatus = t("Day Off"); // Display translated 'Day Off'
                } else if (isNotSet) {
                  displayStatus = t("Not Set"); // Display translated 'Not Set'
                } else {
                  displayStatus = dayHours; // Display raw time string e.g., "08:00-17:00"
                }

                // Determine styling based on status
                const statusClass =
                  isDayOff || isNotSet
                    ? "text-red-500 font-semibold"
                    : "text-foreground font-medium";

                return (
                  <div
                    key={dayKey}
                    className={`flex justify-between items-center py-1 border-b border-border/50 last:border-b-0 transition-colors ${
                      isToday
                        ? "font-bold text-foreground bg-primary/5 rounded-md px-2 -mx-2 shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    {/* Day Name (Translated) */}
                    <span className="text-base">{dayName}</span>

                    <div className={`flex items-center gap-2 ${statusClass}`}>
                      {isToday && (isDayOff || isNotSet) && (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      {isToday && !isDayOff && !isNotSet && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}

                      <span>{displayStatus}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
