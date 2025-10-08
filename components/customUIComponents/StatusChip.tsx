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
          "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      };
    case "cancelled":
      return {
        icon: <X size={16} />,
        className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
      };
    case "upcoming":
      return {
        icon: <Clock size={16} />,
        className:
          "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      };
    default:
      return {
        icon: null,
        className:
          "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
      };
  }
};

export const StatusChip = ({ status }: StatusChipProps) => {
  console.log("status", status);
  const { t } = useTranslation();
  const { icon, color } = getStatusIndicator(status);

  return (
    <div
      className={cn(
        `flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap ${color}`
        // className
      )}
    >
      {icon}
      <span className="text-sm">{capitalizeFirstLetter(t(status))}</span>
    </div>
  );
};
