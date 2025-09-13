"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Appointment, AppointmentStatus } from "@/Global/Types/types";
import {
  getMonthDates,
  getWeekDates,
  monthNames,
} from "@/Global/Utils/commonFn";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import ViewDetails from "@/app/dashboard/Forms/ViewDetails";
import MobileCalendar from "./MobileCalendar";

interface CalendarProps {
  appointments: Appointment[];
  getStatusColor: (status: AppointmentStatus) => string;
  openDetailsModal: () => void;
  onSelectAppointment: (appointment: Appointment) => void;
}

export default function Calendar({
  appointments,
  getStatusColor,
  openDetailsModal,
  onSelectAppointment,
}: CalendarProps) {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<"week" | "month">("week");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateStr = e.target.value;
    const newDate = new Date(newDateStr);
    if (!isNaN(newDate.getTime())) {
      setCurrentDate(newDate);
    }
  };

  const handleOpenAppointmentModal = (appointment: Appointment) => {
    onSelectAppointment(appointment);
    openDetailsModal();
  };

  const getAppointmentsForDate = (date: Date) => {
    const term = searchTerm.toLowerCase();
    const filteredByDate = appointments.filter(
      (apt) => apt.date === date.toISOString().split("T")[0]
    );

    if (!term) {
      return filteredByDate;
    }

    return filteredByDate.filter(
      (apt) =>
        apt.clientName.toLowerCase().includes(term) ||
        apt.service.toLowerCase().includes(term) ||
        apt.status.toLowerCase().includes(term)
    );
  };

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

  const dayNames = [
    t("Sun"),
    t("Mon"),
    t("Tue"),
    t("Wed"),
    t("Thu"),
    t("Fri"),
    t("Sat"),
  ];

  const translatedMonthNames = monthNames.map((name) => t(name));

  if (isMobile) {
    return <MobileCalendar appointments={appointments} />;
  }
  return (
    <>
      <Card className="border-2 shadow-2xl bg-card/70 backdrop-blur-lg border-primary/20 mb-8 overflow-hidden transition-all duration-500 ease-in-out">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {calendarView === "week"
                ? t("Week of {{month}} {{day}}, {{year}}", {
                    month:
                      translatedMonthNames[
                        getWeekDates(currentDate)[0].getMonth()
                      ],
                    day: getWeekDates(currentDate)[0].getDate(),
                    year: getWeekDates(currentDate)[0].getFullYear(),
                  })
                : `${
                    translatedMonthNames[currentDate.getMonth()]
                  } ${currentDate.getFullYear()}`}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-grow">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("Search appointments...")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 text-sm border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={calendarView === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCalendarView("week")}
                >
                  {t("Week")}
                </Button>
                <Button
                  variant={calendarView === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCalendarView("month")}
                >
                  {t("Month")}
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={currentDate.toISOString().split("T")[0]}
                  onChange={handleDateChange}
                  className="h-10 text-sm border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                />
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
            <div className="grid grid-cols-7 gap-4 animate-fade-in-up">
              {getWeekDates(currentDate).map((date, index) => {
                const dayAppointments = getAppointmentsForDate(date);
                const isToday =
                  new Date().toDateString() === date.toDateString();
                return (
                  <div
                    key={index}
                    className="space-y-2 transition-transform duration-300 hover:scale-[1.01]"
                  >
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
                      className={`min-h-[200px] p-3 border-2 rounded-lg bg-card/30 backdrop-blur-sm transition-all duration-200 ${
                        isToday
                          ? "ring-2 ring-primary border-primary/30 shadow-md shadow-primary/20"
                          : "border-primary/10"
                      }`}
                    >
                      <div className="space-y-2">
                        {dayAppointments.length ? (
                          dayAppointments.map((apt) => (
                            <div
                              key={apt.id}
                              onClick={() => handleOpenAppointmentModal(apt)}
                              className={`text-xs p-2 rounded cursor-pointer hover:scale-[1.02] transition-transform ${getStatusColor(
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
                            {t("No appointments")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2 animate-fade-in-up">
              {getMonthDates(currentDate).map((date, index) => {
                const dayAppointments = getAppointmentsForDate(date);
                const isToday =
                  new Date().toDateString() === date.toDateString();
                const isCurrentMonth =
                  date.getMonth() === currentDate.getMonth();
                return (
                  <div
                    key={index}
                    className={`min-h-[140px] p-2 border rounded-lg bg-card/30 backdrop-blur-sm transition-all duration-200 hover:scale-[1.01] ${
                      isToday
                        ? "ring-2 ring-primary border-primary/30 shadow-md shadow-primary/20"
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
                              onClick={() => handleOpenAppointmentModal(apt)}
                              className={`text-xs p-1 rounded cursor-pointer hover:scale-[1.02] transition-transform ${getStatusColor(
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
                              {t("No appointments")}
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
    </>
  );
}
