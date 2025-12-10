"use client";
import React from "react";
import { Modal } from "@/components/customUIComponents/Modal";
import { Button } from "../ui/button";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose();
  };
  return (
    <Modal
      label={title}
      open={isOpen}
      onOpenChange={handleOpenChange}
      width="md"
      confirmClose={false}
      scrollableContent={false}
      centerContentOnMobile
    >
      <div className="flex flex-1 min-h-[50vh] flex-col items-center justify-center gap-6 py-4 text-center">
        <p className="text-lg md:text-base leading-relaxed">{message}</p>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-center sm:space-x-2 space-y-2 sm:space-y-0 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm} tone="error">
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationDialog;
