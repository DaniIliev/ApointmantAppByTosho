"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { Plus } from "lucide-react";
import { usePageTitle } from "@/context/PageTitleContext";
import { useRightNav } from "@/context/RightNavContext";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useDashboardLayout, useHydratedDashboardItems } from "@/hooks/queries/usePerformance";
import { useQueryClient } from "@tanstack/react-query";

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

function PerformancePageContent() {
  const { t } = useTranslation();
  const { startDate, endDate, groupBy, locationId } = useDashboardDate();
  const queryClient = useQueryClient();

  const [selectedChartType, setSelectedChartType] = useState<string | null>(null);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingChart, setEditingChart] = useState<ChartConfig | undefined>(undefined);
  const layoutSaveTimer = useRef<NodeJS.Timeout | null>(null);

  const { setPageTitle } = usePageTitle();
  const { setExtraRightNavMenu, setIsRightNavVisible } = useRightNav();

  // 1. Fetch layout items structure
  const { data: layoutItems = [], isLoading: isLoadingLayout, error: layoutError } = useDashboardLayout();

  // 2. Fetch/hydrate chart data based on layout and selected dates
  const { data: items = [], isLoading: isLoadingData, error: dataError } = useHydratedDashboardItems(
    layoutItems,
    startDate,
    endDate,
    groupBy,
    locationId || undefined
  );

  const isLoading = isLoadingLayout || isLoadingData;
  const isInitialLoad = items.length === 0 && isLoading;
  const error = layoutError?.message || dataError?.message;

  const handleSelectChartType = useCallback((chartType: string) => {
    setSelectedChartType(chartType);
    setShowConfigForm(true);
    setIsCreateModalOpen(false);
  }, []);

  const handleSaveChart = useCallback(
    async (config: DashboardItem) => {
      const isKPI = config.type === "kpi";
      let layout = config.layout;

      if (!layout) {
        let maxY = 0;
        layoutItems.forEach((item) => {
          if (item.layout) {
            maxY = Math.max(maxY, item.layout.y + item.layout.h);
          }
        });
        layout = { x: 0, y: maxY, w: isKPI ? 3 : 6, h: isKPI ? 2 : 4 };
      }

      const payload = { ...config, layout } as DashboardItem;

      try {
        const exists = layoutItems.some((i) => i.id === payload.id);
        if (exists) {
          await callApi(`/api/dashboard/items/${payload.id}`, "PUT", payload);
        } else {
          await callApi("/api/dashboard/items", "POST", payload);
        }
        // Invalidate queries to trigger re-fetch of layout and hydrated items
        queryClient.invalidateQueries({ queryKey: ["dashboardLayout"] });
      } catch (err) {
        console.error("Failed to save chart", err);
      }

      setShowConfigForm(false);
      setSelectedChartType(null);
      setEditingChart(undefined);
    },
    [layoutItems, queryClient],
  );

  const handleRemoveItem = useCallback(async (itemId: string) => {
    try {
      await callApi(`/api/dashboard/items/${itemId}`, "DELETE");
      queryClient.invalidateQueries({ queryKey: ["dashboardLayout"] });
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  }, [queryClient]);

  const handleUpdateItem = useCallback(
    (itemId: string, config: DashboardItem) => {
      // Optimistic layout update is handled by react-grid-layout directly in DashboardGrid.
      // We persist via handleLayoutChange anyway.
    },
    [],
  );

  const handleLayoutChange = useCallback(
    async (
      device: "desktop" | "mobile",
      layout: { x: number; y: number; w: number; h: number; i: string; static?: boolean; }[],
    ) => {
      if (layoutSaveTimer.current) clearTimeout(layoutSaveTimer.current);

      layoutSaveTimer.current = setTimeout(async () => {
        try {
          await callApi("/api/dashboard/layout", "PUT", { device, layout }, false, false);
          // Don't invalidate to avoid jumpiness, just let the backend store it
        } catch (err) {
          console.error("Failed to save layout", err);
        }
      }, 500);
    },
    [],
  );

  const handleEditChart = useCallback((chart: ChartConfig) => {
    setEditingChart(chart);
    setSelectedChartType(chart.type as string);
    setShowConfigForm(true);
  }, []);

  const { setRemovePadding } = usePaddingControl();
  useEffect(() => {
    setRemovePadding(true);
    return () => setRemovePadding(false);
  }, [setRemovePadding]);

  useEffect(() => {
    setPageTitle(t("Performance Tracking"));
    setExtraRightNavMenu(<CreateNewDashboardMenu onOpenModal={() => setIsCreateModalOpen(true)} />);
    setIsRightNavVisible(true);
    return () => {
      setExtraRightNavMenu(null);
      setIsRightNavVisible(false);
    };
  }, [setPageTitle, t, setExtraRightNavMenu, setIsRightNavVisible]);

  return (
    <>
      <Modal label={t("Select Chart Type")} open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <ChartSelectionGrid onSelectChart={handleSelectChartType} addedChartIds={[]} />
      </Modal>

      {selectedChartType === "line" && (
        <LineChartConfigForm open={showConfigForm} onOpenChange={setShowConfigForm} onSave={handleSaveChart} editingChart={editingChart} />
      )}
      {selectedChartType === "bar" && (
        <BarChartConfigForm open={showConfigForm} onOpenChange={setShowConfigForm} onSave={handleSaveChart} editingChart={editingChart} />
      )}
      {selectedChartType === "hbar" && (
        <HorizontalBarChartConfigForm open={showConfigForm} onOpenChange={setShowConfigForm} onSave={handleSaveChart} editingChart={editingChart} />
      )}
      {selectedChartType === "column" && (
        <BarChartConfigForm open={showConfigForm} onOpenChange={setShowConfigForm} onSave={(config) => handleSaveChart({ ...config, type: "column" })} editingChart={editingChart} />
      )}
      {selectedChartType === "pie" && (
        <PieChartConfigForm open={showConfigForm} onOpenChange={setShowConfigForm} onSave={handleSaveChart} editingChart={editingChart} />
      )}
      {selectedChartType === "linebar" && (
        <LineBarChartConfigForm open={showConfigForm} onOpenChange={setShowConfigForm} onSave={handleSaveChart} editingChart={editingChart} />
      )}
      {selectedChartType === "kpi" && (
        <KPIConfigForm open={showConfigForm} onOpenChange={setShowConfigForm} onSave={handleSaveChart} />
      )}

      <div className="h-full flex flex-col">
        {items.length > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
            <DateRangeSelector />
          </div>
        )}
        <div className="flex-1 overflow-auto">
          {isLoading && isInitialLoad && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-[300px] w-full rounded-xl col-span-2" />
              <Skeleton className="h-[300px] w-full rounded-xl col-span-2" />
            </div>
          )}
          {error && items.length !== 0 && (
            <div className="flex items-center justify-center py-2 text-red-400 text-sm">
              {error as string}
            </div>
          )}
          {!isLoading && items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-4 h-full">
              <div className="max-w-md w-full p-8 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm shadow-xl text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {t("Dashboard is Empty")}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("Start monitoring your business performance by adding your first chart or KPI. Track appointments, revenue, and more in real-time.")}
                  </p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto px-8 h-11 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("Add Your First Chart")}
                </Button>
              </div>
            </div>
          ) : (
            <DashboardGrid
              items={items}
              onRemoveItem={handleRemoveItem}
              onItemUpdate={handleUpdateItem}
              onEditChart={handleEditChart}
              onLayoutChange={handleLayoutChange}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default function PerformancePage() {
  return (
    <ProtectedRoute requiredRoles={["business", "staff", "manager"]} requiredPlan={["starter", "professional", "enterprise"]}>
      <DashboardDateProvider>
        <PerformancePageContent />
      </DashboardDateProvider>
    </ProtectedRoute>
  );
}
