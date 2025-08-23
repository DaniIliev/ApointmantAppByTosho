"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface TimeFilterProps {
  selectedPeriod: string
  onPeriodChange: (period: string) => void
  customDateRange?: {
    from: Date | undefined
    to: Date | undefined
  }
  onCustomDateChange?: (range: { from: Date | undefined; to: Date | undefined }) => void
}

const timePeriods = [
  { value: "last7days", label: "Last 7 Days" },
  { value: "last30days", label: "Last 30 Days" },
  { value: "thismonth", label: "This Month" },
  { value: "lastmonth", label: "Last Month" },
  { value: "thisquarter", label: "This Quarter" },
  { value: "lastquarter", label: "Last Quarter" },
  { value: "thisyear", label: "This Year" },
  { value: "custom", label: "Custom Range" },
]

export function TimeFilter({ selectedPeriod, onPeriodChange, customDateRange, onCustomDateChange }: TimeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {timePeriods.map((period) => (
        <Button
          key={period.value}
          variant={selectedPeriod === period.value ? "default" : "outline"}
          size="sm"
          onClick={() => onPeriodChange(period.value)}
          className={cn(
            "backdrop-blur-md border-white/20",
            selectedPeriod === period.value && "theme-gradient-primary text-white",
          )}
        >
          {period.label}
        </Button>
      ))}

      {selectedPeriod === "custom" && onCustomDateChange && (
        <div className="flex gap-2 ml-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal backdrop-blur-md border-white/20",
                  !customDateRange?.from && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customDateRange?.from ? (
                  customDateRange.to ? (
                    <>
                      {format(customDateRange.from, "LLL dd, y")} - {format(customDateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(customDateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 backdrop-blur-md bg-popover/90" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={customDateRange?.from}
                selected={customDateRange}
                onSelect={(range) => onCustomDateChange(range || { from: undefined, to: undefined })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  )
}
