"use client";

import React from "react";
import { Plus, Trash, Clock, Coffee } from "lucide-react";
import { useTranslation } from "react-i18next";

import { TimeRangePicker } from "@/components/customUIComponents/TimeRangePicker";
import { Button } from "@/components/ui/button";
import { DaySelector } from "./DaySelector";
import { DayKey, WorkRule } from "../utils";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";

interface ScheduleRuleCardProps {
  rule: WorkRule;
  onUpdate: (updates: Partial<WorkRule>) => void;
  onRemove: () => void;
  addRule: () => void;
  allAssignedDays: DayKey[];
  showBreaks?: boolean;
}

export const ScheduleRuleCard: React.FC<ScheduleRuleCardProps> = ({
  rule,
  onUpdate,
  onRemove,
  addRule,
  allAssignedDays,
  showBreaks = true,
}) => {
  const { t } = useTranslation();

  // Days that are assigned to OTHER rules (not this one)
  const disabledDays = allAssignedDays.filter((d) => !rule.days.includes(d));

  const addBreak = () => {
    onUpdate({
      breaks: [...rule.breaks, { start: "12:00", end: "13:00" }],
    });
  };

  const removeBreak = (index: number) => {
    onUpdate({
      breaks: rule.breaks.filter((_, i) => i !== index),
    });
  };

  const updateBreak = (index: number, start: string | null, end: string | null) => {
    const next = [...rule.breaks];
    next[index] = { start, end };
    onUpdate({ breaks: next });
  };

  return (
    <div className="group relative space-y-4 rounded-xl border border-primary-50 bg-card p-4 transition-all hover:shadow-md hover:border-primary/20">
      {/* Header with Remove Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Clock className="h-4 w-4" />
          {t("Work Shift")}
        </div>
        <div className="flex gap-1 items-center">
          <CustomTooltip
            onClick={addRule}
            tooltipText={t("Add")}
            icon={<Plus className="h-4 w-4" />}
          />
          <CustomTooltip
            onClick={onRemove}
            tooltipText={t("Remove")}
            icon={<Trash className="h-4 w-4 text-red-500"/>}
          />

        </div>
      </div>

      {/* Main Time Range */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {t("Working Hours")}
        </label>
        <TimeRangePicker
          value={{
            startTime: rule.workTime.start,
            endTime: rule.workTime.end,
          }}
          onChange={({ startTime, endTime }) =>
            onUpdate({ workTime: { start: startTime, end: endTime } })
          }
        />
      </div>

      {/* Day Selector */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {t("Applied Days")}
        </label>
        <DaySelector
          selectedDays={rule.days}
          disabledDays={disabledDays}
          onChange={(days) => onUpdate({ days })}
        />
      </div>

      {/* Breaks Section */}
      {showBreaks && (
        <div className="space-y-2 pt-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <Coffee className="h-3 w-3" />
              {t("Breaks")}
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px]"
              onClick={addBreak}
            >
              <Plus className="mr-1 h-3 w-3" />
              {t("Add Break")}
            </Button>
          </div>

          <div className="space-y-2">
            {rule.breaks.map((br, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <TimeRangePicker
                  value={{ startTime: br.start, endTime: br.end }}
                  onChange={({ startTime, endTime }) =>
                    updateBreak(idx, startTime, endTime)
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-red-500"
                  onClick={() => removeBreak(idx)}
                >
                  <Trash className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {rule.breaks.length === 0 && (
              <p className="py-1 text-center text-xs text-muted-foreground italic">
                {t("No breaks defined")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
