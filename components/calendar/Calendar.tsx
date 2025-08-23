'use client"';
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Appointment, AppointmentStatus } from "@/Global/Types/types";
import {
  getMonthDates,
  getWeekDates,
  monthNames,
} from "@/Global/Utils/commonFn";

interface CalendarProps {
  appointments: Appointment[];
  getStatusColor: (status: AppointmentStatus) => string;
  onOpenAppointmentModal: (appointment: Appointment) => void;
}

export default function Calendar({
  appointments,
  getStatusColor,
  onOpenAppointmentModal,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<"week" | "month">("week");
  const [dateInput, setDateInput] = useState("");

  const getAppointmentsForDate = (date: Date) =>
    appointments.filter((apt) => apt.date === date.toISOString().split("T")[0]);

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === "next" ? 7 : -7));
      return newDate;
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  const navigateToDate = () => {
    if (!dateInput) return;
    const newDate = new Date(dateInput);
    if (!isNaN(newDate.getTime())) {
      setCurrentDate(newDate);
      setDateInput("");
    }
  };

  return (
    <Card className="border-2 shadow-2xl bg-card/70 backdrop-blur-lg border-primary/20 mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {calendarView === "week"
              ? `Week of ${
                  monthNames[getWeekDates(currentDate)[0].getMonth()]
                } ${getWeekDates(currentDate)[0].getDate()}, ${getWeekDates(
                  currentDate
                )[0].getFullYear()}`
              : `${
                  monthNames[currentDate.getMonth()]
                } ${currentDate.getFullYear()}`}
          </h2>
          <div className="flex gap-2 items-center">
            <div className="flex gap-2">
              <Button
                variant={calendarView === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setCalendarView("week")}
              >
                Week
              </Button>
              <Button
                variant={calendarView === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setCalendarView("month")}
              >
                Month
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="h-10 text-sm border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
              />
              <Button variant="outline" size="sm" onClick={navigateToDate}>
                Go
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                calendarView === "week"
                  ? navigateWeek("prev")
                  : navigateMonth("prev")
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                calendarView === "week"
                  ? navigateWeek("next")
                  : navigateMonth("next")
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {calendarView === "week" ? (
          <div className="grid grid-cols-7 gap-4">
            {getWeekDates(currentDate).map((date, index) => {
              const dayAppointments = getAppointmentsForDate(date);
              const isToday = new Date().toDateString() === date.toDateString();
              const dayNames = [
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ];
              return (
                <div key={index} className="space-y-2">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-muted-foreground">
                      {dayNames[index]}
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        isToday ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {date.getDate()}
                    </div>
                  </div>
                  <div
                    className={`min-h-[200px] p-3 border-2 rounded-lg bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all duration-200 ${
                      isToday
                        ? "ring-2 ring-primary border-primary/30"
                        : "border-primary/10"
                    }`}
                  >
                    <div className="space-y-2">
                      {dayAppointments.length ? (
                        dayAppointments.map((apt) => (
                          <div
                            key={apt.id}
                            onClick={() => onOpenAppointmentModal(apt)}
                            className={`text-xs p-2 rounded cursor-pointer hover:scale-105 transition-transform ${getStatusColor(
                              apt.status
                            )}`}
                          >
                            <div className="font-medium">{apt.time}</div>
                            <div className="truncate">{apt.clientName}</div>
                            <div className="truncate opacity-80">
                              {apt.service}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          No appointments
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {getMonthDates(currentDate).map((date, index) => {
              const dayAppointments = getAppointmentsForDate(date);
              const isToday = new Date().toDateString() === date.toDateString();
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              return (
                <div
                  key={index}
                  className={`min-h-[140px] p-2 border rounded-lg bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all duration-200 ${
                    isToday
                      ? "ring-2 ring-primary border-primary/30"
                      : "border-primary/10"
                  } ${!isCurrentMonth ? "opacity-40" : ""}`}
                >
                  <div
                    className={`text-sm font-semibold mb-2 ${
                      isToday
                        ? "text-primary"
                        : isCurrentMonth
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayAppointments.length
                      ? dayAppointments.map((apt) => (
                          <div
                            key={apt.id}
                            onClick={() => onOpenAppointmentModal(apt)}
                            className={`text-xs p-1 rounded cursor-pointer hover:scale-105 transition-transform ${getStatusColor(
                              apt.status
                            )}`}
                          >
                            <div className="font-medium truncate">
                              {apt.time}
                            </div>
                            <div className="truncate">{apt.clientName}</div>
                          </div>
                        ))
                      : isCurrentMonth && (
                          <div className="text-xs text-muted-foreground text-center py-2 opacity-50">
                            No appointments
                          </div>
                        )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
