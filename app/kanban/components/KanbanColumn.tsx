"use client";

import { Plus, MoreVertical } from "lucide-react";
import { KanbanColumn as KanbanColumnType, KanbanCard } from "../types";
import { KanbanCard as KanbanCardComponent } from "./KanbanCard";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface KanbanColumnProps {
  column: KanbanColumnType;
  onAddCard: (columnId: string) => void;
  onEditCard: (card: KanbanCard) => void;
  onDeleteCard: (cardId: string) => void;
  onEditColumn: (column: KanbanColumnType) => void;
  onDeleteColumn: (columnId: string) => void;
}

export function KanbanColumn({
  column,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onEditColumn,
  onDeleteColumn,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column._id,
  });

  const isLimitReached = column.limit && column.cards.length >= column.limit;

  return (
    <div className="flex flex-col w-80 flex-shrink-0 bg-muted/30 rounded-lg">
      {/* Column Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            <h3 className="font-semibold text-sm text-foreground">
              {column.title}
            </h3>
            <span className="text-xs text-muted-foreground">
              {column.cards.length}
              {column.limit && ` / ${column.limit}`}
            </span>
          </div>
          <button
            onClick={() => onEditColumn(column)}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        {isLimitReached && (
          <p className="text-xs text-orange-500">⚠️ Card limit reached</p>
        )}
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-4 overflow-y-auto max-h-[calc(100vh-250px)] transition-colors ${
          isOver ? "bg-accent/20" : ""
        }`}
      >
        {/* Drop Placeholder - shown when dragging over */}
        {isOver && (
          <div className="mb-3 p-4 border-2 border-dashed border-primary bg-primary/5 rounded-lg flex items-center justify-center">
            <span className="text-sm text-primary font-medium">
              Drop card here
            </span>
          </div>
        )}

        <SortableContext
          items={column.cards.map((card) => card._id)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map((card) => (
            <KanbanCardComponent
              key={card._id}
              card={card}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ))}
        </SortableContext>

        {/* Add Card Button */}
        <button
          onClick={() => onAddCard(column._id)}
          // disabled={isLimitReached}
          className={`w-full p-3 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 transition-colors ${
            isLimitReached
              ? "border-muted text-muted-foreground cursor-not-allowed"
              : "border-muted-foreground/30 hover:border-primary hover:bg-primary text-muted-foreground hover:text-foreground"
          }`}
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add Card</span>
        </button>
      </div>
    </div>
  );
}
