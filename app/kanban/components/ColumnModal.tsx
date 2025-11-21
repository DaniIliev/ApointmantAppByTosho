"use client";

import { useState } from "react";
import { Modal } from "@/components/customUIComponents/Modal";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { Button } from "@/components/ui/button";
import { KanbanColumn } from "../types";

interface ColumnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: KanbanColumn | null;
  mode: "create" | "edit";
  onSave: (
    columnData: Partial<KanbanColumn>,
    mode: "create" | "edit"
  ) => Promise<void>;
  onDelete?: (columnId: string) => void;
}

const predefinedColors = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // orange
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

export function ColumnModal({
  open,
  onOpenChange,
  column,
  mode,
  onSave,
  onDelete,
}: ColumnModalProps) {
  const [formData, setFormData] = useState({
    title: column?.title || "",
    color: column?.color || predefinedColors[0],
    limit: column?.limit?.toString() || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      const columnData: Partial<KanbanColumn> = {
        title: formData.title,
        color: formData.color,
        limit: formData.limit ? parseInt(formData.limit) : undefined,
      };

      if (mode === "edit" && column) {
        columnData._id = column._id;
        columnData.order = column.order;
      }

      await onSave(columnData, mode);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save column:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      label={mode === "create" ? "Create New Column" : "Edit Column"}
      open={open}
      onOpenChange={onOpenChange}
      autoDetectDirty
      onConfirmSave={handleSave}
      width="lg"
    >
      <div className="pl-1 pr-1 space-y-4">
        <LabeledInput
          id="title"
          label="Column Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., To Do, In Progress, Done"
          required
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Column Color</label>
          <div className="grid grid-cols-8 gap-2">
            {predefinedColors.map((color) => (
              <button
                key={color}
                onClick={() => setFormData({ ...formData, color })}
                className={`w-10 h-10 rounded-lg transition-all ${
                  formData.color === color
                    ? "ring-2 ring-primary ring-offset-2"
                    : "hover:scale-110"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <LabeledInput
          id="limit"
          label="Card Limit (Optional)"
          type="number"
          value={formData.limit}
          onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
          placeholder="No limit"
        />

        <div className="text-xs text-muted-foreground">
          💡 Setting a card limit helps prevent work overload in this column
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : mode === "create" ? "Create" : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
