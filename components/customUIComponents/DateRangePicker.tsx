"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  format,
  addMonths,
  isSameDay,
  isSameMonth,
  isAfter,
  isBefore,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import { enUS, bg, de } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type RangeValue = { startDate: string | null; endDate: string | null };

interface DateRangePickerProps {
  value: RangeValue;
  onChange: (val: { startDate: string | null; endDate: string | null }) => void;
  minDate?: Date;
  maxDate?: Date;
  disablePast?: boolean;
  className?: string;
}

// Map i18n language to date-fns locale
function useLocale() {
  const { i18n } = useTranslation();
  return useMemo(() => {
    switch (i18n.language) {
      case "bg":
        return bg;
      case "de":
        return de;
      default:
        return enUS;
    }
  }, [i18n.language]);
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  disablePast,
  className,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [anchorMonth, setAnchorMonth] = useState<Date>(() => {
    const today = new Date();
    if (value.startDate) {
      const d = new Date(value.startDate);
      if (!isNaN(d.getTime())) return d;
    }
    return today;
  });
  const startDate = value.startDate ? new Date(value.startDate) : null;
  const endDate = value.endDate ? new Date(value.endDate) : null;

  const rangeLabel =
    startDate && endDate
      ? `${format(startDate, "MM/dd/yyyy")} – ${format(endDate, "MM/dd/yyyy")}`
      : startDate
      ? `${format(startDate, "MM/dd/yyyy")} – …`
      : t("Select date range");

  const buildMonthDays = useCallback(
    (month: Date) => {
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      const weeks: Date[][] = [];
      let cursor = startOfWeek(start, { locale });
      while (cursor <= end) {
        const weekEnd = endOfWeek(cursor, { locale });
        const weekDays = eachDayOfInterval({ start: cursor, end: weekEnd });
        weeks.push(weekDays);
        cursor = addDaysSafe(weekEnd, 1);
      }
      return weeks;
    },
    [locale]
  );

  function addDaysSafe(date: Date, days: number) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  }

  const leftMonthWeeks = buildMonthDays(anchorMonth);
  const rightMonth = addMonths(anchorMonth, 1);
  const rightMonthWeeks = buildMonthDays(rightMonth);

  const handleDayClick = (day: Date) => {
    if (disablePast && isBefore(day, new Date())) return;
    if (minDate && isBefore(day, minDate)) return;
    if (maxDate && isAfter(day, maxDate)) return;

    // No start yet -> set start only
    if (!startDate) {
      onChange({ startDate: format(day, "yyyy-MM-dd"), endDate: null });
      return;
    }

    // Start chosen, no end yet -> set end (swap if earlier)
    if (startDate && !endDate) {
      if (isBefore(day, startDate)) {
        onChange({
          startDate: format(day, "yyyy-MM-dd"),
          endDate: format(startDate, "yyyy-MM-dd"),
        });
      } else if (isSameDay(day, startDate)) {
        // Same day clicked -> treat as single-day range
        onChange({
          startDate: format(startDate, "yyyy-MM-dd"),
          endDate: format(startDate, "yyyy-MM-dd"),
        });
      } else {
        onChange({
          startDate: format(startDate, "yyyy-MM-dd"),
          endDate: format(day, "yyyy-MM-dd"),
        });
      }
      return;
    }

    // Range already complete -> start a new selection
    if (startDate && endDate) {
      onChange({ startDate: format(day, "yyyy-MM-dd"), endDate: null });
    }
  };

  const inRange = (day: Date) => {
    if (!startDate || !endDate) return false;
    return (
      (isAfter(day, startDate) || isSameDay(day, startDate)) &&
      (isBefore(day, endDate) || isSameDay(day, endDate))
    );
  };

  const renderMonth = (month: Date, weeks: Date[][]) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="text-center font-medium text-sm">
          {format(month, "MMMM yyyy", { locale })}
        </div>
        <div className="grid grid-cols-7 text-xs text-muted-foreground">
          {Array.from({ length: 7 }).map((_, i) => {
            const day = eachDayOfInterval({
              start: startOfWeek(month, { locale }),
              end: endOfWeek(month, { locale }),
            })[i];
            return (
              <div key={i} className="h-6 flex items-center justify-center">
                {format(day, "EEEEE", { locale })}
              </div>
            );
          })}
        </div>
        <div className="flex flex-col gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((day) => {
                const disabled =
                  (disablePast && isBefore(day, new Date())) ||
                  (minDate && isBefore(day, minDate)) ||
                  (maxDate && isAfter(day, maxDate)) ||
                  !isSameMonth(day, month);
                const selectedStart = startDate && isSameDay(day, startDate);
                const selectedEnd = endDate && isSameDay(day, endDate);
                const selected = selectedStart || selectedEnd;
                const between = inRange(day) && !selected;
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    disabled={disabled}
                    className={cn(
                      "relative h-8 text-xs rounded-md flex items-center justify-center transition-colors",
                      disabled && "opacity-30 cursor-not-allowed",
                      between && "bg-primary/30 text-primary-foreground",
                      selected &&
                        "bg-primary text-primary-foreground font-semibold",
                      !selected &&
                        !between &&
                        !disabled &&
                        "hover:bg-primary/20"
                    )}
                  >
                    {format(day, "d")}
                    {selectedStart &&
                      endDate &&
                      !isSameDay(startDate!, endDate) && (
                        <span className="absolute inset-y-0 right-0 w-1 rounded-r-md bg-primary" />
                      )}
                    {selectedEnd &&
                      startDate &&
                      !isSameDay(startDate, endDate!) && (
                        <span className="absolute inset-y-0 left-0 w-1 rounded-l-md bg-primary" />
                      )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "w-full h-12 px-4 rounded-md border border-input flex items-center justify-between text-sm bg-background hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            className
          )}
        >
          <span
            className={cn(
              !startDate || !endDate ? "text-muted-foreground" : undefined
            )}
          >
            {rangeLabel}
          </span>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </button>
      </Popover.Trigger>
      <Popover.Content
        sideOffset={8}
        className="rounded-xl border border-border bg-popover p-4 shadow-xl w-[560px]"
        align="start"
      >
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-primary/20"
            onClick={() => setAnchorMonth(addMonths(anchorMonth, -1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-2 text-xs text-muted-foreground">
            {startDate && endDate && (
              <span>
                {t("Start date")}: {format(startDate, "MMM d", { locale })} ·{" "}
                {t("End date")}: {format(endDate, "MMM d", { locale })}
              </span>
            )}
          </div>
          <div className="flex gap-1">
            {startDate && (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    startDate: format(new Date(), "yyyy-MM-dd"),
                    endDate: null,
                  })
                }
                className="px-2 h-8 text-xs rounded-md border border-input hover:bg-accent"
              >
                {t("Today")}
              </button>
            )}
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => onChange({ startDate: null, endDate: null })}
                className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-red-500/10"
                aria-label={t("Clear") as string}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-primary/20"
            onClick={() => setAnchorMonth(addMonths(anchorMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {renderMonth(anchorMonth, leftMonthWeeks)}
          {renderMonth(rightMonth, rightMonthWeeks)}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-3 py-2 text-xs rounded-md border border-input hover:bg-accent"
          >
            {t("Close")}
          </button>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
};
