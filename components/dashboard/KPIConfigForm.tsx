"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import {
  Calendar,
  Euro,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { formatPriceEUR } from "@/Global/Utils/commonFn";
import type { KPIConfig } from "./types";
import { useStaffOptions } from "./useStaffOptions";
import { useLocationOptions } from "./useLocationOptions";
import { Modal } from "../customUIComponents/Modal";
import { useTranslation } from "react-i18next";
import { useDashboardDate } from "@/context/DashboardDateContext";
import callApi from "@/app/Api/callApi";

interface KPIConfigFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: KPIConfig) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockPerformanceData: any;
}

const kpiOptions = [
  {
    id: "totalAppointments",
    label: "Total Appointments",
    icon: Calendar,
  },
  {
    id: "totalRevenue",
    label: "Total Revenue",
    icon: Euro,
  },
  {
    id: "completedAppointments",
    label: "Completed Appointments",
    icon: CheckCircle,
  },
  {
    id: "cancelledAppointments",
    label: "Cancelled/No-Show",
    icon: XCircle,
  },
  {
    id: "averageServicePrice",
    label: "Average Service Price",
    icon: TrendingUp,
  },
  {
    id: "clientRetentionRate",
    label: "Client Retention Rate",
    icon: Users,
  },
  {
    id: "newClientsAcquired",
    label: "New Clients Acquired",
    icon: UserPlus,
  },
];

