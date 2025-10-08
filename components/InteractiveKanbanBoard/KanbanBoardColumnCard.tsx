import React, { useMemo, useState, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  // BoardType,
  IBaseKanbanCard,
  KanbanBoardId,
  KanbanUserPermissionType,
  UserPossibleAssignee,
} from "./KanbanboardUtils";
// import {
//   getPriorityIndicator,
//   getStatusIndicator,
// } from "../../../pages/TaskManager/KanbanBoardTaskManager/utilFns/Indicators";
import TaskOptionsMenu from "@/app/taskManager/smallComponents/TaskOptionsMenu";
import { MoreHorizontal, Trash2, UserPlus, Circle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDateAndTime, getInitials } from "@/Global/Utils/commonFn";
import {
  getPriorityIndicator,
  getStatusIndicator,
} from "@/Global/Utils/statusIndicator";
import AssigneeSelector from "@/app/taskManager/smallComponents/AssigneeSelector";
import LoadingBackdrop from "../ui/LoadingBackdrop";

interface Props<T extends IBaseKanbanCard> {
  task: T;
  deleteTask?: (id: KanbanBoardId) => void;
  handleUpdateTask: (updatedTask: T[]) => void;
  handleViewTask: (id: string) => void;
  handleDeleteTask: (id: string) => void;
  currentUserPermissions?: KanbanUserPermissionType;
  allUserOptions?: UserPossibleAssignee[];
  handleAssignee?: (card_id: string, data: { user_id: string }) => void;
  handleUnAssignee?: (card_id: string, data: { user_id: string }) => void;
  // boardType: BoardType;
}

