// components/ScheduleCalendarView.js

import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isSameMonth,
  isBefore,
  isAfter,
} from "date-fns";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ListRestart,
  ChevronLeft,
  ChevronRight,
  Clock, // Добавена иконка за работно време
  Coffee, // Добавена иконка за почивки
  Sun,
  Home,
} from "lucide-react";
import MobileScheduleCalendar from "./MobileScheduleCalendar";

type TimeRange = {
  start: string;
  end: string;
};

export type WorkHours = {
  _id: string;
  day: string;
  date: Date;
  isDayOff: boolean;
  workTime: TimeRange | null;
  breaks: TimeRange[];
};

interface ScheduleCalendarViewProps {
  dailyData: WorkHours[];
  onEditDay: (dayData: WorkHours) => void;
}

const createDummyDay = (id: string) => ({
  _id: id,
  day: "",
  date: new Date(0),
  isDayOff: true,
  workTime: null,
  breaks: [],
  isPlaceholder: true, // Маркер за празна клетка
});

/**
 * Групира дните от графика по седмици за дадения месец.
 * Добавя placeholder обекти за дните извън обхвата на месеца.
 */
const groupIntoWeeksForMonth = (allData: WorkHours[], monthDate: Date) => {
  const startOfTargetMonth = startOfMonth(monthDate);

  // 1. Филтрираме данните само за текущия месец
  const monthData = allData
    .filter((day) => isSameMonth(day.date, monthDate))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (monthData.length === 0) {
    return [];
  }

  const weeks: (WorkHours & { isPlaceholder?: boolean })[][] = [];
  let currentWeek: (WorkHours & { isPlaceholder?: boolean })[] = [];

  // 2. Намираме кой ден от седмицата е първият ден от месеца
  const firstDayOfMonth = startOfTargetMonth;
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0-Неделя, 1-Понеделник...

  // 3. Добавяме празни места в началото на първата седмица
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(createDummyDay(`dummy-start-${i}`));
  }

  // 4. Добавяме дните от месеца
  for (const day of monthData) {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  }

  // 5. Добавяме последната недовършена седмица и я запълваме с празни места
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(createDummyDay(`dummy-end-${currentWeek.length}`));
    }
    weeks.push(currentWeek);
  }

  return weeks;
};

// =======================================================
// КОМПОНЕНТ
// =======================================================

