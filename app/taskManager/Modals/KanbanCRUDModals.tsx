import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";

// Shadcn UI Imports
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { KanbanBoardListItem, KanbanBoardType } from "../types";

interface KanbanCRUDModalsProps {
  openCreateBoardModal: boolean;
  setOpenCreateBoardModal: (open: boolean) => void;
  openDeleteBoardConfirmModal: boolean;
  setOpenDeleteConfirmModal: (open: boolean) => void;
  selectedBoardId: string | null;
  allKanbanBoards: KanbanBoardListItem[];
  fetchAllKanbanBoards: () => Promise<void>;
  formStatus: any;
  setFormStatus: (status: any) => void;
  setFormAlert: (message: string | null) => void;
  setSelectedBoardId: React.Dispatch<React.SetStateAction<string | null>>;
  itemToDeleteType: "board" | "card" | "column" | null;
  cardId: string | null;
  kanbanBoard: KanbanBoardType | null;
  setKanbanBoard: React.Dispatch<React.SetStateAction<KanbanBoardType | null>>;
  columnId: string | null;
  boardFormMode: "create" | "edit" | null;
}

const KanbanCRUDModals: React.FC<KanbanCRUDModalsProps> = ({
  openCreateBoardModal,
  setOpenCreateBoardModal,
  openDeleteBoardConfirmModal,
  setOpenDeleteConfirmModal,
  selectedBoardId,
  allKanbanBoards,
  fetchAllKanbanBoards,
  formStatus,
  setFormStatus,
  setFormAlert,
  setSelectedBoardId,
  itemToDeleteType,
  cardId,
  columnId,
  kanbanBoard,
  setKanbanBoard,
  boardFormMode,
}) => {
  const { t } = useTranslation();

  const [boardNameInput, setBoardNameInput] = useState<string>("");

  const boardToEdit = useMemo(() => {
    return allKanbanBoards.find((board) => board.id === selectedBoardId);
  }, [selectedBoardId, allKanbanBoards]);

  useEffect(() => {
    if (boardFormMode === "edit" && boardToEdit) {
      setBoardNameInput(boardToEdit.title);
    } else {
      setBoardNameInput("");
    }
    setFormStatus(null);
    setFormAlert(null);
  }, [boardFormMode, boardToEdit, setFormStatus, setFormAlert]);

  const getSelectedBoardName = useMemo(() => {
    return (
      allKanbanBoards.find((board) => board.id === selectedBoardId)?.title ||
      "this board"
    );
  }, [selectedBoardId, allKanbanBoards]);

  const getCardName = useMemo(() => {
    return (
      kanbanBoard?.cards.find((card) => card.object_id === cardId)?.title ||
      "this card"
    );
  }, [cardId, kanbanBoard]);

  const getColumnName = useMemo(() => {
    return (
      kanbanBoard?.columns.find((col) => col.id === columnId)?.title ||
      "this column"
    );
  }, [columnId, kanbanBoard]);

  const handleSubmitBoardForm = async () => {
    if (!boardNameInput.trim()) {
      setFormStatus("error");
      setFormAlert(t("Board name cannot be empty."));
      return;
    }
    setFormStatus("loading");
    setFormAlert(null);
    // try {
    //   if (boardFormMode === "create") {
    //     await callApi({
    //       query: postQueryKanbanBoardCreateNewBoard(boardNameInput.trim()),
    //       auth: { setAuthedUser },
    //     });
    //     await fetchAllKanbanBoards();
    //     setFormAlert(t("Board created successfully!"));
    //   } else if (boardFormMode === "edit" && boardToEdit) {
    //     await callApi({
    //       query: putQueryKanbanBoardUpdate(boardToEdit.id, {
    //         title: boardNameInput.trim(),
    //       }),
    //       auth: { setAuthedUser },
    //     });
    //     await fetchAllKanbanBoards();
    //     setFormAlert(t("Board updated successfully!"));
    //   } else {
    //     setFormStatus("error");
    //     setFormAlert(t("No item selected for editing."));
    //     return;
    //   }

    //   setFormStatus(null);
    //   setOpenCreateBoardModal(false);
    // } catch (error) {
    //   console.error(`Error ${boardFormMode}ing board:`, error);
    //   setFormStatus("error");
    //   setFormAlert(t(`Error ${boardFormMode}ing board.`));
    // }
  };

  const handleDeleteItem = async () => {
    setFormStatus("loading");
    setFormAlert(null);

    // try {
    //   if (itemToDeleteType === "board" && selectedBoardId) {
    //     await callApi({
    //       query: deleteQueryKanbanBoard(selectedBoardId),
    //       auth: { setAuthedUser },
    //     });
    //     setSelectedBoardId(null);
    //     await fetchAllKanbanBoards();
    //     setFormStatus(null);
    //     setFormAlert(t("Board deleted successfully!"));
    //     setOpenDeleteConfirmModal(false);
    //   } else if (itemToDeleteType === "card" && cardId) {
    //     await callApi({
    //       query: deleteQueryKanbanBoardCard(cardId),
    //       auth: { setAuthedUser },
    //     });
    //     setKanbanBoard((prev) => {
    //       if (!prev) return null;

    //       return {
    //         ...prev,
    //         cards: [...prev.cards.filter((card) => card.object_id != cardId)],
    //       };
    //     });
    //     setFormStatus(null);
    //     setFormAlert(t("Card deleted successfully!"));
    //     setOpenDeleteConfirmModal(false);
    //   } else if (itemToDeleteType === "column" && columnId) {
    //     console.log("columnId", columnId);
    //     await callApi({
    //       query: deleteQueryKanbanBoardColumn(columnId),
    //       auth: { setAuthedUser },
    //     });
    //     setKanbanBoard((prev) => {
    //       if (!prev) return null;

    //       return {
    //         ...prev,
    //         columns: [...prev.columns.filter((col) => col.id != columnId)],
    //       };
    //     });
    //     setFormStatus(null);
    //     setFormAlert(t("Column deleted successfully!"));
    //     setOpenDeleteConfirmModal(false);
    //   } else {
    //     setFormStatus("error");
    //     setFormAlert(t("No item selected for deletion."));
    //     return;
    //   }
    // } catch (error) {
    //   console.error(`Error deleting ${itemToDeleteType}:`, error);
    //   setFormStatus("error");
    //   setFormAlert(t(`Error deleting ${itemToDeleteType}.`));
    // }
  };

  const handleCancelCreateBoardModal = () => {
    setOpenCreateBoardModal(false);
    setBoardNameInput("");
    setFormStatus(null);
    setFormAlert(null);
  };

  const handleCancelDeleteBoardConfirm = () => {
    setOpenDeleteConfirmModal(false);
    setFormStatus(null);
    setFormAlert(null);
  };

  const isLoading = formStatus === "loading";

  const getDeletionMessage = useMemo(() => {
    if (itemToDeleteType === "board") {
      return (
        t("Are you sure you want to delete the Kanban Board named") +
        ` <strong>"${getSelectedBoardName}"</strong>? ` +
        t("This action cannot be undone.")
      );
    } else if (itemToDeleteType === "card" && cardId) {
      return (
        t("Are you sure you want to delete the card named") +
        ` <strong>${getCardName}</strong>? ` +
        t("This action cannot be undone.")
      );
    } else if (itemToDeleteType === "column" && columnId) {
      return (
        t("Are you sure you want to delete the column named") +
        ` <strong>"${getColumnName}"</strong>? ` +
        t(
          "This action cannot be undone. All cards within this column will also be deleted!"
        )
      );
    }
    return t(
      "Are you sure you want to delete this item? This action cannot be undone."
    );
  }, [itemToDeleteType, getSelectedBoardName, cardId, getColumnName, t]);

  return (
    <>
      {/* Modal for creating and editing a Kanban Board */}
      <Dialog
        open={openCreateBoardModal}
        onOpenChange={setOpenCreateBoardModal}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {boardFormMode == "create"
                ? t("Create New Kanban Board")
                : t("Edit Kanban Board")}
            </DialogTitle>
            <DialogDescription>
              {boardFormMode == "create"
                ? t("Enter a name for your new Kanban Board.")
                : t("Edit the name of your Kanban Board.")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              value={boardNameInput}
              onChange={(e) => setBoardNameInput(e.target.value)}
              placeholder={t("Board Name")}
              className="col-span-3"
              disabled={isLoading}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleCancelCreateBoardModal}
              disabled={isLoading}
              variant="outline"
            >
              {t("Cancel")}
            </Button>
            <Button
              onClick={handleSubmitBoardForm}
              disabled={isLoading || !boardNameInput.trim()}
              type="submit"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : boardFormMode === "create" ? (
                t("Create")
              ) : (
                t("Save")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal for confirming deletion */}
      <Dialog
        open={openDeleteBoardConfirmModal}
        onOpenChange={setOpenDeleteConfirmModal}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("Confirm Deletion")}</DialogTitle>
            <DialogDescription>
              <span dangerouslySetInnerHTML={{ __html: getDeletionMessage }} />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              onClick={handleCancelDeleteBoardConfirm}
              disabled={isLoading}
              variant="outline"
            >
              {t("Cancel")}
            </Button>
            <Button
              onClick={handleDeleteItem}
              disabled={isLoading}
              variant="destructive"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                t("Delete")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KanbanCRUDModals;
