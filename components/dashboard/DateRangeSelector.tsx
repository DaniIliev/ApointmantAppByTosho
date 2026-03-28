"use client";

import React from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useDashboardDate } from "@/context/DashboardDateContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/customUIComponents/DateRangePicker";
import { format } from "date-fns";
import { CustomTooltip } from "../customUIComponents/CustomTooltip";
import { useTranslation } from "react-i18next";

export const DateRangeSelector: React.FC = () => {
  const { dateRange, setDateRange, groupBy, setGroupBy } = useDashboardDate();
  const { t } = useTranslation();
  const parseLocalDate = (value: string): Date | null => {
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;
    const d = new Date(year, month - 1, day);
    return isNaN(d.getTime()) ? null : d;
  };

  const handlePreviousPeriod = () => {
    if (!dateRange.from) return;

    const newFrom = new Date(dateRange.from);
    const newTo = new Date(dateRange.to || dateRange.from);

    const daysOffset = Math.ceil(
      (newTo.getTime() - newFrom.getTime()) / (1000 * 60 * 60 * 24)
    );

    newFrom.setDate(newFrom.getDate() - daysOffset);
    newTo.setDate(newTo.getDate() - daysOffset);

    setDateRange({ from: newFrom, to: newTo });
  };

  const handleNextPeriod = () => {
    if (!dateRange.from) return;

    const newFrom = new Date(dateRange.from);
    const newTo = new Date(dateRange.to || dateRange.from);

    const daysOffset = Math.ceil(
      (newTo.getTime() - newFrom.getTime()) / (1000 * 60 * 60 * 24)
    );

    newFrom.setDate(newFrom.getDate() + daysOffset);
    newTo.setDate(newTo.getDate() + daysOffset);

    setDateRange({ from: newFrom, to: newTo });
  };

  const handleToday = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    setDateRange({ from: startOfWeek, to: endOfWeek });
    setGroupBy("day");
  };

  const handleThisMonth = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    setDateRange({ from: startOfMonth, to: endOfMonth });
    setGroupBy("day");
  };

  const handleThisYear = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31);

    setDateRange({ from: startOfYear, to: endOfYear });
    setGroupBy("month");
  };

  const handleCustomRangeChange = (value: {
    startDate: string | null;
    endDate: string | null;
  }) => {
    const fromDate = value.startDate ? parseLocalDate(value.startDate) : null;
    const toDate = value.endDate ? parseLocalDate(value.endDate) : null;

    // If only start picked, store it so the second click can complete the range
    if (fromDate && !toDate) {
      setDateRange({ from: fromDate, to: undefined });
      return;
    }

    if (fromDate && toDate) {
      setDateRange({ from: fromDate, to: toDate });
    }
  };

  const isSameDay = (a?: Date, b?: Date) => {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const computeIsSelected = () => {
    if (!dateRange.from || !dateRange.to)
      return {
        isThisWeekSelected: false,
        isThisMonthSelected: false,
        isThisYearSelected: false,
      };

    const today = new Date();

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const yearStart = new Date(today.getFullYear(), 0, 1);
    const yearEnd = new Date(today.getFullYear(), 11, 31);

    return {
      isThisWeekSelected:
        isSameDay(dateRange.from, weekStart) &&
        isSameDay(dateRange.to, weekEnd),
      isThisMonthSelected:
        isSameDay(dateRange.from, monthStart) &&
        isSameDay(dateRange.to, monthEnd),
      isThisYearSelected:
        isSameDay(dateRange.from, yearStart) &&
        isSameDay(dateRange.to, yearEnd),
    };
  };

  const { isThisWeekSelected, isThisMonthSelected, isThisYearSelected } =
    computeIsSelected();

  return (
    <div className="relative flex flex-col gap-3 sm:flex-row sm:flex-nowrap sm:items-center bg-card p-4 rounded-lg border ">
      <div className="flex w-full flex-wrap items-center gap-2 sm:flex-nowrap">
        <div className="flex-1 min-w-[220px] sm:flex-initial">
          <DateRangePicker
            value={{
              startDate: dateRange.from
                ? format(dateRange.from, "yyyy-MM-dd")
                : null,
              endDate: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : null,
            }}
            onChange={handleCustomRangeChange}
            renderTrigger={({ rangeLabel }) => (
              <button
                type="button"
                className="flex w-full sm:w-auto items-center justify-between gap-2 px-3 py-2 rounded-md border bg-background hover:border-primary transition-colors text-left"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium truncate">
                    {rangeLabel || "Select date range"}
                  </span>
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground sm:hidden" />
              </button>
            )}
          />
        </div>

        <div className="flex items-center gap-1">
          <CustomTooltip
            onClick={handlePreviousPeriod}
            tooltipText={t("Previous period")}
            icon={<ChevronLeft />}
          />
          <CustomTooltip
            onClick={handleNextPeriod}
            tooltipText={t("Next period")}
            icon={<ChevronRight />}
          />
        </div>
      </div>

      <div className="hidden sm:block w-px h-6 bg-border" />

      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
        <span className="text-xs text-muted-foreground">Grouping:</span>
        <Select
          value={groupBy}
          onValueChange={(value: any) => setGroupBy(value)}
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">By Day</SelectItem>
            <SelectItem value="week">By Week</SelectItem>
            <SelectItem value="month">By Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden sm:block w-px h-6 bg-border" />

      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
        <Button
          variant={isThisWeekSelected ? "default" : "outline"}
          size="sm"
          onClick={handleToday}
          className="text-xs"
        >
          This Week
        </Button>
        <Button
          variant={isThisMonthSelected ? "default" : "outline"}
          size="sm"
          onClick={handleThisMonth}
          className="text-xs"
        >
          This Month
        </Button>
        <Button
          variant={isThisYearSelected ? "default" : "outline"}
          size="sm"
          onClick={handleThisYear}
          className="text-xs"
        >
          This Year
        </Button>
      </div>
    </div>
  );
};
