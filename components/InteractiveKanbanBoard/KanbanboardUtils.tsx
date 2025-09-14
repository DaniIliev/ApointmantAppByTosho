import { ReactNode } from "react";

export type KanbanBoardId = string;
export type KanbanBoardColumn = {
  id: string;
  title: string;
  order: number;
};

export enum BoardType {
  KanbanTask = "KanbanTask",
  Appointment = "Appointment",
}

export interface IBaseKanbanCard {
  object_id: string;
  column_id: string;
  order: number;
  title: string;
  status?: "Planned" | "In Progress" | "Done" | string;
  priority?: "Low" | "Medium" | "High" | "Critical" | string;
  assignees?: UserPossibleAssignes[];
  planned_end_date?: string;
  expected_close?: string;
}

export type UserPossibleAssignes = {
  user_id: string;
  user_name: string;
  profile_picture_url: string | null;
};

export type NewFormData = {
  company?: string;
  title?: string;
  planned_end_date?: string | null;
  priority?: "Low" | "Medium" | "High" | "Critical";
  assignees?: UserPossibleAssignes[];
  company_id?: string | null;
  contact_id?: string | null;
  expected_revenue?: string | null;
};

///
export type KanbanUserPrivilege = "view" | "add" | "edit" | "delete" | "share";
export interface KanbanUserPermissionType {
  id: string;
  user_id: string;
  role_id?: string;
  username: string;
  kanban_id: string;
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  originalPrivileges?: KanbanUserPrivilege[];
  share: boolean;
}

export const KAN_TASK_PRIORITY_MAP: Record<string, string> = {
  Low: "Low",
  Medium: "Medium",
  High: "High",
  Critical: "Critical",
};

export const KAN_TASK_PRIORITY_OPTIONS: SelectOption[] = [
  {
    value: "Low",
    description: KAN_TASK_PRIORITY_MAP.Low,
  },
  {
    value: "Medium",
    description: KAN_TASK_PRIORITY_MAP.Medium,
  },
  {
    value: "High",
    description: KAN_TASK_PRIORITY_MAP.High,
  },
  {
    value: "Critical",
    description: KAN_TASK_PRIORITY_MAP.Critical,
  },
];
export type SelectOption<T extends string = string> = {
  value: T;
  description: string;
  icon?: ReactNode;
};
