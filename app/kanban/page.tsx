"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { usePageTitle } from "@/context/PageTitleContext";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/context/AuthContext";
import { useRightNav } from "@/context/RightNavContext";

import { KanbanBoard as KanbanBoardComponent } from "./components/KanbanBoard";
import { CardModal } from "./components/CardModal";
import { ColumnModal } from "./components/ColumnModal";
import { KanbanColumn, KanbanCard, User, KanbanBoard } from "./types";
import { toast } from "sonner";
import callApi from "@/app/Api/callApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { Modal } from "@/components/customUIComponents/Modal";

import {
  GenericFilters,
  GenericFiltersData,
  FilterConfig,
} from "@/components/customUIComponents/GenericFilters";

interface KanbanFiltersData extends GenericFiltersData {
  searchText: string;
  dateFilter?: string;
  customDateRange?: { start: string; end: string };
  selectedPriorityFilters: string[];
  selectedStatusFilters: string[];
  selectedAssignedUsersFilters: string[];
}

function KanbanPageContent() {
  const { t } = useTranslation();
  const { setPageTitle } = usePageTitle();
  const { user } = useAuthContext();
  const { setExtraRightNavMenu, setIsRightNavVisible } = useRightNav();
  const reorderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [filters, setFilters] = useState<KanbanFiltersData>({
    searchText: "",
    selectedPriorityFilters: [],
    selectedStatusFilters: [],
    selectedAssignedUsersFilters: [],
  });

  // Modal states for Cards & Columns
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [cardModalMode, setCardModalMode] = useState<"create" | "edit">("create");
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | undefined>(undefined);

  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [columnModalMode, setColumnModalMode] = useState<"create" | "edit">("create");
  const [selectedColumn, setSelectedColumn] = useState<KanbanColumn | null>(null);

  // Board Action Modal State
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [boardModalMode, setBoardModalMode] = useState<"create" | "edit">("create");
  const [boardTitle, setBoardTitle] = useState("");

  useEffect(() => {
    setPageTitle(t("Kanban Board"));
    loadKanbanData();
    return () => {
      setPageTitle(null);
    };
  }, [setPageTitle, t]);

  const loadKanbanData = async () => {
    if (!user?.businessId) {
      toast.error(t("Business context not found"));
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const boardsData: KanbanBoard[] = await callApi(`/api/kanban/boards?businessId=${user.businessId}`, "GET");
      
      if (boardsData && boardsData.length > 0) {
        setBoards(boardsData);
        const firstBoard = boardsData[0];
        setSelectedBoardId(firstBoard._id);
        const fullBoard = await callApi(`/api/kanban/boards/${firstBoard._id}`, "GET");
        setColumns(fullBoard.columns || []);
      } else {
        setBoards([]);
        setSelectedBoardId(null);
        setColumns([]);
      }

      const members: User[] = await callApi(`/api/kanban/business/${user.businessId}/members`, "GET");
      setAvailableUsers(members);
    } catch (error) {
      console.error("Failed to load kanban data:", error);
      toast.error(t("Failed to load kanban board"));
    } finally {
      setLoading(false);
    }
  };

  // RightNav Integration
  useEffect(() => {
    const handleCreateClick = () => {
      setBoardModalMode("create");
      setBoardTitle("");
      setBoardModalOpen(true);
    };

    const handleEditClick = () => {
      const b = boards.find((bd) => bd._id === selectedBoardId);
      if (b) {
        setBoardModalMode("edit");
        setBoardTitle(b.title);
        setBoardModalOpen(true);
      }
    };

    const handleDeleteClick = async () => {
      if (!selectedBoardId) return;
      if (window.confirm(t("Are you sure you want to delete this board?"))) {
        try {
          await callApi(`/api/kanban/boards/${selectedBoardId}`, "DELETE");
          const newBoards = boards.filter((b) => b._id !== selectedBoardId);
          setBoards(newBoards);
          if (newBoards.length > 0) {
            handleSelectBoard(newBoards[0]._id);
          } else {
            setSelectedBoardId(null);
            setColumns([]);
          }
          toast.success(t("Board deleted"));
        } catch (e) {
          toast.error(t("Failed to delete board"));
        }
      }
    };

    setExtraRightNavMenu([
      <Button key="create" variant="ghost" onClick={handleCreateClick} className="w-full justify-start gap-3 px-3 py-2 h-9 font-medium hover:bg-accent rounded-lg">
        <Plus className="w-4 h-4 text-muted-foreground" /> {t("Create Board")}
      </Button>,
      ...(selectedBoardId ? [
        <Button key="edit" variant="ghost" onClick={handleEditClick} className="w-full justify-start gap-3 px-3 py-2 h-9 font-medium hover:bg-accent rounded-lg">
          <Pencil className="w-4 h-4 text-muted-foreground" /> {t("Rename Board")}
        </Button>,
        <Button key="delete" variant="ghost" onClick={handleDeleteClick} className="w-full justify-start gap-3 px-3 py-2 h-9 font-medium text-destructive hover:text-destructive hover:bg-destructive/15 rounded-lg">
          <Trash2 className="w-4 h-4" /> {t("Delete Board")}
        </Button>
      ] : [])
    ]);
    setIsRightNavVisible(true);

    return () => {
      setExtraRightNavMenu(null);
      setIsRightNavVisible(false);
    };
  }, [boards, selectedBoardId, setExtraRightNavMenu, setIsRightNavVisible, t]);

  const handleSaveBoardModal = async () => {
    if (!user?.businessId || !boardTitle.trim()) return;
    try {
      if (boardModalMode === "create") {
        const newBoard = await callApi("/api/kanban/boards", "POST", {
          title: boardTitle,
          description: "",
          businessId: user.businessId,
        });
        setBoards((prev) => [...prev, newBoard]);
        handleSelectBoard(newBoard._id);
        toast.success(t("Board created"));
      } else {
        const upBoard = await callApi(`/api/kanban/boards/${selectedBoardId}`, "PUT", { title: boardTitle });
        setBoards((prev) =>
          prev.map((b) => (b._id === selectedBoardId ? { ...b, title: upBoard.title } : b))
        );
        toast.success(t("Board renamed"));
      }
      setBoardModalOpen(false);
    } catch (e) {
      toast.error(t("Failed to save board"));
    }
  };

  const handleSelectBoard = async (id: string) => {
    setSelectedBoardId(id);
    setLoading(true);
    try {
      const fullBoard = await callApi(`/api/kanban/boards/${id}`, "GET");
      setColumns(fullBoard.columns || []);
    } catch (error) {
      console.error("Failed to load board:", error);
      toast.error(t("Failed to load board"));
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };

  // Generic Filters Config
  const filterConfigs: FilterConfig<KanbanFiltersData>[] = useMemo(
    () => [
      {
        key: "selectedPriorityFilters",
        label: "Priority",
        options: [
          { value: "low", description: t("Low") },
          { value: "medium", description: t("Medium") },
          { value: "high", description: t("High") },
          { value: "urgent", description: t("Urgent") },
        ],
        getIndicatorColor: (val: string) => {
          const c: Record<string, string> = { low: "#6b7280", medium: "#3b82f6", high: "#f97316", urgent: "#ef4444" };
          return c[val] || "#000";
        },
      },
      {
        key: "selectedStatusFilters",
        label: "Status",
        options: [
          { value: "Planned", description: t("Planned") },
          { value: "In Progress", description: t("In Progress") },
          { value: "Finished", description: t("Finished") },
        ],
      },
      {
        key: "selectedAssignedUsersFilters",
        label: "Assignees",
        type: "avatar",
        avatarSrcKey: "profile_picture_url",
        enableSearch: true,
        options: availableUsers.map((u) => ({
          value: u._id,
          description: `${u.firstName} ${u.lastName}`,
          profile_picture_url: u.avatar || "",
        })),
      },
    ],
    [availableUsers, t]
  );

  const filteredColumns = useMemo(() => {
    return columns.map((col) => {
      return {
        ...col,
        cards: col.cards.filter((card) => {
          // Text Search
          if (filters.searchText) {
            const s = filters.searchText.toLowerCase();
            const tMatch = card.title.toLowerCase().includes(s);
            const dMatch = card.description?.toLowerCase().includes(s);
            if (!tMatch && !dMatch) return false;
          }
          // Priority Filter
          if (filters.selectedPriorityFilters.length > 0) {
            if (!filters.selectedPriorityFilters.includes(card.priority || "medium")) return false;
          }
          // Status Filter
          if (filters.selectedStatusFilters.length > 0) {
            if (!filters.selectedStatusFilters.includes(card.status || "Planned")) return false;
          }
          // Assignees Filter
          if (filters.selectedAssignedUsersFilters.length > 0) {
            const cardAssignees = card.assignedUsers.map((u) => u._id);
            const hasAssignee = filters.selectedAssignedUsersFilters.some((id) =>
              cardAssignees.includes(id)
            );
            if (!hasAssignee) return false;
          }
          // Date Filter
          if (filters.dateFilter) {
            if (!card.endDate) return false;
            const d = new Date(card.endDate);
            const today = new Date();
            if (filters.dateFilter === "today" && d.toDateString() !== today.toDateString()) return false;
            if (filters.dateFilter === "custom" && filters.customDateRange) {
              const start = new Date(filters.customDateRange.start);
              const end = new Date(filters.customDateRange.end);
              start.setHours(0,0,0,0);
              end.setHours(23,59,59,999);
              if (d < start || d > end) return false;
            }
          }
          return true;
        }),
      };
    });
  }, [columns, filters]);

  // Column Actions
  const handleAddColumn = () => {
    setColumnModalMode("create");
    setSelectedColumn(null);
    setColumnModalOpen(true);
  };
  const handleEditColumn = (column: KanbanColumn) => {
    setColumnModalMode("edit");
    setSelectedColumn(column);
    setColumnModalOpen(true);
  };
  const handleSaveColumn = async (columnData: Partial<KanbanColumn>, mode: "create" | "edit") => {
    try {
      if (mode === "create") {
        if (!selectedBoardId) return;
        const newColumn = await callApi("/api/kanban/columns", "POST", {
          title: columnData.title,
          color: columnData.color,
          limit: columnData.limit,
          boardId: selectedBoardId,
        });
        setColumns((prev) => [...prev, { ...newColumn, cards: [] }]);
        toast.success(t("Column created successfully"));
      } else {
        const updatedColumn = await callApi(`/api/kanban/columns/${columnData._id}`, "PUT", {
          title: columnData.title,
          color: columnData.color,
          limit: columnData.limit,
        });
        setColumns((prev) => prev.map((col) => (col._id === updatedColumn._id ? { ...col, ...updatedColumn } : col)));
        toast.success(t("Column updated successfully"));
      }
    } catch (error) {
      toast.error(t("Failed to save column"));
    }
  };
  const handleDeleteColumn = async (columnId: string) => {
    try {
      await callApi(`/api/kanban/columns/${columnId}`, "DELETE");
      setColumns((prev) => prev.filter((col) => col._id !== columnId));
      toast.success(t("Column deleted successfully"));
    } catch (error) {
      toast.error(t("Failed to delete column"));
    }
  };

  // Card Actions
  const handleAddCard = (columnId: string) => {
    setCardModalMode("create");
    setSelectedCard(null);
    setSelectedColumnId(columnId);
    setCardModalOpen(true);
  };
  const handleEditCard = (card: KanbanCard) => {
    setCardModalMode("edit");
    setSelectedCard(card);
    setSelectedColumnId(undefined);
    setCardModalOpen(true);
  };
  const handleSaveCard = async (cardData: Partial<KanbanCard>, mode: "create" | "edit") => {
    try {
      if (mode === "create") {
        const newCard = await callApi("/api/kanban/cards", "POST", {
          title: cardData.title,
          description: cardData.description,
          startDate: cardData.startDate,
          endDate: cardData.endDate,
          priority: cardData.priority,
          status: cardData.status,
          columnId: cardData.columnId,
          assignedUsers: cardData.assignedUsers?.map((u) => u._id) || [],
        });
        setColumns((prev) =>
          prev.map((col) => (col._id === newCard.columnId ? { ...col, cards: [...col.cards, newCard] } : col))
        );
        toast.success(t("Card created successfully"));
      } else {
        const updatedCard = await callApi(`/api/kanban/cards/${cardData._id}`, "PUT", {
          ...cardData,
          assignedUsers: cardData.assignedUsers?.map((u) => u._id) || [],
        });
        setColumns((prev) =>
          prev.map((col) => ({
            ...col,
            cards: col.cards.map((card) => (card._id === updatedCard._id ? updatedCard : card)),
          }))
        );
        toast.success(t("Card updated successfully"));
      }
    } catch (error) {
      toast.error(t("Failed to save card"));
    }
  };
  const handleDeleteCard = async (cardId: string) => {
    try {
      await callApi(`/api/kanban/cards/${cardId}`, "DELETE");
      setColumns((prev) => prev.map((col) => ({ ...col, cards: col.cards.filter((card) => card._id !== cardId) })));
      toast.success(t("Card deleted successfully"));
    } catch (error) {
      toast.error(t("Failed to delete card"));
    }
  };

  const handleColumnsChange = (newColumns: KanbanColumn[]) => {
    // If we are showing filtered columns, replacing the whole array will DELETE hidden cards!
    // We only update if no filters are active to prevent data loss.
    const isFiltered = filters.searchText || filters.dateFilter || filters.selectedPriorityFilters.length > 0 || filters.selectedStatusFilters.length > 0 || filters.selectedAssignedUsersFilters.length > 0;
    
    if (isFiltered) {
      toast.info(t("Manual reordering is disabled while filters are active."));
      return;
    }

    setColumns(newColumns);

    if (reorderTimeoutRef.current) clearTimeout(reorderTimeoutRef.current);
    reorderTimeoutRef.current = setTimeout(async () => {
      try {
        await Promise.all([
          callApi("/api/kanban/columns/reorder", "PUT", {
            columns: newColumns.map((col, index) => ({ _id: col._id, order: index })),
          }),
          (async () => {
            const allCards: Array<{ _id: string; order: number; columnId: string }> = [];
            newColumns.forEach((col) => {
              col.cards.forEach((card, cardIndex) => {
                allCards.push({ _id: card._id, order: cardIndex, columnId: col._id });
              });
            });
            if (allCards.length > 0) {
              return callApi("/api/kanban/cards/reorder", "PUT", { cards: allCards });
            }
          })(),
        ]);
      } catch (error) {
        toast.error(t("Failed to save changes"));
      }
    }, 800);
  };

  if (loading) {
    return (
      <div className="flex gap-4 h-full p-4 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 space-y-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-[500px] w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-2 space-y-4 bg-background z-0 relative">
      {boards.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-xl border border-border/40 bg-card shadow-sm text-center space-y-4">
            <h3 className="text-xl font-semibold">{t("No Boards Created")}</h3>
            <p className="text-muted-foreground">
              {t("You don't have any Kanban boards yet. Create one to get started and manage your tasks efficiently.")}
            </p>
            <Button onClick={() => {
              setBoardModalMode("create");
              setBoardTitle("");
              setBoardModalOpen(true);
            }} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              {t("Create Board")}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border/40 bg-card shadow-sm">
            <div className="flex-shrink-0 min-w-[200px] z-10 w-full md:w-auto">
              <LabeledSelect
                id="board-selector"
                label={t("Active Board")}
                placeholder={t("Select a board")}
                options={boards.map(b => ({ name: b.title, id: b._id }))}
                value={selectedBoardId || ""}
                onValueChange={handleSelectBoard}
              />
            </div>

            <div className="flex-1 w-full flex justify-start z-20">
              <GenericFilters<KanbanFiltersData>
                filters={filters}
                setFilters={setFilters}
                filterConfigs={filterConfigs}
                dateFilters={true}
                className="w-full md:w-auto z-20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <KanbanBoardComponent
              columns={filteredColumns}
              onColumnsChange={handleColumnsChange}
              onAddColumn={handleAddColumn}
              onEditColumn={handleEditColumn}
              onDeleteColumn={handleDeleteColumn}
              onAddCard={handleAddCard}
              onEditCard={handleEditCard}
              onDeleteCard={handleDeleteCard}
            />
          </div>
        </>
      )}

      <CardModal
        open={cardModalOpen}
        onOpenChange={setCardModalOpen}
        card={selectedCard}
        mode={cardModalMode}
        columnId={selectedColumnId}
        availableUsers={availableUsers}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
      />

      <ColumnModal
        open={columnModalOpen}
        onOpenChange={setColumnModalOpen}
        column={selectedColumn}
        mode={columnModalMode}
        onSave={handleSaveColumn}
        onDelete={handleDeleteColumn}
      />

      <Modal 
        label={boardModalMode === "create" ? t("Create New Board") : t("Rename Board")}
        open={boardModalOpen} 
        onOpenChange={setBoardModalOpen}
      >
        <div className="p-2 md:p-6">
          <LabeledInput
            id="board-title"
            label={t("Board Title")}
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            placeholder={t("Enter board name")}
          />
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="outline" iconType="cancel" onClick={() => setBoardModalOpen(false)}>
            {t("Cancel")}
          </Button>
          <Button iconType={'save'} onClick={handleSaveBoardModal} disabled={!boardTitle.trim()}>
            {t("Save")}
            </Button>
          </div>
      </Modal>
    </div>
  );
}

export default function KanbanPage() {
  return (
    <ProtectedRoute
      requiredRoles={["business", "staff"]}
      requiredPlan={["starter", "professional", "enterprise"]}
    >
      <KanbanPageContent />
    </ProtectedRoute>
  );
}
