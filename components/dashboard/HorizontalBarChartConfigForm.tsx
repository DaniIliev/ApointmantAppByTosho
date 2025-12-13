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
import type { ChartConfig } from "./types";
import { PerformanceChart } from "@/components/performance/PerformanceChart";
import { useDashboardDate } from "@/context/DashboardDateContext";
import { useStaffOptions } from "./useStaffOptions";
import { fetchPreviewData } from "./analyticsPreview";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";

interface HorizontalBarChartConfigFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: ChartConfig) => void;
  editingChart?: ChartConfig;
}

const barOptions = [
  { id: "by_service", label: "By Service" },
  { id: "by_staff", label: "By Staff" },
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
        metric: "by_service",
        staffId: "",
      },
    } as ChartConfig;
  });

  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
  const [previewDataKeys, setPreviewDataKeys] = useState<string[]>([]);
  const [previewXAxisKey, setPreviewXAxisKey] = useState<string>("name");
  const [loadingPreview, setLoadingPreview] = useState(true);
  const { startDate, endDate, groupBy } = useDashboardDate();
  const { staffOptions, loadingStaff } = useStaffOptions();

  useEffect(() => {
    let isCancelled = false;
    const loadPreview = async () => {
      setLoadingPreview(true);
      try {
        const result = await fetchPreviewData({
          chartType: "hbar",
          dataSource:
            (config.configuration?.dataSource as string) || "appointments",
          metric: (config.configuration?.metric as string) || "by_service",
          staffId: (config.configuration as any)?.staffId || undefined,
          groupBy,
          startDate,
          endDate,
        });
        if (isCancelled) return;
        setPreviewData(result.data);
        setPreviewDataKeys(result.dataKeys || []);
        setPreviewXAxisKey(result.xAxisKey || "name");
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
    config.configuration?.dataSource,
    config.configuration?.metric,
    (config.configuration as any)?.staffId,
    groupBy,
    startDate,
    endDate,
  ]);

  const handleSave = () => {
    const updatedConfig: ChartConfig = {
      ...config,
      data: previewData,
      configuration: {
        dataSource:
          (config.configuration?.dataSource as string) || "appointments",
        metric: (config.configuration?.metric as string) || "by_service",
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
          <LabeledInput
            id="chart-title"
            label="Chart Title"
            placeholder="Enter chart title"
            value={config.title}
            onChange={(e) => setConfig({ ...config, title: e.target.value })}
          />

          <LabeledSelect<string>
            id="data-source"
            label="Data Source"
            placeholder="Select data source"
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
                    value === "appointments" ? "by_service" : "by_service",
                } as ChartConfig["configuration"],
              })
            }
            options={[
              { id: "appointments", name: "Appointments" },
              { id: "revenue", name: "Revenue" },
            ]}
          />

          <LabeledSelect<string>
            id="metric"
            label="Metric"
            placeholder="Select metric"
            value={(config.configuration?.metric as string) || "by_service"}
            onValueChange={(value) =>
              setConfig({
                ...config,
                configuration: {
                  ...config.configuration,
                  metric: value,
                } as ChartConfig["configuration"],
              })
            }
            options={barOptions.map((option) => ({
              id: option.id,
              name: option.label,
            }))}
          />

          <LabeledSelect<string>
            id="staff-id"
            label="Staff (optional)"
            placeholder={loadingStaff ? "Loading..." : "All staff"}
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
            options={[
              { id: "all", name: "All staff" },
              ...staffOptions.map((s) => ({
                id: s._id as string,
                name:
                  `${s.firstName} ${s.lastName}`.trim() || (s._id as string),
              })),
            ]}
            disabled={loadingStaff}
          />

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="border rounded-lg p-0 h-96 bg-slate-50">
              {loadingPreview ? (
                <div className="flex items-center justify-center h-full text-slate-500">
                  Loading preview...
                </div>
              ) : previewData && previewData.length > 0 ? (
                <PerformanceChart
                  title={config.title}
                  data={previewData.map((item) => ({ ...item }))}
                  type="hbar"
                  xAxisKey={previewXAxisKey || "name"}
                  dataKeys={
                    previewDataKeys.length ? previewDataKeys : ["count"]
                  }
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
