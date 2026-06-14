import callApi from "@/app/Api/callApi";
import { formatDateAndTime } from "@/Global/Utils/commonFn";

export type PreviewRequest = {
  chartType: string;
  dataSource: string;
  metric?: string;
  groupBy?: string;
  staffId?: string;
  serviceId?: string;
  locationId?: string;
  status?: string;
  startDate: string;
  endDate: string;
};

export type PreviewResponse = {
  data: Array<Record<string, unknown>>;
  dataKeys: string[];
  xAxisKey: string;
  seriesConfig?: Record<string, unknown>;
};

export function inferDimensionPreview(
  source?: string,
  metric?: string,
  type?: string
) {
  const isPieChart = type === "pie";

  if (source === "appointments") {
    if (metric === "by_service") return "by_service";
    if (metric === "by_staff" || metric === "appointments_count")
      return "by_staff";
    if (metric === "by_status") return "by_status";
    if (metric === "by_category") return "by_category";
    if (metric === "by_location") return "by_location";
    if (metric === "count") return isPieChart ? "by_status" : "time_series";
    return isPieChart ? "by_service" : "time_series";
  }
  if (source === "staff") {
    if (metric === "appointments_count" || metric === "by_staff")
      return "by_staff";
    return "by_staff";
  }
  if (source === "revenue") {
    if (metric === "by_service") return "by_service";
    if (metric === "by_staff") return "by_staff";
    if (metric === "by_location") return "by_location";
    if (metric === "count") return isPieChart ? "by_service" : "time_series";
    return isPieChart ? "by_service" : "time_series";
  }
  if (source === "services") {
    if (metric === "metrics") return "metrics";
    return "popularity";
  }
  return isPieChart ? "by_service" : "time_series";
}

export function transformPreviewData(
  source: string,
  dimension: string,
  rows: Array<Record<string, unknown>>
): {
  data: Array<Record<string, string | number>>;
  dataKeys: string[];
  xAxisKey: string;
} {
  let data: Array<Record<string, string | number>> = [];
  let dataKeys: string[] = [];
  const xAxisKey = "name";

  if (source === "appointments") {
    if (dimension === "time_series") {
      data = rows.map((r) => ({
        name: formatDateAndTime((r.name as string) || "", "date"),
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
    } else if (dimension === "by_location") {
      data = rows.map((r) => ({
        name: (r.name as string) || (r._id as string) || "Default / Unassigned",
        count: Number((r.value as number) ?? (r.count as number) ?? 0),
      }));
      dataKeys = ["count"];
    }
  } else if (source === "staff") {
    if (dimension === "by_staff" || dimension === "time_series") {
      data = rows.map((r) => ({
        name: (r.name as string) || "",
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
        name: formatDateAndTime((r.name as string) || "", "date"),
        revenue: Number((r.revenue as number) ?? (r.value as number) ?? 0),
      }));
      dataKeys = ["revenue"];
    } else if (dimension === "by_service" || dimension === "by_staff") {
      data = rows.map((r) => ({
        name: (r.name as string) || "",
        revenue: Number((r.value as number) ?? 0),
      }));
      dataKeys = ["revenue"];
    } else if (dimension === "by_location") {
      data = rows.map((r) => ({
        name: (r.name as string) || (r._id as string) || "Default / Unassigned",
        revenue: Number((r.value as number) ?? (r.revenue as number) ?? 0),
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
}

export async function fetchPreviewData(
  request: PreviewRequest
): Promise<PreviewResponse> {
  const {
    chartType,
    dataSource,
    metric,
    groupBy,
    staffId,
    serviceId,
    locationId,
    status,
    startDate,
    endDate,
  } = request;

  const dimension = inferDimensionPreview(dataSource, metric, chartType);
  const apiSource = dataSource === "staff" ? "appointments" : dataSource;
  const apiDimension = dataSource === "staff" ? "by_staff" : dimension;

  // Special handling for linebar comparison (current vs previous period)
  if (chartType === "linebar") {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationMs = end.getTime() - start.getTime();

    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setTime(prevStart.getTime() - durationMs);

    const currentParams = new URLSearchParams({
      source: apiSource,
      dimension: apiDimension,
      groupBy: groupBy || "day",
      period: "custom",
      from: startDate,
      to: endDate,
    });
    if (staffId) currentParams.set("staffId", staffId);

    const prevParams = new URLSearchParams({
      source: apiSource,
      dimension: apiDimension,
      groupBy: groupBy || "day",
      period: "custom",
      from: prevStart.toISOString().split("T")[0],
      to: prevEnd.toISOString().split("T")[0],
    });
    if (staffId) prevParams.set("staffId", staffId);
    if (locationId) prevParams.set("locationId", locationId);

    const currentRows = (await callApi(
      `/api/analytics?${currentParams.toString()}&t=${Date.now()}`,
      "GET"
    )) as Array<Record<string, unknown>>;
    const prevRows = (await callApi(
      `/api/analytics?${prevParams.toString()}&t=${Date.now()}`,
      "GET"
    )) as Array<Record<string, unknown>>;

    const merged: Array<Record<string, unknown>> = [];
    let dataKeys: string[] = [];
    let seriesConfig: Record<string, unknown> | undefined;

    if (apiSource === "appointments") {
      currentRows.forEach((curr, idx) => {
        const prev = prevRows[idx];
        merged.push({
          name: formatDateAndTime((curr.name as string) || "", "date"),
          count: Number(curr.total ?? 0),
          completed: Number(curr.completed ?? 0),
          cancelled: Number(curr.cancelled ?? 0),
          upcoming: Number(curr.upcoming ?? 0),
          prevCount: Number(prev?.total ?? 0),
          prevCompleted: Number(prev?.completed ?? 0),
          prevCancelled: Number(prev?.cancelled ?? 0),
          prevUpcoming: Number(prev?.upcoming ?? 0),
        });
      });
      dataKeys = ["count", "completed", "cancelled", "upcoming", "prevCount", "prevCompleted", "prevCancelled", "prevUpcoming"];
      seriesConfig = {
        barSeries: ["count", "completed", "cancelled", "upcoming"],
        lineSeries: ["prevCount", "prevCompleted", "prevCancelled", "prevUpcoming"],
      };
    } else if (apiSource === "revenue") {
      currentRows.forEach((curr, idx) => {
        const prev = prevRows[idx];
        merged.push({
          name: formatDateAndTime((curr.name as string) || "", "date"),
          revenue: Number(curr.revenue ?? curr.value ?? 0),
          prevRevenue: Number(prev?.revenue ?? prev?.value ?? 0),
        });
      });
      dataKeys = ["revenue", "prevRevenue"];
      seriesConfig = { barSeries: ["revenue"], lineSeries: ["prevRevenue"] };
    }

    return {
      data: merged,
      dataKeys,
      xAxisKey: "name",
      seriesConfig,
    };
  }

  const params = new URLSearchParams({
    source: apiSource,
    dimension: apiDimension,
    groupBy: groupBy || "day",
    period: "custom",
    from: startDate,
    to: endDate,
  });
  if (staffId) params.set("staffId", staffId);
  if (serviceId) params.set("serviceId", serviceId);
  if (status) params.set("status", status);
  if (locationId) params.set("locationId", locationId);

  const rows = (await callApi(
    `/api/analytics?${params.toString()}&t=${Date.now()}`,
    "GET"
  )) as Array<Record<string, unknown>>;

  const { data, dataKeys, xAxisKey } = transformPreviewData(
    apiSource,
    apiDimension,
    rows
  );

  return { data, dataKeys, xAxisKey };
}
