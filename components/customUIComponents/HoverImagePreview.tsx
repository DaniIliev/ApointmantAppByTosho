"use client";

import React, { useMemo, useState } from "react";
import { Eye, Trash2, Image as ImageIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Modal } from "./Modal";
import { useTranslation } from "react-i18next";

interface HoverImagePreviewProps {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  imageClassName?: string;
  showPreviewIcon?: boolean;
  onDelete?: () => void;
  previewTitle?: string;
  onChangeImage?: (file: File) => void;
}

export function HoverImagePreview({
  src,
  alt,
  fallbackSrc,
  className,
  imageClassName,
  showPreviewIcon = true,
  onDelete,
  previewTitle,
  onChangeImage,
}: HoverImagePreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { t } = useTranslation();
  const resolvedSrc = useMemo(() => {
    if (src && src.trim().length > 0) return src;
    if (fallbackSrc && fallbackSrc.trim().length > 0) return fallbackSrc;
    return "";
  }, [src, fallbackSrc]);

  const hasImage = resolvedSrc.length > 0;

  return (
    <>
      <div
        className={cn(
          "group relative rounded-xl overflow-hidden bg-muted/30",
          className,
        )}
      >
        {hasImage ? (
          <img
            src={resolvedSrc}
            alt={alt}
            className={cn("w-full h-full object-cover", imageClassName)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ImageIcon className="h-6 w-6" />
          </div>
        )}

        {(showPreviewIcon || onDelete) && hasImage && (
          <>
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 rounded-full bg-black/20 p-1 backdrop-blur-[2px] opacity-100 md:hidden">
              {showPreviewIcon && (
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7 rounded-full bg-white/70 text-black/90 hover:bg-white/85"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              )}

              {onDelete && (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-7 w-7 rounded-full bg-red-500/80 text-white hover:bg-red-600"
                  onClick={onDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            <div className="absolute inset-0 z-10 hidden items-center justify-center gap-3 bg-black/25 opacity-0 backdrop-blur-[1px] transition-opacity md:flex md:group-hover:opacity-100">
              {showPreviewIcon && (
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-14 w-14 rounded-full bg-white/90 text-black shadow-lg hover:bg-white"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  <Eye className="h-7 w-7" />
                </Button>
              )}

              {onDelete && (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-14 w-14 rounded-full bg-red-600/90 text-white shadow-lg hover:bg-red-700"
                  onClick={onDelete}
                >
                  <Trash2 className="h-7 w-7" />
                </Button>
              )}
            </div>

            {onChangeImage && (
              <div className="absolute bottom-0 left-0 right-0 z-10 hidden md:flex items-center justify-center p-2 bg-gradient-to-t from-black/40 via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-white hover:text-primary transition-colors">
                  <Upload className="h-4 w-4" />
                  {t("Change image")}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onChangeImage(file);
                      }
                    }}
                  />
                </label>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        label={previewTitle || t("Image Preview")}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      >
        <div className="w-full max-h-[80vh] overflow-hidden rounded-lg bg-black/90 flex items-center justify-center">
          {hasImage ? (
            <img
              src={resolvedSrc}
              alt={alt}
              className="max-h-[80vh] w-auto object-contain"
            />
          ) : (
            <div className="py-16 text-muted-foreground">No image</div>
          )}
        </div>
      </Modal>
    </>
  );
}
