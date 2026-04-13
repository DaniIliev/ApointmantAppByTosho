"use client";

import { Plus, MoreVertical } from "lucide-react";
import { KanbanColumn as KanbanColumnType, KanbanCard } from "../types";
import { KanbanCard as KanbanCardComponent } from "./KanbanCard";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";

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
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column._id,
  });

  const isLimitReached = column.limit && column.cards.length >= column.limit;

  return (
    <div className="flex flex-col w-[320px] flex-shrink-0 bg-secondary/10 backdrop-blur-md rounded-2xl border border-border/50 shadow-sm max-h-full transition-all">
      {/* Column Header */}
      <div className="p-3 border-b border-border/40 bg-card/60 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shadow-sm ring-1 ring-border/20"
              style={{ backgroundColor: column.color }}
            />
            <h3 className="font-semibold text-sm text-foreground tracking-tight">
              {column.title}
            </h3>
            <span className="flex items-center justify-center bg-muted text-muted-foreground text-[10px] font-bold h-5 min-w-[20px] px-1.5 rounded-full">
              {column.cards.length}
              {column.limit && <span className="opacity-60 ml-0.5">/ {column.limit}</span>}
            </span>
          </div>
          <button
            onClick={() => onEditColumn(column)}
            className="p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
        {isLimitReached && (
          <p className="text-[10px] font-medium text-destructive mt-1.5 animate-pulse">
            ⚠️ Limit Reached
          </p>
        )}
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-3 overflow-y-auto space-y-3 transition-colors duration-200 min-h-[150px] scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent rounded-b-2xl",
          isOver && "bg-primary/5 ring-1 ring-inset ring-primary/20"
        )}
      >
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
          className={cn(
            "w-full py-2.5 px-3 border border-dashed rounded-xl flex items-center justify-center gap-2 transition-all duration-200 group mt-1",
            isLimitReached
              ? "border-muted/50 bg-muted/10 text-muted-foreground/50 cursor-not-allowed"
              : "border-border/60 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary shadow-sm"
          )}
        >
          <Plus className="w-4 h-4 transition-transform group-hover:scale-110 group-active:scale-95" />
          <span className="text-xs font-medium">Add Task</span>
        </button>
      </div>
    </div>
  );
}
