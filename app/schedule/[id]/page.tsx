// staffDailySchedulePage.js

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePageTitle } from "@/context/PageTitleContext";
import { useRightNav } from "@/context/RightNavContext";
import { GenericTable, Column } from "@/components/GenericTable/GenericTable";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { Switch } from "@/components/ui/switch";
import callApi from "@/app/Api/callApi";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft, Plus, Trash2, ListIcon, CalendarIcon } from "lucide-react"; // Добавени икони за табовете
import { Button } from "@/components/ui/button";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // ИМПОРТ ЗА ТАБОВЕ
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
  const router = useRouter();
  const params = useParams();

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
        toast.error("Грешка: Денят за редактиране не е намерен.");
        return;
      }

      // 2. Създаваме нов масив с обновените данни
      const newDailyData = [...dailyData];
      newDailyData[index] = updatedDayData;
      const dataToSend = newDailyData.map((item) => ({
        ...item,
        date: item.date.toISOString(),
      }));

      await callApi(`/api/staff-schedules/${scheduleId}/details`, "PUT", {
        workHours: dataToSend,
      });
      setDailyData(newDailyData);
      closeModal();
      toast.success("Денят от графика е запазен успешно!");
    } catch (error) {
      toast.error("Неуспешно запазване на деня от графика.");
    }
  };

  useEffect(() => {
    const fetchDailySchedule = async () => {
      try {
        const data = await callApi(
          `/api/staff-schedules/${scheduleId}/details`,
          "GET"
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
            (a, b) => a.date.getTime() - b.date.getTime()
          );

          const startDate = format(sortedData[0].date, "dd.MM.yyyy");
          const endDate = format(
            sortedData[sortedData.length - 1].date,
            "dd.MM.yyyy"
          );
          setPageTitle(`График за период: ${startDate} - ${endDate}`);
        } else {
          setPageTitle("График");
        }
      } catch (error) {
        toast.error("Неуспешно зареждане на детайлния график.");
      }
    };
    if (scheduleId) {
      fetchDailySchedule();
    }
  }, [setPageTitle, scheduleId]);

  return (
    <div className="space-y-4">
      <div className="absolute top-2 right-4">
        <CustomTooltip
          onClick={() => router.back()}
          tooltipText="Go Back"
          icon={<ArrowLeft />}
        />
      </div>
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
