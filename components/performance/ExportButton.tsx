"use client";

import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, ImageIcon, Table } from "lucide-react";

interface ExportButtonProps {
  onExport: (format: "csv" | "pdf" | "png") => void;
}

export function ExportButton({ onExport }: ExportButtonProps) {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer">
          <Download size={18} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="backdrop-blur-md bg-popover/90 border-white/20">
        <DropdownMenuItem onClick={() => onExport("csv")}>
          <Table size={18} />
          {t("Export as CSV")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport("pdf")}>
          <FileText size={18} />
          {t("Export as PDF")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport("png")}>
          <ImageIcon size={18} />
          {t("Export as Image")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
