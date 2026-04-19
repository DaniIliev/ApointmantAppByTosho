"use client";

import { format } from "date-fns";
import { Clock, ExternalLink, Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { DailyViewData, DayViewEntry, Schedule, StaffMember } from "../types";
import { getFullName, getStaffInitials } from "../utils";

// ─── Props ────────────────────────────────────────────────

interface MobileScheduleBoardProps {
  weekDays: Date[];
  dayTitles: string[];
  selectedLocationId?: string;
  locationNameMap: Map<string, string>;
  visibleStaff: StaffMember[];
  staffSchedulesMap: Map<string, Schedule[]>;
  dailyViewData: DailyViewData;
  onOpenStaffScheduleEdit: (staffMember: StaffMember) => void;
  onOpenStaffCalendar: (
    scheduleId: string | null,
    staffId?: string,
  ) => void;
  onCreateScheduleForStaff: (staffMember: StaffMember) => void;
  t: (key: string) => string;
}

// ─── Component ────────────────────────────────────────────

export function MobileScheduleBoard({
  weekDays,
  dayTitles,
  selectedLocationId,
  locationNameMap,
  visibleStaff,
  staffSchedulesMap,
  dailyViewData,
  onOpenStaffScheduleEdit,
  onOpenStaffCalendar,
  onCreateScheduleForStaff,
  t,
}: MobileScheduleBoardProps) {
  return (
    <div className="space-y-4 md:hidden">
      {visibleStaff.map((staffMember) => {
        const staffName = getFullName(staffMember);
        const staffMemberSchedules =
          staffSchedulesMap.get(staffMember._id) || [];
        const mainSchedule = staffMemberSchedules[0] || null;

        return (
          <div
            key={`mobile-${staffMember._id}`}
            className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-background"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-primary/15 bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center font-semibold shadow-sm">
                  {staffMember.profilePictureUrl ? (
                    <img
                      src={staffMember.profilePictureUrl}
                      alt={staffName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getStaffInitials(staffMember)
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h4 className="truncate font-semibold text-base leading-tight">
                      {staffName}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {staffMember.email}
                  </p>
                </div>
              </div>

              {mainSchedule ? (
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-full border border-primary/10 bg-white/70 px-2.5 text-xs font-semibold text-primary shadow-none hover:border-primary/20 hover:bg-primary/5 hover:scale-100"
                    onClick={() => onOpenStaffScheduleEdit(staffMember)}
                  >
                    <Pencil className="h-3.5 w-3.5 opacity-80" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-full border border-primary/10 bg-white/70 px-3 text-xs font-semibold text-primary shadow-none hover:border-primary/20 hover:bg-primary/5 hover:scale-100"
                    onClick={() =>
                      onOpenStaffCalendar(mainSchedule._id, staffMember._id)
                    }
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1 opacity-80" />
                    {t("Open")}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 shrink-0 rounded-full border border-primary/10 bg-white/70 px-3 text-xs font-semibold text-primary shadow-none hover:border-primary/20 hover:bg-primary/5 hover:scale-100"
                  onClick={() => onCreateScheduleForStaff(staffMember)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1 opacity-80" />
                  {t("Create")}
                </Button>
              )}
            </div>

            {/* Day chips */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {weekDays.map((day, index) => {
                const staffGroup = dailyViewData.find(
                  (g) =>
                    (typeof g.staff === "string" ? g.staff : g.staff._id) ===
                    staffMember._id,
                );
                const staffDailyHours = staffGroup
                  ? staffGroup.schedules.flatMap((s) => s.dayleschedules)
                  : [];

                const dateStr = format(day, "yyyy-MM-dd");
                const dayData = staffDailyHours.find(
                  (h) =>
                    format(new Date(h.date), "yyyy-MM-dd") === dateStr,
                );

                if (!dayData) {
                  return (
                    <div
                      key={`mobile-${staffMember._id}-${day.toISOString()}`}
                      className="min-w-[96px] rounded-xl border border-dashed bg-muted/20 px-2 py-3 text-center text-muted-foreground"
                    >
                      <div className="text-[10px] uppercase tracking-wide">
                        {t(dayTitles[index])}
                      </div>
                      <div className="mt-1 text-sm font-semibold">
                        {format(day, "dd")}
                      </div>
                      <div className="mt-2 text-xs">-</div>
                    </div>
                  );
                }

                const isDayOff = dayData.isDayOff;
                const locationId = dayData.location || dayData.locationId;
                const locationName = locationId
                  ? locationNameMap.get(locationId)
                  : null;

                return (
<button
  key={`mobile-${staffMember._id}-${day.toISOString()}`}
  type="button"
  onClick={() =>
    onOpenStaffCalendar(
      dayData.scheduleId || null,
      staffMember._id,
    )
  }
  className={`min-w-[96px] rounded-xl border px-2 py-3 text-center transition-colors ${
    isDayOff
      ? "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
      : "border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
  }`}
>
  <div className="text-[10px] uppercase tracking-wide opacity-70">
    {t(dayTitles[index])}
  </div>
  <div className="mt-1 text-sm font-semibold">
    {format(day, "dd")}
  </div>
  <div className="mt-2 text-xs font-semibold">
    {isDayOff ? (
      t("Day Off")
    ) : (
      <div className="flex items-center justify-center">
        <Clock className="h-3 w-3 mr-1" />
        {dayData.workTime?.start} - {dayData.workTime?.end}
      </div>
    )}
  </div>
  {!selectedLocationId && locationName && (
    <div className={`mt-1 text-[10px] ${
      isDayOff 
        ? "text-slate-400 dark:text-slate-500" 
        : "text-blue-700 dark:text-blue-400"
    }`}>
      {locationName}
    </div>
  )}
</button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
