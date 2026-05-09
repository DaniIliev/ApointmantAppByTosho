"use client";
import { useEffect, useState } from "react";
import { Appointment, AppointmentStatus } from "@/Global/Types/types";
import MobileCalendar from "./MobileCalendar";
import DesktopCalendar from "./DesktopCalendar";

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

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
    <DesktopCalendar
      appointments={appointments}
      getStatusColor={getStatusColor}
      openDetailsModal={openDetailsModal}
      onSelectAppointment={onSelectAppointment}
    />
  );
}
