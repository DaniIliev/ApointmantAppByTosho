"use client";

import React from "react";
import { MapPin, Clock, Edit2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Стандартна помощна функция за класове в Shadcn

import type { DayKey } from "../types";
import { dayTitles } from "../utils";

interface LocationHeroCardProps {
  location: any;
  onEditHours?: () => void;
}

export const LocationHeroCard: React.FC<LocationHeroCardProps> = ({
  location,
  onEditHours,
}) => {
  const { t } = useTranslation();

  if (!location) return null;

  const dayKeys: DayKey[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  return (
    <Card className="overflow-hidden border-none shadow-lg bg-white dark:bg-slate-950">
      {/* Header Section */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm shadow-inner transition-transform group-hover:scale-105">
              {location.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white dark:border-slate-950 rounded-full" title="Active" />
          </div>
          
          <div className="space-y-1">
            <h2 className="text-lg font-bold tracking-tight leading-tight text-text-primary">
              {location.name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <MapPin className="h-3.5 w-3.5 text-primary/70" />
              <span>{location.address}, {location.city}</span>
            </div>
          </div>
        </div>

        {onEditHours && (
          <Button 
            type="button"
            onClick={onEditHours}
            className="h-9 gap-2 font-semibold text-xs transition-all hover:bg-primary hover:text-primary-foreground"
          >
            <Edit2 className="h-3.5 w-3.5" />
            {t('Edit Hours')}
          </Button>
        )}
      </div>

      {/* Weekly Schedule Grid */}
      <div className="px-2 pb-2">
        <div className="grid grid-cols-7 gap-1 p-1.5 rounded-xl bg-card">
          {dayKeys.map((dayKey, index) => {
            const data = location.weeklyWorkingHours?.[dayKey];
            const isDayOff = data?.isDayOff;
            const label = dayTitles[index];

            return (
              <div 
                key={dayKey} 
                className={cn(
                  "flex flex-col items-center py-2 rounded-lg transition-all",
                  isDayOff 
                    ? "bg-card shadow-sm" 
                    : "bg-card shadow-sm"
                )}
              >
                <span className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1">
                  {t(label)}
                </span>
                
                {isDayOff ? (
                  <span className="text-xs font-bold text-primary/70">
                    {t("Day Off")}
                  </span>
                ) : (
                  <div className="flex flex-col md:flex-row items-center leading-none">
                    <Clock className="h-3 w-3 mr-1 text-primary" />
                    <span className="text-[11px] font-black text-primary tracking-tighter">
                      {data?.workTime?.start}
                    </span>
                    <span className="text-[9px] font-medium text-primary my-0.5">—</span>
                    <span className="text-[11px] font-black text-primary tracking-tighter">
                      {data?.workTime?.end}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};