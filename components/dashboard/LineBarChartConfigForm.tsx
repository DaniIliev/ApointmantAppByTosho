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
import { Checkbox } from "@/components/ui/checkbox";
import type { ChartConfig } from "./types";
import { getDashboardData } from "./mockDashboardData";
import { PerformanceChart } from "@/components/performance/PerformanceChart";
import { useDashboardDate } from "@/context/DashboardDateContext";
import { useStaffOptions } from "./useStaffOptions";

interface LineBarChartConfigFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: ChartConfig) => void;
  editingChart?: ChartConfig;
}

type LineBarDataSource = "appointments" | "revenue";
type LineBarMetric = "count" | "total_revenue";

// Global date range is used; local time ranges removed

const dataSourceMetrics: Record<LineBarDataSource, LineBarMetric[]> = {
  appointments: ["count"],
  revenue: ["total_revenue"],
};

interface LineBarConfig {
  title: string;
  dataSource: LineBarDataSource;
  metric: LineBarMetric;
  showLine: boolean;
  showBar: boolean;
  compareMode: "week" | "standard"; // week comparison or standard view
  staffId?: string;
}

export function LineBarChartConfigForm({
  open,
  onOpenChange,
  onSave,
  editingChart,
}: LineBarChartConfigFormProps) {
  const { startDate, endDate, groupBy } = useDashboardDate();
  const { staffOptions, loadingStaff } = useStaffOptions();

  const [config, setConfig] = useState<LineBarConfig>({
    title: "Appointments vs Target",
    dataSource: "appointments",
    metric: "count",
    showLine: true,
    showBar: true,
    compareMode: "week",
    staffId: "",
  });

  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);

  // Generate preview data using global date range with week comparison
  useMemo(() => {
    const mockData = getDashboardData(
      config.dataSource,
      "time_series",
      startDate,
      endDate,
      groupBy
    ) as Record<string, unknown>[];

    // Transform to include previous week data for line visualization
    const transformedData = mockData.map((item, idx) => {
      // Simulate previous week data (slightly lower values)
      const factor = 0.85;
      return {
        name: item.name,
        // Current week (bars)
        ...(config.dataSource === "appointments" && {
          count: Number(item.total ?? 0),
          completed: Number((item as Record<string, unknown>).completed ?? 0),
          // Previous week (lines)
          prevCount: Math.round(Number(item.total ?? 0) * factor),
          prevCompleted: Math.round(
            Number((item as Record<string, unknown>).completed ?? 0) * factor
          ),
        }),
        ...(config.dataSource === "revenue" && {
          revenue: Number((item as Record<string, unknown>).revenue ?? 0),
          prevRevenue: Math.round(
            Number((item as Record<string, unknown>).revenue ?? 0) * factor
          ),
        }),
      };
    });

    setPreviewData(transformedData);
  }, [config, startDate, endDate, groupBy]);

  const getDataKeys = () => {
    if (config.dataSource === "appointments" && config.metric === "count") {
      return ["count", "completed", "prevCount", "prevCompleted"];
    }
    if (config.dataSource === "revenue" && config.metric === "total_revenue") {
      return ["revenue", "prevRevenue"];
    }
    return ["count"];
  };

  const handleSave = () => {
    // Week-over-week comparison: current week as bars, previous week as lines
    const seriesConfig =
      config.dataSource === "appointments"
        ? {
            barSeries: ["count", "completed"],
            lineSeries: ["prevCount", "prevCompleted"],
          }
        : { barSeries: ["revenue"], lineSeries: ["prevRevenue"] };

    const chartConfig: ChartConfig = {
      id: editingChart?.id || `chart-${Date.now()}`,
      title: config.title,
      type: "linebar",
      dataKey: config.dataSource,
      dataKeys: getDataKeys(),
      xAxisKey: "name",
      colors: ["#3b61c0", "#00bfff", "#f59e0b", "#dc2626", "#1f2937"],
      data: previewData,
      seriesConfig,
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
          <DialogTitle>Configure Line & Bar Chart</DialogTitle>
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
                    dataSource: value as LineBarDataSource,
                    metric: dataSourceMetrics[value as LineBarDataSource][0],
                  })
                }
              >
                <SelectTrigger id="data-source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appointments">Appointments</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time Range removed; using global date selector */}

            {/* Display Options */}
            <div className="space-y-3">
              <Label className="text-slate-700">Display Options</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="compare-weeks"
                    checked={config.compareMode === "week"}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        compareMode: checked ? "week" : "standard",
                      })
                    }
                    disabled={config.dataSource !== "appointments"}
                  />
                  <Label htmlFor="compare-weeks" className="cursor-pointer">
                    Compare Weeks (Current vs Previous Weeks)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="show-line"
                    checked={config.showLine}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        showLine: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="show-line" className="cursor-pointer">
                    Show Line
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="show-bar"
                    checked={config.showBar}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        showBar: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="show-bar" className="cursor-pointer">
                    Show Bar
                  </Label>
                </div>
              </div>
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
                  type="linebar"
                  dataKeys={getDataKeys()}
                  xAxisKey="name"
                  colors={[
                    "#3b61c0",
                    "#00bfff",
                    "#f59e0b",
                    "#dc2626",
                    "#1f2937",
                  ]}
                  seriesConfig={
                    config.dataSource === "appointments"
                      ? {
                          barSeries: ["count", "completed"],
                          lineSeries: ["prevCount", "prevCompleted"],
                        }
                      : { barSeries: ["revenue"], lineSeries: ["prevRevenue"] }
                  }
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
