"use client";

import React, { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { HoverImagePreview } from "@/components/customUIComponents/HoverImagePreview";
import { compressImage } from "@/lib/imageCompression";
import { Loader2 } from "lucide-react";

interface ImageUploadProps {
  value?: string | File | null;
  onChange: (value: File | null) => void;
  onRemove: () => void;
  label?: string;
  className?: string;
  fullWidth?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  label,
  className,
  fullWidth = false,
}: ImageUploadProps) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      onChange(null);
      return;
    }

    // Only compress if it's an image
    if (file.type.startsWith("image/")) {
      try {
        setIsCompressing(true);
        const compressedFile = await compressImage(file);
        onChange(compressedFile);
      } catch (error) {
        console.error("Compression error:", error);
        onChange(file); // Fallback to original if compression fails
      } finally {
        setIsCompressing(false);
      }
    } else {
      onChange(file);
    }
  };

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    if (typeof value === "string") {
      setPreview(value);
    } else if (value instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(value);
    }
  }, [value]);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      {preview ? (
        <div>
          <HoverImagePreview
            src={preview}
            alt={label || t("Image preview")}
            previewTitle={label || t("Image preview")}
            onDelete={onRemove}
            onChangeImage={handleFileChange}
            className={cn(
              "w-full aspect-[4/3]",
              fullWidth ? "max-w-none" : "max-w-[220px]",
            )}
            imageClassName="object-contain bg-muted/20"
          />
        </div>
      ) : (
        <label
          className={cn(
            "flex w-full flex-col items-center justify-center aspect-[4/3] rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all group p-4",
            fullWidth ? "max-w-none" : "max-w-[220px]",
          )}
        >
          {isCompressing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground">{t("Compressing...")}</span>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-full bg-primary/10 mb-2 group-hover:scale-110 transition-transform">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {t("Upload Image")}
              </span>
            </>
          )}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            disabled={isCompressing}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileChange(file);
              }
            }}
          />
        </label>
      )}
    </div>
  );
}
