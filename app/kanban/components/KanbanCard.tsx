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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KanbanCardProps {
  card: KanbanCardType;
  onEdit: (card: KanbanCardType) => void;
  onDelete: (cardId: string) => void;
}

const priorityConfig: Record<Priority, { bg: string; text: string; label: string; Icon: React.ComponentType<any>; color: string }> = {
  low: { bg: "bg-slate-100 dark:bg-slate-800/60", text: "text-slate-600 dark:text-slate-400", label: "Low", Icon: ArrowDown, color: "text-slate-500" },
  medium: { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-600 dark:text-blue-400", label: "Medium", Icon: ArrowRight, color: "text-blue-500" },
  high: { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-600 dark:text-orange-400", label: "High", Icon: ArrowUp, color: "text-orange-500" },
  urgent: { bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-600 dark:text-red-400", label: "Urgent", Icon: Flame, color: "text-red-500" },
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
        <CardContent className="p-3.5 flex flex-col gap-3.5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-start gap-2 mt-0.5 min-w-0">
              {(() => {
                const pc = getPriorityConfig();
                const PIcon = pc.Icon;
                return (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <PIcon className={cn("w-3.5 h-3.5 shrink-0 mt-[2px] cursor-help", pc.color)} />
                      </TooltipTrigger>
                      <TooltipContent side="top" align="start" className="text-[10px] font-bold px-2 py-1">
                        {pc.label} Priority
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })()}
              <h3 className="font-semibold text-[13.5px] leading-[1.3] text-foreground/90 break-words">
                {card.title}
              </h3>
            </div>
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
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Description Preview */}
          {card.description && (
            <p className="text-[11.5px] text-muted-foreground/70 leading-relaxed -mt-2 line-clamp-2">
              {card.description}
            </p>
          )}

          {/* Footer containing Status, Priority, Dates, Attachments and Users */}
          <div className="flex flex-col gap-3 pt-3 border-t border-border/30 mt-0.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Status */}
                {card.status && (() => {
                  const sc = statusConfig[card.status!];
                  const SIcon = sc.Icon;
                  return (
                    <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold tracking-tight uppercase", sc.className)}>
                      <SIcon className="w-[10px] h-[10px]" />
                      {sc.label}
                    </span>
                  );
                })()}

                {/* Priority Badge */}
                {(() => {
                  const pc = getPriorityConfig();
                  const PIcon = pc.Icon;
                  return (
                    <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold tracking-tight uppercase", pc.bg, pc.text)}>
                      <PIcon className="w-[10px] h-[10px]" />
                      {pc.label}
                    </span>
                  );
                })()}

                {/* Overdue Badge */}
                {isOverdue && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 text-destructive px-1.5 py-0.5 text-[9px] font-bold tracking-tight uppercase">
                    <AlertCircle className="w-[10px] h-[10px]" />
                    Overdue
                  </span>
                )}
              </div>

              {/* Assigned Users Array */}
              <div className="flex -space-x-2 shrink-0">
                {card.assignedUsers.slice(0, 3).map((user) => (
                  <Avatar
                    key={user._id}
                    className="w-6.5 h-6.5 border-2 border-card ring-1 ring-border/5 shadow-sm transition-transform hover:scale-110 hover:z-20 cursor-pointer"
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
                  <div className="w-6.5 h-6.5 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[9px] font-bold text-muted-foreground z-10 shadow-sm ring-1 ring-border/5">
                    +{card.assignedUsers.length - 3}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row: Dates & Stats */}
            {(card.startDate || card.comments.length > 0 || card.attachments.length > 0) && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Dates */}
                  {card.startDate && card.endDate && (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold bg-secondary/40 px-1.5 py-0.5 rounded-md border border-border/10">
                      <Calendar className="w-3 h-3 text-muted-foreground/60" />
                      <span>{format(new Date(card.startDate), "MMM d")} - {format(new Date(card.endDate), "MMM d")}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-semibold">
                  {card.comments.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3 opacity-70" />
                      <span>{card.comments.length}</span>
                    </div>
                  )}
                  {card.attachments.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Paperclip className="w-3 h-3 opacity-70" />
                      <span>{card.attachments.length}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
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
