"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  MessageSquare,
  Paperclip,
  MoreVertical,
  AlertCircle,
  Settings,
  CheckCircle2,
  ClipboardList,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Flame,
} from "lucide-react";
import { KanbanCard as KanbanCardType, Priority } from "../types";
import { format } from "date-fns";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface KanbanCardProps {
  card: KanbanCardType;
  onEdit: (card: KanbanCardType) => void;
  onDelete: (cardId: string) => void;
}

const priorityConfig: Record<
  Priority,
  { color: string; label: string; Icon: React.ComponentType<any> }
> = {
  low: { color: "bg-gray-500", label: "Low", Icon: ArrowDown },
  medium: { color: "bg-blue-500", label: "Medium", Icon: ArrowRight },
  high: { color: "bg-orange-500", label: "High", Icon: ArrowUp },
  urgent: { color: "bg-red-500", label: "Urgent", Icon: Flame },
};

export function KanbanCard({ card, onEdit, onDelete }: KanbanCardProps) {
  const [showMenu, setShowMenu] = useState(false);

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

  const getPriorityConfig = () => priorityConfig[card.priority || "medium"];
  const isOverdue =
    card.endDate &&
    new Date(card.endDate) < new Date() &&
    card.status !== "Finished";

  const statusConfig: Record<
    NonNullable<KanbanCardType["status"]>,
    { label: string; className: string; Icon: React.ComponentType<any> }
  > = {
    Planned: {
      label: "Planned",
      className:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      Icon: ClipboardList,
    },
    "In Progress": {
      label: "In Progress",
      className:
        "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      Icon: Settings,
    },
    Finished: {
      label: "Finished",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Icon: CheckCircle2,
    },
  };

  const avatarColors = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
  ];
  const colorFor = (id: string) => {
    let sum = 0;
    for (let i = 0; i < id.length; i++) sum = (sum + id.charCodeAt(i)) % 2048;
    return avatarColors[sum % avatarColors.length];
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className="mb-3 cursor-pointer hover:shadow-lg transition-shadow group bg-card border-border"
        onClick={() => onEdit(card)}
      >
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-foreground line-clamp-2">
                {card.title}
              </h3>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded"
            >
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Description Preview */}
          {card.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {card.description}
            </p>
          )}

          {/* Status + Priority */}
          <div className="flex items-center gap-2 flex-wrap">
            {card.status &&
              (() => {
                const sc = statusConfig[card.status!];
                const SIcon = sc.Icon;
                return (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${sc.className}`}
                  >
                    <SIcon className="w-3 h-3" />
                    {sc.label}
                  </span>
                );
              })()}
            {(() => {
              const pc = getPriorityConfig();
              const PIcon = pc.Icon;
              return (
                <Badge
                  className={`${pc.color} text-white text-xs px-2 py-0.5 inline-flex items-center gap-1`}
                >
                  <PIcon className="w-3 h-3" /> {pc.label}
                </Badge>
              );
            })()}
            {isOverdue && (
              <Badge variant="destructive" className="text-xs px-2 py-0.5">
                <AlertCircle className="w-3 h-3 mr-1" />
                Overdue
              </Badge>
            )}
          </div>

          {/* Dates */}
          {card.startDate && card.endDate && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(card.startDate), "MMM d")}</span>
              </div>
              <span>→</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(card.endDate), "MMM d")}</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            {/* Assigned Users */}
            <div className="flex -space-x-2">
              {card.assignedUsers.slice(0, 3).map((user) => (
                <Avatar
                  key={user._id}
                  className="w-6 h-6 border-2 border-background ring-1 ring-border"
                >
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback
                    className="text-[10px] font-semibold text-white"
                    style={{ backgroundColor: colorFor(user._id) }}
                  >
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
              {card.assignedUsers.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-muted border-2 border-background ring-1 ring-border flex items-center justify-center text-[10px]">
                  +{card.assignedUsers.length - 3}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {card.comments.length > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{card.comments.length}</span>
                </div>
              )}
              {card.attachments.length > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="w-3 h-3" />
                  <span>{card.attachments.length}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Context Menu */}
      {showMenu && (
        <div className="absolute right-0 mt-1 w-32 bg-popover border border-border rounded-lg shadow-lg z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card);
              setShowMenu(false);
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-t-lg"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card._id);
              setShowMenu(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-accent rounded-b-lg"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
