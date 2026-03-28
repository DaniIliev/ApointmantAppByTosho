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
  const { t } = useTranslation();
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
  const { locationOptions, loadingLocations } = useLocationOptions();

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
    config.configuration?.locationId,
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
    <Modal
      label={t("Configure Horizontal Bar Chart")}
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
          />

          <LabeledSelect<string>
            id="location-id"
            label="Location (optional)"
            placeholder={loadingLocations ? "Loading..." : "All locations"}
            value={(config.configuration as any)?.locationId || "all"}
            onValueChange={(value) =>
              setConfig({
                ...config,
                configuration: {
                  ...config.configuration,
                  locationId: value === "all" ? "" : value,
                } as ChartConfig["configuration"],
              })
            }
            options={[
              { id: "all", name: "All locations" },
              ...locationOptions.map((l: any) => ({
                id: l._id,
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
              <div className="flex items-center justify-center h-full text-slate-400">
                {t("Loading preview...")}
              </div>
            ) : previewData && previewData.length > 0 ? (
              <div className="h-full">
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
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                {t("No data available")}
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
          {t(editingChart ? "Update Chart" : "Create Chart")}
        </Button>
      </div>
    </Modal>
  );
}
