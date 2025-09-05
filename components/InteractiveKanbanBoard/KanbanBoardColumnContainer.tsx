"use client";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  BoardType,
  IBaseKanbanCard,
  KanbanBoardColumn,
  KanbanBoardId,
  KanbanUserPermissionType,
  NewFormData,
  UserPossibleAssignes,
} from "./KanbanboardUtils";
import KanbanBoardTaskCard from "./KanbanBoardColumnCard";
import CompletedTasksSection from "@/app/taskManager/smallComponents/CompletedTasksSection";
import { Trash2, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import NewTaskForm from "@/app/taskManager/smallComponents/NewTaskForm";

interface Props<T extends IBaseKanbanCard> {
  column: KanbanBoardColumn;
  deleteColumn?: (id: KanbanBoardId) => void;
  updateColumn?: (id: KanbanBoardId, title: string) => void;
  tasks: T[] | undefined;
  handleCreateCard: (newFormData: NewFormData, columnId: string) => void;
  handleUpdateTask: (updatedTask: T[]) => void;
  disableColDrag?: boolean;
  disableColNameChange?: boolean;
  handleViewTask: (id: string) => void;
  handleDeleteTask: (id: string) => void;
  currentUserPermissions?: KanbanUserPermissionType;
  allUserOptions?: UserPossibleAssignes[];
  handleAssignee?: (card_id: string, data: { user_id: string }) => void;
  handleUnAssignee?: (card_id: string, data: { user_id: string }) => void;
  boardType: BoardType;

  // fetchCompanies?: (search_query: string) => Promise<CompanyInfo[] | undefined>;
  // fetchContacts?: (search_query: string) => Promise<ContactInfo[] | undefined>;
  // createContact?: (
  //   contactData: ContactInfo
  // ) => Promise<ContactInfo | undefined>;
  // createCompany?: (
  //   companyData: CompanyInfo
  // ) => Promise<CompanyInfo | undefined>;
  onOpenModal?: () => void;
  isFirstColumn?: boolean;
}

const KanbanBoardColumnContainer = <T extends IBaseKanbanCard>({
  column,
  deleteColumn,
  updateColumn,
  tasks,
  handleUpdateTask,
  disableColDrag,
  disableColNameChange,
  handleCreateCard,
  handleViewTask,
  handleDeleteTask,
  currentUserPermissions,
  allUserOptions,
  handleAssignee,
  handleUnAssignee,
  boardType,
  onOpenModal,
  isFirstColumn,
}: Props<T>) => {
  const { t } = useTranslation();

  const canAdd = currentUserPermissions?.add || false;
  const canEdit = currentUserPermissions?.edit || false;
  const canDelete = currentUserPermissions?.delete || false;

  const [editMode, setEditMode] = useState<boolean>(false);
  const [columnTitle, setColumnTitle] = useState<string>(column.title);
  const [showCreateCRMDealsForm, setShowCreateRMDealsForm] =
    useState<boolean>(false);
  const [showCreateTaskForm, setShowCreateTaskForm] = useState<boolean>(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState<boolean>(false);

  useEffect(() => {
    setColumnTitle(column.title);
  }, [column.title]);

  const handleTitleUpdate = useCallback(() => {
    if (updateColumn && columnTitle !== column.title) {
      updateColumn(column.id, columnTitle);
    }
    setEditMode(false);
  }, [updateColumn, columnTitle, column.title]);

  const activeTasks = useMemo(
    () => tasks?.filter((task) => task.status !== "Finished"),
    [tasks]
  );

  const completedTasks = useMemo(
    () => tasks?.filter((task) => task.status === "Finished"),
    [tasks]
  );

  const tasksIds = useMemo(() => {
    const visibleTasks = showCompletedTasks ? tasks : activeTasks;
    return visibleTasks?.map((task) => task.object_id);
  }, [tasks, activeTasks, showCompletedTasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: disableColDrag || editMode,
  });

  const onCreateTask = async (newTaskFormData: NewFormData) => {
    handleCreateCard(newTaskFormData, column.id);
    setShowCreateTaskForm(false);
    setShowCreateRMDealsForm(false);
  };

  const style = useMemo(
    () => ({
      transition,
      transform: CSS.Transform.toString(transform),
    }),
    [transition, transform]
  );

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="
          rounded-xl border shadow-lg bg-card/70 backdrop-blur-lg border-primary/20
          w-[357px] h-screen
          flex flex-col opacity-40
        "
      ></div>
    );
  }

  const showAddButton =
    boardType !== BoardType.Appointment ||
    (boardType === BoardType.Appointment && isFirstColumn);

  const showForm = !showCreateTaskForm && !showCreateCRMDealsForm;

  // Нова променлива, която проверява дали борда е тип Appointment
  const isAppointmentsBoard = boardType === BoardType.Appointment;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="
        rounded-xl border shadow-lg bg-card/70 backdrop-blur-lg border-primary/20
        w-[357px] h-screen
        flex flex-col
      "
    >
      <div
        {...attributes}
        {...listeners}
        onClick={() => {
          // Деактивиране на редактирането на името на колоната, ако борда е тип Appointment
          if (isAppointmentsBoard || disableColNameChange || !canEdit) {
            return;
          }
          setEditMode(true);
        }}
        className={`
          h-[60px] p-3 font-bold
          flex items-center justify-between rounded-t-xl
          bg-card/70 backdrop-blur-lg
          ${disableColDrag ? "cursor-default" : "cursor-grab"}
        `}
      >
        <div className="flex items-center gap-4">
          <div
            className="
              flex items-center justify-center p-1.5 px-3 rounded-full
              bg-gray-200 dark:bg-zinc-900
              border border-gray-400 dark:border-gray-700
            "
          >
            <span className="text-sm font-normal text-gray-700 dark:text-gray-300">
              {tasks?.length}
            </span>
          </div>

          {!editMode && (
            <h4 className="text-xl font-semibold text-primary">
              {column.title}
            </h4>
          )}

          {editMode && (
            <input
              type="text"
              value={columnTitle}
              onChange={(e) => setColumnTitle(e.target.value)}
              autoFocus
              onBlur={handleTitleUpdate}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
              className="
                p-1 border border-gray-300 dark:border-gray-700 rounded-md
                text-sm bg-white dark:bg-gray-950
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
              // Полетата са деактивирани, ако борда е тип Appointment
              disabled={!canEdit || isAppointmentsBoard}
            />
          )}
        </div>
        {/* Бутонът за изтриване се рендерира само ако борда НЕ Е тип Appointment */}
        {!isAppointmentsBoard && deleteColumn ? (
          <button
            aria-label="delete column"
            onClick={() => {
              if (canDelete) {
                deleteColumn(column.id);
              }
            }}
            disabled={!canDelete}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={20} />
          </button>
        ) : null}
      </div>

      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <div className="p-2 w-full">
          {showForm && showAddButton && (
            <button
              onClick={() => {
                if (boardType === BoardType.Appointment && onOpenModal) {
                  onOpenModal();
                  return;
                }
                // if (boardType === BoardType.KanbanTask) {
                //   setShowCreateTaskForm(true);
                // } else if (boardType === BoardType.SRMDeals) {
                //   setShowCreateRMDealsForm(true);
                // } else if (
                //   boardType === BoardType.UMTBoard &&
                //   showUMTMultiStepBodal
                // ) {
                //   showUMTMultiStepBodal();
                // }
              }}
              className="
                w-full flex items-center justify-start
                py-2 px-3 rounded-md text-gray-500 dark:text-gray-400
                hover:bg-gray-200 dark:hover:bg-zinc-700
                hover:text-gray-900 dark:hover:text-gray-50
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              "
              disabled={!canAdd}
            >
              <Plus size={20} className="mr-2" />
              <span>Add</span>
            </button>
          )}

          {allUserOptions && canAdd && showCreateTaskForm && (
            <NewTaskForm
              allUserOptions={allUserOptions}
              onSubmit={onCreateTask}
              onCancel={() => setShowCreateTaskForm(false)}
            />
          )}
        </div>

        {activeTasks && tasksIds && (
          <SortableContext items={tasksIds}>
            {activeTasks.map((task) => (
              <KanbanBoardTaskCard
                handleAssignee={handleAssignee}
                currentUserPermissions={currentUserPermissions}
                handleViewTask={handleViewTask}
                key={task.object_id}
                handleDeleteTask={handleDeleteTask}
                task={task}
                handleUpdateTask={handleUpdateTask}
                allUserOptions={allUserOptions}
                handleUnAssignee={handleUnAssignee}
              />
            ))}
            {completedTasks && completedTasks.length > 0 && (
              <CompletedTasksSection
                handleUnAssignee={handleUnAssignee}
                completedTasks={completedTasks}
                showCompletedTasks={showCompletedTasks}
                setShowCompletedTasks={setShowCompletedTasks}
                handleAssignee={handleAssignee}
                currentUserPermissions={currentUserPermissions}
                handleViewTask={handleViewTask}
                handleDeleteTask={handleDeleteTask}
                handleUpdateTask={handleUpdateTask}
                allUserOptions={allUserOptions}
              />
            )}
          </SortableContext>
        )}
      </div>
    </div>
  );
};

