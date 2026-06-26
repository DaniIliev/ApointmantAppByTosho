"use client";

import * as React from "react";
import { format, parseISO, isSameDay, addWeeks } from "date-fns";
import { bg } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Appointment } from "@/Global/Types/types";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Search,
  User,
  Clock,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { addDays, startOfWeek } from "date-fns";
import { Input } from "@/components/ui/input";

interface CalendarAppointmentsProps {
  appointments: Appointment[];
}

interface WeeklyCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  uniqueDates: Record<string, boolean>;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export function WeeklyCalendar({
  selectedDate,
  onSelectDate,
  uniqueDates,
  onPreviousWeek,
  onNextWeek,
}: WeeklyCalendarProps) {
  const startOfTheWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = [...Array(7)].map((_, i) => addDays(startOfTheWeek, i));

  const monthYearTitle = format(selectedDate, "MMMM yyyy", { locale: bg });
  const capitalizedMonth =
    monthYearTitle.charAt(0).toUpperCase() + monthYearTitle.slice(1);

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-2 px-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPreviousWeek}
          aria-label="Previous week"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-bold text-lg">{capitalizedMonth}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextWeek}
          aria-label="Next week"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex justify-between items-center p-2">
        {weekDays.map((date) => (
          <button
            key={date.toString()}
            onClick={() => onSelectDate(date)}
            className={cn(
              "flex flex-col items-center p-2 rounded-lg transition-colors w-1/7",
              "hover:bg-gray-200 dark:hover:bg-gray-800",
              isSameDay(date, selectedDate)
                ? "bg-blue-600 text-white rounded-full"
                : uniqueDates[format(date, "yyyy-MM-dd")]
                ? "font-bold"
                : "text-gray-600 dark:text-gray-400"
            )}
          >
            <span className="text-xs">
              {format(date, "EE", { locale: bg })}
            </span>
            <span className="text-lg font-semibold">{format(date, "d")}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CalendarAppointments({
  appointments,
}: CalendarAppointmentsProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date()
  );
  const [viewMode, setViewMode] = React.useState<"week" | "month">("week");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const appointmentRefs = React.useRef<Record<string, HTMLDivElement | null>>(
    {}
  );
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const sortedAppointments = React.useMemo(() => {
    return [...appointments].sort(
      (a, b) =>
        parseISO(a.appointmentTime.start).getTime() -
        parseISO(b.appointmentTime.start).getTime()
    );
  }, [appointments]);

  const filteredAppointmentsBySearch = React.useMemo(() => {
    if (!searchQuery) {
      return sortedAppointments;
    }
    return sortedAppointments.filter((appointment) =>
      appointment.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedAppointments, searchQuery]);

  const groupedAppointments = React.useMemo(() => {
    return filteredAppointmentsBySearch.reduce((acc, appointment) => {
      const dateKey = format(
        parseISO(appointment.appointmentTime.start),
        "dd MMMM yyyy г.",
        {
          locale: bg,
        }
      );
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(appointment);
      return acc;
    }, {} as Record<string, Appointment[]>);
  }, [filteredAppointmentsBySearch]);

  React.useEffect(() => {
    if (selectedDate && appointmentRefs.current) {
      const dateKey = format(selectedDate, "dd MMMM yyyy г.", { locale: bg });
      const element = appointmentRefs.current[dateKey];
      if (element) {
        if (containerRef.current) {
          containerRef.current.scrollTo({
            top: element.offsetTop,
            behavior: "smooth",
          });
        }
      }
    }
  }, [selectedDate]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstVisibleEntry = entries.find((entry) => entry.isIntersecting);
        if (firstVisibleEntry) {
          const dateKey = firstVisibleEntry.target.getAttribute("data-date");
          if (dateKey) {
            const newDate = parseISO(dateKey);
            if (!isSameDay(newDate, selectedDate || new Date())) {
              setSelectedDate(newDate);
            }
          }
        }
      },
      {
        root: containerRef.current,
        rootMargin: "0px",
        threshold: 0,
      }
    );

    Object.values(appointmentRefs.current).forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => {
      Object.values(appointmentRefs.current).forEach((ref) => {
        if (ref) {
          observer.unobserve(ref);
        }
      });
    };
  }, [selectedDate, groupedAppointments]);

  const uniqueDates = React.useMemo(() => {
    return appointments.reduce((acc, appointment) => {
      const date = parseISO(appointment.appointmentTime.start);
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
    selected: selectedDate,
  };

  const modifiersStyles = {
    booked: {
      fontWeight: "bold",
      outline: "2px solid hsl(var(--primary))",
    },
    selected: {
      backgroundColor: "hsl(var(--primary))",
      color: "white",
      borderRadius: "9999px", // кръгче
    },
  };

  const handlePreviousWeek = () => {
    setSelectedDate((prevDate) => addWeeks(prevDate || new Date(), -1));
  };

  const handleNextWeek = () => {
    setSelectedDate((prevDate) => addWeeks(prevDate || new Date(), 1));
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto">
      {/* Календар */}
      <Card
        className="p-4 mb-4 bg-transparent border-0"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(5px)",
        }}
      >
        <CardContent className="flex flex-col items-center p-0 w-full">
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out w-full",
              viewMode === "week" ? "h-26" : "h-auto"
            )}
          >
            {viewMode === "month" ? (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                locale={bg}
                numberOfMonths={1}
                weekStartsOn={1}
              />
            ) : (
              <WeeklyCalendar
                selectedDate={selectedDate || new Date()}
                onSelectDate={setSelectedDate}
                uniqueDates={uniqueDates}
                onPreviousWeek={handlePreviousWeek}
                onNextWeek={handleNextWeek}
              />
            )}
          </div>

          <Button
            variant="ghost"
            onClick={() => setViewMode(viewMode === "week" ? "month" : "week")}
            className="mt-2"
          >
            {viewMode === "week" ? (
              <>
                <ChevronDown className="h-4 w-4 mr-2" /> Разшири
              </>
            ) : (
              <>
                <ChevronUp className="h-4 w-4 mr-2" /> Свий
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Търсене */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Търсене по име..."
          className="pl-10 pr-4 py-2 rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Списък със срещи */}
      <div
        className="flex-1 overflow-y-auto space-y-4 p-4 -mt-4 relative"
        ref={containerRef}
      >
        {Object.keys(groupedAppointments).length > 0 ? (
          Object.entries(groupedAppointments).map(([date, appointments]) => (
            <div
              key={date}
              ref={(el) => {
                if (el) appointmentRefs.current[date] = el;
              }}
              data-date={appointments[0].appointmentTime.start}
            >
              <h2 className="font-semibold text-lg sticky top-0 bg-white dark:bg-black py-2 z-10">
                {date}
              </h2>
              {appointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="p-4 border rounded-lg shadow-sm mb-2 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <User className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold text-lg">
                      {appointment.clientName}
                    </h3>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-purple-500" />
                      <p>{appointment.serviceName}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-green-500" />
                      <p>{appointment.appointmentTime.start}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Статус: {appointment.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground mt-8">Няма срещи.</p>
        )}
      </div>
    </div>
  );
}
