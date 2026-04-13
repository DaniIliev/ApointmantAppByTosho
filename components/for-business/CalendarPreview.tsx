"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Mail,
  Phone,
  Clock,
  DollarSign,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  getMonthDates,
  getWeekDates,
  monthNames,
} from "@/Global/Utils/commonFn";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/customUIComponents/Modal";
import { getStatusProps, StatusChip } from "@/components/customUIComponents/StatusChip";

interface AppointmentPreview {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceName: string;
  staffName: string;
  time: string;
  endTime: string;
  duration: number;
  price: number;
  status: "confirmed" | "pending" | "completed";
  notes?: string;
}

const mockAppointments: AppointmentPreview[] = [
  {
    id: "1",
    clientName: "Emma White",
    clientEmail: "emma.white@email.com",
    clientPhone: "+1 (555) 123-4567",
    serviceName: "Haircut",
    staffName: "Maria Gonzalez",
    time: "09:00",
    endTime: "09:20",
    duration: 20,
    price: 45,
    status: "confirmed",
    notes: "Client prefers shorter on the sides",
  },
  {
    id: "2",
    clientName: "Sarah Johnson",
    clientEmail: "sarah.j@email.com",
    clientPhone: "+1 (555) 234-5678",
    serviceName: "Color",
    staffName: "Anna Miller",
    time: "10:30",
    endTime: "11:30",
    duration: 60,
    price: 120,
    status: "confirmed",
    notes: "Balayage technique",
  },
  {
    id: "3",
    clientName: "Jessica Brown",
    clientEmail: "jessica.brown@email.com",
    clientPhone: "+1 (555) 345-6789",
    serviceName: "Manicure",
    staffName: "Lisa Chen",
    time: "14:00",
    endTime: "14:30",
    duration: 30,
    price: 35,
    status: "pending",
    notes: "French manicure requested",
  },
  {
    id: "4",
    clientName: "Anna Davis",
    clientEmail: "anna.davis@email.com",
    clientPhone: "+1 (555) 456-7890",
    serviceName: "Styling",
    staffName: "Maria Gonzalez",
    time: "15:30",
    endTime: "16:30",
    duration: 60,
    price: 75,
    status: "completed",
    notes: "Wedding guest styling",
  },
];

