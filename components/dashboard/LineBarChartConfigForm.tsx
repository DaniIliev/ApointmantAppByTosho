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
import { Checkbox } from "@/components/ui/checkbox";
import type { ChartConfig } from "./types";
import { PerformanceChart } from "@/components/performance/PerformanceChart";
import { useDashboardDate } from "@/context/DashboardDateContext";
import { useStaffOptions } from "./useStaffOptions";
import { fetchPreviewData } from "./analyticsPreview";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";

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
  const [previewDataKeys, setPreviewDataKeys] = useState<string[]>([]);
  const [previewSeries, setPreviewSeries] = useState<Record<string, unknown>>({
    barSeries: [],
    lineSeries: [],
  });
  const [loadingPreview, setLoadingPreview] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    const loadPreview = async () => {
      setLoadingPreview(true);
      try {
        const result = await fetchPreviewData({
          chartType: "linebar",
          dataSource: config.dataSource,
          metric: config.metric,
          staffId: config.staffId || undefined,
          groupBy,
          startDate,
          endDate,
        });
        if (isCancelled) return;
        setPreviewData(result.data);
        setPreviewDataKeys(result.dataKeys || []);
        setPreviewSeries(
          result.seriesConfig || { barSeries: [], lineSeries: [] }
        );
      } catch (err) {
        if (!isCancelled) {
          setPreviewData([]);
          setPreviewDataKeys([]);
          setPreviewSeries({ barSeries: [], lineSeries: [] });
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
      previewSeries && Object.keys(previewSeries).length
        ? previewSeries
        : config.dataSource === "appointments"
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
      dataKeys: previewDataKeys.length ? previewDataKeys : getDataKeys(),
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
            <LabeledInput
              id="chart-title"
              label="Chart Title"
              placeholder="Enter chart title"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
            />

            <LabeledSelect<LineBarDataSource>
              id="data-source"
              label="Data Source"
              placeholder="Select data source"
              value={config.dataSource}
              onValueChange={(value) =>
                setConfig({
                  ...config,
                  dataSource: value as LineBarDataSource,
                  metric: dataSourceMetrics[value as LineBarDataSource][0],
                })
              }
              options={[
                { id: "appointments", name: "Appointments" },
                { id: "revenue", name: "Revenue" },
              ]}
            />

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
                  type="linebar"
                  dataKeys={
                    previewDataKeys.length ? previewDataKeys : getDataKeys()
                  }
                  xAxisKey="name"
                  colors={[
                    "#3b61c0",
                    "#00bfff",
                    "#f59e0b",
                    "#dc2626",
                    "#1f2937",
                  ]}
                  seriesConfig={previewSeries}
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
