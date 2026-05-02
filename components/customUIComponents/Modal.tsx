import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
  className?: string;
  // Unsaved changes confirmation props
  confirmClose?: boolean; // enable confirmation when closing with unsaved changes
  hasUnsavedChanges?: boolean; // parent decides if content is dirty
  onConfirmSave?: () => Promise<void> | void; // optional save when user chooses Save and close
  autoDetectDirty?: boolean; // automatically detect input changes inside modal content
  scrollableContent?: boolean; // allow disabling internal scroll when content is small
  centerContentOnMobile?: boolean; // center dialog content on small screens
  confirmTexts?: {
    title?: string;
    message?: string;
    continueEditing?: string;
    discard?: string;
    saveAndClose?: string;
  };
}

export const Modal = ({
  label,
  open,
  onOpenChange,
  children,
  width = "2xl",
  className,
  confirmClose = true,
  hasUnsavedChanges,
  onConfirmSave,
  autoDetectDirty,
  scrollableContent = true,
  centerContentOnMobile = true,
  confirmTexts,
}: ModalProps) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [internalDirty, setInternalDirty] = useState(false);
  useTranslation();
  const [unsavedOpen, setUnsavedOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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
  const texts = useMemo(
    () => ({
      title: confirmTexts?.title ?? "Unsaved changes",
      message:
        confirmTexts?.message ??
        "You have unsaved changes. Do you want to save them before closing?",
      continueEditing: confirmTexts?.continueEditing ?? "Continue editing",
      discard: confirmTexts?.discard ?? "Discard changes",
      saveAndClose: confirmTexts?.saveAndClose ?? "Save and close",
    }),
    [confirmTexts],
  );

  const handleOpenChange = async (nextOpen: boolean) => {
    const effectiveDirty =
      hasUnsavedChanges ?? (autoDetectDirty ? internalDirty : false);
    if (!nextOpen && confirmClose && effectiveDirty) {
      setUnsavedOpen(true);
      return;
    }
    onOpenChange(nextOpen);
  };

  // Auto-detect dirty state by observing form fields inside the modal
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mediaQuery.matches);
    apply();

    mediaQuery.addEventListener("change", apply);
    return () => mediaQuery.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!open || !autoDetectDirty) return;
    const container = contentRef.current;
    if (!container) return;

    const getSnapshot = () => {
      const fields = Array.from(
        container.querySelectorAll<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >("input, textarea, select"),
      );
      const values = fields.map((el) => {
        if (
          el instanceof HTMLInputElement &&
          (el.type === "checkbox" || el.type === "radio")
        ) {
          return { name: el.name || el.id, value: el.checked };
        }
        return {
          name: el.name || el.id,
          value: (el as HTMLInputElement).value,
        };
      });
      return JSON.stringify(values);
    };

    const initial = getSnapshot();
    setInternalDirty(false);

    const handler = () => {
      const current = getSnapshot();
      setInternalDirty(current !== initial);
    };

    container.addEventListener("input", handler, { passive: true });
    container.addEventListener("change", handler, { passive: true });

    return () => {
      container.removeEventListener("input", handler as EventListener);
      container.removeEventListener("change", handler as EventListener);
    };
  }, [open, autoDetectDirty]);

  const desktopContentClasses = `${widthClass} md:max-h-[90vh] md:h-auto min-h-0 flex flex-col overflow-hidden ${
    centerContentOnMobile ? "items-stretch md:items-stretch" : ""
  } bg-card/95 backdrop-blur-lg border-2 border-primary/20 [&>button]:hidden md:rounded-lg rounded-none p-0 md:p-6`;

  const mobileContentClasses = `w-full h-auto max-h-[90dvh] min-h-0 flex flex-col overflow-hidden bg-card/95 backdrop-blur-lg [&>button]:hidden rounded-none p-0`;

  const titleClasses = `text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent ${
    centerContentOnMobile ? "w-full" : ""
  }`;

  const bodyClasses = scrollableContent
    ? "flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 md:px-0 md:pr-2 pb-4 md:pb-0 overscroll-contain"
    : "flex-1 min-h-0 overflow-visible px-4 md:px-0 md:pr-2 pb-4 md:pb-0";

  return (
    <>
      {isMobile ? (
        <Drawer open={open} onOpenChange={handleOpenChange} dismissible={false}>
          <DrawerContent className="h-auto max-h-[90dvh] overflow-hidden pb-[env(safe-area-inset-bottom)]">
            <div className={mobileContentClasses}>
              <DrawerHeader
                className={`flex-shrink-0 p-4 md:p-0 border-b md:border-b-0 border-border/50 ${
                  centerContentOnMobile ? "text-center md:text-left" : ""
                }`}
              >
                <DrawerTitle className={titleClasses}>{label}</DrawerTitle>
              </DrawerHeader>

              <div className="absolute top-3 md:top-4 right-3 md:right-4 z-10">
                <CustomTooltip
                  onClick={() => handleOpenChange(false)}
                  icon={<X />}
                />
              </div>

              <div ref={contentRef} className={bodyClasses}>
                {children}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent className={desktopContentClasses}>
            <DialogHeader
              className={`flex-shrink-0 p-4 md:p-0 border-b md:border-b-0 border-border/50 ${
                centerContentOnMobile ? "text-center md:text-left" : ""
              }`}
            >
              <DialogTitle className={titleClasses}>{label}</DialogTitle>
            </DialogHeader>

            <div className="absolute top-3 md:top-4 right-3 md:right-4 z-10">
              <CustomTooltip
                onClick={() => handleOpenChange(false)}
                icon={<X />}
              />
            </div>

            <div ref={contentRef} className={bodyClasses}>
              {children}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Unsaved changes confirmation dialog */}
      <Dialog open={unsavedOpen} onOpenChange={setUnsavedOpen}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>{texts.title}</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">{texts.message}</div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 pt-2">
            <button
              className="px-3 py-2 text-sm rounded border hover:bg-accent transition-colors"
              onClick={() => setUnsavedOpen(false)}
            >
              {texts.continueEditing}
            </button>
            <button
              className="px-3 py-2 text-sm rounded border hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => {
                setUnsavedOpen(false);
                onOpenChange(false);
              }}
            >
              {texts.discard}
            </button>
            <button
              className="px-3 py-2 text-sm rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              onClick={async () => {
                setUnsavedOpen(false);
                if (onConfirmSave) await onConfirmSave();
                onOpenChange(false);
              }}
            >
              {texts.saveAndClose}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
