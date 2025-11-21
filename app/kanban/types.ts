export type Priority = "low" | "medium" | "high" | "urgent";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export interface Comment {
  _id: string;
  userId: string;
  user: User;
  text: string;
  parentId?: string;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface KanbanCard {
  _id: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  priority?: Priority;
  status?: "Planned" | "In Progress" | "Finished";
  columnId: string;
  assignedUsers: User[];
  comments: Comment[];
  attachments: Attachment[];
  order: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface KanbanColumn {
  _id: string;
  title: string;
  color: string;
  order: number;
  limit?: number;
  cards: KanbanCard[];
}

export interface KanbanBoard {
  _id: string;
  title: string;
  description?: string;
  columns: KanbanColumn[];
  members: User[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  priority: Priority;
  columnId: string;
  assignedUsers: string[];
}

export interface CreateColumnData {
  title: string;
  color: string;
  limit?: number;
}