export default function ScheduleCalendarView({
  dailyData,
  onEditDay,
}: ScheduleCalendarViewProps) {
  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Няма данни за графика.
      </div>
    );
  }

  // Сортираме всички данни и намираме границите (първи и последен ден)
  const sortedAllData = useMemo(
    () => [...dailyData].sort((a, b) => a.date.getTime() - b.date.getTime()),
    [dailyData]
  );

  const firstAvailableMonth = startOfMonth(sortedAllData[0].date);
  const lastAvailableMonth = startOfMonth(
    sortedAllData[sortedAllData.length - 1].date
  );
  const currentMonth = startOfMonth(new Date());

  // ЛОГИКА ЗА ПЪРВОНАЧАЛНА ДАТА (отваряме на текущия месец, ако е в обхвата)
  let initialDate: Date;

  if (
    (isSameMonth(currentMonth, firstAvailableMonth) ||
      isAfter(currentMonth, firstAvailableMonth)) &&
    (isSameMonth(currentMonth, lastAvailableMonth) ||
      isBefore(currentMonth, lastAvailableMonth))
  ) {
    initialDate = currentMonth;
  } else {
    initialDate = firstAvailableMonth;
  }

  const [currentDate, setCurrentDate] = useState(initialDate);

  // Групираме дните само за текущия месец
  const weeks = useMemo(
    () => groupIntoWeeksForMonth(dailyData, currentDate),
    [dailyData, currentDate]
  );

  // --- Навигационна Логика ---

  const handlePrevMonth = () => {
    const newDate = subMonths(currentDate, 1);
    if (
      isBefore(newDate, firstAvailableMonth) &&
      !isSameMonth(newDate, firstAvailableMonth)
    )
      return;
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    if (
      isAfter(newDate, lastAvailableMonth) &&
      !isSameMonth(newDate, lastAvailableMonth)
    )
      return;
    setCurrentDate(newDate);
  };

  const isFirstMonth = isSameMonth(currentDate, firstAvailableMonth);
  const isLastMonth = isSameMonth(currentDate, lastAvailableMonth);

  const daysOfWeek = [
    "Неделя",
    "Понеделник",
    "Вторник",
    "Сряда",
    "Четвъртък",
    "Петък",
    "Събота",
  ];

  return (
    <>
      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileScheduleCalendar dailyData={dailyData} onEditDay={onEditDay} />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block space-y-1 p-2">
        {/* Header: Име на месеца и Навигация */}
        <div className="flex justify-between items-center p-2 mb-2 border-b">
          {/* Лява Стрелка */}
          <button
            onClick={handlePrevMonth}
            disabled={isFirstMonth}
            className={`p-2 rounded-full transition-colors ${
              isFirstMonth
                ? "text-gray-300 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
            aria-label="Предишен месец"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Име на Месеца */}
          <h2 className="text-xl font-bold text-foreground capitalize">
            {/* Форматиране на месеца и годината (напр. "Октомври 2025") */}
            {format(currentDate, "MMMM yyyy")}
          </h2>

          {/* Дясна Стрелка */}
          <button
            onClick={handleNextMonth}
            disabled={isLastMonth}
            className={`p-2 rounded-full transition-colors ${
              isLastMonth
                ? "text-gray-300 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
            aria-label="Следващ месец"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Заглавие на дните от седмицата */}
        <div className="grid grid-cols-7 gap-2 bg-background p-2 border-b">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-sm font-semibold text-muted-foreground">
                {day.substring(0, 3)}
              </div>
            </div>
          ))}
        </div>

        {/* Календарна мрежа по седмици */}
        <div className="space-y-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {week.map((dayData, dayIndex) => {
                const isPlaceholder = (dayData as any).isPlaceholder;

                if (isPlaceholder) {
                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="min-h-[140px] rounded-lg bg-gray-50/50 border border-gray-200 opacity-50 flex items-center justify-center p-2 text-center"
                    >
                      <div className="text-sm font-medium text-gray-500 italic">
                        Извън обхват
                      </div>
                    </div>
                  );
                }

                const isToday =
                  new Date().toDateString() === dayData.date.toDateString();

                return (
                  <div
                    key={dayData._id}
                    onClick={() => onEditDay(dayData)}
                    className={`min-h-[140px] p-2 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-lg
										${
                      dayData.isDayOff
                        ? "bg-primary/20 border-primary/20"
                        : "bg-primary/20 border-primary/20"
                    }
										${
                      isToday
                        ? "ring-2 ring-primary border-primary/20 shadow-md shadow-primary/20"
                        : "border-primary/20"
                    }
										`}
                  >
                    <div className="flex flex-col h-full">
                      {/* Дата и статус - с иконки */}
                      <div className="flex justify-between items-center text-sm font-semibold mb-1">
                        <span
                          className={`${
                            isToday ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {format(dayData.date, "dd")}
                        </span>
                        {/* Иконка за статус */}
                        <span
                          className={`text-xs font-medium flex items-center gap-1 ${
                            dayData.isDayOff ? "text-red-500" : "text-green-600"
                          }`}
                        >
                          {dayData.isDayOff ? (
                            <>
                              <Sun className="h-4 w-4" /> Почивен
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4" /> Работен
                            </>
                          )}
                        </span>
                      </div>
                      {!dayData.isDayOff && dayData.workTime && (
                        <div className="flex items-center text-primary justify-center text-center text-sm font-bold mt-1 bg-primary/5 rounded-md p-1 border border-gray-300 shadow-sm">
                          <Clock className="h-4 w-4 mr-1 text-primary" />
                          {dayData.workTime.start} - {dayData.workTime.end}
                        </div>
                      )}

                      {/* Почивки - с иконка и заглавие */}
                      {!dayData.isDayOff && dayData.breaks.length > 0 && (
                        <div className="text-xs text-gray-700 mt-2 space-y-0.5 overflow-hidden flex-grow border-t pt-1">
                          {/* Заглавие за почивките */}
                          <div className="flex items-center gap-1 font-semibold text-gray-600 mb-0.5">
                            <Coffee className="h-3 w-3 text-yellow-700" />
                            Почивки ({dayData.breaks.length}):
                          </div>
                          {dayData.breaks.map((br, i) => (
                            <span
                              key={i}
                              className="ml-3 block leading-tight truncate pl-1"
                            >
                              {br.start} - {br.end}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Почивен ден - голяма иконка */}
                      {dayData.isDayOff && (
                        <div className="text-center text-red-400/80 text-lg italic mt-1 flex-grow flex flex-col items-center justify-center space-y-2">
                          <Home className="h-6 w-6 text-red-400" />
                          <span>Почивен ден</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
