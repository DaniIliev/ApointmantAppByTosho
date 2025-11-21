"use client";

import { LabeledInput } from "@/components/customUIComponents/LabeledInput";

interface CardDatesProps {
  startDate: string;
  endDate: string;
  onChange: (field: string, value: string) => void;
}

export function CardDates({ startDate, endDate, onChange }: CardDatesProps) {
  const duration =
    startDate && endDate
      ? Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <LabeledInput
          id="startDate"
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => onChange("startDate", e.target.value)}
        />
        <LabeledInput
          id="endDate"
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => onChange("endDate", e.target.value)}
        />
      </div>
      {duration !== null && (
        <div className="text-xs text-muted-foreground px-1 -mt-1">
          Duration: {duration} days
        </div>
      )}
    </div>
  );
}
