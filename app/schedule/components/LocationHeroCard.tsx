"use client";

import React from "react";
import { MapPin, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import type { WeeklyWorkingHours, DayKey } from "../types";

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

  const dayKeys: DayKey[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  return (
    <Card className="overflow-hidden border bg-white shadow-sm dark:bg-slate-900 border-slate-100 dark:border-slate-800">
      <div className="flex flex-col">
        {/* Top Section: Location Details */}
        <div className="flex flex-row items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800/50">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase shadow-md shadow-primary/20">
                {location.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
             </div>
             <div className="min-w-0">
                <h2 className="text-lg font-black tracking-tight text-foreground leading-none mb-1 shadow-primary/5">
                  {location.name}
                </h2>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                  <MapPin className="h-3 w-3 text-primary/60" />
                  <span className="truncate">{location.address}, {location.city}</span>
                </div>
             </div>
          </div>

          <div className="flex shrink-0">
             {onEditHours && (
                <Button 
                variant={'outline'}
                    onClick={onEditHours}
                    iconType="edit"
                >
                   {t('Edit Hours')}
                </Button>
              )}
          </div>
        </div>

        {/* Bottom Section: Unified Weekly Timeline */}
        <div className="bg-slate-50/50 dark:bg-slate-800/30">
          <div className="grid grid-cols-7 divide-x divide-slate-100 dark:divide-slate-800">
            {dayKeys.map((dayKey) => {
              const data = location.weeklyWorkingHours?.[dayKey];
              const isDayOff = data?.isDayOff;
              const label = dayKey.slice(0, 3).toUpperCase();

              return (
                <div 
                  key={dayKey} 
                  className={`flex flex-col items-center justify-center py-2.5 px-1 transition-colors ${
                    isDayOff ? 'bg-slate-100/30 dark:bg-slate-900/40' : ''
                  }`}
                >
                  <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${
                    isDayOff ? 'text-slate-400' : 'text-muted-foreground'
                  }`}>
                    {t(label)}
                  </span>
                  <span className={`text-[10px] font-black tracking-tighter ${
                    isDayOff ? 'text-red-300' : 'text-foreground'
                  }`}>
                    {isDayOff 
                      ? t("OFF") 
                      : `${data?.workTime?.start}-${data?.workTime?.end}`
                    }
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};
