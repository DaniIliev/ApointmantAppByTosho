"use client";

import React, { useState, useMemo } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { ActiveFiltersDisplay } from "./ActiveFiltersDisplay";
import { MultiSelectFilterMenu, FilterOption } from "./MultiSelectFilterMenu";
import { DateRangePicker } from "./DateRangePicker";

export interface GenericFiltersData {
  searchText: string;
  dateFilter?: string;
  customDateRange?: { start: string; end: string };
  [key: string]: any;
}

type ArrayStringKey<F> = {
  [K in keyof F]: F[K] extends string[] ? K : never;
}[keyof F];

export type FilterGroupType = "chip" | "avatar";

export interface FilterConfig<T extends GenericFiltersData> {
  key: ArrayStringKey<T>;
  label: string;
  options: FilterOption[];
  type?: FilterGroupType;
  enableSearch?: boolean;
  avatarSrcKey?: keyof FilterOption;
  oneOption?: boolean;
  getIcon?: (option: FilterOption) => React.ReactNode;
  getIndicatorColor?: (value: string) => string;
}

interface GenericFiltersProps<T extends GenericFiltersData> {
  filters: T;
  setFilters: React.Dispatch<React.SetStateAction<T>>;
  filterConfigs: FilterConfig<T>[];
  className?: string;
  noSearchBox?: boolean;
  noChips?: boolean;
  dateFilters?: boolean;
}

