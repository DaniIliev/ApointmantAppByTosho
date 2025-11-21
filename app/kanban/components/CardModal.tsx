"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/customUIComponents/Modal";
import { Button } from "@/components/ui/button";
import { KanbanCard, Priority, User, Comment, Attachment } from "../types";
import { CardDetails } from "./card-modal/CardDetails";
import { CardDates } from "./card-modal/CardDates";
import { CardAssignees } from "./card-modal/CardAssignees";
import { CardAttachments } from "./card-modal/CardAttachments";
import { CardComments } from "./card-modal/CardComments";

interface CardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: KanbanCard | null;
  mode: "create" | "edit";
  columnId?: string;
  availableUsers: User[];
  onSave: (
    cardData: Partial<KanbanCard>,
    mode: "create" | "edit"
  ) => Promise<void>;
  onDelete?: (cardId: string) => void;
}

export function CardModal({
  open,
  onOpenChange,
  card,
  mode,
  columnId,
  availableUsers,
  onSave,
  onDelete,
}: CardModalProps) {
  const [formData, setFormData] = useState({
    title: card?.title || "",
    description: card?.description || "",
    startDate: card?.startDate || "",
    endDate: card?.endDate || "",
    priority: (card?.priority || "medium") as Priority,
    status: (card?.status || "Planned") as
      | "Planned"
      | "In Progress"
      | "Finished",
    assignedUsers: card?.assignedUsers.map((u) => u._id) || [],
  });

  const [comments, setComments] = useState<Comment[]>(card?.comments || []);
  const [attachments, setAttachments] = useState<Attachment[]>(
    card?.attachments || []
  );
  const [loading, setLoading] = useState(false);

  // Snapshot of initial values to detect changes
  const [initialSnapshot, setInitialSnapshot] = useState<string>("{}");

  useEffect(() => {
    const snapshot = {
      title: card?.title || "",
      description: card?.description || "",
      startDate: card?.startDate || "",
      endDate: card?.endDate || "",
      priority: (card?.priority || "medium") as Priority,
      status: (card?.status || "Planned") as
        | "Planned"
        | "In Progress"
        | "Finished",
      assignedUsers: card?.assignedUsers.map((u) => u._id) || [],
      comments: card?.comments || [],
      attachments: card?.attachments || [],
      mode,
    };
    setInitialSnapshot(JSON.stringify(snapshot));
  }, [open, card, mode]);

  const isDirty = useMemo(() => {
    const current = {
      title: formData.title,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      priority: formData.priority,
      status: formData.status,
      assignedUsers: formData.assignedUsers,
      comments,
      attachments,
      mode,
    };
    return JSON.stringify(current) !== initialSnapshot;
  }, [formData, comments, attachments, initialSnapshot, mode]);

  // Closing handled by shared Modal via hasUnsavedChanges

  const handleSave = async () => {
    setLoading(true);
    try {
      const assignedUsersData = availableUsers.filter((u) =>
        formData.assignedUsers.includes(u._id)
      );

      const cardData: Partial<KanbanCard> = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        priority: formData.priority,
        status: formData.status,
        columnId: columnId || card?.columnId,
        assignedUsers: assignedUsersData,
        comments,
        attachments,
      };

      if (mode === "edit" && card) {
        cardData._id = card._id;
      }

      await onSave(cardData, mode);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save card:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = (text: string, parentId?: string) => {
    const newCommentObj: Comment = {
      _id: Date.now().toString(),
      userId: "current-user",
      user: availableUsers[0],
      text: text,
      parentId: parentId,
      replies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (parentId) {
      const addReply = (comments: Comment[]): Comment[] => {
        return comments.map((comment) => {
          if (comment._id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newCommentObj],
            };
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: addReply(comment.replies),
            };
          }
          return comment;
        });
      };
      setComments(addReply(comments));
    } else {
      setComments([...comments, newCommentObj]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const attachment: Attachment = {
        _id: Date.now().toString(),
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileSize: file.size,
        fileType: file.type,
        uploadedBy: "current-user",
        uploadedAt: new Date().toISOString(),
      };
      setAttachments([...attachments, attachment]);
    });
  };

  const toggleUserAssignment = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedUsers: prev.assignedUsers.includes(userId)
        ? prev.assignedUsers.filter((id) => id !== userId)
        : [...prev.assignedUsers, userId],
    }));
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      label={mode === "create" ? "Create Card" : "Card Details"}
      open={open}
      onOpenChange={onOpenChange}
      hasUnsavedChanges={isDirty}
      onConfirmSave={handleSave}
      width="7xl"
    >
      <div className="space-y-6">
        {/* Top Section - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Main Content */}
          <CardDetails formData={formData} onChange={handleFieldChange} />

          {/* Right Column - Sidebar */}
          <div className="space-y-5">
            <CardDates
              startDate={formData.startDate}
              endDate={formData.endDate}
              onChange={handleFieldChange}
            />

            <CardAssignees
              assignedUserIds={formData.assignedUsers}
              availableUsers={availableUsers}
              onToggleUser={toggleUserAssignment}
            />

            <CardAttachments
              attachments={attachments}
              onFileUpload={handleFileUpload}
              onDeleteAttachment={(id) =>
                setAttachments(attachments.filter((a) => a._id !== id))
              }
            />
          </div>
        </div>

        {/* Comments Section - Full Width at Bottom */}
        <CardComments
          comments={comments}
          availableUsers={availableUsers}
          onAddComment={handleAddComment}
        />
      </div>

      {/* Actions - show only when there are changes */}
      {isDirty && (
        <div className="pt-4">
          <div className="flex items-center justify-center gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : mode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
