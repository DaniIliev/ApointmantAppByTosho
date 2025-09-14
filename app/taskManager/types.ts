import { IBaseKanbanCard } from "@/components/InteractiveKanbanBoard/KanbanboardUtils";

export type KanbanBoardListItem = {
  id: string;
  title: string;
  updated_at: string | null;
  created_at: string | null;
};

export type KanbanBoardType = {
  cards: KanbanTask[];
  columns: KanbanBoardColumn[];
  config: any;
};

export type KanbanBoardColumn = {
  id: string;
  title: string;
  order: number;
};
export type KanbanTask = IBaseKanbanCard & {
  title: string;
  repeatable?: boolean;
  description?: string;
  planned_end_date?: string;
  planned_start_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  actual_duration?: number | null;
  planned_duration?: string;
  tags?: string[];
  get_object_url?: string | null;
  comments_component?: {
    get_chat_url: string | null;
    get_messages_url: string;
    post_message_url: string;
    edit_message_url: string;
    delete_message_url: string;
    websocket_url: string;
    enable_live_updates: boolean;
    enable_editing: boolean;
    enable_deletion: boolean;
  };
  meta?: {
    creator_id?: string;
    creator_name?: string;
    created_at?: string;
    updated_at?: string;
  };
  // assignees?: UserPossibleAssignes[];
  comments?: Comment[];
  attachments?: string[];
};

export type Comment = {
  id: string;
  thread_id: string;
  user_id: string;
  user_name: string;
  parent_message_id: string | null;
  message: string;
  created_at: string;
  is_edited: boolean;
  edited_at: string | null;
  is_deleted: boolean;
  replies?: Comment[];
};
