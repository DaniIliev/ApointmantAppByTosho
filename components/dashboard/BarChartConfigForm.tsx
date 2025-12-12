"use client";
import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { ChartConfig } from "./types";
import { getDashboardData } from "./mockDashboardData";
import { PerformanceChart } from "@/components/performance/PerformanceChart";
import { useDashboardDate } from "@/context/DashboardDateContext";
import { useStaffOptions } from "./useStaffOptions";

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
  const availableMetrics = dataSourceMetrics[config.dataSource] || ["count"];

  // Generate preview data
  useMemo(() => {
    const mockData = getDashboardData(
      config.dataSource,
      config.metric,
      startDate,
      endDate,
      groupBy
    ) as Record<string, unknown>[];

    setPreviewData(mockData);
  }, [config, startDate, endDate, groupBy]);

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
      dataKeys: getDataKeys(),
      xAxisKey: getXAxisKey(),
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
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="chart-title" className="text-slate-700">
                Chart Title
              </Label>
              <Input
                id="chart-title"
                value={config.title}
                onChange={(e) =>
                  setConfig({ ...config, title: e.target.value })
                }
                className="border-slate-300"
              />
            </div>

            {/* Metric */}
            <div className="space-y-2">
              <Label htmlFor="metric" className="text-slate-700">
                Metric
              </Label>
              <Select
                value={config.metric}
                onValueChange={(value) =>
                  setConfig({ ...config, metric: value as BarMetric })
                }
              >
                <SelectTrigger id="metric">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableMetrics.map((metric) => (
                    <SelectItem key={metric} value={metric}>
                      {metric
                        .split("_")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Staff filter */}
            <div className="space-y-2">
              <Label htmlFor="staff-id" className="text-slate-700">
                Staff (optional)
              </Label>
              <Select
                value={config.staffId || "all"}
                onValueChange={(value) =>
                  setConfig({
                    ...config,
                    staffId: value === "all" ? "" : value,
                  })
                }
                disabled={loadingStaff}
              >
                <SelectTrigger id="staff-id">
                  <SelectValue
                    placeholder={loadingStaff ? "Loading..." : "All staff"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All staff</SelectItem>
                  {staffOptions.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {`${s.firstName} ${s.lastName}`.trim() || s._id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-2">
            <Label className="text-slate-700">Preview</Label>
            <div className="border border-slate-200 rounded-lg p-2 bg-slate-50">
              {previewData.length > 0 ? (
                <PerformanceChart
                  title=""
                  data={
                    previewData as Array<{
                      [key: string]: string | number | boolean;
                    }>
                  }
                  type="bar"
                  dataKeys={getDataKeys()}
                  xAxisKey={getXAxisKey()}
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
