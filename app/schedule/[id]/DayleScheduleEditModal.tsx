import { WorkHours } from "@/components/calendar/ScheduleCalendarView";
import { useCallback, useEffect, useState } from "react";
import { TimeRange } from "../page";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Trash2, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { format } from "date-fns";
import { Modal } from "@/components/customUIComponents/Modal";
import { useTranslation } from "react-i18next";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";

interface DailyScheduleEditModalProps {
  dayData: WorkHours;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: WorkHours) => Promise<void>;
}

export const DailyScheduleEditModal = ({
  dayData,
  isOpen,
  onClose,
  onSave,
}: DailyScheduleEditModalProps) => {
  const { t } = useTranslation();
  // Копие на данните за редактиране в рамките на модала
  const [editedData, setEditedData] = useState<WorkHours>(dayData);
  const [isSaving, setIsSaving] = useState(false);

  // Обновяване на локалния state, когато се смени dayData (отваряне на нов ден)
  useEffect(() => {
    setEditedData(dayData);
  }, [dayData]);

  const handleUpdate = useCallback((key: keyof WorkHours, value: any) => {
    setEditedData((prev) => {
      // Логика за WorkTime и Breaks, която поддържа isDayOff
      const updated = { ...prev, [key]: value };

      // Ако денят стане почивен, зануляваме работното време и почивките
      if (key === "isDayOff" && value === true) {
        updated.workTime = { start: "", end: "" };
        updated.breaks = [];
      }

      // Ако денят стане работен, осигуряваме workTime обект, ако липсва
      if (key === "isDayOff" && value === false && !updated.workTime) {
        updated.workTime = { start: "09:00", end: "17:00" }; // Примерни стойности
      }

      return updated;
    });
  }, []);

  const handleWorkTimeChange = (type: "start" | "end", value: string) => {
    handleUpdate("workTime", {
      ...(editedData.workTime || {}),
      [type]: value,
    } as TimeRange);
  };

  const handleBreakChange = (
    index: number,
    type: "start" | "end",
    value: string
  ) => {
    const updatedBreaks = [...editedData.breaks];
    updatedBreaks[index] = { ...updatedBreaks[index], [type]: value };
    handleUpdate("breaks", updatedBreaks);
  };

  const addBreak = () => {
    handleUpdate("breaks", [
      ...editedData.breaks,
      { start: "12:00", end: "13:00" },
    ]);
  };

  const removeBreak = (index: number) => {
    handleUpdate(
      "breaks",
      editedData.breaks.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    // Използваме dayData._id за да запазим промените само за този ден
    // В staffDailySchedulePage.js трябва да имплементираме логика за обновяване на един елемент
    await onSave(editedData); // onSave ще обнови dailyData и ще затвори модала
    setIsSaving(false);
  };

  return (
    <Modal
      label={`Редактиране на ${editedData.day} ${format(
        editedData.date,
        "dd.MM.yyyy"
      )}`}
      open={isOpen}
      onOpenChange={onClose}
    >
      <div className="grid gap-4 py-4">
        {/* Работно Време */}
        {!editedData.isDayOff && (
          <div className="flex items-center space-x-2">
            <LabeledInput
              type="time"
              value={editedData.workTime?.start || ""}
              onChange={(e) => handleWorkTimeChange("start", e.target.value)}
              label={"Начало"}
              id={"modal-workStart"}
            />
            <LabeledInput
              type="time"
              value={editedData.workTime?.end || ""}
              onChange={(e) => handleWorkTimeChange("end", e.target.value)}
              label={"Край"}
              id={"modal-workEnd"}
            />
          </div>
        )}

        {/* Почивки */}
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block pt-2">
          {t("Breaks (Max 3)")}
        </label>
        {!editedData.isDayOff && (
          <div className="space-y-2 ">
            {editedData.breaks.map((br, index) => (
              <div key={index} className="flex items-center space-x-2">
                <LabeledInput
                  type="time"
                  value={br.start}
                  onChange={(e) =>
                    handleBreakChange(index, "start", e.target.value)
                  }
                  label={t(`Break ${index + 1} Start`)}
                  id={`break${index + 1}Start`}
                />
                <LabeledInput
                  type="time"
                  value={br.end}
                  onChange={(e) =>
                    handleBreakChange(index, "end", e.target.value)
                  }
                  label={t(`Break ${index + 1} End`)}
                  id={`break${index + 1}End`}
                />
                <CustomTooltip
                  onClick={() => removeBreak(index)}
                  tooltipText={t("Delete Brake")}
                  icon={<Trash color="red" />}
                />
                <CustomTooltip
                  onClick={() => addBreak()}
                  tooltipText={t("Add Brake")}
                  icon={<Plus />}
                />
              </div>
            ))}
            {editedData.breaks.length == 0 && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addBreak}
                  className="mt-1"
                  iconType="add"
                >
                  {t("Add")}
                </Button>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center gap-2 ">
          <span className="text-sm font-medium">Почивен ден</span>
          <Switch
            checked={editedData.isDayOff}
            onCheckedChange={(checked) => handleUpdate("isDayOff", checked)}
          />
        </div>
      </div>

      <div className="flex justify-center align-start gap-2">
        <Button
          type="submit"
          iconType="save"
          onClick={handleSubmit}
          disabled={isSaving}
        >
          {isSaving ? "Запазване..." : "Запази"}
        </Button>
      </div>
    </Modal>
  );
};
