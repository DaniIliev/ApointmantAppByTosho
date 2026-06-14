import { formatDateAndTime } from "@/Global/Utils/commonFn";

export const formatAxisLabel = (value: unknown) => {
  if (value instanceof Date || typeof value === "string") {
    // Basic heuristics for determining if string is a date-like "2024-05-15"
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return formatDateAndTime(value, "date");
    }
  }
  return `${value ?? ""}`;
};

export const inferDimension = (source?: string, metric?: string, type?: string) => {
  const isPieChart = type === "pie";

  if (source === "appointments") {
    if (metric === "by_service") return "by_service";
    if (metric === "by_staff" || metric === "appointments_count") return "by_staff";
    if (metric === "by_status") return "by_status";
    if (metric === "by_category") return "by_category";
    if (metric === "count") return isPieChart ? "by_status" : "time_series";
    return isPieChart ? "by_service" : "time_series";
  }
  if (source === "staff") {
    if (metric === "appointments_count" || metric === "by_staff") return "by_staff";
    return "by_staff";
  }
  if (source === "revenue") {
    if (metric === "by_service") return "by_service";
    if (metric === "by_staff") return "by_staff";
    if (metric === "count") return isPieChart ? "by_service" : "time_series";
    return isPieChart ? "by_service" : "time_series";
  }
  if (source === "services") {
    if (metric === "metrics") return "metrics";
    return "popularity";
  }
  return isPieChart ? "by_service" : "time_series";
};

export const transformAnalyticsData = (
  source: string,
  dimension: string,
  rows: Array<Record<string, unknown>>
) => {
  let data: Array<Record<string, string | number>> = [];
  let dataKeys: string[] = [];
  const xAxisKey = "name";

  if (source === "appointments") {
    if (dimension === "time_series") {
      data = rows.map((r) => ({
        name: formatAxisLabel(r.name),
        count: Number(r.total ?? 0),
        completed: Number((r as Record<string, unknown>).completed ?? 0),
        cancelled: Number((r as Record<string, unknown>).cancelled ?? 0),
        upcoming: Number((r as Record<string, unknown>).upcoming ?? 0),
      }));
      dataKeys = ["count", "completed", "cancelled", "upcoming"];
    } else if (dimension === "by_service" || dimension === "by_category") {
      data = rows.map((r) => ({
        name: (r.name as string) || (r._id as string) || "",
        count: Number((r.value as number) ?? (r.count as number) ?? 0),
      }));
      dataKeys = ["count"];
    } else if (dimension === "by_status") {
      data = rows.map((r) => ({
        name: (r.name as string) || (r._id as string) || "",
        count: Number((r.value as number) ?? 0),
      }));
      dataKeys = ["count"];
    } else if (dimension === "by_staff") {
      data = rows.map((r) => ({
        name: (r.name as string) || "",
        count: Number((r.total as number) ?? 0),
        completed: Number((r.completed as number) ?? 0),
        cancelled: Number((r.cancelled as number) ?? 0),
        upcoming: Number((r.upcoming as number) ?? 0),
      }));
      dataKeys = ["count", "completed", "cancelled", "upcoming"];
    }
  } else if (source === "staff") {
    // Treat staff analytics the same as appointments by staff
    if (dimension === "by_staff" || dimension === "time_series") {
      data = rows.map((r) => ({
        name: formatAxisLabel(r.name),
        count: Number((r.total as number) ?? 0),
        completed: Number((r.completed as number) ?? 0),
        cancelled: Number((r.cancelled as number) ?? 0),
        upcoming: Number((r.upcoming as number) ?? 0),
      }));
      dataKeys = ["count", "completed", "cancelled", "upcoming"];
    }
  } else if (source === "revenue") {
    if (dimension === "time_series") {
      data = rows.map((r) => ({
        name: formatAxisLabel(r.name),
        revenue: Number((r.revenue as number) ?? (r.value as number) ?? 0),
      }));
      dataKeys = ["revenue"];
    } else if (dimension === "by_service" || dimension === "by_staff") {
      data = rows.map((r) => ({
        name: (r.name as string) || "",
        revenue: Number((r.value as number) ?? 0),
      }));
      dataKeys = ["revenue"];
    }
  } else if (source === "services") {
    if (dimension === "metrics") {
      data = rows.map((r) => ({
        name: (r.name as string) || "",
        duration: Number((r as Record<string, unknown>).duration ?? 0),
        price: Number((r as Record<string, unknown>).price ?? 0),
        bookings: Number((r as Record<string, unknown>).bookings ?? 0),
      }));
      dataKeys = ["duration", "price", "bookings"];
    } else {
      data = rows.map((r) => ({
        name: (r.name as string) || "",
        bookings: Number((r.value as number) ?? (r.bookings as number) ?? 0),
      }));
      dataKeys = ["bookings"];
    }
  } else {
    data = rows.map((r) => ({
      name: (r.name as string) || "",
      value: Number((r.value as number) ?? 0),
    }));
    dataKeys = ["value"];
  }

  return { data, dataKeys, xAxisKey };
};

export const calculatePercentageChange = (
  current: number,
  previous: number
): { value: number; type: "increase" | "decrease" | "neutral" } => {
  if (previous === 0) {
    return {
      value: current > 0 ? 100 : 0,
      type: current > 0 ? "increase" : "neutral",
    };
  }
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(change),
    type: change > 0.1 ? "increase" : change < -0.1 ? "decrease" : "neutral",
  };
};
