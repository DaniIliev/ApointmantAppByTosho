"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { Plus } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePaddingControl } from "@/context/PaddingContext";
import { DashboardDateProvider } from "@/context/DashboardDateContext";
import { DateRangeSelector } from "@/components/dashboard/DateRangeSelector";
import { useDashboardDate } from "@/context/DashboardDateContext";
import callApi from "@/app/Api/callApi";
import { Modal } from "@/components/customUIComponents/Modal";

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

function PerformancePageContent() {
  const { t } = useTranslation();
  const { startDate, endDate, groupBy } = useDashboardDate();
  const [selectedPeriod, setSelectedPeriod] = useState("last30days");
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

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
            name: (r.name as string) || "",
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
            name: (r.name as string) || "",
            count: Number((r.total as number) ?? 0),
            completed: Number((r.completed as number) ?? 0),
            cancelled: Number((r.cancelled as number) ?? 0),
          }));
          dataKeys = ["count", "completed", "cancelled"];
        }
      } else if (source === "revenue") {
        if (dimension === "time_series") {
          data = rows.map((r) => ({
            name: (r.name as string) || "",
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

  const fetchKpiValue = useCallback(
    async (kpiType: string, staffId?: string): Promise<string | number> => {
      try {
        if (
          kpiType === "totalAppointments" ||
          kpiType === "completedAppointments" ||
          kpiType === "cancelledAppointments"
        ) {
          const params = new URLSearchParams({
            source: "appointments",
            dimension: "time_series",
            groupBy: "day",
            period: "custom",
            from: startDate,
            to: endDate,
          });
          if (staffId) params.set("staffId", staffId);
          const url = `/api/analytics?${params.toString()}&t=${Date.now()}`;
          const rows = await callApi(url, "GET");
          const totals = (rows as Array<Record<string, unknown>>).reduce(
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
          if (kpiType === "totalAppointments") return totals.total;
          if (kpiType === "completedAppointments") return totals.completed;
          return totals.cancelled;
        }

        if (kpiType === "totalRevenue") {
          const params = new URLSearchParams({
            source: "revenue",
            dimension: "time_series",
            groupBy: "day",
            period: "custom",
            from: startDate,
            to: endDate,
          });
          if (staffId) params.set("staffId", staffId);
          const url = `/api/analytics?${params.toString()}&t=${Date.now()}`;
          const rows = await callApi(url, "GET");
          return (rows as Array<Record<string, unknown>>).reduce(
            (sum, cur) => sum + Number(cur.revenue ?? cur.value ?? 0),
            0
          );
        }

        if (kpiType === "averageServicePrice") {
          const params = new URLSearchParams({
            source: "services",
            dimension: "metrics",
          });
          const url = `/api/analytics?${params.toString()}&t=${Date.now()}`;
          const rows = await callApi(url, "GET");
          const list = rows as Array<Record<string, unknown>>;
          if (!list.length) return "N/A";
          const total = list.reduce((sum, r) => sum + Number(r.price ?? 0), 0);
          return Number(total / list.length).toFixed(2);
        }

        if (
          kpiType === "clientRetentionRate" ||
          kpiType === "newClientsAcquired"
        ) {
          return "N/A";
        }
      } catch (err) {
        console.error("Failed to load KPI", err);
        return "N/A";
      }

      return "N/A";
    },
    [startDate, endDate]
  );

  const fetchChartData = useCallback(
    async (item: DashboardItem): Promise<DashboardItem> => {
      if (item.type === "kpi") {
        const value = await fetchKpiValue(
          item.kpiType,
          (item as DashboardItem & { configuration?: { staffId?: string } })
            .configuration?.staffId
        );
        return { ...item, value };
      }

      const config: Partial<ChartConfig["configuration"]> =
        item.configuration || {};
      const source = config.dataSource || "appointments";
      const dimension =
        config.dimension || inferDimension(source, config.metric, item.type);

      // Map UI "staff" source to analytics API expectations (appointments by staff)
      const apiSource = source === "staff" ? "appointments" : source;
      const apiDimension = source === "staff" ? "by_staff" : dimension;

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

  // Period and date handlers (stored for potential future use)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    if (period !== "custom") {
      setCustomDateRange({ from: undefined, to: undefined });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCustomDateChange = (range: typeof customDateRange) => {
    setCustomDateRange(range);
  };

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
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 py-6">
          <DateRangeSelector />
        </div>

        {/* Dashboard Grid Section */}
        <div className="flex-1 overflow-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-4 text-slate-400 text-sm">
              {t("Loading dashboard...")}
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
              dateFrom={
                customDateRange.from
                  ? customDateRange.from.toLocaleDateString()
                  : getDateFromPeriod(
                      selectedPeriod
                    )?.from?.toLocaleDateString?.()
              }
              dateTo={
                customDateRange.to
                  ? customDateRange.to.toLocaleDateString()
                  : getDateFromPeriod(
                      selectedPeriod
                    )?.to?.toLocaleDateString?.()
              }
            />
          ) : (
            <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-slate-800 to-slate-900">
              <div className="text-center">
                <p className="text-slate-400 mb-4">
                  No charts or KPIs added yet. Click the + button to get
                  started.
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
