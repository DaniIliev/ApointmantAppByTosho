"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";

import { usePageTitle } from "@/context/PageTitleContext";
import callApi from "@/app/Api/callApi";
import ScheduleCalendarView from "@/components/calendar/ScheduleCalendarView";

import type { WorkHourEntry } from "../types";
import { DailyScheduleEditModal } from "./DailyScheduleEditModal";


// ─── Page component ──────────────────────────────────────

export default function ScheduleDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const routeId = String(params.id || "");
  const isStaffCalendarMode = routeId.startsWith("staff-");
  const staffId = isStaffCalendarMode ? routeId.replace("staff-", "") : null;
  const locationId = searchParams.get("locationId");

  const [dailyData, setDailyData] = useState<WorkHourEntry[]>([]);
  const { setPageTitle } = usePageTitle();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dayToEdit, setDayToEdit] = useState<WorkHourEntry | null>(null);

  // ── Handlers ────────────────────────────────────────

  const handleEditDay = (dayData: WorkHourEntry) => {
    setDayToEdit(dayData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDayToEdit(null);
  };

  const handleSaveDay = async (updatedDayData: WorkHourEntry) => {
    try {
      const targetScheduleId = updatedDayData.scheduleId || routeId;
      if (!targetScheduleId) {
        toast.error(t("Error: Schedule is missing for this day."));
        return;
      }

      const index = dailyData.findIndex((d) => d._id === updatedDayData._id);
      if (index === -1) {
        toast.error(t("Error: Day not found for editing."));
        return;
      }

      const newDailyData = [...dailyData];
      newDailyData[index] = updatedDayData;

      const dataToSend = {
        ...updatedDayData,
        date:
          updatedDayData.date instanceof Date
            ? updatedDayData.date.toISOString()
            : updatedDayData.date,
      };

      await callApi(
        `/api/staff-schedules/${targetScheduleId}/details`,
        "PUT",
        { workHour: dataToSend },
      );

      setDailyData(newDailyData);
      closeModal();
      toast.success(t("Schedule day saved successfully!"));
    } catch (error) {
      toast.error(t("Failed to save schedule day."));
      throw error;
    }
  };

  // ── Data fetching ───────────────────────────────────

  useEffect(() => {
    const fetchDailySchedule = async () => {
      try {
        let formattedData: WorkHourEntry[] = [];

        if (isStaffCalendarMode && staffId) {
          const query = new URLSearchParams();
          if (locationId) query.set("locationId", locationId);

          const data = await callApi(
            `/api/staff-schedules/details/by-staff/${staffId}${query.toString() ? `?${query.toString()}` : ""}`,
            "GET",
          );

          formattedData = (Array.isArray(data) ? data : [])
            .map((item: any) => ({
              ...item,
              date: new Date(item.date),
              workTime: item.workTime || { start: null, end: null },
              breaks: Array.isArray(item.breaks) ? item.breaks : [],
              scheduleId: item.scheduleId,
            }))
            .sort(
              (a: WorkHourEntry, b: WorkHourEntry) =>
                new Date(a.date).getTime() - new Date(b.date).getTime(),
            );
        } else {
          const data = await callApi(
            `/api/staff-schedules/${routeId}/details`,
            "GET",
          );
          formattedData = (Array.isArray(data) ? data : []).map(
            (item: any) => ({
              ...item,
              date: new Date(item.date),
              workTime: item.workTime || { start: null, end: null },
              breaks: Array.isArray(item.breaks) ? item.breaks : [],
              scheduleId: routeId,
            }),
          );
        }

        setDailyData(formattedData);

        if (formattedData.length > 0) {
          const sortedData = [...formattedData].sort(
            (a, b) =>
              new Date(a.date).getTime() - new Date(b.date).getTime(),
          );
          const startDate = format(
            new Date(sortedData[0].date),
            "dd.MM.yyyy",
          );
          const endDate = format(
            new Date(sortedData[sortedData.length - 1].date),
            "dd.MM.yyyy",
          );
          setPageTitle(
            t("Schedule for period: {{start}} - {{end}}", {
              start: startDate,
              end: endDate,
            }),
          );
        } else {
          setPageTitle(t("Schedule"));
        }
      } catch {
        toast.error(t("Failed to load detailed schedule."));
      }
    };

    if (routeId) {
      fetchDailySchedule();
    }
  }, [setPageTitle, routeId, isStaffCalendarMode, staffId, locationId, t]);

  // ── Render ──────────────────────────────────────────

  return (
    <div>
      <ScheduleCalendarView
        dailyData={dailyData as any}
        onEditDay={handleEditDay as any}
      />
      {dayToEdit && (
        <DailyScheduleEditModal
          dayData={dayToEdit}
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleSaveDay}
        />
      )}
    </div>
  );
}
