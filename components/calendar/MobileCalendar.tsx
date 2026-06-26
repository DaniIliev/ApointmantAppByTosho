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
  CreditCard,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Appointment, AppointmentStatus } from "@/Global/Types/types";
import {
  groupAppointments,
  GroupedAppointment,
} from "@/Global/Utils/groupingUtils";
import { useTranslation } from "react-i18next";
import { formatDateAndTime } from "@/Global/Utils/commonFn";
import { CustomTooltip } from "../customUIComponents/CustomTooltip";
import { getStatusProps, StatusChip } from "../customUIComponents/StatusChip";
import { dayTitles } from "@/app/schedule/utils";
import { LabeledInput } from "../customUIComponents/LabeledInput";

const cn = (...classes: (string | boolean | undefined | null)[]): string =>
  classes.filter(Boolean).join(" ");

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onClick,
}) => {
  const { t } = useTranslation();
  const statusProps = getStatusProps(appointment.status as AppointmentStatus);
  return (
    <div
      className="p-2 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm mb-2 hover:shadow-md transition-shadow bg-white dark:bg-gray-800 cursor-pointer"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center justify-between space-x-2 mb-1.5 pb-1 border-b border-gray-100 dark:border-gray-700/50">
        <h3 className="font-semibold text-sm flex items-center space-x-1.5">
          <User className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
          <span className="truncate max-w-[150px]">
            {appointment.clientName}
          </span>
        </h3>
        <div className="flex-shrink-0">
          <div
            className={`${statusProps.className} rounded-full h-2 w-2 border`}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
        <div className="flex items-center space-x-1.5 font-medium text-gray-800 dark:text-gray-200">
          <Clock className="h-3 w-3 text-primary" />
          <p className="flex items-center gap-1">
            {(appointment.paymentStatus === "captured" ||
              appointment.paymentStatus === "authorized" ||
              appointment.serviceName === "card") && (
              <CreditCard className="w-3 h-3 text-green-500 flex-shrink-0" />
            )}
            {formatDateAndTime(appointment.appointmentTime.start, "time")} -{" "}
            {formatDateAndTime(appointment.appointmentTime.end, "time")}
          </p>
        </div>
        <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 truncate ml-2">
          <Briefcase className="h-3 w-3 text-primary/70 flex-shrink-0" />
          <span className="truncate max-w-[120px]">
            {appointment.serviceName}
          </span>
        </div>
      </div>
    </div>
  );
};

interface GroupedAppointmentAccordionProps {
  group: GroupedAppointment;
  onSelectAppointment: (appointment: Appointment) => void;
  openDetailsModal: () => void;
}

const GroupedAppointmentAccordion: React.FC<
  GroupedAppointmentAccordionProps
