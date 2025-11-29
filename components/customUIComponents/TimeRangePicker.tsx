"use client";

import React, { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeRangeValue {
  startTime: string | null;
  endTime: string | null;
}

interface TimeRangePickerProps {
  value: TimeRangeValue;
  onChange: (val: TimeRangeValue) => void;
  className?: string;
  label?: string;
}

const hoursAM = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString().padStart(2, "0")
);
const hoursPM = ["12"].concat(
  Array.from({ length: 11 }, (_, i) => (13 + i).toString().padStart(2, "0"))
);
const minutes = Array.from({ length: 12 }, (_, i) =>
  (i * 5).toString().padStart(2, "0")
);
const ampm = ["AM", "PM"];

function parseTime12(str: string | null) {
  if (!str) return { hour: "12", minute: "00", ampm: "AM" };
  const [h, m] = str.split(":");
  let hour = parseInt(h, 10);
  const minute = m.padStart(2, "0");
  let period = "AM";
  if (hour === 0) hour = 12;
  else if (hour === 12) period = "PM";
  else if (hour > 12) {
    hour -= 12;
    period = "PM";
  }
  return { hour: hour.toString().padStart(2, "0"), minute, ampm: period };
}

function to24(hour: string, minute: string, ampmVal: string) {
  let h = parseInt(hour, 10);
  if (ampmVal === "AM" && h === 12) h = 0;
  else if (ampmVal === "PM" && h !== 12) h += 12;
  return `${h.toString().padStart(2, "0")}:${minute}`;
}

