"use client";

import React from "react";
import {
  Edit2,
  Trash2,
  MoreVertical,
  Printer,
  Eye,
  EyeOff,
} from "lucide-react";
import type { ChartConfig, DashboardItem } from "./types";
import { useTranslation } from "react-i18next";

interface ChartActionsMenuProps {
  itemId: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  onEdit: (chart: ChartConfig) => void;
  onDelete: (id: string) => void;
  onToggleSlider: (id: string, show: boolean) => void;
  showSlider: boolean;
  item: DashboardItem;
}

export function ChartActionsMenu({
  itemId,
  isOpen,
  onToggle,
  onEdit,
  onDelete,
  onToggleSlider,
  showSlider,
  item,
}: ChartActionsMenuProps) {
  const { t } = useTranslation();
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onToggle(itemId);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, itemId, onToggle]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(itemId);
        }}
        className="p-2 hover:bg-primary/20 rounded-full transition-colors"
        title="Settings"
      >
        <MoreVertical className="w-5 h-5 text-slate-400" />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl z-50 py-3 px-4 flex items-center gap-6"
          data-settings-popover
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Edit */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (item.type !== "kpi") {
                onEdit(item as ChartConfig);
              }
              onToggle(itemId);
            }}
            className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
            title="Edit"
          >
            <Edit2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <span className="text-xs text-gray-700 dark:text-gray-300">
              Edit
            </span>
          </button>

          {/* Show/Hide Slider */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSlider(itemId, !showSlider);
            }}
            className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
            title={showSlider ? "Hide Slider" : "Show Slider"}
          >
            {showSlider ? (
              <EyeOff className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Eye className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            )}
            <span className="text-xs text-gray-700 dark:text-gray-300">
              {showSlider ? "Hide" : "Show"}
            </span>
          </button>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(itemId);
              onToggle(itemId);
            }}
            className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
            title="Delete"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
            <span className="text-xs text-red-500">Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
