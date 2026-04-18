"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/customUIComponents/Modal";
import LocationHoursFields from "@/components/location/LocationHoursFields";
import { Button } from "@/components/ui/button";

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
  const [draftHours, setDraftHours] = useState<SharedWeeklyHours | null>(null);

  useEffect(() => {
    if (isOpen && initialHours) {
      // Deep clone initial hours to prevent reference mutations
      setDraftHours(JSON.parse(JSON.stringify(initialHours)));
    }
  }, [isOpen, initialHours]);

  const handleDayToggle = (day: DayKey) => {
    setDraftHours((prev) => {
      if (!prev) return prev;
      const nextIsDayOff = !prev[day].isDayOff;
      return {
        ...prev,
        [day]: {
          isDayOff: nextIsDayOff,
          workTime: nextIsDayOff
            ? { start: null, end: null }
            : {
                start: prev[day].workTime.start || "09:00",
                end: prev[day].workTime.end || "18:00",
              },
        },
      };
    });
  };

  const handleWorkTimeChange = (
    day: DayKey,
    next: { start: string | null; end: string | null }
  ) => {
    setDraftHours((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [day]: {
          ...prev[day],
          workTime: {
            start: next.start,
            end: next.end,
          },
        },
      };
    });
  };

  const handleSave = () => {
    if (draftHours) {
      onSave(draftHours);
    }
  };

  return (
    <Modal
      label={`${isEditMode ? t("Edit") : t("Create")} ${t("Location Hours")}`}
      open={isOpen}
      onOpenChange={onOpenChange}
      width="4xl"
      confirmClose
      autoDetectDirty
      onConfirmSave={handleSave}
    >
      {draftHours && (
        <div className="space-y-4">
          <LocationHoursFields
            locationName={locationName}
            value={draftHours as any}
            onWorkTimeChange={handleWorkTimeChange as any}
            onDayToggle={handleDayToggle as any}
          />

          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-center">
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
              {isSaving ? t("Saving...") : t("Save changes")}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
