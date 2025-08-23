"use client";

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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer">
          <Download className="h-4 w-4 mr-2" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="backdrop-blur-md bg-popover/90 border-white/20">
        <DropdownMenuItem onClick={() => onExport("csv")}>
          <Table className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport("pdf")}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport("png")}>
          <ImageIcon className="h-4 w-4 mr-2" />
          Export as Image
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
