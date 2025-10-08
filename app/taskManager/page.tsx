"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
// import Alert from "../../Components/MaterialUI/Alert";
// import { useOutletContext } from "react-router-dom";
// import { AppRouterProps } from "../../Layout/layoutVariables";
// import PageTitle from "../../Components/SmallComponents/PageTitle/PageTitle"; // This component needs to be refactored
// This component needs to be refactored
import {
  BoardType,
  // BoardType,
  // getAllStatuses,
  // GetRole,
  KanbanBoardColumn,
  KanbanBoardId,
  // KanbanBoardListItem,
  // KanbanBoardPermissions,
  // KanbanBoardType,
  // KanbanTask,
  KanbanUserPrivilege,
  NewFormData,
  // OrganizerUserWithPrivileges,
  // TableData,
  UserPossibleAssignee,
} from "@/components/InteractiveKanbanBoard/KanbanboardUtils";
// import {
//   getQueryKanbanBoard,
//   getQueryKanbanBoardPermissions,
//   getQueryKanbanBoards,
//   getQueryKanbanBoardUserRoles,
//   getQueryKanbanBordCardById,
//   getQueryKanbanCardsTable,
//   getQueryOrgananizerUsersWithPermissions,
//   getQueyKanbanBoardPossibleAssignees,
// } from "./KanbanBoardTaskManager/API/apiKanbanBoardGETQueries";
// import {
//   postQueryKanbanBoardCardAssignee,
//   postQueryKanbanBoardNewColumn,
//   postQueryKanbanBoardNewTask,
// } from "./KanbanBoardTaskManager/API/apiKanbanBoardPOSTQueries";
// import ViewKanbanTaskModal from "./KanbanBoardTaskManager/Modals/ViewKanbanTaskModal"; // This component needs to be refactored
// import {
//   putQueryKanbanBoardEditColuAttachment,
//   putQueryKanbanUpdateTasks,
// } from "./KanbanBoardTaskManager/API/apiKanbanBoardPutQueries";
// import Select from "../../Components/MaterialUI/FormFields/Select";
// import KanbanCRUDModals from "./Components/SmallComponents/KanbanCRUDModals"; // This component needs to be refactored
// import AssignKanbanPermissionsForm from "./Forms/AssignKanbanPermissionsForm"; // This component needs to be refactored
// import { deleteQueryKanbanBoardCardAssignee } from "./KanbanBoardTaskManager/API/apiKanbanBoardDELETEQueries";// This component needs to be refactored
import { v4 as uuidv4 } from "uuid";
// import { checkKanbanPermissions } from "./utills/checkKanbanPermissions";
// import Modal from "../../Components/MaterialUI/Modal"; // This component needs to be refactored
import { cn } from "../../lib/utils"; // Assuming you have this utility function
import { useTranslation } from "react-i18next";
import KanbanFilters from "./smallComponents/KanbanFilter";
import KanbanBoard from "@/components/InteractiveKanbanBoard/KanbanBoard";
import { filterKanbanTasks } from "./utilsFn/filterKanbanTasks";
import { usePageTitle } from "@/context/PageTitleContext";
import { useRightNav } from "@/context/RightNavContext";
import KanbanBoardMenu from "./smallComponents/KanbanBoardMenu";
import { KanbanBoardListItem, KanbanBoardType, KanbanTask } from "./types";
import { getAllStatuses } from "./utilsFn/getStatuses";
import KanbanCRUDModals from "./Modals/KanbanCRUDModals";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getMockKanbanBoardById,
  getMockKanbanBoardsList,
} from "@/components/InteractiveKanbanBoard/lib/mockData";

