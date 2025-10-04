"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TimeFilter } from "@/components/performance/TimeFilter";
import { PerformanceChart } from "@/components/performance/PerformanceChart";
import { ExportButton } from "@/components/performance/ExportButton";
import {
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  UserPlus,
  ListFilterPlus,
  Info,
} from "lucide-react";
import { usePageTitle } from "@/context/PageTitleContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRightNav } from "@/context/RightNavContext";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import callApi from "../Api/callApi";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type React from "react";
import { KPICard } from "@/components/performance/KPICard";

// ************************************************************
// 1. АКТУАЛИЗИРАН ИНТЕРФЕЙС
// ************************************************************

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface ChangeMetric {
  value: number;
  type: "increase" | "decrease" | "neutral";
}

interface KPICardChanges {
  totalAppointments: ChangeMetric;
  totalRevenue: ChangeMetric;
  completedAppointments: ChangeMetric;
  cancelledAppointments: ChangeMetric;
  averageServicePrice: ChangeMetric;
  newClientsAcquired: ChangeMetric;
}

interface PerformanceData {
  kpiData: {
    totalAppointments: number;
    totalRevenue: number;
    completedAppointments: number;
    cancelledAppointments: number;
    averageServicePrice: number;
    clientRetentionRate: number;
    newClientsAcquired: number;
    changes: KPICardChanges; // НОВАТА СТРУКТУРА
  };
  appointmentsOverTime: any[];
  revenueOverTime: any[];
  servicePopularity: any[];
  clientTypes: any[];
  appointmentStatus: any[];
  revenueByService: any[];
}

const mockPerformanceData: PerformanceData = {
  kpiData: {
    // Текущи Стойности
    totalAppointments: 450,
    totalRevenue: 28750.55,
    completedAppointments: 380,
    cancelledAppointments: 70,
    averageServicePrice: 75.66,
    clientRetentionRate: 78.5,
    newClientsAcquired: 35,

    // Динамични Промени (Changes)
    changes: {
      // 🟢 Увеличение
      totalAppointments: { value: 15.2, type: "increase" },
      // 🟢 Увеличение
      totalRevenue: { value: 8.7, type: "increase" },
      // 🟡 Неутрална промяна (стойност 0)
      completedAppointments: { value: 0, type: "neutral" },
      // 🔴 Намаление (показва се като увеличение на %cancelled)
      cancelledAppointments: { value: 25.0, type: "increase" },
      // 🔴 Намаление (цената е паднала)
      averageServicePrice: { value: 4.1, type: "decrease" },
      // 🟢 Голямо увеличение
      newClientsAcquired: { value: 150.0, type: "increase" },
    },
  },

  // Данни за Графики (Опростени Mock Data)
  appointmentsOverTime: [
    { name: "Mon", total: 65, completed: 50, cancelled: 15 },
    { name: "Tue", total: 72, completed: 68, cancelled: 4 },
    { name: "Wed", total: 80, completed: 75, cancelled: 5 },
    { name: "Thu", total: 55, completed: 45, cancelled: 10 },
    { name: "Fri", total: 90, completed: 85, cancelled: 5 },
    { name: "Sat", total: 88, completed: 80, cancelled: 8 },
  ],
  revenueOverTime: [
    { name: "Jan", value: 5000 },
    { name: "Feb", value: 6500 },
    { name: "Mar", value: 7200 },
    { name: "Apr", value: 8500 },
    { name: "May", value: 9100 },
  ],
  servicePopularity: [
    { name: "Haircut", value: 150 },
    { name: "Coloring", value: 90 },
    { name: "Massage", value: 70 },
    { name: "Facial", value: 50 },
    { name: "Manicure", value: 45 },
  ],
  clientTypes: [
    { name: "Returning Clients", value: 300 },
    { name: "New Clients", value: 100 },
  ],
  appointmentStatus: [
    { name: "Completed", value: 380 },
    { name: "Cancelled", value: 70 },
  ],
  revenueByService: [
    { name: "Haircut", value: 9500 },
    { name: "Coloring", value: 12000 },
    { name: "Massage", value: 4000 },
    { name: "Facial", value: 3250 },
  ],
};
// Начално състояние с дефолтни промени (neutral/0)
const initialPerformanceData: PerformanceData = {
  kpiData: {
    totalAppointments: 0,
    totalRevenue: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    averageServicePrice: 0,
    clientRetentionRate: 0,
    newClientsAcquired: 0,
    changes: {
      // Инициализираме changes с 0
      totalAppointments: { value: 0, type: "neutral" },
      totalRevenue: { value: 0, type: "neutral" },
      completedAppointments: { value: 0, type: "neutral" },
      cancelledAppointments: { value: 0, type: "neutral" },
      averageServicePrice: { value: 0, type: "neutral" },
      newClientsAcquired: { value: 0, type: "neutral" },
    },
  },
  appointmentsOverTime: [],
  revenueOverTime: [],
  servicePopularity: [],
  clientTypes: [],
  appointmentStatus: [],
  revenueByService: [],
};

