"use client";

import { format } from "date-fns";
import { Clock, Eye, Pencil, Plus } from "lucide-react";
import type { DailyViewData, DayViewEntry, Schedule, StaffMember } from "../types";
import { getFullName, getStaffInitials } from "../utils";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import { useAuthContext } from "@/context/AuthContext";

// ─── Props ────────────────────────────────────────────────

interface DesktopScheduleBoardProps {
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

export function DesktopScheduleBoard({
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
}: DesktopScheduleBoardProps) {
  const { user } = useAuthContext();
  
  return (
    <div className="hidden overflow-auto md:block">
      <table className="w-full min-w-[1080px] text-sm ">
        <thead className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm">
          <tr className="bg-muted/30 border-b">
            <th className="text-left p-3 font-semibold min-w-[180px]">
              {t("Staff Member")}
            </th>
            {weekDays.map((day, index) => (
              <th
                key={day.toISOString()}
                className="p-3 text-center min-w-[110px]"
              >
                <div className="text-xs text-muted-foreground">
                  {t(dayTitles[index])}
                </div>
                <div className="font-semibold">{format(day, "dd")}</div>
              </th>
            ))}
            <th className="p-3 text-center min-w-[100px] font-semibold">
              {t("Actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {visibleStaff.map((staffMember) => {
            const staffName = getFullName(staffMember);
            const staffMemberSchedules =
              staffSchedulesMap.get(staffMember._id) || [];
            const mainSchedule = staffMemberSchedules[0] || null;

            return (
              <tr
                key={staffMember._id}
                className="border-b last:border-b-0 hover:bg-muted/15 transition-colors"
              >
                {/* Staff info cell */}
                <td className="p-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-9 w-9 shrink-0 rounded-full border border-primary/20 bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center overflow-hidden font-semibold text-sm tracking-wide shadow-sm">
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
                      <div className="flex flex-wrap items-center gap-x-1 gap-y-1 min-w-0">
                        <h4 className="truncate font-semibold leading-tight text-[14px]">
                          {staffName}
                        </h4>
                      </div>
                      {staffMemberSchedules.length > 1 && (
                        <div className="mt-1 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                          {staffMemberSchedules.length} {t("schedules")}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Day cells */}
                {weekDays.map((day) => {
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
                      <td
                        key={`${staffMember._id}-${day.toISOString()}`}
                        className="p-2 text-center text-muted-foreground"
                      >
                        -
                      </td>
                    );
                  }

                  const isDayOff = dayData.isDayOff;
                  const locationId =
                    dayData.location || dayData.locationId;
                  const locationName = locationId
                    ? locationNameMap.get(locationId)
                    : null;

                  return (
                    <td
                      key={`${staffMember._id}-${day.toISOString()}`}
                      className="p-2"
                    >
                      <button
                            type="button"
                            onClick={() =>
                              onOpenStaffCalendar(
                                dayData.scheduleId || null,
                                staffMember._id,
                              )
                            }
                            className={`w-full rounded-md border px-2 py-1.5 text-center transition-colors ${
                              isDayOff
                                ? "bg-card border-primary/10 text-primary/40"
                                : "bg-card border-primary/40 text-primary hover:bg-primary/10"
                            }`}
                          >
                            {isDayOff ? (
                              <span className="text-xs font-medium block">
                                {t("Day Off")}
                              </span>
                            ) : (
                              <span className="text-xs font-semibold flex items-center justify-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {dayData.workTime?.start} - {dayData.workTime?.end}
                              </span>
                            )}
                            {!selectedLocationId && locationName && (
                              <div className={`text-[10px] mt-1 ${
                                isDayOff 
                                  ? "text-slate-400 dark:text-slate-500" 
                                  : "text-blue-700 dark:text-blue-400"
                              }`}>
                                {locationName}
                              </div>
                            )}
                          </button>
                    </td>
                  );
                })}

                {/* Actions cell */}
                <td className="p-3">
                  <div className="flex items-center justify-center gap-1">
                    {(() => {
                      const isOwner = user?._id === staffMember._id || user?._id === staffMember._id;
                      const hasAdminRole = user?.role === "business" || user?.role === "manager";
                      const canEdit = isOwner || hasAdminRole;

                      if (mainSchedule) {
                        return (
                          <>
                            <CustomTooltip
                              onClick={() =>
                                onOpenStaffCalendar(
                                  mainSchedule._id,
                                  staffMember._id,
                                )
                              }
                              tooltipText={t("View")}
                              icon={<Eye />}
                            />
                            {canEdit ? (
                              <CustomTooltip
                                onClick={() => onOpenStaffScheduleEdit(staffMember)}
                                tooltipText={t("Edit")}
                                icon={<Pencil />}
                              />
                            ) : (
                              <CustomTooltip
                                onClick={() => {}}
                                tooltipText={t("No permissions")}
                                icon={<Pencil className="opacity-50" />}
                              />
                            )}
                          </>
                        );
                      } else {
                         if (canEdit) {
                           return (
                              <CustomTooltip
                                onClick={() => onCreateScheduleForStaff(staffMember)}
                                tooltipText={t("Create")}
                                icon={<Plus />}
                              />
                           );
                         } else {
                           return (
                              <CustomTooltip
                                onClick={() => {}}
                                tooltipText={t("No permissions")}
                                icon={<Plus className="opacity-50" />}
                              />
                           );
                         }
                      }
                    })()}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
