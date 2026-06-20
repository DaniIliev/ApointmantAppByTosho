"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import type { ChartConfig } from "./types";
import { PerformanceChart } from "@/components/performance/PerformanceChart";
import { useDashboardDate } from "@/context/DashboardDateContext";
import { useStaffOptions } from "./useStaffOptions";
import { fetchPreviewData } from "./analyticsPreview";
import { Modal } from "../customUIComponents/Modal";
import { useTranslation } from "react-i18next";
import { useLocationOptions } from "./useLocationOptions";
import { getThemeChartColorTokens } from "@/lib/themeColors";

interface BarChartConfigFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: ChartConfig) => void;
  editingChart?: ChartConfig;
}

type BarDataSource =
  | "appointments"
  | "clients"
  | "revenue"
  | "services"
  | "staff";
type BarMetric =
  | "count"
  | "by_service"
  | "by_source"
  | "popularity"
  | "appointments_count"
  | "by_staff"
  | "by_location";

const dataSourceMetrics: Record<BarDataSource, BarMetric[]> = {
  appointments: ["count", "by_service", "by_location"],
  clients: ["by_source"],
  revenue: ["by_service", "by_staff", "by_location"],
  services: ["popularity"],
  staff: ["appointments_count"],
};

interface BarConfig {
  title: string;
  dataSource: BarDataSource;
  metric: BarMetric;
  staffId?: string;
  locationId?: string;
  showValues: boolean;
}

export function BarChartConfigForm({
  open,
  onOpenChange,
  onSave,
  editingChart,
}: BarChartConfigFormProps) {
  const { startDate, endDate, groupBy } = useDashboardDate();
  const { staffOptions, loadingStaff } = useStaffOptions();
  const { locationOptions, loadingLocations } = useLocationOptions();
  const { t } = useTranslation();
  const [config, setConfig] = useState<BarConfig>({
    title: "Appointments by Status",
    dataSource: "appointments",
    metric: "count",
    staffId: "",
    locationId: "",
    showValues: true,
  });

  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
  const [previewDataKeys, setPreviewDataKeys] = useState<string[]>([]);
  const [previewXAxisKey, setPreviewXAxisKey] = useState<string>("name");
  const [loadingPreview, setLoadingPreview] = useState(true);
  const availableMetrics = dataSourceMetrics[config.dataSource] || ["count"];

  useEffect(() => {
    let isCancelled = false;
    const loadPreview = async () => {
      setLoadingPreview(true);
      try {
        const result = await fetchPreviewData({
          chartType: "bar",
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
        setPreviewDataKeys(
          result.dataKeys?.length ? result.dataKeys : getDataKeys(),
        );
        setPreviewXAxisKey(result.xAxisKey || getXAxisKey());
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

  const getDataKeys = () => {
    if (config.dataSource === "appointments" && config.metric === "count") {
      return ["count", "completed", "cancelled", "upcoming"];
    }
    if (
      config.dataSource === "appointments" &&
      config.metric === "by_service"
    ) {
      return ["revenue", "count"];
    }
    if (config.dataSource === "clients" && config.metric === "by_source") {
      return ["count"];
    }
    if (config.dataSource === "revenue" && config.metric === "by_service") {
      return ["revenue"];
    }
    if (config.dataSource === "revenue" && config.metric === "by_staff") {
      return ["revenue"];
    }
    if (config.dataSource === "services" && config.metric === "popularity") {
      return ["bookings"];
    }
    if (
      config.dataSource === "staff" &&
      config.metric === "appointments_count"
    ) {
      return ["count", "completed", "cancelled", "upcoming"];
    }
    if (config.metric === "by_location") {
      return config.dataSource === "revenue" ? ["revenue"] : ["count"];
    }
    return ["count"];
  };

  const getXAxisKey = () => {
    if (
      config.metric === "by_service" ||
      config.metric === "popularity" ||
      config.metric === "by_source"
    ) {
      if (config.dataSource === "appointments") return "service";
      if (config.dataSource === "clients") return "source";
      if (config.dataSource === "revenue") return "service";
      if (config.dataSource === "services") return "service";
    }
    if (config.metric === "by_location") return "name";
    if (config.dataSource === "staff") return "name";
    return "date";
  };

  const handleSave = () => {
    const chartConfig: ChartConfig = {
      id: editingChart?.id || `chart-${Date.now()}`,
      title: config.title,
      type: "bar",
      dataKey: config.dataSource,
      dataKeys: previewDataKeys.length ? previewDataKeys : getDataKeys(),
      xAxisKey: previewXAxisKey || getXAxisKey(),
      colors: getThemeChartColorTokens(),
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
      label={t("Configure Bar Chart")}
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

          <LabeledSelect<BarMetric>
            id="metric"
            label="Metric"
            placeholder="Select metric"
            value={config.metric}
            onValueChange={(value) =>
              setConfig({ ...config, metric: value as BarMetric })
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
              { id: "all", name: t("All staff") },
              ...staffOptions
                .filter(s => !config.locationId || config.locationId === "all" || s.locationIds?.includes(config.locationId))
                .map((s) => ({
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
                staffId: "",
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
                  type="bar"
                  dataKeys={
                    previewDataKeys.length ? previewDataKeys : getDataKeys()
                  }
                  xAxisKey={previewXAxisKey || getXAxisKey()}
                  colors={getThemeChartColorTokens()}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No data to display
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
