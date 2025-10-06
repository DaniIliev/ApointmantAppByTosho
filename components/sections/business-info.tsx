// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Clock } from "lucide-react";
// import { Textarea } from "../ui/textarea";

// interface BusinessInfoProps {
//   business: {
//     description: string;
//     hours: {
//       monday: string;
//       tuesday: string;
//       wednesday: string;
//       thursday: string;
//       friday: string;
//       saturday: string;
//       sunday: string;
//     };
//   };
//   isEditMode: boolean; // Добавен prop
//   onDescriptionChange: (field: string, value: string) => void; // Добавен callback
//   onHoursChange: (field: string, value: string) => void; // Добавен callback
// }

// export function BusinessInfo({
//   business,
//   isEditMode,
//   onDescriptionChange,
//   onHoursChange,
// }: BusinessInfoProps) {
//   const days = [
//     "monday",
//     "tuesday",
//     "wednesday",
//     "thursday",
//     "friday",
//     "saturday",
//     "sunday",
//   ];
//   const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

//   return (
//     <div className="grid md:grid-cols-2 gap-6">
//       {/* About */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="font-sans">About</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {isEditMode ? (
//             <Textarea
//               value={business.description}
//               onChange={(e) =>
//                 onDescriptionChange("description", e.target.value)
//               }
//               className="min-h-[150px]"
//             />
//           ) : (
//             <p className="text-muted-foreground leading-relaxed">
//               {business.description}
//             </p>
//           )}
//         </CardContent>
//       </Card>

//       {/* Hours */}
//       <Card>
//         {/* ... CardHeader за Hours */}
//         <CardContent>
//           <div className="space-y-2">
//             {days.map((day) => (
//               <div
//                 key={day}
//                 className={`flex justify-between text-sm items-center ${
//                   day === today
//                     ? "font-semibold text-foreground"
//                     : "text-muted-foreground"
//                 }`}
//               >
//                 <span className="capitalize">{day}</span>
//                 {isEditMode ? (
//                   <input
//                     type="text"
//                     value={business.hours[day as keyof typeof business.hours]}
//                     onChange={(e) =>
//                       onHoursChange(`hours.${day}`, e.target.value)
//                     }
//                     className="w-1/2 text-right border rounded px-1 py-0.5 text-foreground bg-secondary/50"
//                   />
//                 ) : (
//                   <span>
//                     {business.hours[day as keyof typeof business.hours]}
//                   </span>
//                 )}
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Info, CheckCircle, XCircle } from "lucide-react"; // Добавяме Info, CheckCircle, XCircle
import { Textarea } from "../ui/textarea";

// Използвайте Input за по-добър вид в Edit Mode, ако имате достъп до него
// import { Input } from "../ui/input";

interface BusinessHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

interface BusinessInfoProps {
  business: {
    description: string;
    hours: BusinessHours;
  };
  isEditMode: boolean;
  onDescriptionChange: (field: string, value: string) => void;
  onHoursChange: (field: string, value: string) => void;
}

// Помощна функция за получаване на българско име на деня
const getDayNameBg = (dayKey: string) => {
  const map: { [key: string]: string } = {
    monday: "Понеделник",
    tuesday: "Вторник",
    wednesday: "Сряда",
    thursday: "Четвъртък",
    friday: "Петък",
    saturday: "Събота",
    sunday: "Неделя",
  };
  return map[dayKey] || dayKey;
};

export function BusinessInfo({
  business,
  isEditMode,
  onDescriptionChange,
  onHoursChange,
}: BusinessInfoProps) {
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  // Вземане на днешния ден (0=Неделя -> 6=Събота)
  const currentDayIndex = new Date().getDay();
  // Мапиране: 0(Неделя) -> 6, 1(Понеделник) -> 0 и т.н.
  const todayKey = days[currentDayIndex === 0 ? 6 : currentDayIndex - 1];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {" "}
      {/* Промяна на 3 колони на голям екран */}
      {/* About - Преместваме го на 2 колони за повече място за описанието */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center space-x-2 p-4 border-b">
          <Info className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl font-bold tracking-tight text-primary">
            За Нас
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isEditMode ? (
            <Textarea
              value={business.description}
              onChange={(e) =>
                onDescriptionChange("description", e.target.value)
              }
              placeholder="Въведете детайлно описание на вашия бизнес..."
              className="min-h-[200px] border-primary/30 focus-visible:ring-primary/50"
            />
          ) : (
            <p className="text-muted-foreground whitespace-pre-wrap text-base leading-relaxed">
              {business.description || "Няма налично описание."}
            </p>
          )}
        </CardContent>
      </Card>
      {/* Hours - Остава на 1 колона */}
      <Card>
        <CardHeader className={`p-4 border-b `}>
          <div className="flex items-center space-x-2">
            <Clock className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold tracking-tight text-primary">
              Работно Време
            </CardTitle>
          </div>
          {/* Индикатор за статус - директно под заглавието
          <div className="flex items-center gap-2 mt-2">
            <StatusIcon className={`h-4 w-4 ${statusColor}`} />
            <span className={`text-sm font-semibold ${statusColor}`}>
              {statusText}
            </span>
          </div> */}
        </CardHeader>
        <CardContent className="pt-6 pb-4">
          <div className="space-y-3">
            {days.map((day) => {
              const dayHours = business.hours[day as keyof BusinessHours];
              const isToday = day === todayKey;
              const isClosed =
                dayHours.toLowerCase().includes("closed") ||
                dayHours.trim() === "";

              return (
                <div
                  key={day}
                  className={`flex justify-between items-center py-1 border-b border-border/50 last:border-b-0 ${
                    isToday
                      ? "font-bold text-foreground bg-primary/5 rounded-md px-2 -mx-2"
                      : "text-muted-foreground"
                  }`}
                >
                  {/* Име на деня */}
                  <span className="text-base">{getDayNameBg(day)}</span>

                  {isEditMode ? (
                    // Edit Mode: Използвайте по-добре стилизиран Input
                    <input
                      type="text"
                      value={dayHours}
                      onChange={(e) =>
                        onHoursChange(`hours.${day}`, e.target.value)
                      }
                      placeholder="Напр. 9:00 AM - 5:00 PM"
                      className={`w-1/2 text-right text-sm border-2 rounded-md px-2 py-1 transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${
                        isClosed ? "border-red-300" : "border-border"
                      } bg-background/50`}
                    />
                  ) : (
                    // Read Mode
                    <span
                      className={isClosed ? "text-red-500 font-semibold" : ""}
                    >
                      {isClosed ? "Затворено" : dayHours}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
