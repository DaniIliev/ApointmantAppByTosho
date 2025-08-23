import { AppointmentStatus } from "../Types/types";

export const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case "upcoming":
      return "bg-gradient-to-r from-primary to-accent text-white";
    case "completed":
      return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
    case "cancelled":
      return "bg-gradient-to-r from-red-500 to-rose-500 text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
};
