"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { KPICard } from "@/components/performance/KPICard";
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
  Download,
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

// Mock data - replace with real data from your backend
const mockKPIData = {
  totalAppointments: 156,
  totalRevenue: 12450,
  completedAppointments: 142,
  cancelledAppointments: 14,
  averageServicePrice: 79.81,
  clientRetentionRate: 68.5,
  newClientsAcquired: 23,
};

const mockAppointmentsOverTime = [
  { name: "Mon", total: 22, completed: 20, cancelled: 2 },
  { name: "Tue", total: 18, completed: 16, cancelled: 2 },
  { name: "Wed", total: 25, completed: 23, cancelled: 2 },
  { name: "Thu", total: 28, completed: 26, cancelled: 2 },
  { name: "Fri", total: 32, completed: 30, cancelled: 2 },
  { name: "Sat", total: 20, completed: 18, cancelled: 2 },
  { name: "Sun", total: 11, completed: 9, cancelled: 2 },
];

const mockRevenueOverTime = [
  { name: "Week 1", value: 2800 },
  { name: "Week 2", value: 3200 },
  { name: "Week 3", value: 2950 },
  { name: "Week 4", value: 3500 },
];

const mockServicePopularity = [
  { name: "Haircut & Style", value: 45 },
  { name: "Hair Color", value: 32 },
  { name: "Facial Treatment", value: 28 },
  { name: "Manicure", value: 25 },
  { name: "Massage", value: 18 },
];

const mockClientTypes = [
  { name: "Returning Clients", value: 68 },
  { name: "New Clients", value: 32 },
];

const mockAppointmentStatus = [
  { name: "Completed", value: 142 },
  { name: "Cancelled", value: 14 },
];

const mockRevenueByService = [
  { name: "Hair Services", value: 6800 },
  { name: "Facial Treatments", value: 2400 },
  { name: "Nail Services", value: 1850 },
  { name: "Massage Therapy", value: 1400 },
];

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

export default function PerformancePage() {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState("last30days");
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  const { setPageTitle } = usePageTitle();
  const { setExtraRightNavMenu, setIsRightNavVisible } = useRightNav();

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

  return (
    <div className="min-h-screen">
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <p className="text-xl text-muted-foreground font-medium">
            {t("Monitor your salon's key performance indicators and trends")}
          </p>
        </div>

        {/* Time Filter */}
        <TimeFilter
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          customDateRange={customDateRange}
          onCustomDateChange={setCustomDateRange}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title={t("Total Appointments")}
            value={mockKPIData.totalAppointments}
            change={{ value: 12.5, type: "increase" }}
            icon={<Calendar />}
          />
          <KPICard
            title={t("Total Revenue")}
            value={`$${mockKPIData.totalRevenue.toLocaleString()}`}
            change={{ value: 8.3, type: "increase" }}
            icon={<DollarSign />}
          />
          <KPICard
            title={t("Completed Appointments")}
            value={mockKPIData.completedAppointments}
            change={{ value: 5.2, type: "increase" }}
            icon={<CheckCircle />}
          />
          <KPICard
            title={t("Cancelled/No-Show")}
            value={mockKPIData.cancelledAppointments}
            change={{ value: 2.1, type: "decrease" }}
            icon={<XCircle />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <KPICard
            title={t("Average Service Price")}
            value={`$${mockKPIData.averageServicePrice}`}
            change={{ value: 3.7, type: "increase" }}
            icon={<TrendingUp />}
          />
          <KPICard
            title={t("Client Retention Rate")}
            value={`${mockKPIData.clientRetentionRate}%`}
            change={{ value: 1.8, type: "increase" }}
            icon={<Users />}
          />
          <KPICard
            title={t("New Clients Acquired")}
            value={mockKPIData.newClientsAcquired}
            change={{ value: 15.2, type: "increase" }}
            icon={<UserPlus />}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceChart
            title={t("Appointments Over Time")}
            data={mockAppointmentsOverTime}
            type="bar"
            dataKey="total"
            xAxisKey="name"
          />
          <PerformanceChart
            title={t("Revenue Over Time")}
            data={mockRevenueOverTime}
            type="line"
            dataKey="value"
            xAxisKey="name"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceChart
            title={t("Service Popularity")}
            data={mockServicePopularity}
            type="bar"
            dataKey="value"
            xAxisKey="name"
          />
          <PerformanceChart
            title={t("Client Types Distribution")}
            data={mockClientTypes}
            type="pie"
            dataKey="value"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceChart
            title={t("Appointment Status Distribution")}
            data={mockAppointmentStatus}
            type="pie"
            dataKey="value"
          />
          <PerformanceChart
            title={t("Revenue by Service Category")}
            data={mockRevenueByService}
            type="bar"
            dataKey="value"
            xAxisKey="name"
          />
        </div>
      </div>
    </div>
  );
}
