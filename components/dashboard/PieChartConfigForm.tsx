"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ChartConfig } from "./types";
import { PerformanceChart } from "@/components/performance/PerformanceChart";
import { useDashboardDate } from "@/context/DashboardDateContext";
import { useStaffOptions } from "./useStaffOptions";
import { fetchPreviewData } from "./analyticsPreview";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import { Modal } from "../customUIComponents/Modal";
import { useTranslation } from "react-i18next";
import { useLocationOptions } from "./useLocationOptions";

interface PieChartConfigFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: ChartConfig) => void;
  editingChart?: ChartConfig;
}

type PieDataSource = "appointments" | "clients" | "revenue" | "services";
type PieMetric =
  | "by_service"
  | "by_source"
  | "popularity"
  | "client_distribution"
  | "count"
  | "by_location";

const dataSourceMetrics: Record<PieDataSource, PieMetric[]> = {
  appointments: ["by_service", "count", "by_location"],
  clients: ["by_source"],
  revenue: ["by_service", "by_location"],
  services: ["popularity"],
};

interface PieConfig {
  title: string;
  dataSource: PieDataSource;
  metric: PieMetric;
  showLegend: boolean;
  staffId?: string;
  locationId?: string;
}

export function PieChartConfigForm({
  open,
  onOpenChange,
  onSave,
  editingChart,
}: PieChartConfigFormProps) {
  const { t } = useTranslation();
  const [config, setConfig] = useState<PieConfig>({
    title: "Appointments by Service",
    dataSource: "appointments",
    metric: "by_service",
    showLegend: true,
    staffId: "",
    locationId: "",
  });

  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
  const [previewDataKeys, setPreviewDataKeys] = useState<string[]>([]);
  const [nameKey, setNameKey] = useState<string>("name");
  const [loadingPreview, setLoadingPreview] = useState(true);
  const { startDate, endDate, groupBy } = useDashboardDate();
  const { staffOptions, loadingStaff } = useStaffOptions();
  const { locationOptions, loadingLocations } = useLocationOptions();

  const availableMetrics = dataSourceMetrics[config.dataSource] || [
    "by_service",
  ];

  useEffect(() => {
    let isCancelled = false;
    const loadPreview = async () => {
      setLoadingPreview(true);
      try {
        const result = await fetchPreviewData({
          chartType: "pie",
          dataSource: config.dataSource,
          metric: config.metric,
          staffId: config.staffId || undefined,
          locationId: config.locationId || undefined,
          groupBy,
          startDate,
          endDate,
        });
        if (isCancelled) return;
        setPreviewData(result.data);
        setPreviewDataKeys(result.dataKeys || []);
        setNameKey(result.xAxisKey || getNameKey());
      } catch (err) {
        if (!isCancelled) {
          setPreviewData([]);
          setPreviewDataKeys([]);
        }
      } finally {
        if (!isCancelled) setLoadingPreview(false);
      }
    };
    loadPreview();
    return () => {
      isCancelled = true;
    };
  }, [
    config.dataSource,
    config.metric,
    config.staffId,
    groupBy,
    startDate,
    startDate,
    endDate,
    config.locationId,
  ]);

  const getDataKey = () => {
    if (
      config.dataSource === "appointments" &&
      config.metric === "by_service"
    ) {
      return "count";
    }
    if (config.dataSource === "clients" && config.metric === "by_source") {
      return "count";
    }
    if (config.dataSource === "revenue" && config.metric === "by_service") {
      return "revenue";
    }
    if (config.dataSource === "services" && config.metric === "popularity") {
      return "bookings";
    }
    if (config.metric === "by_location") {
      return config.dataSource === "revenue" ? "revenue" : "count";
    }
    return "value";
  };

  const getNameKey = () => {
    if (
      config.dataSource === "appointments" &&
      config.metric === "by_service"
    ) {
      return "service";
    }
    if (config.dataSource === "clients" && config.metric === "by_source") {
      return "source";
    }
    if (config.dataSource === "revenue" && config.metric === "by_service") {
      return "service";
    }
    if (config.dataSource === "services" && config.metric === "popularity") {
      return "service";
    }
    if (config.metric === "by_location") return "name";
    return "name";
  };

  const handleSave = () => {
    const chartConfig: ChartConfig = {
      id: editingChart?.id || `chart-${Date.now()}`,
      title: config.title,
      type: "pie",
      dataKey: previewDataKeys[0] || getDataKey(),
      xAxisKey: nameKey || getNameKey(),
      colors: ["#3b61c0", "#00bfff", "#f59e0b", "#dc2626", "#1f2937"],
      data: previewData,
      layout: editingChart?.layout || {
        x: 0,
        y: 0,
        w: 6,
        h: 4,
      },
      configuration: {
        dataSource: config.dataSource,
        metric: config.metric,
        staffId: config.staffId?.trim() || undefined,
        locationId: config.locationId?.trim() || undefined,
      },
    };

    onSave(chartConfig);
    onOpenChange(false);
  };

  return (
    <Modal
      label={t("Configure Pie Chart")}
      open={open}
      onOpenChange={onOpenChange}
      width="5xl"
    >
      <div className="grid grid-cols-1 gap-6 p-2 lg:grid-cols-[30%_70%]">
        {/* Configuration Panel */}
        <div className="space-y-4">
          <LabeledInput
            id="chart-title"
            label="Chart Title"
            placeholder="Enter chart title"
            value={config.title}
            onChange={(e) => setConfig({ ...config, title: e.target.value })}
          />

          <LabeledSelect<PieDataSource>
            id="data-source"
            label="Data Source"
            placeholder="Select data source"
            value={config.dataSource}
            onValueChange={(value) =>
              setConfig({
                ...config,
                dataSource: value as PieDataSource,
                metric: dataSourceMetrics[value as PieDataSource][0],
              })
            }
            options={[
              { id: "appointments", name: "Appointments" },
              { id: "clients", name: "Clients" },
              { id: "revenue", name: "Revenue" },
              { id: "services", name: "Services" },
            ]}
          />

          <LabeledSelect<PieMetric>
            id="metric"
            label="Metric"
            placeholder="Select metric"
            value={config.metric}
            onValueChange={(value) =>
              setConfig({ ...config, metric: value as PieMetric })
            }
            options={availableMetrics.map((metric) => ({
              id: metric,
              name: metric
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" "),
            }))}
          />

          <LabeledSelect<string>
            id="staff-id"
            label="Staff (optional)"
            placeholder={loadingStaff ? "Loading..." : "All staff"}
            value={(config.staffId as string) || "all"}
            onValueChange={(value) =>
              setConfig({
                ...config,
                staffId: value === "all" ? "" : value,
              })
            }
            options={[
              { id: "all", name: "All staff" },
              ...staffOptions.map((s) => ({
                id: s._id as string,
                name:
                  `${s.firstName} ${s.lastName}`.trim() || (s._id as string),
              })),
            ]}
          />

          <LabeledSelect<string>
            id="location-id"
            label="Location (optional)"
            placeholder={loadingLocations ? "Loading..." : "All locations"}
            value={config.locationId || "all"}
            onValueChange={(value) =>
              setConfig({
                ...config,
                locationId: value === "all" ? "" : value,
              })
            }
            options={[
              { id: "all", name: "All locations" },
              ...locationOptions.map((l) => ({
                id: l._id as string,
                name: l.name,
              })),
            ]}
          />
        </div>

        {/* Preview Panel */}
        <div className="space-y-2">
          <Label className="text-primary">{t("Preview")}</Label>
          <div className="rounded-lg p-0 h-96">
            {loadingPreview ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                {t("Loading preview...")}
              </div>
            ) : previewData.length > 0 ? (
              <div className="h-full">
                <PerformanceChart
                  title=""
                  data={
                    previewData as Array<{
                      [key: string]: string | number | boolean;
                    }>
                  }
                  type="pie"
                  dataKeys={
                    previewDataKeys.length ? previewDataKeys : [getDataKey()]
                  }
                  xAxisKey={nameKey || getNameKey()}
                  colors={[
                    "#3b61c0",
                    "#00bfff",
                    "#f59e0b",
                    "#dc2626",
                    "#1f2937",
                  ]}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                {t("No data to display")}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-center mt-4">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          iconType="cancel"
        >
          {t("Cancel")}
        </Button>
        <Button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700"
          iconType="save"
        >
          {t("Add Chart")}
        </Button>
      </div>
    </Modal>
  );
}
