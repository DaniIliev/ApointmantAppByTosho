"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Euro,
  GripHorizontal,
  Trash2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import GridLayout, { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useTranslation } from "react-i18next";

// Dynamic import to avoid SSR issues
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// Mock data for the preview
const mockChartData = {
  appointments: [
    { name: "Mon", total: 12, completed: 10 },
    { name: "Tue", total: 15, completed: 14 },
    { name: "Wed", total: 18, completed: 16 },
    { name: "Thu", total: 14, completed: 12 },
    { name: "Fri", total: 22, completed: 20 },
    { name: "Sat", total: 25, completed: 23 },
    { name: "Sun", total: 8, completed: 7 },
  ],
  revenue: [
    { name: "Week 1", value: 2500 },
    { name: "Week 2", value: 3200 },
    { name: "Week 3", value: 2800 },
    { name: "Week 4", value: 3800 },
  ],
  services: [
    { name: "Haircut", value: 45 },
    { name: "Coloring", value: 28 },
    { name: "Styling", value: 18 },
    { name: "Treatment", value: 12 },
  ],
};

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  changeType: "increase" | "decrease";
  icon: React.ReactNode;
  className?: string;
}

function KPICard({
  title,
  value,
  change,
  changeType,
  icon,
  className,
}: KPICardProps) {
  return (
    <Card
      className={`border-primary/20 bg-gradient-to-br from-card/80 to-card shadow-sm hover:shadow-md transition-all ${
        className ?? ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-text-primary font-medium">{title}</p>
            <p className="text-2xl font-bold text-primary">{value}</p>
            <div className="flex items-center gap-1">
              {changeType === "increase" ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span
                className={`text-xs font-medium ${
                  changeType === "increase" ? "text-green-500" : "text-red-500"
                }`}
              >
                {change}%
              </span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-primary/10">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsPreview() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const fixedHeight = 660;
  const maxWidth = 960;
  const [layout, setLayout] = useState<Layout[]>([
    { i: "kpi1", x: 0, y: 0, w: 6, h: 2, minW: 4, minH: 2, maxW: 12, maxH: 4 },
    { i: "kpi2", x: 6, y: 0, w: 6, h: 2, minW: 4, minH: 2, maxW: 12, maxH: 4 },
    {
      i: "services",
      x: 0,
      y: 2,
      w: 12,
      h: 6,
      minW: 6,
      minH: 4,
      maxW: 12,
      maxH: 8,
    },
    {
      i: "revenue",
      x: 0,
      y: 8,
      w: 6,
      h: 5,
      minW: 4,
      minH: 3,
      maxW: 8,
      maxH: 7,
    },
    {
      i: "appointments",
      x: 6,
      y: 8,
      w: 6,
      h: 5,
      minW: 4,
      minH: 3,
      maxW: 8,
      maxH: 7,
    },
  ]);
  const [visibleIds, setVisibleIds] = useState<string[]>([
    "kpi1",
    "kpi2",
    "appointments",
    "revenue",
    "services",
  ]);
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const measured = containerRef.current.offsetWidth;
        setContainerWidth(Math.min(measured, maxWidth));
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    // Clamp items within bounds
    const maxY = Math.floor(fixedHeight / 40) - 1;
    const clampedLayout = newLayout.map((item) => ({
      ...item,
      x: Math.max(0, Math.min(item.x, 12 - item.w)),
      y: Math.max(0, Math.min(item.y, maxY - item.h)),
    }));
    setLayout(clampedLayout);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setLayout((prev) => prev.filter((item) => item.i !== id));
    setVisibleIds((prev) => prev.filter((itemId) => itemId !== id));
  }, []);

  // Translated mock data
  const translatedAppointments = useMemo(
    () =>
      mockChartData.appointments.map((item) => ({
        ...item,
        name: t(item.name),
      })),
    [t]
  );

  const translatedRevenue = useMemo(
    () =>
      mockChartData.revenue.map((item) => ({
        ...item,
        name: t(item.name),
      })),
    [t]
  );

  const translatedServices = useMemo(
    () =>
      mockChartData.services.map((item) => ({
        ...item,
        name: t(item.name),
      })),
    [t]
  );

  // Line chart for appointments
  const appointmentsOption = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(30, 30, 60, 0.9)",
        borderColor: "rgba(255,255,255,0.2)",
        borderWidth: 1,
        textStyle: { color: "#fff" },
      },
      grid: {
        left: "8%",
        right: "8%",
        bottom: "15%",
        top: "15%",
      },
      xAxis: {
        type: "category",
        data: translatedAppointments.map((item) => item.name),
        axisLine: { lineStyle: { color: "#ddd" } },
        axisLabel: { color: "#666", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        axisLine: { lineStyle: { color: "#ddd" } },
        axisLabel: { color: "#666", fontSize: 10 },
        splitLine: { lineStyle: { color: "#f0f0f0", type: "dashed" } },
      },
      series: [
        {
          name: "Total",
          type: "line",
          data: mockChartData.appointments.map((item) => item.total),
          smooth: true,
          lineStyle: { width: 2, color: "#3b61c0" },
          itemStyle: { color: "#3b61c0" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(59, 97, 192, 0.3)" },
                { offset: 1, color: "rgba(59, 97, 192, 0.05)" },
              ],
            },
          },
        },
        {
          name: "Completed",
          type: "line",
          data: mockChartData.appointments.map((item) => item.completed),
          smooth: true,
          lineStyle: { width: 2, color: "#3CBE28" },
          itemStyle: { color: "#3CBE28" },
        },
      ],
    }),
    [translatedAppointments]
  );

  // Bar chart for revenue
  const revenueOption = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(30, 30, 60, 0.9)",
        borderColor: "rgba(255,255,255,0.2)",
        borderWidth: 1,
        textStyle: { color: "#fff" },
        formatter: (
          params: { name: string; marker: string; value: number }[]
        ) => {
          const data = params[0];
          return `${data.name}<br/>${data.marker}€${data.value}`;
        },
      },
      grid: {
        left: "8%",
        right: "8%",
        bottom: "15%",
        top: "10%",
      },
      xAxis: {
        type: "category",
        data: translatedRevenue.map((item) => item.name),
        axisLine: { lineStyle: { color: "#ddd" } },
        axisLabel: { color: "#666", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        axisLine: { lineStyle: { color: "#ddd" } },
        axisLabel: {
          color: "#666",
          fontSize: 10,
          formatter: (value: number) => `€${value / 1000}k`,
        },
        splitLine: { lineStyle: { color: "#f0f0f0", type: "dashed" } },
      },
      series: [
        {
          type: "bar",
          data: mockChartData.revenue.map((item) => item.value),
          itemStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#3b61c0" },
                { offset: 1, color: "#5a7fd8" },
              ],
            },
            borderRadius: [4, 4, 0, 0],
          },
          barWidth: "40%",
        },
      ],
    }),
    [translatedRevenue]
  );

  // Pie chart for services
  const servicesOption = useMemo(
    () => ({
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(30, 30, 60, 0.9)",
        borderColor: "rgba(255,255,255,0.2)",
        borderWidth: 1,
        textStyle: { color: "#fff" },
        formatter: "{b}: {c} ({d}%)",
      },
      legend: {
        bottom: "5%",
        left: "center",
        textStyle: { color: "#666", fontSize: 10 },
      },
      series: [
        {
          type: "pie",
          radius: ["40%", "65%"],
          center: ["50%", "45%"],
          data: translatedServices,
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: true,
            fontSize: 10,
            formatter: "{d}%",
          },
          emphasis: {
            label: { show: true, fontSize: 12, fontWeight: "bold" },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.3)",
            },
          },
          color: ["#3b61c0", "#00bfff", "#f59e0b", "#dc2626"],
        },
      ],
    }),
    [translatedServices]
  );

  return (
    <div
      className="relative"
      ref={containerRef}
      style={{ maxWidth, margin: "0 auto" }}
    >
      {/* Info badge */}
      <div className="absolute -top-10 right-0 text-xs text-primary/70 flex items-center gap-1.5 z-10 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
        <GripHorizontal className="h-3 w-3" />
        <span className="font-medium">Drag & resize to customize</span>
      </div>

      <div style={{ height: fixedHeight, overflow: "hidden" }}>
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={40}
          margin={[8, 8]}
          containerPadding={[0, 0]}
          width={containerWidth}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
          isDraggable={true}
          isResizable={true}
          compactType="vertical"
          preventCollision={false}
        >
          {/* KPI Card 1 */}
          {visibleIds.includes("kpi1") && (
            <div key="kpi1" className="cursor-grab active:cursor-grabbing">
              <div className="relative h-full group">
                <div className="absolute top-2 left-0 right-0 flex items-center justify-center pointer-events-none">
                  <div className="drag-handle pointer-events-auto rounded-full bg-white/5 px-3 py-1 shadow-sm border border-white/10 flex items-center gap-1 text-xs text-muted-foreground">
                    <GripHorizontal className="h-4 w-4" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove("kpi1")}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:border-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <KPICard
                  title={t("Total Bookings")}
                  value="284"
                  change={12.5}
                  changeType="increase"
                  icon={<Calendar className="h-5 w-5 text-primary" />}
                  className="h-full overflow-hidden"
                />
              </div>
            </div>
          )}

          {/* KPI Card 2 */}
          {visibleIds.includes("kpi2") && (
            <div key="kpi2" className="cursor-grab active:cursor-grabbing">
              <div className="relative h-full group">
                <div className="absolute top-2 left-0 right-0 flex items-center justify-center pointer-events-none">
                  <div className="drag-handle pointer-events-auto rounded-full bg-white/5 px-3 py-1 shadow-sm border border-white/10 flex items-center gap-1 text-xs text-muted-foreground">
                    <GripHorizontal className="h-4 w-4" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove("kpi2")}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:border-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <KPICard
                  title={t("Total Revenue")}
                  value="€12.3k"
                  change={8.3}
                  changeType="increase"
                  icon={<Euro className="h-5 w-5 text-primary" />}
                  className="h-full overflow-hidden"
                />
              </div>
            </div>
          )}

          {/* Appointments Chart */}
          {visibleIds.includes("appointments") && (
            <div
              key="appointments"
              className="cursor-grab active:cursor-grabbing"
            >
              <Card className="border-primary/20 shadow-sm h-full transition-all flex flex-col overflow-hidden">
                <CardHeader className="pb-2 relative group">
                  <div className="absolute top-2 left-0 right-0 flex items-center justify-center pointer-events-none">
                    <div className="drag-handle pointer-events-auto rounded-full bg-white/5 px-3 py-1 shadow-sm border border-white/10 flex items-center gap-1 text-xs text-muted-foreground">
                      <GripHorizontal className="h-4 w-4" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove("appointments")}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:border-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <CardTitle className="text-sm font-semibold text-text-primary">
                    {t("Appointments This Week")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 flex-1 overflow-hidden">
                  <ReactECharts
                    option={appointmentsOption}
                    style={{
                      height: "100%",
                      width: "100%",
                      minHeight: "240px",
                    }}
                    opts={{ renderer: "svg" }}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Revenue Chart */}
          {visibleIds.includes("revenue") && (
            <div key="revenue" className="cursor-grab active:cursor-grabbing">
              <Card className="border-primary/20 shadow-sm h-full transition-all flex flex-col overflow-hidden">
                <CardHeader className="pb-2 relative group">
                  <div className="absolute top-2 left-0 right-0 flex items-center justify-center pointer-events-none">
                    <div className="drag-handle pointer-events-auto rounded-full bg-white/5 px-3 py-1 shadow-sm border border-white/10 flex items-center gap-1 text-xs text-muted-foreground">
                      <GripHorizontal className="h-4 w-4" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove("revenue")}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:border-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <CardTitle className="text-sm font-semibold text-text-primary">
                    {t("Weekly Revenue")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 flex-1 overflow-hidden">
                  <ReactECharts
                    option={revenueOption}
                    style={{
                      height: "100%",
                      width: "100%",
                      minHeight: "180px",
                    }}
                    opts={{ renderer: "svg" }}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Services Pie Chart */}
          {visibleIds.includes("services") && (
            <div key="services" className="cursor-grab active:cursor-grabbing">
              <Card className="border-primary/20 shadow-sm h-full transition-all flex flex-col overflow-hidden">
                <CardHeader className="pb-2 relative group">
                  <div className="absolute top-2 left-0 right-0 flex items-center justify-center pointer-events-none">
                    <div className="drag-handle pointer-events-auto rounded-full bg-white/5 px-3 py-1 shadow-sm border border-white/10 flex items-center gap-1 text-xs text-muted-foreground">
                      <GripHorizontal className="h-4 w-4" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove("services")}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:border-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <CardTitle className="text-sm font-semibold text-text-primary">
                    {t("Popular Services")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 flex-1 overflow-hidden">
                  <ReactECharts
                    option={servicesOption}
                    style={{
                      height: "100%",
                      width: "100%",
                      minHeight: "180px",
                    }}
                    opts={{ renderer: "svg" }}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </GridLayout>
      </div>

      <style jsx global>{`
        .layout {
          position: relative;
        }

        .react-grid-item {
          transition: all 200ms ease;
          transition-property: left, top, width, height;
        }

        .react-grid-item.cssTransforms {
          transition-property: transform, width, height;
        }

        .react-grid-item.resizing {
          transition: none;
          z-index: 100;
          will-change: width, height;

          .react-grid-item.resizing .border-primary\\/20 {
            box-shadow: 0 10px 25px -5px rgba(59, 97, 192, 0.3),
              0 8px 10px -6px rgba(59, 97, 192, 0.15);
          }
        }

        .react-grid-item.react-draggable-dragging {
          transition: none;
          z-index: 100;
          will-change: transform;
          cursor: grabbing !important;
          opacity: 0.8;

          .react-grid-item.react-draggable-dragging .border-primary\\/20 {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15),
              0 8px 10px -6px rgba(0, 0, 0, 0.1);
            transform: rotate(2deg);
          }
        }

        .react-grid-item.dropping {
          visibility: hidden;
        }

        .react-grid-item.react-grid-placeholder {
          background: hsl(var(--primary) / 0.15);
          opacity: 0.3;
          transition-duration: 100ms;
          z-index: 2;
          border-radius: 8px;
          border: 2px dashed hsl(var(--primary) / 0.5);
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

          @keyframes pulse {
            0%,
            100% {
              opacity: 0.3;
            }
            50% {
              opacity: 0.5;
            }
          }
        }

        .react-resizable-handle {
          position: absolute;
          width: 24px;
          height: 24px;
          opacity: 0.6;
          transition: opacity 0.2s ease;
        }

        .react-grid-item:hover .react-resizable-handle {
          opacity: 1;
        }

        .react-resizable-handle-se {
          bottom: 0;
          right: 0;
          cursor: se-resize;
        }

        .react-resizable-handle-se::after {
          content: "";
          position: absolute;
          right: 4px;
          bottom: 4px;
          width: 10px;
          height: 10px;
          border-right: 2px solid hsl(var(--muted-foreground) / 0.6);
          border-bottom: 2px solid hsl(var(--muted-foreground) / 0.6);
          transition: all 0.2s ease;
        }

        .react-resizable-handle-se::before {
          content: "";
          position: absolute;
          right: 8px;
          bottom: 8px;
          width: 6px;
          height: 6px;
          border-right: 2px solid hsl(var(--muted-foreground) / 0.4);
          border-bottom: 2px solid hsl(var(--muted-foreground) / 0.4);
          transition: all 0.2s ease;
        }

        .react-resizable-handle-se:hover::after {
          border-right-color: hsl(var(--primary));
          border-bottom-color: hsl(var(--primary));
          width: 12px;
          height: 12px;
        }

        .react-resizable-handle-se:hover::before {
          border-right-color: hsl(var(--primary) / 0.6);
          border-bottom-color: hsl(var(--primary) / 0.6);
        }
      `}</style>
    </div>
  );
}