function KanbanBoardTaskCard<T extends IBaseKanbanCard>({
  task,
  deleteTask,
  handleAssignee,
  handleUpdateTask,
  handleViewTask,
  handleDeleteTask,
  currentUserPermissions,
  allUserOptions,
  handleUnAssignee,
}: // boardType,
Props<T>) {
  const { t } = useTranslation();
  const canEdit = currentUserPermissions?.edit || false;
  const canDelete = currentUserPermissions?.delete || false;

  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [formStatus, setFormStatus] = useState<string | null>(null);
  const [assigneeAnchorEl, setAssigneeAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const openAssigneeMenu = Boolean(assigneeAnchorEl);

  const [optionsMenuAnchorEl, setOptionsMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const openOptionsMenu = Boolean(optionsMenuAnchorEl);

  const isAnyMenuOpen = openOptionsMenu || openAssigneeMenu;

  const handleOptionsMenuClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setOptionsMenuAnchorEl(event.currentTarget);
    },
    []
  );

  const handleOptionsMenuClose = useCallback(() => {
    setOptionsMenuAnchorEl(null);
  }, []);

  const handleChangeStatus = useCallback(
    async (newStatus: string) => {
      try {
        setFormStatus("loading");
        await handleUpdateTask([{ ...task, status: newStatus }]);
        setFormStatus(null);
        handleOptionsMenuClose();
      } catch (error) {
        console.error("Failed to change status:", error);
        setFormStatus("error");
      }
    },
    [handleUpdateTask, task, handleOptionsMenuClose]
  );

  const handleChangePriority = useCallback(
    async (newPriority: string) => {
      try {
        setFormStatus("loading");
        await handleUpdateTask([{ ...task, priority: newPriority }]);
        setFormStatus(null);
        handleOptionsMenuClose();
      } catch (error) {
        console.error("Failed to change priority:", error);
        setFormStatus("error");
      }
    },
    [handleUpdateTask, task, handleOptionsMenuClose]
  );

  const handleDeleteClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (handleDeleteTask) {
        handleDeleteTask(task.object_id);
      }
      handleOptionsMenuClose();
    },
    [handleDeleteTask, task.object_id, handleOptionsMenuClose]
  );

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.object_id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = useMemo(
    () => ({
      transition,
      transform: CSS.Transform.toString(transform),
    }),
    [transition, transform]
  );

  const handleAssignClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAssigneeAnchorEl(event.currentTarget);
    },
    []
  );

  const handleAssigneeClose = useCallback(() => {
    setAssigneeAnchorEl(null);
  }, []);

  const handleAssignSingleUser = async (userId: string) => {
    if (!task?.object_id) return;
    const data = { user_id: userId };
    handleAssignee?.(task.object_id, data);
  };

  const handleUnassignSingleUser = async (userId: string) => {
    if (!task?.object_id) return;
    const data = { user_id: userId };
    handleUnAssignee?.(task.object_id, data);
  };

  const getPriorityColor = useCallback(() => {
    const priority = task.priority;
    if (!priority) return "text-gray-500";
    const color = getPriorityIndicator(priority).color;
    return color;
  }, [task.priority]);

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="
          p-2.5 h-[100px] min-h-[100px] flex items-center text-left
          rounded-xl cursor-grab relative opacity-30
          bg-white dark:bg-zinc-900
          shadow-md
        "
      />
    );
  }

  const statusIndicator = getStatusIndicator(task.status!);

  // const statusIndicator = getStatusColor(task.status!, {
  //   palette: { grey: { 800: "#333" } },
  // });
  const formattedPlannedEndDate = task?.planned_end_date
    ? formatDateAndTime(task.planned_end_date, "date")
    : null;

  return (
    <div
      ref={setNodeRef}
      onClick={() => {
        if (!isAnyMenuOpen) {
          handleViewTask(task.object_id);
        }
      }}
      {...attributes}
      {...listeners}
      className="
        bg-white dark:bg-zinc-900 p-2.5 h-auto min-h-[140px] flex flex-col
        text-left rounded-xl transition-shadow cursor-grab relative
        hover:shadow-lg
      "
      onMouseEnter={() => {
        setMouseIsOver(true);
      }}
      onMouseLeave={() => {
        setMouseIsOver(false);
      }}
    >
      {mouseIsOver && canEdit && (
        <div className="absolute top-2 right-2 z-10">
          <span className="tooltip" data-tooltip-content={t("Task Options")}>
            <button
              aria-label="task options"
              onClick={handleOptionsMenuClick}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700"
            >
              <MoreHorizontal size={16} />
            </button>
          </span>
          <TaskOptionsMenu
            anchorEl={optionsMenuAnchorEl}
            open={openOptionsMenu}
            onClose={handleOptionsMenuClose}
            onChangeStatus={handleChangeStatus}
            onChangePriority={handleChangePriority}
            onDeleteClick={handleDeleteClick}
            canDelete={canDelete}
          />
        </div>
      )}
      <div
        className="
          flex-1 w-full max-h-[95%] overflow-y-auto overflow-x-hidden
          flex flex-col space-y-1
        "
      >
        <h4
          className="
            text-lg font-bold whitespace-pre-wrap cursor-pointer flex items-center gap-0.5
          "
          onClick={() => {
            if (!isAnyMenuOpen) {
              handleViewTask(task.object_id);
            }
          }}
        >
          <Circle
            size={16}
            style={{
              color: task.priority && getPriorityColor(),
            }}
          />
          {task.title}
        </h4>
        {/* {boardType === BoardType.KanbanTask && formattedPlannedEndDate && ( */}
        <p className="ml-2 text-sm text-gray-500 flex items-center justify-start h-full">
          {t("Deadline")}:{" "}
          <strong className="ml-1">{formattedPlannedEndDate}</strong>
        </p>
        {/* )} */}
        {/* {boardType === BoardType.SRMDeals && ( */}
        <p className="ml-2 text-sm text-gray-500 flex items-center justify-start h-full">
          {t("Deadline")}: <strong className="ml-1">{"23.06.2025"}</strong>
        </p>
        {/* )} */}
      </div>

      <div
        className="
          flex justify-between items-center mt-2 w-full
          "
        // {...(boardType === BoardType.SRMDeals && { className: "justify-end" })}
      >
        {/* {BoardType.KanbanTask == boardType && ( */}
        <span
          className="
              px-2 py-1 rounded-full text-xs font-bold
              flex items-center space-x-1
            "
          style={{ backgroundColor: statusIndicator.color, color: "#333" }}
        >
          <Circle size={10} className="text-gray-800" />
          <span>{t(task.status!)}</span>
        </span>
        {/* )} */}
        <div className="flex items-center space-x-1">
          <div className="flex items-center -space-x-2">
            {task?.assignees?.map((user) => (
              <span key={`tooltip-${user.user_id}`} className="relative group">
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
                  {user.user_name}
                </div>
                <img
                  key={user.user_id}
                  alt={user.user_name}
                  src={user.profile_picture_url || undefined}
                  className="
                    w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900
                    object-cover cursor-pointer
                  "
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const initialsDiv = document.createElement("div");
                    initialsDiv.className = `w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-xs font-semibold bg-gray-500 text-white`;
                    initialsDiv.textContent = getInitials(user.user_name);
                    e.currentTarget.parentNode?.insertBefore(
                      initialsDiv,
                      e.currentTarget
                    );
                  }}
                />
              </span>
            ))}
          </div>
          <button
            aria-label="assign task"
            onClick={(e) => {
              e.stopPropagation();
              handleAssignClick(e);
            }}
            disabled={!canEdit}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus size={16} />
          </button>
        </div>

        {/* Popover Logic - The component structure itself */}
        {openAssigneeMenu && (
          <div
            className="absolute z-50 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
            style={{
              top: assigneeAnchorEl
                ? assigneeAnchorEl.offsetTop + assigneeAnchorEl.offsetHeight
                : 0,
              left: assigneeAnchorEl ? assigneeAnchorEl.offsetLeft : 0,
            }}
          >
            {allUserOptions && (
              <div className="p-2">
                <AssigneeSelector
                  allUserOptions={allUserOptions}
                  assignedUsers={task.assignees || []}
                  onAssignUser={handleAssignSingleUser}
                  onUnassignUser={handleUnassignSingleUser}
                  canEdit={canEdit}
                />
              </div>
            )}
          </div>
        )}

        {mouseIsOver && deleteTask && (
          <span className="tooltip" data-tooltip-content={t("Delete Task")}>
            <button
              aria-label="delete task"
              onClick={(e) => {
                e.stopPropagation();
                deleteTask(task.object_id);
              }}
              className="p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-700 text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </span>
        )}
      </div>

      <LoadingBackdrop loading={formStatus === "loading"} />
    </div>
  );
}

export default KanbanBoardTaskCard;
