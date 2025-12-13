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
  renderTrigger?: (args: {
    open: boolean;
    rangeLabel: string | null;
    startDate: Date | null;
    endDate: Date | null;
    clear: () => void;
  }) => React.ReactNode;
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
  renderTrigger,
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
  const clearSelection = () => onChange({ startDate: null, endDate: null });

  const rangeLabel =
    startDate && endDate
      ? `${format(startDate, "MMM d, yyyy")} – ${format(
          endDate,
          "MMM d, yyyy"
        )}`
      : startDate
      ? `${format(startDate, "MMM d, yyyy")} – …`
      : null;

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
      {renderTrigger ? (
        <Popover.Trigger asChild>
          {renderTrigger({
            open,
            rangeLabel,
            startDate,
            endDate,
            clear: clearSelection,
          })}
        </Popover.Trigger>
      ) : (
        <div className="relative group/labeled-input w-full">
          {/* Floating label */}
          <label
            className={cn(
              "absolute left-4 transition-all duration-300 transform pointer-events-none z-10",
              open || startDate || endDate ? "text-primary" : "text-gray-500",
              open || startDate || endDate
                ? "-top-0.5 text-xs"
                : "top-1/2 -translate-y-1/2 text-sm"
            )}
          >
            {t("Select date range")}
          </label>
          <Popover.Trigger
            className={cn(
              "peer w-full h-12 px-4 rounded-t-md border-b-2 border-transparent bg-card/80 focus:bg-card/90 transition-all duration-300 flex items-center justify-between text-sm outline-none placeholder-transparent focus:placeholder-gray-400 pr-8",
              open ? "border-primary" : "border-transparent",
              className
            )}
          >
            <span
              className={cn(
                !startDate || !endDate
                  ? "text-muted-foreground"
                  : "text-foreground"
              )}
            >
              {rangeLabel}
            </span>
            {/* Clear control (avoid nested button inside trigger) */}
            {(startDate || endDate) && (
              <span
                role="button"
                aria-label={t("Clear") as string}
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="absolute right-8 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full text-muted-foreground hover:text-primary/80 flex items-center justify-center z-20 cursor-pointer"
                tabIndex={-1}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </span>
            )}
            <CalendarIcon className="h-4 w-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2" />
            <span
              className={cn(
                "absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300",
                open || startDate || endDate ? "w-full" : "w-0"
              )}
            />
          </Popover.Trigger>
        </div>
      )}
      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          className="rounded-xl border border-border bg-popover p-4 shadow-xl w-full max-w-[360px] sm:max-w-[560px] z-[40000]"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
      </Popover.Portal>
    </Popover.Root>
  );
};
