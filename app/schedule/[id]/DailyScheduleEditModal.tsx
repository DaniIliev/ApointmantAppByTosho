"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Plus, Trash, AlertCircle, Clock, History, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { Modal } from "@/components/customUIComponents/Modal";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";

import type { TimeRange } from "@/Global/Types/types";
import type { WorkHourEntry } from "../types";
import { useGetAffectedAppointments, useNotifyDayOff } from "@/hooks/queries/useScheduleNew";

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
  const [customMessage, setCustomMessage] = useState("");
  const [showAffectedModal, setShowAffectedModal] = useState(false);

  const formattedDate = editedData.date instanceof Date 
    ? format(editedData.date, "yyyy-MM-dd") 
    : editedData.date ? format(new Date(editedData.date), "yyyy-MM-dd") : "";

  // The modal might not have staffId directly available in dayData if it's not passed properly, 
  // but we can try to extract it if it was injected, or fallback to something else.
  // Actually, for the day off affected appointments we need staffId. We can pass it or fetch it.
  // We'll assume the parent could pass staffId, but if not we can use the current user if staff.
  // Let's add staffId to props later if needed, or get it from dayData.staffId
  const staffId = (editedData as any).staffId || null;
  const scheduleId = (editedData as any).scheduleId || null;

  const { data: affectedAppointments, isLoading: isLoadingAffected } = useGetAffectedAppointments(
    staffId, 
    scheduleId,
    formattedDate
  );

  const notifyDayOffMutation = useNotifyDayOff();

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

  const executeSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave(editedData);
      setShowAffectedModal(false);
    } catch (error: any) {
      console.error("Save failed:", error);
      setSaveError(error.message || t("Failed to save schedule day. Please try again."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (filteredAffected.length > 0) {
      setShowAffectedModal(true);
    } else {
      await executeSave();
    }
  };

  // ── Affected Appointments logic ──────────────────────

  const getAffectedAppointmentsList = () => {
    if (!affectedAppointments || affectedAppointments.length === 0) return [];
    if (editedData.isDayOff) return affectedAppointments;

    return affectedAppointments.filter((appt) => {
      const apptStart = format(new Date(appt.appointmentTime.start), "HH:mm");
      const apptEnd = format(new Date(appt.appointmentTime.end), "HH:mm");
      
      // Check outside work hours
      if (!editedData.workTime?.start || !editedData.workTime?.end) return true;
      if (apptStart < editedData.workTime.start || apptEnd > editedData.workTime.end) return true;

      // Check breaks
      for (const br of (editedData.breaks || [])) {
         if (!br.start || !br.end) continue;
         if (apptStart >= br.start && apptStart < br.end) return true;
         if (apptEnd > br.start && apptEnd <= br.end) return true;
         if (apptStart <= br.start && apptEnd >= br.end) return true;
      }
      
      return false;
    });
  };

  const filteredAffected = getAffectedAppointmentsList();

  const handleNotifyAndSave = async () => {
    if (filteredAffected.length === 0) return;
    try {
      const appointmentIds = filteredAffected.map((a) => a._id);
      await notifyDayOffMutation.mutateAsync({ appointmentIds, customMessage: customMessage || undefined });
      toast.success(t("Clients notified and appointments cancelled."));
      await executeSave();
    } catch (err: any) {
      toast.error(t("Failed to notify clients."));
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
      label={showAffectedModal ? t("Review Affected Appointments") : `${t("Edit")} ${editedData.day} ${dateLabel}`}
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setShowAffectedModal(false);
          onClose();
        }
      }}
    >
      {saveError && (
        <div className="mx-4 mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{saveError}</p>
        </div>
      )}

      {showAffectedModal ? (
        <>
        <div className="mx-4 my-4 p-4 rounded-xl border border-amber-200 bg-amber-50 shadow-sm">
          <p className="text-sm text-amber-900 mb-3 font-semibold">
             {t("You must notify the affected clients before saving these changes.")}
          </p>
          <p className="text-xs text-amber-800 mb-3">
            {t("{{count}} clients will be affected by this schedule change.", { count: filteredAffected.length })}
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto mb-4 border border-amber-200 rounded bg-white p-2">
            {filteredAffected.map((appt) => (
              <div key={appt._id} className="text-xs text-amber-900 bg-amber-50 p-2 rounded border border-amber-100">
                <strong>{appt.clientName}</strong> - {[appt.email, appt.clientPhone].filter(Boolean).join(" | ")} <br/>
                <Clock className="inline h-3 w-3 mr-1"/> {format(new Date(appt.appointmentTime.start), "HH:mm")}
              </div>
            ))}
          </div>
          <div className="mb-4">
            <label className="text-xs font-medium text-amber-900 block mb-1">
              {t("Message to clients (optional)")}
            </label>
            <textarea 
              className="w-full text-xs p-2 border border-amber-300 rounded bg-white text-amber-900"
              rows={3}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={t("Enter custom reason for cancellation...")}
            />
          </div>
        </div>
          <div className="flex gap-2 justify-center">
             <Button variant="outline" iconType='cancel' onClick={() => setShowAffectedModal(false)}>
                {t("Back")}
             </Button>
             <Button 
               onClick={handleNotifyAndSave}
               disabled={notifyDayOffMutation.isPending || isSaving}
             >
               <Mail className="h-4 w-4 mr-2"/>
               {notifyDayOffMutation.isPending || isSaving ? t("Processing...") : t("Notify Clients & Save")}
             </Button>
          </div>
          </>
      ) : (
        <>
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
        {!editedData.isDayOff && (
          <>
            <label className="text-sm font-medium leading-none block pt-2 mb-2">
              {t("Breaks")}
            </label>
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
          </>
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
      <div className="flex justify-center align-start gap-2 mb-6 mt-2">
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isSaving}
        >
          {isSaving ? t("Saving...") : t("Save")}
        </Button>
      </div>

      {/* History Section */}
      {((editedData as any).history?.length > 0 || (editedData as any).lastUpdated) && (
        <div className="mx-4 mb-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <h4 className="text-xs font-semibold text-muted-foreground flex items-center mb-2">
            <History className="h-3 w-3 mr-1" />
            {t("History")}
          </h4>
          {(editedData as any).lastUpdated && (
            <p className="text-[10px] text-muted-foreground mb-2">
              {t("Last Updated:")} {format(new Date((editedData as any).lastUpdated), "dd.MM.yyyy HH:mm")}
            </p>
          )}
          <div className="max-h-24 overflow-y-auto space-y-2 pr-2">
            {((editedData as any).history || []).slice().reverse().map((entry: any, i: number) => (
              <div key={i} className="text-[10px] text-muted-foreground bg-muted/20 p-2 rounded">
                <span className="font-medium text-foreground">{entry.updatedBy}</span> ({format(new Date(entry.updatedAt), "dd.MM.yyyy HH:mm")})
                <br/>
                {entry.changes}
              </div>
            ))}
          </div>
        </div>
      )}
        </>
      )}
    </Modal>
  );
};