const page: React.FC = () => {
  const { t } = useTranslation();
  const [pageLoading, setPageLoading] = useState<boolean>(true);

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [formStatus, setFormStatus] = useState<string | null>(null);
  const [formAlert, setFormAlert] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState(0);

  const [allKanbanBoards, setAllKanbanBoards] = useState<KanbanBoardListItem[]>(
    []
  );
  const [kanbanBoard, setKanbanBoard] = useState<KanbanBoardType | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<KanbanBoardId | null>(
    null
  );
  // const [kanbanBoard, setKanbanBoard] = useState<KanbanBoardType | null>(null);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);

  const [isSharedModalOpen, setIsSharedModalOpen] = useState<boolean>(false);
  const [openCreateBoardModal, setOpenCreateBoardModal] =
    useState<boolean>(false);
  const [openDeleteConfirmModal, setOpenDeleteConfirmModal] =
    useState<boolean>(false);
  const [itemToDeleteType, setItemToDeleteType] = useState<
    "card" | "board" | "column" | null
  >(null);

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [boardFormMode, setBoardFormMode] = useState<"edit" | "create" | null>(
    null
  );

  const [usersPossibleToAssignees, setUsersPossibleToAssignees] = useState<
    UserPossibleAssignee[]
  >([]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedPlannedEndDateFilters, setSelectedPlannedEndDateFilters] =
    useState<string[]>([]);

  const [selectedPriorityFilters, setSelectedPriorityFilters] = useState<
    string[]
  >([]);
  const [selectedStatusFilters, setSelectedStatusFilters] = useState<string[]>(
    []
  );
  const [selectedAssignedUsersFilters, setSelectedAssignedUsersFilters] =
    useState<string[]>([]);
  const [showFinishedTasks, setShowFinishedTasks] = useState(true);

  const [selectedCustomDueDate, setSelectedCustomDueDate] = useState<
    Date | undefined
  >(undefined);

  const { setPageTitle } = usePageTitle();
  const { setExtraRightNavMenu, setIsRightNavVisible } = useRightNav();

  useEffect(() => {
    setPageTitle(t("Dashboard"));
    setExtraRightNavMenu(
      <KanbanBoardMenu
        setBoardFormMode={setBoardFormMode}
        deleteBoard={() => setItemToDeleteType("board")}
        handleOpenCreateBoardModal={() => setOpenCreateBoardModal(true)}
        handleOpenDeleteBoardConfirm={() => setOpenDeleteConfirmModal(true)}
        handleOpenSharedModal={() => setIsSharedModalOpen(true)}
        isKanbanBoardSelected={!!selectedBoardId}
        isCreatingNewBoard={openCreateBoardModal || openDeleteConfirmModal}
      />
    );

    setIsRightNavVisible(true);
    return () => {
      setPageTitle(null);
      setExtraRightNavMenu(null);
      setIsRightNavVisible(false);
    };
  }, [setPageTitle, setExtraRightNavMenu, setIsRightNavVisible, t]);
  useEffect(() => {
    (async () => {
      setPageLoading(true);
      const mockBoards = getMockKanbanBoardsList();
      setAllKanbanBoards(mockBoards);
      // await fetchAllKanbanBoards();
      // await handleFetchCardsForTable();
      setPageLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (selectedBoardId) {
      // fetchSpecificKanbanBoard(selectedBoardId);
      // possibleAssignes(selectedBoardId);
      const mockBoard = getMockKanbanBoardById(selectedBoardId);
      setKanbanBoard(mockBoard);

      // possibleAssignes(selectedBoardId); // Use mockUsers instead
      // setUsersPossibleToAssignees(mockUsers);
    } else {
      setKanbanBoard(null);
      // setKanbanBoardPermissions(null);
    }
  }, [selectedBoardId]);

  const fetchAllKanbanBoards = async () => {
    // try {
    //   const boards = await callApi<KanbanBoardListItem[]>({
    //     query: getQueryKanbanBoards(),
    //     auth: { setAuthedUser },
    //   });
    //   setAllKanbanBoards(boards);
    // } catch (error) {
    //   console.error("Error fetching all kanban boards:", error);
    //   setFormStatus("error");
    //   setFormAlert(t("Error fetching kanban boards list."));
    // }
  };

  const handleFetchCardsForTable = async () => {
    // try {
    //   const fetchedTasks = await callApi<TableData>({
    //     query: getQueryKanbanCardsTable(),
    //     auth: { setAuthedUser },
    //   });
    //   setTableTasks(fetchedTasks);
    // } catch (error) {
    //   console.error("Error fetching all tasks for table:", error);
    //   setFormStatus("error");
    //   setFormAlert(t("Error fetching all tasks for table view."));
    // }
  };

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedBoardId(null);
    setTabValue(newValue);
  };

  const fetchSpecificKanbanBoard = async (boardId: KanbanBoardId) => {
    setPageLoading(true);
    const mockBoard = getMockKanbanBoardById(boardId);
    console.log("mockBoard", mockBoard);
    setKanbanBoard(mockBoard);
    // try {
    //   const board = await callApi<KanbanBoardType>({
    //     query: getQueryKanbanBoard(boardId),
    //     auth: { setAuthedUser },
    //   });
    //   console.log("board", board);
    //   setKanbanBoard(board);
    //   setPageLoading(false);
    // } catch (error) {
    //   console.error(`Error fetching kanban board with ID ${boardId}:`, error);
    //   setFormStatus("error");
    //   setFormAlert(t("Error fetching selected kanban board."));
    //   setPageLoading(false);
    // }
  };

  const fetchKanbanBoardPermissions = async (boardId: string) => {
    // try {
    //   const data = await callApi<KanbanBoardPermissions>({
    //     query: getQueryKanbanBoardPermissions(boardId),
    //     auth: { setAuthedUser },
    //   });
    //   const usersWithPrivileges = await Promise.all(
    //     data.users.map(async (user) => {
    //       const usersMatchingName = await callApi<
    //         OrganizerUserWithPrivileges[]
    //       >({
    //         query: getQueryOrgananizerUsersWithPermissions(user.username),
    //         auth: { setAuthedUser },
    //       });
    //       const userWithCorrectPrivileges = usersMatchingName.find(
    //         (userP) => userP.user_id === user.user_id
    //       );
    //       return {
    //         ...user,
    //         originalPrivileges: userWithCorrectPrivileges
    //           ? userWithCorrectPrivileges.privileges
    //           : [],
    //       };
    //     })
    //   );
    //   const allRolesWithPrivileges = await callApi<GetRole[]>({
    //     query: getQueryKanbanBoardUserRoles(),
    //     auth: { setAuthedUser },
    //   });
    //   const rolesWithPrivileges = data.roles.map((role) => {
    //     const roleWithCorrectPrivileges = allRolesWithPrivileges.find(
    //       (roleP) => roleP.role_id === role.role_id
    //     );
    //     return {
    //       ...role,
    //       originalPrivileges: roleWithCorrectPrivileges
    //         ? (roleWithCorrectPrivileges.privileges.map((p) =>
    //             p.toLowerCase()
    //           ) as KanbanUserPrivilege[])
    //         : [],
    //     };
    //   });
    //   setKanbanBoardPermissions({
    //     ...data,
    //     roles: rolesWithPrivileges,
    //     users: usersWithPrivileges,
    //   });
    // } catch (error) {
    //   setFormStatus("error");
    //   setFormAlert(t("Failed to load current permissions for this board."));
    // }
  };

  const handleViewTask = async (id: string) => {
    setOpenModal(true);
    setSelectedTask(null);

    // try {
    //   const taskResp = await callApi<KanbanTask>({
    //     query: getQueryKanbanBordCardById(id),
    //     auth: { setAuthedUser },
    //   });
    //   setSelectedTask(taskResp);
    // } catch (error) {
    //   console.error("Error fetching selected kanban board:", error);
    //   setFormStatus("error");
    //   setFormAlert(t("Error fetching selected kanban board."));
    //   setPageLoading(false);
    //   setOpenModal(false);
    // }
  };

  const handleUpdateKanbanTask = async (updatedTasks: any[]) => {
    // console.log("updatedTask", updatedTasks);
    // setKanbanBoard((prev) => {
    //   if (!prev) return null;
    //   const updatedIds = new Set(updatedTasks.map((card) => card.object_id));
    //   const missingOldCards = prev.cards.filter(
    //     (card) => !updatedIds.has(card.object_id)
    //   );
    //   return {
    //     ...prev,
    //     cards: [...updatedTasks, ...missingOldCards],
    //   };
    // });
    // try {
    //   setFormStatus("loading");
    //   setFormAlert(null);
    //   const payload = { cards: updatedTasks };
    //   const updatedCardResp = await callApi<KanbanTask[]>({
    //     query: putQueryKanbanUpdateTasks(payload),
    //     auth: { setAuthedUser },
    //   });
    //   if (selectedTask) {
    //     const updatedSelectedTask = updatedCardResp.find(
    //       (task) => task.object_id === selectedTask.object_id
    //     );
    //     if (updatedSelectedTask) {
    //       setSelectedTask(updatedSelectedTask);
    //     }
    //   }
    //   setFormStatus(null);
    //   setFormAlert(null);
    // } catch (err) {
    //   console.log("handleUpdateKanbanTask() err", err);
    //   setFormStatus("error");
    //   setFormAlert(t("Something went wrong"));
    // }
  };

  const handleUpdateColumns = useCallback(
    async (updatedColumns: KanbanBoardColumn[]) => {
      // try {
      //   const payload = {
      //     columns: updatedColumns,
      //   };
      //   await callApi<KanbanBoardColumn[]>({
      //     query: putQueryKanbanBoardEditColuAttachment(payload),
      //     auth: { setAuthedUser },
      //   });
      //   setKanbanBoard((prev) => {
      //     if (!prev) return null;
      //     return {
      //       ...prev,
      //       columns: updatedColumns,
      //     };
      //   });
      // } catch (error) {
      //   console.error("Error updating column order:", error);
      //   if (selectedBoardId) {
      //     fetchSpecificKanbanBoard(selectedBoardId);
      //   }
      // }
    },
    [setKanbanBoard, selectedBoardId]
  );

  const handleDeleteColumn = (columnId: string) => {
    setSelectedColumnId(columnId);
    setItemToDeleteType("column");
    setOpenDeleteConfirmModal(true);
  };

  const handleCreateColumn = useCallback(
    async (newColumn: KanbanBoardColumn) => {
      // try {
      //   if (selectedBoardId) {
      //     const resp = await callApi<any>({
      //       query: postQueryKanbanBoardNewColumn(selectedBoardId, newColumn),
      //       auth: { setAuthedUser },
      //     });
      //     setKanbanBoard((prev) => {
      //       if (!prev) return null;
      //       return {
      //         ...prev,
      //         columns: [...prev.columns, { ...newColumn, id: resp.id }],
      //       };
      //     });
      //   }
      // } catch (error) {
      //   console.error("Error creating column:", error);
      //   setFormStatus("error");
      //   setFormAlert(t("Error creating new column."));
      // }
    },
    [
      // callApi,
      // postQueryKanbanBoardNewColumn,
      // setAuthedUser,
      selectedBoardId,
      fetchSpecificKanbanBoard,
    ]
  );

  const handleCreateTask = useCallback(
    async (newFormData: NewFormData, columnId: string) => {
      // try {
      //   if (
      //     newFormData.title &&
      //     selectedBoardId &&
      //     newFormData?.title.trim() &&
      //     authedUser
      //   ) {
      //     const newTask: KanbanTask = {
      //       meta: {
      //         creator_id: authedUser?.id,
      //         creator_name: authedUser?.user_name,
      //       },
      //       object_id: uuidv4(),
      //       column_id: columnId,
      //       title: newFormData.title.trim(),
      //       planned_end_date: newFormData.planned_end_date || undefined,
      //       priority: newFormData.priority,
      //       order:
      //         (kanbanBoard?.cards?.filter((card) => card.column_id === columnId)
      //           .length || 0) + 1,
      //       status: "Planned",
      //       assignees: newFormData.assignees,
      //     };
      //     const resp = await callApi<any>({
      //       query: postQueryKanbanBoardNewTask(newTask.column_id, newTask),
      //       auth: { setAuthedUser },
      //     });
      //     const tempNewTask: KanbanTask = {
      //       ...newTask,
      //       object_id: resp.id,
      //       assignees: [],
      //     };
      //     setKanbanBoard((prev) => {
      //       if (!prev) return null;
      //       return {
      //         ...prev,
      //         cards: [...prev.cards, { ...tempNewTask }],
      //       };
      //     });
      //     if (newTask.assignees && newTask.assignees?.length > 0) {
      //       newTask.assignees.map(async (assignee) => {
      //         await handleAssignee(resp.id, { user_id: assignee.user_id });
      //       });
      //     }
      //   }
      // } catch (error) {
      //   console.error("Error creating task:", error);
      //   setFormStatus("error");
      //   setFormAlert(t("Error creating new task."));
      // }
    },
    [
      // callApi,
      // postQueryKanbanBoardNewTask,
      // setAuthedUser,
      selectedBoardId,
      fetchSpecificKanbanBoard,
    ]
  );

  const handleDeleteTask = (id: string) => {
    setItemToDeleteType("card");
    setSelectedCardId(id);
    setOpenDeleteConfirmModal(true);
  };

  const handleAssignee = async (card_id: string, data: { user_id: string }) => {
    // try {
    //   const resp = await callApi<{
    //     user_name: string;
    //     card_id: string;
    //     user_id: string;
    //   }>({
    //     query: postQueryKanbanBoardCardAssignee(card_id, data),
    //     auth: { setAuthedUser },
    //   });
    //   setKanbanBoard((prev) => {
    //     if (!prev) return null;
    //     return {
    //       ...prev,
    //       cards: prev.cards.map((card) => {
    //         if (card.object_id === card_id) {
    //           return {
    //             ...card,
    //             assignees: [
    //               ...(card.assignees || []),
    //               {
    //                 user_id: resp.user_id,
    //                 user_name: resp.user_name,
    //                 profile_picture_url: null,
    //               },
    //             ],
    //           };
    //         }
    //         return card;
    //       }),
    //     };
    //   });
    //   if (selectedTask) {
    //     setSelectedTask((prev) => {
    //       if (!prev) return null;
    //       return {
    //         ...prev,
    //         assignees: [
    //           ...(prev.assignees || []),
    //           {
    //             user_id: resp.user_id,
    //             user_name: resp.user_name,
    //             profile_picture_url: null,
    //           },
    //         ],
    //       };
    //     });
    //   }
    // } catch (error) {
    //   console.log("error", error);
    // }
  };

  const handleUnAssignee = async (
    card_id: string,
    data: { user_id: string }
  ) => {
    // try {
    //   await callApi({
    //     query: deleteQueryKanbanBoardCardAssignee(card_id, data),
    //     auth: { setAuthedUser },
    //   });
    //   setKanbanBoard((prev) => {
    //     if (!prev) return null;
    //     return {
    //       ...prev,
    //       cards: prev.cards.map((card) => {
    //         if (card.object_id === card_id) {
    //           return {
    //             ...card,
    //             assignees: card.assignees?.filter(
    //               (assign) => assign.user_id !== data.user_id
    //             ),
    //           };
    //         }
    //         return card;
    //       }),
    //     };
    //   });
    //   if (selectedTask) {
    //     setSelectedTask((prev) => {
    //       if (!prev) return null;
    //       return {
    //         ...prev,
    //         assignees: prev.assignees?.filter(
    //           (assign) => assign.user_id !== data.user_id
    //         ),
    //       };
    //     });
    //   }
    // } catch (error) {
    //   console.log("error", error);
    // }
  };

  const possibleAssignes = async (board_id: string) => {
    // try {
    //   if (selectedBoardId) {
    //     const users = await callApi<UserPossibleAssignes[]>({
    //       query: getQueyKanbanBoardPossibleAssignees(board_id),
    //       auth: { setAuthedUser },
    //     });
    //     setUsersPossibleToAssignees(users);
    //   }
    // } catch (error) {
    //   console.log("error", error);
    // }
  };

  const filteredTasks = useMemo(() => {
    return filterKanbanTasks(kanbanBoard?.cards, {
      searchTerm,
      selectedPlannedEndDateFilters,
      selectedPriorityFilters,
      selectedStatusFilters,
      selectedAssignedUsersFilters,
      showFinishedTasks,
      selectedCustomDueDate,
    });
  }, [
    kanbanBoard?.cards,
    searchTerm,
    selectedPlannedEndDateFilters,
    selectedPriorityFilters,
    selectedStatusFilters,
    selectedAssignedUsersFilters,
    showFinishedTasks,
    selectedCustomDueDate,
  ]);

  const memoizedKanbanBoard = useMemo(() => {
    // if (!kanbanBoard || !currentUserPermissions) {
    //   return null;
    // }

    return (
      <>
        <KanbanFilters
          selectedAssignedUsersFilters={selectedAssignedUsersFilters}
          allUserOptions={usersPossibleToAssignees}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedPlannedEndDateFilters={selectedPlannedEndDateFilters}
          setSelectedPlannedEndDateFilters={setSelectedPlannedEndDateFilters}
          selectedPriorityFilters={selectedPriorityFilters}
          setSelectedPriorityFilters={setSelectedPriorityFilters}
          selectedStatusFilters={selectedStatusFilters}
          setSelectedStatusFilters={setSelectedStatusFilters}
          setSelectedAssignedUsersFilters={setSelectedAssignedUsersFilters}
          showFinishedTasks={showFinishedTasks}
          setShowFinishedTasks={setShowFinishedTasks}
          selectedCustomDueDate={selectedCustomDueDate}
          setSelectedCustomDueDate={setSelectedCustomDueDate}
        />

        <KanbanBoard
          tasks={filteredTasks}
          handleViewTask={handleViewTask}
          handleUpdateTask={handleUpdateKanbanTask}
          allUserOptions={usersPossibleToAssignees}
          columns={kanbanBoard?.columns || []}
          handleAssignee={handleAssignee}
          handleUpdateColumns={handleUpdateColumns}
          handleDeleteColumn={handleDeleteColumn}
          handleCreateColumn={handleCreateColumn}
          handleCreateCard={handleCreateTask}
          handleDeleteTask={handleDeleteTask}
          // currentUserPermissions={currentUserPermissions}
          handleUnAssignee={handleUnAssignee}
          boardType={BoardType.KanbanTask} // boardType={BoardType.KanbanTask}
        />
      </>
    );
  }, [
    filteredTasks,
    kanbanBoard,
    handleUpdateKanbanTask,
    selectedBoardId,
    fetchSpecificKanbanBoard,
    handleUpdateColumns,
    handleDeleteColumn,
    handleCreateColumn,
    handleCreateTask,
    handleUnAssignee,
  ]);

  const boardSelectOptions = useMemo(() => {
    return allKanbanBoards.map((board) => ({
      value: board.id,
      description: board.title,
    }));
  }, [allKanbanBoards]);

  const allStatuses = useMemo(() => getAllStatuses(t), [t]);

  return (
    <div className="w-full">
      {/* {smMediaQuery ? (
        <PageTitle className="mb-4" title={t("Task Manager")} />
      ) : null} */}
      {/* <Alert
        message={formAlert}
        showAlert={!!formAlert}
        severity={formStatus}
        autoClose
        onClose={() => {
          setFormAlert(null);
          setFormStatus(null);
        }}
      /> */}
      <div className="flex justify-center">
        {/* <div className="flex items-center text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
          <button
            onClick={() => handleChangeTab(null, 0)}
            className={cn(
              "inline-block p-4 rounded-t-lg",
              tabValue === 0
                ? "text-blue-600 border-b-2 border-blue-600 active dark:text-blue-500 dark:border-blue-500"
                : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
            )}
          >
            {t("Kanban Board")}
          </button>
          <button
            onClick={() => handleChangeTab(null, 1)}
            className={cn(
              "inline-block p-4 rounded-t-lg",
              tabValue === 1
                ? "text-blue-600 border-b-2 border-blue-600 active dark:text-blue-500 dark:border-blue-500"
                : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
            )}
          >
            {t("Table")}
          </button>
        </div> */}
      </div>
      {/* {tableTasks && tabValue === 1 && (
        <div className="pt-4">
          <ResponsiveTableGrid
            rows={tableTasks?.rows ?? []}
            colSchema={useTranslateFields(tableTasks?.columns ?? [], ["label"])}
            responsive="responsive"
            configuration={tableTasks?.configuration}
            backdropLoading={formStatus === "loading"}
            loading={pageLoading}
            tableID="TaskManager_table"
          />
        </div>
      )} */}

      {tabValue === 0 && (
        <div className="pt-4">
          <div className="mb-4 flex justify-center items-center gap-2">
            <Select
              value={selectedBoardId || ""}
              onValueChange={(value: KanbanBoardId) => {
                setSelectedBoardId(value);
              }}
              disabled={pageLoading || allKanbanBoards.length === 0}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("Choose Board")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{t("Boards")}</SelectLabel>
                  {boardSelectOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.description}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col justify-center items-center min-h-[400px] w-full">
            {pageLoading && selectedBoardId ? (
              <>
                <div className="w-10 h-10 mb-4 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-blue-500"></div>
                <p>{t("Loading board...")}</p>
              </>
            ) : !selectedBoardId && allKanbanBoards.length > 0 ? (
              <p>
                {t(
                  "Select a board from the dropdown menu, or create a new one."
                )}
              </p>
            ) : !selectedBoardId && allKanbanBoards.length === 0 ? (
              <p>
                {t(
                  "No boards created yet. Click the plus button to create one."
                )}
              </p>
            ) : (
              memoizedKanbanBoard
            )}
          </div>
        </div>
      )}

      <KanbanCRUDModals
        openCreateBoardModal={openCreateBoardModal}
        setOpenCreateBoardModal={setOpenCreateBoardModal}
        openDeleteBoardConfirmModal={openDeleteConfirmModal}
        setOpenDeleteConfirmModal={setOpenDeleteConfirmModal}
        selectedBoardId={selectedBoardId}
        setSelectedBoardId={setSelectedBoardId}
        allKanbanBoards={allKanbanBoards}
        fetchAllKanbanBoards={fetchAllKanbanBoards}
        formStatus={formStatus}
        setFormStatus={setFormStatus}
        setFormAlert={setFormAlert}
        itemToDeleteType={itemToDeleteType}
        cardId={selectedCardId}
        kanbanBoard={kanbanBoard}
        setKanbanBoard={setKanbanBoard}
        columnId={selectedColumnId}
        boardFormMode={boardFormMode}
      />
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("Task Details")}</DialogTitle>
          </DialogHeader>
          {/* Your content goes here */}
          {/*
          <ViewKanbanTaskModal
            task={selectedTask}
            onUpdateTask={handleUpdateKanbanTask}
            allStatuses={allStatuses}
            currentUserPermissions={currentUserPermissions}
            allUserOptions={usersPossibleToAssignees}
            handleAssignee={handleAssignee}
            handleUnAssignee={handleUnAssignee}
          />
          */}
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default page;
