import React from "react";
import { Plus, Trash2, Edit, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";

interface KanbanBoardMenuProps {
  handleOpenCreateBoardModal: () => void;
  handleOpenDeleteBoardConfirm: () => void;
  isKanbanBoardSelected: boolean;
  isCreatingNewBoard: boolean;
  deleteBoard: () => void;
  setBoardFormMode: React.Dispatch<
    React.SetStateAction<"create" | "edit" | null>
  >;
  handleOpenSharedModal: () => void;
  // currentUserPermissions: KanbanUserPermissionType;
  // originalUserPermissions: OriginalUserPermissionType;
}

const KanbanBoardMenu: React.FC<KanbanBoardMenuProps> = ({
  handleOpenCreateBoardModal,
  handleOpenDeleteBoardConfirm,
  isKanbanBoardSelected,
  isCreatingNewBoard,
  deleteBoard,
  setBoardFormMode,
  handleOpenSharedModal,
  // originalUserPermissions,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center space-y-2">
      <CustomTooltip
        onClick={() => {
          handleOpenCreateBoardModal();
          setBoardFormMode("create");
        }}
        tooltipText={t("Create New Kanban Board")}
        icon={<Plus />}
      />
      <CustomTooltip
        onClick={() => {
          handleOpenCreateBoardModal();
          setBoardFormMode("edit");
        }}
        tooltipText={t("Edit Kanban Board")}
        icon={<Edit />}
      />
      <CustomTooltip
        onClick={() => {
          handleOpenDeleteBoardConfirm();
          deleteBoard();
        }}
        tooltipText={t("Delete Selected Kanban Board")}
        icon={<Trash2 />}
      />
    </div>
  );
};

export default KanbanBoardMenu;
