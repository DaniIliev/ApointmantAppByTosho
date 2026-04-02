"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, Clock, Euro, Tag, Users } from "lucide-react";
import { formatPriceEUR } from "@/Global/Utils/commonFn";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import { AppointmentType } from "@/Global/Types/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type AppointmentCardProps = {
  type: AppointmentType;
  openModal: (type: AppointmentType) => void;
  handleDelete: (type: AppointmentType) => void;
  formatDuration: (minutes: number) => string;
  setSelectedType: (type: AppointmentType) => void;
  className?: string;
};

const AppointmentCard = ({
  type,
  openModal,
  handleDelete,
  formatDuration,
  setSelectedType,
  className,
}: AppointmentCardProps) => {
  const { t } = useTranslation();

  // Handle image URL - in the type it's File | null, but in the DB it's a string
  const imageUrl = typeof type.imageUrl === 'string' ? type.imageUrl : undefined;

  return (
    <Card
      key={type._id}
      onClick={() => setSelectedType(type)}
      className={cn(
        "bg-white dark:bg-gray-800 border-[1.5px] border-primary/10 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col h-full cursor-pointer",
        className
      )}
    >
      <div className="relative w-full h-56 overflow-hidden bg-gray-100 dark:bg-gray-900">
        <img
          src={imageUrl || "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"}
          alt={type.name}
          className="w-full h-full object-contain transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
          <div className="flex justify-between items-end w-full">
            <h3 className="text-2xl font-bold text-white drop-shadow-md">{type.name}</h3>
            <div 
              className="flex gap-2 backdrop-blur-md bg-white/20 p-1.5 rounded-full" 
              onClick={(e) => e.stopPropagation()}
            >
              <CustomTooltip 
                onClick={() => openModal(type)} 
                tooltipText={t("Edit")} 
                icon={<Pencil className="h-4 w-4 text-white hover:text-primary transition-colors cursor-pointer" />} 
              />
              <CustomTooltip 
                onClick={() => handleDelete(type)} 
                tooltipText={t("Delete")} 
                icon={<Trash2 className="h-4 w-4 text-red-400 hover:text-red-500 transition-colors cursor-pointer" />} 
              />
            </div>
          </div>
        </div>
        {/* Category Badge on Top-Left */}
        {type?.category && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-primary/90 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-lg">
              {type.category}
            </span>
          </div>
        )}
        {type?.isGroup && (
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-accent/90 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-lg">
              {t("Group")}
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-5 flex-grow space-y-4">
        {/* Color stripe like in original AppointmentCard but integrated into the design */}
        <div className={cn("h-1.5 w-full rounded-full bg-gradient-to-r", type.color)} />
        
        <div className="space-y-3 pt-2">
          {type.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
              {type.description}
            </p>
          )}

          <div className="grid grid-cols-1 gap-3 pt-2">
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="bg-primary/10 p-2 rounded-full shrink-0">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium whitespace-nowrap">{formatDuration(type.duration)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="bg-primary/10 p-2 rounded-full shrink-0">
                <Euro className="h-4 w-4 text-primary" />
              </div>
              <span className="font-bold text-lg text-primary">{formatPriceEUR(type.price)}</span>
            </div>
            {type.isGroup && (
              <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <div className="bg-accent/10 p-2 rounded-full shrink-0">
                  <Users className="h-4 w-4 text-accent" />
                </div>
                <span className="font-medium">{type.capacity} {t("participants")}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;
