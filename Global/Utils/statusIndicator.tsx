import { AppointmentStatus } from "../Types/types";
import { ReactNode } from "react";
import {
  NotebookText,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Calendar,
  CalendarDays,
  Clock,
  CheckSquare,
  XCircle,
} from "lucide-react";

type CardStatusIndicator = {
  color: string;
  icon: ReactNode;
};

export const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case "pending":
      return "status-theme-base status-theme-pending";
    case "confirmed":
      return "status-theme-base status-theme-confirmed";
    case "completed":
      return "status-theme-base status-theme-completed";
    case "blocked":
      return "status-theme-base status-theme-blocked";
    case "cancelled":
    case "missed":
      return "status-theme-base status-theme-cancelled";
    default:
      return "status-theme-base border-border text-muted-foreground";
  }
};

export const getStatusIndicator = (status: string): CardStatusIndicator => {
  switch (status) {
    case "Planned":
      return {
        color: "#90CAF9",
        icon: <NotebookText size={15} />,
      };
    case "In Progress":
      return {
        color: "rgba(255, 213, 79, 0.6)",
        icon: <RefreshCw size={15} />,
      };
    case "Finished":
      return {
        color: "#A5D6A7",
        icon: <CheckCircle size={15} />,
      };
    case "pending":
      return {
        color: "bg-gradient-to-r from-yellow-500 to-amber-500 text-white",
        icon: <Clock size={15} />,
      };
    case "confirmed":
      return {
        color: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
        icon: <CheckCircle size={15} />,
      };

    case "completed":
      return {
        color: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
        icon: <CheckSquare size={15} />,
      };
    case "missed":
    case "cancelled":
      return {
        color: "bg-gradient-to-r from-red-500 to-rose-500 text-white",
        icon: <XCircle size={15} />,
      };
    default:
      return {
        color: "#B0BEC5",
        icon: undefined,
      };
  }
};

type CardPriorityIndicator = {
  color: string;
};

export const getPriorityIndicator = (
  priority: string,
): CardPriorityIndicator => {
  switch (priority) {
    case "Low":
      return {
        color: "#EAEAEA",
      };
    case "Medium":
      return {
        color: "#007BFF", // A specific color value instead of a theme variable
      };
    case "High":
      return {
        color: "#DC3545",
      };
    case "Critical":
      return {
        color: "#B72121",
      };
    default:
      return {
        color: "#6B7280", // A specific color value instead of a theme variable
      };
  }
};

type CardDueDateIndicator = {
  icon: ReactNode;
};

export const getDueDateIndicator = (
  dueDateFilter: string,
): CardDueDateIndicator => {
  switch (dueDateFilter) {
    case "Late":
      return {
        icon: <AlertTriangle size={20} />,
      };
    case "Today":
      return {
        icon: <Calendar size={20} />,
      };
    case "Tomorrow":
      return {
        icon: <Calendar size={20} />,
      };
    case "This Week":
      return {
        icon: <CalendarDays size={20} />,
      };
    case "Next Week":
      return {
        icon: <CalendarDays size={20} />,
      };
    case "Future":
      return {
        icon: <CalendarDays size={20} />,
      };
    case "No date":
      return {
        icon: <CalendarDays size={20} />,
      };
    case "Custom Date":
      return {
        icon: <CalendarDays size={20} />,
      };
    default:
      return {
        icon: <Calendar size={20} />,
      };
  }
};
