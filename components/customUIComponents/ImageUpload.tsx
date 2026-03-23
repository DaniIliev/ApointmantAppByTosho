"use client";

import React, { useState, useEffect } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string | File | null;
  onChange: (value: File | null) => void;
  onRemove: () => void;
  label?: string;
  className?: string;
}

export function ImageUpload({ value, onChange, onRemove, label, className }: ImageUploadProps) {
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
      {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <div className="relative">
        {preview ? (
          <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-border group">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onRemove();
                }}
                size="icon"
                variant="destructive"
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full aspect-[16/10] rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
            <div className="p-4 rounded-full bg-primary/10 mb-2 group-hover:scale-110 transition-transform">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">{t("Upload Image")}</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>
    </div>
  );
}
