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
import { Plus, X } from "lucide-react";
import type { ChartConfig } from "./types";
import { getDashboardData } from "./mockDashboardData";
import { PerformanceChart } from "@/components/performance/PerformanceChart";
import { useDashboardDate } from "@/context/DashboardDateContext";

interface LineChartConfigFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: ChartConfig) => void;
  editingChart?: ChartConfig;
}

type LineDataSource = "appointments" | "clients" | "revenue" | "staff";

const staffMembers = ["Daniel", "Sarah", "John", "Emma"];
const timeRanges = [
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "year", label: "This Year" },
];

interface LineConfig {
  title: string;
  timeRange: "week" | "month" | "year";
  dataSource: LineDataSource;
  lines: Array<{
    id: string;
    label: string;
    filter?: string;
    visible: boolean;
  }>;
}

export function LineChartConfigForm({
  open,
  onOpenChange,
  onSave,
  editingChart,
}: LineChartConfigFormProps) {
  const [config, setConfig] = useState<LineConfig>(() => {
    if (editingChart && editingChart.type === "line") {
      return {
        title: editingChart.title,
        timeRange:
          (editingChart.configuration?.timeRange as
            | "week"
            | "month"
            | "year") || "week",
        dataSource:
          (editingChart.configuration?.dataSource as LineDataSource) ||
          "appointments",
        lines: editingChart.dataKeys?.map((label, idx) => ({
          id: `line-${idx}`,
          label,
          filter: label === "All Appointments" ? "all" : label,
          visible: true,
        })) || [
          {
            id: "line-1",
            label: "All Appointments",
            filter: "all",
            visible: true,
          },
        ],
      };
    }
    return {
      title: "Appointments Trend",
      timeRange: "week",
      dataSource: "appointments",
      lines: [
        {
          id: "line-1",
          label: "All Appointments",
          filter: "all",
          visible: true,
        },
      ],
    };
  });

  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
  const { startDate, endDate, groupBy } = useDashboardDate();

  // Generate preview data
  useMemo(() => {
    if (config.dataSource === "appointments") {
      // Get all unique dates from all selected lines
      const allDates = new Set<string>();
      const lineDataMap: Record<string, Record<string, unknown>[]> = {};
      // Fetch data for each line based on its filter
      config.lines.forEach((line) => {
        let data: Record<string, unknown>[];

        if (line.filter === "all") {
          // Get all appointments time series
          data = getDashboardData(
            "appointments",
            "time_series",
            startDate,
            endDate,
            groupBy
          ) as Record<string, unknown>[];
        } else if (staffMembers.includes(line.filter || "")) {
          // Get staff-specific appointments using by_staff metric
          data = getDashboardData(
            "appointments",
            "by_staff",
            line.filter
          ) as Record<string, unknown>[];
        } else {
          data = [];
        }

        lineDataMap[line.label] = data;
        data.forEach((item: Record<string, unknown>) => {
          allDates.add((item.date as string) || "");
        });
      });

      // Build transformed data with all dates
      const transformedData = Array.from(allDates)
        .sort()
        .map((date) => {
          const newItem: Record<string, string | number | boolean> = {
            date,
          };

          config.lines.forEach((line) => {
            const lineData = lineDataMap[line.label] || [];
            const dataItem = (lineData as Array<Record<string, unknown>>).find(
              (d: Record<string, unknown>) => d.date === date
            );
            newItem[line.label] = (dataItem?.count as number) || 0;
          });

          return newItem;
        });

      setPreviewData(transformedData);
    }
  }, [config, startDate, endDate, groupBy]);

  const handleAddLine = () => {
    const newLineId = `line-${Date.now()}`;
    setConfig({
      ...config,
      lines: [
        ...config.lines,
        {
          id: newLineId,
          label: `Series ${config.lines.length + 1}`,
          filter: "all",
          visible: true,
        },
      ],
    });
  };

  const handleRemoveLine = (lineId: string) => {
    setConfig({
      ...config,
      lines: config.lines.filter((line) => line.id !== lineId),
    });
  };

  const handleUpdateLine = (
    lineId: string,
    updates: Partial<(typeof config.lines)[0]>
  ) => {
    setConfig({
      ...config,
      lines: config.lines.map((line) =>
        line.id === lineId ? { ...line, ...updates } : line
      ),
    });
  };

  const handleSave = () => {
    const dataKeys = config.lines
      .filter((line) => line.visible)
      .map((line) => line.label);

    const chartConfig: ChartConfig = {
      id: editingChart?.id || `chart-${Date.now()}`,
      title: config.title,
      type: "line",
      dataKey: config.dataSource,
      dataKeys,
      xAxisKey: "date",
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
        timeRange: config.timeRange,
        metric: "count",
      },
    };

    onSave(chartConfig);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Line Chart</DialogTitle>
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

            {/* Time Range */}
            <div className="space-y-2">
              <Label htmlFor="time-range" className="text-slate-700">
                Time Range
              </Label>
              <Select
                value={config.timeRange}
                onValueChange={(value) =>
                  setConfig({
                    ...config,
                    timeRange: value as "week" | "month" | "year",
                  })
                }
              >
                <SelectTrigger id="time-range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map((range) => (
                    <SelectItem key={range.id} value={range.id}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lines Configuration */}
            <div className="space-y-3">
              <Label className="text-slate-700">Data Lines</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {config.lines.map((line) => (
                  <div
                    key={line.id}
                    className="p-3 border border-slate-200 rounded-lg space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={line.visible}
                        onCheckedChange={(checked) =>
                          handleUpdateLine(line.id, {
                            visible: checked as boolean,
                          })
                        }
                      />
                      <Input
                        value={line.label}
                        onChange={(e) =>
                          handleUpdateLine(line.id, { label: e.target.value })
                        }
                        placeholder="Line label"
                        className="flex-1 h-8 text-sm"
                      />
                      <button
                        onClick={() => handleRemoveLine(line.id)}
                        className="p-1 hover:bg-red-100 rounded"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>

                    <Select
                      value={line.filter || "all"}
                      onValueChange={(value) =>
                        handleUpdateLine(line.id, {
                          filter: value === "all" ? "all" : value,
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Appointments</SelectItem>
                        {staffMembers.map((staff) => (
                          <SelectItem key={staff} value={staff}>
                            {staff}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleAddLine}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Line
              </Button>
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
                  type="line"
                  dataKeys={config.lines
                    .filter((l) => l.visible)
                    .map((l) => l.label)}
                  xAxisKey="date"
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
