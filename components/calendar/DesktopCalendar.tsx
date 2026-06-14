"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Search, CreditCard, Users, ChevronDown, ChevronUp } from "lucide-react";
import { Appointment, AppointmentStatus } from "@/Global/Types/types";
import {
  formatDateAndTime,
  getMonthDates,
  getWeekDates,
  monthNames,
} from "@/Global/Utils/commonFn";
import {
  groupAppointments,
  GroupedAppointment,
} from "@/Global/Utils/groupingUtils";
import "./DesktopCalendar.css";

interface DesktopCalendarProps {
  appointments: Appointment[];
  getStatusColor: (status: AppointmentStatus) => string;
  openDetailsModal: () => void;
  onSelectAppointment: (appointment: Appointment) => void;
}

function getStatusClass(status: AppointmentStatus | "confirmed"): string {
  switch (status) {
    case "pending": return "desktop-calendar__apt-card--pending";
    case "confirmed": return "desktop-calendar__apt-card--confirmed";
    case "completed": return "desktop-calendar__apt-card--completed";
    case "blocked": return "desktop-calendar__apt-card--blocked";
    case "cancelled":
    case "missed": return "desktop-calendar__apt-card--cancelled";
    default: return "";
  }
}

function getStatusDotClass(status: AppointmentStatus): string {
  switch (status) {
    case "pending": return "desktop-calendar__status-dot--pending";
    case "confirmed": return "desktop-calendar__status-dot--confirmed";
    case "completed": return "desktop-calendar__status-dot--completed";
    case "blocked": return "desktop-calendar__status-dot--blocked";
    case "cancelled":
    case "missed": return "desktop-calendar__status-dot--cancelled";
    default: return "";
  }
}

