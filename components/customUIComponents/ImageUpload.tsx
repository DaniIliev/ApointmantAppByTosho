"use client";

import React, { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { HoverImagePreview } from "@/components/customUIComponents/HoverImagePreview";

interface ImageUploadProps {
  value?: string | File | null;
  onChange: (value: File | null) => void;
  onRemove: () => void;
  label?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  label,
  className,
}: ImageUploadProps) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<string | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      {preview ? (
        <div className="space-y-2">
          <HoverImagePreview
            src={preview}
            alt={label || t("Image preview")}
            previewTitle={label || t("Image preview")}
            onDelete={onRemove}
            className="w-full aspect-[16/10]"
          />
          <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline">
            <Upload className="h-4 w-4" />
            {t("Change image")}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full aspect-[16/10] rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all group border border-dashed border-border">
          <div className="p-4 rounded-full bg-primary/10 mb-2 group-hover:scale-110 transition-transform">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {t("Upload Image")}
          </span>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
}
