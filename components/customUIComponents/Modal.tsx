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
  width?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl"
    | "full";
}

export const Modal = ({
  label,
  open,
  onOpenChange,
  children,
  width = "2xl",
}: ModalProps) => {
  const { t } = useTranslation();
  const widthClassMap: Record<NonNullable<ModalProps["width"]>, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-[95vw]",
  };
  const widthClass = widthClassMap[width] ?? widthClassMap["2xl"];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${widthClass} !important bg-card/95 backdrop-blur-lg border-2 border-primary/20 [&>button]:hidden`}
      >
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
