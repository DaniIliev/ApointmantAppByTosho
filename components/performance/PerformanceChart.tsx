"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface ChartData {
  [key: string]: any;
}

interface PerformanceChartProps {
  title: string;
  data: ChartData[];
  type: "line" | "bar" | "pie";
  dataKey?: string;
  dataKeys?: string[]; // 👈 ДОБАВЕНО
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

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <ResponsiveContainer
            width="100%"
            height={300}
            className="focus-visible:outline-none"
            style={{ outline: "none" }}
          >
            <LineChart
              data={data}
              margin={{ top: 20, right: 20, left: -9, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(50, 50, 50, 0.5)" // Използваме само един <CartesianGrid>
              />
              <XAxis
                dataKey={xAxisKey}
                stroke="#666"
                fontSize={14}
                // tickMargin={2}
                // axisLine={false}
                // tickLine={false}
              />
              <YAxis
                stroke="#666"
                fontSize={14}
                // tickMargin={8}
                // axisLine={false}
                // tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 30, 60, 0.9)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  backdropFilter: "blur(10px)",
                }}
              />
              <Legend className="text-white" />
              {/* Рендиране на множество линии */}
              {finalDataKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={key.charAt(0).toUpperCase() + key.slice(1)} // Форматиране за легендата
                  stroke={colors[index % colors.length]}
                  strokeWidth={3}
                  dot={{
                    fill: colors[index % colors.length],
                    strokeWidth: 2,
                    r: 4,
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer
            width="100%"
            height={300}
            className="focus-visible:outline-none"
            style={{ outline: "none" }}
          >
            <BarChart
              data={data}
              margin={{ top: 24, right: 24, left: 16, bottom: 24 }}
              barCategoryGap={12}
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(50, 50, 50, 0.5)"
              />
              <XAxis
                dataKey={xAxisKey}
                stroke="#666"
                fontSize={14}
                tickMargin={8}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#666"
                fontSize={14}
                tickMargin={8}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 30, 60, 0.9)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  backdropFilter: "blur(10px)",
                }}
              />
              <Legend />
              {/* Рендиране на множество стълбове */}
              {finalDataKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  name={key.charAt(0).toUpperCase() + key.slice(1)}
                  fill={colors[index % colors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        // Премахнат е дублираният case "pie"
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => {
                  if (typeof percent === "number") {
                    // При PieChart dataKey остава единичен (value)
                    return `${name} ${(percent * 100).toFixed(0)}%`;
                  }
                  return name;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 30, 60, 0.9)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  backdropFilter: "blur(10px)",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

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
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
}