export default KanbanBoardColumnContainer;
// "use client";
// import { SortableContext, useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { useEffect, useMemo, useState, useCallback } from "react";
// import {
//   BoardType,
//   IBaseKanbanCard,
//   KanbanBoardColumn,
//   KanbanBoardId,
//   KanbanUserPermissionType,
//   NewFormData,
//   UserPossibleAssignes,
// } from "./KanbanboardUtils";
// import KanbanBoardTaskCard from "./KanbanBoardColumnCard";
// import CompletedTasksSection from "@/app/taskManager/smallComponents/CompletedTasksSection";
// import { Trash2, Plus } from "lucide-react";
// import { useTranslation } from "react-i18next";
// import NewTaskForm from "@/app/taskManager/smallComponents/NewTaskForm";

// interface Props<T extends IBaseKanbanCard> {
//   column: KanbanBoardColumn;
//   deleteColumn?: (id: KanbanBoardId) => void;
//   updateColumn?: (id: KanbanBoardId, title: string) => void;
//   tasks: T[] | undefined;
//   handleCreateCard: (newFormData: NewFormData, columnId: string) => void;
//   handleUpdateTask: (updatedTask: T[]) => void;
//   disableColDrag?: boolean;
//   disableColNameChange?: boolean;
//   handleViewTask: (id: string) => void;
//   handleDeleteTask: (id: string) => void;
//   currentUserPermissions?: KanbanUserPermissionType;
//   allUserOptions?: UserPossibleAssignes[];
//   handleAssignee?: (card_id: string, data: { user_id: string }) => void;
//   handleUnAssignee?: (card_id: string, data: { user_id: string }) => void;
//   boardType: BoardType;