export function GenericFilters<T extends GenericFiltersData>({
  filters,
  setFilters,
  filterConfigs,
  className = "",
  noChips = false,
  noSearchBox = false,
  dateFilters = false,
}: GenericFiltersProps<T>) {
  const { t } = useTranslation();
  const [filterAnchorOpen, setFilterAnchorOpen] = useState(false);

  // For individual menus inside the popover
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<{ startDate: string | null; endDate: string | null }>({ startDate: null, endDate: null });

  const totalActiveFilters = useMemo(() => {
    let count = filters.searchText ? 1 : 0;
    if (dateFilters && filters.dateFilter) count += 1;
    filterConfigs.forEach((config) => {
      const val = filters[config.key];
      if (Array.isArray(val)) count += val.length;
    });
    return count;
  }, [filters, filterConfigs, dateFilters]);

  const handleFilterClose = () => {
    setFilterAnchorOpen(false);
    setOpenMenus({});
    setDateMenuOpen(false);
  };

  const handleToggleFilter = (
    filterValue: string,
    filterKey: keyof T,
    oneOption?: boolean
  ) => {
    setFilters((prev) => {
      const currentFilters = (prev[filterKey] as string[]) || [];
      const isSelected = currentFilters.includes(filterValue);

      if (oneOption) {
        return {
          ...prev,
          [filterKey]: isSelected ? [] : [filterValue],
        } as T;
      } else {
        return {
          ...prev,
          [filterKey]: isSelected
            ? currentFilters.filter((item) => item !== filterValue)
            : [...currentFilters, filterValue],
        } as T;
      }
    });
  };

  const handleClearAllFilters = () => {
    const cleared = { searchText: "" } as Record<string, any>;
    if (dateFilters) {
      cleared.dateFilter = undefined;
      cleared.customDateRange = undefined;
    }
    filterConfigs.forEach((config) => {
      cleared[config.key as string] = [];
    });
    setFilters({ ...filters, ...cleared } as T);
    setShowCustomDatePicker(false);
    setTempDateRange({ startDate: null, endDate: null });
    handleFilterClose();
  };

  const handleDateFilterChange = (value: string) => {
    if (value === "custom") {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
      setDateMenuOpen(false);
      if (filters.dateFilter === value) {
        setFilters((prev) => ({
          ...prev,
          dateFilter: undefined,
          customDateRange: undefined,
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          dateFilter: value,
          customDateRange: undefined,
        }));
      }
    }
  };

  const handleApplyCustomDateRange = () => {
    if (tempDateRange.startDate && tempDateRange.endDate) {
      setFilters((prev) => ({
        ...prev,
        dateFilter: "custom",
        customDateRange: {
          start: tempDateRange.startDate!,
          end: tempDateRange.endDate!,
        },
      }));
      setShowCustomDatePicker(false);
      setDateMenuOpen(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      <div className="flex flex-wrap gap-2 items-end justify-start">
        {/* Search Box */}
        {!noSearchBox && (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("Search...")}
              value={filters.searchText || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchText: e.target.value }) as T)
              }
              className="pl-8 w-[200px] bg-background"
            />
          </div>
        )}

        {/* Main Filter Button (Triggers Popover) */}
        <Popover open={filterAnchorOpen} onOpenChange={setFilterAnchorOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`gap-2 min-w-[120px] justify-start bg-background ${
                totalActiveFilters > 0
                  ? "border-primary text-primary hover:bg-primary/5 hover:text-primary"
                  : ""
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>{t("Filters")}</span>
              {totalActiveFilters > 0 && (
                <span className="ml-1 inline-flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold h-5 min-w-5 rounded-full px-1.5">
                  {totalActiveFilters}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2 shadow-xl bg-card border-border/50" align="start">
            <div className="space-y-1">
              {filterConfigs.map((config) => (
                <MultiSelectFilterMenu
                  key={config.key as string}
                  open={!!openMenus[config.key as string]}
                  onOpenChange={(isOpen: boolean) =>
                    setOpenMenus((prev) => ({ ...prev, [config.key]: isOpen }))
                  }
                  title={t(config.label)}
                  options={config.options}
                  selectedFilters={(filters[config.key] as string[]) || []}
                  onToggleFilter={(val: string) =>
                    handleToggleFilter(val, config.key, config.oneOption)
                  }
                  enableSearch={config.enableSearch}
                  getIcon={config.getIcon}
                  getIndicatorColor={config.getIndicatorColor}
                />
              ))}

              {dateFilters && (
                <MultiSelectFilterMenu
                  open={dateMenuOpen}
                  onOpenChange={setDateMenuOpen}
                  title={t("Date Range")}
                  options={[
                    { value: "today", description: t("Today") },
                    { value: "this_week", description: t("This Week") },
                    { value: "this_month", description: t("This Month") },
                    { value: "next_week", description: t("Next Week") },
                    { value: "custom", description: t("Custom Range") },
                  ]}
                  selectedFilters={filters.dateFilter ? [filters.dateFilter] : []}
                  onToggleFilter={handleDateFilterChange}
                  renderCustomContent={
                    showCustomDatePicker ? (
                      <div className="p-3 border-t border-border mt-2 space-y-3">
                        <DateRangePicker
                          value={tempDateRange}
                          onChange={setTempDateRange}
                        />
                        <Button
                          className="w-full h-8 text-xs"
                          disabled={!tempDateRange.startDate || !tempDateRange.endDate}
                          onClick={handleApplyCustomDateRange}
                        >
                          {t("Apply")}
                        </Button>
                      </div>
                    ) : undefined
                  }
                />
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear All Filters Button */}
        {totalActiveFilters > 0 && (
          <Button
            variant="ghost"
            onClick={handleClearAllFilters}
            className="text-muted-foreground hover:text-foreground h-10 px-3 flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span className="text-sm">{t("Clear")}</span>
          </Button>
        )}
      </div>

      {/* Active Filter Chips/Avatars */}
      {!noChips && (
        <div className="flex flex-wrap gap-2 items-center justify-start mt-1">
          <ActiveFiltersDisplay
            filters={filters}
            filterConfigs={filterConfigs}
            handleToggleFilter={handleToggleFilter}
            showDateFilter={dateFilters}
            onRemoveDateFilter={() =>
              setFilters((prev) => ({
                ...prev,
                dateFilter: undefined,
                customDateRange: undefined,
              }))
            }
          />
        </div>
      )}
    </div>
  );
}
