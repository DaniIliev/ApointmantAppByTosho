"use client";
import KanbanBoard from "@/components/InteractiveKanbanBoard/KanbanBoard";
import {
  BoardType,
  KanbanBoardColumn,
  NewFormData,
} from "@/components/InteractiveKanbanBoard/KanbanboardUtils";
import React, { useState } from "react";

interface AppointmentsBoardViewProps {
  onOpenModal: () => void;
}
const AppointmentsBoardView = ({ onOpenModal }: AppointmentsBoardViewProps) => {
  const [open, setOpen] = useState<boolean>(false);

  const columns: KanbanBoardColumn[] = [
    { id: "toDo", title: "To Do", order: 1 },
    { id: "inProgress", title: "In Progress", order: 2 },
    { id: "Done", title: "Done", order: 3 },
  ];

  const tasks: any[] = [];

  const userPerm = {
    id: "1",
    user_id: "2",
    username: "string",
    kanban_id: "2",
    view: true,
    add: true,
    edit: true,
    delete: true,
    share: true,
  };
  return (
    <div className="w-full min-h-[400px]">
      <KanbanBoard
        tasks={tasks}
        columns={columns}
        // boardType={BoardType.UMTBoard}
        handleUpdateTask={function (_updated: any[]): Promise<void> {
          throw new Error("Function not implemented.");
        }}
        handleCreateCard={function (
          _newFormData: NewFormData,
          _columnId: string
        ): void {
          throw new Error("Function not implemented.");
        }}
        handleViewTask={function (_id: string): void {
          throw new Error("Function not implemented.");
        }}
        handleDeleteTask={function (_id: string): void {
          throw new Error("Function not implemented.");
        }}
        currentUserPermissions={userPerm}
        onOpenModal={onOpenModal}
        boardType={BoardType.Appointment}
      />
    </div>
  );
};

export default AppointmentsBoardView;
