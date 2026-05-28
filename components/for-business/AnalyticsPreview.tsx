"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Euro,
  GripHorizontal,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import GridLayout, { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useTranslation } from "react-i18next";
import { PerformanceChart } from "@/components/performance/PerformanceChart";
import { getThemeChartColorTokens } from "@/lib/themeColors";

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
  const [containerWidth, setContainerWidth] = useState(1200);
  const chartColors = useMemo(() => getThemeChartColorTokens(), []);
  const fixedHeight = 400;
  const isMobile = containerWidth <= 768;
  const maxHeight = isMobile ? 1600 : 800;
  const rowHeight = 44;
  // const maxWidth = 960;
  const wasMobile = useRef(false);
  const [layout, setLayout] = useState<Layout[]>([
    { i: "kpi1", x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2, maxW: 6, maxH: 4 },
    { i: "kpi2", x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2, maxW: 6, maxH: 4 },
    { i: "kpi3", x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2, maxW: 6, maxH: 4 },
    { i: "kpi4", x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2, maxW: 6, maxH: 4 },
    {
      i: "services",
      x: 0,
      y: 2,
      w: 4,
      h: 6,
      minW: 3,
      minH: 4,
      maxW: 12,
      maxH: 16,
    },
    {
      i: "revenue",
      x: 4,
      y: 2,
      w: 4,
      h: 6,
      minW: 3,
      minH: 4,
      maxW: 12,
      maxH: 20,
    },
    {
      i: "appointments",
      x: 8,
      y: 2,
      w: 4,
      h: 6,
      minW: 3,
      minH: 4,
      maxW: 12,
      maxH: 20,
    },
  ]);
  const [visibleIds, setVisibleIds] = useState<string[]>([
    "kpi1",
    "kpi2",
    "kpi3",
    "kpi4",
    "appointments",
    "revenue",
    "services",
  ]);
  useEffect(() => {
    const updateWidth = () => {
      const measured = containerRef.current?.offsetWidth ?? window.innerWidth;
      const safeWidth = Math.max(320, measured);
      setContainerWidth(safeWidth);
    };

    updateWidth();
    
    let observer: ResizeObserver | null = null;
    if (containerRef.current) {
      observer = new ResizeObserver(() => {
        updateWidth();
      });
      observer.observe(containerRef.current);
    }

    window.addEventListener("resize", updateWidth);
    return () => {
      window.removeEventListener("resize", updateWidth);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    // Calculate max rows based on maxHeight
    const maxRows = Math.floor(maxHeight / (rowHeight + 8));

      const clampedLayout = newLayout.map((item) => {
        let finalY = item.y;
        let finalH = item.h;

        // Strict row limit
        if (finalY + finalH > maxRows) {
          finalH = Math.max(item.minH || 1, maxRows - finalY);
          if (finalY + finalH > maxRows) {
            finalY = Math.max(0, maxRows - finalH);
          }
        }

        return {
          ...item,
          x: Math.max(0, Math.min(item.x, 12 - item.w)),
          y: finalY,
          h: finalH,
          // Dynamically set maxH so the UI prevents resizing further
          maxH: maxRows - finalY,
        };
      });
      setLayout(clampedLayout);
  }, [maxHeight, rowHeight]);

  const handleRemove = useCallback((id: string) => {
    setLayout((prev) => prev.filter((item) => item.i !== id));
    setVisibleIds((prev) => prev.filter((itemId) => itemId !== id));
  }, []);

  // On mobile, stack items to full width to avoid cramped columns
  useEffect(() => {
    // Only stack once on entering mobile so user can still resize freely afterward
    if (isMobile && !wasMobile.current) {
      setLayout((prev) => {
        const sorted = [...prev].sort((a, b) =>
          a.y === b.y ? a.x - b.x : a.y - b.y,
        );

        let currentY = 0;
        let currentX = 0;
        let maxRowHeight = 0;

        return sorted.map((item) => {
          const isKPI = item.i.startsWith("kpi");
          const width = isKPI ? 6 : 12;
          const height = Math.max(item.h, item.minH ?? item.h);

          // If it's a KPI and it doesn't fit on the current row, move to next row
          if (isKPI) {
            if (currentX + width > 12) {
              currentX = 0;
              currentY += maxRowHeight;
              maxRowHeight = 0;
            }
          } else {
            // Charts always start on a new row
            if (currentX !== 0) {
              currentY += maxRowHeight;
              currentX = 0;
              maxRowHeight = 0;
            }
          }

          const nextItem = {
            ...item,
            x: currentX,
            w: width,
            y: currentY,
            h: height,
            maxW: 12,
            maxH: Math.max(item.maxH ?? height, 20),
          };

          maxRowHeight = Math.max(maxRowHeight, height);
          currentX += width;

          if (currentX >= 12) {
            currentX = 0;
            currentY += maxRowHeight;
            maxRowHeight = 0;
          }

          return nextItem;
        });
      });
      wasMobile.current = true;
    }

    if (!isMobile && wasMobile.current) {
      // Ensure items stay within bounds when returning to desktop
      setLayout((prev) =>
        prev.map((item) => ({
          ...item,
          w: Math.min(item.w, 12),
          x: Math.max(0, Math.min(item.x, 12 - item.w)),
        })),
      );
      wasMobile.current = false;
    }
  }, [isMobile]);

  // Translated mock data
  const translatedAppointments = useMemo(
    () =>
      mockChartData.appointments.map((item) => ({
        ...item,
        name: t(item.name),
      })),
    [t],
  );

  const translatedRevenue = useMemo(
    () =>
      mockChartData.revenue.map((item) => ({
        ...item,
        name: t(item.name),
      })),
    [t],
  );

  const translatedServices = useMemo(
    () =>
      mockChartData.services.map((item) => ({
        ...item,
        name: t(item.name),
      })),
    [t],
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
        left: isMobile ? "6%" : "8%",
        right: isMobile ? "4%" : "8%",
        bottom: isMobile ? "12%" : "15%",
        top: isMobile ? "12%" : "15%",
        containLabel: true,
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
    [translatedAppointments, isMobile],
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
          params: { name: string; marker: string; value: number }[],
        ) => {
          const data = params[0];
          return `${data.name}<br/>${data.marker}€${data.value}`;
        },
      },
      grid: {
        left: isMobile ? "6%" : "8%",
        right: isMobile ? "4%" : "8%",
        bottom: isMobile ? "12%" : "15%",
        top: isMobile ? "10%" : "12%",
        containLabel: true,
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
    [translatedRevenue, isMobile],
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
    [translatedServices],
  );

  return (
    <div
      className="relative"
      ref={containerRef}
      style={{  margin: "0 auto" }}
    >
      {/* Info badge */}
      <div className="absolute -top-10 right-0 text-xs text-primary/70 flex items-center gap-1.5 z-10 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
        <GripHorizontal className="h-3 w-3" />
        <span className="font-medium">Drag & resize to customize</span>
      </div>

      <div style={{ minHeight: fixedHeight, maxHeight: maxHeight, overflow: "visible" }}>
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={rowHeight}
          margin={[isMobile ? 6 : 8, isMobile ? 6 : 8]}
          containerPadding={[isMobile ? 4 : 0, isMobile ? 4 : 0]}
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

          {/* KPI Card 3 */}
          {visibleIds.includes("kpi3") && (
            <div key="kpi3" className="cursor-grab active:cursor-grabbing">
              <div className="relative h-full group">
                <div className="absolute top-2 left-0 right-0 flex items-center justify-center pointer-events-none">
                  <div className="drag-handle pointer-events-auto rounded-full bg-white/5 px-3 py-1 shadow-sm border border-white/10 flex items-center gap-1 text-xs text-muted-foreground">
                    <GripHorizontal className="h-4 w-4" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove("kpi3")}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:border-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <KPICard
                  title={t("Active Clients")}
                  value="1,240"
                  change={5.2}
                  changeType="increase"
                  icon={<Users className="h-5 w-5 text-primary" />}
                  className="h-full overflow-hidden"
                />
              </div>
            </div>
          )}

          {/* KPI Card 4 */}
          {visibleIds.includes("kpi4") && (
            <div key="kpi4" className="cursor-grab active:cursor-grabbing">
              <div className="relative h-full group">
                <div className="absolute top-2 left-0 right-0 flex items-center justify-center pointer-events-none">
                  <div className="drag-handle pointer-events-auto rounded-full bg-white/5 px-3 py-1 shadow-sm border border-white/10 flex items-center gap-1 text-xs text-muted-foreground">
                    <GripHorizontal className="h-4 w-4" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove("kpi4")}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:border-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <KPICard
                  title={t("Avg. Rating")}
                  value="4.9"
                  change={0.2}
                  changeType="increase"
                  icon={<TrendingUp className="h-5 w-5 text-primary" />}
                  className="h-full overflow-hidden"
                />
              </div>
            </div>
          )}

          {/* Appointments Chart */}
          {visibleIds.includes("appointments") && (
            <div
              key="appointments"
              className="relative h-full cursor-grab active:cursor-grabbing group"
            >
              <div className="absolute top-2 left-0 right-0 z-10 flex items-center justify-center pointer-events-none">
                <div className="drag-handle pointer-events-auto rounded-full bg-white/5 px-3 py-1 shadow-sm border border-white/10 flex items-center gap-1 text-xs text-muted-foreground">
                  <GripHorizontal className="h-4 w-4" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove("appointments")}
                className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:border-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <PerformanceChart
                title={t("Appointments This Week")}
                data={translatedAppointments}
                type="line"
                dataKeys={["total", "completed"]}
                xAxisKey="name"
                className="h-full"
                colors={chartColors}
              />
            </div>
          )}

          {/* Revenue Chart */}
          {visibleIds.includes("revenue") && (
            <div
              key="revenue"
              className="relative h-full cursor-grab active:cursor-grabbing group"
            >
              <div className="absolute top-2 left-0 right-0 z-10 flex items-center justify-center pointer-events-none">
                <div className="drag-handle pointer-events-auto rounded-full bg-white/5 px-3 py-1 shadow-sm border border-white/10 flex items-center gap-1 text-xs text-muted-foreground">
                  <GripHorizontal className="h-4 w-4" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove("revenue")}
                className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:border-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <PerformanceChart
                title={t("Weekly Revenue")}
                data={translatedRevenue}
                type="bar"
                xAxisKey="name"
                className="h-full"
                colors={chartColors}
              />
            </div>
          )}

          {/* Services Pie Chart */}
          {visibleIds.includes("services") && (
            <div
              key="services"
              className="relative h-full cursor-grab active:cursor-grabbing group"
            >
              <div className="absolute top-2 left-0 right-0 z-10 flex items-center justify-center pointer-events-none">
                <div className="drag-handle pointer-events-auto rounded-full bg-white/5 px-3 py-1 shadow-sm border border-white/10 flex items-center gap-1 text-xs text-muted-foreground">
                  <GripHorizontal className="h-4 w-4" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove("services")}
                className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:border-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <PerformanceChart
                title={t("Popular Services")}
                data={translatedServices}
                type="pie"
                dataKey="value"
                xAxisKey="name"
                className="h-full"
                colors={chartColors}
              />
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
            box-shadow:
              0 10px 25px -5px rgba(59, 97, 192, 0.3),
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
            box-shadow:
              0 20px 25px -5px rgba(0, 0, 0, 0.15),
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

        @media (max-width: 768px) {
          .react-resizable-handle {
            width: 28px;
            height: 28px;
          }

          .react-resizable-handle-se {
            right: -2px;
            bottom: -2px;
          }

          .react-resizable-handle-se::after {
            right: 2px;
            bottom: 2px;
          }

          .react-resizable-handle-se::before {
            right: 6px;
            bottom: 6px;
          }
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
