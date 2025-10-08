import React from "react";
import {
  IBaseKanbanCard,
  KanbanUserPermissionType,
  UserPossibleAssignee,
} from "@/components/InteractiveKanbanBoard/KanbanboardUtils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import KanbanBoardTaskCard from "@/components/InteractiveKanbanBoard/KanbanBoardColumnCard";

interface CompletedTasksSectionProps<T extends IBaseKanbanCard> {
  completedTasks: T[];
  showCompletedTasks: boolean;
  setShowCompletedTasks: React.Dispatch<React.SetStateAction<boolean>>;
  handleAssignee?: (card_id: string, data: { user_id: string }) => void;
  handleUnAssignee?: (card_id: string, data: { user_id: string }) => void;
  currentUserPermissions?: KanbanUserPermissionType;
  handleViewTask: (id: string) => void;
  handleDeleteTask: (id: string) => void;
  handleUpdateTask: (updatedTask: T[]) => void;
  allUserOptions?: UserPossibleAssignee[];
}

const CompletedTasksSection = <T extends IBaseKanbanCard>({
  completedTasks,
  showCompletedTasks,
  setShowCompletedTasks,
  handleAssignee,
  currentUserPermissions,
  handleViewTask,
  handleDeleteTask,
  handleUpdateTask,
  allUserOptions,
  handleUnAssignee,
}: CompletedTasksSectionProps<T>) => {
  const { t } = useTranslation();

  if (completedTasks.length === 0) {
    return null;
  }

  return (
    <>
      <hr className="my-4 border-t border-gray-300 dark:border-zinc-700" />
      <button
        type="button"
        className="
          w-full flex items-center justify-start py-2 px-3
          text-sm font-medium text-gray-500 dark:text-gray-400
          hover:bg-gray-100 dark:hover:bg-zinc-800
          hover:text-gray-900 dark:hover:text-gray-50 rounded-md
        "
        onClick={() => setShowCompletedTasks((prev) => !prev)}
      >
        {showCompletedTasks ? (
          <ChevronDown size={20} className="mr-2" />
        ) : (
          <ChevronRight size={20} className="mr-2" />
        )}
        <span>{t("Finished tasks")}</span>
        <div
          className="
            flex items-center justify-center ml-2
            border border-gray-400 dark:border-zinc-600 rounded-full
            px-2.5 py-1
          "
        >
          <span className="text-sm font-normal text-gray-700 dark:text-gray-300">
            {completedTasks?.length}
          </span>
        </div>
      </button>
      {showCompletedTasks && (
        <div className="mt-2 space-y-2">
          {completedTasks.map((task) => (
            <KanbanBoardTaskCard
              handleUnAssignee={handleUnAssignee}
              handleAssignee={handleAssignee}
              currentUserPermissions={currentUserPermissions}
              handleViewTask={handleViewTask}
              key={task.object_id}
              handleDeleteTask={handleDeleteTask}
              task={task}
              handleUpdateTask={handleUpdateTask}
              allUserOptions={allUserOptions}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default CompletedTasksSection;