export function KPIConfigForm({
  open,
  onOpenChange,
  onSave,
  mockPerformanceData,
}: KPIConfigFormProps) {
  const { t } = useTranslation();
  const { startDate, endDate, groupBy } = useDashboardDate();
  const [selectedKPI, setSelectedKPI] = useState<string>("totalAppointments");
  const [staffId, setStaffId] = useState<string>("");
  const [locationIdFilter, setLocationIdFilter] = useState<string>("");
  const { staffOptions, loadingStaff } = useStaffOptions();
  const { locationOptions, loadingLocations } = useLocationOptions();
  const [previewValue, setPreviewValue] = useState<string | number>(
    "Loading..."
  );
  const [previewChange, setPreviewChange] = useState<
    { value: number; type: "increase" | "decrease" | "neutral" } | undefined
  >();
  const [loadingPreview, setLoadingPreview] = useState(false);

  const formatKpiValue = (kpiType: string, raw: number) => {
    if (kpiType === "totalRevenue") return formatPriceEUR(raw);
    if (kpiType === "averageServicePrice") return formatPriceEUR(raw);
    if (kpiType === "clientRetentionRate") return `${raw.toFixed(1)}%`;
    return raw;
  };

  const calculatePercentageChange = (
    current: number,
    previous: number
  ): { value: number; type: "increase" | "decrease" | "neutral" } => {
    if (previous === 0) {
      return {
        value: current > 0 ? 100 : 0,
        type: current > 0 ? "increase" : "neutral",
      };
    }
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      type: change > 0.1 ? "increase" : change < -0.1 ? "decrease" : "neutral",
    };
  };

  useEffect(() => {
    let isCancelled = false;
    const fetchKpiPreview = async () => {
      setLoadingPreview(true);
      try {
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const durationMs = endDateObj.getTime() - startDateObj.getTime();

        const prevEndDate = new Date(startDateObj);
        prevEndDate.setDate(prevEndDate.getDate() - 1);
        const prevStartDate = new Date(prevEndDate);
        prevStartDate.setTime(prevStartDate.getTime() - durationMs);

        const prevStartStr = prevStartDate.toISOString().split("T")[0];
        const prevEndStr = prevEndDate.toISOString().split("T")[0];

        if (
          selectedKPI === "totalAppointments" ||
          selectedKPI === "completedAppointments" ||
          selectedKPI === "cancelledAppointments"
        ) {
          const currentParams = new URLSearchParams({
            source: "appointments",
            dimension: "time_series",
            groupBy: groupBy,
            period: "custom",
            from: startDate,
            to: endDate,
          });
          if (staffId) currentParams.set("staffId", staffId);
          if (locationIdFilter) currentParams.set("locationId", locationIdFilter);
          const currentUrl = `/api/analytics?${currentParams.toString()}&t=${Date.now()}`;
          const currentRows = (await callApi(currentUrl, "GET")) as Array<
            Record<string, unknown>
          >;
          const currentTotals = currentRows.reduce(
            (
              acc: { total: number; completed: number; cancelled: number },
              cur
            ) => {
              acc.total += Number(cur.total ?? 0);
              acc.completed += Number(cur.completed ?? 0);
              acc.cancelled += Number(cur.cancelled ?? 0);
              return acc;
            },
            { total: 0, completed: 0, cancelled: 0 }
          );

          const prevParams = new URLSearchParams({
            source: "appointments",
            dimension: "time_series",
            groupBy: groupBy,
            period: "custom",
            from: prevStartStr,
            to: prevEndStr,
          });
          if (staffId) prevParams.set("staffId", staffId);
          if (locationIdFilter) prevParams.set("locationId", locationIdFilter);
          const prevUrl = `/api/analytics?${prevParams.toString()}&t=${Date.now()}`;
          const prevRows = (await callApi(prevUrl, "GET")) as Array<
            Record<string, unknown>
          >;
          const prevTotals = prevRows.reduce(
            (
              acc: { total: number; completed: number; cancelled: number },
              cur
            ) => {
              acc.total += Number(cur.total ?? 0);
              acc.completed += Number(cur.completed ?? 0);
              acc.cancelled += Number(cur.cancelled ?? 0);
              return acc;
            },
            { total: 0, completed: 0, cancelled: 0 }
          );

          let currentValue = 0;
          let previousValue = 0;

          if (selectedKPI === "totalAppointments") {
            currentValue = currentTotals.total;
            previousValue = prevTotals.total;
          } else if (selectedKPI === "completedAppointments") {
            currentValue = currentTotals.completed;
            previousValue = prevTotals.completed;
          } else {
            currentValue = currentTotals.cancelled;
            previousValue = prevTotals.cancelled;
          }

          if (!isCancelled) {
            const change = calculatePercentageChange(
              currentValue,
              previousValue
            );
            setPreviewValue(formatKpiValue(selectedKPI, currentValue));
            setPreviewChange(change);
          }
        } else if (selectedKPI === "totalRevenue") {
          const currentParams = new URLSearchParams({
            source: "revenue",
            dimension: "time_series",
            groupBy: groupBy,
            period: "custom",
            from: startDate,
            to: endDate,
          });
          if (staffId) currentParams.set("staffId", staffId);
          if (locationIdFilter) currentParams.set("locationId", locationIdFilter);
          const currentUrl = `/api/analytics?${currentParams.toString()}&t=${Date.now()}`;
          const currentRows = (await callApi(currentUrl, "GET")) as Array<
            Record<string, unknown>
          >;
          const currentRevenue = currentRows.reduce(
            (sum, cur) => sum + Number(cur.revenue ?? cur.value ?? 0),
            0
          );

          const prevParams = new URLSearchParams({
            source: "revenue",
            dimension: "time_series",
            groupBy: groupBy,
            period: "custom",
            from: prevStartStr,
            to: prevEndStr,
          });
          if (staffId) prevParams.set("staffId", staffId);
          if (locationIdFilter) prevParams.set("locationId", locationIdFilter);
          const prevUrl = `/api/analytics?${prevParams.toString()}&t=${Date.now()}`;
          const prevRows = (await callApi(prevUrl, "GET")) as Array<
            Record<string, unknown>
          >;
          const prevRevenue = prevRows.reduce(
            (sum, cur) => sum + Number(cur.revenue ?? cur.value ?? 0),
            0
          );

          if (!isCancelled) {
            const change = calculatePercentageChange(
              currentRevenue,
              prevRevenue
            );
            setPreviewValue(formatKpiValue(selectedKPI, currentRevenue));
            setPreviewChange(change);
          }
        } else if (selectedKPI === "averageServicePrice") {
          const params = new URLSearchParams({
            source: "services",
            dimension: "metrics",
          });
          const url = `/api/analytics?${params.toString()}&t=${Date.now()}`;
          if (locationIdFilter) params.set("locationId", locationIdFilter);
          const rows = await callApi(url, "GET");
          const list = rows as Array<Record<string, unknown>>;
          if (!isCancelled) {
            if (!list.length) {
              setPreviewValue("N/A");
              setPreviewChange(undefined);
            } else {
              const total = list.reduce(
                (sum, r) => sum + Number(r.price ?? 0),
                0
              );
              const avgPrice = total / list.length;
              setPreviewValue(formatKpiValue(selectedKPI, avgPrice));
              setPreviewChange(undefined);
            }
          }
        } else {
          if (!isCancelled) {
            setPreviewValue("N/A");
            setPreviewChange(undefined);
          }
        }
      } catch (err) {
        console.error("Failed to load KPI preview", err);
        if (!isCancelled) {
          setPreviewValue("Error");
          setPreviewChange(undefined);
        }
      } finally {
        if (!isCancelled) setLoadingPreview(false);
      }
    };
    fetchKpiPreview();
    return () => {
      isCancelled = true;
    };
  }, [selectedKPI, staffId, locationIdFilter, startDate, endDate, groupBy]);

  const handleSave = () => {
    const kpiOption = kpiOptions.find((opt) => opt.id === selectedKPI);
    if (!kpiOption) return;

    const config: KPIConfig = {
      id: `kpi-${Date.now()}`,
      type: "kpi",
      kpiType: selectedKPI as KPIConfig["kpiType"],
      title: kpiOption.label,
      value: previewValue,
      change: previewChange,
      configuration: {
        ...(staffId ? { staffId } : {}),
        ...(locationIdFilter ? { locationId: locationIdFilter } : {}),
      },
      layout: {
        x: 0,
        y: 0,
        w: 3,
        h: 2,
      },
    };

    onSave(config);
    onOpenChange(false);
  };

  return (
    <Modal
      label={t("Add KPI Card")}
      open={open}
      onOpenChange={onOpenChange}
      width="3xl"
    >
      <div className="grid grid-cols-1 gap-6 p-2 lg:grid-cols-[30%_70%]">
        {/* Configuration Panel */}
        <div className="space-y-4">
          <LabeledSelect<string>
            id="kpi-select"
            label={t("Select KPI")}
            placeholder={t("Select KPI")}
            value={selectedKPI}
            onValueChange={setSelectedKPI}
            options={kpiOptions.map((option) => ({
              id: option.id,
              name: option.label,
            }))}
          />

          <LabeledSelect<string>
            id="staff-id"
            label={t("Staff (optional)")}
            placeholder={loadingStaff ? "Loading..." : "All staff"}
            value={staffId || "all"}
            onValueChange={(value) => setStaffId(value === "all" ? "" : value)}
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
            label={t("Location (optional)")}
            placeholder={loadingLocations ? "Loading..." : "All locations"}
            value={locationIdFilter || "all"}
            onValueChange={(value) =>
              setLocationIdFilter(value === "all" ? "" : value)
            }
            options={[
              { id: "all", name: "All locations" },
              ...locationOptions.map((l) => ({
                id: l._id as string,
                name: l.name,
              })),
            ]}
          />
        </div>

        {/* Preview Panel */}
        <div className="space-y-2">
          <Label className="text-primary">{t("Preview")}</Label>
          <div className="rounded-lg border border-primary/20 bg-white dark:bg-gray-900 p-6 flex flex-col items-center justify-center h-48">
            <div className="text-5xl font-bold text-primary break-words text-center">
              {loadingPreview
                ? t("Loading...")
                : previewValue || t("Select a KPI")}
            </div>
            <div className="text-sm mt-2 text-slate-400 text-center line-clamp-2">
              {kpiOptions.find((opt) => opt.id === selectedKPI)?.label || ""}
            </div>
            {previewChange && (
              <div
                className={`text-sm mt-2 font-semibold ${
                  previewChange.type === "increase"
                    ? "text-green-400"
                    : previewChange.type === "decrease"
                    ? "text-red-400"
                    : "text-slate-400"
                }`}
              >
                {previewChange.type === "increase"
                  ? "↑"
                  : previewChange.type === "decrease"
                  ? "↓"
                  : "→"}{" "}
                {previewChange.value}%
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
        <Button onClick={handleSave} iconType="save">
          {t("Add KPI")}
        </Button>
      </div>
    </Modal>
  );
}