export const TimeRangePicker: React.FC<TimeRangePickerProps> = ({
  value,
  onChange,
  className,
  label = "Select time range",
}) => {
  const [open, setOpen] = useState(false);
  const [selecting, setSelecting] = useState<"start" | "end">("start");
  // Local state for pickers
  const [tempStart, setTempStart] = useState(parseTime12(value.startTime));
  const [tempEnd, setTempEnd] = useState(parseTime12(value.endTime));

  React.useEffect(() => {
    if (!open) {
      setTempStart(parseTime12(value.startTime));
      setTempEnd(parseTime12(value.endTime));
      setSelecting("start");
    }
  }, [open, value.startTime, value.endTime]);

  const formatLabel = (start: typeof tempStart, end: typeof tempEnd) => {
    const s = `${start.hour}:${start.minute} ${start.ampm}`;
    const e = `${end.hour}:${end.minute} ${end.ampm}`;
    if (value.startTime && value.endTime) return `${s} – ${e}`;
    if (value.startTime) return `${s} – …`;
  };

  // Immediate selection logic
  const handleImmediate = (
    type: "start" | "end",
    next: typeof tempStart | typeof tempEnd
  ) => {
    if (type === "start") {
      const start24 = to24(next.hour, next.minute, next.ampm);
      onChange({ startTime: start24, endTime: value.endTime });
    } else {
      const end24 = to24(next.hour, next.minute, next.ampm);
      const start24 =
        value.startTime ||
        to24(tempStart.hour, tempStart.minute, tempStart.ampm);
      onChange({ startTime: start24, endTime: end24 });
      // Do not close popover automatically
    }
  };
  // Picker column, responsive
  const Picker = ({
    value,
    setValue,
    options,
    disabledOptions = [],
  }: {
    value: string;
    setValue: (v: string) => void;
    options: string[];
    disabledOptions?: string[];
  }) => (
    <div className="flex flex-col items-center">
      <div className="overflow-y-auto max-h-40 w-14 sm:w-12 no-scrollbar">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            disabled={disabledOptions.includes(opt)}
            onClick={() => setValue(opt)}
            className={cn(
              "w-full py-2 sm:py-1 text-center text-base rounded transition-colors",
              value === opt && "bg-primary text-primary-foreground",
              disabledOptions.includes(opt) && "opacity-30 cursor-not-allowed"
            )}
            style={{ minHeight: 36, fontSize: 18 }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <div className="relative group/labeled-input w-full">
        <label
          className={cn(
            "absolute left-4 transition-all duration-300 transform pointer-events-none z-10",
            open || value.startTime || value.endTime
              ? "text-primary"
              : "text-gray-500",
            open || value.startTime || value.endTime
              ? "-top-0.5 text-xs"
              : "top-1/2 -translate-y-1/2 text-sm"
          )}
        >
          {label}
        </label>
        <Popover.Trigger asChild>
          <button
            type="button"
            className={cn(
              "peer w-full h-14 sm:h-12 px-4 rounded-t-md border-b-2 border-transparent bg-card/80 focus:bg-card/90 transition-all duration-300 flex items-center justify-between text-base sm:text-sm outline-none placeholder-transparent focus:placeholder-gray-400 pr-8",
              open ? "border-primary" : "border-transparent",
              className
            )}
            tabIndex={0}
            style={{ position: "relative" }}
          >
            <span
              className={cn(
                !value.startTime || !value.endTime
                  ? "text-muted-foreground"
                  : "text-foreground"
              )}
            >
              {formatLabel(tempStart, tempEnd)}
            </span>
            {(value.startTime || value.endTime) && (
              <button
                type="button"
                onClick={() => {
                  onChange({ startTime: null, endTime: null });
                  setOpen(false);
                  setTempStart(parseTime12(null));
                  setTempEnd(parseTime12(null));
                  setSelecting("start");
                }}
                aria-label="Clear"
                className="absolute right-8 top-1/2 -translate-y-1/2 h-7 w-7 sm:h-5 sm:w-5 rounded-full text-muted-foreground hover:text-primary/80 flex items-center justify-center z-20"
                tabIndex={-1}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            <Clock className="h-5 w-5 sm:h-4 sm:w-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2" />
            <span
              className={cn(
                "absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300",
                open || value.startTime || value.endTime ? "w-full" : "w-0"
              )}
            />
          </button>
        </Popover.Trigger>
      </div>
      <Popover.Content
        sideOffset={8}
        className="rounded-xl border border-border bg-popover p-4 shadow-xl w-full max-w-xs sm:max-w-sm z-[1200]"
        align="start"
      >
        <div className="mb-2 flex items-center justify-center gap-2">
          <button
            type="button"
            className={cn(
              "px-4 py-1 rounded-t-md text-sm font-semibold border-b-2 transition-colors focus:outline-none",
              selecting === "start"
                ? "border-primary text-primary bg-transparent"
                : "border-transparent text-muted-foreground bg-transparent hover:text-primary"
            )}
            onClick={() => setSelecting("start")}
          >
            Start
            {value.startTime && (
              <span className="ml-2 text-xs">{value.startTime}</span>
            )}
          </button>
          <button
            type="button"
            className={cn(
              "px-4 py-1 rounded-t-md text-sm font-semibold border-b-2 transition-colors focus:outline-none",
              selecting === "end"
                ? "border-primary text-primary bg-transparent"
                : "border-transparent text-muted-foreground bg-transparent hover:text-primary",
              !value.startTime && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => value.startTime && setSelecting("end")}
            disabled={!value.startTime}
          >
            End
            {value.endTime && (
              <span className="ml-2 text-xs">{value.endTime}</span>
            )}
          </button>
        </div>
        <div className="flex gap-2 justify-center flex-wrap sm:flex-nowrap">
          {selecting === "start" ? (
            <>
              <Picker
                value={tempStart.hour}
                setValue={(v) => {
                  const next = { ...tempStart, hour: v };
                  setTempStart(next);
                  handleImmediate("start", next);
                }}
                options={tempStart.ampm === "AM" ? hoursAM : hoursPM}
              />
              <span className="self-center font-bold text-lg">:</span>
              <Picker
                value={tempStart.minute}
                setValue={(v) => {
                  const next = { ...tempStart, minute: v };
                  setTempStart(next);
                  handleImmediate("start", next);
                }}
                options={minutes}
              />
              <Picker
                value={tempStart.ampm}
                setValue={(v) => {
                  const next = {
                    ...tempStart,
                    ampm: v,
                    hour: v === "AM" ? hoursAM[0] : hoursPM[0],
                  };
                  setTempStart(next);
                  handleImmediate("start", next);
                }}
                options={ampm}
              />
            </>
          ) : (
            <>
              <Picker
                value={tempEnd.hour}
                setValue={(v) => {
                  const next = { ...tempEnd, hour: v };
                  setTempEnd(next);
                  handleImmediate("end", next);
                }}
                options={tempEnd.ampm === "AM" ? hoursAM : hoursPM}
              />
              <span className="self-center font-bold text-lg">:</span>
              <Picker
                value={tempEnd.minute}
                setValue={(v) => {
                  const next = { ...tempEnd, minute: v };
                  setTempEnd(next);
                  handleImmediate("end", next);
                }}
                options={minutes}
              />
              <Picker
                value={tempEnd.ampm}
                setValue={(v) => {
                  const next = {
                    ...tempEnd,
                    ampm: v,
                    hour: v === "AM" ? hoursAM[0] : hoursPM[0],
                  };
                  setTempEnd(next);
                  handleImmediate("end", next);
                }}
                options={ampm}
              />
            </>
          )}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
};