//   // fetchCompanies?: (search_query: string) => Promise<CompanyInfo[] | undefined>;
//   // fetchContacts?: (search_query: string) => Promise<ContactInfo[] | undefined>;
//   // createContact?: (
//   //   contactData: ContactInfo
//   // ) => Promise<ContactInfo | undefined>;
//   // createCompany?: (
//   //   companyData: CompanyInfo
//   // ) => Promise<CompanyInfo | undefined>;
//   onOpenModal?: () => void;
//   isFirstColumn?: boolean;
// }

// const KanbanBoardColumnContainer = <T extends IBaseKanbanCard>({
//   column,
//   deleteColumn,
//   updateColumn,
//   tasks,
//   handleUpdateTask,
//   disableColDrag,
//   disableColNameChange,
//   handleCreateCard,
//   handleViewTask,
//   handleDeleteTask,
//   currentUserPermissions,
//   allUserOptions,
//   handleAssignee,
//   handleUnAssignee,
//   boardType,
//   onOpenModal,
//   isFirstColumn,
// }: Props<T>) => {
//   const { t } = useTranslation();

//   const canAdd = currentUserPermissions?.add || false;
//   const canEdit = currentUserPermissions?.edit || false;
//   const canDelete = currentUserPermissions?.delete || false;

//   const [editMode, setEditMode] = useState<boolean>(false);
//   const [columnTitle, setColumnTitle] = useState<string>(column.title);
//   const [showCreateCRMDealsForm, setShowCreateRMDealsForm] =
//     useState<boolean>(false);
//   const [showCreateTaskForm, setShowCreateTaskForm] = useState<boolean>(false);
//   const [showCompletedTasks, setShowCompletedTasks] = useState<boolean>(false);

