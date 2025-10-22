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
  dataKeys, // 👈 ИЗПОЛЗВАМЕ НОВИЯ ПРОП
  xAxisKey = "name",
  className,
  colors = defaultColors,
}: PerformanceChartProps) {
  // Определяме финалния списък с ключове за данните
  // Приоритет: dataKeys (масив) > dataKey (единичен ключ)
  const finalDataKeys = dataKeys && dataKeys.length > 0 ? dataKeys : [dataKey];

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(50, 50, 50, 0.5)" // Използваме само един <CartesianGrid>
              />
              <XAxis dataKey={xAxisKey} stroke="#666" fontSize={14} />
              <YAxis stroke="#666" fontSize={14} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 30, 60, 0.9)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  backdropFilter: "blur(10px)",
                }}
              />
              <Legend />
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(50, 50, 50, 0.5)"
              />
              <XAxis dataKey={xAxisKey} stroke="#666" fontSize={14} />
              <YAxis stroke="#666" fontSize={14} />
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
      className={cn(
        "backdrop-blur-md bg-card/80 border-white/20 shadow-xl",
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
