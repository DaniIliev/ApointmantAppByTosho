"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import type { ChartConfig } from "./types";
import { PerformanceChart } from "@/components/performance/PerformanceChart";
import { useDashboardDate } from "@/context/DashboardDateContext";
import { useStaffOptions } from "./useStaffOptions";
import { fetchPreviewData } from "./analyticsPreview";

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
  | "by_staff";

const dataSourceMetrics: Record<BarDataSource, BarMetric[]> = {
  appointments: ["count", "by_service"],
  clients: ["by_source"],
  revenue: ["by_service", "by_staff"],
  services: ["popularity"],
  staff: ["appointments_count"],
};

interface BarConfig {
  title: string;
  dataSource: BarDataSource;
  metric: BarMetric;
  staffId?: string;
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

  const [config, setConfig] = useState<BarConfig>({
    title: "Appointments by Status",
    dataSource: "appointments",
    metric: "count",
    staffId: "",
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
          groupBy,
          startDate,
          endDate,
        });
        if (isCancelled) return;
        setPreviewData(result.data);
        setPreviewDataKeys(
          result.dataKeys?.length ? result.dataKeys : getDataKeys()
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
    endDate,
  ]);

  const getDataKeys = () => {
    if (config.dataSource === "appointments" && config.metric === "count") {
      return ["count", "completed", "cancelled"];
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
      return ["count", "completed", "cancelled"];
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
      },
    };

    onSave(chartConfig);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[500px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Bar Chart</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
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
                { id: "all", name: "All staff" },
                ...staffOptions.map((s) => ({
                  id: s._id as string,
                  name:
                    `${s.firstName} ${s.lastName}`.trim() || (s._id as string),
                })),
              ]}
            />
          </div>

          {/* Preview Panel */}
          <div className="space-y-2">
            <Label className="text-slate-700">Preview</Label>
            <div className="border border-slate-200 rounded-lg p-0 bg-slate-50">
              {loadingPreview ? (
                <div className="h-48 flex items-center justify-center text-slate-400">
                  Loading preview...
                </div>
              ) : previewData.length > 0 ? (
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
                  colors={[
                    "#3b61c0",
                    "#00bfff",
                    "#f59e0b",
                    "#dc2626",
                    "#1f2937",
                  ]}
                />
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-400">
                  No data to display
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Chart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