> = ({ group, onSelectAppointment, openDetailsModal }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const mainApt = group.mainAppointment;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-md shadow-sm mb-2 hover:shadow-md transition-shadow bg-white dark:bg-gray-800 overflow-hidden">
      <div
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3 truncate">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Briefcase className="h-4 w-4 text-primary" />
          </div>
          <div className="truncate">
            <h3 className="font-semibold text-sm truncate">
              {mainApt.serviceName}
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>
                  {formatDateAndTime(mainApt.appointmentTime.start, "time")}
                </span>
              </span>
              <span className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{group.count}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 ml-2">
          <div className="flex items-center">
            <div
              className={`${
                getStatusProps("confirmed").className
              } rounded-full h-2 w-2 border mr-2 shadow-sm`}
            ></div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-gray-100 dark:border-gray-700/50 pt-3 animate-in fade-in slide-in-from-top-1 duration-200">
          {group.appointments.map((apt) => (
            <div
              key={apt._id}
              className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
              onClick={() => {
                onSelectAppointment(apt);
                openDetailsModal();
              }}
            >
              <div className="flex items-center space-x-2 overflow-hidden">
                <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="text-sm truncate font-medium">
                  {apt.clientName}
                </span>
                {apt.paymentStatus === "captured" && (
                  <CreditCard className="h-3 w-3 text-green-500 shrink-0" />
                )}
              </div>
              <div
                className={`${
                  getStatusProps(apt.status as AppointmentStatus).className
                } rounded-full h-2 w-2 border shrink-0 ml-2`}
              ></div>
            </div>
          ))}
        </div>
      )}
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
  const { t } = useTranslation();
  const startOfTheWeek: Date = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays: Date[] = [...Array(7)].map((_, i) =>
    addDays(startOfTheWeek, i),
  );

  const monthYearTitle: string = format(selectedDate, "MMMM yyyy", {
    locale: bg,
  });
  const capitalizedMonth: string =
    monthYearTitle.charAt(0).toUpperCase() + monthYearTitle.slice(1);
    
  const today = new Date();

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
        {weekDays.map((date: Date) => {
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selectedDate);
          const hasAppts = uniqueDates[format(date, "yyyy-MM-dd")];
          const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
          const dayNameLabel = t(dayTitles[dayIndex]);
          
          return (
            <button
              key={date.toString()}
              onClick={() => onSelectDate(date)}
              className={cn(
                "flex flex-col items-center p-2 rounded-xl transition-colors w-1/7 relative",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                isSelected
                  ? "font-bold text-primary dark:primary-light"
                  : hasAppts
                    ? "font-bold text-primary dark:primary-light"
                    : "text-gray-600 dark:text-gray-400",
              )}
            >
              <span className="text-xs uppercase tracking-wide opacity-80 mb-1">
                {dayNameLabel}
              </span>
              <span
                className={cn(
                  "relative text-lg font-semibold w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                  isSelected
                    ? "ring-2 ring-primary/30 bg-primary text-primary-foreground shadow-sm"
                    : "",
                )}
              >
                {format(date, "d")}
                {isToday && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-red-500 shadow-sm" />
                )}
              </span>
            </button>
          );
        })}
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
  const { t } = useTranslation();
  const start: Date = startOfMonth(selectedDate);
  const end: Date = endOfMonth(selectedDate);
  const allDates: Date[] = eachDayOfInterval({ start, end });
  const leadingEmptyDays: number = (start.getDay() + 6) % 7;
  const today = new Date();

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
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400 mb-2">
        {dayTitles.map((dayTitle) => (
          <span key={dayTitle}>{t(dayTitle)}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingEmptyDays }).map((_, index) => (
          <div key={`empty-${index}`} className="h-10" aria-hidden="true" />
        ))}
        {allDates.map((date: Date) => {
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selectedDate);
          const hasAppts = uniqueDates[format(date, "yyyy-MM-dd")];

          return (
            <button
              key={date.toString()}
              onClick={() => onSelectDate(date)}
              className={cn(
                "flex flex-col items-center p-2 rounded-xl transition-colors relative",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                isSelected
                  ? "font-bold text-primary dark:primary-light"
                  : hasAppts
                    ? "font-bold text-primary dark:primary-light"
                    : "text-gray-600 dark:text-gray-400",
              )}
            >
              <span
                className={cn(
                  "relative text-[13px] font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-colors",
                  isSelected
                    ? "ring-2 ring-primary/30 bg-primary text-primary-foreground shadow-sm"
                    : "",
                )}
              >
                {format(date, "d")}
                {isToday && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-red-500 shadow-sm" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface MobileCalendarProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  openDetailsModal: () => void;
}

const MobileCalendar = ({
  appointments,
  onSelectAppointment,
  openDetailsModal,
}: MobileCalendarProps) => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isMonthlyView, setIsMonthlyView] = React.useState<boolean>(false);

  // const appointments: Appointment[] = mockAppointments;

  const appointmentRefs = React.useRef<Record<string, HTMLDivElement | null>>(
    {},
  );
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isUserScrolling = React.useRef<boolean>(false);

  const sortedAppointments: Appointment[] = React.useMemo(() => {
    return [...appointments].sort(
      (a, b) =>
        parseISO(a.appointmentTime.start).getTime() -
        parseISO(b.appointmentTime.start).getTime(),
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
          },
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
      {},
    );
  }, [appointments]);

  const handleSelectDate = (date: Date, smoothScroll = true): void => {
    isUserScrolling.current = true;
    setSelectedDate(date);

    const dateKey: string = format(date, "dd MMMM yyyy г.", { locale: bg });
    const element: HTMLDivElement | null = appointmentRefs.current[dateKey];
    if (element) {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: element.offsetTop,
          behavior: smoothScroll ? "smooth" : "auto",
        });
      }
      // Allow enough time for smooth scroll to finish before listening to intersection observer again
      setTimeout(() => {
        isUserScrolling.current = false;
      }, 700);
    } else {
      isUserScrolling.current = false;
    }
  };

  const handlePreviousWeek = () => handleSelectDate(addWeeks(selectedDate, -1));
  const handleNextWeek = () => handleSelectDate(addWeeks(selectedDate, 1));
  const handlePreviousMonth = () => handleSelectDate(subMonths(selectedDate, 1));
  const handleNextMonth = () => handleSelectDate(addMonths(selectedDate, 1));

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isUserScrolling.current) return;

        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          const dateKey = visibleEntry.target.getAttribute("data-date");
          if (dateKey) {
            const newDate: Date = parseISO(dateKey);
            setSelectedDate((prevDate) => {
              if (!isSameDay(newDate, prevDate)) {
                return newDate;
              }
              return prevDate;
            });
          }
        }
      },
      {
        root: containerRef.current,
        // Wider band to capture fast scrolling reliably
        rootMargin: "-10% 0px -70% 0px",
        threshold: 0,
      },
    );

    Object.values(appointmentRefs.current).forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [groupedAppointments]);

  React.useEffect(() => {
    setTimeout(() => {
      handleSelectDate(new Date(), false);
    }, 100);
  }, []);

  return (
    <div className="flex flex-col h-full mx-auto bg-white dark:bg-black text-gray-900 dark:text-gray-100 font-sans">
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
            isMonthlyView ? "h-auto" : "h-28",
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
          className="w-full text-center p-2 mt-2 text-sm font-semibold text-primary dark:text-primary hover:underline"
          onClick={() => setIsMonthlyView(!isMonthlyView)}
        >
          {isMonthlyView ? t("Collapse") : t("Expand")}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-0 px-4">
        <Search className="h-4 w-4 absolute right-7 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
        <LabeledInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          label={t("Search appointments...")}
          id={"search-appointments"}
          className="w-5"
        />
      </div>
      {/* Appointments List */}
      <div
        className="flex-1 overflow-y-auto px-4 scrolling-container relative"
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
              apt.clientName.toLowerCase().includes(searchQuery.toLowerCase()),
            );

            return (
              <div key={dateKey}>
                <h2
                  className="font-semibold text-lg sticky top-0 py-2 bg-white dark:bg-black"
                  ref={(el: HTMLDivElement | null) => {
                    if (el) appointmentRefs.current[dateKey] = el;
                  }}
                  data-date={format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'")}
                >
                  {dateKey}
                </h2>
                {filteredAppointments.length > 0 ? (
                  groupAppointments(filteredAppointments).map((item, idx) => {
                    if ("isGroup" in item && item.isGroup) {
                      return (
                        <GroupedAppointmentAccordion
                          key={`${dateKey}-group-${idx}`}
                          group={item as GroupedAppointment}
                          onSelectAppointment={onSelectAppointment}
                          openDetailsModal={openDetailsModal}
                        />
                      );
                    } else {
                      const appointment = item as Appointment;
                      return (
                        <AppointmentCard
                          key={appointment._id}
                          appointment={appointment}
                          onClick={() => {
                            onSelectAppointment(appointment);
                            openDetailsModal();
                          }}
                        />
                      );
                    }
                  })
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700">
                    {t("No appointments.")}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
            {t("No appointments.")}
          </p>
        )}
      </div>
    </div>
  );
};

export default MobileCalendar;
