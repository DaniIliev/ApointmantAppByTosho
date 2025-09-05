import { Circle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { getPriorityIndicator } from "@/Global/Utils/statusIndicator";
import { KAN_TASK_PRIORITY_OPTIONS } from "@/components/InteractiveKanbanBoard/KanbanboardUtils";
interface PrioritySubMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onChangePriority: (priority: string) => void;
}

function PrioritySubMenu({
  anchorEl,
  open,
  onClose,
  onChangePriority,
}: PrioritySubMenuProps) {
  const { t } = useTranslation();

  // Calculate position based on the anchor element
  const style = anchorEl
    ? {
        position: "absolute" as "absolute",
        top: anchorEl.offsetTop,
        left: anchorEl.offsetLeft + anchorEl.offsetWidth,
        zIndex: 60, // A higher z-index than the parent menu
      }
    : {};

  return (
    <div
      className={cn(
        "bg-white dark:bg-zinc-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5",
        {
          hidden: !open,
          block: open,
        }
      )}
      style={style}
      onMouseLeave={onClose}
    >
      {KAN_TASK_PRIORITY_OPTIONS.map((priority) => (
        <button
          key={priority.value}
          onClick={(e) => {
            e.stopPropagation();
            onChangePriority(priority.value);
            onClose();
          }}
          className="
            flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200
            hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors
          "
        >
          <div className="flex-shrink-0 w-6 flex items-center justify-start mr-2">
            <Circle
              size={14}
              style={{ color: getPriorityIndicator(priority.value).color }}
            />
          </div>
          <span>{t(priority.description)}</span>
        </button>
      ))}
    </div>
  );
}

export default PrioritySubMenu;
