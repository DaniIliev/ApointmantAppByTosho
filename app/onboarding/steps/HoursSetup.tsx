"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Clock, Plus, Trash } from "lucide-react";
import callApi from "@/app/Api/callApi";
import { TimeRangePicker } from "@/components/customUIComponents/TimeRangePicker";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import { toast } from "sonner";

import { Location, LocationsOpeningHours, LocationOpeningHours, TimeRange } from "@/Global/Types/types";

interface HoursSetupProps {
  locations: Location[];
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

export default function HoursSetup({ locations, onNext, onBack, initialData }: HoursSetupProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [hours, setHours] = useState<LocationsOpeningHours>({});

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setHours(initialData);
    } else {
      setHours(
        locations.reduce((acc, loc, idx) => ({
          ...acc,
          [(loc._id || idx).toString()]: { ...initialLocationHours }
        }), {} as LocationsOpeningHours)
      );
    }
  }, [initialData, locations]);

  const updateLocationField = (locId: string, field: keyof LocationOpeningHours, val: any) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const schedulePromises = Object.entries(hours).map(async ([locId, h]) => {
        const payload = {
          startDate: new Date().toISOString(), // Default for onboarding
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString(), // 10 years out
          workTime: h.workTime,
          isDayOff: h.isDayOff,
          break1: h.break1,
          break2: h.break2,
          break3: h.break3,
          locationId: locId,
          staffId: null, // This is a location schedule
        };

        if (h._id) {
          // Update existing
          return callApi(`/api/staff-schedules/${h._id}`, "PUT", payload);
        } else {
          // Create new
          return callApi("/api/staff-schedules", "POST", payload);
        }
      });

      const results = await Promise.all(schedulePromises);
      
      // Update local state with new IDs from results
      const updatedHours = { ...hours };
      results.forEach((res, idx) => {
        const locId = Object.keys(hours)[idx];
        updatedHours[locId] = {
          ...updatedHours[locId],
          _id: res._id
        };
      });

      onNext(updatedHours);
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

          const breaks: { key: "break1" | "break2" | "break3"; data: TimeRange }[] = [];
          if (locHours.break1.start || locHours.break1.end) breaks.push({ key: "break1", data: locHours.break1 });
          if (locHours.break2.start || locHours.break2.end) breaks.push({ key: "break2", data: locHours.break2 });
          if (locHours.break3.start || locHours.break3.end) breaks.push({ key: "break3", data: locHours.break3 });

          return (
            <div key={locId} className="space-y-6 p-6 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-lg border-b pb-2">{t("Location")}: {loc.name}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Work Time */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("Work Time")}</label>
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

                {/* Days Off */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("Days Off")}</label>
                  <div className="flex items-center gap-0.5 border border-primary rounded-lg overflow-hidden bg-white dark:bg-background">
                    {(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const).map((day) => (
                      <button
                        key={day}
                        type="button"
                        className={[
                          "flex-1 px-2 py-2 text-xs font-semibold transition-colors focus:outline-none",
                          locHours.isDayOff[day]
                            ? "bg-primary text-white"
                            : "bg-transparent text-foreground hover:bg-primary/10",
                        ].join(" ")}
                        onClick={() => handleDayToggle(locId, day)}
                      >
                        {t(day.charAt(0).toUpperCase() + day.slice(1, 2))}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Breaks */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">{t("Breaks (Max 3)")}</label>
                  {breaks.length < 3 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addBreak(locId)}
                      className="text-primary hover:bg-primary/10 flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      {t("Add Break")}
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {breaks.map((b) => (
                    <div key={b.key} className="flex flex-row gap-2 items-center">
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
                  {breaks.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">{t("No breaks added.")}</p>
                  )}
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
            {loading ? t("Saving...") : t("Next Step")}
          </Button>
        </div>
      </form>
    </div>
  );
}
