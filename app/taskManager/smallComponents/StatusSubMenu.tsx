import { cn } from "@/lib/utils";
import { getStatusIndicator } from "@/Global/Utils/statusIndicator";
import { useTranslation } from "react-i18next";

interface StatusSubMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onChangeStatus: (status: string) => void;
}

function StatusSubMenu({
  anchorEl,
  open,
  onClose,
  onChangeStatus,
}: StatusSubMenuProps) {
  const { t } = useTranslation();
  const statuses = ["Planned", "In Progress", "Finished"];

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
      {statuses.map((status) => (
        <button
          key={status}
          onClick={(e) => {
            e.stopPropagation();
            onChangeStatus(status);
            onClose();
          }}
          className="
            flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200
            hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors
          "
        >
          <div className="flex-shrink-0 w-6 flex items-center justify-start mr-2">
            {getStatusIndicator(status).icon}
          </div>
          <span>{t(status)}</span>
        </button>
      ))}
    </div>
  );
}

export default StatusSubMenu;
