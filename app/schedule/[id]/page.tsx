"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useRouter } from "next/navigation";
import { usePageTitle } from "@/context/PageTitleContext";
import callApi from "@/app/Api/callApi";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react"; // Добавени икони за табовете
import { Button } from "@/components/ui/button";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import ScheduleCalendarView from "@/components/calendar/ScheduleCalendarView";
import { DailyScheduleEditModal } from "./DayleScheduleEditModal";
// ИМПОРТ ЗА НОВИЯ КАЛЕНДАРЕН ИЗГЛЕД

// Актуализирани типове за да отговарят на бекенд схемата
type TimeRange = {
  start: string;
  end: string;
};

type WorkHours = {
  _id: string;
  day: string;
  date: Date;
  isDayOff: boolean;
  workTime: TimeRange | null; // Променено на workTime обект
  breaks: TimeRange[]; // Променено на TimeRange[]
};
export default function StaffDailySchedulePage() {
  const params = useParams();
  const { t } = useTranslation();

  const scheduleId = params.id;
  const [dailyData, setDailyData] = useState<WorkHours[]>([]);
  const { setPageTitle } = usePageTitle();

  // =======================================================
  // НОВО СЪСТОЯНИЕ ЗА МОДАЛА
  // =======================================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dayToEdit, setDayToEdit] = useState<WorkHours | null>(null);

  // Функция за редактиране на един ден, която ще се подаде на календара
  const handleEditDay = (dayData: WorkHours) => {
    setDayToEdit(dayData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDayToEdit(null); // Изчистваме данните
  };

  // Обновена функция за запазване (сега приема само един обновен ден)
  const handleSaveDay = async (updatedDayData: WorkHours) => {
    try {
      // 1. Намираме индекса на обновения ден
      const index = dailyData.findIndex((d) => d._id === updatedDayData._id);

      if (index === -1) {
        toast.error(t("Error: Day not found for editing."));
        return;
      }

      // 2. Създаваме нов масив с обновените данни
      const newDailyData = [...dailyData];
      newDailyData[index] = updatedDayData;
      const dataToSend = {
        ...updatedDayData,
        date: updatedDayData.date.toISOString(),
      };

      await callApi(`/api/staff-schedules/${scheduleId}/details`, "PUT", {
        workHour: dataToSend,
      });
      setDailyData(newDailyData);
      closeModal();
      toast.success(t("Schedule day saved successfully!"));
    } catch (error) {
      toast.error(t("Failed to save schedule day."));
    }
  };

  useEffect(() => {
    const fetchDailySchedule = async () => {
      try {
        const data = await callApi(
          `/api/staff-schedules/${scheduleId}/details`,
          "GET",
        );
        // Обработка на данните, за да се гарантира, че workTime е обект
        const formattedData = data.map((item: any) => ({
          ...item,
          // Преобразуваме датата в Date обект за по-лесно форматиране във външните компоненти
          date: new Date(item.date),
          workTime: item.workTime || { start: "", end: "" },
          breaks: item.breaks || [],
        }));
        setDailyData(formattedData);

        if (formattedData.length > 0) {
          // Уверете се, че датите са сортирани за да получите правилните начална и крайна дата
          const sortedData = [...formattedData].sort(
            (a, b) => a.date.getTime() - b.date.getTime(),
          );

          const startDate = format(sortedData[0].date, "dd.MM.yyyy");
          const endDate = format(
            sortedData[sortedData.length - 1].date,
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
      } catch (error) {
        toast.error(t("Failed to load detailed schedule."));
      }
    };
    if (scheduleId) {
      fetchDailySchedule();
    }
  }, [setPageTitle, scheduleId]);

  return (
    <div>
      <ScheduleCalendarView dailyData={dailyData} onEditDay={handleEditDay} />
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
