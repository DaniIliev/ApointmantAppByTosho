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

  const handleSave = async (updatedData: WorkHours[]) => {
    try {
      // Премахваме Date обектите преди изпращане, ако API очаква стринг
      const dataToSend = updatedData.map((item) => ({
        ...item,
        date: item.date.toISOString(),
      }));

      await callApi(`/api/staff-schedules/${scheduleId}/details`, "PUT", {
        workHours: dataToSend,
      });
      // Обновяваме state с новите данни (които вече имат Date обекти)
      setDailyData(updatedData);
      toast.success("Графикът е запазен успешно!");
    } catch (error) {
      toast.error("Неуспешно запазване на графика.");
    }
  };

  const columns: Column<WorkHours>[] = [
    {
      accessorKey: "day",
      header: "Ден",
      cell: ({ row }) => <span>{row.original.day}</span>,
    },
    {
      accessorKey: "date",
      header: "Дата",
      cell: ({ row }) => <span>{format(row.original.date, "dd.MM.yyyy")}</span>,
    },
    {
      accessorKey: "isDayOff",
      header: "Работен/Почивен",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.isDayOff ? "Почивен" : "Работен"}
        </span>
      ),
      editableCell: ({ row }, onUpdate) => (
        <Switch
          checked={!row.original.isDayOff}
          onCheckedChange={(checked) => onUpdate("isDayOff", !checked)}
        />
      ),
    },
    {
      accessorKey: "workTime",
      header: "Работно време",
      cell: ({ row }) => (
        <span>
          {row.original.isDayOff
            ? "-"
            : `${row.original.workTime?.start} - ${row.original.workTime?.end}`}
        </span>
      ),
      editableCell: ({ row }, onUpdate) => (
        <div className="flex flex-col space-y-2">
          <LabeledInput
            type="time"
            value={row.original.workTime?.start || ""}
            onChange={(e) => {
              const updatedWorkTime = {
                ...(row.original.workTime || {}),
                start: e.target.value,
              };
              onUpdate("workTime", updatedWorkTime);
            }}
            label={"Начало"}
            id={"workStart"}
          />
          <LabeledInput
            type="time"
            value={row.original.workTime?.end || ""}
            onChange={(e) => {
              const updatedWorkTime = {
                ...(row.original.workTime || {}),
                end: e.target.value,
              };
              onUpdate("workTime", updatedWorkTime);
            }}
            label={"Край"}
            id={"workEnd"}
          />
        </div>
      ),
    },
    // Колона за почивките
    {
      accessorKey: "breaks",
      header: "Почивки",
      cell: ({ row }) => (
        <div className="flex flex-col space-y-1">
          {row.original.breaks.map((br, index) => (
            <span key={index} className="text-sm">
              {br.start} - {br.end}
            </span>
          ))}
        </div>
      ),
      editableCell: ({ row }, onUpdate) => (
        <div className="flex flex-col space-y-2">
          {row.original.breaks.map((br, index) => (
            <div key={index} className="flex items-center space-x-2">
              <LabeledInput
                type="time"
                value={br.start}
                onChange={(e) => {
                  const updatedBreaks = [...row.original.breaks];
                  updatedBreaks[index].start = e.target.value;
                  onUpdate("breaks", updatedBreaks);
                }}
                label={""}
                id={""}
              />
              <LabeledInput
                type="time"
                value={br.end}
                onChange={(e) => {
                  const updatedBreaks = [...row.original.breaks];
                  updatedBreaks[index].end = e.target.value;
                  onUpdate("breaks", updatedBreaks);
                }}
                label={""}
                id={""}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const updatedBreaks = row.original.breaks.filter(
                    (_, i) => i !== index
                  );
                  onUpdate("breaks", updatedBreaks);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const updatedBreaks = [
                ...row.original.breaks,
                {
                  start: "12:00",
                  end: "13:00",
                },
              ];
              onUpdate("breaks", updatedBreaks);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Добави почивка
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="absolute top-2 right-4">
        <CustomTooltip
          onClick={() => router.back()}
          tooltipText="Go Back"
          icon={<ArrowLeft />}
        />
      </div>

      {/* ИНТЕГРАЦИЯТА НА ТАБОВЕТЕ ЗАПОЧВА ТУК */}
      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table" className="flex items-center gap-2">
            <ListIcon className="h-4 w-4" /> Табличен Изглед
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" /> Календарен Изглед
          </TabsTrigger>
        </TabsList>

        {/* Табличен Изглед (Вашата съществуваща таблица) */}
        <TabsContent value="table">
          <GenericTable
            data={dailyData}
            columns={columns}
            editable
            onSave={handleSave}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <ScheduleCalendarView
            dailyData={dailyData}
            onEditDay={() => console.log("edit day")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { usePageTitle } from "@/context/PageTitleContext";
// import { useRightNav } from "@/context/RightNavContext";
// import { GenericTable, Column } from "@/components/GenericTable/GenericTable";
// import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
// import { Switch } from "@/components/ui/switch";
// import callApi from "@/app/Api/callApi";
// import { toast } from "sonner";
// import { format } from "date-fns";
// import { ArrowLeft, Plus, Trash2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";

// // Актуализирани типове за да отговарят на бекенд схемата
// type TimeRange = {
//   start: string;
//   end: string;
// };

// type WorkHours = {
//   _id: string;
//   day: string;
//   date: Date;
//   isDayOff: boolean;
//   workTime: TimeRange | null; // Променено на workTime обект
//   breaks: TimeRange[]; // Променено на TimeRange[]
// };

// export default function StaffDailySchedulePage() {
//   const router = useRouter();
//   const params = useParams();

//   const scheduleId = params.id;
//   console.log("scheduleId", scheduleId);
//   const [dailyData, setDailyData] = useState<WorkHours[]>([]);
//   const { setPageTitle } = usePageTitle();

//   useEffect(() => {
//     const fetchDailySchedule = async () => {
//       try {
//         const data = await callApi(
//           `/api/staff-schedules/${scheduleId}/details`,
//           "GET"
//         );
//         console.log("data", data);
//         // Обработка на данните, за да се гарантира, че workTime е обект
//         const formattedData = data.map((item: any) => ({
//           ...item,
//           workTime: item.workTime || { start: "", end: "" },
//           breaks: item.breaks || [],
//         }));
//         setDailyData(formattedData);

//         if (formattedData.length > 0) {
//           const startDate = format(
//             new Date(formattedData[0].date),
//             "dd.MM.yyyy"
//           );
//           const endDate = format(
//             new Date(formattedData[formattedData.length - 1].date),
//             "dd.MM.yyyy"
//           );
//           setPageTitle(`График за период: ${startDate} - ${endDate}`);
//         } else {
//           setPageTitle("График");
//         }
//       } catch (error) {
//         toast.error("Неуспешно зареждане на детайлния график.");
//       }
//     };
//     if (scheduleId) {
//       fetchDailySchedule();
//     }
//   }, [setPageTitle, scheduleId]);

//   const handleSave = async (updatedData: WorkHours[]) => {
//     try {
//       await callApi(`/api/staff-schedules/${scheduleId}/details`, "PUT", {
//         workHours: updatedData,
//       });
//       setDailyData(updatedData);
//       toast.success("Графикът е запазен успешно!");
//     } catch (error) {
//       toast.error("Неуспешно запазване на графика.");
//     }
//   };

//   const columns: Column<WorkHours>[] = [
//     {
//       accessorKey: "day",
//       header: "Ден",
//       cell: ({ row }) => <span>{row.original.day}</span>,
//     },
//     {
//       accessorKey: "date",
//       header: "Дата",
//       cell: ({ row }) => <span>{format(row.original.date, "dd.MM.yyyy")}</span>,
//     },
//     {
//       accessorKey: "isDayOff",
//       header: "Работен/Почивен",
//       cell: ({ row }) => (
//         <span className="font-medium">
//           {row.original.isDayOff ? "Почивен" : "Работен"}
//         </span>
//       ),
//       editableCell: ({ row }, onUpdate) => (
//         <Switch
//           checked={!row.original.isDayOff}
//           onCheckedChange={(checked) => onUpdate("isDayOff", !checked)}
//         />
//       ),
//     },
//     {
//       accessorKey: "workTime",
//       header: "Работно време",
//       cell: ({ row }) => (
//         <span>
//           {row.original.isDayOff
//             ? "-"
//             : `${row.original.workTime?.start} - ${row.original.workTime?.end}`}
//         </span>
//       ),
//       editableCell: ({ row }, onUpdate) => (
//         <div className="flex flex-col space-y-2">
//           <LabeledInput
//             type="time"
//             value={row.original.workTime?.start || ""}
//             onChange={(e) => {
//               const updatedWorkTime = {
//                 ...(row.original.workTime || {}),
//                 start: e.target.value,
//               };
//               onUpdate("workTime", updatedWorkTime);
//             }}
//             label={"Начало"}
//             id={"workStart"}
//           />
//           <LabeledInput
//             type="time"
//             value={row.original.workTime?.end || ""}
//             onChange={(e) => {
//               const updatedWorkTime = {
//                 ...(row.original.workTime || {}),
//                 end: e.target.value,
//               };
//               onUpdate("workTime", updatedWorkTime);
//             }}
//             label={"Край"}
//             id={"workEnd"}
//           />
//         </div>
//       ),
//     },
//     // Колона за почивките
//     {
//       accessorKey: "breaks",
//       header: "Почивки",
//       cell: ({ row }) => (
//         <div className="flex flex-col space-y-1">
//           {row.original.breaks.map((br, index) => (
//             <span key={index} className="text-sm">
//               {br.start} - {br.end}
//             </span>
//           ))}
//         </div>
//       ),
//       editableCell: ({ row }, onUpdate) => (
//         <div className="flex flex-col space-y-2">
//           {row.original.breaks.map((br, index) => (
//             <div key={index} className="flex items-center space-x-2">
//               <LabeledInput
//                 type="time"
//                 value={br.start}
//                 onChange={(e) => {
//                   const updatedBreaks = [...row.original.breaks];
//                   updatedBreaks[index].start = e.target.value;
//                   onUpdate("breaks", updatedBreaks);
//                 }}
//                 label={""}
//                 id={""}
//               />
//               <LabeledInput
//                 type="time"
//                 value={br.end}
//                 onChange={(e) => {
//                   const updatedBreaks = [...row.original.breaks];
//                   updatedBreaks[index].end = e.target.value;
//                   onUpdate("breaks", updatedBreaks);
//                 }}
//                 label={""}
//                 id={""}
//               />
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => {
//                   const updatedBreaks = row.original.breaks.filter(
//                     (_, i) => i !== index
//                   );
//                   onUpdate("breaks", updatedBreaks);
//                 }}
//               >
//                 <Trash2 className="h-4 w-4 text-destructive" />
//               </Button>
//             </div>
//           ))}
//           <Button
//             type="button"
//             variant="outline"
//             size="sm"
//             onClick={() => {
//               const updatedBreaks = [
//                 ...row.original.breaks,
//                 {
//                   _id: Date.now().toString(),
//                   start: "12:00",
//                   end: "13:00",
//                 },
//               ];
//               onUpdate("breaks", updatedBreaks);
//             }}
//           >
//             <Plus className="mr-2 h-4 w-4" /> Добави почивка
//           </Button>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div>
//       <div className="absolute top-2 right-4">
//         <CustomTooltip
//           onClick={() => router.back()}
//           tooltipText="Go Back"
//           icon={<ArrowLeft />}
//         />
//       </div>
//       <GenericTable
//         data={dailyData}
//         columns={columns}
//         editable
//         onSave={handleSave}
//       />
//     </div>
//   );
// }
