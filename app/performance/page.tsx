"use client";

import { useEffect, useState, useCallback } from "react";
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

  const { setPageTitle } = usePageTitle();
  const { setExtraRightNavMenu, setIsRightNavVisible } = useRightNav();

  // Dashboard handlers
  const handleSelectChartType = useCallback((chartType: string) => {
    setSelectedChartType(chartType);
    setShowConfigForm(true);
    setIsCreateModalOpen(false);
  }, []);

  const { setRemovePadding } = usePaddingControl();
  useEffect(() => {
    setRemovePadding(true);
    return () => {
      setRemovePadding(false);
    };
  }, [setRemovePadding]);

  const handleSaveChart = useCallback((config: DashboardItem) => {
    setItems((prev) => {
      // Find the maximum Y position currently in use
      let maxY = 0;
      prev.forEach((item) => {
        if (item.layout) {
          maxY = Math.max(maxY, item.layout.y + item.layout.h);
        }
      });

      // Set position for new item below existing items
      const isKPI = config.type === "kpi";
      const newConfig = {
        ...config,
        layout: config.layout || {
          x: 0,
          y: maxY,
          w: isKPI ? 3 : 6,
          h: isKPI ? 2 : 4,
        },
      };

      return [...prev, newConfig];
    });
    setShowConfigForm(false);
    setSelectedChartType(null);
    setEditingChart(undefined);
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const handleUpdateItem = useCallback(
    (itemId: string, config: DashboardItem) => {
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? config : item))
      );
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
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Chart Type</DialogTitle>
          </DialogHeader>
          <ChartSelectionGrid
            onSelectChart={handleSelectChartType}
            addedChartIds={[]}
          />
        </DialogContent>
      </Dialog>

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
          {items.length > 0 ? (
            <DashboardGrid
              items={items}
              onRemoveItem={handleRemoveItem}
              onItemUpdate={handleUpdateItem}
              onEditChart={handleEditChart}
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
