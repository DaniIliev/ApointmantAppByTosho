import { parseISO } from "date-fns";
import { format } from "date-fns/format";
import { isValid } from "date-fns/isValid";
import { Location } from "../Types/types";

export const getWeekDates = (date: Date) => {
  const week: Date[] = [];
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  startOfWeek.setDate(date.getDate() - day);
  for (let i = 0; i < 7; i++) {
    const weekDate = new Date(startOfWeek);
    weekDate.setDate(startOfWeek.getDate() + i);
    week.push(weekDate);
  }
  return week;
};

export const getMonthDates = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  const endDate = new Date(lastDay);

  startDate.setDate(firstDay.getDate() - firstDay.getDay());
  endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

  const dates: Date[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const formatDateAndTime = (
  date: Date | string,
  onlyOne?: "date" | "time" | "dateTime"
) => {
  let parsedDate: Date;

  // Handle string input (e.g., ISO string)
  if (typeof date === "string") {
    parsedDate = parseISO(date);
  } else {
    parsedDate = date;
  }
  // Validate the date
  if (!isValid(parsedDate)) {
    return `${date}`;
  }

  const dateResult = format(parsedDate, "dd.MM.yyyy");
  const timeResult = format(parsedDate, "HH:mm");

  if (onlyOne === "date") {
    return dateResult;
  }
  if (onlyOne === "time") {
    return timeResult;
  }
  if (onlyOne === "dateTime") {
    return `${dateResult}, ${timeResult}`;
  }

  return `${dateResult}, ${timeResult}`;
};

// Always format numbers as Euro currency. Locale defaults to bg-BG but can be overridden.
export const formatPriceEUR = (value: number, locale: string = "bg-BG") =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(value);

export const getInitials = (name: string) => {
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "";
  return (
    (parts[0][0]?.toUpperCase() || "") +
    (parts[parts.length - 1][0]?.toUpperCase() || "")
  );
};
export const capitalizeFirstLetter = (text: string) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const isBusinessOpenNow = (
  schedule: Location["schedule"]
): boolean => {
  if (!schedule || typeof schedule !== "object") {
    return false;
  }

  // 1. Вземане на текущия ден и час
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeInMinutes = currentHours * 60 + currentMinutes;

  // 2. Вземане на името на деня
  const todayName = getTodayDayName();

  // 3. Вземане на работното време за днес
  const hoursString = (schedule as any)[todayName]; // e.g., "08:00-17:00", "Почивен Ден", or "Няма зададен график"

  // Проверка за почивен ден или липса на график
  if (
    !hoursString ||
    hoursString === "Почивен Ден" ||
    hoursString === "Няма зададен график"
  ) {
    return false;
  }

  // 4. Парсване на времевия интервал (e.g., "08:00-17:00")
  const [startTimeStr, endTimeStr] = hoursString.split("-"); // ["08:00", "17:00"]

  if (!startTimeStr || !endTimeStr) {
    return false; // Невалиден формат
  }

  // Функция за преобразуване на "HH:MM" в минути
  const timeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const startTimeInMinutes = timeToMinutes(startTimeStr);
  let endTimeInMinutes = timeToMinutes(endTimeStr);

  // Обработка на преминаване през полунощ (ако е необходимо, напр. "22:00-02:00")
  // В твоя случай (08:00-17:00) това вероятно не е проблем, но е добра практика.
  if (endTimeInMinutes < startTimeInMinutes) {
    // Ако крайният час е по-малък от началния, добавяме 24 часа (1440 минути)
    // за да може сравнението да работи коректно в рамките на деня,
    // в който е започнало работното време.
    endTimeInMinutes += 24 * 60;
  }

  // 5. Проверка дали текущият час е в интервала
  // Ако текущият час е след полунощ и крайният час е минал полунощ,
  // трябва да добавим 24 часа и към текущото време за коректно сравнение.
  // За интервала 08:00-17:00, това не е необходимо.

  return (
    currentTimeInMinutes >= startTimeInMinutes &&
    currentTimeInMinutes <= endTimeInMinutes
  );
};

type DayName =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export const getTodayDayName = (): DayName => {
  const now = new Date();
  const dayIndex = now.getDay();

  const days: DayName[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  // 3. Връщане на името на деня
  return days[dayIndex];
};
