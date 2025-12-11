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
  | "client_distribution";

const dataSourceMetrics: Record<PieDataSource, PieMetric[]> = {
  appointments: ["by_service"],
  clients: ["by_source"],
  revenue: ["by_service"],
  services: ["popularity"],
};

interface PieConfig {
  title: string;
  dataSource: PieDataSource;
  metric: PieMetric;
  showLegend: boolean;
}

export function PieChartConfigForm({
  open,
  onOpenChange,
  onSave,
  editingChart,
}: PieChartConfigFormProps) {
  const [config, setConfig] = useState<PieConfig>({
    title: "Appointments by Service",
    dataSource: "appointments",
    metric: "by_service",
    showLegend: true,
  });

  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
  const { startDate, endDate, groupBy } = useDashboardDate();

  const availableMetrics = dataSourceMetrics[config.dataSource] || [
    "by_service",
  ];

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
    return "name";
  };

  const handleSave = () => {
    const chartConfig: ChartConfig = {
      id: editingChart?.id || `chart-${Date.now()}`,
      title: config.title,
      type: "pie",
      dataKey: getDataKey(),
      xAxisKey: getNameKey(),
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
        timeRange: "month",
        metric: config.metric,
      },
    };

    onSave(chartConfig);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[500px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Pie Chart</DialogTitle>
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

            {/* Data Source */}
            <div className="space-y-2">
              <Label htmlFor="data-source" className="text-slate-700">
                Data Source
              </Label>
              <Select
                value={config.dataSource}
                onValueChange={(value) =>
                  setConfig({
                    ...config,
                    dataSource: value as PieDataSource,
                    metric: dataSourceMetrics[value as PieDataSource][0],
                  })
                }
              >
                <SelectTrigger id="data-source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appointments">Appointments</SelectItem>
                  <SelectItem value="clients">Clients</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Metric */}
            <div className="space-y-2">
              <Label htmlFor="metric" className="text-slate-700">
                Metric
              </Label>
              <Select
                value={config.metric}
                onValueChange={(value) =>
                  setConfig({ ...config, metric: value as PieMetric })
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
                  type="pie"
                  dataKey={getDataKey()}
                  xAxisKey={getNameKey()}
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
