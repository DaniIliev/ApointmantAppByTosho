"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Moon } from "lucide-react";

import {
  DayKey,
  WeeklyWorkingHours,
} from "../types";
import {
  convertToRules,
  convertToWWH,
  WorkRule,
} from "../utils";
import { DaySelector } from "./DaySelector";
import { ScheduleRuleCard } from "./ScheduleRuleCard";

interface WeeklyScheduleEditorProps {
  value: WeeklyWorkingHours;
  onChange: (value: WeeklyWorkingHours) => void;
  showBreaks?: boolean;
}

export const WeeklyScheduleEditor: React.FC<WeeklyScheduleEditorProps> = ({
  value,
  onChange,
  showBreaks = true,
}) => {
  const { t } = useTranslation();
  
  // We maintain rules in state to allow ID preservation during editing
  const [state, setState] = useState(() => convertToRules(value));

  // Sync state if value changes from outside (e.g. Reset or Init)
  useEffect(() => {
    const currentWWH = convertToWWH(state.rules, state.restDays);
    if (JSON.stringify(currentWWH) !== JSON.stringify(value)) {
      setState(convertToRules(value));
    }
  }, [value]);

  const notifyChange = (rules: WorkRule[], restDays: DayKey[]) => {
    setState({ rules, restDays });
    onChange(convertToWWH(rules, restDays));
  };

  const addRule = () => {
    const newRule: WorkRule = {
      id: `rule-${Date.now()}`,
      days: [],
      workTime: { start: "09:00", end: "18:00" },
      breaks: [],
    };
    notifyChange([...state.rules, newRule], state.restDays);
  };

  const updateRule = (index: number, updates: Partial<WorkRule>) => {
    const next = [...state.rules];
    next[index] = { ...next[index], ...updates };
    notifyChange(next, state.restDays);
  };

  const removeRule = (index: number) => {
    notifyChange(
      state.rules.filter((_, i) => i !== index),
      state.restDays,
    );
  };

  const allAssignedToRules = state.rules.flatMap((r) => r.days);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {state.rules.map((rule, idx) => (
          <ScheduleRuleCard
            key={rule.id}
            rule={rule}
            allAssignedDays={[...allAssignedToRules, ...state.restDays]}
            onUpdate={(updates) => updateRule(idx, updates)}
            onRemove={() => removeRule(idx)}
            addRule={addRule}
            showBreaks={showBreaks}
          />
        ))}

        {state.rules.length === 0 && (
          <div className="flex min-h-[120px] items-center justify-center rounded-xl border-2 border-dashed bg-muted/5 p-4 text-center">
            <p className="text-xs text-muted-foreground">
              {t("No work shifts defined. All days will be marked as OFF by default.")}
            </p>
          </div>
        )}
      </div>

      {/* Rest Days Section */}
      <div className="rounded-xl border border-primary-50 bg-primary/5 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Moon className="h-4 w-4 text-indigo-500" />
          {t("Rest Days (Off)")}
        </div>
        <DaySelector
          selectedDays={state.restDays}
          disabledDays={allAssignedToRules}
          onChange={(days) => notifyChange(state.rules, days)}
        />
        <p className="mt-2 text-[10px] text-muted-foreground italic">
          {t("Selected days will have no working hours.")}
        </p>
      </div>
    </div>
  );
};
