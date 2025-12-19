"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  X,
  FilterIcon,
  Clock,
  Sun,
  Moon,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "@/context/DashboardDateContext";

interface TimeFilterProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  customDateRange?: DateRange;
  onCustomDateChange?: (range: DateRange) => void;
  onRemoveFilter: () => void;
}

const timePeriods = [
  {
    value: "last7days",
    label: "Last 7 Days",
    icon: <Sun className="mr-2 h-4 w-4" />,
  },
  {
    value: "last30days",
    label: "Last 30 Days",
    icon: <Moon className="mr-2 h-4 w-4" />,
  },
  {
    value: "thismonth",
    label: "This Month",
    icon: <CalendarIcon className="mr-2 h-4 w-4" />,
  },
  {
    value: "lastmonth",
    label: "Last Month",
    icon: <CalendarIcon className="mr-2 h-4 w-4" />,
  },
  {
    value: "thisquarter",
    label: "This Quarter",
    icon: <TrendingUp className="mr-2 h-4 w-4" />,
  },
  {
    value: "lastquarter",
    label: "Last Quarter",
    icon: <TrendingUp className="mr-2 h-4 w-4" />,
  },
  {
    value: "thisyear",
    label: "This Year",
    icon: <Clock className="mr-2 h-4 w-4" />,
  },
  {
    value: "custom",
    label: "Custom Range",
    icon: <CalendarIcon className="mr-2 h-4 w-4" />,
  },
];

const getPeriodLabel = (value: string, range?: DateRange): string => {
  if (value === "custom" && range?.from) {
    const from = format(range.from, "MMM dd, y");
    const to = range.to ? format(range.to, "MMM dd, y") : "...";
    return `Custom: ${from}${range.to ? ` - ${to}` : ""}`;
  }
  const period = timePeriods.find((p) => p.value === value);
  return period ? period.label : "Select Period";
};

