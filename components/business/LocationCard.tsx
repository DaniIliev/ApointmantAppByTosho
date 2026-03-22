"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Pencil, Trash2, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import { Location } from "@/Global/Types/types";
import { cn } from "@/lib/utils";

interface LocationCardProps {
  location: any; // Allow flexibility for now
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

  // Handle image URL - might be string or undefined from the global type
  const imageUrl = typeof location.imageUrl === 'string' ? location.imageUrl : undefined;

  return (
    <Card
      className={cn(
        "bg-white dark:bg-gray-800 border-[1.5px] shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col h-full cursor-pointer",
        isSelected ? "border-primary ring-2 ring-primary/20" : "border-primary/10",
        className
      )}
      onClick={onClick}
    >
      <div className="relative w-full h-70 overflow-hidden">
        <img
          src={imageUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"}
          alt={location.name}
          className="w-full h-full object-contain transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
          <div className="flex justify-between items-end w-full">
            <h3 className="text-2xl font-bold text-white drop-shadow-md">{location.name}</h3>
            {showActions && (
              <div className="flex gap-2 backdrop-blur-md bg-white/20 p-1.5 rounded-full" onClick={(e) => e.stopPropagation()}>
                {onEdit && (
                  <CustomTooltip 
                    onClick={onEdit} 
                    tooltipText={t("Edit")} 
                    icon={<Pencil className="h-4 w-4 text-white hover:text-primary transition-colors cursor-pointer" />} 
                  />
                )}
                {onDelete && (
                  <CustomTooltip 
                    onClick={onDelete} 
                    tooltipText={t("Delete")} 
                    icon={<Trash2 className="h-4 w-4 text-red-400 hover:text-red-500 transition-colors cursor-pointer" />} 
                  />
                )}
              </div>
            )}
            {isSelected && !showActions && (
              <span className="bg-primary text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mb-1">
                {t("Selected")}
              </span>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-5 flex-grow space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="bg-primary/10 p-2 rounded-full">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <span className="mt-1.5 font-medium">{location.address}, {location.city}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="bg-primary/10 p-2 rounded-full">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium">{location.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="bg-primary/10 p-2 rounded-full">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium">{location.email}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
