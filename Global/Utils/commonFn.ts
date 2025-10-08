import { parseISO } from "date-fns";
import { format } from "date-fns/format";
import { isValid } from "date-fns/isValid";

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
