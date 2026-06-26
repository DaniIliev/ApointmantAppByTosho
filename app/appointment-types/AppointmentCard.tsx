"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2, Clock, Users } from "lucide-react";
import { formatPriceEUR, getInitials } from "@/Global/Utils/commonFn";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import { AppointmentType } from "@/Global/Types/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type AppointmentCardProps = {
  type: AppointmentType;
  openModal: (type: AppointmentType) => void;
  handleDelete: (type: AppointmentType) => void;
  formatDuration: (minutes: number) => string;
  className?: string;
};

const AppointmentCard = ({
  type,
  openModal,
  handleDelete,
  formatDuration,
  className,
}: AppointmentCardProps) => {
  const { t } = useTranslation();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Handle image URL - in the type it's File | null, but in the DB it's a string
  const imageUrl =
    typeof type.imageUrl === "string" ? type.imageUrl : undefined;

  const staffMembers = type.staffMembers || [];
  const visibleStaff = staffMembers.slice(0, 4);

  return (
    <Card
      key={type._id}
      onClick={() => setIsDetailsOpen((prev) => !prev)}
      className={cn(
        "group relative h-[340px] cursor-pointer overflow-hidden rounded-[28px] border-0 bg-slate-200 shadow-lg transition-all duration-300 hover:shadow-xl",
        className,
      )}
    >
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt={type.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/30 to-slate-900/10" />

      {type?.category && (
        <div className="absolute top-3 left-3 z-20">
          <span className="rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white border border-white/20 backdrop-blur-sm">
            {type.category}
          </span>
        </div>
      )}

      <div className="absolute right-4 top-4 z-20 flex items-center gap-1">
        <div
          className="flex gap-2 rounded-full bg-black/35 p-1.5 backdrop-blur-md border border-white/15"
          onClick={(e) => e.stopPropagation()}
        >
          <CustomTooltip
            onClick={() => openModal(type)}
            tooltipText={t("Edit")}
            icon={
              <Pencil className="h-4 w-4 cursor-pointer text-white/90 transition-colors hover:text-white" />
            }
          />
          <CustomTooltip
            onClick={() => handleDelete(type)}
            tooltipText={t("Delete")}
            icon={
              <Trash2 className="h-4 w-4 cursor-pointer text-red-300 transition-colors hover:text-red-200" />
            }
          />
        </div>
      </div>

      <div className="absolute bottom-3.5 left-3.5 right-3.5 z-20">
        <div className="mb-1.5 flex justify-center">
          <div className="h-1.5 w-24 rounded-full bg-white/70" />
        </div>

        <div className="rounded-[22px] bg-black/30 p-3 text-white backdrop-blur-md border border-white/15">
          <div className="mb-2 flex items-center gap-1">
            <h3 className="min-w-0 flex-1 truncate text-base font-bold leading-tight">
              {type.name}
            </h3>
            <span className="shrink-0 rounded-full bg-black/45 px-2 py-0.5 text-xs font-semibold border border-white/20">
              {formatPriceEUR(type.price)}
            </span>
            <span className="shrink-0 inline-flex items-center gap-0.5 rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold border border-white/20">
              <Clock className="h-3 w-3" />
              {formatDuration(type.duration)}
            </span>
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              isDetailsOpen
                ? "max-h-44 opacity-100 mb-2"
                : "max-h-0 opacity-0 mb-0"
            }`}
          >
            <p className="mb-2 text-xs text-white/85 line-clamp-2">
              {type.description || t("Premium service with professional care.")}
            </p>

            <div className="flex items-center justify-between gap-2">
              <div className="flex -space-x-2">
                {visibleStaff.map((staff) => (
                  <Avatar
                    key={staff._id}
                    className="h-6 w-6 border border-white/60 ring-1 ring-black/20"
                  >
                    <AvatarImage
                      src={staff.profilePictureUrl || ""}
                      alt={`${staff.firstName || ""} ${staff.lastName || ""}`}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-slate-700 text-white text-[10px] font-semibold">
                      {getInitials(
                        `${staff.firstName || ""} ${staff.lastName || ""}`,
                      )}
                    </AvatarFallback>
                  </Avatar>
                ))}

                {staffMembers.length > 4 && (
                  <span className="h-6 min-w-6 px-1 inline-flex items-center justify-center rounded-full bg-white/20 text-[10px] font-semibold border border-white/30 text-white">
                    +{staffMembers.length - 4}
                  </span>
                )}
              </div>

              <span className="text-[11px] text-white/80 truncate">
                {staffMembers.length > 0
                  ? `${staffMembers
                      .slice(0, 2)
                      .map((staff) => staff.firstName)
                      .filter(Boolean)
                      .join(", ")}${staffMembers.length > 2 ? "..." : ""}`
                  : t("No staff")}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {type?.isGroup && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold border border-white/20">
                  <Users className="h-3 w-3" />
                  {t("Group")} {type.capacity || 1}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-0 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="h-full w-full bg-white/5" />
      </div>
    </Card>
  );
};

export default AppointmentCard;
