// components/customUIComponents/ScheduleModal.tsx

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/customUIComponents/Modal";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash } from "lucide-react";
import { Schedule, TimeRange } from "./page";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";

// Използваме 'Partial<Schedule>' за да може 'schedule' да е null или да липсват полета при създаване
type ScheduleModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (scheduleData: Schedule) => void;
  schedule: Schedule | null; // За създаване: null. За редакция: текущият график.
};

// Начално състояние за нов график
const initialNewSchedule: Schedule = {
  _id: "",
  startDate: "",
  endDate: "",
  workTime: { start: null, end: null },
  isDayOff: {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: true,
    sunday: true,
  },
  break1: { start: null, end: null },
  break2: { start: null, end: null },
  break3: { start: null, end: null },
};

// Функция за филтриране на празните почивки за показване
const getActiveBreaks = (schedule: Schedule): TimeRange[] => {
  const breaks = [schedule.break1, schedule.break2, schedule.break3];
  // Връща само тези, които имат поне 'start' или 'end' стойност, или поне един елемент, ако всички са празни (за да има поне един ред за въвеждане)
  const active = breaks.filter((b) => b.start || b.end);
  return active.length > 0 ? active : [{ start: null, end: null }];
};

export const ScheduleModal = ({
  isOpen,
  onOpenChange,
  onSave,
  schedule,
}: ScheduleModalProps) => {
  const { t } = useTranslation();
  const [localSchedule, setLocalSchedule] =
    useState<Schedule>(initialNewSchedule);
  const [breaks, setBreaks] = useState<TimeRange[]>([
    initialNewSchedule.break1,
  ]);

  const isEditMode = !!schedule?._id;
  console.log("shedule", schedule);
  useEffect(() => {
    if (isOpen) {
      if (schedule) {
        const formattedSchedule: Schedule = {
          ...schedule,
          startDate: schedule.startDate ? schedule.startDate.split("T")[0] : "",
          endDate: schedule.endDate ? schedule.endDate.split("T")[0] : "",
        };

        setLocalSchedule(formattedSchedule);
        setBreaks(getActiveBreaks(schedule));
      } else {
        setLocalSchedule(initialNewSchedule);
        setBreaks([{ start: null, end: null }]);
      }
    }
  }, [isOpen, schedule]);

  const handleInputChange = (field: keyof Schedule, value: any) => {
    setLocalSchedule((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWorkTimeChange = (type: "start" | "end", value: string) => {
    setLocalSchedule((prev) => ({
      ...prev,
      workTime: { ...prev.workTime, [type]: value },
    }));
  };

  const handleBreakChange = (
    index: number,
    type: "start" | "end",
    value: string
  ) => {
    const newBreaks = [...breaks];
    newBreaks[index] = { ...newBreaks[index], [type]: value };
    setBreaks(newBreaks);
  };

  const addBreak = () => {
    if (breaks.length < 3) {
      setBreaks([...breaks, { start: null, end: null }]);
    }
  };

  const removeBreak = (index: number) => {
    if (breaks.length) {
      const newBreaks = breaks.filter((_, i) => i !== index);
      setBreaks(newBreaks);
    } else {
      // Ако остава само една, просто я изчисти
      setBreaks([{ start: null, end: null }]);
    }
  };

  const handleLocalSave = () => {
    const finalBreaks = breaks.slice(0, 3);
    // const updatedSchedule: Schedule = {
    //   ...localSchedule,
    //   break1: finalBreaks[0] || { start: null, end: null },
    //   break2: finalBreaks[1] || { start: null, end: null },
    //   break3: finalBreaks[2] || { start: null, end: null },
    // };

    const fullSchedule: Schedule = {
      ...localSchedule,
      break1: finalBreaks[0] || { start: null, end: null },
      break2: finalBreaks[1] || { start: null, end: null },
      break3: finalBreaks[2] || { start: null, end: null },
    };

    let scheduleToSend;

    if (!isEditMode) {
      // При създаване: Използваме деструктуриране, за да премахнем _id.
      // 'rest' ще съдържа всички свойства на fullSchedule освен _id.
      const { _id, ...rest } = fullSchedule;
      scheduleToSend = rest;
    } else {
      // При редактиране: Изпращаме целия обект, включително _id.
      scheduleToSend = fullSchedule;
    }
    onSave(scheduleToSend as Schedule);
    onOpenChange(false); // Затвори модала след запазване
  };

  return (
    <Modal
      label={t(isEditMode ? "Edit Schedule" : "Create New Schedule")}
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <div className="space-y-3 p-2">
        {/* Date Period */}
        <div className="flex space-x-2">
          <LabeledInput
            type="date"
            value={localSchedule.startDate}
            onChange={(e) => handleInputChange("startDate", e.target.value)}
            label={t("Start Date")}
            id="startDate"
          />
          <LabeledInput
            type="date"
            value={localSchedule.endDate}
            onChange={(e) => handleInputChange("endDate", e.target.value)}
            label={t("End Date")}
            id="endDate"
          />
        </div>

        {/* Work Time */}
        <div className="flex space-x-2">
          <LabeledInput
            type="time"
            value={localSchedule.workTime.start || ""}
            onChange={(e) => handleWorkTimeChange("start", e.target.value)}
            label={t("Work Start")}
            id="workStart"
          />
          <LabeledInput
            type="time"
            value={localSchedule.workTime.end || ""}
            onChange={(e) => handleWorkTimeChange("end", e.target.value)}
            label={t("Work End")}
            id="workEnd"
          />
        </div>

        {/* Breaks - Dynamic */}
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block pt-2">
          {t("Breaks (Max 3)")}
        </label>
        {breaks.map((_break, index) => (
          <div key={index} className="flex space-x-2 items-end">
            <LabeledInput
              type="time"
              value={_break.start || ""}
              onChange={(e) =>
                handleBreakChange(index, "start", e.target.value)
              }
              label={t(`Break ${index + 1} Start`)}
              id={`break${index + 1}Start`}
              className="flex-grow"
            />
            <LabeledInput
              type="time"
              value={_break.end || ""}
              onChange={(e) => handleBreakChange(index, "end", e.target.value)}
              label={t(`Break ${index + 1} End`)}
              id={`break${index + 1}End`}
              className="flex-grow"
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

        {breaks.length == 0 && (
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

        {/* Days off */}
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block pt-2">
          {t("Days Off")}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.keys(localSchedule.isDayOff).map((day) => (
            <label key={day} className="flex items-center space-x-2">
              <Checkbox
                checked={
                  localSchedule.isDayOff[
                    day as keyof typeof localSchedule.isDayOff
                  ]
                }
                onCheckedChange={(checked) =>
                  setLocalSchedule({
                    ...localSchedule,
                    isDayOff: {
                      ...localSchedule.isDayOff,
                      [day]: Boolean(checked),
                    },
                  })
                }
              />
              <span>{t(day.charAt(0).toUpperCase() + day.slice(1))}</span>
            </label>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("Cancel")}
          </Button>
          <Button onClick={handleLocalSave}>{t("Save")}</Button>
        </div>
      </div>
    </Modal>
  );
};
