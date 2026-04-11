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
            onChangeImage={onChange}
            className="w-full max-w-[220px] aspect-[4/3]"
            imageClassName="object-contain bg-muted/20"
          />
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full max-w-[220px] aspect-[4/3] rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all group p-4">
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
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onChange(file);
              }
            }}
          />
        </label>
      )}
    </div>
  );
}
