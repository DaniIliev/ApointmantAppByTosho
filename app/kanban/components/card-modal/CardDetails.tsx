"use client";

import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { LabeledTextarea } from "@/components/customUIComponents/LabeledTextarea";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Flame,
  ClipboardList,
  Settings,
  CheckCircle2,
} from "lucide-react";
import { Priority } from "../../types";

interface CardDetailsProps {
  formData: {
    title: string;
    description: string;
    priority: Priority;
    status: "Planned" | "In Progress" | "Finished";
  };
  onChange: (field: string, value: string) => void;
}

const priorityOptions = [
  { id: "low" as const, name: "Low", icon: "ArrowDown" },
  { id: "medium" as const, name: "Medium", icon: "ArrowRight" },
  { id: "high" as const, name: "High", icon: "ArrowUp" },
  { id: "urgent" as const, name: "Urgent", icon: "Flame" },
];

const statusOptions = [
  { id: "Planned" as const, name: "Planned", icon: "ClipboardList" },
  { id: "In Progress" as const, name: "In Progress", icon: "Settings" },
  { id: "Finished" as const, name: "Finished", icon: "CheckCircle2" },
];

export function CardDetails({ formData, onChange }: CardDetailsProps) {
  return (
    <div className="space-y-5">
      {/* Title Input */}
      <LabeledInput
        id="title"
        label="Title"
        value={formData.title}
        onChange={(e) => onChange("title", e.target.value)}
        placeholder="Enter card title"
        required
      />

      {/* Metadata Row - Priority & Status */}
      <div className="grid grid-cols-2 gap-4">
        <LabeledSelect
          id="priority"
          label="Priority"
          value={formData.priority}
          onValueChange={(value) => onChange("priority", value)}
          placeholder="Select priority"
          options={priorityOptions}
        />
        <LabeledSelect
          id="status"
          label="Status"
          value={formData.status}
          onValueChange={(value) => onChange("status", value)}
          placeholder="Select status"
          options={statusOptions}
        />
      </div>

      {/* Description */}
      <LabeledTextarea
        id="description"
        label="Description"
        value={formData.description}
        onChange={(e) => onChange("description", e.target.value)}
        placeholder="Add a detailed description..."
        rows={6}
      />
    </div>
  );
}