//   useEffect(() => {
//     setColumnTitle(column.title);
//   }, [column.title]);

//   const handleTitleUpdate = useCallback(() => {
//     if (updateColumn && columnTitle !== column.title) {
//       updateColumn(column.id, columnTitle);
//     }
//     setEditMode(false);
//   }, [updateColumn, columnTitle, column.title]);

//   const activeTasks = useMemo(
//     () => tasks?.filter((task) => task.status !== "Finished"),
//     [tasks]
//   );

//   const completedTasks = useMemo(
//     () => tasks?.filter((task) => task.status === "Finished"),
//     [tasks]
//   );

//   const tasksIds = useMemo(() => {
//     const visibleTasks = showCompletedTasks ? tasks : activeTasks;
//     return visibleTasks?.map((task) => task.object_id);
//   }, [tasks, activeTasks, showCompletedTasks]);

//   const {
//     setNodeRef,
//     attributes,
//     listeners,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({
//     id: column.id,
//     data: {
//       type: "Column",
//       column,
//     },
//     disabled: disableColDrag || editMode,
//   });

//   const onCreateTask = async (newTaskFormData: NewFormData) => {
//     handleCreateCard(newTaskFormData, column.id);
//     setShowCreateTaskForm(false);
//     setShowCreateRMDealsForm(false);
//   };

//   const style = useMemo(
//     () => ({
//       transition,
//       transform: CSS.Transform.toString(transform),
//     }),
//     [transition, transform]
//   );

//   if (isDragging) {
//     return (
//       <div
//         ref={setNodeRef}
//         style={style}
//         className="
//           rounded-xl border shadow-lg bg-card/70 backdrop-blur-lg border-primary/20
//           w-[357px] h-screen
//           flex flex-col opacity-40
//         "
//       ></div>
//     );
//   }

//   const showAddButton =
//     boardType !== BoardType.Appointment ||
//     (boardType === BoardType.Appointment && isFirstColumn);

//   const showForm = !showCreateTaskForm && !showCreateCRMDealsForm;

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className="
//         rounded-xl border shadow-lg bg-card/70 backdrop-blur-lg border-primary/20
//         w-[357px] h-screen
//         flex flex-col
//       "
//     >
//       <div
//         {...attributes}
//         {...listeners}
//         onClick={() => {
//           if (disableColNameChange || !canEdit) {
//             return;
//           }
//           setEditMode(true);
//         }}
//         className={`
//           h-[60px] p-3 font-bold
//           flex items-center justify-between rounded-t-xl
//           bg-card/70 backdrop-blur-lg
//           ${disableColDrag ? "cursor-default" : "cursor-grab"}
//         `}
//       >
//         <div className="flex items-center gap-4">
//           <div
//             className="
//               flex items-center justify-center p-1.5 px-3 rounded-full
//               bg-gray-200 dark:bg-zinc-900
//               border border-gray-400 dark:border-gray-700
//             "
//           >
//             <span className="text-sm font-normal text-gray-700 dark:text-gray-300">
//               {tasks?.length}
//             </span>
//           </div>

//           {!editMode && (
//             <h4 className="text-xl font-semibold text-primary">
//               {column.title}
//             </h4>
//           )}

