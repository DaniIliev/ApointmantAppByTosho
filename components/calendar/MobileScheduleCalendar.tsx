"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Coffee,
  Home,
  Sun,
  Edit,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/customUIComponents/Modal";
import { WorkHours } from "../calendar/ScheduleCalendarView";

interface MobileScheduleCalendarProps {
  dailyData: WorkHours[];
  onEditDay: (dayData: WorkHours) => void;
}

export default function MobileScheduleCalendar({
  dailyData,
  onEditDay,
}: MobileScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<WorkHours | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Get all days in current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Create a map of dates to work data
  const workDataMap = useMemo(() => {
    const map = new Map<string, WorkHours>();
    dailyData.forEach((day) => {
      const dateKey = format(day.date, "yyyy-MM-dd");
      map.set(dateKey, day);
    });
    return map;
  }, [dailyData]);

  // Navigation
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Day click handler
  const handleDayClick = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const dayData = workDataMap.get(dateKey);

    if (dayData) {
      setSelectedDay(dayData);
      setIsViewModalOpen(true);
    }
  };

  // Handle edit from view modal
  const handleEditFromModal = () => {
    if (selectedDay) {
      setIsViewModalOpen(false);
      onEditDay(selectedDay);
    }
  };

  // Get padding days for calendar grid
  const firstDayOfWeek = getDay(monthStart); // 0 = Sunday
  const paddingDays = Array(firstDayOfWeek).fill(null);

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="p-2 space-y-2">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevMonth}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-bold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="h-8 w-8"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-xs font-semibold text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Padding days */}
        {paddingDays.map((_, index) => (
          <div key={`padding-${index}`} className="aspect-square" />
        ))}

        {/* Actual days */}
        {daysInMonth.map((date) => {
          const dateKey = format(date, "yyyy-MM-dd");
          const dayData = workDataMap.get(dateKey);
          const isToday = isSameDay(date, new Date());
          const isDayOff = dayData?.isDayOff ?? true;

          return (
            <button
              key={dateKey}
              onClick={() => handleDayClick(date)}
              className={`
                aspect-square p-1 rounded-lg border-2 text-sm font-medium
                transition-all duration-200
                ${
                  isToday
                    ? "ring-2 ring-primary border-primary"
                    : "border-border"
                }
                ${
                  !dayData
                    ? "bg-muted/30 text-muted-foreground cursor-default"
                    : isDayOff
                    ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-900/30"
                    : "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 hover:bg-green-100 dark:hover:bg-green-900/30"
                }
                ${dayData && "active:scale-95"}
              `}
              disabled={!dayData}
            >
              <div className="flex flex-col items-center justify-center h-full gap-0.5">
                <span className={isToday ? "text-primary font-bold" : ""}>
                  {format(date, "d")}
                </span>
                {dayData && (
                  <div className="text-[10px]">
                    {isDayOff ? (
                      <Sun className="h-3 w-3 text-red-500" />
                    ) : (
                      <Clock className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* View Modal */}
      <Modal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        label={
          selectedDay
            ? format(selectedDay.date, "EEEE, MMMM d, yyyy")
            : "Day Details"
        }
        width="lg"
      >
        {selectedDay && (
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  selectedDay.isDayOff
                    ? "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                    : "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                }`}
              >
                {selectedDay.isDayOff ? (
                  <>
                    <Home className="h-5 w-5" />
                    <span className="font-semibold">Day Off</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5" />
                    <span className="font-semibold">Working Day</span>
                  </>
                )}
              </div>
            </div>

            {/* Work Hours */}
            {!selectedDay.isDayOff && selectedDay.workTime && (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg text-primary">Work Hours</p>
                    <p className="text-text-primary/40 text-lg font-bold">
                      {selectedDay.workTime.start} - {selectedDay.workTime.end}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Breaks */}
            {!selectedDay.isDayOff && selectedDay.breaks.length > 0 && (
              <div className="space-y-2">
                <div className="text-primary flex items-center gap-2 text-sm font-semibold">
                  <Coffee className="h-4 w-4" />
                  <span>Breaks ({selectedDay.breaks.length})</span>
                </div>
                <div className="space-y-2">
                  {selectedDay.breaks.map((breakTime, index) => (
                    <Card
                      key={index}
                      className="p-3 text-text-primary/40 bg-white dark:bg-primary/10 border-primary/20"
                    >
                      <p className="text-sm font-medium">
                        Break {index + 1}: {breakTime.start} - {breakTime.end}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Day Off Message */}
            {selectedDay.isDayOff && (
              <Card className="p-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                  <Home className="h-12 w-12 text-red-500" />
                  <p className="text-lg font-semibold text-red-700 dark:text-red-400">
                    This is a day off
                  </p>
                  <p className="text-sm text-muted-foreground">
                    No work scheduled for this day
                  </p>
                </div>
              </Card>
            )}

            {/* Edit Button */}
            <div className="flex justify-center">
              <Button onClick={handleEditFromModal} iconType="edit" size="lg">
                Edit Schedule
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
