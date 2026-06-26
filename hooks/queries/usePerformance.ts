import { useQuery } from "@tanstack/react-query";
import callApi from "@/app/Api/callApi";
import { calculatePercentageChange, formatAxisLabel, inferDimension, transformAnalyticsData } from "@/app/performance/utils/analyticsTransforms";
import { DashboardItem, ChartConfig } from "@/components/dashboard/types";

export interface AnalyticsQueryParams {
  source: string;
  dimension: string;
  groupBy?: string;
  from?: string;
  to?: string;
  staffId?: string;
  locationId?: string;
  status?: string;
  serviceId?: string;
}

export const fetchAnalytics = async (params: AnalyticsQueryParams) => {
  const queryParams = new URLSearchParams({
    source: params.source,
    dimension: params.dimension,
    period: "custom",
  });
  if (params.groupBy) queryParams.set("groupBy", params.groupBy);
  if (params.from) queryParams.set("from", params.from);
  if (params.to) queryParams.set("to", params.to);
  if (params.staffId) queryParams.set("staffId", params.staffId);
  if (params.locationId) queryParams.set("locationId", params.locationId);
  if (params.status) queryParams.set("status", params.status);
  if (params.serviceId) queryParams.set("serviceId", params.serviceId);

  const url = `/api/analytics?${queryParams.toString()}`;
  return (await callApi(url, "GET")) as Array<Record<string, unknown>>;
};

export const fetchKpiValue = async (
  kpiType: string,
  startDate: string,
  endDate: string,
  groupBy: string,
  staffId?: string,
  locationId?: string
) => {
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const durationMs = endDateObj.getTime() - startDateObj.getTime();

  const prevEndDate = new Date(startDateObj);
  prevEndDate.setDate(prevEndDate.getDate() - 1);
  const prevStartDate = new Date(prevEndDate);
  prevStartDate.setTime(prevStartDate.getTime() - durationMs);

  const prevStartStr = prevStartDate.toISOString().split("T")[0];
  const prevEndStr = prevEndDate.toISOString().split("T")[0];

  if (
    kpiType === "totalAppointments" ||
    kpiType === "completedAppointments" ||
    kpiType === "cancelledAppointments"
  ) {
    const [currentRows, prevRows] = await Promise.all([
      fetchAnalytics({ source: "appointments", dimension: "time_series", groupBy, from: startDate, to: endDate, staffId, locationId }),
      fetchAnalytics({ source: "appointments", dimension: "time_series", groupBy, from: prevStartStr, to: prevEndStr, staffId, locationId }),
    ]);

    const currentTotals = currentRows.reduce((acc: { total: number; completed: number; cancelled: number }, cur) => {
      acc.total += Number(cur.total ?? 0);
      acc.completed += Number(cur.completed ?? 0);
      acc.cancelled += Number(cur.cancelled ?? 0);
      return acc;
    }, { total: 0, completed: 0, cancelled: 0 });

    const prevTotals = prevRows.reduce((acc: { total: number; completed: number; cancelled: number }, cur) => {
      acc.total += Number(cur.total ?? 0);
      acc.completed += Number(cur.completed ?? 0);
      acc.cancelled += Number(cur.cancelled ?? 0);
      return acc;
    }, { total: 0, completed: 0, cancelled: 0 });

    let currentValue = 0;
    let previousValue = 0;

    if (kpiType === "totalAppointments") {
      currentValue = currentTotals.total;
      previousValue = prevTotals.total;
    } else if (kpiType === "completedAppointments") {
      currentValue = currentTotals.completed;
      previousValue = prevTotals.completed;
    } else {
      currentValue = currentTotals.cancelled;
      previousValue = prevTotals.cancelled;
    }

    const change = calculatePercentageChange(currentValue, previousValue);
    return { value: currentValue, change };
  }

  if (kpiType === "totalRevenue") {
    const [currentRows, prevRows] = await Promise.all([
      fetchAnalytics({ source: "revenue", dimension: "time_series", groupBy, from: startDate, to: endDate, staffId, locationId }),
      fetchAnalytics({ source: "revenue", dimension: "time_series", groupBy, from: prevStartStr, to: prevEndStr, staffId, locationId }),
    ]);

    const currentRevenue = currentRows.reduce((sum, cur) => sum + Number(cur.revenue ?? cur.value ?? 0), 0);
    const prevRevenue = prevRows.reduce((sum, cur) => sum + Number(cur.revenue ?? cur.value ?? 0), 0);

    const change = calculatePercentageChange(currentRevenue, prevRevenue);
    return { value: Number(currentRevenue.toFixed(2)), change };
  }

  if (kpiType === "averageServicePrice") {
    const rows = await fetchAnalytics({ source: "services", dimension: "metrics", locationId });
    if (!rows.length) return { value: "N/A" };
    const total = rows.reduce((sum, r) => sum + Number(r.price ?? 0), 0);
    const avgPrice = Number(total / rows.length).toFixed(2);
    return { value: avgPrice };
  }

  return { value: "N/A" };
};

