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
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";

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
  console.log("scheduleId", scheduleId);
  const [dailyData, setDailyData] = useState<WorkHours[]>([]);
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    const fetchDailySchedule = async () => {
      try {
        const data = await callApi(
          `/api/staff-schedules/${scheduleId}/details`,
          "GET"
        );
        console.log("data", data);
        // Обработка на данните, за да се гарантира, че workTime е обект
        const formattedData = data.map((item: any) => ({
          ...item,
          workTime: item.workTime || { start: "", end: "" },
          breaks: item.breaks || [],
        }));
        setDailyData(formattedData);

        if (formattedData.length > 0) {
          const startDate = format(
            new Date(formattedData[0].date),
            "dd.MM.yyyy"
          );
          const endDate = format(
            new Date(formattedData[formattedData.length - 1].date),
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
      await callApi(`/api/staff-schedules/${scheduleId}/details`, "PUT", {
        workHours: updatedData,
      });
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
                  _id: Date.now().toString(),
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
    <div>
      <div className="absolute top-2 right-4">
        <CustomTooltip
          onClick={() => router.back()}
          tooltipText="Go Back"
          icon={<ArrowLeft />}
        />
      </div>
      <GenericTable
        data={dailyData}
        columns={columns}
        editable
        onSave={handleSave}
      />
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
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import callApi from "@/app/Api/callApi";
// import { toast } from "sonner";
// import { format } from "date-fns";
// import { ArrowLeft, Plus, Trash2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";

// type WorkHours = {
//   _id: string;
//   day: string;
//   date: Date;
//   isDayOff: boolean;
//   startTime: string;
//   endTime: string;
//   breaks: Break[];
// };

// type Break = {
//   _id: string;
//   startTime: string;
//   endTime: string;
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
//         setDailyData(data);
//         if (data.length > 0) {
//           const startDate = format(new Date(data[0].date), "dd.MM.yyyy");
//           const endDate = format(
//             new Date(data[data.length - 1].date),
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
//       accessorKey: "startTime",
//       header: "Начало",
//       cell: ({ row }) => (
//         <span>{row.original.isDayOff ? "-" : row.original.startTime}</span>
//       ),
//       editableCell: ({ row }, onUpdate) => (
//         <LabeledInput
//           type="time"
//           value={row.original.startTime}
//           onChange={(e) => onUpdate("startTime", e.target.value)}
//           label={""}
//           id={""} // disabled={row.original.isDayOff}
//         />
//       ),
//     },
//     {
//       accessorKey: "endTime",
//       header: "Край",
//       cell: ({ row }) => (
//         <span>{row.original.isDayOff ? "-" : row.original.endTime}</span>
//       ),
//       editableCell: ({ row }, onUpdate) => (
//         <LabeledInput
//           type="time"
//           value={row.original.endTime}
//           onChange={(e) => onUpdate("endTime", e.target.value)}
//           label={""}
//           id={""} // disabled={row.original.isDayOff}
//         />
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
//               {br.startTime} - {br.endTime}
//             </span>
//           ))}
//         </div>
//       ),
//       editableCell: ({ row }, onUpdate) => (
//         <div className="flex flex-col space-y-2">
//           {row.original.breaks.map((br, index) => (
//             <div key={br._id} className="flex items-center space-x-2">
//               <LabeledInput
//                 type="time"
//                 value={br.startTime}
//                 onChange={(e) => {
//                   const updatedBreaks = [...row.original.breaks];
//                   updatedBreaks[index].startTime = e.target.value;
//                   onUpdate("breaks", updatedBreaks);
//                 }}
//                 label={""}
//                 id={""}
//               />
//               <LabeledInput
//                 type="time"
//                 value={br.endTime}
//                 onChange={(e) => {
//                   const updatedBreaks = [...row.original.breaks];
//                   updatedBreaks[index].endTime = e.target.value;
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
//                   startTime: "12:00",
//                   endTime: "13:00",
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
