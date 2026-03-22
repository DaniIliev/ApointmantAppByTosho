"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Clock, Plus, Trash } from "lucide-react";
import callApi from "@/app/Api/callApi";
import { TimeRangePicker } from "@/components/customUIComponents/TimeRangePicker";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import { toast } from "sonner";

import { Location, LocationsOpeningHours, LocationOpeningHours, TimeRange } from "@/Global/Types/types";

import { DateRangePicker } from "@/components/customUIComponents/DateRangePicker";
import { Modal } from "@/components/customUIComponents/Modal";
import { Staff } from "@/Global/Types/types";

interface HoursSetupProps {
  locations: Location[];
  staff: Staff[];
  onNext: (hours: LocationsOpeningHours) => void;
  onBack: () => void;
  initialData?: LocationsOpeningHours;
}

const initialLocationHours: LocationOpeningHours = {
  workTime: { start: "09:00", end: "18:00" },
  isDayOff: {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: true,
    sunday: true,
  },
  break1: { start: null, end: null },
  break2: { start: null, end: null },
  break3: { start: null, end: null },
};

export default function HoursSetup({ locations, staff, onNext, onBack, initialData }: HoursSetupProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [hours, setHours] = useState<LocationsOpeningHours>({});
  const [showApplyToAllModal, setShowApplyToAllModal] = useState(false);
  const [pendingResults, setPendingResults] = useState<LocationsOpeningHours | null>(null);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setHours(initialData);
    } else {
      setHours(
        locations.reduce((acc, loc, idx) => {
          const locId = (loc._id || idx).toString();
          return {
            ...acc,
            [locId]: { 
              ...initialLocationHours,
              startDate: new Date().toISOString().split("T")[0],
              endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString().split("T")[0],
            } as any
          };
        }, {} as LocationsOpeningHours)
      );
    }
  }, [initialData, locations]);

  const updateLocationField = (locId: string, field: string, val: any) => {
    setHours(prev => ({
      ...prev,
      [locId]: { ...prev[locId], [field]: val }
    }));
  };

  const handleDayToggle = (locId: string, day: keyof LocationOpeningHours["isDayOff"]) => {
    const locHours = hours[locId];
    if (!locHours) return;
    updateLocationField(locId, "isDayOff", {
      ...locHours.isDayOff,
      [day]: !locHours.isDayOff[day]
    });
  };

  const handleBreakChange = (locId: string, breakKey: "break1" | "break2" | "break3", type: "start" | "end", value: string | null) => {
    const locHours = hours[locId];
    if (!locHours) return;
    updateLocationField(locId, breakKey, {
      ...locHours[breakKey],
      [type]: value
    });
  };

  const addBreak = (locId: string) => {
    const locHours = hours[locId];
    if (!locHours) return;
    if (!locHours.break1.start && !locHours.break1.end) {
      updateLocationField(locId, "break1", { start: "12:00", end: "13:00" });
    } else if (!locHours.break2.start && !locHours.break2.end) {
      updateLocationField(locId, "break2", { start: "15:00", end: "15:30" });
    } else if (!locHours.break3.start && !locHours.break3.end) {
      updateLocationField(locId, "break3", { start: "17:00", end: "17:15" });
    }
  };

  const removeBreak = (locId: string, breakKey: "break1" | "break2" | "break3") => {
    updateLocationField(locId, breakKey, { start: null, end: null });
  };

  const applyToAllStaff = async (confirmed: boolean) => {
    if (!pendingResults) return;
    
    setLoading(true);
    setShowApplyToAllModal(false);

    try {
      if (confirmed && staff.length > 0) {
        // Create duplicate schedules for each staff member
        const staffSchedulePromises = staff.flatMap(s => {
          return Object.entries(pendingResults).map(([locId, h]) => {
            if (s.locationId !== locId) return null; // Only apply if staff is assigned to this location
            
            const payload = {
              startDate: (h as any).startDate,
              endDate: (h as any).endDate,
              workTime: h.workTime,
              isDayOff: h.isDayOff,
              break1: h.break1,
              break2: h.break2,
              break3: h.break3,
              locationId: locId,
              staffId: s._id,
            };
            return callApi("/api/staff-schedules", "POST", payload);
          });
        }).filter(p => p !== null);

        await Promise.all(staffSchedulePromises);
      }
      onNext(pendingResults);
    } catch (error) {
      console.error("Failed to apply schedules to staff:", error);
      toast.error(t("Failed to apply schedules to staff"));
      onNext(pendingResults); // Still proceed with location schedules
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const schedulePromises = Object.entries(hours).map(async ([locId, h]) => {
        const payload = {
          startDate: (h as any).startDate || new Date().toISOString(),
          endDate: (h as any).endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString(),
          workTime: h.workTime,
          isDayOff: h.isDayOff,
          break1: h.break1,
          break2: h.break2,
          break3: h.break3,
          locationId: locId,
          staffId: null,
        };

        if (h._id) {
          return callApi(`/api/staff-schedules/${h._id}`, "PUT", payload);
        } else {
          return callApi("/api/staff-schedules", "POST", payload);
        }
      });

      const results = await Promise.all(schedulePromises);
      
      const updatedHours = { ...hours };
      results.forEach((res, idx) => {
        const locId = Object.keys(hours)[idx];
        updatedHours[locId] = {
          ...updatedHours[locId],
          _id: res._id
        };
      });

      setPendingResults(updatedHours);
      if (staff.length > 0) {
        setShowApplyToAllModal(true);
      } else {
        onNext(updatedHours);
      }
    } catch (error) {
      console.error("Failed to save hours:", error);
      toast.error(t("Failed to save working hours"));
    } finally {
      setLoading(false);
    }
  };

  if (Object.keys(hours).length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
          <Clock className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{t("Set your working hours")}</h2>
          <p className="text-muted-foreground">{t("Define when your team is available for appointments.")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {locations.map((loc, idx) => {
          const locId = (loc._id || idx).toString();
          const locHours = hours[locId];
          if (!locHours) return null;

          const activeBreaks: { key: "break1" | "break2" | "break3"; data: TimeRange }[] = [];
          if (locHours.break1.start || locHours.break1.end) activeBreaks.push({ key: "break1", data: locHours.break1 });
          if (locHours.break2.start || locHours.break2.end) activeBreaks.push({ key: "break2", data: locHours.break2 });
          if (locHours.break3.start || locHours.break3.end) activeBreaks.push({ key: "break3", data: locHours.break3 });

          return (
            <div key={locId} className="space-y-6 p-8 rounded-3xl border border-border bg-slate-50/50 dark:bg-slate-900/50 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
               
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                  <h3 className="font-bold text-xl text-primary">{t("Location")}: {loc.name}</h3>
                  <DateRangePicker
                    value={{
                      startDate: (locHours as any).startDate,
                      endDate: (locHours as any).endDate,
                    }}
                    onChange={({ startDate, endDate }) => {
                      updateLocationField(locId, "startDate", startDate);
                      updateLocationField(locId, "endDate", endDate);
                    }}
                    className="w-full sm:w-72"
                  />
               </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
                {/* Work Time & Breaks */}
                <div className="space-y-8">
                   <div className="space-y-3">
                      <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                         <Clock className="h-4 w-4" />
                         {t("Work Hours")}
                      </label>
                      <TimeRangePicker
                        value={{
                          startTime: locHours.workTime.start,
                          endTime: locHours.workTime.end,
                        }}
                        onChange={({ startTime, endTime }) =>
                          updateLocationField(locId, "workTime", { start: startTime, end: endTime })
                        }
                      />
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t("Breaks (Max 3)")}</label>
                        {activeBreaks.length < 3 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addBreak(locId)}
                            className="rounded-full h-8 px-3 text-xs"
                            iconType="add"
                          >
                            {t("Add")}
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeBreaks.map((b) => (
                          <div key={b.key} className="flex flex-row gap-2 items-center bg-white dark:bg-gray-800 p-2 rounded-2xl border border-border/50 shadow-sm">
                            <TimeRangePicker
                              value={{ startTime: b.data.start, endTime: b.data.end }}
                              onChange={({ startTime, endTime }) => {
                                handleBreakChange(locId, b.key, "start", startTime);
                                handleBreakChange(locId, b.key, "end", endTime);
                              }}
                            />
                            <CustomTooltip
                              onClick={() => removeBreak(locId, b.key)}
                              tooltipText={t("Delete Break")}
                              icon={<Trash className="h-4 w-4 text-red-500" />}
                            />
                          </div>
                        ))}
                        {activeBreaks.length === 0 && (
                          <div className="flex items-center justify-center p-4 border-2 border-dashed border-border rounded-2xl bg-white/50 dark:bg-black/20">
                             <p className="text-xs text-muted-foreground italic">{t("No breaks specified")}</p>
                          </div>
                        )}
                      </div>
                   </div>
                </div>

                {/* Days Off */}
                <div className="space-y-4">
                  <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block">{t("Weekly Schedule")}</label>
                  <div className="grid grid-cols-1 gap-2 border border-border/50 p-2 rounded-2xl bg-white dark:bg-gray-800 shadow-inner">
                    {(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const).map((day) => (
                      <button
                        key={day}
                        type="button"
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300",
                          locHours.isDayOff[day]
                            ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20"
                            : "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-500/20"
                        )}
                        onClick={() => handleDayToggle(locId, day)}
                      >
                         <div className="flex items-center gap-3">
                            <div className={cn(
                               "w-2 h-2 rounded-full",
                               locHours.isDayOff[day] ? "bg-red-500" : "bg-green-500"
                            )} />
                            <span className="font-bold capitalize">{t(day)}</span>
                         </div>
                         <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-current">
                            {locHours.isDayOff[day] ? t("Off") : t("Work")}
                         </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}  
            iconType="back"
          >
            {t("Back")}
          </Button>
          <Button
            type="submit"
            disabled={loading}
            iconType="next"
          >
            {loading ? t("Saving...") : t("Complete Setup")}
          </Button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <Modal
        label={t("Apply to all staff?")}
        open={showApplyToAllModal}
        onOpenChange={setShowApplyToAllModal}
        width="md"
      >
         <div className="p-4 text-center space-y-6">
            <div className="p-4 rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto">
               <Clock className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
               {t("Would you like to apply these working hours to all registered staff members as well? This will overwrite their individual schedules.")}
            </p>
            <div className="flex gap-3 justify-center pt-4 border-t">
               <Button variant="outline" onClick={() => applyToAllStaff(false)} disabled={loading}>
                  {t("No, just mine")}
               </Button>
               <Button onClick={() => applyToAllStaff(true)} disabled={loading}>
                  {t("Yes, apply to all")}
               </Button>
            </div>
         </div>
      </Modal>
    </div>
  );
}
