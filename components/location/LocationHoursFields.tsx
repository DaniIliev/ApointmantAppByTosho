"use client";

import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { TimeRangePicker } from "@/components/customUIComponents/TimeRangePicker";
import { LocationOpeningHours, WeeklyWorkingDay } from "@/Global/Types/types";

type DayKey = keyof Omit<LocationOpeningHours, "_id">;

const dayKeys: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

type LocationHoursFieldsProps = {
  locationName: string;
  value: LocationOpeningHours;
  onWorkTimeChange: (
    day: DayKey,
    next: { start: string | null; end: string | null },
  ) => void;
  onDayToggle: (day: DayKey) => void;
};

export default function LocationHoursFields({
  locationName,
  value,
  onWorkTimeChange,
  onDayToggle,
}: LocationHoursFieldsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 text-lg font-bold text-primary">
        <Clock className="h-5 w-5" />
        <span>{locationName}</span>
      </div>
      <div className="rounded-2xl border border-border/50 bg-white p-2 shadow-inner dark:bg-gray-800">
        {dayKeys.map((day) => {
          const dayValue = value[day] as WeeklyWorkingDay;
          return (
            <div
              key={day}
              className={cn(
                "grid grid-cols-1 gap-3 rounded-xl border p-3 md:grid-cols-[160px_minmax(0,1fr)_120px] md:items-center",
                dayValue.isDayOff
                  ? "border-red-100 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10"
                  : "border-green-100 bg-green-50 dark:border-green-500/20 dark:bg-green-500/10",
              )}
            >
              <button
                type="button"
                className="flex items-center justify-between gap-3 text-left"
                onClick={() => onDayToggle(day)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      dayValue.isDayOff ? "bg-red-500" : "bg-green-500",
                    )}
                  />
                  <span className="font-bold capitalize">{t(day)}</span>
                </div>
                <span className="rounded-full border border-current px-2 py-0.5 text-[10px] font-bold uppercase">
                  {dayValue.isDayOff ? t("Off") : t("Work")}
                </span>
              </button>

              <TimeRangePicker
                value={{
                  startTime: dayValue.workTime.start,
                  endTime: dayValue.workTime.end,
                }}
                onChange={({ startTime, endTime }) =>
                  onWorkTimeChange(day, {
                    start: startTime,
                    end: endTime,
                  })
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
