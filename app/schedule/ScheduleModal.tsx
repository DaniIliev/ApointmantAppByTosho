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
} from "./utils";
import { WeeklyScheduleEditor } from "./components/WeeklyScheduleEditor";
import { Calendar as CalendarIcon, AlertCircle } from "lucide-react";
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
  const [invalidIndexes, setInvalidIndexes] = useState<number[]>([]);

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
    setInvalidIndexes([]);
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
      // Validate that all schedules have a start and end date
      const invalid = localSchedules
        .map((s, i) => (!s.startDate || !s.endDate ? i : -1))
        .filter((i) => i !== -1);
      
      if (invalid.length > 0) {
        setInvalidIndexes(invalid);
        setIsSaving(false);
        return;
      }
      setInvalidIndexes([]);

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
              <div className="rounded-xl border border-primary-50 bg-card p-4 transition-all hover:shadow-md hover:border-primary/20">
              {/* Top Row: Date Range & Location */}
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <DateRangePicker
                      value={{
                        startDate: schedule.startDate,
                        endDate: schedule.endDate,
                      }}
                      error={invalidIndexes.includes(scheduleIndex) ? t("Field Required") : undefined}
                      onChange={({ startDate, endDate }) => {
                        setInvalidIndexes((prev) => prev.filter((i) => i !== scheduleIndex));
                        updateScheduleAt(scheduleIndex, (prev) => ({
                          ...prev,
                          startDate: startDate || "",
                          endDate: endDate || "",
                        }));
                      }}
                    />
                  </div>
                  <div className="flex gap-1 items-center mt-1">
                    <CustomTooltip
                      onClick={addSchedule}
                      tooltipText={t("Add Schedule Range")}
                      icon={<Plus className="h-4 w-4" />}
                    />
                    <CustomTooltip
                      onClick={() => removeSchedule(scheduleIndex)}
                      tooltipText={t("Remove")}
                      icon={<Trash className="h-4 w-4 text-red-500"/>}
                    />
                  </div>
                </div>
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


