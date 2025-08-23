export type AppointmentStatus = "upcoming" | "completed" | "cancelled";
export interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  time: string;
  service: string;
  status: AppointmentStatus;
  notes?: string;
}
export interface AppointmentType {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  color: string;
}
