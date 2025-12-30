import { cn } from "@/lib/utils";
import { Check, X, Clock } from "lucide-react";
import { AppointmentStatus } from "@/Global/Types/types";
import { useTranslation } from "react-i18next";
import React from "react";
import { getStatusIndicator } from "@/Global/Utils/statusIndicator";
import { capitalizeFirstLetter } from "@/Global/Utils/commonFn";

interface StatusChipProps {
  status: AppointmentStatus;
}

const getStatusProps = (status: AppointmentStatus) => {
  switch (status) {
    case "completed":
      return {
        icon: <Check size={16} />,
        className:
          "bg-card/50 border-2 border-green-500 text-green-600 dark:text-green-400",
      };
    case "cancelled":
      return {
        icon: <X size={16} />,
        className:
          "bg-card/50 border-2 border-red-500 text-red-600 dark:text-red-400",
      };
    case "pending":
      return {
        icon: <Clock size={16} />,
        className:
          "bg-card/50 border-2 border-yellow-500 text-yellow-600 dark:text-yellow-400",
      };
    case "confirmed":
      return {
        icon: <Clock size={16} />,
        className:
          "bg-card/50 border-2 border-blue-500 text-blue-600 dark:text-blue-400",
      };
    default:
      return {
        icon: null,
        className:
          "bg-card/50 border-2 border-gray-400 text-gray-600 dark:text-gray-400",
      };
  }
};

export const StatusChip = ({ status }: StatusChipProps) => {
  console.log("status", status);
  const { t } = useTranslation();
  const statusProps = getStatusProps(status);

  return (
    <div
      className={cn(
        `flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap ${statusProps.className}`
      )}
    >
      {statusProps.icon}
      <span className="text-sm">{capitalizeFirstLetter(t(status))}</span>
    </div>
  );
};
