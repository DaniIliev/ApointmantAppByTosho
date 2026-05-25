import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import ReactECharts from "echarts-for-react";
import { useTranslation } from "react-i18next";

type HourlyMetric = {
  time: string;
  requests: number;
  errors: number;
  responseTime: number;
};

type DashboardStats = {
  activePlans: Record<string, number>;
  hourlyData: HourlyMetric[];
};

interface AnalyticsChartsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export default function AnalyticsCharts({ stats, loading }: AnalyticsChartsProps) {
  const { t } = useTranslation();

  // 1. API Traffic Volume (24h) - Spline Area
  const getTrafficChartOption = () => {
    if (!stats || !stats.hourlyData) return {};
    const times = stats.hourlyData.map((d) => d.time);
    const requests = stats.hourlyData.map((d) => d.requests);

    return {
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        borderColor: "rgba(100, 116, 139, 0.2)",
        textStyle: { color: "#fff", fontSize: 11 },
        borderRadius: 12,
        shadowBlur: 10,
      },
      grid: { left: "4%", right: "4%", top: "12%", bottom: "10%", containLabel: true },
      xAxis: {
        type: "category",
        data: times,
        boundaryGap: false,
        axisLabel: { color: "var(--text-secondary)", fontSize: 10 },
        axisLine: { lineStyle: { color: "rgba(100, 116, 139, 0.15)" } }
      },
      yAxis: {
        type: "value",
        nameTextStyle: { color: "var(--text-secondary)", fontSize: 10 },
        axisLabel: { color: "var(--text-secondary)", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(100, 116, 139, 0.08)" } }
      },
      series: [
        {
          name: t("Total Requests"),
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          data: requests,
          itemStyle: { color: "#3b82f6" },
          lineStyle: { width: 3, color: "#3b82f6" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(59, 130, 246, 0.25)" },
                { offset: 1, color: "rgba(59, 130, 246, 0)" }
              ]
            }
          }
        }
      ]
    };
  };

  // 2. API Response Latency (24h) - Spline Line with Target Marker
  const getLatencyChartOption = () => {
    if (!stats || !stats.hourlyData) return {};
    const times = stats.hourlyData.map((d) => d.time);
    const responseTimes = stats.hourlyData.map((d) => d.responseTime);

    return {
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        borderColor: "rgba(100, 116, 139, 0.2)",
        textStyle: { color: "#fff", fontSize: 11 },
        borderRadius: 12,
      },
      grid: { left: "4%", right: "4%", top: "12%", bottom: "10%", containLabel: true },
      xAxis: {
        type: "category",
        data: times,
        boundaryGap: false,
        axisLabel: { color: "var(--text-secondary)", fontSize: 10 },
        axisLine: { lineStyle: { color: "rgba(100, 116, 139, 0.15)" } }
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "var(--text-secondary)", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(100, 116, 139, 0.08)" } }
      },
      series: [
        {
          name: t("Avg Latency (ms)"),
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          data: responseTimes,
          itemStyle: { color: "#10b981" },
          lineStyle: { width: 3, color: "#10b981" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(16, 185, 129, 0.18)" },
                { offset: 1, color: "rgba(16, 185, 129, 0)" }
              ]
            }
          },
          markLine: {
            silent: true,
            symbol: ["none", "none"],
            lineStyle: { color: "rgba(239, 68, 68, 0.4)", type: "dashed", width: 1.5 },
            data: [{ yAxis: 100, label: { formatter: "100ms Target", position: "end", color: "var(--text-secondary)", fontSize: 9 } }]
          }
        }
      ]
    };
  };

  // 3. API Success vs Error breakdowns (24h) - Stacked Column
  const getErrorsChartOption = () => {
    if (!stats || !stats.hourlyData) return {};
    const times = stats.hourlyData.map((d) => d.time);
    const errors = stats.hourlyData.map((d) => d.errors);
    const success = stats.hourlyData.map((d) => Math.max(0, d.requests - d.errors));

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        borderColor: "rgba(100, 116, 139, 0.2)",
        textStyle: { color: "#fff", fontSize: 11 },
        borderRadius: 12,
      },
      legend: {
        data: [t("Success"), t("Errors")],
        right: "5%",
        top: "2%",
        textStyle: { color: "var(--text-secondary)", fontSize: 10 }
      },
      grid: { left: "4%", right: "4%", top: "16%", bottom: "10%", containLabel: true },
      xAxis: {
        type: "category",
        data: times,
        axisLabel: { color: "var(--text-secondary)", fontSize: 10 },
        axisLine: { lineStyle: { color: "rgba(100, 116, 139, 0.15)" } }
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "var(--text-secondary)", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(100, 116, 139, 0.08)" } }
      },
      series: [
        {
          name: t("Success"),
          type: "bar",
          stack: "total",
          itemStyle: { color: "#3b82f6", borderRadius: [0, 0, 4, 4] },
          data: success
        },
        {
          name: t("Errors"),
          type: "bar",
          stack: "total",
          itemStyle: { color: "#ef4444", borderRadius: [4, 4, 0, 0] },
          data: errors
        }
      ]
    };
  };

  // 4. Normal Pie Chart Plan Distribution - Prevents Overlaps
  const getPieChartOption = () => {
    if (!stats || !stats.activePlans) return {};
    
    const rawData = Object.entries(stats.activePlans).map(([plan, count]) => ({
      name: plan.replace(/_/g, " "),
      value: count
    }));

    // Filter out zero-count plans to avoid labels overlapping on empty slices
    const filteredData = rawData.some(d => d.value > 0)
      ? rawData.filter(d => d.value > 0)
      : rawData;

    const colors = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#64748b"];

    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        borderColor: "rgba(100, 116, 139, 0.2)",
        textStyle: { color: "#fff", fontSize: 11 },
        borderRadius: 12,
      },
      legend: {
        bottom: "0%",
        left: "center",
        textStyle: { color: "var(--text-secondary)", fontSize: 9 },
        itemWidth: 8,
        itemHeight: 8,
        padding: [0, 0, 5, 0]
      },
      series: [
        {
          name: t("Plans"),
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "45%"],
          itemStyle: {
            borderRadius: 8,
            borderColor: "var(--card)",
            borderWidth: 2
          },
          color: colors,
          label: {
            show: true,
            color: "var(--text-primary)",
            fontSize: 9,
            formatter: "{b}: {c}"
          },
          labelLine: {
            lineStyle: {
              color: "rgba(100, 116, 139, 0.3)"
            },
            smooth: 0.2,
            length: 8,
            length2: 8
          },
          data: filteredData
        }
      ]
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Card 1: API Request Volume (Traffic) */}
      <Card className="border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-0.5">
            <h3 className="font-bold text-lg text-text-primary">{t("API Traffic Volume (24h)")}</h3>
            <p className="text-xs text-text-secondary">{t("Visualizing total endpoint requests chronologically in 2h intervals")}</p>
          </div>
          <div className="h-[320px] w-full relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/10 backdrop-blur-sm rounded-xl">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <ReactECharts option={getTrafficChartOption()} style={{ height: "100%", width: "100%" }} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Average Response Time Latency */}
      <Card className="border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-0.5">
            <h3 className="font-bold text-lg text-text-primary">{t("API Latency Performance (24h)")}</h3>
            <p className="text-xs text-text-secondary">{t("Analyzing average response time in ms with standard performance target bounds")}</p>
          </div>
          <div className="h-[320px] w-full relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/10 backdrop-blur-sm rounded-xl">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <ReactECharts option={getLatencyChartOption()} style={{ height: "100%", width: "100%" }} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 3: HTTP Health & Errors Breakdown */}
      <Card className="border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-0.5">
            <h3 className="font-bold text-lg text-text-primary">{t("HTTP Request Health (24h)")}</h3>
            <p className="text-xs text-text-secondary">{t("Stacked analytics of successful API transactions vs failed execution triggers")}</p>
          </div>
          <div className="h-[320px] w-full relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/10 backdrop-blur-sm rounded-xl">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <ReactECharts option={getErrorsChartOption()} style={{ height: "100%", width: "100%" }} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Subscription Plan Shares */}
      <Card className="border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-0.5">
            <h3 className="font-bold text-lg text-text-primary">{t("Subscription Plan Shares")}</h3>
            <p className="text-xs text-text-secondary">{t("Proportional subscriber configurations grouped as an elegant normal Pie chart")}</p>
          </div>
          <div className="h-[320px] w-full relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/10 backdrop-blur-sm rounded-xl">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <ReactECharts option={getPieChartOption()} style={{ height: "100%", width: "100%" }} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
