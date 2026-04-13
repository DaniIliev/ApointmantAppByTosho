"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { FilterConfig, GenericFiltersData } from "./GenericFilters";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface ActiveFiltersDisplayProps<T extends GenericFiltersData> {
  filters: T;
  filterConfigs: FilterConfig<T>[];
  handleToggleFilter: (value: string, key: keyof T) => void;
  showDateFilter?: boolean;
  onRemoveDateFilter?: () => void;
}

const colorFor = (id: string) => {
  const avatarColors = [
    "#6366f1", "#10b981", "#f59e0b", "#ef4444",
    "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
  ];
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum = (sum + id.charCodeAt(i)) % 2048;
  return avatarColors[sum % avatarColors.length];
};

export function ActiveFiltersDisplay<T extends GenericFiltersData>({
  filters,
  filterConfigs,
  handleToggleFilter,
  showDateFilter,
  onRemoveDateFilter,
}: ActiveFiltersDisplayProps<T>) {
  const { t } = useTranslation();

  const getDateFilterLabel = () => {
    if (!filters.dateFilter) return null;
    if (filters.dateFilter === "custom" && filters.customDateRange) {
      const { start, end } = filters.customDateRange;
      const fmt = (iso: string) => iso.split("-").reverse().join(".");
      return `${fmt(start)} - ${fmt(end)}`;
    }
    const map: Record<string, string> = {
      today: t("Today"),
      this_week: t("This Week"),
      this_month: t("This Month"),
      next_week: t("Next Week"),
    };
    return map[filters.dateFilter] || filters.dateFilter;
  };

  return (
    <>
      {filterConfigs.map((config) => {
        const selectedValues = filters[config.key] as string[] | undefined;
        if (!selectedValues || selectedValues.length === 0) return null;

        const selectedOptions = config.options.filter((o) =>
          selectedValues.includes(o.value)
        );

        return (
          <div
            key={config.key as string}
            className="flex items-center gap-2 mr-2 p-1 pl-2 border border-border/60 bg-accent/30 rounded-lg"
          >
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              {t(config.label)}:
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {selectedOptions.map((option) => {
                if (config.type === "avatar" && config.avatarSrcKey) {
                  const avatarSrc = option[config.avatarSrcKey] as string;
                  const firstLetters = option.description.substring(0, 2).toUpperCase();

                  return (
                    <div
                      key={option.value}
                      className={cn(
                        "group relative flex items-center justify-center w-6 h-6 rounded-full cursor-pointer ring-1 ring-border shadow-sm hover:ring-destructive transition-all duration-200"
                      )}
                      title={option.description}
                      onClick={() => handleToggleFilter(option.value, config.key)}
                    >
                      <Avatar className="w-full h-full">
                        <AvatarImage src={avatarSrc} />
                        <AvatarFallback
                          className="text-[9px] font-bold text-white transition-opacity group-hover:opacity-20"
                          style={{ backgroundColor: colorFor(option.value) }}
                        >
                          {firstLetters}
                        </AvatarFallback>
                      </Avatar>
                      <X className="absolute opacity-0 group-hover:opacity-100 w-3 h-3 text-destructive z-10 transition-opacity" />
                    </div>
                  );
                }

                // Default "Chip" view
                const color = config.getIndicatorColor?.(option.value);
                return (
                  <Badge
                    key={option.value}
                    variant="outline"
                    className="flex items-center gap-1 bg-background shadow-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive group transition-colors cursor-pointer py-0.5"
                    onClick={() => handleToggleFilter(option.value, config.key)}
                  >
                    {color && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    )}
                    {config.getIcon?.(option)}
                    <span className="font-normal">{option.description}</span>
                    <X className="w-3 h-3 opacity-50 group-hover:opacity-100 ml-0.5" />
                  </Badge>
                );
              })}
            </div>
          </div>
        );
      })}

      {showDateFilter && filters.dateFilter && (
        <div className="flex items-center gap-2 mr-2 p-1 pl-2 border border-border/60 bg-accent/30 rounded-lg">
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            {t("Date")}:
          </span>
          <Badge
            variant="default"
            className="flex items-center gap-1 shadow-xs hover:bg-destructive hover:text-white group transition-colors cursor-pointer py-0.5"
            onClick={onRemoveDateFilter}
          >
            <span className="font-normal">{getDateFilterLabel()}</span>
            <X className="w-3 h-3 opacity-70 group-hover:opacity-100 ml-0.5" />
          </Badge>
        </div>
      )}
    </>
  );
}