export function CalendarPreview() {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<"week" | "month">("week");
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentPreview | null>(null);

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

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);
  const monthDates = useMemo(() => getMonthDates(currentDate), [currentDate]);

  const getStatusMeta = (status: AppointmentPreview["status"]) =>
    getStatusProps(status as any);

  const getAppointmentsForDate = (date: Date) => {
    return mockAppointments.filter(() => Math.random() > 0.6);
  };

  const handlePrevious = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (calendarView === "week") {
        newDate.setDate(prev.getDate() - 7);
      } else {
        newDate.setMonth(prev.getMonth() - 1);
      }
      return newDate;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (calendarView === "week") {
        newDate.setDate(prev.getDate() + 7);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-primary/15 bg-gradient-to-b from-background/80 via-background/70 to-background/90 backdrop-blur shadow-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-primary">
            {t("Calendar Preview")}
          </h3>
        </div>
        <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
          <button
            onClick={() => setCalendarView("week")}
            className={`px-2 py-1 rounded text-xs font-medium transition ${
              calendarView === "week"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("Week")}
          </button>
          <button
            onClick={() => setCalendarView("month")}
            className={`px-2 py-1 rounded text-xs font-medium transition ${
              calendarView === "month"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("Month")}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          className="p-1 hover:bg-primary/10 rounded transition"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h4 className="text-sm font-semibold">
          {calendarView === "week"
            ? `${
                translatedMonthNames[weekDates[0].getMonth()]
              } ${weekDates[0].getDate()} - ${weekDates[6].getDate()}`
            : `${
                translatedMonthNames[currentDate.getMonth()]
              } ${currentDate.getFullYear()}`}
        </h4>
        <button
          onClick={handleNext}
          className="p-1 hover:bg-primary/10 rounded transition"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar Grid */}
      {calendarView === "week" ? (
        <div className="space-y-2">
          {/* Week View */}
          <div className="grid grid-cols-7 gap-1">
            {weekDates.map((date, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-center">
                  <p className="text-[10px] font-semibold text-muted-foreground">
                    {dayNames[date.getDay()]}
                  </p>
                  <p
                    className={`text-xs font-bold ${
                      date.toDateString() === new Date().toDateString()
                        ? "text-primary bg-primary/20 rounded w-full"
                        : ""
                    }`}
                  >
                    {date.getDate()}
                  </p>
                </div>
                <div className="space-y-1">
                  {getAppointmentsForDate(date).map((apt) => (
                    <button
                      key={apt.id}
                      onClick={() => setSelectedAppointment(apt)}
                      className={`w-full rounded-sm px-1 py-0.5 text-[10px] truncate border cursor-pointer hover:shadow-md transition ${getStatusMeta(
                        apt.status,
                      ).className}`}
                    >
                      <span className="flex items-center gap-1">
                        <span className="shrink-0 [&>svg]:h-3 [&>svg]:w-3">
                          {getStatusMeta(apt.status).icon}
                        </span>
                        <span className="truncate">
                          {apt.time} - {apt.endTime}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Month View - Day names */}
          <div className="grid grid-cols-7 gap-1">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-semibold text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Month View - Days */}
          <div className="grid grid-cols-7 gap-1">
            {monthDates.map((date, idx) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();
              const appointments = getAppointmentsForDate(date);

              return (
                <div
                  key={idx}
                  className={`rounded-lg border p-1 min-h-[60px] text-[10px] ${
                    isCurrentMonth
                      ? "bg-background/50 border-primary/10"
                      : "bg-muted/20 border-muted/30 opacity-50"
                  } ${isToday ? "border-primary/50 bg-primary/5" : ""}`}
                >
                  <p
                    className={`font-bold mb-1 ${
                      isToday ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {date.getDate()}
                  </p>
                  <div className="space-y-0.5">
                    {appointments.slice(0, 2).map((apt) => (
                      <button
                        key={apt.id}
                        onClick={() => setSelectedAppointment(apt)}
                        className={`w-full rounded px-0.5 py-0.5 truncate border cursor-pointer hover:shadow-md transition text-left ${getStatusMeta(
                          apt.status,
                        ).className}`}
                      >
                        <span className="flex items-center gap-1">
                          <span className="shrink-0 [&>svg]:h-3 [&>svg]:w-3">
                            {getStatusMeta(apt.status).icon}
                          </span>
                          <span className="truncate">
                            {apt.time} - {apt.endTime}
                          </span>
                        </span>
                      </button>
                    ))}
                    {appointments.length > 2 && (
                      <p className="text-[9px] text-muted-foreground">
                        +{appointments.length - 2} {t("more")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-2 pt-2 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">{t("Confirmed")}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-muted-foreground">{t("Pending")}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">{t("Completed")}</span>
        </div>
      </div>

      {/* Appointment Details Modal */}
      <Modal
        label={t("Appointment Details")}
        open={Boolean(selectedAppointment)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setSelectedAppointment(null);
        }}
        width="md"
        confirmClose={false}
      >
        {selectedAppointment && (
          <div className="space-y-6 px-1 md:px-0">
            {/* Client Name and Status */}
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-bold">
                {selectedAppointment.clientName}
              </h3>
              <Badge
                className={`${getStatusMeta(selectedAppointment.status).className} px-3 py-1 rounded-full font-semibold border`}
              >
                <span className="flex items-center gap-1">
                  <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">
                    {getStatusMeta(selectedAppointment.status).icon}
                  </span>
                  <span>
                    {t(
                      selectedAppointment.status.charAt(0).toUpperCase() +
                        selectedAppointment.status.slice(1),
                    )}
                  </span>
                </span>
              </Badge>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm">
                  {selectedAppointment.clientEmail}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm">
                  {selectedAppointment.clientPhone}
                </span>
              </div>
            </div>

            {/* Service Information */}
            <div className="space-y-3 border-t border-primary/10 pt-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t("Service")}
                </p>
                <p className="font-semibold text-lg">
                  {selectedAppointment.serviceName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t("Staff Member")}
                </p>
                <p className="font-semibold">{selectedAppointment.staffName}</p>
              </div>
            </div>

            {/* Appointment Time */}
            <div className="space-y-3 border-t border-primary/10 pt-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">{t("Time")}</p>
                  <p className="font-semibold">
                    {selectedAppointment.time} - {selectedAppointment.endTime}
                  </p>
                </div>
              </div>
            </div>

            {/* Duration and Price */}
            <div className="grid grid-cols-2 gap-3 border-t border-primary/10 pt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("Duration")}
                  </p>
                  <p className="font-semibold text-sm">
                    {selectedAppointment.duration} {t("min")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("Price")}</p>
                  <p className="font-semibold text-sm">
                    €{selectedAppointment.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedAppointment.notes && (
              <div className="border-t border-primary/10 pt-4 space-y-2">
                <p className="text-sm font-semibold text-primary">
                  {t("Notes")}
                </p>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {selectedAppointment.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