export function TimeFilter({
  selectedPeriod,
  onPeriodChange,
  customDateRange,
  onCustomDateChange,
  onRemoveFilter,
}: TimeFilterProps) {
  const [isMainFilterOpen, setIsMainFilterOpen] = React.useState(false);
  const [isCustomPopoverOpen, setIsCustomPopoverOpen] = React.useState(false);

  // Use local state to temporarily hold the date range while picking
  const [tempCustomDateRange, setTempCustomDateRange] =
    React.useState<DateRange>(
      customDateRange || { from: undefined, to: undefined }
    );

  // Sync temp state when customDateRange prop changes (e.g., when filter is applied or removed externally)
  React.useEffect(() => {
    setTempCustomDateRange(
      customDateRange || { from: undefined, to: undefined }
    );
  }, [customDateRange]);

  const activeLabel = getPeriodLabel(selectedPeriod, customDateRange);

  const handlePeriodChange = (period: string) => {
    onPeriodChange(period);
    if (period !== "custom") {
      setIsMainFilterOpen(false);
    }
  };

  const handleTempRangeChange = (range: any) => {
    if (range?.from && range?.to) {
      const newRange: DateRange = range;
      setTempCustomDateRange(newRange);
    }
  };

  const handleClose = () => {
    setTempCustomDateRange(
      customDateRange || { from: undefined, to: undefined }
    );
    setIsCustomPopoverOpen(false);
    setIsMainFilterOpen(false);
  };

  // Handler for applying the custom filter
  const handleApplyCustomFilter = () => {
    if (onCustomDateChange) {
      // 1. Pass the temporary state back to the parent component
      onCustomDateChange(tempCustomDateRange);
      // 2. Officially set the period to 'custom'
      onPeriodChange("custom");
    }
    // 3. Close popovers
    setIsCustomPopoverOpen(false);
    setIsMainFilterOpen(false);
  };

  // When opening the custom popover, ensure local temp state reflects the current selection
  const handleCustomTriggerClick = () => {
    setTempCustomDateRange(
      customDateRange || { from: undefined, to: undefined }
    );
    setIsCustomPopoverOpen(true);
  };

  return (
    <div className="flex items-center gap-3">
      <Popover open={isMainFilterOpen} onOpenChange={setIsMainFilterOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "backdrop-blur-md border-white/20 hover:bg-primary/10 transition-colors duration-200",
              selectedPeriod !== "" &&
                selectedPeriod !== "none" &&
                "border-blue-500/50"
            )}
          >
            <FilterIcon className="mr-2 h-4 w-4" />
            Filter by Period
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-48 p-2 backdrop-blur-md bg-popover/90 z-[100]"
          align="start"
        >
          <div className="flex flex-col gap-1">
            {timePeriods.map((period) => {
              if (period.value === "custom") {
                return (
                  <Popover
                    key={period.value}
                    open={isCustomPopoverOpen}
                    // Removed onOpenChange to prevent closing on outside click/Escape
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-sm hover:bg-primary/20 hover:text-primary"
                        onClick={handleCustomTriggerClick}
                      >
                        {period.icon}
                        {period.label}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent
                      // --- ПРОМЕНИ ТУК: Задаваме позиция отдясно за десктоп ---
                      align="start" // За да остане отворено отляво, когато основният Popover е "align=start"
                      side="right" // Отваряне вдясно спрямо бутона "Custom Range"
                      sideOffset={4} // Малък отстъп
                      // Responsive styling for full-screen calendar on mobile
                      className={cn(
                        // Mobile (default): Fullscreen overlay, centered content
                        "fixed inset-0 w-screen h-screen z-[101] p-4 bg-background/95 backdrop-blur-sm flex flex-col justify-center items-center",
                        // Desktop (sm:): Normal popover positioning, now positioned right (side="right")
                        "sm:relative sm:inset-auto sm:w-auto sm:h-auto sm:p-0 sm:rounded-md sm:block sm:bg-popover/90"
                      )}
                    >
                      {/* Inner content wrapper, centered on mobile */}
                      <div className="bg-popover/95 p-4 sm:p-0 sm:bg-transparent sm:w-auto w-full max-w-lg rounded-lg shadow-xl">
                        {/* Mobile Header and Close Button */}
                        <div className="flex justify-between items-center mb-4 sm:hidden border-b border-b-white/10 pb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            Select Custom Range
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClose}
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>

                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={tempCustomDateRange?.from}
                          selected={tempCustomDateRange}
                          onSelect={handleTempRangeChange}
                          numberOfMonths={2}
                          className="p-2 w-full"
                        />
                        <div className="p-2 border-t border-t-white/10 flex justify-end gap-2 mt-4 sm:mt-0">
                          <Button
                            onClick={handleClose}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleApplyCustomFilter}
                            disabled={
                              !tempCustomDateRange?.from ||
                              !tempCustomDateRange?.to
                            }
                            variant="default"
                            size="sm"
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              }

              return (
                <Button
                  key={period.value}
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePeriodChange(period.value)}
                  className={cn(
                    "w-full justify-start text-sm hover:bg-primary/20 hover:text-primary",
                    selectedPeriod === period.value &&
                      "bg-primary/10 text-primary font-semibold hover:bg-primary/20"
                  )}
                >
                  {period.icon}
                  {period.label}
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {selectedPeriod !== "" && selectedPeriod !== "none" && (
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-fit h-auto rounded-full py-1.5 px-3 text-sm font-bold shadow-sm",
            "bg-primary/30 text-primary border-primary/50 backdrop-blur-md hover:bg-primary/30"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <CalendarIcon className="mr-1 h-4 w-4 text-primary" />
          <span className="text-primary">{activeLabel}</span>
          <X
            className="ml-2 h-4 w-4 cursor-pointer text-primary hover:text-red-500 transition-colors"
            onClick={onRemoveFilter}
          />
        </Button>
      )}
    </div>
  );
}