// ************************************************************
// Компонент Placeholder за графики без данни
// ************************************************************

const NoDataPlaceholder = ({ t }: { t: any }) => (
  <div className="bg-card border border-border rounded-lg p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
    <Info className="h-8 w-8 text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold text-foreground">
      {t("No Performance Data Available")}
    </h3>
    <p className="text-sm text-muted-foreground mt-2 max-w-sm">
      {t(
        "There are no appointments in the selected period to generate performance charts. Try selecting a different time frame or ensure appointments have been created."
      )}
    </p>
  </div>
);

export default function PerformancePage() {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState("last30days");
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  const [performanceData, setPerformanceData] = useState<PerformanceData>(
    initialPerformanceData
  );
  const [isLoading, setIsLoading] = useState(true);

  // Проверка дали има данни за графиките
  const hasData =
    mockPerformanceData.kpiData.totalAppointments > 0 ||
    mockPerformanceData.kpiData.totalRevenue > 0;

  const { setPageTitle } = usePageTitle();
  const { setExtraRightNavMenu, setIsRightNavVisible } = useRightNav();

  // ** ФУНКЦИЯ ** - Зареждане на данните
  const fetchPerformanceData = async (
    period: string,
    customRange: typeof customDateRange
  ) => {
    setIsLoading(true);
    try {
      let url = `/api/performance?period=${period}`;

      if (period === "custom" && customRange.from && customRange.to) {
        url += `&from=${customRange.from.toISOString()}&to=${customRange.to.toISOString()}`;
      }

      const response = await callApi(url, "GET");
      const data = await response.json();

      // Деструктурираме и осигуряваме, че changes е винаги наличен, дори ако API-то го пропусне
      setPerformanceData({
        ...initialPerformanceData,
        ...data,
        kpiData: {
          ...initialPerformanceData.kpiData,
          ...data.kpiData,
          changes:
            data.kpiData?.changes || initialPerformanceData.kpiData.changes,
        },
      });
    } catch (error) {
      console.error("Failed to fetch performance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPerformanceData(mockPerformanceData); // Използваме mock data за демо
    setIsLoading(false);
  }, [selectedPeriod, customDateRange]);

  useEffect(() => {
    setPageTitle(t("Performance Tracking"));
    setExtraRightNavMenu(<PerformanceRightNav handleExport={handleExport} />);
    setIsRightNavVisible(true);
    return () => {
      setPageTitle(null);
      setExtraRightNavMenu(null);
      setIsRightNavVisible(false);
    };
  }, [setPageTitle, setExtraRightNavMenu, setIsRightNavVisible, t]);

  const handleExport = (format: "csv" | "pdf" | "png") => {
    console.log(t(`Exporting as ${format}`));
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    if (period !== "custom") {
      setCustomDateRange({ from: undefined, to: undefined });
    }
  };

  const handleCustomDateChange = (range: typeof customDateRange) => {
    setCustomDateRange(range);
    if (range.from && range.to) {
      fetchPerformanceData("custom", range);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 text-xl">
        {t("Loading performance data...")}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <TimeFilter
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          customDateRange={customDateRange}
          onCustomDateChange={handleCustomDateChange}
          onRemoveFilter={() => console.log("remove filter")}
        />

        {/* KPI Cards - използват реалните данни и промените от бекенда */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title={t("Total Appointments")}
            value={mockPerformanceData.kpiData.totalAppointments}
            change={mockPerformanceData.kpiData.changes.totalAppointments} // Динамична стойност
            icon={<Calendar />}
          />
          <KPICard
            title={t("Total Revenue")}
            value={`$${mockPerformanceData.kpiData.totalRevenue.toLocaleString()}`}
            change={mockPerformanceData.kpiData.changes.totalRevenue} // Динамична стойност
            icon={<DollarSign />}
          />
          <KPICard
            title={t("Completed Appointments")}
            value={mockPerformanceData.kpiData.completedAppointments}
            change={mockPerformanceData.kpiData.changes.completedAppointments}
            icon={<CheckCircle />}
          />
          <KPICard
            title={t("Cancelled/No-Show")}
            value={mockPerformanceData.kpiData.cancelledAppointments}
            change={mockPerformanceData.kpiData.changes.cancelledAppointments}
            icon={<XCircle />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <KPICard
            title={t("Average Service Price")}
            value={`$${mockPerformanceData.kpiData.averageServicePrice.toFixed(
              2
            )}`}
            change={mockPerformanceData.kpiData.changes.averageServicePrice}
            icon={<TrendingUp />}
          />
          <KPICard
            title={t("Client Retention Rate")}
            value={`${mockPerformanceData.kpiData.clientRetentionRate.toFixed(
              1
            )}%`}
            icon={<Users />}
          />
          <KPICard
            title={t("New Clients Acquired")}
            value={mockPerformanceData.kpiData.newClientsAcquired}
            change={mockPerformanceData.kpiData.changes.newClientsAcquired}
            icon={<UserPlus />}
          />
        </div>

        {hasData ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceChart
                title={t("Appointments Over Time")}
                data={mockPerformanceData.appointmentsOverTime}
                type="line" // Може да смените на "bar" или "line"
                dataKeys={["total", "completed", "cancelled"]} // 👈 ИЗПОЛЗВАМЕ МНОЖЕСТВО КЛЮЧОВЕ
                xAxisKey="name"
                // Custom цветове, за да се разграничат сериите
                colors={["#00bfff", "#22c55e", "#ef4444"]}
              />
              <PerformanceChart
                title={t("Revenue Over Time")}
                data={mockPerformanceData.revenueOverTime}
                type="line"
                dataKey="value" // Единичен ключ
                xAxisKey="name"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceChart
                title={t("Service Popularity")}
                data={mockPerformanceData.servicePopularity}
                type="bar"
                dataKey="value"
                xAxisKey="name"
              />
              <PerformanceChart
                title={t("Revenue by Service Category")}
                data={mockPerformanceData.revenueByService}
                type="bar"
                dataKey="value"
                xAxisKey="name"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceChart
                title={t("Appointment Status Distribution")}
                data={mockPerformanceData.appointmentStatus}
                type="pie"
                dataKey="value"
                colors={["#22c55e", "#ef4444"]} // Зелено за Completed, Червено за Cancelled
              />
              <PerformanceChart
                title={t("Client Types Distribution")}
                data={mockPerformanceData.clientTypes}
                type="pie"
                dataKey="value"
              />
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NoDataPlaceholder t={t} />
              <NoDataPlaceholder t={t} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NoDataPlaceholder t={t} />
              <NoDataPlaceholder t={t} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NoDataPlaceholder t={t} />
              <NoDataPlaceholder t={t} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type PerformanceRightNavProps = {
  handleExport: (format: "csv" | "pdf" | "png") => void;
};
const PerformanceRightNav = ({ handleExport }: PerformanceRightNavProps) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex flex-col items-center space-y-2">
        <CustomTooltip
          onClick={() => {}}
          tooltipText={t("Filter")}
          icon={<ListFilterPlus />}
        />
        <TooltipProvider>
          <div className="flex flex-col items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <ExportButton onExport={handleExport} />
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("Export")}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </>
  );
};
