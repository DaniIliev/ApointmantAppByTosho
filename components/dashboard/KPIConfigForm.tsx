"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import type { KPIConfig } from "./types";

interface KPIConfigFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: KPIConfig) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockPerformanceData: any;
}

const kpiOptions = [
  {
    id: "totalAppointments",
    label: "Total Appointments",
    icon: Calendar,
  },
  {
    id: "totalRevenue",
    label: "Total Revenue",
    icon: DollarSign,
  },
  {
    id: "completedAppointments",
    label: "Completed Appointments",
    icon: CheckCircle,
  },
  {
    id: "cancelledAppointments",
    label: "Cancelled/No-Show",
    icon: XCircle,
  },
  {
    id: "averageServicePrice",
    label: "Average Service Price",
    icon: TrendingUp,
  },
  {
    id: "clientRetentionRate",
    label: "Client Retention Rate",
    icon: Users,
  },
  {
    id: "newClientsAcquired",
    label: "New Clients Acquired",
    icon: UserPlus,
  },
];

export function KPIConfigForm({
  open,
  onOpenChange,
  onSave,
  mockPerformanceData,
}: KPIConfigFormProps) {
  const [selectedKPI, setSelectedKPI] = useState<string>("totalAppointments");

  const handleSave = () => {
    const kpiOption = kpiOptions.find((opt) => opt.id === selectedKPI);
    if (!kpiOption) return;

    const kpiKey = selectedKPI as keyof typeof mockPerformanceData.kpiData;
    const kpiData = mockPerformanceData.kpiData;
    const changeData = mockPerformanceData.kpiData.changes as Record<
      string,
      { value: number; type: "increase" | "decrease" | "neutral" } | undefined
    >;

    const valueNum = kpiData[kpiKey] as number;
    let formattedValue: string | number = valueNum;

    if (selectedKPI === "totalRevenue") {
      formattedValue = `$${valueNum.toLocaleString()}`;
    } else if (selectedKPI === "averageServicePrice") {
      formattedValue = `$${valueNum.toFixed(2)}`;
    } else if (selectedKPI === "clientRetentionRate") {
      formattedValue = `${valueNum.toFixed(1)}%`;
    }

    const config: KPIConfig = {
      id: `kpi-${Date.now()}`,
      type: "kpi",
      kpiType: selectedKPI as KPIConfig["kpiType"],
      title: kpiOption.label,
      value: formattedValue,
      change: changeData[selectedKPI as string],
      layout: {
        x: 0,
        y: 0,
        w: 3,
        h: 2,
      },
    };

    onSave(config);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add KPI Card</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kpi-select" className="text-slate-300">
              Select KPI
            </Label>
            <Select value={selectedKPI} onValueChange={setSelectedKPI}>
              <SelectTrigger id="kpi-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {kpiOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add KPI
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
