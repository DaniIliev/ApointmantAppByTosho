"use client";

import { useState } from "react";
import { GripHorizontal, Calendar, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlayProps,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Priority = "low" | "medium" | "high" | "urgent";

interface KanbanCard {
  _id: string;
  title: string;
  description?: string;
  priority?: Priority;
  startDate?: string;
  endDate?: string;
  assignedTo?: string;
  columnId: string;
}

interface KanbanColumn {
  _id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
}

interface DroppableColumnProps {
  columnId: string;
  children: React.ReactNode;
}

function DroppableColumn({ columnId, children }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 bg-muted/30 rounded-b-lg border border-border border-t-0 p-3 space-y-2 min-h-[200px] ${
        isOver ? "bg-primary/10 border-primary" : ""
      }`}
      style={{ maxHeight: "500px", overflowY: "auto" }}
    >
      {children}
    </div>
  );
}

interface SortableCardProps {
  card: KanbanCard;
}

function SortableCard({ card }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority?: Priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group relative"
    >
      {/* Centered drag handle at top */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <div className="bg-card border border-border rounded-full p-1 shadow-sm">
          <GripHorizontal className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-start items-center gap-2">
          {card.priority && (
            <div
              className={`w-3 h-3 rounded-full mt-1 ${getPriorityColor(
                card.priority
              )}`}
              title={card.priority}
            />
          )}
          <h4 className="text-sm font-medium text-foreground">{card.title}</h4>
        </div>
        {card.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {card.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {card.startDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(card.startDate).toLocaleDateString()}</span>
            </div>
          )}
          {card.assignedTo && (
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-medium">
                {card.assignedTo.charAt(0).toUpperCase()}
              </div>
              <span className="truncate">{card.assignedTo}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function KanbanPreview() {
  const { t } = useTranslation();
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const [columns, setColumns] = useState<KanbanColumn[]>([
    {
      _id: "backlog",
      title: t("Backlog"),
      color: "bg-gray-100 dark:bg-gray-800",
      cards: [
        {
          _id: "card1",
          title: t("Update salon equipment"),
          description: t("Purchase new hair dryers and styling tools"),
          priority: "medium",
          startDate: "2024-01-15",
          assignedTo: "Maria",
          columnId: "backlog",
        },
        {
          _id: "card2",
          title: t("Train staff on new techniques"),
          description: t("Organize training session for balayage"),
          priority: "low",
          assignedTo: "Elena",
          columnId: "backlog",
        },
      ],
    },
    {
      _id: "todo",
      title: t("To Do"),
      color: "bg-blue-100 dark:bg-blue-950",
      cards: [
        {
          _id: "card3",
          title: t("Client consultation - Wedding makeup"),
          description: t("Meet with bride for makeup trial"),
          priority: "high",
          startDate: "2024-01-10",
          assignedTo: "Sofia",
          columnId: "todo",
        },
        {
          _id: "card4",
          title: t("Restock salon products"),
          description: t("Order shampoos, conditioners, and styling products"),
          priority: "medium",
          assignedTo: t("Manager"),
          columnId: "todo",
        },
      ],
    },
    {
      _id: "inprogress",
      title: t("In Progress"),
      color: "bg-yellow-100 dark:bg-yellow-950",
      cards: [
        {
          _id: "card5",
          title: t("Color treatment - Full highlights"),
          description: t("Client Sarah Johnson - 2 hour appointment"),
          priority: "urgent",
          startDate: "2024-01-08",
          assignedTo: "Anna",
          columnId: "inprogress",
        },
        {
          _id: "card6",
          title: t("Deep conditioning treatment"),
          description: t("Keratin treatment for damaged hair"),
          priority: "high",
          assignedTo: "Kristina",
          columnId: "inprogress",
        },
      ],
    },
    {
      _id: "done",
      title: t("Completed"),
      color: "bg-green-100 dark:bg-green-950",
      cards: [
        {
          _id: "card7",
          title: t("Hair cut and blow dry"),
          description: t("Client Emma White - Completed successfully"),
          priority: "medium",
          startDate: "2024-01-07",
          assignedTo: "Diana",
          columnId: "done",
        },
        {
          _id: "card8",
          title: t("Manicure and nail art"),
          description: t("Client Jessica Brown - Gel polish with designs"),
          priority: "low",
          assignedTo: "Natalia",
          columnId: "done",
        },
      ],
    },
  ]);

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

    // Check if overId is a column ID (for dropping in empty columns)
    let overColumn = columns.find((col) => col._id === overId);

    // If not found, check if it's a card ID
    if (!overColumn) {
      overColumn = columns.find((col) =>
        col.cards.some((card) => card._id === overId)
      );
    }

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

      setColumns(newColumns);
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

      if (activeIndex !== -1 && overIndex !== -1) {
        const newColumns = columns.map((col) => {
          if (col._id === activeColumn._id) {
            return {
              ...col,
              cards: arrayMove(col.cards, activeIndex, overIndex),
            };
          }
          return col;
        });

        setColumns(newColumns);
      }
    }

    setActiveCard(null);
  };

  return (
    <div
      className="w-full bg-background rounded-lg border border-border p-6"
      style={{ maxWidth: "1500px", margin: "0 auto", minHeight: "400px" }}
    >
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <SortableContext
              key={column._id}
              items={column.cards.map((card) => card._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex-shrink-0 w-72 flex flex-col align-start">
                {/* Column Header */}
                <div
                  className={`${column.color} px-4 py-3 rounded-t-lg border border-border border-b-0`}
                >
                  <h3 className="font-semibold text-sm text-foreground">
                    {column.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {column.cards.length}{" "}
                    {column.cards.length === 1 ? t("task") : t("tasks")}
                  </p>
                </div>

                {/* Cards Container */}
                <DroppableColumn columnId={column._id}>
                  {column.cards.length === 0 ? (
                    <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
                      {t("Drop cards here")}
                    </div>
                  ) : (
                    column.cards.map((card) => (
                      <SortableCard key={card._id} card={card} />
                    ))
                  )}
                </DroppableColumn>
              </div>
            </SortableContext>
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeCard ? (
            <div className="w-72 opacity-80 rotate-3 transform scale-105">
              <div className="bg-card border-2 border-primary rounded-lg p-3 shadow-2xl">
                <h3 className="font-semibold text-sm">{activeCard.title}</h3>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Info text */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>💡 {t("Drag cards between columns to organize salon tasks")}</p>
      </div>
    </div>
  );
}
