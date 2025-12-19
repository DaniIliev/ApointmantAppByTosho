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

interface LineChartConfigFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: ChartConfig) => void;
  editingChart?: ChartConfig;
}

type LineDataSource =
  | "appointments"
  | "clients"
  | "revenue"
  | "staff"
  | "services";
const dataSourceMetrics: Record<LineDataSource, string[]> = {
  appointments: ["count", "by_service", "by_status", "by_staff"],
  clients: ["by_source"],
  revenue: ["by_service", "by_staff"],
  services: ["popularity"],
  staff: ["appointments_count"],
};

interface LineConfig {
  title: string;
  dataSource: LineDataSource;
  metric: string;
  staffId?: string;
}

export function LineChartConfigForm({
  open,
  onOpenChange,
  onSave,
  editingChart,
}: LineChartConfigFormProps) {
  const { t } = useTranslation();
  const [config, setConfig] = useState<LineConfig>(() => {
    if (editingChart && editingChart.type === "line") {
      return {
        title: editingChart.title,
        dataSource:
          (editingChart.configuration?.dataSource as LineDataSource) ||
          "appointments",
        metric: editingChart.configuration?.metric || "count",
        staffId: editingChart.configuration?.staffId || "",
      };
    }
    return {
      title: "Appointments Trend",
      dataSource: "appointments",
      metric: "count",
      staffId: "",
    };
  });

  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
  const [previewDataKeys, setPreviewDataKeys] = useState<string[]>([]);
  const [previewXAxisKey, setPreviewXAxisKey] = useState<string>("name");
  const [loadingPreview, setLoadingPreview] = useState(true);
  const { startDate, endDate, groupBy } = useDashboardDate();
  const availableMetrics = dataSourceMetrics[config.dataSource] || ["count"];
  const { staffOptions, loadingStaff } = useStaffOptions();

  const getDataKeys = () => {
    if (config.dataSource === "appointments" && config.metric === "count") {
      return ["count", "completed", "cancelled"];
    }
    if (
      config.dataSource === "appointments" &&
      (config.metric === "by_service" || config.metric === "by_status")
    ) {
      return ["count"];
    }
    if (config.dataSource === "appointments" && config.metric === "by_staff") {
      return ["count", "completed", "cancelled"];
    }
    if (config.dataSource === "clients" && config.metric === "by_source") {
      return ["count"];
    }
    if (config.dataSource === "revenue") {
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
      config.metric === "by_status" ||
      config.metric === "by_source" ||
      config.metric === "popularity" ||
      config.metric === "by_staff"
    ) {
      return "name";
    }
    return "name";
  };

  useEffect(() => {
    let isCancelled = false;
    const loadPreview = async () => {
      setLoadingPreview(true);
      try {
        const result = await fetchPreviewData({
          chartType: "line",
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

  const handleSave = () => {
    const dataKeys = previewDataKeys.length ? previewDataKeys : getDataKeys();
    const chartConfig: ChartConfig = {
      id: editingChart?.id || `chart-${Date.now()}`,
      title: config.title,
      type: "line",
      dataKey: config.dataSource,
      dataKeys,
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
    <Modal
      label={t("Configure Line Chart")}
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

          <LabeledSelect<LineDataSource>
            id="data-source"
            label="Data Source"
            placeholder="Select data source"
            value={config.dataSource}
            onValueChange={(value) =>
              setConfig({
                ...config,
                dataSource: value as LineDataSource,
                metric: dataSourceMetrics[value as LineDataSource][0],
              })
            }
            options={[
              { id: "appointments", name: "Appointments" },
              { id: "clients", name: "Clients" },
              { id: "revenue", name: "Revenue" },
              { id: "services", name: "Services" },
              { id: "staff", name: "Staff" },
            ]}
          />

          <LabeledSelect<string>
            id="metric"
            label="Metric"
            placeholder="Select metric"
            value={config.metric}
            onValueChange={(value) => setConfig({ ...config, metric: value })}
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
                  type="line"
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
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                {t("No data to display")}
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
