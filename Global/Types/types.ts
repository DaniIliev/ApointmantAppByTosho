export interface SelectOptionsAppointmentType {
  id: string;
  name: string;
  duration?: number;
  price?: number;
}

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | string;

export interface Appointment {
  _id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  appointmentTime: {
    // Променено на обект
    start: string; // За да е съвместимо с това, което връща бекендът
    end: string; // За да е съвместимо с това, което връща бекендът
  };
  serviceName: string; // Променено на serviceName, тъй като така го връща бекендът
  status: AppointmentStatus;
  notes?: string;
  staff: string;
}

export interface AppointmentType {
  _id: string;
  imageUrl: File | null;
  name: string;
  description: string;
  duration: number;
  price: number;
  color: string;
  staffIds: string[]; // Променено на staffIds
}

export interface Staff {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface SelectOption {
  id: string;
  name: string;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
}
