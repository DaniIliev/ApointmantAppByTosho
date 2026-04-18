"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Plus, Trash, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { Modal } from "@/components/customUIComponents/Modal";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";

import type { TimeRange } from "@/Global/Types/types";
import type { WorkHourEntry } from "../types";

// ─── Props ────────────────────────────────────────────────

interface DailyScheduleEditModalProps {
  dayData: WorkHourEntry;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: WorkHourEntry) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────

export const DailyScheduleEditModal: React.FC<DailyScheduleEditModalProps> = ({
  dayData,
  isOpen,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [editedData, setEditedData] = useState<WorkHourEntry>(dayData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setEditedData(dayData);
  }, [dayData]);

  // ── Update handler ──────────────────────────────────

  const handleUpdate = useCallback(
    (key: keyof WorkHourEntry, value: any) => {
      setEditedData((prev) => {
        const updated = { ...prev, [key]: value };

        if (key === "isDayOff" && value === true) {
          updated.workTime = { start: null, end: null };
          updated.breaks = [];
        }

        if (
          key === "isDayOff" &&
          value === false &&
          (!updated.workTime || !updated.workTime.start)
        ) {
          updated.workTime = { start: "09:00", end: "17:00" };
        }

        return updated;
      });
    },
    [],
  );

  // ── Work time handlers ──────────────────────────────

  const handleWorkTimeChange = (type: "start" | "end", value: string) => {
    handleUpdate("workTime", {
      ...(editedData.workTime || { start: null, end: null }),
      [type]: value,
    } as TimeRange);
  };

  // ── Break handlers ──────────────────────────────────

  const handleBreakChange = (
    index: number,
    type: "start" | "end",
    value: string,
  ) => {
    const updatedBreaks = [...(editedData.breaks || [])];
    updatedBreaks[index] = { ...updatedBreaks[index], [type]: value };
    handleUpdate("breaks", updatedBreaks);
  };

  const addBreak = () => {
    handleUpdate("breaks", [
      ...(editedData.breaks || []),
      { start: "12:00", end: "13:00" },
    ]);
  };

  const removeBreak = (index: number) => {
    handleUpdate(
      "breaks",
      (editedData.breaks || []).filter((_, i) => i !== index),
    );
  };

  // ── Save handler ────────────────────────────────────

  const handleSubmit = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave(editedData);
    } catch (error: any) {
      console.error("Save failed:", error);
      setSaveError(error.message || t("Failed to save schedule day. Please try again."));
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────

  const dateLabel =
    editedData.date instanceof Date
      ? format(editedData.date, "dd.MM.yyyy")
      : editedData.date
        ? format(new Date(editedData.date), "dd.MM.yyyy")
        : "";

  return (
    <Modal
      label={`${t("Edit")} ${editedData.day} ${dateLabel}`}
      open={isOpen}
      onOpenChange={onClose}
    >
      {saveError && (
        <div className="mx-4 mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{saveError}</p>
        </div>
      )}
      <div className="grid gap-4 py-4 px-4">
        {/* Work time */}
        {!editedData.isDayOff && (
          <div className="flex items-center space-x-2">
            <LabeledInput
              type="time"
              value={editedData.workTime?.start || ""}
              onChange={(e) => handleWorkTimeChange("start", e.target.value)}
              label={t("Start")}
              id="modal-workStart"
            />
            <LabeledInput
              type="time"
              value={editedData.workTime?.end || ""}
              onChange={(e) => handleWorkTimeChange("end", e.target.value)}
              label={t("End")}
              id="modal-workEnd"
            />
          </div>
        )}

        {/* Breaks */}
        <label className="text-sm font-medium leading-none block pt-2">
          {t("Breaks")}
        </label>
        {!editedData.isDayOff && (
          <div className="space-y-2">
            {(editedData.breaks || []).map((br, index) => (
              <div key={index} className="flex items-center space-x-2">
                <LabeledInput
                  type="time"
                  value={br.start || ""}
                  onChange={(e) =>
                    handleBreakChange(index, "start", e.target.value)
                  }
                  label={t(`Break ${index + 1} Start`)}
                  id={`break${index + 1}Start`}
                />
                <LabeledInput
                  type="time"
                  value={br.end || ""}
                  onChange={(e) =>
                    handleBreakChange(index, "end", e.target.value)
                  }
                  label={t(`Break ${index + 1} End`)}
                  id={`break${index + 1}End`}
                />
                <CustomTooltip
                  onClick={() => removeBreak(index)}
                  tooltipText={t("Delete Break")}
                  icon={<Trash color="red" />}
                />
                <CustomTooltip
                  onClick={() => addBreak()}
                  tooltipText={t("Add Break")}
                  icon={<Plus />}
                />
              </div>
            ))}
            {(editedData.breaks || []).length === 0 && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addBreak}
                  className="mt-1"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  {t("Add")}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Day off toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{t("Day Off")}</span>
          <Switch
            checked={editedData.isDayOff}
            onCheckedChange={(checked) => handleUpdate("isDayOff", checked)}
          />
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-center align-start gap-2">
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isSaving}
        >
          {isSaving ? t("Saving...") : t("Save")}
        </Button>
      </div>
    </Modal>
  );
};
