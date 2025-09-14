import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";

interface ModalProps {
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Modal = ({ label, open, onOpenChange, children }: ModalProps) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-lg border-2 border-primary/20 [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {label}
          </DialogTitle>
        </DialogHeader>

        <div className="absolute top-4 right-4">
          <CustomTooltip onClick={() => onOpenChange(false)} icon={<X />} />
        </div>

        {children}
      </DialogContent>
    </Dialog>
  );
};
