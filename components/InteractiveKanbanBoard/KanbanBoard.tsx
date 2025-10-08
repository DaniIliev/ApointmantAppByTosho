import { useMemo } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import {
  BoardType,
  IBaseKanbanCard,
  KanbanBoardColumn,
  KanbanBoardId,
  KanbanUserPermissionType,
  NewFormData,
  UserPossibleAssignee,
} from "./KanbanboardUtils";
import KanbanBoardColumnContainer from "./KanbanBoardColumnContainer";
import KanbanBoardTaskCard from "./KanbanBoardColumnCard";
import useKanbanDragAndDrop from "./hooks/useKanbanDragAndDrop";
import NewColumnCreator from "./smallComponents/NewColumnCreater";
import DragPermissionModal from "./modals/DragPermisionsModal";
import { useTranslation } from "react-i18next";

interface KanbanBoardProps<T extends IBaseKanbanCard> {
  tasks: T[] | undefined;
  handleUpdateTask: (updated: T[]) => Promise<void>;
  columns: KanbanBoardColumn[] | undefined;
  handleCreateCard: (newFormData: NewFormData, columnId: string) => void;
  handleViewTask: (id: string) => void;
  handleDeleteTask: (id: string) => void;
  boardType: BoardType;

  handleUpdateColumns?: (updatedColumns: KanbanBoardColumn[]) => void;
  handleDeleteColumn?: (columnId: KanbanBoardId) => void;
  handleCreateColumn?: (newColumn: KanbanBoardColumn) => void;
  allUserOptions?: UserPossibleAssignee[];
  currentUserPermissions?: KanbanUserPermissionType;
  handleAssignee?: (card_id: string, data: { user_id: string }) => void;
  handleUnAssignee?: (card_id: string, data: { user_id: string }) => void;
  onOpenModal?: () => void;
}