export const fetchChartData = async (
  item: DashboardItem,
  startDate: string,
  endDate: string,
  groupBy: string,
  locationId?: string
): Promise<DashboardItem> => {
  if (item.type === "kpi") {
    const config = item.configuration || {};
    const result = await fetchKpiValue(item.kpiType, startDate, endDate, groupBy, config.staffId, config.locationId || locationId);
    return { ...item, value: result.value, change: result.change };
  }

  const config: Partial<ChartConfig["configuration"]> = item.configuration || {};
  const source = config.dataSource || "appointments";
  const dimension = config.dimension || inferDimension(source, config.metric, item.type);

  const apiSource = source === "staff" ? "appointments" : source;
  const apiDimension = source === "staff" ? "by_staff" : dimension;

  if (item.type === "linebar") {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const durationMs = endDateObj.getTime() - startDateObj.getTime();
    const prevEndDate = new Date(startDateObj);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setTime(prevStartDate.getTime() - durationMs);

    const currentRows = await fetchAnalytics({
      source: apiSource, dimension: apiDimension, groupBy: config.groupBy || groupBy,
      from: startDate, to: endDate, staffId: config.staffId, locationId: config.locationId || locationId
    });

    const prevRows = await fetchAnalytics({
      source: apiSource, dimension: apiDimension, groupBy: config.groupBy || groupBy,
      from: prevStartDate.toISOString().split("T")[0], to: prevEndDate.toISOString().split("T")[0],
      staffId: config.staffId, locationId: config.locationId || locationId
    });

    const mergedData: Array<Record<string, unknown>> = [];
    if (apiSource === "appointments") {
      currentRows.forEach((curr, idx) => {
        const prev = prevRows[idx];
        mergedData.push({
          name: formatAxisLabel(curr.name),
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
    } else if (apiSource === "revenue") {
      currentRows.forEach((curr, idx) => {
        const prev = prevRows[idx];
        mergedData.push({
          name: formatAxisLabel(curr.name),
          revenue: Number(curr.revenue ?? curr.value ?? 0),
          prevRevenue: Number(prev?.revenue ?? prev?.value ?? 0),
        });
      });
    }

    let dataKeys: string[] = [];
    let seriesConfig = {};
    if (apiSource === "appointments") {
      dataKeys = ["count", "completed", "prevCount", "prevCompleted"];
      seriesConfig = { barSeries: ["count", "completed"], lineSeries: ["prevCount", "prevCompleted"] };
    } else if (apiSource === "revenue") {
      dataKeys = ["revenue", "prevRevenue"];
      seriesConfig = { barSeries: ["revenue"], lineSeries: ["prevRevenue"] };
    }

    return {
      ...item,
      data: mergedData,
      dataKeys,
      xAxisKey: "name",
      seriesConfig,
      configuration: { ...config, dataSource: source, dimension: apiDimension, from: startDate, to: endDate },
    } as DashboardItem;
  }

  const rows = await fetchAnalytics({
    source: apiSource, dimension: apiDimension, groupBy: config.groupBy || groupBy,
    from: config.from || startDate, to: config.to || endDate, staffId: config.staffId, serviceId: config.serviceId, locationId: config.locationId || locationId, status: config.status
  });

  const { data, dataKeys, xAxisKey } = transformAnalyticsData(apiSource, apiDimension, rows);

  return {
    ...item,
    data,
    dataKeys,
    xAxisKey,
    configuration: { ...config, dataSource: source, dimension: apiDimension, from: config.from || startDate, to: config.to || endDate },
  } as DashboardItem;
};

// React Query Hooks

export const useDashboardLayout = () => {
  return useQuery({
    queryKey: ["dashboardLayout"],
    queryFn: async () => {
      const dash = await callApi("/api/dashboard", "GET");
      return (dash?.items as DashboardItem[]) || [];
    },
  });
};

export const useHydratedDashboardItems = (
  items: DashboardItem[],
  startDate: string,
  endDate: string,
  groupBy: string,
  locationId?: string
) => {
  return useQuery({
    queryKey: ["hydratedDashboard", items.map(i => i.id), startDate, endDate, groupBy, locationId],
    queryFn: async () => {
      if (!items.length) return [];
      const hydrated = await Promise.all(
        items.map(async (item) => {
          try {
            return await fetchChartData(item, startDate, endDate, groupBy, locationId);
          } catch (err) {
            console.error("Failed to hydrate item", item.id, err);
            return item;
          }
        })
      );
      return hydrated;
    },
    enabled: items.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};
