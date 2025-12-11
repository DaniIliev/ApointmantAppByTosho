// "use client";
// import { cn } from "@/lib/utils";
// import { Card, CardContent } from "../ui/card";
// import { useTranslation } from "react-i18next";

// interface KPICardProps {
//   title: string;
//   value: string | number;
//   change?: {
//     value: number;
//     type: "increase" | "decrease" | "neutral";
//   };
//   icon?: React.ReactNode;
//   className?: string;
// }
// export function KPICard({
//   title,
//   value,
//   change,
//   icon,
//   className,
// }: KPICardProps) {
//   const { t } = useTranslation();

//   // Определяме цвета на промяната
//   const changeColor =
//     change?.type === "increase"
//       ? "text-green-400"
//       : change?.type === "decrease"
//       ? "text-red-400"
//       : "text-slate-400";

//   // Определяме символа
//   const changeSymbol =
//     change?.type === "increase" ? "+" : change?.type === "decrease" ? "-" : "";

//   // Проверяваме дали трябва да покажем промяната
//   const shouldShowChange =
//     change && change.type !== "neutral" && change.value !== 0;

//   return (
//     <Card
//       className={cn(
//         "border-2 shadow-2xl bg-white dark:bg-slate-800 backdrop-blur-lg border-primary/40",
//         "hover:shadow-2xl transition-all duration-300",
//         className
//       )}
//     >
//       <CardContent className="p-6 bg-white dark:bg-slate-800">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-sm font-medium text-slate-400">{title}</p>
//             <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
//               {value}
//             </p>
//             {shouldShowChange && (
//               <p className={cn("text-xs mt-1", changeColor)}>
//                 {changeSymbol}
//                 {Math.abs(change.value).toFixed(1)}% {t("from last period")}
//               </p>
//             )}
//             {!shouldShowChange && change && (
//               <p className="text-xs mt-1 text-slate-400">
//                 {t("No change from last period")}
//               </p>
//             )}
//             {!change && ( // Ако change изобщо не е подаден, запазваме мястото
//               <p className="text-xs mt-1 text-transparent">.</p>
//             )}
//           </div>
//           {icon && <div className="h-8 w-8 text-blue-400">{icon}</div>}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
