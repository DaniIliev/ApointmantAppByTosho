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
import { cn } from "@/lib/utils";

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
      <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 pt-2 px-2 h-full scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent">
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
          className="flex-shrink-0 w-[320px] h-[100px] border-2 border-dashed border-border/50 hover:border-primary/60 hover:bg-primary/5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 text-muted-foreground hover:text-primary shadow-sm group"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span className="text-sm font-semibold tracking-wide">Add Column</span>
        </button>
      </div>

      {/* Drag Overlay */}
      <DragOverlay dropAnimation={{
        duration: 250,
        easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)"
      }}>
        {activeCard ? (
          <div className="w-[300px] opacity-90 rotate-3 transform scale-105 pointer-events-none z-[9999]">
            <div className="bg-card/95 border border-primary/40 rounded-xl p-3 shadow-2xl ring-2 ring-primary ring-offset-1 ring-offset-background flex flex-col gap-2">
              <h3 className="font-semibold text-[13px] text-foreground leading-tight">
                {activeCard.title}
              </h3>
              <div className="h-2 w-16 bg-primary/20 rounded-full mt-1" />
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
