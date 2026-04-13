"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { getThemeChartColorTokens } from "@/lib/themeColors";

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
  compareWeeks: boolean; // Compare current vs previous week
  staffId?: string;
  locationId?: string;
}

export function LineBarChartConfigForm({
  open,
  onOpenChange,
  onSave,
  editingChart,
}: LineBarChartConfigFormProps) {
  const { startDate, endDate, groupBy } = useDashboardDate();
  const { staffOptions, loadingStaff } = useStaffOptions();
  const { locationOptions, loadingLocations } = useLocationOptions();
  const { t } = useTranslation();

  const [config, setConfig] = useState<LineBarConfig>({
    title: "Appointments Comparison",
    dataSource: "appointments",
    metric: "count",
    compareWeeks: true,
    staffId: "",
    locationId: "",
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
          chartType: config.compareWeeks ? "linebar" : "bar",
          dataSource: config.dataSource,
          metric: config.metric,
          staffId: config.staffId || undefined,
          locationId: config.locationId || undefined,
          groupBy,
          startDate,
          endDate,
        });
        if (isCancelled) return;
        setPreviewData(result.data);
        setPreviewDataKeys(result.dataKeys || []);
        if (config.compareWeeks) {
          setPreviewSeries(
            (result.seriesConfig as Record<string, unknown>) || {
              barSeries: [],
              lineSeries: [],
            },
          );
        } else {
          // Non-comparison mode: show bars only for returned keys
          const bars = (result.dataKeys && result.dataKeys.length
            ? result.dataKeys
            : getDataKeys()) as unknown as string[];
          setPreviewSeries({ barSeries: bars, lineSeries: [] });
        }
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
    config.compareWeeks,
    groupBy,
    startDate,
    startDate,
    endDate,
    config.locationId,
  ]);

  const getDataKeys = () => {
    if (config.compareWeeks) {
      if (config.dataSource === "appointments" && config.metric === "count") {
        return ["count", "completed", "prevCount", "prevCompleted"];
      }
      if (
        config.dataSource === "revenue" &&
        config.metric === "total_revenue"
      ) {
        return ["revenue", "prevRevenue"];
      }
    }
    // Standard mode (no comparison)
    if (config.dataSource === "appointments") {
      return ["count", "completed"];
    }
    return ["revenue"];
  };

  const handleSave = () => {
    // Week-over-week comparison: current week as bars, previous week as lines
    const seriesConfig = config.compareWeeks
      ? previewSeries && Object.keys(previewSeries).length
        ? previewSeries
        : config.dataSource === "appointments"
          ? {
              barSeries: ["count", "completed"],
              lineSeries: ["prevCount", "prevCompleted"],
            }
          : { barSeries: ["revenue"], lineSeries: ["prevRevenue"] }
      : config.dataSource === "appointments"
        ? { barSeries: ["count", "completed"], lineSeries: [] }
        : { barSeries: ["revenue"], lineSeries: [] };

    const chartConfig: ChartConfig = {
      id: editingChart?.id || `chart-${Date.now()}`,
      title: config.title,
      type: "linebar",
      dataKey: config.dataSource,
      dataKeys: previewDataKeys.length ? previewDataKeys : getDataKeys(),
      xAxisKey: "name",
      colors: getThemeChartColorTokens(),
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
        locationId: config.locationId?.trim() || undefined,
        compareWeeks: config.compareWeeks,
      },
    };

    onSave(chartConfig);
    onOpenChange(false);
  };

  return (
    <Modal
      label={t("Configure Line & Bar Chart")}
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

          {/* Comparison Option */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label
                  htmlFor="compare-periods"
                  className="text-primary text-base font-medium cursor-pointer"
                >
                  {t("Compare Periods")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("Compare current vs previous period")}
                </p>
              </div>
              <Switch
                id="compare-periods"
                checked={config.compareWeeks}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    compareWeeks: checked as boolean,
                  })
                }
              />
            </div>
          </div>
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
                  type="linebar"
                  dataKeys={
                    previewDataKeys.length ? previewDataKeys : getDataKeys()
                  }
                  xAxisKey="name"
                  colors={getThemeChartColorTokens()}
                  seriesConfig={previewSeries}
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
