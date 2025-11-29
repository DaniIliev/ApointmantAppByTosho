// components/customUIComponents/ScheduleModal.tsx

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/customUIComponents/Modal";
// import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { DateRangePicker } from "@/components/customUIComponents/DateRangePicker";
import { TimeRangePicker } from "@/components/customUIComponents/TimeRangePicker";
// import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
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

  // Removed unused handleInputChange

  // Removed unused handleWorkTimeChange

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
      scheduleToSend = (({ _id, ...rest }) => rest)(fullSchedule);
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
      autoDetectDirty
      onConfirmSave={handleLocalSave}
    >
      <div className="space-y-3 p-2">
        {/* <div className="flex flex-col gap-2">
         */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DateRangePicker
            value={{
              startDate: localSchedule.startDate,
              endDate: localSchedule.endDate,
            }}
            onChange={({ startDate, endDate }) =>
              setLocalSchedule((prev) => ({
                ...prev,
                startDate: startDate || "",
                endDate: endDate || "",
              }))
            }
          />

          {/* Work Time */}
          <TimeRangePicker
            value={{
              startTime: localSchedule.workTime.start,
              endTime: localSchedule.workTime.end,
            }}
            onChange={({ startTime, endTime }) =>
              setLocalSchedule((prev) => ({
                ...prev,
                workTime: { start: startTime, end: endTime },
              }))
            }
          />
        </div>

        {/* Breaks - Dynamic */}
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block pt-2">
          {t("Breaks (Max 3)")}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {breaks.map((_break, index) => (
            <div key={index} className="flex flex-row gap-2 items-end">
              <TimeRangePicker
                value={{ startTime: _break.start, endTime: _break.end }}
                onChange={({ startTime }) =>
                  handleBreakChange(index, "start", startTime || "")
                }
              />
              <div className="flex gap-2">
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
            </div>
          ))}
        </div>

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
        <div className="flex items-center justify-center gap-0.5 border border-primary rounded-lg overflow-hidden bg-white dark:bg-background mb-2">
          {(
            [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ] as Array<keyof typeof localSchedule.isDayOff>
          ).map((key) => (
            <button
              key={key}
              type="button"
              className={[
                "flex-1 px-3 py-2 text-sm font-semibold transition-colors focus:outline-none",
                localSchedule.isDayOff[key]
                  ? "bg-primary text-white"
                  : "bg-transparent text-foreground hover:bg-primary/10",
                4,
              ].join(" ")}
              onClick={() =>
                setLocalSchedule((prev) => ({
                  ...prev,
                  isDayOff: {
                    ...prev.isDayOff,
                    [key]: !prev.isDayOff[key],
                  },
                }))
              }
            >
              {t(key.charAt(0).toUpperCase() + key.slice(1, 2)) +
                key.slice(2, 3)}
            </button>
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
