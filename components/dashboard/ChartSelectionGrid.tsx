"use client";

import React from "react";
import {
  LineChart,
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  Gauge,
  BarChartHorizontal,
} from "lucide-react";

interface ChartType {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface ChartSelectionGridProps {
  onSelectChart: (chartType: string) => void;
  addedChartIds: string[];
}

const chartTypes: ChartType[] = [
  {
    id: "kpi",
    name: "KPI Card",
    icon: <Gauge className="w-12 h-12 text-primary" />,
    description: "Key metrics",
  },
  {
    id: "line",
    name: "Line Chart",
    icon: <LineChart className="w-12 h-12 text-primary" />,
    description: "Trends over time",
  },
  {
    id: "bar",
    name: "Bar Chart",
    icon: <BarChart3 className="w-12 h-12 text-primary" />,
    description: "Compare values",
  },
  {
    id: "hbar",
    name: "Horizontal Bar",
    icon: <BarChartHorizontal className="w-12 h-12 text-primary" />,
    description: "Horizontal comparison",
  },
  {
    id: "pie",
    name: "Pie Chart",
    icon: <PieChart className="w-12 h-12 text-primary" />,
    description: "Part of whole",
  },
  {
    id: "linebar",
    name: "Line & Bar",
    icon: <TrendingUp className="w-12 h-12 text-primary" />,
    description: "Combined view",
  },
];

export function ChartSelectionGrid({ onSelectChart }: ChartSelectionGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 overflow-y-auto p-2">
      {chartTypes.map((chart) => (
        <button
          key={chart.id}
          onClick={() => onSelectChart(chart.id)}
          className="flex flex-col items-center gap-2 p-4 rounded-lg border border-primary/80 hover:border-primary hover:bg-primary/10 transition-all group"
        >
          <div className="text-slate-600 group-hover:text-blue-600">
            {chart.icon}
          </div>
          <h4 className="font-semibold text-sm text-text-primary text-center">
            {chart.name}
          </h4>
          <p className="text-xs text-slate-500 text-center">
            {chart.description}
          </p>
        </button>
      ))}
    </div>
  );
}
