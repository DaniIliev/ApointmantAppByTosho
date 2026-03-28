"use client";

import React, { useMemo, useState } from "react";
import { Check, ChevronRight, Search } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  description: string;
  profile_picture_url?: string;
  logo_url?: string;
}

interface MultiSelectFilterMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  options: FilterOption[];
  selectedFilters: string[];
  onToggleFilter: (value: string) => void;
  getIcon?: (option: FilterOption) => React.ReactNode;
  getIndicatorColor?: (value: string) => string;
  enableSearch?: boolean;
  renderCustomContent?: React.ReactNode;
}

export function MultiSelectFilterMenu({
  open,
  onOpenChange,
  title,
  options,
  selectedFilters,
  onToggleFilter,
  getIcon,
  getIndicatorColor,
  enableSearch = false,
  renderCustomContent,
}: MultiSelectFilterMenuProps) {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");

  const activeCount = selectedFilters.length;

  const filteredOptions = useMemo(() => {
    if (!searchText) return options;
    const lower = searchText.toLowerCase();
    return options.filter((o) => o.description.toLowerCase().includes(lower));
  }, [options, searchText]);

  return (
    <Collapsible
      open={open}
      onOpenChange={(v: boolean) => {
        onOpenChange(v);
        if (!v) setSearchText("");
      }}
      className="bg-transparent"
    >
      <CollapsibleTrigger asChild>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenChange(!open);
          }}
          className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
        >
          <div className="flex items-center gap-2">
            <span>{title}</span>
            {activeCount > 0 && (
              <span className="flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold h-4 min-w-4 rounded-full px-1">
                {activeCount}
              </span>
            )}
          </div>
          <ChevronRight
            className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
              open ? "rotate-90" : ""
            }`}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down px-2 pb-1">
        {enableSearch && (
          <div className="px-1 py-1 sticky top-0 bg-popover z-10">
            <div className="relative">
              <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder={t("Search")}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="h-8 pl-7 text-xs"
              />
            </div>
          </div>
        )}
        <div className="max-h-[220px] overflow-y-auto space-y-1 pt-1 scrollbar-thin">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const selected = selectedFilters.includes(option.value);
              const color = getIndicatorColor?.(option.value);

              return (
                <button
                  key={option.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFilter(option.value);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors",
                    selected ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {getIcon && (
                      <span className="flex-shrink-0 opacity-70">
                        {getIcon(option)}
                      </span>
                    )}
                    {color && !getIcon && (
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                    )}
                    <span className="truncate">{option.description}</span>
                  </div>
                  {selected && <Check className="h-4 w-4 flex-shrink-0" />}
                </button>
              );
            })
          ) : (
            <div className="px-2 py-4 text-center text-xs text-muted-foreground">
              {t("No results found")}
            </div>
          )}
        </div>
        {renderCustomContent}
      </CollapsibleContent>
    </Collapsible>
  );
}
