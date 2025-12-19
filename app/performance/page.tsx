"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { Plus, Loader2 } from "lucide-react";
import { usePageTitle } from "@/context/PageTitleContext";
import { useRightNav } from "@/context/RightNavContext";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import type React from "react";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { LineChartConfigForm } from "@/components/dashboard/LineChartConfigForm";
import { BarChartConfigForm } from "@/components/dashboard/BarChartConfigForm";
import { HorizontalBarChartConfigForm } from "@/components/dashboard/HorizontalBarChartConfigForm";
import { PieChartConfigForm } from "@/components/dashboard/PieChartConfigForm";
import { LineBarChartConfigForm } from "@/components/dashboard/LineBarChartConfigForm";
import { KPIConfigForm } from "@/components/dashboard/KPIConfigForm";
import type { ChartConfig, DashboardItem } from "@/components/dashboard/types";
import { ChartSelectionGrid } from "@/components/dashboard/ChartSelectionGrid";
import { usePaddingControl } from "@/context/PaddingContext";
import { DashboardDateProvider } from "@/context/DashboardDateContext";
import { DateRangeSelector } from "@/components/dashboard/DateRangeSelector";
import { useDashboardDate } from "@/context/DashboardDateContext";
import callApi from "@/app/Api/callApi";
import { Modal } from "@/components/customUIComponents/Modal";
import { formatDateAndTime } from "@/Global/Utils/commonFn";

interface ChangeMetric {
  value: number;
  type: "increase" | "decrease" | "neutral";
}

interface KPICardChanges {
  totalAppointments: ChangeMetric;
  totalRevenue: ChangeMetric;
  completedAppointments: ChangeMetric;
  cancelledAppointments: ChangeMetric;
  averageServicePrice: ChangeMetric;
  newClientsAcquired: ChangeMetric;
}

export interface PerformanceData {
  kpiData: {
    totalAppointments: number;
    totalRevenue: number;
    completedAppointments: number;
    cancelledAppointments: number;
    averageServicePrice: number;
    clientRetentionRate: number;
    newClientsAcquired: number;
    changes: KPICardChanges;
  };
  appointmentsOverTime: Record<string, unknown>[];
  revenueOverTime: Record<string, unknown>[];
  servicePopularity: Record<string, unknown>[];
  clientTypes: Record<string, unknown>[];
  appointmentStatus: Record<string, unknown>[];
  revenueByService: Record<string, unknown>[];
}

const mockPerformanceData: PerformanceData = {
  kpiData: {
    // Текущи Стойности
    totalAppointments: 450,
    totalRevenue: 28750.55,
    completedAppointments: 380,
    cancelledAppointments: 70,
    averageServicePrice: 75.66,
    clientRetentionRate: 78.5,
    newClientsAcquired: 35,

    // Динамични Промени (Changes)
    changes: {
      // 🟢 Увеличение
      totalAppointments: { value: 15.2, type: "increase" },
      // 🟢 Увеличение
      totalRevenue: { value: 8.7, type: "increase" },
      // 🟡 Неутрална промяна (стойност 0)
      completedAppointments: { value: 0, type: "neutral" },
      // 🔴 Намаление (показва се като увеличение на %cancelled)
      cancelledAppointments: { value: 25.0, type: "increase" },
      // 🔴 Намаление (цената е паднала)
      averageServicePrice: { value: 4.1, type: "decrease" },
      // 🟢 Голямо увеличение
      newClientsAcquired: { value: 150.0, type: "increase" },
    },
  },

  // Данни за Графики (Опростени Mock Data)
  appointmentsOverTime: [
    { name: "Mon", total: 65, completed: 50, cancelled: 15 },
    { name: "Tue", total: 72, completed: 68, cancelled: 4 },
    { name: "Wed", total: 80, completed: 75, cancelled: 5 },
    { name: "Thu", total: 55, completed: 45, cancelled: 10 },
    { name: "Fri", total: 90, completed: 85, cancelled: 5 },
    { name: "Sat", total: 88, completed: 80, cancelled: 8 },
  ],
  revenueOverTime: [
    { name: "Jan", value: 5000 },
    { name: "Feb", value: 6500 },
    { name: "Mar", value: 7200 },
    { name: "Apr", value: 8500 },
    { name: "May", value: 9100 },
  ],
  servicePopularity: [
    { name: "Haircut", value: 150 },
    { name: "Coloring", value: 90 },
    { name: "Massage", value: 70 },
    { name: "Facial", value: 50 },
    { name: "Manicure", value: 45 },
  ],
  clientTypes: [
    { name: "Returning Clients", value: 300 },
    { name: "New Clients", value: 100 },
  ],
  appointmentStatus: [
    { name: "Completed", value: 380 },
    { name: "Cancelled", value: 70 },
  ],
  revenueByService: [
    { name: "Haircut", value: 9500 },
    { name: "Coloring", value: 12000 },
    { name: "Massage", value: 4000 },
    { name: "Facial", value: 3250 },
  ],
};

