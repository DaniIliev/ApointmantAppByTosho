"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/customUIComponents/Modal";
import { Button } from "@/components/ui/button";
import { WeeklyScheduleEditor } from "@/app/schedule/components/WeeklyScheduleEditor";
import { WeeklyWorkingHours } from "@/app/schedule/types";
import { Clock } from "lucide-react";

export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type SharedWeeklyHours = Record<
  DayKey,
  {
    isDayOff: boolean;
    workTime: {
      start: string | null;
      end: string | null;
    };
  }
>;

interface LocationHoursModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  locationName: string;
  initialHours: SharedWeeklyHours;
  isEditMode?: boolean;
  isSaving?: boolean;
  onSave: (hours: SharedWeeklyHours) => void;
}

export function LocationHoursModal({
  isOpen,
  onOpenChange,
  locationName,
  initialHours,
  isEditMode = true,
  isSaving = false,
  onSave,
}: LocationHoursModalProps) {
  const { t } = useTranslation();
  const [draftHours, setDraftHours] = useState<WeeklyWorkingHours | null>(null);

  useEffect(() => {
    if (isOpen && initialHours) {
      // Deep clone initial hours and ensure breaks array exists (even if empty) to satisfy types
      const cloned = JSON.parse(JSON.stringify(initialHours)) as WeeklyWorkingHours;
      Object.keys(cloned).forEach((day) => {
        if (!cloned[day as keyof WeeklyWorkingHours].breaks) {
          cloned[day as keyof WeeklyWorkingHours].breaks = [];
        }
      });
      setDraftHours(cloned);
    }
  }, [isOpen, initialHours]);

  const handleSave = () => {
    if (draftHours) {
      onSave(draftHours as unknown as SharedWeeklyHours);
    }
  };

  return (
    <Modal
      label={`${isEditMode ? t("Edit") : t("Create")} ${t("Location Hours")}`}
      open={isOpen}
      onOpenChange={onOpenChange}
      width="5xl"
      confirmClose
      autoDetectDirty
      onConfirmSave={handleSave}
    >
      {draftHours && (
        <div className="space-y-6">
          {/* Header info */}
          <div className="flex items-center gap-3 rounded-2xl bg-primary/5 p-4 border border-primary/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-primary">{locationName}</h3>
              <p className="text-xs text-muted-foreground">{t("Configure standard working hours for this location")}</p>
            </div>
          </div>

          <WeeklyScheduleEditor
            value={draftHours}
            onChange={(val) => setDraftHours(val)}
            showBreaks={false}
          />

          <div className="flex justify-center gap-3 py-4">
            <Button
              type="button"
              iconType="cancel"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("Cancel")}
            </Button>
            <Button
              type="button"
              iconType="save"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? t("Saving...") : t("Save")}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
