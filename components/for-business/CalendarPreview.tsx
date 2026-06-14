"use client";

import { useState, useMemo } from "react";
import Calendar from "@/components/calendar/Calendar";
import { Appointment } from "@/Global/Types/types";
import { getStatusColor } from "@/Global/Utils/statusIndicator";
import { startOfWeek, addDays } from "date-fns";

export function CalendarPreview() {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const mockAppointments: Appointment[] = useMemo(() => {
    const today = new Date();
    // Use weekStartsOn: 1 (Monday) to align with European calendar
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });

    return [
      {
        _id: "1",
        clientName: "Emma White",
        email: "emma.white@email.com",
        clientPhone: "+1 (555) 123-4567",
        appointmentTime: {
          // Monday
          start: new Date(addDays(currentWeekStart, 0).setHours(9, 0, 0, 0)).toISOString(),
          end: new Date(addDays(currentWeekStart, 0).setHours(9, 30, 0, 0)).toISOString(),
        },
        serviceName: "Haircut",
        servicePrice: 45,
        serviceDuration: 30,
        status: "confirmed",
        staff: {
          _id: "s1",
          firstName: "Maria",
          lastName: "Gonzalez",
        },
      },
      {
        _id: "2",
        clientName: "Sarah Johnson",
        email: "sarah.j@email.com",
        clientPhone: "+1 (555) 234-5678",
        appointmentTime: {
          // Tuesday
          start: new Date(addDays(currentWeekStart, 1).setHours(11, 0, 0, 0)).toISOString(),
          end: new Date(addDays(currentWeekStart, 1).setHours(12, 0, 0, 0)).toISOString(),
        },
        serviceName: "Coloring",
        servicePrice: 120,
        serviceDuration: 60,
        status: "confirmed",
        staff: {
          _id: "s2",
          firstName: "Anna",
          lastName: "Miller",
        },
      },
      {
        _id: "3",
        clientName: "Jessica Brown",
        email: "jessica.brown@email.com",
        clientPhone: "+1 (555) 345-6789",
        appointmentTime: {
          // Wednesday
          start: new Date(addDays(currentWeekStart, 2).setHours(14, 0, 0, 0)).toISOString(),
          end: new Date(addDays(currentWeekStart, 2).setHours(14, 30, 0, 0)).toISOString(),
        },
        serviceName: "Manicure",
        servicePrice: 35,
        serviceDuration: 30,
        status: "pending",
        staff: {
          _id: "s3",
          firstName: "Lisa",
          lastName: "Chen",
        },
      },
      {
        _id: "4",
        clientName: "Anna Davis",
        email: "anna.davis@email.com",
        clientPhone: "+1 (555) 456-7890",
        appointmentTime: {
          // Thursday
          start: new Date(addDays(currentWeekStart, 3).setHours(15, 30, 0, 0)).toISOString(),
          end: new Date(addDays(currentWeekStart, 3).setHours(16, 30, 0, 0)).toISOString(),
        },
        serviceName: "Styling",
        servicePrice: 75,
        serviceDuration: 60,
        status: "completed",
        staff: {
          _id: "s1",
          firstName: "Maria",
          lastName: "Gonzalez",
        },
      },
      {
        _id: "5",
        clientName: "David Smith",
        email: "david.s@email.com",
        clientPhone: "+1 (555) 567-8901",
        appointmentTime: {
          // Friday
          start: new Date(addDays(currentWeekStart, 4).setHours(10, 0, 0, 0)).toISOString(),
          end: new Date(addDays(currentWeekStart, 4).setHours(10, 45, 0, 0)).toISOString(),
        },
        serviceName: "Men's Haircut",
        servicePrice: 30,
        serviceDuration: 45,
        status: "confirmed",
        staff: {
          _id: "s2",
          firstName: "Anna",
          lastName: "Miller",
        },
      },
      {
        _id: "6",
        clientName: "Sophia Martinez",
        email: "sophia.m@email.com",
        clientPhone: "+1 (555) 678-9012",
        appointmentTime: {
          // Saturday
          start: new Date(addDays(currentWeekStart, 5).setHours(13, 0, 0, 0)).toISOString(),
          end: new Date(addDays(currentWeekStart, 5).setHours(14, 0, 0, 0)).toISOString(),
        },
        serviceName: "Balayage",
        servicePrice: 150,
        serviceDuration: 60,
        status: "confirmed",
        staff: {
          _id: "s1",
          firstName: "Maria",
          lastName: "Gonzalez",
        },
      },
      {
        _id: "7",
        clientName: "Olivia Wilson",
        email: "olivia.w@email.com",
        clientPhone: "+1 (555) 789-0123",
        appointmentTime: {
          // Sunday
          start: new Date(addDays(currentWeekStart, 6).setHours(11, 30, 0, 0)).toISOString(),
          end: new Date(addDays(currentWeekStart, 6).setHours(12, 15, 0, 0)).toISOString(),
        },
        serviceName: "Blowout",
        servicePrice: 55,
        serviceDuration: 45,
        status: "pending",
        staff: {
          _id: "s3",
          firstName: "Lisa",
          lastName: "Chen",
        },
      },
    ];
  }, []);

  return (
    <div className="w-full mx-auto rounded-2xl border border-primary/15 bg-gradient-to-b from-background/80 via-background/70 to-background/90 backdrop-blur shadow-lg p-2 sm:p-4 h-[600px] lg:h-auto overflow-hidden lg:overflow-visible flex flex-col">
      <div className="flex-1 w-full h-full lg:h-auto overflow-y-auto lg:overflow-visible custom-scrollbar rounded-xl">
        <Calendar
          appointments={mockAppointments}
          getStatusColor={getStatusColor}
          openDetailsModal={() => {}}
          onSelectAppointment={(appointment) => setSelectedAppointment(appointment)}
        />
      </div>
    </div>
  );
}
