"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";

// Dynamic import to avoid SSR issues
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface ChartData {
  [key: string]: any;
}

interface PerformanceChartProps {
  title: string;
  data: ChartData[];
  type: "line" | "bar" | "pie";
  dataKey?: string;
  dataKeys?: string[];
  xAxisKey?: string;
  className?: string;
  colors?: string[];
}

const defaultColors = ["#3b61c0", "#00bfff", "#f59e0b", "#dc2626", "#1f2937"];

export function PerformanceChart({
  title,
  data,
  type,
  dataKey = "value",
  dataKeys,
  xAxisKey = "name",
  className,
  colors = defaultColors,
}: PerformanceChartProps) {
  const finalDataKeys = dataKeys && dataKeys.length > 0 ? dataKeys : [dataKey];

  const option = useMemo(() => {
    switch (type) {
      case "line": {
        const xAxisData = data.map((item) => item[xAxisKey]);
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
            bottom: "15%",
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
          series,
        };
      }

      case "bar": {
        const xAxisData = data.map((item) => item[xAxisKey]);
        const series = finalDataKeys.map((key, index) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          type: "bar" as const,
          data: data.map((item) => item[key]),
          itemStyle: {
            color: colors[index % colors.length],
            borderRadius: [4, 4, 0, 0],
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
            bottom: "15%",
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
          series,
        };
      }

      case "pie": {
        const pieData = data.map((item, index) => ({
          name: item[xAxisKey],
          value: item[dataKey],
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

      default:
        return {};
    }
  }, [data, type, dataKey, finalDataKeys, xAxisKey, colors]);

  return (
    <Card
      tabIndex={-1}
      className={cn(
        "backdrop-blur-md bg-card/80 border-white/20 shadow-xl focus-visible:outline-none focus:outline-none outline-none no-outline",
        className
      )}
    >
      <CardHeader>
        <CardTitle className="theme-text-gradient py-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ReactECharts
          option={option}
          style={{ height: "300px", width: "100%" }}
          opts={{ renderer: "canvas" }}
          notMerge={true}
          lazyUpdate={true}
        />
      </CardContent>
    </Card>
  );
}