const KanbanBoard = <T extends IBaseKanbanCard>({
  tasks,
  handleUpdateTask,
  columns,
  handleAssignee,
  handleUpdateColumns,
  handleDeleteColumn,
  handleCreateColumn,
  handleCreateCard,
  handleViewTask,
  handleDeleteTask,
  allUserOptions,
  currentUserPermissions,
  handleUnAssignee,
  boardType,
  onOpenModal,
}: KanbanBoardProps<T>) => {
  const { t } = useTranslation();

  const canAdd = currentUserPermissions?.add || false;
  const canEdit = currentUserPermissions?.edit || false;
  const canDelete = currentUserPermissions?.delete || false;

  const {
    sensors,
    activeColumn,
    activeTask,
    dropTaskModal,
    setDropTaskModal,
    onDragStart,
    onDragEnd,
    onDragOver,
  } = useKanbanDragAndDrop({
    tasks,
    columns,
    handleUpdateTask,
    handleUpdateColumns,
    canEdit,
    colsMapping: useMemo(() => {
      const mapping: Record<KanbanBoardId, KanbanBoardColumn> = {};
      columns?.forEach((item) => {
        mapping[item.id] = item;
      });
      return mapping;
    }, [columns]),
    t,
  });

  const columnsId = useMemo(
    () => columns?.map((col) => col.id) || [],
    [columns]
  );

  const createNewColumn = (columnName?: string) => {
    if (!canAdd) return;
    const name = columnName?.trim();
    if (!name) return;
    const newColumn: KanbanBoardColumn = {
      id: String(Math.random()),
      title: name,
      order: columns ? columns.length : 0,
    };
    handleCreateColumn?.(newColumn);
  };

  const deleteColumn = (id: KanbanBoardId) => {
    if (!canDelete) return;
    handleDeleteColumn?.(id);
  };

  const updateColumn = (id: KanbanBoardId, title: string) => {
    if (!canEdit) return;
    if (columns) {
      const updatedColumns = columns.map((col) =>
        col.id === id ? { ...col, title } : col
      );
      handleUpdateColumns?.(updatedColumns);
    }
  };

  const isAppointmentsBoard = boardType === BoardType.Appointment;

  return (
    <div className="z-50 flex flex-col items-center w-full overflow-x-auto">
      <div
        className={`flex w-full items-start h-screen overflow-y-hidden p-5 ${
          isAppointmentsBoard ? "justify-center" : "justify-start"
        }`}
      >
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
        >
          {/* Conditional rendering for SortableContext */}
          {tasks &&
            columns &&
            (isAppointmentsBoard ? (
              <div className="flex gap-4">
                {columns.map((col, index) => (
                  <KanbanBoardColumnContainer
                    handleAssignee={handleAssignee}
                    handleViewTask={handleViewTask}
                    key={col.id}
                    column={col}
                    updateColumn={updateColumn}
                    deleteColumn={deleteColumn}
                    tasks={tasks.filter((task) => task.column_id === col.id)}
                    handleUpdateTask={handleUpdateTask}
                    handleCreateCard={handleCreateCard}
                    handleDeleteTask={handleDeleteTask}
                    currentUserPermissions={currentUserPermissions}
                    allUserOptions={allUserOptions}
                    handleUnAssignee={handleUnAssignee}
                    boardType={boardType}
                    onOpenModal={onOpenModal}
                    isFirstColumn={index === 0}
                    disableColDrag={boardType === BoardType.Appointment}
                  />
                ))}
              </div>
            ) : (
              <SortableContext items={columnsId}>
                <div className="flex gap-4">
                  {columns.map((col, index) => (
                    <KanbanBoardColumnContainer
                      handleAssignee={handleAssignee}
                      handleViewTask={handleViewTask}
                      key={col.id}
                      column={col}
                      updateColumn={updateColumn}
                      deleteColumn={deleteColumn}
                      tasks={tasks.filter((task) => task.column_id === col.id)}
                      handleUpdateTask={handleUpdateTask}
                      handleCreateCard={handleCreateCard}
                      handleDeleteTask={handleDeleteTask}
                      currentUserPermissions={currentUserPermissions}
                      allUserOptions={allUserOptions}
                      handleUnAssignee={handleUnAssignee}
                      boardType={boardType}
                      onOpenModal={onOpenModal}
                      isFirstColumn={index === 0}
                      // disableColDrag={boardType === BoardType.UMTBoard}
                    />
                  ))}
                </div>
              </SortableContext>
            ))}
          {boardType !== BoardType.Appointment && (
            <NewColumnCreator
              canAdd={canAdd}
              onCreateColumn={createNewColumn}
            />
          )}
          {createPortal(
            <DragOverlay>
              {activeColumn && (
                <KanbanBoardColumnContainer
                  handleAssignee={handleAssignee}
                  allUserOptions={allUserOptions}
                  handleViewTask={handleViewTask}
                  column={activeColumn}
                  updateColumn={updateColumn}
                  tasks={tasks?.filter(
                    (task) => task.column_id === activeColumn.id
                  )}
                  handleUpdateTask={handleUpdateTask}
                  handleCreateCard={handleCreateCard}
                  handleDeleteTask={handleDeleteTask}
                  currentUserPermissions={currentUserPermissions}
                  handleUnAssignee={handleUnAssignee}
                  onOpenModal={onOpenModal}
                  boardType={boardType}
                />
              )}
              {activeTask && (
                <KanbanBoardTaskCard
                  handleAssignee={handleAssignee}
                  allUserOptions={allUserOptions}
                  currentUserPermissions={currentUserPermissions}
                  handleViewTask={handleViewTask}
                  task={activeTask}
                  handleUpdateTask={handleUpdateTask}
                  handleDeleteTask={handleDeleteTask}
                  handleUnAssignee={handleUnAssignee}
                />
              )}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>
      <DragPermissionModal
        dropTaskModal={dropTaskModal}
        onClose={() => setDropTaskModal(null)}
      />
    </div>
  );
};

export default KanbanBoard;

// import { useMemo } from "react";
// import { DndContext, DragOverlay } from "@dnd-kit/core";
// import { SortableContext } from "@dnd-kit/sortable";
// import { createPortal } from "react-dom";
// import {
//   BoardType,
//   // BoardType,
//   IBaseKanbanCard,
//   KanbanBoardColumn,
//   KanbanBoardId,
//   KanbanUserPermissionType,
//   NewFormData,
//   UserPossibleAssignes,
// } from "./KanbanboardUtils";
// import KanbanBoardColumnContainer from "./KanbanBoardColumnContainer";
// import KanbanBoardTaskCard from "./KanbanBoardColumnCard";
// import useKanbanDragAndDrop from "./hooks/useKanbanDragAndDrop";
// import NewColumnCreator from "./smallComponents/NewColumnCreater";
// import DragPermissionModal from "./modals/DragPermisionsModal";
// // import { CompanyInfo, ContactInfo } from "../../../pages/CRM/CRMTypes";
// import { useTranslation } from "react-i18next";

// interface KanbanBoardProps<T extends IBaseKanbanCard> {
//   tasks: T[] | undefined;
//   handleUpdateTask: (updated: T[]) => Promise<void>;
//   columns: KanbanBoardColumn[] | undefined;
//   handleCreateCard: (newFormData: NewFormData, columnId: string) => void;
//   handleViewTask: (id: string) => void;
//   handleDeleteTask: (id: string) => void;
//   boardType: BoardType;

//   handleUpdateColumns?: (updatedColumns: KanbanBoardColumn[]) => void;
//   handleDeleteColumn?: (columnId: KanbanBoardId) => void;
//   handleCreateColumn?: (newColumn: KanbanBoardColumn) => void;
//   allUserOptions?: UserPossibleAssignes[];
//   currentUserPermissions?: KanbanUserPermissionType;
//   handleAssignee?: (card_id: string, data: { user_id: string }) => void;
//   handleUnAssignee?: (card_id: string, data: { user_id: string }) => void;
//   // fetchCompanies?: (search_query: string) => Promise<CompanyInfo[] | undefined>;
//   // fetchContacts?: (search_query: string) => Promise<ContactInfo[] | undefined>;
//   // createContact?: (
//   //   contactData: ContactInfo
//   // ) => Promise<ContactInfo | undefined>;
//   // createCompany?: (
//   //   companyData: CompanyInfo
//   // ) => Promise<CompanyInfo | undefined>;
//   onOpenModal?: () => void;
// }
// const KanbanBoard = <T extends IBaseKanbanCard>({
//   tasks,
//   handleUpdateTask,
//   columns,
//   handleAssignee,
//   handleUpdateColumns,
//   handleDeleteColumn,
//   handleCreateColumn,
//   handleCreateCard,
//   handleViewTask,
//   handleDeleteTask,
//   allUserOptions,
//   currentUserPermissions,
//   handleUnAssignee,
//   boardType,
//   // fetchCompanies,
//   // fetchContacts,
//   // createContact,
//   // createCompany,
//   onOpenModal,
// }: KanbanBoardProps<T>) => {
//   const { t } = useTranslation();
//   // const { setReFetchAlerts } = useAuthedContext();

//   const canAdd = currentUserPermissions?.add || false;
//   const canEdit = currentUserPermissions?.edit || false;
//   const canDelete = currentUserPermissions?.delete || false;

//   const {
//     sensors,
//     activeColumn,
//     activeTask,
//     dropTaskModal,
//     setDropTaskModal,
//     onDragStart,
//     onDragEnd,
//     onDragOver,
//   } = useKanbanDragAndDrop({
//     tasks,
//     columns,
//     handleUpdateTask,
//     handleUpdateColumns,
//     canEdit,
//     colsMapping: useMemo(() => {
//       const mapping: Record<KanbanBoardId, KanbanBoardColumn> = {};
//       columns?.forEach((item) => {
//         mapping[item.id] = item;
//       });
//       return mapping;
//     }, [columns]),
//     // setReFetchAlerts,
//     t,
//   });

//   const columnsId = useMemo(
//     () => columns?.map((col) => col.id) || [],
//     [columns]
//   );

//   const createNewColumn = (columnName?: string) => {
//     if (!canAdd) return;
//     const name = columnName?.trim();
//     if (!name) return;
//     const newColumn: KanbanBoardColumn = {
//       id: String(Math.random()),
//       title: name,
//       order: columns ? columns.length : 0,
//     };
//     handleCreateColumn?.(newColumn);
//   };

//   const deleteColumn = (id: KanbanBoardId) => {
//     if (!canDelete) return;
//     handleDeleteColumn?.(id);
//   };

//   const updateColumn = (id: KanbanBoardId, title: string) => {
//     if (!canEdit) return;
//     if (columns) {
//       const updatedColumns = columns.map((col) =>
//         col.id === id ? { ...col, title } : col
//       );
//       handleUpdateColumns?.(updatedColumns);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center w-full overflow-x-auto">
//       <div className="flex w-full items-start justify-start h-screen overflow-y-hidden p-5">
//         <DndContext
//           sensors={sensors}
//           onDragStart={onDragStart}
//           onDragEnd={onDragEnd}
//           onDragOver={onDragOver}
//         >
//           <div className="flex gap-4">
//             {tasks && columns && (
//               <SortableContext items={columnsId}>
//                 {columns.map((col, index) => (
//                   <KanbanBoardColumnContainer
//                     handleAssignee={handleAssignee}
//                     handleViewTask={handleViewTask}
//                     key={col.id}
//                     column={col}
//                     updateColumn={updateColumn}
//                     deleteColumn={deleteColumn}
//                     tasks={tasks.filter((task) => task.column_id === col.id)}
//                     handleUpdateTask={handleUpdateTask}
//                     handleCreateCard={handleCreateCard}
//                     handleDeleteTask={handleDeleteTask}
//                     currentUserPermissions={currentUserPermissions}
//                     allUserOptions={allUserOptions}
//                     handleUnAssignee={handleUnAssignee}
//                     boardType={boardType}
//                     // fetchCompanies={fetchCompanies}
//                     // fetchContacts={fetchContacts}
//                     // createContact={createContact}
//                     // createCompany={createCompany}
//                     onOpenModal={onOpenModal}
//                     isFirstColumn={index === 0}
//                     // disableColDrag={boardType === BoardType.UMTBoard}
//                   />
//                 ))}
//               </SortableContext>
//             )}
//             <NewColumnCreator
//               canAdd={canAdd}
//               onCreateColumn={createNewColumn}
//             />
//           </div>
//           {createPortal(
//             <DragOverlay>
//               {activeColumn && (
//                 <KanbanBoardColumnContainer
//                   handleAssignee={handleAssignee}
//                   allUserOptions={allUserOptions}
//                   handleViewTask={handleViewTask}
//                   column={activeColumn}
//                   updateColumn={updateColumn}
//                   tasks={tasks?.filter(
//                     (task) => task.column_id === activeColumn.id
//                   )}
//                   handleUpdateTask={handleUpdateTask}
//                   handleCreateCard={handleCreateCard}
//                   handleDeleteTask={handleDeleteTask}
//                   currentUserPermissions={currentUserPermissions}
//                   handleUnAssignee={handleUnAssignee}
//                   onOpenModal={onOpenModal}
//                   boardType={boardType}
//                 />
//               )}
//               {activeTask && (
//                 <KanbanBoardTaskCard
//                   handleAssignee={handleAssignee}
//                   allUserOptions={allUserOptions}
//                   currentUserPermissions={currentUserPermissions}
//                   handleViewTask={handleViewTask}
//                   task={activeTask}
//                   handleUpdateTask={handleUpdateTask}
//                   handleDeleteTask={handleDeleteTask}
//                   handleUnAssignee={handleUnAssignee}
//                 />
//               )}
//             </DragOverlay>,
//             document.body
//           )}
//         </DndContext>
//       </div>

//       <DragPermissionModal
//         dropTaskModal={dropTaskModal}
//         onClose={() => setDropTaskModal(null)}
//       />
//     </div>
//   );
// };

// export default KanbanBoard;
