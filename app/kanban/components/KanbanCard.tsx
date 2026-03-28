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
  Trash2,
} from "lucide-react";
import { KanbanCard as KanbanCardType, Priority } from "../types";
import { format } from "date-fns";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  card: KanbanCardType;
  onEdit: (card: KanbanCardType) => void;
  onDelete: (cardId: string) => void;
}

const priorityConfig: Record<Priority, { bg: string; text: string; label: string; Icon: React.ComponentType<any> }> = {
  low: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-300", label: "Low", Icon: ArrowDown },
  medium: { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-600 dark:text-blue-400", label: "Medium", Icon: ArrowRight },
  high: { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-600 dark:text-orange-400", label: "High", Icon: ArrowUp },
  urgent: { bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-600 dark:text-red-400", label: "Urgent", Icon: Flame },
};

const statusConfig: Record<NonNullable<KanbanCardType["status"]>, { label: string; className: string; Icon: React.ComponentType<any> }> = {
  Planned: {
    label: "Planned",
    className: "bg-slate-100/80 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400",
    Icon: ClipboardList,
  },
  "In Progress": {
    label: "In Progress",
    className: "bg-amber-100/80 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    Icon: Settings,
  },
  Finished: {
    label: "Finished",
    className: "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    Icon: CheckCircle2,
  },
};

const avatarColors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];
const colorFor = (id: string) => {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum = (sum + id.charCodeAt(i)) % 2048;
  return avatarColors[sum % avatarColors.length];
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
  };

  const getPriorityConfig = () => priorityConfig[card.priority || "medium"];
  const isOverdue = card.endDate && new Date(card.endDate) < new Date() && card.status !== "Finished";

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative z-0 outline-none">
      <Card
        className={cn(
          "cursor-pointer bg-card/95 border-border/40 transition-all duration-200 shadow-sm hover:shadow-md hover:border-primary/20",
          isDragging && "opacity-60 scale-[0.98] rotate-1 shadow-xl ring-2 ring-primary ring-offset-1 z-50",
          "group rounded-xl overflow-hidden"
        )}
        onClick={() => onEdit(card)}
      >
        <CardContent className="p-3.5 flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-[13px] leading-tight text-foreground/90 line-clamp-2 mt-0.5">
              {card.title}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className={cn(
                "p-1 -mt-1 -mr-1 rounded-md transition-all shrink-0",
                showMenu ? "opacity-100 bg-accent text-foreground" : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Description Preview */}
          {card.description && (
            <p className="text-[11px] text-muted-foreground/80 line-clamp-2 leading-relaxed">
              {card.description}
            </p>
          )}

          {/* Status & Priority */}
          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
            {/* Status */}
            {card.status && (() => {
              const sc = statusConfig[card.status!];
              const SIcon = sc.Icon;
              return (
                <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium tracking-tight", sc.className)}>
                  <SIcon className="w-[10px] h-[10px]" />
                  {sc.label}
                </span>
              );
            })()}

            {/* Priority */}
            {(() => {
              const pc = getPriorityConfig();
              const PIcon = pc.Icon;
              return (
                <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium tracking-tight", pc.bg, pc.text)}>
                  <PIcon className="w-[10px] h-[10px]" />
                  {pc.label}
                </span>
              );
            })()}

            {/* Overdue Badge */}
            {isOverdue && (
              <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 text-destructive px-1.5 py-0.5 text-[10px] font-semibold tracking-tight">
                <AlertCircle className="w-[10px] h-[10px]" />
                Overdue
              </span>
            )}
          </div>

          {/* Footer containing Dates, Attachments and Users */}
          <div className="flex items-end justify-between pt-2 border-t border-border/30 mt-1.5">
            <div className="flex flex-col gap-2">
              {/* Dates */}
              {card.startDate && card.endDate && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium bg-secondary/30 px-1.5 py-0.5 rounded-md w-fit border border-border/20">
                  <Calendar className="w-3 h-3 text-muted-foreground/70" />
                  <span>{format(new Date(card.startDate), "MMM d")} - {format(new Date(card.endDate), "MMM d")}</span>
                </div>
              )}
              
              {/* Stats */}
              {(card.comments.length > 0 || card.attachments.length > 0) && (
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium px-1">
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
              )}
            </div>

            {/* Assigned Users Array */}
            <div className="flex -space-x-1.5">
              {card.assignedUsers.slice(0, 3).map((user) => (
                <Avatar
                  key={user._id}
                  className="w-6 h-6 border-2 border-card ring-1 ring-border/5 shadow-sm transition-transform hover:scale-110 hover:z-20 cursor-pointer"
                  title={`${user.firstName} ${user.lastName}`}
                >
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback
                    className="text-[9px] font-bold text-white shadow-inner"
                    style={{ backgroundColor: colorFor(user._id) }}
                  >
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
              {card.assignedUsers.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[9px] font-semibold text-muted-foreground z-10 shadow-sm ring-1 ring-border/5">
                  +{card.assignedUsers.length - 3}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Context Menu Popup */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute top-10 right-2 w-36 bg-popover border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden text-sm font-medium animate-in fade-in zoom-in-95 duration-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(card);
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
            >
              <Settings className="w-3.5 h-3.5" />
              Edit
            </button>
            <div className="h-px bg-border/40 mx-2" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(card._id);
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