export default function DesktopCalendar({
  appointments,
  openDetailsModal,
  onSelectAppointment,
}: DesktopCalendarProps) {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<"week" | "month">("week");
  const [searchTerm, setSearchTerm] = useState("");
  const [detailLevel, setDetailLevel] = useState<number>(3);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const handleOpenAppointmentModal = (appointment: Appointment) => {
    onSelectAppointment(appointment);
    openDetailsModal();
  };

  const getAppointmentsForDate = (date: Date) => {
    const term = searchTerm.toLowerCase();
    const dateString = date.toDateString();
    const filteredByDate = appointments.filter((apt) => {
      if (!apt.appointmentTime || !apt.appointmentTime.start) return false;
      return new Date(apt.appointmentTime.start).toDateString() === dateString;
    });
    if (!term) return groupAppointments(filteredByDate);
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
      const d = new Date(prev);
      d.setDate(prev.getDate() + (direction === "next" ? 7 : -7));
      return d;
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return d;
    });
  };

  const dayNames = [t("Mon"), t("Tue"), t("Wed"), t("Thu"), t("Fri"), t("Sat"), t("Sun")];
  const translatedMonthNames = monthNames.map((name) => t(name));

  const headerTitle =
    calendarView === "week"
      ? t("Week of {{month}} {{day}}, {{year}}", {
          month: translatedMonthNames[getWeekDates(currentDate)[0].getMonth()],
          day: getWeekDates(currentDate)[0].getDate(),
          year: getWeekDates(currentDate)[0].getFullYear(),
        })
      : `${translatedMonthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  // ─── Appointment Card ───
  const renderAppointmentCard = (apt: Appointment | GroupedAppointment, compact = false) => {
    const isGroup = (apt as GroupedAppointment).isGroup;
    const groupData = apt as GroupedAppointment;
    const mainApt = isGroup ? groupData.mainAppointment : (apt as Appointment);
    const statusClass = getStatusClass(isGroup ? "confirmed" : mainApt.status);
    const isGroupCard = isGroup ? "desktop-calendar__apt-card--group" : "";

    return (
      <div
        key={mainApt._id}
        className={`desktop-calendar__apt-card ${statusClass} ${isGroupCard}`}
        onClick={() =>
          isGroup
            ? setExpandedGroups((prev) => ({
                ...prev,
                [mainApt._id]: !prev[mainApt._id],
              }))
            : handleOpenAppointmentModal(mainApt)
        }
      >
        {/* Time row */}
        <div className="desktop-calendar__apt-time">
          {(mainApt.paymentStatus === "captured" ||
            mainApt.paymentStatus === "authorized" ||
            mainApt.serviceName === "card") && (
            <CreditCard className="payment-icon" size={compact ? 12 : 14} />
          )}
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {formatDateAndTime(mainApt.appointmentTime.start, "time")}
            {" - "}
            {formatDateAndTime(mainApt.appointmentTime.end, "time")}
          </span>
          {isGroup && (
            <span className="desktop-calendar__group-toggle">
              {expandedGroups[mainApt._id] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </span>
          )}
        </div>

        {/* Service */}
        {detailLevel >= 2 && (
          <div className="desktop-calendar__apt-service">{mainApt.serviceName}</div>
        )}

        {/* Client */}
        {detailLevel >= 3 && !isGroup && (
          <div className="desktop-calendar__apt-client">{mainApt.clientName}</div>
        )}

        {/* Group badge */}
        {isGroup && (
          <div className="desktop-calendar__group-badge">
            <Users size={11} />
            {groupData.count}
          </div>
        )}

        {/* Expanded group participants */}
        {isGroup && expandedGroups[mainApt._id] && (
          <div className="desktop-calendar__group-list">
            {groupData.appointments.map((participant) => (
              <div
                key={participant._id}
                className="desktop-calendar__group-participant"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenAppointmentModal(participant);
                }}
              >
                <span className="desktop-calendar__group-participant-name">
                  {participant.clientName}
                </span>
                <div
                  className={`desktop-calendar__status-dot ${getStatusDotClass(participant.status)}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="desktop-calendar">
      <div className="desktop-calendar__container">
        {/* ─── Header ─── */}
        <div className="desktop-calendar__header">
          <h2 className="desktop-calendar__title">{headerTitle}</h2>

          <div className="desktop-calendar__controls">
            {/* Search */}
            <div className="desktop-calendar__search-wrap">
              <Search size={14} className="desktop-calendar__search-icon" />
              <input
                className="desktop-calendar__search-input"
                placeholder={t("Search appointments...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Detail level */}
            <div className="desktop-calendar__detail-slider">
              <span className="desktop-calendar__detail-label">{t("Details")}</span>
              <input
                type="range"
                min={1}
                max={3}
                step={1}
                value={detailLevel}
                onChange={(e) => setDetailLevel(Number(e.target.value))}
                className="desktop-calendar__detail-range"
                aria-label={t("Appointment details level")}
              />
            </div>

            {/* View toggle */}
            <div className="desktop-calendar__view-toggle">
              <button
                className={`desktop-calendar__view-btn ${calendarView === "week" ? "desktop-calendar__view-btn--active" : ""}`}
                onClick={() => setCalendarView("week")}
              >
                {t("Week")}
              </button>
              <button
                className={`desktop-calendar__view-btn ${calendarView === "month" ? "desktop-calendar__view-btn--active" : ""}`}
                onClick={() => setCalendarView("month")}
              >
                {t("Month")}
              </button>
            </div>

            {/* Navigation */}
            <div className="desktop-calendar__nav-group">
              <button
                className="desktop-calendar__nav-btn"
                onClick={() =>
                  calendarView === "week" ? navigateWeek("prev") : navigateMonth("prev")
                }
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className="desktop-calendar__nav-btn"
                onClick={() =>
                  calendarView === "week" ? navigateWeek("next") : navigateMonth("next")
                }
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ─── Week View ─── */}
        {calendarView === "week" && (
          <div className="desktop-calendar__grid desktop-calendar__grid--animate" key={`week-${currentDate.toISOString()}`}>
            <div className="desktop-calendar__week-grid">
              {getWeekDates(currentDate).map((date, index) => {
                const dayAppointments = getAppointmentsForDate(date);
                const isToday = new Date().toDateString() === date.toDateString();
                return (
                  <div key={index} className="desktop-calendar__week-col">
                    {/* Day header */}
                    <div className="desktop-calendar__week-date-header">
                      <span className="desktop-calendar__week-day-name">{dayNames[index]}</span>
                      <span
                        className={`desktop-calendar__week-day-num ${isToday ? "desktop-calendar__week-day-num--today" : ""}`}
                      >
                        {date.getDate()}
                      </span>
                    </div>

                    {/* Appointments cell */}
                    <div
                      className={`desktop-calendar__week-cell ${isToday ? "desktop-calendar__week-cell--today" : ""}`}
                    >
                      {dayAppointments.length ? (
                        dayAppointments.map((apt: any) => renderAppointmentCard(apt))
                      ) : (
                        <div className="desktop-calendar__empty">
                          {t("No appointments")}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Month View ─── */}
        {calendarView === "month" && (
          <div className="desktop-calendar__grid desktop-calendar__grid--animate" key={`month-${currentDate.toISOString()}`}>
            {/* Day headers */}
            <div className="desktop-calendar__day-headers">
              {dayNames.map((name) => (
                <div key={name} className="desktop-calendar__day-header">
                  {name}
                </div>
              ))}
            </div>

            <div className="desktop-calendar__month-grid">
              {getMonthDates(currentDate).map((date, index) => {
                const dayAppointments = getAppointmentsForDate(date);
                const isToday = new Date().toDateString() === date.toDateString();
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                return (
                  <div
                    key={index}
                    className={`desktop-calendar__month-cell ${isToday ? "desktop-calendar__month-cell--today" : ""} ${!isCurrentMonth ? "desktop-calendar__month-cell--other" : ""}`}
                  >
                    {/* Day number */}
                    <div className="desktop-calendar__month-day-num">
                      {isToday ? (
                        <span className="desktop-calendar__month-day-num--today">
                          {date.getDate()}
                        </span>
                      ) : (
                        date.getDate()
                      )}
                    </div>

                    {/* Appointments */}
                    {dayAppointments.length
                      ? dayAppointments.map((apt: any) => renderAppointmentCard(apt, true))
                      : isCurrentMonth && (
                          <div className="desktop-calendar__empty" style={{ padding: "8px 4px" }}>
                            {t("No appointments")}
                          </div>
                        )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
