// app/page.tsx
"use client";
import MobileCalendar from "@/components/calendar/MobileCalendar";
import { CalendarAppointments } from "@/components/ResponsibleCalendarView/ResponsibleCalendarView";
import { Appointment } from "@/Global/Types/types";
import { redirect } from "next/navigation";
import { useTranslation } from "react-i18next";


export default function Home() {
  const { t } = useTranslation();
  redirect("/for-business");
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{t("Appointment Schedule")}</h1>
    </div>
  );
}
