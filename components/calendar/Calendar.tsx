"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Search, CreditCard } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Appointment, AppointmentStatus } from "@/Global/Types/types";
import {
  formatDateAndTime,
  // formatDate,
  getMonthDates,
  getWeekDates,
  monthNames,
} from "@/Global/Utils/commonFn";
import {
  groupAppointments,
  GroupedAppointment,
} from "@/Global/Utils/groupingUtils";
import MobileCalendar from "./MobileCalendar";
import { LabeledInput } from "../customUIComponents/LabeledInput";
import { Users, ChevronDown, ChevronUp } from "lucide-react";

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
  const [detailLevel, setDetailLevel] = useState<number>(3); // 1=time, 2=time+service, 3=all
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );

  // Debug: Check if paymentStatus is coming through
  useEffect(() => {
    if (appointments.length > 0) {
      console.log("Sample appointment data:", appointments[0]);
      console.log(
        "PaymentStatus values:",
        appointments.map((a) => ({
          id: a._id,
          client: a.clientName,
          paymentStatus: a.paymentStatus,
        })),
      );
    }
  }, [appointments]);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
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
    const dateString = date.toDateString();

    const filteredByDate = appointments.filter((apt) => {
      if (!apt.appointmentTime || !apt.appointmentTime.start) {
        return false;
      }
      const appointmentDate = new Date(apt.appointmentTime.start);
      return appointmentDate.toDateString() === dateString;
    });

    if (!term) {
      return groupAppointments(filteredByDate);
    }

    const filteredTerm = filteredByDate.filter(
      (apt) =>
        apt.clientName?.toLowerCase().includes(term) ||
        apt.serviceName?.toLowerCase().includes(term) ||
        apt.status?.toLowerCase().includes(term),
    );

    return groupAppointments(filteredTerm);
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
    return (
      <MobileCalendar
        appointments={appointments}
        onSelectAppointment={onSelectAppointment}
        openDetailsModal={openDetailsModal}
      />
    );
  }
  return (
    <>
      <Card className="border-2 shadow-2xl bg-card backdrop-blur-lg border-primary/20 mb-8 overflow-hidden transition-all duration-500 ease-in-out">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
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
            <div className="flex flex-wrap items-center gap-2 transition-all duration-300 ease-in-out">
              <div className="relative flex-grow min-w-[200px] transition-all duration-300">
                <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <LabeledInput
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  label={t("Search appointments...")}
                  id={"search-appointments"}
                  className="w-5"
                />
              </div>
              {/* Detail Level Slider */}
              <div className="flex items-center gap-2 transition-all duration-300">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {t("Details")}
                </span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={1}
                  aria-label={t("Appointment details level")}
                  value={detailLevel}
                  onChange={(e) => setDetailLevel(Number(e.target.value))}
                  className="w-28 accent-primary"
                />
              </div>
              <div className="flex gap-2 transition-all duration-300">
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
              <div className="flex gap-2 transition-all duration-300">
                <LabeledInput
                  type="date"
                  id="calendar-date-picker"
                  label={t("Date")}
                  value={currentDate.toISOString().split("T")[0]}
                  onChange={handleDateChange}
                />
              </div>
              <div className="flex items-center gap-2 transition-all duration-300">
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
          </div>

          {calendarView === "week" ? (
            <div className="grid grid-cols-7 gap-2 animate-fade-in-up">
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
                          dayAppointments.map((apt: any) => {
                            const isGroup = apt.isGroup;
                            const groupData = apt as GroupedAppointment;
                            const mainApt = isGroup
                              ? groupData.mainAppointment
                              : (apt as Appointment);

                            return (
                              <div
                                key={mainApt._id}
                                className={`text-xs p-2 rounded cursor-pointer hover:scale-[1.02] transition-all ${getStatusColor(
                                  mainApt.status,
                                )}`}
                                onClick={() =>
                                  isGroup
                                    ? setExpandedGroups((prev) => ({
                                        ...prev,
                                        [mainApt._id]: !prev[mainApt._id],
                                      }))
                                    : handleOpenAppointmentModal(mainApt)
                                }
                              >
                                <div className="font-medium flex items-center justify-between gap-1 truncate">
                                  <div className="flex items-center gap-1 truncate min-w-0">
                                    {(mainApt.paymentStatus === "captured" ||
                                      mainApt.paymentStatus === "authorized" ||
                                      mainApt.serviceName === "card") && (
                                      <CreditCard className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    )}
                                    <span className="truncate">
                                      {formatDateAndTime(
                                        mainApt.appointmentTime.start,
                                        "time",
                                      )}{" "}
                                      -{" "}
                                      {formatDateAndTime(
                                        mainApt.appointmentTime.end,
                                        "time",
                                      )}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between mt-0.5 gap-1">
                                  <div className="flex-1 min-w-0">
                                    {detailLevel >= 2 && (
                                      <div className="truncate font-semibold">
                                        {mainApt.serviceName}
                                      </div>
                                    )}
                                    {detailLevel >= 3 && !isGroup && (
                                      <div className="truncate text-muted-foreground/80 font-medium">
                                        {mainApt.clientName}
                                      </div>
                                    )}
                                  </div>
                                  {isGroup && (
                                    <div className="text-muted-foreground flex-shrink-0">
                                      {expandedGroups[mainApt._id] ? (
                                        <ChevronUp size={14} />
                                      ) : (
                                        <ChevronDown size={14} />
                                      )}
                                    </div>
                                  )}
                                </div>

                                {isGroup && (
                                  <div className="flex items-center justify-center mt-1 pt-1 border-t border-primary/10">
                                    <div className="flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded-md text-[10px] font-bold">
                                      <Users size={12} />
                                      {groupData.count}
                                    </div>
                                  </div>
                                )}

                                {isGroup && expandedGroups[mainApt._id] && (
                                  <div className="mt-2 space-y-1.5 border-t border-primary/10 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                    {groupData.appointments.map(
                                      (participant) => (
                                        <div
                                          key={participant._id}
                                          className="flex items-center justify-between hover:bg-white/10 p-1 rounded transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenAppointmentModal(
                                              participant,
                                            );
                                          }}
                                        >
                                          <span className="truncate">
                                            {participant.clientName}
                                          </span>
                                          <div
                                            className={`w-1.5 h-1.5 rounded-full ${getStatusColor(participant.status)}`}
                                          />
                                        </div>
                                      ),
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
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
                        ? dayAppointments.map((apt: any) => {
                            const isGroup = apt.isGroup;
                            const groupData = apt as GroupedAppointment;
                            const mainApt = isGroup
                              ? groupData.mainAppointment
                              : (apt as Appointment);

                            return (
                              <div
                                key={mainApt._id}
                                onClick={() =>
                                  isGroup
                                    ? setExpandedGroups((prev) => ({
                                        ...prev,
                                        [mainApt._id]: !prev[mainApt._id],
                                      }))
                                    : handleOpenAppointmentModal(mainApt)
                                }
                                className={`text-xs p-1 rounded cursor-pointer hover:scale-[1.02] transition-transform ${getStatusColor(
                                  mainApt.status,
                                )}`}
                              >
                                <div className="font-medium truncate flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1 truncate min-w-0">
                                    {(mainApt.paymentStatus === "captured" ||
                                      mainApt.paymentStatus === "authorized" ||
                                      mainApt.serviceName === "card") && (
                                      <CreditCard className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    )}
                                    <span className="truncate">
                                      {formatDateAndTime(
                                        mainApt.appointmentTime.start,
                                        "time",
                                      )}{" "}
                                      -{" "}
                                      {formatDateAndTime(
                                        mainApt.appointmentTime.end,
                                        "time",
                                      )}
                                    </span>
                                  </div>
                                  {isGroup && (
                                    <div className="flex items-center gap-0.5 bg-primary/20 px-1 py-0.5 rounded text-[9px] font-bold flex-shrink-0">
                                      <Users size={10} />
                                      {groupData.count}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex-1 truncate min-w-0">
                                    {detailLevel >= 2 && (
                                      <div className="truncate font-semibold text-[10px]">
                                        {mainApt.serviceName}
                                      </div>
                                    )}
                                    {detailLevel >= 3 && !isGroup && (
                                      <div className="truncate text-[10px] opacity-80">
                                        {mainApt.clientName}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {isGroup && expandedGroups[mainApt._id] && (
                                  <div className="mt-1 space-y-0.5 border-t border-primary/10 pt-1">
                                    {groupData.appointments.map(
                                      (participant) => (
                                        <div
                                          key={participant._id}
                                          className="text-[9px] truncate opacity-80 flex items-center gap-1"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenAppointmentModal(
                                              participant,
                                            );
                                          }}
                                        >
                                          <div
                                            className={`w-1 h-1 rounded-full ${getStatusColor(participant.status)}`}
                                          />
                                          {participant.clientName}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
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
