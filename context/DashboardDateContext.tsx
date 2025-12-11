import React, { createContext, useContext, useState } from "react";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DashboardDateContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  startDate: string;
  endDate: string;
  groupBy: "day" | "week" | "month";
  setGroupBy: (groupBy: "day" | "week" | "month") => void;
}

const DashboardDateContext = createContext<
  DashboardDateContextType | undefined
>(undefined);

export const DashboardDateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Default to current week
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfWeek,
    to: endOfWeek,
  });

  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");

  // Format dates to ISO string (YYYY-MM-DD)
  const formatDate = (date: Date | undefined): string => {
    if (!date) return new Date().toISOString().split("T")[0];
    return date.toISOString().split("T")[0];
  };

  const startDate = formatDate(dateRange.from);
  const endDate = formatDate(dateRange.to);

  return (
    <DashboardDateContext.Provider
      value={{
        dateRange,
        setDateRange,
        startDate,
        endDate,
        groupBy,
        setGroupBy,
      }}
    >
      {children}
    </DashboardDateContext.Provider>
  );
};

export const useDashboardDate = (): DashboardDateContextType => {
  const context = useContext(DashboardDateContext);
  if (!context) {
    throw new Error(
      "useDashboardDate must be used within DashboardDateProvider"
    );
  }
  return context;
};
