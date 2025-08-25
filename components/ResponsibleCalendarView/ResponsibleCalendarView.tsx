// components/ui/calendar-appointments.tsx

"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { bg } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Appointment } from "@/Global/Types/types";

interface CalendarAppointmentsProps {
  appointments: Appointment[];
}

export function CalendarAppointments({
  appointments,
}: CalendarAppointmentsProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date()
  );

  const filteredAppointments = React.useMemo(() => {
    if (!selectedDate) {
      return [];
    }
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    return appointments.filter(
      (appointment) => appointment.date === selectedDateStr
    );
  }, [selectedDate, appointments]);

  const uniqueDates = React.useMemo(() => {
    return appointments.reduce((acc, appointment) => {
      const date = parseISO(appointment.date);
      const key = format(date, "yyyy-MM-dd");
      if (!acc[key]) {
        acc[key] = true;
      }
      return acc;
    }, {} as Record<string, boolean>);
  }, [appointments]);

  const modifiers = {
    booked: (date: Date) => {
      return uniqueDates[format(date, "yyyy-MM-dd")];
    },
  };

  const modifiersStyles = {
    booked: {
      fontWeight: "bold",
      color: "white",
      backgroundColor: "hsl(var(--primary))",
    },
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Calendar View */}
      <Card className="p-4 w-full md:w-1/2 lg:w-1/3">
        <CardHeader>
          <CardTitle>Календар</CardTitle>
          <CardDescription>
            Изберете дата, за да видите срещите.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            initialFocus
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            locale={bg}
          />
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card className="w-full md:w-1/2 lg:w-2/3">
        <CardHeader>
          <CardTitle>
            Срещи на{" "}
            {selectedDate
              ? format(selectedDate, "dd MMMM yyyy г.", { locale: bg })
              : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-4 border rounded-lg shadow-sm"
                >
                  <h3 className="font-semibold text-lg">
                    {appointment.clientName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {appointment.service} - {appointment.time}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Статус: {appointment.status}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Няма срещи за тази дата.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