type CreateNewDashboardMenuProps = {
  onOpenModal: () => void;
};

const CreateNewDashboardMenu = ({
  onOpenModal,
}: CreateNewDashboardMenuProps) => {
  const { t } = useTranslation();
  return (
    <CustomTooltip
      onClick={onOpenModal}
      tooltipText={t("Add")}
      icon={<Plus color="white" />}
    />
  );
};

const getDateFromPeriod = (period: string) => {
  const today = new Date();
  const to = new Date(today);
  const from = new Date(today);

  switch (period) {
    case "last7days":
      from.setDate(from.getDate() - 7);
      break;
    case "last30days":
      from.setDate(from.getDate() - 30);
      break;
    case "last90days":
      from.setDate(from.getDate() - 90);
      break;
    case "thisYear":
      from.setMonth(0);
      from.setDate(1);
      break;
    default:
      return null;
  }

  return { from, to };
};

const formatAxisLabel = (value: unknown) => {
  if (value instanceof Date || typeof value === "string") {
    return formatDateAndTime(value as string, "date");
  }
  return `${value ?? ""}`;
};

function PerformancePageContent() {
  const { t } = useTranslation();
  const { startDate, endDate, groupBy } = useDashboardDate();

  // Dashboard state management
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [selectedChartType, setSelectedChartType] = useState<string | null>(
    null
  );
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingChart, setEditingChart] = useState<ChartConfig | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemsRef = useRef<DashboardItem[]>([]);
  const layoutSaveTimer = useRef<NodeJS.Timeout | null>(null);

  const { setPageTitle } = usePageTitle();
  const { setExtraRightNavMenu, setIsRightNavVisible } = useRightNav();

  // Dashboard handlers
  const handleSelectChartType = useCallback((chartType: string) => {
    setSelectedChartType(chartType);
    setShowConfigForm(true);
    setIsCreateModalOpen(false);
  }, []);

  // Guess analytics dimension based on saved config
  const inferDimension = useCallback(
    (source?: string, metric?: string, type?: string) => {
      // For pie charts, never return time_series - default to by_service for categorical breakdown
      const isPieChart = type === "pie";

      if (source === "appointments") {
        if (metric === "by_service") return "by_service";
        if (metric === "by_staff" || metric === "appointments_count")
          return "by_staff";
        if (metric === "by_status") return "by_status";
        if (metric === "by_category") return "by_category";
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
        if (metric === "count")
          return isPieChart ? "by_service" : "time_series";
        return isPieChart ? "by_service" : "time_series";
      }
      if (source === "services") {
        if (metric === "metrics") return "metrics";
        return "popularity";
      }
      return isPieChart ? "by_service" : "time_series";
    },
    []
  );

  const transformAnalyticsData = useCallback(
    (
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
          }));
          dataKeys = ["count", "completed", "cancelled"];
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
          }));
          dataKeys = ["count", "completed", "cancelled"];
        }
      } else if (source === "staff") {
        // Treat staff analytics the same as appointments by staff
        if (dimension === "by_staff" || dimension === "time_series") {
          data = rows.map((r) => ({
            name: formatAxisLabel(r.name),
            count: Number((r.total as number) ?? 0),
            completed: Number((r.completed as number) ?? 0),
            cancelled: Number((r.cancelled as number) ?? 0),
          }));
          dataKeys = ["count", "completed", "cancelled"];
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
            bookings: Number(
              (r.value as number) ?? (r.bookings as number) ?? 0
            ),
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
    },
    []
  );

  // Helper function to calculate week boundaries
  const getWeekBoundaries = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(d.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    return {
      start: monday.toISOString().split("T")[0],
      end: sunday.toISOString().split("T")[0],
    };
  };

  // Helper to calculate percentage change
  const calculatePercentageChange = (
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

  const fetchKpiValue = useCallback(
    async (
      kpiType: string,
      staffId?: string
    ): Promise<{ value: string | number; change?: ChangeMetric }> => {
      try {
        // Calculate previous period dates based on selected date range
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
          // Fetch current period data
          const currentParams = new URLSearchParams({
            source: "appointments",
            dimension: "time_series",
            groupBy: groupBy,
            period: "custom",
            from: startDate,
            to: endDate,
          });
          if (staffId) currentParams.set("staffId", staffId);
          const currentUrl = `/api/analytics?${currentParams.toString()}&t=${Date.now()}`;
          const currentRows = (await callApi(currentUrl, "GET")) as Array<
            Record<string, unknown>
          >;
          const currentTotals = currentRows.reduce(
            (
              acc: { total: number; completed: number; cancelled: number },
              cur
            ) => {
              acc.total += Number(cur.total ?? 0);
              acc.completed += Number(cur.completed ?? 0);
              acc.cancelled += Number(cur.cancelled ?? 0);
              return acc;
            },
            { total: 0, completed: 0, cancelled: 0 }
          );

          // Fetch previous period data
          const prevParams = new URLSearchParams({
            source: "appointments",
            dimension: "time_series",
            groupBy: groupBy,
            period: "custom",
            from: prevStartStr,
            to: prevEndStr,
          });
          if (staffId) prevParams.set("staffId", staffId);
          const prevUrl = `/api/analytics?${prevParams.toString()}&t=${Date.now()}`;
          const prevRows = (await callApi(prevUrl, "GET")) as Array<
            Record<string, unknown>
          >;
          const prevTotals = prevRows.reduce(
            (
              acc: { total: number; completed: number; cancelled: number },
              cur
            ) => {
              acc.total += Number(cur.total ?? 0);
              acc.completed += Number(cur.completed ?? 0);
              acc.cancelled += Number(cur.cancelled ?? 0);
              return acc;
            },
            { total: 0, completed: 0, cancelled: 0 }
          );

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
          // Fetch current period revenue
          const currentParams = new URLSearchParams({
            source: "revenue",
            dimension: "time_series",
            groupBy: groupBy,
            period: "custom",
            from: startDate,
            to: endDate,
          });
          if (staffId) currentParams.set("staffId", staffId);
          const currentUrl = `/api/analytics?${currentParams.toString()}&t=${Date.now()}`;
          const currentRows = (await callApi(currentUrl, "GET")) as Array<
            Record<string, unknown>
          >;
          const currentRevenue = currentRows.reduce(
            (sum, cur) => sum + Number(cur.revenue ?? cur.value ?? 0),
            0
          );

          // Fetch previous period revenue
          const prevParams = new URLSearchParams({
            source: "revenue",
            dimension: "time_series",
            groupBy: groupBy,
            period: "custom",
            from: prevStartStr,
            to: prevEndStr,
          });
          if (staffId) prevParams.set("staffId", staffId);
          const prevUrl = `/api/analytics?${prevParams.toString()}&t=${Date.now()}`;
          const prevRows = (await callApi(prevUrl, "GET")) as Array<
            Record<string, unknown>
          >;
          const prevRevenue = prevRows.reduce(
            (sum, cur) => sum + Number(cur.revenue ?? cur.value ?? 0),
            0
          );

          const change = calculatePercentageChange(currentRevenue, prevRevenue);
          return {
            value: Number(currentRevenue.toFixed(2)),
            change,
          };
        }

        if (kpiType === "averageServicePrice") {
          const params = new URLSearchParams({
            source: "services",
            dimension: "metrics",
          });
          const url = `/api/analytics?${params.toString()}&t=${Date.now()}`;
          const rows = await callApi(url, "GET");
          const list = rows as Array<Record<string, unknown>>;
          if (!list.length) return { value: "N/A" };
          const total = list.reduce((sum, r) => sum + Number(r.price ?? 0), 0);
          const avgPrice = Number(total / list.length).toFixed(2);
          return { value: avgPrice };
        }

        if (
          kpiType === "clientRetentionRate" ||
          kpiType === "newClientsAcquired"
        ) {
          return { value: "N/A" };
        }
      } catch (err) {
        console.error("Failed to load KPI", err);
        return { value: "N/A" };
      }

      return { value: "N/A" };
    },
    [startDate, endDate, groupBy]
  );

  const fetchChartData = useCallback(
    async (item: DashboardItem): Promise<DashboardItem> => {
      if (item.type === "kpi") {
        const result = await fetchKpiValue(
          item.kpiType,
          (item as DashboardItem & { configuration?: { staffId?: string } })
            .configuration?.staffId
        );
        return { ...item, value: result.value, change: result.change };
      }

      const config: Partial<ChartConfig["configuration"]> =
        item.configuration || {};
      const source = config.dataSource || "appointments";
      const dimension =
        config.dimension || inferDimension(source, config.metric, item.type);

      // Map UI "staff" source to analytics API expectations (appointments by staff)
      const apiSource = source === "staff" ? "appointments" : source;
      const apiDimension = source === "staff" ? "by_staff" : dimension;

      // Special handling for linebar charts: fetch current period (bars) and previous period (lines)
      if (item.type === "linebar") {
        // Calculate date range duration
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const durationMs = endDateObj.getTime() - startDateObj.getTime();

        // Calculate previous period dates
        const prevEndDate = new Date(startDateObj);
        prevEndDate.setDate(prevEndDate.getDate() - 1);
        const prevStartDate = new Date(prevEndDate);
        prevStartDate.setTime(prevStartDate.getTime() - durationMs);

        // Fetch current period data (for bars)
        const currentParams = new URLSearchParams({
          source: apiSource,
          dimension: apiDimension,
          groupBy: config.groupBy || groupBy,
          period: "custom",
          from: startDate,
          to: endDate,
        });
        if (config.staffId) currentParams.set("staffId", config.staffId);
        const currentUrl = `/api/analytics?${currentParams.toString()}&t=${Date.now()}`;
        const currentRows = (await callApi(currentUrl, "GET")) as Array<
          Record<string, unknown>
        >;

        // Fetch previous period data (for lines)
        const prevParams = new URLSearchParams({
          source: apiSource,
          dimension: apiDimension,
          groupBy: config.groupBy || groupBy,
          period: "custom",
          from: prevStartDate.toISOString().split("T")[0],
          to: prevEndDate.toISOString().split("T")[0],
        });
        if (config.staffId) prevParams.set("staffId", config.staffId);
        const prevUrl = `/api/analytics?${prevParams.toString()}&t=${Date.now()}`;
        const prevRows = (await callApi(prevUrl, "GET")) as Array<
          Record<string, unknown>
        >;

        // Merge current and previous week data
        const mergedData: Array<Record<string, unknown>> = [];

        if (apiSource === "appointments") {
          // Transform appointments data
          currentRows.forEach((curr, idx) => {
            const prev = prevRows[idx];
            mergedData.push({
              name: formatAxisLabel(curr.name),
              // Current week - bars
              count: Number(curr.total ?? 0),
              completed: Number(curr.completed ?? 0),
              // Previous week - lines
              prevCount: Number(prev?.total ?? 0),
              prevCompleted: Number(prev?.completed ?? 0),
            });
          });
        } else if (apiSource === "revenue") {
          // Transform revenue data
          currentRows.forEach((curr, idx) => {
            const prev = prevRows[idx];
            mergedData.push({
              name: formatAxisLabel(curr.name),
              // Current week - bars
              revenue: Number(curr.revenue ?? curr.value ?? 0),
              // Previous week - lines
              prevRevenue: Number(prev?.revenue ?? prev?.value ?? 0),
            });
          });
        }

        // Set appropriate data keys for bar vs line series
        let dataKeys: string[] = [];
        let seriesConfig = {};

        if (apiSource === "appointments") {
          dataKeys = ["count", "completed", "prevCount", "prevCompleted"];
          seriesConfig = {
            barSeries: ["count", "completed"],
            lineSeries: ["prevCount", "prevCompleted"],
          };
        } else if (apiSource === "revenue") {
          dataKeys = ["revenue", "prevRevenue"];
          seriesConfig = {
            barSeries: ["revenue"],
            lineSeries: ["prevRevenue"],
          };
        }

        return {
          ...item,
          data: mergedData,
          dataKeys,
          xAxisKey: "name",
          seriesConfig,
          configuration: {
            ...config,
            dataSource: source,
            dimension: apiDimension,
            from: startDate,
            to: endDate,
          },
        } as DashboardItem;
      }

      // Standard chart fetching for non-linebar charts
      const params = new URLSearchParams({
        source: apiSource,
        dimension: apiDimension,
        groupBy: config.groupBy || groupBy,
        period: "custom",
        from: config.from || startDate,
        to: config.to || endDate,
      });

      if (config.staffId) params.set("staffId", config.staffId);
      if (config.serviceId) params.set("serviceId", config.serviceId);
      if (config.status) params.set("status", config.status);

      const url = `/api/analytics?${params.toString()}&t=${Date.now()}`;
      const rows = await callApi(url, "GET");
      const { data, dataKeys, xAxisKey } = transformAnalyticsData(
        apiSource,
        apiDimension,
        rows as Array<Record<string, unknown>>
      );

      return {
        ...item,
        data,
        dataKeys: dataKeys,
        xAxisKey: xAxisKey,
        configuration: {
          ...config,
          dataSource: source,
          dimension: apiDimension,
          from: config.from || startDate,
          to: config.to || endDate,
        },
      } as DashboardItem;
    },
    [
      fetchKpiValue,
      groupBy,
      inferDimension,
      startDate,
      endDate,
      transformAnalyticsData,
    ]
  );

  const { setRemovePadding } = usePaddingControl();
  useEffect(() => {
    setRemovePadding(true);
    return () => {
      setRemovePadding(false);
    };
  }, [setRemovePadding]);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dash = await callApi("/api/dashboard", "GET");
      const fetchedItems = (dash?.items as DashboardItem[]) || [];
      const hydrated = await Promise.all(
        fetchedItems.map(async (item) => {
          try {
            return await fetchChartData(item);
          } catch (err) {
            console.error("Failed to hydrate item", item.id, err);
            return item;
          }
        })
      );
      setItems(hydrated);
    } catch (err) {
      console.error("Failed to load dashboard", err);
      setError("Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [fetchChartData]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    const refreshData = async () => {
      if (!itemsRef.current.length) return;
      try {
        const updated = await Promise.all(
          itemsRef.current.map((item) => fetchChartData(item))
        );
        setItems(updated);
      } catch (err) {
        console.error("Failed to refresh analytics", err);
      }
    };

    refreshData();
  }, [startDate, endDate, groupBy, fetchChartData]);

  const handleSaveChart = useCallback(
    async (config: DashboardItem) => {
      setError(null);

      const isKPI = config.type === "kpi";
      let layout = config.layout;

      if (!layout) {
        let maxY = 0;
        items.forEach((item) => {
          if (item.layout) {
            maxY = Math.max(maxY, item.layout.y + item.layout.h);
          }
        });

        layout = {
          x: 0,
          y: maxY,
          w: isKPI ? 3 : 6,
          h: isKPI ? 2 : 4,
        };
      }

      const payload = { ...config, layout } as DashboardItem;

      try {
        const exists = items.some((i) => i.id === payload.id);
        if (exists) {
          await callApi(`/api/dashboard/items/${payload.id}`, "PUT", payload);
        } else {
          await callApi("/api/dashboard/items", "POST", payload);
        }

        const hydrated = await fetchChartData(payload);
        setItems((prev) => {
          if (exists) {
            return prev.map((item) =>
              item.id === payload.id ? hydrated : item
            );
          }
          return [...prev, hydrated];
        });
      } catch (err) {
        console.error("Failed to save chart", err);
        setError("Failed to save chart");
      }

      setShowConfigForm(false);
      setSelectedChartType(null);
      setEditingChart(undefined);
    },
    [fetchChartData, items]
  );

  const handleRemoveItem = useCallback(async (itemId: string) => {
    setError(null);
    try {
      await callApi(`/api/dashboard/items/${itemId}`, "DELETE");
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error("Failed to remove item", err);
      setError("Failed to remove item");
    }
  }, []);

  const handleUpdateItem = useCallback(
    (itemId: string, config: DashboardItem) => {
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? config : item))
      );
    },
    []
  );

  const handleLayoutChange = useCallback(
    async (
      device: "desktop" | "mobile",
      layout: {
        x: number;
        y: number;
        w: number;
        h: number;
        i: string;
        static?: boolean;
      }[]
    ) => {
      setItems((prev) =>
        prev.map((item) => {
          const match = layout.find((l) => l.i === item.id);
          if (!match) return item;
          const layoutConfig = {
            x: match.x,
            y: match.y,
            w: match.w,
            h: match.h,
          };
          const responsiveLayout = { ...(item.responsiveLayout || {}) };
          responsiveLayout[device] = layoutConfig;
          return {
            ...item,
            layout: layoutConfig,
            responsiveLayout,
          } as DashboardItem;
        })
      );

      if (layoutSaveTimer.current) {
        clearTimeout(layoutSaveTimer.current);
      }

      layoutSaveTimer.current = setTimeout(async () => {
        try {
          await callApi("/api/dashboard/layout", "PUT", { device, layout });
        } catch (err) {
          console.error("Failed to save layout", err);
          setError("Failed to save layout");
        }
      }, 500);
    },
    []
  );

  const handleEditChart = useCallback((chart: ChartConfig) => {
    setEditingChart(chart);
    setSelectedChartType(chart.type as string);
    setShowConfigForm(true);
  }, []);

  useEffect(() => {
    setPageTitle(t("Performance Tracking"));
    setExtraRightNavMenu(
      <CreateNewDashboardMenu onOpenModal={() => setIsCreateModalOpen(true)} />
    );
    setIsRightNavVisible(true);

    return () => {
      setExtraRightNavMenu(null);
      setIsRightNavVisible(false);
    };
  }, [setPageTitle, t, setExtraRightNavMenu, setIsRightNavVisible]);

  return (
    <>
      {/* Chart Selection Modal */}
      <Modal
        label={t("Select Chart Type")}
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      >
        <ChartSelectionGrid
          onSelectChart={handleSelectChartType}
          addedChartIds={[]}
        />
      </Modal>

      {/* Chart Configuration Forms */}
      {selectedChartType === "line" && (
        <LineChartConfigForm
          open={showConfigForm}
          onOpenChange={setShowConfigForm}
          onSave={handleSaveChart}
          editingChart={editingChart}
        />
      )}

      {selectedChartType === "bar" && (
        <BarChartConfigForm
          open={showConfigForm}
          onOpenChange={setShowConfigForm}
          onSave={handleSaveChart}
          editingChart={editingChart}
        />
      )}

      {selectedChartType === "hbar" && (
        <HorizontalBarChartConfigForm
          open={showConfigForm}
          onOpenChange={setShowConfigForm}
          onSave={handleSaveChart}
          editingChart={editingChart}
        />
      )}

      {selectedChartType === "column" && (
        <BarChartConfigForm
          open={showConfigForm}
          onOpenChange={setShowConfigForm}
          onSave={(config) => {
            handleSaveChart({ ...config, type: "column" });
          }}
          editingChart={editingChart}
        />
      )}

      {selectedChartType === "pie" && (
        <PieChartConfigForm
          open={showConfigForm}
          onOpenChange={setShowConfigForm}
          onSave={handleSaveChart}
          editingChart={editingChart}
        />
      )}

      {selectedChartType === "linebar" && (
        <LineBarChartConfigForm
          open={showConfigForm}
          onOpenChange={setShowConfigForm}
          onSave={handleSaveChart}
          editingChart={editingChart}
        />
      )}

      {selectedChartType === "kpi" && (
        <KPIConfigForm
          open={showConfigForm}
          onOpenChange={setShowConfigForm}
          onSave={handleSaveChart}
          mockPerformanceData={mockPerformanceData}
        />
      )}

      <div className="min-h-screen flex flex-col ">
        {/* Date Range Selector - Controls all charts */}
        <div className="relative z-10 mx-auto w-full px-6 py-6">
          <DateRangeSelector />
        </div>

        {/* Dashboard Grid Section */}
        <div className="flex-1 overflow-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center py-2 text-red-400 text-sm">
              {error}
            </div>
          )}
          {items.length > 0 ? (
            <DashboardGrid
              items={items}
              onRemoveItem={handleRemoveItem}
              onItemUpdate={handleUpdateItem}
              onEditChart={handleEditChart}
              onLayoutChange={handleLayoutChange}
              // dateFrom={
              //   customDateRange.from
              //     ? customDateRange.from.toLocaleDateString()
              //     : getDateFromPeriod(
              //         selectedPeriod
              //       )?.from?.toLocaleDateString?.()
              // }
              // dateTo={
              //   customDateRange.to
              //     ? customDateRange.to.toLocaleDateString()
              //     : getDateFromPeriod(
              //         selectedPeriod
              //       )?.to?.toLocaleDateString?.()
              // }
            />
          ) : (
            <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-slate-800 to-slate-900">
              <div className="text-center">
                <p className="text-slate-400 mb-4">
                  {t(
                    "No charts or KPIs added yet. Click the + button to get started."
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function PerformancePage() {
  return (
    <ProtectedRoute
      requiredRoles={["business"]}
      requiredPlan={["starter", "professional", "enterprise"]}
    >
      <DashboardDateProvider>
        <PerformancePageContent />
      </DashboardDateProvider>
    </ProtectedRoute>
  );
}
