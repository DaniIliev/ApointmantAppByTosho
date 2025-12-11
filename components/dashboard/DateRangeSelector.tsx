"use client";

import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useDashboardDate,
  type DateRange,
} from "@/context/DashboardDateContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const DateRangeSelector: React.FC = () => {
  const { dateRange, setDateRange, groupBy, setGroupBy } = useDashboardDate();
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date | undefined): string => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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

  return (
    <div className="flex items-center gap-3 bg-card p-4 rounded-lg border">
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm font-medium">
          {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePreviousPeriod}
          className="w-8 h-8 p-0"
          title="Previous period"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextPeriod}
          className="w-8 h-8 p-0"
          title="Next period"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-border" />

      <div className="flex items-center gap-2">
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

      <div className="w-px h-6 bg-border" />

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="text-xs"
        >
          This Week
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleThisMonth}
          className="text-xs"
        >
          This Month
        </Button>
        <Button
          variant="outline"
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
