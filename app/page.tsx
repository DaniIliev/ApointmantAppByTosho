// app/page.tsx

import { CalendarAppointments } from "@/components/ResponsibleCalendarView/ResponsibleCalendarView";
import { Appointment } from "@/Global/Types/types";

const mockAppointments: Appointment[] = [
  {
    id: "1",
    clientName: "Иван Петров",
    clientEmail: "ivan@example.com",
    clientPhone: "0888123456",
    date: "2025-08-27",
    time: "14:30",
    service: "Подстригване",
    status: "upcoming", // Променено
  },
  {
    id: "2",
    clientName: "Мария Георгиева",
    clientEmail: "maria@example.com",
    clientPhone: "0888654321",
    date: "2025-08-28",
    time: "10:00",
    service: "Маникюр",
    status: "upcoming", // Променено
  },
  {
    id: "3",
    clientName: "Георги Иванов",
    clientEmail: "georgi@example.com",
    clientPhone: "0888112233",
    date: "2025-08-27",
    time: "16:00",
    service: "Масаж",
    status: "completed", // Променено
  },
];

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">График за срещи</h1>
      <CalendarAppointments appointments={mockAppointments} />
    </div>
  );
}
