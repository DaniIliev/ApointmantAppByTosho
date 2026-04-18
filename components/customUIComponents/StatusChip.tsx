import { cn } from "@/lib/utils";
import { Check, X, Clock } from "lucide-react";
import { AppointmentStatus } from "@/Global/Types/types";
import { useTranslation } from "react-i18next";
import React from "react";
import { capitalizeFirstLetter } from "@/Global/Utils/commonFn";

interface StatusChipProps {
  status: AppointmentStatus;
}

export const getStatusProps = (status: AppointmentStatus) => {
  switch (status) {
    case "completed":
    case "active":
      return {
        icon: <Check size={16} />,
        className: "status-theme-base status-theme-completed",
      };
    case "blocked":
      return {
        icon: <Clock size={16} />,
        className: "status-theme-base status-theme-blocked",
      };
    case "cancelled":
    case "expired":
      return {
        icon: <X size={16} />,
        className: "status-theme-base status-theme-cancelled",
      };
    case "pending":
      return {
        icon: <Clock size={16} />,
        className: "status-theme-base status-theme-pending",
      };
    case "confirmed":
    case "upcoming":
      return {
        icon: <Clock size={16} />,
        className: "status-theme-base status-theme-confirmed",
      };
    default:
      return {
        icon: null,
        className: "status-theme-base border-border text-muted-foreground",
      };
  }
};

export const StatusChip = ({ status }: StatusChipProps) => {
  const { t } = useTranslation();
  const statusProps = getStatusProps(status);

  return (
    <div
      className={cn(
        `flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap ${statusProps.className}`,
      )}
    >
      {statusProps.icon}
      <span className="text-sm">{capitalizeFirstLetter(t(status))}</span>
    </div>
  );
};
