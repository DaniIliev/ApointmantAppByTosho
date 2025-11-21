"use client";

import { useState, useEffect, useRef } from "react";
import { usePageTitle } from "@/context/PageTitleContext";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/context/AuthContext";
import { KanbanBoard as KanbanBoardComponent } from "./components/KanbanBoard";
import { CardModal } from "./components/CardModal";
import { ColumnModal } from "./components/ColumnModal";
import { KanbanColumn, KanbanCard, User, KanbanBoard } from "./types";
import { toast } from "sonner";
import { BoardSelector } from "./components/BoardSelector";
import callApi from "@/app/Api/callApi";
import LoadingBackdrop from "@/components/ui/LoadingBackdrop";

export default function KanbanPage() {
  const { t } = useTranslation();
  const { setPageTitle } = usePageTitle();
  const { user } = useAuthContext();
  const reorderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [cardModalMode, setCardModalMode] = useState<"create" | "edit">(
    "create"
  );
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | undefined>(
    undefined
  );

  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [columnModalMode, setColumnModalMode] = useState<"create" | "edit">(
    "create"
  );
  const [selectedColumn, setSelectedColumn] = useState<KanbanColumn | null>(
    null
  );

  useEffect(() => {
    setPageTitle(t("Kanban Board"));
    loadKanbanData();
    return () => {
      setPageTitle(null);
    };
  }, [setPageTitle, t]);

  const loadKanbanData = async () => {
    if (!user?.businessId) {
      toast.error("Business context not found");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch boards from API
      const boardsData: KanbanBoard[] = await callApi(
        `/api/kanban/boards?businessId=${user.businessId}`,
        "GET"
      );

      if (boardsData && boardsData.length > 0) {
        setBoards(boardsData);
        const firstBoard = boardsData[0];
        setSelectedBoardId(firstBoard._id);

        // Fetch full board details with columns and cards
        const fullBoard = await callApi(
          `/api/kanban/boards/${firstBoard._id}`,
          "GET"
        );
        setColumns(fullBoard.columns || []);
      } else {
        // No boards exist, create a default one
        const newBoard = await callApi("/api/kanban/boards", "POST", {
          title: "My Board",
          description: "",
          businessId: user.businessId,
        });
        setBoards([newBoard]);
        setSelectedBoardId(newBoard._id);
        setColumns([]);
      }

      // Fetch business members for assignees
      const members: User[] = await callApi(
        `/api/kanban/business/${user.businessId}/members`,
        "GET"
      );
      setAvailableUsers(members);
    } catch (error) {
      console.error("Failed to load kanban data:", error);
      toast.error("Failed to load kanban board");
    } finally {
      setLoading(false);
    }
  };

  // Column handlers
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

  const handleSaveColumn = async (
    columnData: Partial<KanbanColumn>,
    mode: "create" | "edit"
  ) => {
    try {
      if (mode === "create") {
        if (!selectedBoardId) {
          toast.error("No board selected");
          return;
        }

        const newColumn: KanbanColumn = await callApi(
          "/api/kanban/columns",
          "POST",
          {
            title: columnData.title,
            color: columnData.color,
            limit: columnData.limit,
            boardId: selectedBoardId,
          }
        );

        setColumns((prev) => [...prev, { ...newColumn, cards: [] }]);
        toast.success("Column created successfully");
      } else {
        const updatedColumn: KanbanColumn = await callApi(
          `/api/kanban/columns/${columnData._id}`,
          "PUT",
          {
            title: columnData.title,
            color: columnData.color,
            limit: columnData.limit,
          }
        );

        setColumns((prev) =>
          prev.map((col) =>
            col._id === updatedColumn._id ? { ...col, ...updatedColumn } : col
          )
        );
        toast.success("Column updated successfully");
      }
    } catch (error) {
      console.error("Failed to save column:", error);
      toast.error("Failed to save column");
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      await callApi(`/api/kanban/columns/${columnId}`, "DELETE");
      setColumns((prev) => prev.filter((col) => col._id !== columnId));
      toast.success("Column deleted successfully");
    } catch (error) {
      console.error("Failed to delete column:", error);
      toast.error("Failed to delete column");
    }
  };

  // Card handlers
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

  const handleSaveCard = async (
    cardData: Partial<KanbanCard>,
    mode: "create" | "edit"
  ) => {
    try {
      if (mode === "create") {
        const newCard: KanbanCard = await callApi("/api/kanban/cards", "POST", {
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
          prev.map((col) =>
            col._id === newCard.columnId
              ? { ...col, cards: [...col.cards, newCard] }
              : col
          )
        );
        toast.success("Card created successfully");
      } else {
        const updatedCard: KanbanCard = await callApi(
          `/api/kanban/cards/${cardData._id}`,
          "PUT",
          {
            title: cardData.title,
            description: cardData.description,
            startDate: cardData.startDate,
            endDate: cardData.endDate,
            priority: cardData.priority,
            status: cardData.status,
            columnId: cardData.columnId,
            assignedUsers: cardData.assignedUsers?.map((u) => u._id) || [],
          }
        );

        setColumns((prev) =>
          prev.map((col) => ({
            ...col,
            cards: col.cards.map((card) =>
              card._id === updatedCard._id ? updatedCard : card
            ),
          }))
        );
        toast.success("Card updated successfully");
      }
    } catch (error) {
      console.error("Failed to save card:", error);
      toast.error("Failed to save card");
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await callApi(`/api/kanban/cards/${cardId}`, "DELETE");
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.filter((card) => card._id !== cardId),
        }))
      );
      toast.success("Card deleted successfully");
    } catch (error) {
      console.error("Failed to delete card:", error);
      toast.error("Failed to delete card");
    }
  };

  const handleColumnsChange = (newColumns: KanbanColumn[]) => {
    setColumns(newColumns);

    // Debounce the API calls - wait 800ms after last change before saving
    if (reorderTimeoutRef.current) {
      clearTimeout(reorderTimeoutRef.current);
    }

    reorderTimeoutRef.current = setTimeout(async () => {
      try {
        // Send both column and card reorder in parallel
        await Promise.all([
          callApi("/api/kanban/columns/reorder", "PUT", {
            columns: newColumns.map((col, index) => ({
              _id: col._id,
              order: index,
            })),
          }),
          (async () => {
            // Collect all cards with their new positions
            const allCards: Array<{
              _id: string;
              order: number;
              columnId: string;
            }> = [];

            newColumns.forEach((col) => {
              col.cards.forEach((card, cardIndex) => {
                allCards.push({
                  _id: card._id,
                  order: cardIndex,
                  columnId: col._id,
                });
              });
            });

            if (allCards.length > 0) {
              return callApi("/api/kanban/cards/reorder", "PUT", {
                cards: allCards,
              });
            }
          })(),
        ]);
      } catch (error) {
        console.error("Failed to save reorder:", error);
        toast.error("Failed to save changes");
      }
    }, 800);
  };

  const handleSelectBoard = async (id: string) => {
    setSelectedBoardId(id);
    setLoading(true);
    try {
      const fullBoard = await callApi(`/api/kanban/boards/${id}`, "GET");
      setColumns(fullBoard.columns || []);
    } catch (error) {
      console.error("Failed to load board:", error);
      toast.error("Failed to load board");
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (title: string) => {
    if (!user?.businessId) {
      toast.error("Business context not found");
      return;
    }

    try {
      const newBoard: KanbanBoard = await callApi(
        "/api/kanban/boards",
        "POST",
        {
          title,
          description: "",
          businessId: user.businessId,
        }
      );

      setBoards((prev) => [newBoard, ...prev]);
      setSelectedBoardId(newBoard._id);
      setColumns([]);
      toast.success("Board created successfully");
    } catch (error) {
      console.error("Failed to create board:", error);
      toast.error("Failed to create board");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingBackdrop loading={loading} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top bar: Board selector */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <BoardSelector
          boards={boards.map((b) => ({ _id: b._id, title: b.title }))}
          selectedBoardId={selectedBoardId}
          onSelect={handleSelectBoard}
          onCreate={handleCreateBoard}
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <KanbanBoardComponent
          columns={columns}
          onColumnsChange={handleColumnsChange}
          onAddColumn={handleAddColumn}
          onEditColumn={handleEditColumn}
          onDeleteColumn={handleDeleteColumn}
          onAddCard={handleAddCard}
          onEditCard={handleEditCard}
          onDeleteCard={handleDeleteCard}
        />
      </div>

      {/* Card Modal */}
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

      {/* Column Modal */}
      <ColumnModal
        open={columnModalOpen}
        onOpenChange={setColumnModalOpen}
        column={selectedColumn}
        mode={columnModalMode}
        onSave={handleSaveColumn}
        onDelete={handleDeleteColumn}
      />
    </div>
  );
}
