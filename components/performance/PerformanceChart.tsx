"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface ChartData {
  [key: string]: string | number | boolean | unknown;
}

interface PerformanceChartProps {
  title?: string;
  data: ChartData[];
  type: "line" | "bar" | "pie" | "column" | "linebar" | "hbar";
  dataKey?: string;
  dataKeys?: string[];
  xAxisKey?: string;
  className?: string;
  colors?: string[];
  showSlider?: boolean;
  dateFrom?: string;
  dateTo?: string;
  seriesConfig?: {
    barSeries?: string[];
    lineSeries?: string[];
  };
}

const defaultColors = [
  "#3b61c0",
  "#00bfff",
  "#f59e0b",
  "#dc2626",
  "#1f2937",
  "#3CBE28",
];

export function PerformanceChart({
  title,
  data,
  type,
  dataKey = "value",
  dataKeys,
  xAxisKey = "name",
  className,
  colors = defaultColors,
  showSlider = false,
  dateFrom,
  dateTo,
  seriesConfig,
}: PerformanceChartProps) {
  const option = useMemo(() => {
    const finalDataKeys =
      dataKeys && dataKeys.length > 0 ? dataKeys : [dataKey];

    const finalXAxisKey = xAxisKey || "name";

    switch (type) {
      case "line": {
        const xAxisData = data.map((item) => item[finalXAxisKey]);
        const series = finalDataKeys.map((key, index) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          type: "line" as const,
          data: data.map((item) => item[key]),
          smooth: true,
          lineStyle: {
            width: 3,
          },
          itemStyle: {
            color: colors[index % colors.length],
          },
          emphasis: {
            focus: "series" as const,
          },
        }));

        return {
          tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(30, 30, 60, 0.9)",
            borderColor: "rgba(255,255,255,0.2)",
            borderWidth: 1,
            textStyle: {
              color: "#fff",
            },
          },
          legend: {
            data: finalDataKeys.map(
              (key) => key.charAt(0).toUpperCase() + key.slice(1)
            ),
            textStyle: {
              color: "#999",
            },
            bottom: 0,
          },
          grid: {
            left: "3%",
            right: "4%",
            bottom: showSlider ? "22%" : "15%",
            top: "10%",
            containLabel: true,
          },
          xAxis: {
            type: "category",
            data: xAxisData,
            axisLine: {
              lineStyle: {
                color: "#666",
              },
            },
            axisLabel: {
              color: "#666",
              fontSize: 12,
            },
          },
          yAxis: {
            type: "value",
            axisLine: {
              lineStyle: {
                color: "#666",
              },
            },
            axisLabel: {
              color: "#666",
              fontSize: 12,
            },
            splitLine: {
              lineStyle: {
                color: "rgba(50, 50, 50, 0.5)",
                type: "dashed",
              },
            },
          },
          ...(showSlider && {
            dataZoom: [
              {
                type: "slider",
                show: true,
                start: 0,
                end: 100,
                height: 20,
                textStyle: {
                  color: "#999",
                },
              },
              {
                type: "inside",
                start: 0,
                end: 100,
              },
            ],
          }),
          series,
        };
      }

      case "bar": {
        const xAxisData = data.map((item) => item[finalXAxisKey]);
        const series = finalDataKeys.map((key, index) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          type: "bar" as const,
          data: data.map((item) => item[key]),
          itemStyle: {
            color: colors[index % colors.length],
            borderRadius: [4, 4, 0, 0],
          },
          label: {
            show: true,
            position: "inside",
            color: "#fff",
            fontSize: 11,
            fontWeight: "bold",
          },
          emphasis: {
            focus: "series" as const,
          },
        }));

        return {
          tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(30, 30, 60, 0.9)",
            borderColor: "rgba(255,255,255,0.2)",
            borderWidth: 1,
            textStyle: {
              color: "#fff",
            },
            axisPointer: {
              type: "shadow",
            },
          },
          legend: {
            data: finalDataKeys.map(
              (key) => key.charAt(0).toUpperCase() + key.slice(1)
            ),
            textStyle: {
              color: "#999",
            },
            bottom: 0,
          },
          grid: {
            left: "3%",
            right: "4%",
            bottom: showSlider ? "22%" : "15%",
            top: "10%",
            containLabel: true,
          },
          xAxis: {
            type: "category",
            data: xAxisData,
            axisLine: {
              lineStyle: {
                color: "#666",
              },
            },
            axisLabel: {
              color: "#666",
              fontSize: 12,
            },
          },
          yAxis: {
            type: "value",
            axisLine: {
              lineStyle: {
                color: "#666",
              },
            },
            axisLabel: {
              color: "#666",
              fontSize: 12,
            },
            splitLine: {
              lineStyle: {
                color: "rgba(50, 50, 50, 0.5)",
                type: "dashed",
              },
            },
          },
          ...(showSlider && {
            dataZoom: [
              {
                type: "slider",
                show: true,
                start: 0,
                end: 100,
                height: 20,
                textStyle: {
                  color: "#999",
                },
              },
              {
                type: "inside",
                start: 0,
                end: 100,
              },
            ],
          }),
          series,
        };
      }

      case "hbar": {
        // Horizontal bar chart
        const categoryData = data.map((item) => item[finalXAxisKey]);
        const series = finalDataKeys.map((key, index) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          type: "bar" as const,
          data: data.map((item) => item[key]),
          itemStyle: {
            color: colors[index % colors.length],
            borderRadius: [0, 4, 4, 0],
          },
          label: {
            show: true,
            position: "inside",
            color: "#fff",
            fontSize: 11,
            fontWeight: "bold",
          },
          emphasis: {
            focus: "series" as const,
          },
        }));

        return {
          tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(30, 30, 60, 0.9)",
            borderColor: "rgba(255,255,255,0.2)",
            borderWidth: 1,
            textStyle: {
              color: "#fff",
            },
            axisPointer: {
              type: "shadow",
            },
          },
          legend: {
            data: finalDataKeys.map(
              (key) => key.charAt(0).toUpperCase() + key.slice(1)
            ),
            textStyle: {
              color: "#999",
            },
            bottom: 0,
          },
          grid: {
            left: "8%",
            right: "4%",
            bottom: showSlider ? "22%" : "15%",
            top: "10%",
            containLabel: true,
          },
          xAxis: {
            type: "value",
            axisLine: {
              lineStyle: {
                color: "#666",
              },
            },
            axisLabel: {
              color: "#666",
              fontSize: 12,
            },
            splitLine: {
              lineStyle: {
                color: "rgba(50, 50, 50, 0.5)",
                type: "dashed",
              },
            },
          },
          yAxis: {
            type: "category",
            data: categoryData,
            axisLine: {
              lineStyle: {
                color: "#666",
              },
            },
            axisLabel: {
              color: "#666",
              fontSize: 12,
            },
          },
          ...(showSlider && {
            dataZoom: [
              {
                type: "slider",
                show: true,
                start: 0,
                end: 100,
                height: 20,
                textStyle: {
                  color: "#999",
                },
              },
              {
                type: "inside",
                start: 0,
                end: 100,
              },
            ],
          }),
          series,
        };
      }

      case "column": {
        // Column chart is the same as bar chart
        const xAxisData = data.map((item) => item[finalXAxisKey]);
        const series = finalDataKeys.map((key, index) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          type: "bar" as const,
          data: data.map((item) => item[key]),
          itemStyle: {
            color: colors[index % colors.length],
            borderRadius: [4, 4, 0, 0],
          },
          label: {
            show: true,
            position: "inside",
            color: "#fff",
            fontSize: 11,
            fontWeight: "bold",
          },
          emphasis: {
            focus: "series" as const,
          },
        }));

        return {
          tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(30, 30, 60, 0.9)",
            borderColor: "rgba(255,255,255,0.2)",
            borderWidth: 1,
            textStyle: {
              color: "#fff",
            },
            axisPointer: {
              type: "shadow",
            },
          },
          legend: {
            data: finalDataKeys.map(
              (key) => key.charAt(0).toUpperCase() + key.slice(1)
            ),
            textStyle: {
              color: "#999",
            },
            bottom: 0,
          },
          grid: {
            left: "3%",
            right: "4%",
            bottom: showSlider ? "22%" : "15%",
            top: "10%",
            containLabel: true,
          },
          xAxis: {
            type: "category",
            data: xAxisData,
            axisLine: {
              lineStyle: {
                color: "#666",
              },
            },
            axisLabel: {
              color: "#666",
              fontSize: 12,
            },
          },
          yAxis: {
            type: "value",
            axisLine: {
              lineStyle: {
                color: "#666",
              },
            },
            axisLabel: {
              color: "#666",
              fontSize: 12,
            },
            splitLine: {
              lineStyle: {
                color: "rgba(50, 50, 50, 0.5)",
                type: "dashed",
              },
            },
          },
          ...(showSlider && {
            dataZoom: [
              {
                type: "slider",
                show: true,
                start: 0,
                end: 100,
                height: 20,
                textStyle: {
                  color: "#999",
                },
              },
              {
                type: "inside",
                start: 0,
                end: 100,
              },
            ],
          }),
          series,
        };
      }

      case "pie": {
        const valueKey = finalDataKeys[0] || dataKey || "value";
        const pieData = data.map((item, index) => ({
          name: item[finalXAxisKey],
          value: item[valueKey],
          itemStyle: {
            color: colors[index % colors.length],
          },
        }));

        return {
          tooltip: {
            trigger: "item",
            backgroundColor: "rgba(30, 30, 60, 0.9)",
            borderColor: "rgba(255,255,255,0.2)",
            borderWidth: 1,
            textStyle: {
              color: "#fff",
            },
            formatter: "{b}: {c} ({d}%)",
          },
          legend: {
            orient: "horizontal",
            bottom: 0,
            textStyle: {
              color: "#999",
            },
          },
          series: [
            {
              type: "pie",
              radius: ["40%", "70%"],
              center: ["50%", "50%"],
              avoidLabelOverlap: true,
              itemStyle: {
                borderRadius: 8,
                borderColor: "transparent",
                borderWidth: 2,
              },
              label: {
                show: true,
                formatter: "{b}: {d}%",
                color: "#666",
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 14,
                  fontWeight: "bold",
                },
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: "rgba(0, 0, 0, 0.5)",
                },
              },
              data: pieData,
            },
          ],
        };
      }

      case "linebar": {
        // Combined line and bar chart
        const xAxisData = data.map((item) => item[xAxisKey]);

        // Determine which keys are lines and which are bars using seriesConfig
        let lineKeys: string[] = [];
        let barKeys: string[] = [];
        let colorOffset = 0;

        if (seriesConfig?.lineSeries && seriesConfig?.barSeries) {
          // Use seriesConfig to determine series types - preserve the exact order from config
          barKeys = seriesConfig.barSeries;
          lineKeys = seriesConfig.lineSeries;
          colorOffset = barKeys.length; // Bars come first in color order
        } else {
          // Fallback: split by half if no seriesConfig
          const halfLength = Math.ceil(finalDataKeys.length / 2);
          lineKeys = finalDataKeys.slice(0, halfLength);
          barKeys = finalDataKeys.slice(halfLength);
          colorOffset = halfLength;
        }

        const barSeries = barKeys.map((key, index) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          type: "bar" as const,
          data: data.map((item) => item[key]),
          itemStyle: {
            color: colors[index % colors.length],
            borderRadius: [4, 4, 0, 0],
          },
          label: {
            show: true,
            position: "inside",
            color: "#fff",
            fontSize: 10,
            fontWeight: "bold",
          },
          emphasis: {
            focus: "series" as const,
          },
          yAxisIndex: 1,
        }));

        const lineSeries = lineKeys.map((key, index) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          type: "line" as const,
          data: data.map((item) => item[key]),
          smooth: true,
          lineStyle: {
            width: 3,
          },
          itemStyle: {
            color: colors[(index + colorOffset) % colors.length],
          },
          emphasis: {
            focus: "series" as const,
          },
          yAxisIndex: 0,
        }));

        return {
          tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(30, 30, 60, 0.9)",
            borderColor: "rgba(255,255,255,0.2)",
            borderWidth: 1,
            textStyle: {
              color: "#fff",
            },
          },
          legend: {
            data: finalDataKeys.map(
              (key) => key.charAt(0).toUpperCase() + key.slice(1)
            ),
            textStyle: {
              color: "#999",
            },
            bottom: 0,
          },
          grid: {
            left: "3%",
            right: "4%",
            bottom: showSlider ? "22%" : "15%",
            top: "10%",
            containLabel: true,
          },
          xAxis: {
            type: "category",
            data: xAxisData,
            axisLine: {
              lineStyle: {
                color: "#666",
              },
            },
            axisLabel: {
              color: "#666",
              fontSize: 12,
            },
          },
          yAxis: [
            {
              type: "value",
              position: "left",
              axisLine: {
                lineStyle: {
                  color: "#666",
                },
              },
              axisLabel: {
                color: "#666",
                fontSize: 12,
              },
              splitLine: {
                lineStyle: {
                  color: "rgba(50, 50, 50, 0.5)",
                  type: "dashed",
                },
              },
            },
            {
              type: "value",
              position: "right",
              axisLine: {
                lineStyle: {
                  color: "#666",
                },
              },
              axisLabel: {
                color: "#666",
                fontSize: 12,
              },
              splitLine: {
                lineStyle: {
                  color: "rgba(50, 50, 50, 0.5)",
                  type: "dashed",
                },
              },
            },
          ],
          ...(showSlider && {
            dataZoom: [
              {
                type: "slider",
                show: true,
                start: 0,
                end: 100,
                height: 20,
                textStyle: {
                  color: "#999",
                },
              },
              {
                type: "inside",
                start: 0,
                end: 100,
              },
            ],
          }),
          series: [...barSeries, ...lineSeries],
        };
      }

      case "hbar": {
        const yAxisData = data.map((item) => item[xAxisKey]);
        const series = finalDataKeys.map((key, index) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          type: "bar" as const,
          data: data.map((item) => item[key]),
          itemStyle: {
            color: colors[index % colors.length],
            borderRadius: [0, 4, 4, 0],
          },
          label: {
            show: true,
            position: "inside",
            color: "#fff",
            fontSize: 11,
            fontWeight: "bold",
          },
          emphasis: {
            focus: "series" as const,
          },
        }));

        return {
          tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(30, 30, 60, 0.9)",
            borderColor: "rgba(255,255,255,0.2)",
            borderWidth: 1,
            textStyle: {
              color: "#fff",
            },
            axisPointer: {
              type: "shadow",
            },
          },
          legend: {
            data: finalDataKeys.map(
              (key) => key.charAt(0).toUpperCase() + key.slice(1)
            ),
            textStyle: {
              color: "#999",
            },
            bottom: 0,
          },
          grid: {
            left: "15%",
            right: "4%",
            bottom: "15%",
            top: "10%",
            containLabel: true,
          },
          xAxis: {
            type: "value",
            axisLine: {
              lineStyle: {
                color: "#666",
              },
            },
            axisLabel: {
              color: "#666",
              fontSize: 12,
            },
          },
          yAxis: {
            type: "category",
            data: yAxisData,
            axisLine: {
              lineStyle: {
                color: "#666",
              },
            },
            axisLabel: {
              color: "#666",
              fontSize: 12,
            },
          },
          series,
        };
      }

      default:
        return {};
    }
  }, [
    data,
    type,
    dataKey,
    dataKeys,
    xAxisKey,
    colors,
    showSlider,
    seriesConfig,
  ]);

  return (
    <div className="w-full h-full flex flex-col">
      <Card
        tabIndex={-1}
        className={cn(
          "backdrop-blur-md bg-white dark:bg-gray-900 border-primary/20 shadow-xl focus-visible:outline-none focus:outline-none outline-none no-outline flex-1 flex flex-col",
          className
        )}
      >
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle className="theme-text-gradient py-2">{title}</CardTitle>
            {(dateFrom || dateTo) && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {dateFrom && dateTo
                  ? `${dateFrom} - ${dateTo}`
                  : dateFrom
                  ? `From ${dateFrom}`
                  : `To ${dateTo}`}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ReactECharts
            option={option}
            style={{ height: "100%", width: "100%" }}
            opts={{ renderer: "canvas" }}
            notMerge={true}
            lazyUpdate={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
