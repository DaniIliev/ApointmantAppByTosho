"use client";

import React, { useState, useCallback, useMemo } from "react";
import GridLayout from "react-grid-layout";
import { GripHorizontal, Trash2 } from "lucide-react";
import { PerformanceChart } from "@/components/performance/PerformanceChart";
import { ChartActionsMenu } from "@/components/dashboard/ChartActionsMenu";
import type {
  ChartConfig,
  GridLayout as GridLayoutType,
  DashboardItem,
} from "./types";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { CustomTooltip } from "../customUIComponents/CustomTooltip";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = React.useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showSlider, setShowSlider] = useState<{ [key: string]: boolean }>(
    () => {
      // Initialize slider visibility hidden by default for all charts
      return items.reduce((acc, item) => {
        acc[item.id] = false;
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
        isResizable={true}
        containerPadding={[containerPadding, containerPadding]}
        margin={[marginSize, marginSize]}
        draggableHandle=".draggable-handle"
      >
        {items.map((item) =>
          item.type === "kpi" ? (
            <div
              key={item.id}
              className="rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col relative z-10 border border-primary/20"
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 text-slate-300 hover:text-primary cursor-grab active:cursor-grabbing draggable-handle">
                <GripHorizontal className="w-5 h-4" />
              </div>
              <div className="absolute top-2 right-2 z-20">
                <CustomTooltip
                  onClick={() => onRemoveItem(item.id)}
                  tooltipText={t("Remove KPI")}
                  icon={<Trash2 className="w-5 h-5 text-red-400" />}
                />
              </div>

              <div className="flex-1 overflow-hidden flex items-center justify-center w-full h-full">
                <div className="w-full h-full rounded-lg bg-white dark:bg-gray-900 border-primary/20 text-center flex flex-col items-center justify-center">
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary break-words">
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
          ) : (
            <div
              key={item.id}
              className="bg-primary rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col relative"
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
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 text-slate-300 hover:text-primary cursor-grab active:cursor-grabbing draggable-handle">
                <GripHorizontal className="w-5 h-4" />
              </div>
              {/* Chart content with header overlay */}
              <div className="flex-1 p-3 bg-white dark:bg-slate-800 flex flex-col relative border-primary/20">
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
                      showSlider={showSlider[item.id] || false}
                      item={item as ChartConfig}
                    />
                  </div>
                </div>

                {/* Chart */}
                <div className="flex-1 w-full pt-6">
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
