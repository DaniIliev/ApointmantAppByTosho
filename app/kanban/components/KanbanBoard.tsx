"use client";

import { Plus } from "lucide-react";
import { KanbanColumn as KanbanColumnType, KanbanCard } from "../types";
import { KanbanColumn } from "./KanbanColumn";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";

interface KanbanBoardProps {
  columns: KanbanColumnType[];
  onColumnsChange: (columns: KanbanColumnType[]) => void;
  onAddColumn: () => void;
  onEditColumn: (column: KanbanColumnType) => void;
  onDeleteColumn: (columnId: string) => void;
  onAddCard: (columnId: string) => void;
  onEditCard: (card: KanbanCard) => void;
  onDeleteCard: (cardId: string) => void;
}

export function KanbanBoard({
  columns,
  onColumnsChange,
  onAddColumn,
  onEditColumn,
  onDeleteColumn,
  onAddCard,
  onEditCard,
  onDeleteCard,
}: KanbanBoardProps) {
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = columns
      .flatMap((col) => col.cards)
      .find((c) => c._id === active.id);
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeColumn = columns.find((col) =>
      col.cards.some((card) => card._id === activeId)
    );
    const overColumn = columns.find(
      (col) =>
        col._id === overId || col.cards.some((card) => card._id === overId)
    );

    if (!activeColumn || !overColumn) return;

    if (activeColumn._id !== overColumn._id) {
      const newColumns = columns.map((col) => {
        if (col._id === activeColumn._id) {
          return {
            ...col,
            cards: col.cards.filter((card) => card._id !== activeId),
          };
        }
        if (col._id === overColumn._id) {
          const activeCard = activeColumn.cards.find(
            (card) => card._id === activeId
          )!;
          const overCard = col.cards.find((card) => card._id === overId);

          if (overCard) {
            const overIndex = col.cards.indexOf(overCard);
            const newCards = [...col.cards];
            newCards.splice(overIndex, 0, {
              ...activeCard,
              columnId: col._id,
            });
            return { ...col, cards: newCards };
          } else {
            return {
              ...col,
              cards: [...col.cards, { ...activeCard, columnId: col._id }],
            };
          }
        }
        return col;
      });

      onColumnsChange(newColumns);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveCard(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = columns.find((col) =>
      col.cards.some((card) => card._id === activeId)
    );

    if (activeColumn && activeId !== overId) {
      const activeIndex = activeColumn.cards.findIndex(
        (card) => card._id === activeId
      );
      const overIndex = activeColumn.cards.findIndex(
        (card) => card._id === overId
      );

      if (activeIndex !== overIndex) {
        const newColumns = columns.map((col) => {
          if (col._id === activeColumn._id) {
            return {
              ...col,
              cards: arrayMove(col.cards, activeIndex, overIndex),
            };
          }
          return col;
        });

        onColumnsChange(newColumns);
      }
    }

    setActiveCard(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {columns.map((column) => (
          <KanbanColumn
            key={column._id}
            column={column}
            onAddCard={onAddCard}
            onEditCard={onEditCard}
            onDeleteCard={onDeleteCard}
            onEditColumn={onEditColumn}
            onDeleteColumn={onDeleteColumn}
          />
        ))}

        {/* Add Column Button */}
        <button
          onClick={onAddColumn}
          className="flex-shrink-0 w-80 h-17 border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary rounded-lg flex flex-row items-center justify-center gap-2 transition-colors text-muted-foreground hover:text-foreground"
        >
          <Plus className="w-6 h-6" />
          <span className="text-sm font-medium">Add Column</span>
        </button>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeCard ? (
          <div className="w-80 opacity-80 rotate-3 transform scale-105">
            <div className="bg-card border-2 border-primary rounded-lg p-4 shadow-2xl">
              <h3 className="font-semibold text-sm">{activeCard.title}</h3>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
