import { SelectOption } from "@/components/InteractiveKanbanBoard/KanbanboardUtils";
import {
  FileText, // For "Planned"
  RefreshCcw, // For "In Progress"
  CheckCircle, // For "Finished"
} from "lucide-react";
import React from "react";

export const getAllStatuses = (t: (key: string) => string): SelectOption[] => {
  return [
    {
      value: "Planned",
      description: t("Planned"),
      icon: <FileText size={16} />,
    },
    {
      value: "In Progress",
      description: t("In Progress"),
      icon: <RefreshCcw size={16} />,
    },
    {
      value: "Finished",
      description: t("Finished"),
      icon: <CheckCircle size={16} />,
    },
  ];
};