//           {editMode && (
//             <input
//               type="text"
//               value={columnTitle}
//               onChange={(e) => setColumnTitle(e.target.value)}
//               autoFocus
//               onBlur={handleTitleUpdate}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") {
//                   e.currentTarget.blur();
//                 }
//               }}
//               className="
//                 p-1 border border-gray-300 dark:border-gray-700 rounded-md
//                 text-sm bg-white dark:bg-gray-950
//                 focus:outline-none focus:ring-2 focus:ring-blue-500
//               "
//               disabled={!canEdit}
//             />
//           )}
//         </div>
//         {BoardType.Appointment != boardType && deleteColumn ? (
//           <button
//             aria-label="delete column"
//             onClick={() => {
//               if (canDelete) {
//                 deleteColumn(column.id);
//               }
//             }}
//             disabled={!canDelete}
//             className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <Trash2 size={20} />
//           </button>
//         ) : null}
//       </div>

//       <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
//         <div className="p-2 w-full">
//           {showForm && showAddButton && (
//             <button
//               onClick={() => {
//                 if (boardType === BoardType.Appointment && onOpenModal) {
//                   onOpenModal();
//                   return;
//                 }
//                 // if (boardType === BoardType.KanbanTask) {
//                 //   setShowCreateTaskForm(true);
//                 // } else if (boardType === BoardType.SRMDeals) {
//                 //   setShowCreateRMDealsForm(true);
//                 // } else if (
//                 //   boardType === BoardType.UMTBoard &&
//                 //   showUMTMultiStepBodal
//                 // ) {
//                 //   showUMTMultiStepBodal();
//                 // }
//               }}
//               className="
//                 w-full flex items-center justify-start
//                 py-2 px-3 rounded-md text-gray-500 dark:text-gray-400
//                 hover:bg-gray-200 dark:hover:bg-zinc-700
//                 hover:text-gray-900 dark:hover:text-gray-50
//                 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
//               "
//               disabled={!canAdd}
//             >
//               <Plus size={20} className="mr-2" />
//               <span>Add</span>
//             </button>
//           )}

//           {allUserOptions && canAdd && showCreateTaskForm && (
//             <NewTaskForm
//               allUserOptions={allUserOptions}
//               onSubmit={onCreateTask}
//               onCancel={() => setShowCreateTaskForm(false)}
//             />
//           )}
//           {/* {showCreateCRMDealsForm && (
//             <NewDealsForm
//               onSubmit={onCreateTask}
//               onCancel={() => setShowCreateRMDealsForm(false)}
//               fetchCompanies={fetchCompanies}
//               fetchContacts={fetchContacts}
//               createContact={createContact}
//               createCompany={createCompany}
//             />
//           )} */}
//         </div>

//         {activeTasks && tasksIds && (
//           <SortableContext items={tasksIds}>
//             {activeTasks.map((task) => (
//               <KanbanBoardTaskCard
//                 handleAssignee={handleAssignee}
//                 currentUserPermissions={currentUserPermissions}
//                 handleViewTask={handleViewTask}
//                 key={task.object_id}
//                 handleDeleteTask={handleDeleteTask}
//                 task={task}
//                 handleUpdateTask={handleUpdateTask}
//                 // boardType={boardType}
//                 allUserOptions={allUserOptions}
//                 handleUnAssignee={handleUnAssignee}
//               />
//             ))}
//             {completedTasks && completedTasks.length > 0 && (
//               <CompletedTasksSection
//                 handleUnAssignee={handleUnAssignee}
//                 completedTasks={completedTasks}
//                 showCompletedTasks={showCompletedTasks}
//                 setShowCompletedTasks={setShowCompletedTasks}
//                 handleAssignee={handleAssignee}
//                 currentUserPermissions={currentUserPermissions}
//                 handleViewTask={handleViewTask}
//                 handleDeleteTask={handleDeleteTask}
//                 handleUpdateTask={handleUpdateTask}
//                 allUserOptions={allUserOptions}
//                 // boardType={boardType}
//               />
//             )}
//           </SortableContext>
//         )}
//       </div>
//     </div>
//   );
// };

// export default KanbanBoardColumnContainer;
