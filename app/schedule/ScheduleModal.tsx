"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash } from "lucide-react";
import { DateRangePicker } from "@/components/customUIComponents/DateRangePicker";
import { Modal } from "@/components/customUIComponents/Modal";
import { Button } from "@/components/ui/button";

import type {
  DayKey,
  EditableSchedule,
  LocationDto,
  TimeRange,
  WeeklyWorkingHours,
} from "./types";
import {
  createEmptySchedule,
  dayKeys,
  normalizeForForm,
  normalizeTimeRange,
  readBreaks,
  writeBreaks,
  convertToRules,
  convertToWWH,
  WorkRule,
} from "./utils";
import { DaySelector } from "./components/DaySelector";
import { ScheduleRuleCard } from "./components/ScheduleRuleCard";
import { Coffee, Calendar as CalendarIcon, MapPin, PlusCircle, Moon, AlertCircle } from "lucide-react";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";

// ─── Props ────────────────────────────────────────────────

interface ScheduleModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (schedules: EditableSchedule[]) => void;
  schedules: EditableSchedule[];
  defaultLocationId?: string;
  locations: LocationDto[];
}

// ─── Component ────────────────────────────────────────────

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onOpenChange,
  onSave,
  schedules,
  defaultLocationId,
  locations,
}) => {
  const { t } = useTranslation();
  const [localSchedules, setLocalSchedules] = useState<EditableSchedule[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    if (schedules.length > 0) {
      setLocalSchedules(schedules.map(normalizeForForm));
      return;
    }

    setLocalSchedules([createEmptySchedule(defaultLocationId)]);
  }, [defaultLocationId, isOpen, schedules]);

  // ─── Updaters ─────────────────────────────────────────

  const updateScheduleAt = (
    index: number,
    updater: (s: EditableSchedule) => EditableSchedule,
  ) => {
    setLocalSchedules((prev) =>
      prev.map((s, i) => (i === index ? updater(s) : s)),
    );
  };

  const addSchedule = () => {
    setLocalSchedules((prev) => [
      ...prev,
      createEmptySchedule(defaultLocationId),
    ]);
  };

  const removeSchedule = (index: number) => {
    setLocalSchedules((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  // ─── Breaks ───────────────────────────────────────────

  const updateBreak = (
    scheduleIndex: number,
    breakIndex: number,
    range: TimeRange,
  ) => {
    updateScheduleAt(scheduleIndex, (s) => {
      const breaks = readBreaks(s);
      const next = [...breaks];
      next[breakIndex] = normalizeTimeRange(range);
      return writeBreaks(s, next);
    });
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const cleaned = localSchedules.map((schedule) => {
        const wwh = { ...schedule.weeklyWorkingHours };
        dayKeys.forEach((day) => {
          wwh[day] = {
            ...wwh[day],
            workTime: normalizeTimeRange(wwh[day].workTime),
            breaks: (wwh[day].breaks || []).map(normalizeTimeRange),
          };
        });

        return {
          ...schedule,
          startDate: schedule.startDate,
          endDate: schedule.endDate,
          weeklyWorkingHours: wwh,
          breaks: schedule.breaks.map(normalizeTimeRange),
          locationId: schedule.locationId || defaultLocationId || "",
        };
      });

      await onSave(cleaned);
      onOpenChange(false);
    } catch (error: any) {
       console.error("Save failed:", error);
       setSaveError(error.message || t("Failed to save schedules. Please try again."));
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <Modal
      label={t("Staff schedules")}
      open={isOpen}
      onOpenChange={onOpenChange}
      autoDetectDirty
      onConfirmSave={handleSave}
      width="5xl"
    >
        {saveError && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{saveError}</p>
          </div>
        )}

        <div className="space-y-4">
          {localSchedules.map((schedule, scheduleIndex) => (
            <div
              key={`${schedule._id || "new"}-${scheduleIndex}`}
              className="space-y-3 border-b border-primary/20 pb-3"
            >
              {/* Top Row: Date Range & Location */}
              <div className="flex gap-2">
                  <DateRangePicker
                    value={{
                      startDate: schedule.startDate,
                      endDate: schedule.endDate,
                    }}
                    onChange={({ startDate, endDate }) =>
                      updateScheduleAt(scheduleIndex, (prev) => ({
                        ...prev,
                        startDate: startDate || "",
                        endDate: endDate || "",
                      }))
                    }
                  />
                  <CustomTooltip
                    onClick={addSchedule}
                    tooltipText={t("Add Schedule Range")}
                    icon={<Plus />}
                  />

                  <CustomTooltip
                    onClick={() => removeSchedule(scheduleIndex)}
                    tooltipText={t("Remove")}
                    icon={<Trash className="text-red-500"/>}
                  />
              </div>

              {/* Weekly Rules Editor */}
              <WeeklyScheduleEditor
                value={schedule.weeklyWorkingHours}
                onChange={(nextWwh) =>
                  updateScheduleAt(scheduleIndex, (prev) => ({
                    ...prev,
                    weeklyWorkingHours: nextWwh,
                  }))
                }
              />
            </div>
          ))}
        </div>

        {localSchedules.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-2xl">
            <CalendarIcon className="mb-4 h-12 w-12 opacity-20" />
            <p>{t("No schedules configured yet.")}</p>
            <Button variant="link" onClick={addSchedule}>
              {t("Create your first schedule")}
            </Button>
          </div>
        )}
      <div className="flex justify-center gap-3 py-4">
        <Button variant="outline" onClick={() => onOpenChange(false)} iconType="cancel">
          {t("Cancel")}
        </Button>
        <Button onClick={handleSave} iconType="save" disabled={isSaving}>
          {isSaving ? t("Saving...") : t("Save")}
        </Button>
        </div>
    </Modal>
  );
};

// ─── Sub-Component: WeeklyScheduleEditor ──────────────────

interface WeeklyScheduleEditorProps {
  value: WeeklyWorkingHours;
  onChange: (value: WeeklyWorkingHours) => void;
}

const WeeklyScheduleEditor: React.FC<WeeklyScheduleEditorProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation();

  // We maintain rules in state to allow ID preservation during editing
  const [state, setState] = useState(() => convertToRules(value));

  // Sync state if value changes from outside (e.g. Reset or Init)
  // But be careful not to overwrite active edits
  useEffect(() => {
    // Basic structural check to see if we need to re-sync
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
