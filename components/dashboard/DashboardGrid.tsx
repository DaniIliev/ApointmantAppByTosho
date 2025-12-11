"use client";

import React, { useState, useCallback, useMemo } from "react";
import GridLayout from "react-grid-layout";
import { Trash2 } from "lucide-react";
import { PerformanceChart } from "@/components/performance/PerformanceChart";
import { ChartActionsMenu } from "@/components/dashboard/ChartActionsMenu";
import type {
  ChartConfig,
  GridLayout as GridLayoutType,
  DashboardItem,
} from "./types";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface DashboardGridProps {
  items: DashboardItem[];
  onRemoveItem: (itemId: string) => void;
  onItemUpdate?: (itemId: string, config: DashboardItem) => void;
  onEditChart?: (chart: ChartConfig) => void;
  onLayoutChange?: (
    device: "desktop" | "mobile",
    layout: GridLayoutType[]
  ) => void;
  dateFrom?: string;
  dateTo?: string;
}

export function DashboardGrid({
  items,
  onRemoveItem,
  onItemUpdate,
  onEditChart,
  onLayoutChange,
  dateFrom,
  dateTo,
}: DashboardGridProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showSlider, setShowSlider] = useState<{ [key: string]: boolean }>(
    () => {
      // Initialize slider visibility - true by default for line and bar charts
      return items.reduce((acc, item) => {
        acc[item.id] = item.type !== "kpi" && item.type !== "pie";
        return acc;
      }, {} as { [key: string]: boolean });
    }
  );

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const settingsPopover = document.querySelector("[data-settings-popover]");
      if (settingsPopover && !settingsPopover.contains(event.target as Node)) {
        const settingsButton = document.querySelector("[data-settings-button]");
        if (!settingsButton?.contains(event.target as Node)) {
          setOpenMenu(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Build layout from current items
  const layout = useMemo<GridLayoutType[]>(() => {
    return items.map((item, index) => {
      const isKPI = item.type === "kpi";

      // Get responsive layout
      const responsiveLayout = item.responsiveLayout;
      let savedLayout = null;

      if (isMobile && responsiveLayout?.mobile) {
        savedLayout = responsiveLayout.mobile;
      } else if (!isMobile && responsiveLayout?.desktop) {
        savedLayout = responsiveLayout.desktop;
      } else if (item.layout && !isMobile) {
        // Fallback to old layout format for desktop only
        savedLayout = item.layout;
      }

      if (savedLayout) {
        return {
          x: savedLayout.x,
          y: savedLayout.y,
          w: savedLayout.w,
          h: savedLayout.h,
          i: item.id,
        };
      }

      // Default layout for new items or mobile
      let w: number;
      let h: number;

      if (isMobile) {
        w = 1;
        h = isKPI ? 2 : 4;
      } else {
        w = isKPI ? 3 : 6;
        h = isKPI ? 2 : 4;
      }

      return {
        x: 0,
        y: index * (isKPI ? 2 : 4),
        w: w,
        h: h,
        i: item.id,
      };
    });
  }, [items, isMobile]);

  const handleLayoutChange = useCallback(
    (newLayout: GridLayoutType[]) => {
      // Save layout preferences separately for desktop and mobile
      newLayout.forEach((layoutItem) => {
        const item = items.find((i) => i.id === layoutItem.i);
        if (item && onItemUpdate) {
          const layoutConfig = {
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h,
          };

          // Save to responsive layout based on current device
          const responsiveLayout = item.responsiveLayout || {};
          if (isMobile) {
            responsiveLayout.mobile = layoutConfig;
          } else {
            responsiveLayout.desktop = layoutConfig;
          }

          onItemUpdate(layoutItem.i, {
            ...item,
            layout: layoutConfig,
            responsiveLayout,
          });
        }
      });

      // Notify parent once with the full layout for persistence
      if (onLayoutChange) {
        onLayoutChange(isMobile ? "mobile" : "desktop", newLayout);
      }
    },
    [items, onItemUpdate, onLayoutChange, isMobile]
  );

  const handleEditChart = (chart: ChartConfig) => {
    if (onEditChart) {
      onEditChart(chart);
    }
  };

  const handleDeleteChart = (chartId: string) => {
    onRemoveItem(chartId);
  };

  const handleToggleSlider = (chartId: string, show: boolean) => {
    setShowSlider((prev) => ({
      ...prev,
      [chartId]: show,
    }));
  };

  const handlePrintChart = (chartId: string) => {
    // Find the chart element and capture it as image
    const chartElement = document.querySelector(
      `[data-chart-id="${chartId}"] .echarts-for-react`
    ) as HTMLElement;

    if (chartElement) {
      // Get the echarts instance to convert to image
      const echartsInstance = (
        chartElement as unknown as { getEchartsInstance?: () => unknown }
      ).getEchartsInstance?.();
      if (
        echartsInstance &&
        typeof echartsInstance === "object" &&
        "getDataURL" in echartsInstance
      ) {
        const imageUrl = (
          echartsInstance as unknown as {
            getDataURL: (options: {
              type: string;
              pixelRatio: number;
              backgroundColor: string;
            }) => string;
          }
        ).getDataURL({
          type: "png",
          pixelRatio: 2,
          backgroundColor: "#fff",
        });

        // Create a new window for printing
        const printWindow = window.open("", "", "height=800,width=1000");
        if (printWindow) {
          const item = items.find((i) => i.id === chartId);
          printWindow.document.write(`
            <html>
              <head>
                <title>${item?.title || "Chart"}</title>
                <style>
                  body { margin: 20px; font-family: Arial, sans-serif; }
                  h1 { color: #333; margin-bottom: 20px; }
                  img { max-width: 100%; height: auto; }
                  .footer { margin-top: 20px; font-size: 12px; color: #666; }
                </style>
              </head>
              <body>
                <h1>${item?.title || "Chart"}</h1>
                <img src="${imageUrl}" />
                <div class="footer">
                  <p>Generated on ${new Date().toLocaleString()}</p>
                </div>
              </body>
            </html>
          `);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.print();
          }, 250);
        }
      }
    }
  };

  const [screenWidth, setScreenWidth] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);

  React.useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      // Measure actual container width to account for left nav
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerWidth(rect.width);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    // Use ResizeObserver to detect when container width changes (e.g., left nav opening/closing)
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  const cols = isMobile ? 1 : 12;
  // Calculate actual available width, accounting for padding, margins, and left nav
  const containerPadding = 8;
  const marginSize = 8;
  const divPadding = 16; // p-4 class = 16px

  // Use actual container width if available, otherwise fallback to screen width calculation
  const availableWidth =
    containerWidth > 0
      ? containerWidth - divPadding * 2
      : screenWidth > 0
      ? screenWidth - divPadding * 2
      : 1280;

  const gridWidth = isMobile ? availableWidth : availableWidth;

  return (
    <div ref={containerRef} className="w-full min-h-full p-4">
      <GridLayout
        className="layout"
        layout={layout}
        onLayoutChange={handleLayoutChange}
        width={gridWidth}
        rowHeight={60}
        cols={cols}
        compactType="vertical"
        preventCollision={false}
        useCSSTransforms={true}
        isDraggable={true}
        isResizable={!isMobile}
        containerPadding={[containerPadding, containerPadding]}
        margin={[marginSize, marginSize]}
        draggableHandle=".draggable-handle"
      >
        {items.map((item) =>
          item.type === "kpi" ? (
            <div
              key={item.id}
              className=" rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col relative z-10 border border-slate-700"
            >
              <div className="draggable-handle flex items-center justify-between p-3 bg-gradient-to-r from-slate-700 to-slate-600 border-b border-slate-600 cursor-grab active:cursor-grabbing relative z-10">
                <h3 className="text-sm font-semibold text-slate-100 truncate flex-1">
                  {item.title}
                </h3>
                <div className="flex items-center gap-1 ml-2 relative z-20">
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 hover:bg-red-900/50 rounded transition-colors"
                    title="Remove KPI"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden p-2 flex items-center justify-center w-full h-full">
                <div className="w-full h-full flex flex-col items-center justify-center">
                  {/* Responsive value display */}
                  <div className="text-center flex-1 flex flex-col items-center justify-center w-full px-2">
                    <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-100 break-words">
                      {item.value}
                    </div>
                    <div className="text-xs sm:text-sm md:text-base mt-2 text-slate-400 text-center line-clamp-2">
                      {item.title}
                    </div>
                    {item.change && (
                      <div
                        className={`text-xs sm:text-sm mt-2 font-semibold ${
                          item.change.type === "increase"
                            ? "text-green-400"
                            : item.change.type === "decrease"
                            ? "text-red-400"
                            : "text-slate-400"
                        }`}
                      >
                        {item.change.type === "increase"
                          ? "↑"
                          : item.change.type === "decrease"
                          ? "↓"
                          : "→"}{" "}
                        {item.change.value}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              key={item.id}
              className="bg-primary rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-visible flex flex-col border border-slate-700 relative"
              data-chart-id={item.id}
              onMouseDown={(e) => {
                if (
                  (e.target as HTMLElement).closest("[data-settings-button]") ||
                  (e.target as HTMLElement).closest("[data-settings-popover]")
                ) {
                  e.preventDefault();
                }
              }}
            >
              {/* Chart content with header overlay */}
              <div className="flex-1 p-3 bg-white dark:bg-slate-800 flex flex-col relative">
                {/* Header overlay */}
                <div className="absolute top-1.5 left-7 right-5 z-30 flex items-center justify-between">
                  <h3 className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent text-sm font-semibold text-slate-900 truncate flex-1 draggable-handle cursor-grab active:cursor-grabbing">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 ml-2">
                    <ChartActionsMenu
                      itemId={item.id}
                      isOpen={openMenu === item.id}
                      onToggle={(id) =>
                        setOpenMenu(openMenu === id ? null : id)
                      }
                      onEdit={handleEditChart}
                      onDelete={handleDeleteChart}
                      onToggleSlider={handleToggleSlider}
                      onPrint={handlePrintChart}
                      showSlider={showSlider[item.id] || false}
                      item={item as ChartConfig}
                    />
                  </div>
                </div>

                {/* Chart */}
                <div className="flex-1 w-full pt-8">
                  <PerformanceChart
                    title=""
                    data={
                      ((item as ChartConfig).data || []) as Array<{
                        [key: string]: string | number | boolean;
                      }>
                    }
                    type={
                      (item as ChartConfig).type as
                        | "line"
                        | "bar"
                        | "pie"
                        | "column"
                        | "linebar"
                    }
                    dataKey={(item as ChartConfig).dataKey}
                    dataKeys={(item as ChartConfig).dataKeys}
                    xAxisKey={(item as ChartConfig).xAxisKey}
                    colors={(item as ChartConfig).colors}
                    showSlider={showSlider[item.id] || false}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                  />
                </div>
              </div>
            </div>
          )
        )}
      </GridLayout>
    </div>
  );
}
