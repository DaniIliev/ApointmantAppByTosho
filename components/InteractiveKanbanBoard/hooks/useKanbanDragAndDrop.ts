import { useState, useCallback } from "react";
import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";
import {
  IBaseKanbanCard,
  KanbanBoardColumn,
  KanbanBoardId,
} from "../KanbanboardUtils";

type DroppedTaskModal = {
  showModal: boolean;
  message?: string;
  allowedToDrop: boolean;
  droppedTaskID: KanbanBoardId;
  droppedColumnID: KanbanBoardId;
  isSameColumn: boolean;
  overElementId?: KanbanBoardId;
} | null;

interface UseKanbanDragAndDropProps<T extends IBaseKanbanCard> {
  tasks: T[] | undefined;
  columns: KanbanBoardColumn[] | undefined;
  handleUpdateTask: (updated: T[]) => Promise<void>;
  handleUpdateColumns?: (updatedColumns: KanbanBoardColumn[]) => void;
  canEdit: boolean;
  colsMapping: Record<KanbanBoardId, KanbanBoardColumn>;
  // setReFetchAlerts: React.Dispatch<React.SetStateAction<boolean>>;
  t: (key: string) => string;
}

const useKanbanDragAndDrop = <T extends IBaseKanbanCard>({
  tasks,
  columns,
  handleUpdateTask,
  handleUpdateColumns,
  canEdit,
  colsMapping,
  // setReFetchAlerts,
  t,
}: UseKanbanDragAndDropProps<T>) => {
  const [activeColumn, setActiveColumn] = useState<KanbanBoardColumn | null>(
    null
  );
  const [activeTask, setActiveTask] = useState<T | null>(null);
  const [dropTaskModal, setDropTaskModal] = useState<DroppedTaskModal>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      if (!canEdit) {
        setDropTaskModal({
          showModal: true,
          message: t("You do not have permission to edit."),
          allowedToDrop: false,
          droppedColumnID: "",
          droppedTaskID: "",
          isSameColumn: false,
        });
        return;
      }
      if (event.active.data.current?.type === "Column") {
        setActiveColumn(event.active.data.current.column as KanbanBoardColumn);
        return;
      }

      if (event.active.data.current?.type === "Task") {
        setActiveTask(event.active.data.current.task as T);
        return;
      }
    },
    [canEdit, t]
  );

  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      if (!canEdit) return;

      const { active, over } = event;
      if (!over || !tasks || !columns) {
        setActiveColumn(null);
        setActiveTask(null);
        return;
      }

      const activeId = active.id;
      const overId = over.id;

      if (activeId === overId) {
        setActiveColumn(null);
        setActiveTask(null);
        return;
      }

      const isActiveAColumn = active.data.current?.type === "Column";
      const isActiveATask = active.data.current?.type === "Task";

      // Logic for column reordering
      if (isActiveAColumn && activeColumn && handleUpdateColumns) {
        const activeColumnIndex = columns.findIndex(
          (col) => col.id === activeId
        );
        const overColumnIndex = columns.findIndex((col) => col.id === overId);

        if (activeColumnIndex === -1 || overColumnIndex === -1) {
          setActiveColumn(null);
          setActiveTask(null);
          return;
        }

        const reorderedColumns = arrayMove(
          columns,
          activeColumnIndex,
          overColumnIndex
        );
        const updatedColumnsWithOrder = reorderedColumns.map((col, index) => ({
          ...col,
          order: index,
        }));
        handleUpdateColumns(updatedColumnsWithOrder);
      }

      // Logic for task reordering/moving
      if (isActiveATask && activeTask && tasks) {
        if (dropTaskModal?.droppedColumnID) {
          const allTasksCopy = [...tasks];

          const tasksInActiveColumn = allTasksCopy
            .filter((task) => task.column_id === activeTask.column_id)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

          const tasksInDroppedColumn = allTasksCopy
            .filter((task) => task.column_id === dropTaskModal.droppedColumnID)
            .sort((a, b) => {
              const statusA = a.status === "Finished" ? 1 : -1;
              const statusB = b.status === "Finished" ? 1 : -1;
              if (statusA !== statusB) return statusA - statusB;
              return (a.order || 0) - (b.order || 0);
            });

          // Task moved to a different column
          if (activeTask.column_id !== dropTaskModal.droppedColumnID) {
            if (!dropTaskModal.allowedToDrop) {
              setDropTaskModal((prev) => {
                if (prev) {
                  return {
                    ...prev,
                    showModal: true,
                    message: t("The task cannot be moved to this column."),
                  };
                }
                return prev;
              });
            } else {
              const tasksToUpdate: T[] = [];

              // Re-order the tasks in the old column
              const reorderedOldColumnTasks = tasksInActiveColumn
                .filter((task) => task.object_id !== activeTask.object_id)
                .map((task, index) => ({
                  ...task,
                  order: index,
                }));
              tasksToUpdate.push(...reorderedOldColumnTasks);

              let tasksInTargetColumnAfterMove: T[] = [];
              const overTask = tasksInDroppedColumn.find(
                (t) => t.object_id === overId
              );
              const isOverAColumnOnly = columns.some(
                (col) => col.id === overId
              );

              // Dropped over another task within the target column
              if (overTask && !isOverAColumnOnly) {
                const overTaskIndex = tasksInDroppedColumn.findIndex(
                  (t) => t.object_id === overTask.object_id
                );

                const tasksBeforeOver = tasksInDroppedColumn.slice(
                  0,
                  overTaskIndex
                );
                tasksInTargetColumnAfterMove.push(...tasksBeforeOver);

                tasksInTargetColumnAfterMove.push({
                  ...activeTask,
                  column_id: dropTaskModal.droppedColumnID,
                  order: overTask.order,
                });

                const tasksFromOverOnwards = tasksInDroppedColumn
                  .slice(overTaskIndex)
                  .map((task) => ({
                    ...task,
                    order: (task.order || 0) + 1,
                  }));
                tasksInTargetColumnAfterMove.push(...tasksFromOverOnwards);
              } else {
                tasksInTargetColumnAfterMove = [...tasksInDroppedColumn];

                const nonFinishedTasksInDroppedColumn =
                  tasksInDroppedColumn.filter((t) => t.status !== "Finished");
                const finishedTasksInDroppedColumn =
                  tasksInDroppedColumn.filter((t) => t.status === "Finished");

                let newOrderAtEnd =
                  nonFinishedTasksInDroppedColumn.length > 0
                    ? Math.max(
                        ...nonFinishedTasksInDroppedColumn.map(
                          (t) => t.order || 0
                        )
                      ) + 1
                    : 0;

                // Logic to insert finished tasks at the bottom of non-finished tasks
                if (activeTask.status === "Finished") {
                  tasksInTargetColumnAfterMove = [
                    ...nonFinishedTasksInDroppedColumn,
                    ...finishedTasksInDroppedColumn,
                    {
                      ...activeTask,
                      column_id: dropTaskModal.droppedColumnID,
                      order: newOrderAtEnd,
                    }, // Append to the end of all tasks
                  ];
                } else {
                  tasksInTargetColumnAfterMove = [
                    ...nonFinishedTasksInDroppedColumn,
                    {
                      ...activeTask,
                      column_id: dropTaskModal.droppedColumnID,
                      order: newOrderAtEnd,
                    },
                    ...finishedTasksInDroppedColumn,
                  ];
                }
              }

              // Final re-ordering of tasks in the target column
              const finalTasksInTargetColumn = tasksInTargetColumnAfterMove
                .sort((a, b) => {
                  const statusA = a.status === "Finished" ? 1 : -1;
                  const statusB = b.status === "Finished" ? 1 : -1;
                  if (statusA !== statusB) return statusA - statusB;
                  return (a.order || 0) - (b.order || 0);
                })
                .map((task, index) => ({
                  ...task,
                  order: index, // Assign final sequential order
                }));

              tasksToUpdate.push(...finalTasksInTargetColumn);

              if (tasksToUpdate.length > 0) {
                await handleUpdateTask(tasksToUpdate);
              }

              setDropTaskModal(null);

              // const prevColumn = activeTask?.column_id
              //   ? colsMapping?.[activeTask.column_id]?.title
              //   : "";
              // const newColumn = dropTaskModal.droppedColumnID
              //   ? colsMapping?.[dropTaskModal.droppedColumnID]?.title
              //   : "";

              // generateKanAlerts([
              //   {
              //     id: uuidv4(),
              //     message: `${t("Задача")} ${activeTask?.title || ""} ${t(
              //       "преместена от"
              //     )} ${prevColumn} ${t("в")} ${newColumn}`,
              //     rule_id: 1,
              //     triggered_at: new Date().toISOString(),
              //     status: "unread",
              //     messageOnlyForText: true,
              //   },
              // ]);
              // setReFetchAlerts((prev) => !prev);
            }
          } else {
            // Task moved within the same column
            const activeIndex = tasksInActiveColumn.findIndex(
              (t) => t.object_id === activeId
            );
            const overIndex = tasksInActiveColumn.findIndex(
              (t) => t.object_id === overId
            );

            if (activeIndex === -1 || overIndex === -1) return;
            const reorderedTasksInColumn = arrayMove(
              tasksInActiveColumn,
              activeIndex,
              overIndex
            );
            const tasksToUpdate = reorderedTasksInColumn.map((task, index) => ({
              ...task,
              order: index,
            }));

            if (tasksToUpdate.length > 0) {
              await handleUpdateTask(tasksToUpdate);
            }

            setDropTaskModal(null);
          }
        }
      }

      setActiveColumn(null);
      setActiveTask(null);
    },
    [
      canEdit,
      tasks,
      columns,
      dropTaskModal,
      activeTask,
      activeColumn,
      handleUpdateColumns,
      handleUpdateTask,
      colsMapping,
      // setReFetchAlerts,
      t,
    ]
  );

  const onDragOver = useCallback(
    (event: DragOverEvent) => {
      if (!canEdit) return;
      const { active, over } = event;
      if (!over || !tasks || !columns) return;

      const activeId = active.id;
      const overId = over.id;

      if (activeId === overId) return;

      const isActiveATask = active.data.current?.type === "Task";
      const isOverATask = over.data.current?.type === "Task";
      const isOverAColumn = over.data.current?.type === "Column";

      if (!isActiveATask) return;

      let overColumnID: KanbanBoardId | undefined;

      if (isOverAColumn) {
        overColumnID = over.data.current?.column?.id;
      } else if (isOverATask) {
        overColumnID = over.data.current?.task?.column_id;
      }

      // Update dropTaskModal state to reflect current drag-over situation
      if (overColumnID && activeTask?.object_id) {
        setDropTaskModal({
          showModal: false,
          message: undefined,
          allowedToDrop: true,
          droppedColumnID: overColumnID,
          droppedTaskID: activeTask.object_id,
          isSameColumn: overColumnID === activeTask.column_id,
          overElementId: String(overId),
        });
      }

      // updates the `dropTaskModal` to know where the task would be dropped
      if (isActiveATask && isOverATask) {
        const activeTaskData = active.data.current?.task as T;
        const overTaskData = over.data.current?.task as T;

        if (activeTaskData.column_id !== overTaskData.column_id) {
          setDropTaskModal((prev) => {
            if (prev) {
              return {
                ...prev,
                droppedColumnID: overTaskData.column_id,
                isSameColumn: false,
              };
            }
            return {
              showModal: false,
              message: undefined,
              allowedToDrop: true,
              droppedTaskID: activeTaskData.object_id,
              droppedColumnID: overTaskData.column_id,
              isSameColumn: false,
            };
          });
        }
      }

      if (isActiveATask && isOverAColumn) {
        const activeTaskData = active.data.current?.task as T;

        setDropTaskModal((prev) => {
          if (prev) {
            return {
              ...prev,
              droppedColumnID: over.data.current?.column?.id,
              isSameColumn:
                over.data.current?.column?.id === activeTaskData?.column_id,
            };
          }
          return {
            showModal: false,
            message: undefined,
            allowedToDrop: true,
            droppedTaskID: activeTaskData.object_id,
            droppedColumnID: over.data.current?.column?.id,
            isSameColumn:
              over.data.current?.column?.id === activeTaskData?.column_id,
          };
        });
      }
    },
    [canEdit, tasks, columns, activeTask]
  );

  return {
    sensors,
    activeColumn,
    activeTask,
    dropTaskModal,
    setDropTaskModal,
    onDragStart,
    onDragEnd,
    onDragOver,
  };
};

export default useKanbanDragAndDrop;
