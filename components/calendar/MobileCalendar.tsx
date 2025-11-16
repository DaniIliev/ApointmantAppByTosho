"use state";
import * as React from "react";
import {
  format,
  parseISO,
  isSameDay,
  addWeeks,
  addDays,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
} from "date-fns";
import { bg } from "date-fns/locale";
import {
  Search,
  User,
  Clock,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { Appointment } from "@/Global/Types/types";
import { getStatusColor } from "@/Global/Utils/statusIndicator";

const cn = (...classes: (string | boolean | undefined | null)[]): string =>
  classes.filter(Boolean).join(" ");

interface AppointmentCardProps {
  appointment: Appointment;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  return (
    <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mb-2 hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between space-x-2 mb-1 pb-1 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-lg flex items-center space-x-1">
          <User className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          <span>{appointment.clientName}</span>
        </h3>
        <span
          className={cn(
            "text-xs font-medium px-2 py-1 rounded-full text-white",
            getStatusColor(appointment.status)
          )}
        >
          {appointment.status}
        </span>
      </div>
      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center space-x-2">
          <CalendarDays className="h-4 w-4 text-purple-500" />
          <p>
            {format(parseISO(appointment.appointmentTime.start), "dd.MM.yyyy")}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-green-500" />
          <p>{appointment.appointmentTime.start}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Briefcase className="h-4 w-4 text-blue-500" />
          <p>{appointment.serviceName}</p>
        </div>
      </div>
    </div>
  );
};

interface WeeklyCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  uniqueDates: Record<string, boolean>;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  selectedDate,
  onSelectDate,
  uniqueDates,
  onPreviousWeek,
  onNextWeek,
}) => {
  const startOfTheWeek: Date = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays: Date[] = [...Array(7)].map((_, i) =>
    addDays(startOfTheWeek, i)
  );

  const monthYearTitle: string = format(selectedDate, "MMMM yyyy", {
    locale: bg,
  });
  const capitalizedMonth: string =
    monthYearTitle.charAt(0).toUpperCase() + monthYearTitle.slice(1);

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-2 px-2">
        <button
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={onPreviousWeek}
          aria-label="Previous week"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-bold text-lg">{capitalizedMonth}</span>
        <button
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={onNextWeek}
          aria-label="Next week"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="flex justify-between items-center p-2 pb-3">
        {weekDays.map((date: Date) => (
          <button
            key={date.toString()}
            onClick={() => onSelectDate(date)}
            className={cn(
              "flex flex-col items-center p-2 rounded-full transition-colors w-1/7",
              "hover:bg-gray-200 dark:hover:bg-gray-800",
              isSameDay(date, selectedDate)
                ? "font-bold text-blue-600 dark:text-blue-400"
                : uniqueDates[format(date, "yyyy-MM-dd")]
                ? "font-bold text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400"
            )}
          >
            <span className="text-xs">
              {format(date, "EE", { locale: bg })}
            </span>
            <span
              className={cn(
                "text-lg font-semibold w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                isSameDay(date, selectedDate)
                  ? "ring-2 ring-blue-600 bg-blue-100 dark:bg-blue-900"
                  : ""
              )}
            >
              {format(date, "d")}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

interface MonthlyCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  uniqueDates: Record<string, boolean>;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  selectedDate,
  onSelectDate,
  uniqueDates,
  onPreviousMonth,
  onNextMonth,
}) => {
  const start: Date = startOfMonth(selectedDate);
  const end: Date = endOfMonth(selectedDate);
  const allDates: Date[] = eachDayOfInterval({ start, end });

  const daysOfWeek: string[] = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

  return (
    <div className="flex flex-col w-full p-2">
      <div className="flex justify-between items-center mb-2 px-2">
        <button
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={onPreviousMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center font-bold text-lg">
          {format(selectedDate, "MMMM yyyy", { locale: bg })}
        </div>
        <button
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={onNextMonth}
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
        {daysOfWeek.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {allDates.map((date: Date) => (
          <button
            key={date.toString()}
            onClick={() => onSelectDate(date)}
            className={cn(
              "flex flex-col items-center p-2 rounded-lg transition-colors",
              "hover:bg-gray-200 dark:hover:bg-gray-800",
              isSameDay(date, selectedDate)
                ? "font-bold text-blue-600 dark:text-blue-400"
                : uniqueDates[format(date, "yyyy-MM-dd")]
                ? "font-bold text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400"
            )}
          >
            <span
              className={cn(
                "text-sm font-semibold w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                isSameDay(date, selectedDate)
                  ? "ring-2 ring-blue-600 bg-blue-100 dark:bg-blue-900"
                  : ""
              )}
            >
              {format(date, "d")}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

interface MobileCalendarProps {
  appointments: Appointment[];
}

const MobileCalendar = ({ appointments }: MobileCalendarProps) => {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isMonthlyView, setIsMonthlyView] = React.useState<boolean>(false);

  // const appointments: Appointment[] = mockAppointments;

  const appointmentRefs = React.useRef<Record<string, HTMLDivElement | null>>(
    {}
  );
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isUserScrolling = React.useRef<boolean>(false);

  const sortedAppointments: Appointment[] = React.useMemo(() => {
    return [...appointments].sort(
      (a, b) =>
        parseISO(a.appointmentTime.start).getTime() -
        parseISO(b.appointmentTime.start).getTime()
    );
  }, [appointments]);

  const allDatesInYear: Date[] = React.useMemo(() => {
    const currentYear: number = selectedDate.getFullYear();
    const startDate: Date = new Date(currentYear, 0, 1);
    const endDate: Date = new Date(currentYear, 11, 31);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [selectedDate]);

  const groupedAppointments: Record<string, Appointment[]> =
    React.useMemo(() => {
      const groups: Record<string, Appointment[]> = {};
      sortedAppointments.forEach((appointment) => {
        const dateKey: string = format(
          parseISO(appointment.appointmentTime.start),
          "dd MMMM yyyy г.",
          {
            locale: bg,
          }
        );
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(appointment);
      });
      return groups;
    }, [sortedAppointments]);

  const uniqueDates: Record<string, boolean> = React.useMemo(() => {
    return appointments.reduce(
      (acc: Record<string, boolean>, appointment: Appointment) => {
        const date: Date = parseISO(appointment.appointmentTime.start);
        const key: string = format(date, "yyyy-MM-dd");
        if (!acc[key]) {
          acc[key] = true;
        }
        return acc;
      },
      {}
    );
  }, [appointments]);

  const handleSelectDate = (date: Date): void => {
    isUserScrolling.current = true;
    setSelectedDate(date);

    const dateKey: string = format(date, "dd MMMM yyyy г.", { locale: bg });
    const element: HTMLDivElement | null = appointmentRefs.current[dateKey];
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
      setTimeout(() => {
        isUserScrolling.current = false;
      }, 500);
    } else {
      isUserScrolling.current = false;
    }
  };

  const handlePreviousWeek = (): void => {
    isUserScrolling.current = true;
    setSelectedDate((prevDate) => addWeeks(prevDate, -1));
    setTimeout(() => {
      isUserScrolling.current = false;
    }, 500);
  };

  const handleNextWeek = (): void => {
    isUserScrolling.current = true;
    setSelectedDate((prevDate) => addWeeks(prevDate, 1));
    setTimeout(() => {
      isUserScrolling.current = false;
    }, 500);
  };

  const handlePreviousMonth = (): void => {
    isUserScrolling.current = true;
    setSelectedDate((prevDate) => subMonths(prevDate, 1));
    setTimeout(() => {
      isUserScrolling.current = false;
    }, 500);
  };

  const handleNextMonth = (): void => {
    isUserScrolling.current = true;
    setSelectedDate((prevDate) => addMonths(prevDate, 1));
    setTimeout(() => {
      isUserScrolling.current = false;
    }, 500);
  };

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isUserScrolling.current) return;

        const firstVisibleEntry = entries.find((entry) => entry.isIntersecting);
        if (firstVisibleEntry) {
          const dateKey = firstVisibleEntry.target.getAttribute("data-date");
          if (dateKey) {
            const newDate: Date = parseISO(dateKey);
            if (!isSameDay(newDate, selectedDate)) {
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

  React.useEffect(() => {
    setTimeout(() => {
      handleSelectDate(new Date());
    }, 100);
  }, []);

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-white dark:bg-black text-gray-900 dark:text-gray-100 font-sans">
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        .font-sans {
            font-family: 'Inter', sans-serif;
        }
        
        /* Custom scrollbar for better mobile UX */
        .scrolling-container::-webkit-scrollbar {
          width: 8px;
        }
        .scrolling-container::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .scrolling-container::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        .scrolling-container::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        /* Remove extra top scroll padding to align first day flush under search */
        .scrolling-container { scroll-padding-top: 0; }
        `}
      </style>

      {/* Calendar header and weekly/monthly view */}
      <div className="p-4 mb-4 rounded-lg shadow-md bg-gray-50 dark:bg-gray-900">
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out w-full",
            isMonthlyView ? "h-auto" : "h-28"
          )}
        >
          {isMonthlyView ? (
            <MonthlyCalendar
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              uniqueDates={uniqueDates}
              onPreviousMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
            />
          ) : (
            <WeeklyCalendar
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              uniqueDates={uniqueDates}
              onPreviousWeek={handlePreviousWeek}
              onNextWeek={handleNextWeek}
            />
          )}
        </div>

        <button
          className="w-full text-center p-2 mt-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          onClick={() => setIsMonthlyView(!isMonthlyView)}
        >
          {isMonthlyView ? "Свий" : "Разшири"}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-0 px-4">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Търсене по име..."
          className="w-full pl-10 pr-4 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
        />
      </div>

      {/* Appointments List */}
      <div
        className="flex-1 overflow-y-auto space-y-4 px-4 pb-4 scrolling-container"
        ref={containerRef}
      >
        {allDatesInYear.length > 0 ? (
          allDatesInYear.map((date: Date) => {
            const dateKey: string = format(date, "dd MMMM yyyy г.", {
              locale: bg,
            });
            const appointmentsForDate: Appointment[] =
              groupedAppointments[dateKey] || [];
            const filteredAppointments = appointmentsForDate.filter((apt) =>
              apt.clientName.toLowerCase().includes(searchQuery.toLowerCase())
            );

            return (
              <div key={dateKey}>
                <h2
                  className="font-semibold text-lg sticky top-0 py-2 z-10 bg-white dark:bg-black"
                  ref={(el: HTMLDivElement | null) => {
                    if (el) appointmentRefs.current[dateKey] = el;
                  }}
                  data-date={format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'")}
                >
                  {dateKey}
                </h2>
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment: Appointment) => (
                    <AppointmentCard
                      key={appointment._id}
                      appointment={appointment}
                    />
                  ))
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700">
                    Няма срещи.
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
            Няма срещи.
          </p>
        )}
      </div>
    </div>
  );
};

export default MobileCalendar;
