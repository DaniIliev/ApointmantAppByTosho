"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { DayKey, dayKeys } from "../utils";

interface DaySelectorProps {
  selectedDays: DayKey[];
  onChange: (days: DayKey[]) => void;
  disabledDays?: DayKey[];
  error?: boolean;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDays,
  onChange,
  disabledDays = [],
  error,
}) => {
  const { t } = useTranslation();

  const dayLabels: Record<DayKey, string> = {
    monday: "M",
    tuesday: "T",
    wednesday: "W",
    thursday: "T",
    friday: "F",
    saturday: "S",
    sunday: "S",
  };

  const toggleDay = (day: DayKey) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      onChange([...selectedDays, day]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {dayKeys.map((day) => {
        const isSelected = selectedDays.includes(day);
        const isDisabled = disabledDays.includes(day) && !isSelected;

        return (
          <button
            key={day}
            type="button"
            disabled={isDisabled}
            onClick={() => toggleDay(day)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all shadow-sm",
              isSelected
                ? "bg-primary text-primary-foreground scale-110 shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
              isDisabled && "opacity-30 cursor-not-allowed",
              error && !isSelected && "border-2 border-red-500",
            )}
            title={t(day.charAt(0).toUpperCase() + day.slice(1))}
          >
            {dayLabels[day]}
          </button>
        );
      })}
    </div>
  );
};
