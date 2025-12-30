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
      return "bg-card/50 border-2 border-yellow-500 text-yellow-600";
    case "confirmed":
      return "bg-card/50 border-2 border-blue-500 text-blue-600";
    case "completed":
      return "bg-card/50 border-2 border-green-500 text-green-600";
    case "cancelled":
    case "missed":
      return "bg-card/50 border-2 border-red-500 text-red-600";
    default:
      return "bg-card/50 border-2 border-muted text-muted-foreground";
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
  priority: string
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
  dueDateFilter: string
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
