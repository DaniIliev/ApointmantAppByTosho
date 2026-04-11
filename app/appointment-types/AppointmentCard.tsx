"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, Clock, Euro, Users } from "lucide-react";
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
  const imageUrl =
    typeof type.imageUrl === "string" ? type.imageUrl : undefined;

  return (
    <Card
      key={type._id}
      onClick={() => setSelectedType(type)}
      className={cn(
        "group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-primary/10 bg-white/95 shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 dark:border-primary/20 dark:bg-gray-800/90",
        className,
      )}
    >
      <div className="relative h-56 w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
        <img
          src={
            imageUrl ||
            "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"
          }
          alt={type.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <div className="flex items-center justify-end gap-2">
            <div
              className="flex gap-2 rounded-full bg-black/25 p-1.5 backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              <CustomTooltip
                onClick={() => openModal(type)}
                tooltipText={t("Edit")}
                icon={
                  <Pencil className="h-4 w-4 cursor-pointer text-white/90 transition-colors hover:text-primary" />
                }
              />
              <CustomTooltip
                onClick={() => handleDelete(type)}
                tooltipText={t("Delete")}
                icon={
                  <Trash2 className="h-4 w-4 cursor-pointer text-red-300 transition-colors hover:text-red-500" />
                }
              />
            </div>
          </div>
        </div>
      </div>

      <CardContent className="flex flex-col gap-1 p-3">
        <div className={cn("h-1 w-full rounded-full opacity-80", type.color)} />
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1">
            {type?.category && (
              <span className="rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                {type.category}
              </span>
            )}
            {type?.isGroup && (
              <span className="rounded bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                {t("Group")}
              </span>
            )}
          </div>
          {type.isGroup && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{type.capacity}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-3">
          <h3 className="truncate font-semibold text-sm flex-grow">
            {type.name}
          </h3>
          <div className="flex shrink-0 items-center gap-3 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap">
                {formatDuration(type.duration)}
              </span>
            </div>
            <div className="flex items-center gap-1 font-bold text-primary">
              <Euro className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap">
                {formatPriceEUR(type.price)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;
