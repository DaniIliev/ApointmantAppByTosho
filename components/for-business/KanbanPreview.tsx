"use client";

import { useState, useRef, useEffect } from "react";
import { GripHorizontal, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KanbanCard {
  id: string;
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
}

interface DraggedCard {
  columnId: string;
  cardId: string;
  cardIndex: number;
}

export function KanbanPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedCard, setDraggedCard] = useState<DraggedCard | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [columns, setColumns] = useState<KanbanColumn[]>([
    {
      id: "todo",
      title: "To Do",
      color: "bg-red-100 dark:bg-red-950",
      cards: [
        {
          id: "card1",
          title: "Design new landing page",
          priority: "high",
          assignee: "John",
        },
        {
          id: "card2",
          title: "Setup database migrations",
          priority: "medium",
          assignee: "Sarah",
        },
        {
          id: "card3",
          title: "Write API documentation",
          priority: "low",
        },
      ],
    },
    {
      id: "inprogress",
      title: "In Progress",
      color: "bg-yellow-100 dark:bg-yellow-950",
      cards: [
        {
          id: "card4",
          title: "Implement user authentication",
          priority: "urgent",
          assignee: "Mike",
        },
        {
          id: "card5",
          title: "Fix responsive design issues",
          priority: "high",
          assignee: "Emma",
        },
      ],
    },
    {
      id: "review",
      title: "Review",
      color: "bg-blue-100 dark:bg-blue-950",
      cards: [
        {
          id: "card6",
          title: "Code review PR #234",
          priority: "medium",
          assignee: "Alex",
        },
      ],
    },
    {
      id: "done",
      title: "Done",
      color: "bg-green-100 dark:bg-green-950",
      cards: [
        {
          id: "card7",
          title: "Setup CI/CD pipeline",
          priority: "high",
          assignee: "David",
        },
        {
          id: "card8",
          title: "Deploy v1.0 release",
          priority: "high",
          assignee: "Lisa",
        },
      ],
    },
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high":
        return "bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "medium":
        return "bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    columnId: string,
    cardIndex: number
  ) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    if (containerRect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }

    setDraggedCard({ columnId, cardId: columns.find(c => c.id === columnId)?.cards[cardIndex].id || "", cardIndex });
    (e.currentTarget as HTMLElement).style.opacity = "0.5";
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).style.opacity = "1";
    setDraggedCard(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropOnColumn = (targetColumnId: string) => {
    if (!draggedCard) return;

    // Find the source column and card
    const sourceColumn = columns.find((c) => c.id === draggedCard.columnId);
    const targetColumn = columns.find((c) => c.id === targetColumnId);

    if (!sourceColumn || !targetColumn) return;

    const [movedCard] = sourceColumn.cards.splice(draggedCard.cardIndex, 1);

    // Add to target column
    targetColumn.cards.push(movedCard);

    // Update state
    setColumns([...columns]);
    setDraggedCard(null);
  };

  const handleRemoveCard = (columnId: string, cardIndex: number) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              cards: col.cards.filter((_, i) => i !== cardIndex),
            }
          : col
      )
    );
  };

  return (
    <div
      ref={containerRef}
      className="w-full bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6"
      style={{ maxWidth: "960px", margin: "0 auto", minHeight: "500px" }}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex-shrink-0 w-72 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col"
          >
            {/* Column Header */}
            <div className={`${column.color} px-4 py-3 border-b border-gray-200 dark:border-gray-700`}>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                {column.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {column.cards.length} {column.cards.length === 1 ? "task" : "tasks"}
              </p>
            </div>

            {/* Cards Container */}
            <div
              className="flex-1 p-3 space-y-2 overflow-y-auto"
              onDragOver={handleDragOver}
              onDrop={() => handleDropOnColumn(column.id)}
            >
              {column.cards.length === 0 ? (
                <div className="flex items-center justify-center h-20 text-gray-400 dark:text-gray-600 text-sm">
                  Drop cards here
                </div>
              ) : (
                column.cards.map((card, cardIndex) => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, column.id, cardIndex)}
                    onDragEnd={handleDragEnd}
                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <GripHorizontal className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1 leading-tight">
                        {card.title}
                      </h4>
                      <button
                        onClick={() => handleRemoveCard(column.id, cardIndex)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        title="Remove card"
                      >
                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>

                    {/* Card Metadata */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                            card.priority
                          )}`}
                        >
                          {card.priority.charAt(0).toUpperCase() + card.priority.slice(1)}
                        </span>
                      </div>
                      {card.assignee && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Assigned:</span> {card.assignee}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info text */}
      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>💡 Drag cards between columns to organize your workflow</p>
      </div>
    </div>
  );
}
