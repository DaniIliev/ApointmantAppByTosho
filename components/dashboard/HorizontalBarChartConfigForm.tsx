"use client";

import React, { useState, useEffect } from "react";
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

interface HorizontalBarChartConfigFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: ChartConfig) => void;
  editingChart?: ChartConfig;
}

const barOptions = [
  { id: "byService", label: "By Service" },
  { id: "byStaff", label: "By Staff" },
];

const colors = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];

export function HorizontalBarChartConfigForm({
  open,
  onOpenChange,
  onSave,
  editingChart,
}: HorizontalBarChartConfigFormProps) {
  const [config, setConfig] = useState<ChartConfig>(() => {
    if (editingChart && editingChart.type === "hbar") {
      return editingChart as ChartConfig;
    }
    return {
      id: `chart-${Date.now()}`,
      type: "hbar" as const,
      title: "Horizontal Bar Chart",
      data: [],
      dataKey: "count",
      dataKeys: ["count"],
      xAxisKey: "name",
      colors: [colors[0]],
      configuration: {
        dataSource: "appointments",
        metric: "byService",
        staffId: "",
      },
    } as ChartConfig;
  });

  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
  const { startDate, endDate, groupBy } = useDashboardDate();
  const { staffOptions, loadingStaff } = useStaffOptions();

  // Generate preview data
  useEffect(() => {
    if (config.configuration?.dataSource === "appointments") {
      const data = getDashboardData(
        "appointments",
        config.configuration?.metric || "by_service",
        startDate,
        endDate,
        groupBy
      ) as Record<string, unknown>[];

      // Transform data to use 'name' instead of 'service'
      const transformedData = data.map((item: Record<string, unknown>) => ({
        name: (item.service as string) || (item.date as string) || "",
        count: item.count,
      }));

      setPreviewData(transformedData);
    }
  }, [
    config.configuration?.dataSource,
    config.configuration?.metric,
    startDate,
    endDate,
    groupBy,
  ]);

  const handleSave = () => {
    const updatedConfig: ChartConfig = {
      ...config,
      data: previewData,
      configuration: {
        dataSource:
          (config.configuration?.dataSource as string) || "appointments",
        metric: (config.configuration?.metric as string) || "byService",
        staffId:
          (config.configuration as any)?.staffId?.toString()?.trim() ||
          undefined,
      },
    };
    onSave(updatedConfig);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Configure Horizontal Bar Chart</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label>Chart Title</Label>
            <Input
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              placeholder="Enter chart title"
            />
          </div>

          {/* Data Source */}
          <div className="space-y-2">
            <Label>Data Source</Label>
            <Select
              value={
                (config.configuration?.dataSource as string) || "appointments"
              }
              onValueChange={(value) =>
                setConfig({
                  ...config,
                  configuration: {
                    ...config.configuration,
                    dataSource: value,
                    metric:
                      value === "appointments" ? "byService" : "byService",
                  } as ChartConfig["configuration"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select data source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appointments">Appointments</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Metric */}
          <div className="space-y-2">
            <Label>Metric</Label>
            <Select
              value={(config.configuration?.metric as string) || "byService"}
              onValueChange={(value) =>
                setConfig({
                  ...config,
                  configuration: {
                    ...config.configuration,
                    metric: value,
                  } as ChartConfig["configuration"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                {barOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Staff filter */}
          <div className="space-y-2">
            <Label>Staff (optional)</Label>
            <Select
              value={(config.configuration as any)?.staffId || "all"}
              onValueChange={(value) =>
                setConfig({
                  ...config,
                  configuration: {
                    ...config.configuration,
                    staffId: value === "all" ? "" : value,
                  } as ChartConfig["configuration"],
                })
              }
              disabled={loadingStaff}
            >
              <SelectTrigger>
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

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="border rounded-lg p-4 h-96 bg-slate-50">
              {previewData && previewData.length > 0 ? (
                <PerformanceChart
                  title={config.title}
                  data={previewData.map((item) => ({
                    ...item,
                  }))}
                  type="hbar"
                  xAxisKey="name"
                  dataKeys={["count"]}
                  colors={config.colors}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingChart ? "Update Chart" : "Create Chart"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
