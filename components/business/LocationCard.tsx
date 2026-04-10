"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { MapPin, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import { cn } from "@/lib/utils";

interface LocationCardProps {
  location: any;
  isSelected?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  showActions?: boolean;
  className?: string;
}

export function LocationCard({
  location,
  isSelected,
  onEdit,
  onDelete,
  onClick,
  showActions = false,
  className,
}: LocationCardProps) {
  const { t } = useTranslation();

  const imageUrl =
    typeof location.imageUrl === "string" ? location.imageUrl : undefined;

  const composedAddress = [location.address, location.city, location.country]
    .filter(Boolean)
    .join(", ");

  const mapQuery = encodeURIComponent(
    composedAddress || location.name || "Bulgaria",
  );
  const mapSrc = `https://www.google.com/maps?q=${mapQuery}&output=embed`;

  const fallbackImage =
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=320&q=80";
  const hasAddress = Boolean(composedAddress);

  return (
    <Card
      className={cn(
        "group relative h-[350px] overflow-hidden rounded-3xl border-2 border-primary/80 bg-background shadow-xl transition-all duration-300 hover:shadow-2xl cursor-pointer",
        isSelected && "ring-2 ring-primary/40",
        className,
      )}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background/70" />

      {hasAddress ? (
        <iframe
          src={mapSrc}
          title={`${location.name} map`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/40 text-sm text-muted-foreground">
          {t("No address available")}
        </div>
      )}

      <div className="absolute inset-0 bg-slate-950/35" />

      <div className="absolute right-4 top-4 z-20 flex items-center gap-1">
        {showActions && onEdit && onDelete && (
          <div
            className="flex gap-2 backdrop-blur-md bg-white/20 p-1.5 rounded-full"
            onClick={(e) => e.stopPropagation()}
          >
            <CustomTooltip
              onClick={onEdit}
              tooltipText={t("Edit")}
              icon={
                <Pencil className="h-4 w-4 text-white hover:text-primary transition-colors cursor-pointer" />
              }
            />
            <CustomTooltip
              onClick={onDelete}
              tooltipText={t("Delete")}
              icon={
                <Trash2 className="h-4 w-4 text-red-400 hover:text-red-500 transition-colors cursor-pointer" />
              }
            />
          </div>
        )}
      </div>

      {isSelected && (
        <div className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg">
          <CheckCircle2 className="h-4 w-4" />
          {t("Selected")}
        </div>
      )}

      <div className="absolute bottom-5 left-5 right-5 z-20">
        <div className="flex items-center justify-between gap-3 rounded-3xl bg-black/85 p-4 text-white backdrop-blur-sm">
          <div className="min-w-0">
            <h3 className="truncate text-2xl font-bold tracking-tight">
              {location.name}
            </h3>
            <p className="truncate text-lg text-white/85">
              {composedAddress || t("No address available")}
            </p>
          </div>
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-white/80 bg-muted">
            <img
              src={imageUrl || fallbackImage}
              alt={location.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      {!isSelected && (
        <div className="absolute inset-0 z-0 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="h-full w-full bg-primary/5" />
        </div>
      )}
    </Card>
  );
}
