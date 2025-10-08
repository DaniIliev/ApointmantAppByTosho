import React, { useState, useCallback } from "react";
import { ChevronRight, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import StatusSubMenu from "./StatusSubMenu";
import PrioritySubMenu from "./PrioritySubMenu";
import { cn } from "@/lib/utils";

interface TaskOptionsMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onChangeStatus: (status: string) => void;
  onChangePriority: (priority: string) => void;
  onDeleteClick: (event: React.MouseEvent) => void;
  canDelete: boolean;
}

function TaskOptionsMenu({
  anchorEl,
  open,
  onClose,
  onChangeStatus,
  onChangePriority,
  onDeleteClick,
  canDelete,
}: TaskOptionsMenuProps) {
  const { t } = useTranslation();

  const [statusMenuAnchorEl, setStatusMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const openStatusMenu = Boolean(statusMenuAnchorEl);

  const [priorityMenuAnchorEl, setPriorityMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const openPriorityMenu = Boolean(priorityMenuAnchorEl);

  const handleStatusMenuClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      setStatusMenuAnchorEl(event.currentTarget);
    },
    []
  );

  const handleStatusMenuClose = useCallback(() => {
    setStatusMenuAnchorEl(null);
  }, []);

  const handlePriorityMenuClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      setPriorityMenuAnchorEl(event.currentTarget);
    },
    []
  );

  const handlePriorityMenuClose = useCallback(() => {
    setPriorityMenuAnchorEl(null);
  }, []);

  if (!open) {
    return null;
  }

  // Calculate position based on the anchor element
  const style = anchorEl
    ? {
        position: "absolute" as const,
        top: anchorEl.offsetTop,
        left: anchorEl.offsetLeft + anchorEl.offsetWidth,
        zIndex: 50, // High z-index to be on top
      }
    : {};

  return (
    <div
      className={cn(
        "bg-white dark:bg-zinc-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5",
        "flex flex-col",
        {
          hidden: !open,
          block: open,
        }
      )}
      style={style}
      onMouseLeave={onClose}
    >
      <button
        onClick={handleStatusMenuClick}
        className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
      >
        <span>{t("Change Status")}</span>
        <ChevronRight size={16} />
      </button>
      <StatusSubMenu
        anchorEl={statusMenuAnchorEl}
        open={openStatusMenu}
        onClose={handleStatusMenuClose}
        onChangeStatus={onChangeStatus}
      />

      <button
        onClick={handlePriorityMenuClick}
        className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
      >
        <span>{t("Change Priority")}</span>
        <ChevronRight size={16} />
      </button>
      <PrioritySubMenu
        anchorEl={priorityMenuAnchorEl}
        open={openPriorityMenu}
        onClose={handlePriorityMenuClose}
        onChangePriority={onChangePriority}
      />

      <button
        onClick={onDeleteClick}
        disabled={!canDelete}
        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>{t("Delete Task")}</span>
        <Trash2 size={16} className="ml-auto" />
      </button>
    </div>
  );
}

export default TaskOptionsMenu;
