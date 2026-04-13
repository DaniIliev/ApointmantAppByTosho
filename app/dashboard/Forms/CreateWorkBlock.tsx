"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/customUIComponents/Modal";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import { TimeRangePicker } from "@/components/customUIComponents/TimeRangePicker";
import { Button } from "@/components/ui/button";
import callApi from "@/app/Api/callApi";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "sonner";

type StaffOption = {
  _id: string;
  firstName: string;
  lastName: string;
};

export type WorkBlockFormData = {
  title: string;
  date: string;
  durationMinutes: string;
  notes: string;
  staffId: string;
};

type CreateWorkBlockProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId?: string;
  locationId?: string;
  onCreated: (appointment: any) => void;
};

const initialFormData: WorkBlockFormData = {
  title: "",
  date: "",
  durationMinutes: "60",
  notes: "",
  staffId: "",
};

type TimeRangeValue = {
  startTime: string | null;
  endTime: string | null;
};

const toMinutes = (timeValue: string) => {
  const [hours, minutes] = timeValue.split(":").map(Number);
  return hours * 60 + minutes;
};

const toTimeString = (totalMinutes: number) => {
  const minutesInDay = 24 * 60;
  const normalized =
    ((totalMinutes % minutesInDay) + minutesInDay) % minutesInDay;
  const hours = String(Math.floor(normalized / 60)).padStart(2, "0");
  const minutes = String(normalized % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const getDurationFromRange = (startTime: string, endTime: string) => {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  if (end > start) return end - start;
  return end + 24 * 60 - start;
};

const getEndFromStartAndDuration = (
  startTime: string,
  durationMinutes: number,
) => {
  return toTimeString(toMinutes(startTime) + durationMinutes);
};

export default function CreateWorkBlock({
  open,
  onOpenChange,
  businessId,
  locationId,
  onCreated,
}: CreateWorkBlockProps) {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [staffMembers, setStaffMembers] = useState<StaffOption[]>([]);
  const [formData, setFormData] = useState<WorkBlockFormData>(initialFormData);
  const [timeRange, setTimeRange] = useState<TimeRangeValue>({
    startTime: null,
    endTime: null,
  });

  useEffect(() => {
    if (!open) {
      setFormData(initialFormData);
      setStaffMembers([]);
      setTimeRange({ startTime: null, endTime: null });
      return;
    }

    const fetchStaff = async () => {
      if (!businessId) return;
      try {
        const staffList = await callApi(
          `/api/staff/staff-list?businessId=${businessId}&locationId=${locationId || ""}`,
          "GET",
        );
        setStaffMembers(staffList);
        if (!formData.staffId && user?._id) {
          setFormData((prev) => ({ ...prev, staffId: user._id }));
        }
      } catch (error) {
        console.error("Failed to fetch staff members:", error);
      }
    };

    void fetchStaff();
  }, [open, businessId, locationId, user?._id]);

  const handleTimeRangeChange = (nextValue: TimeRangeValue) => {
    setTimeRange(nextValue);

    if (nextValue.startTime && nextValue.endTime) {
      const computedDuration = getDurationFromRange(
        nextValue.startTime,
        nextValue.endTime,
      );
      setFormData((prev) => ({
        ...prev,
        durationMinutes: String(computedDuration),
      }));
      return;
    }

    if (nextValue.startTime && !nextValue.endTime) {
      const currentDuration = Number(formData.durationMinutes);
      if (currentDuration > 0) {
        setTimeRange({
          startTime: nextValue.startTime,
          endTime: getEndFromStartAndDuration(
            nextValue.startTime,
            currentDuration,
          ),
        });
      }
    }
  };

  const handleDurationChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      durationMinutes: value,
    }));

    const parsedDuration = Number(value);
    if (timeRange.startTime && parsedDuration > 0) {
      setTimeRange((prev) => ({
        ...prev,
        endTime: getEndFromStartAndDuration(
          timeRange.startTime!,
          parsedDuration,
        ),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const startDate = formData.date;
    const startTime = timeRange.startTime;
    const endTime = timeRange.endTime;
    let durationMinutes = Number(formData.durationMinutes);

    if ((!durationMinutes || durationMinutes <= 0) && startTime && endTime) {
      durationMinutes = getDurationFromRange(startTime, endTime);
    }

    if (
      !businessId ||
      !formData.staffId ||
      !startDate ||
      !startTime ||
      !durationMinutes
    ) {
      toast.error(t("Please fill all required fields"));
      return;
    }

    if (durationMinutes <= 0 || Number.isNaN(durationMinutes)) {
      toast.error(t("Please enter a valid duration"));
      return;
    }

    setIsSubmitting(true);
    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);

      const created = await callApi("/api/appointment/work-block", "POST", {
        business: businessId,
        staff: formData.staffId,
        dateTime: startDateTime.toISOString(),
        durationMinutes,
        title: formData.title || t("Work block"),
        notes: formData.notes,
        locationId,
      });

      onCreated(created);
      onOpenChange(false);
      toast.success(t("Work block created successfully"));
      setFormData(initialFormData);
      setTimeRange({ startTime: null, endTime: null });
    } catch (error) {
      console.error("Failed to create work block:", error);
      toast.error(t("Failed to create work block. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      label={t("Create Work Block")}
      open={open}
      onOpenChange={onOpenChange}
      width="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-2">
        <LabeledInput
          id="title"
          label={t("Title")}
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder={t("e.g. Team meeting")}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LabeledInput
            id="date"
            type="date"
            label={t("Date")}
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
            required
          />

          <TimeRangePicker
            label={t("Start / End time")}
            value={timeRange}
            onChange={handleTimeRangeChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <LabeledInput
              id="durationMinutes"
              type="number"
              label={t("Duration (minutes)")}
              value={formData.durationMinutes}
              onChange={(e) => handleDurationChange(e.target.value)}
              min="1"
              required
            />
            {timeRange.startTime && (
              <p className="text-xs text-muted-foreground px-1">
                {t("End time")}: {timeRange.endTime ?? "--:--"}
              </p>
            )}
          </div>

          <LabeledSelect
            id="staffId"
            label={t("Staff")}
            value={formData.staffId}
            onValueChange={(val) =>
              setFormData((prev) => ({ ...prev, staffId: val }))
            }
            placeholder={t("Select staff")}
            options={staffMembers.map((staff) => ({
              id: staff._id,
              name: `${staff.firstName} ${staff.lastName}`,
            }))}
          />
        </div>

        <LabeledInput
          id="notes"
          label={t("Notes")}
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          placeholder={t("Optional notes")}
          rows={3}
        />

        <div className="flex justify-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            iconType="cancel"
          >
            {t("Cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting} iconType="save">
            {isSubmitting ? t("Saving...") : t("Create")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
