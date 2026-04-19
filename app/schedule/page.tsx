"use client";

import {  useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { addWeeks, format, startOfWeek, subWeeks } from "date-fns";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { toast } from "sonner";

import { useGetStaff } from "@/hooks/queries/useStaff";
import {
  useGetLocations,
  useUpdateLocationWeeklyHours,
} from "@/hooks/queries/useLocation";
import {
  useGetStaffSchedules,
  useCreateStaffSchedule,
  useUpdateStaffSchedule,
  useDeleteStaffSchedule,
  useGetScheduleDailyView,
} from "@/hooks/queries/useScheduleNew";
import { LocationHoursModal } from "@/components/location/LocationHoursModal";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { usePageTitle } from "@/context/PageTitleContext";
import { useLocationContext } from "@/context/LocationContext";
import { useAuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { ScheduleModal } from "./ScheduleModal";
import { DesktopScheduleBoard } from "./components/DesktopScheduleBoard";
import { MobileScheduleBoard } from "./components/MobileScheduleBoard";
import { LocationHeroCard } from "./components/LocationHeroCard";
import type {
  DailyViewData,
  DayKey,
  EditableSchedule,
  LocationDto,
  Schedule,
  StaffMember,
  WeeklyWorkingHours,
} from "./types";
import {
  buildWeekDays,
  dayTitles,
  getLocationIdFromSchedule,
  getScheduleStaffId,
} from "./utils";

// ─── Constants ────────────────────────────────────────────

const weekDayRows: Array<{ key: DayKey; label: string }> = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

// ─── Page content ─────────────────────────────────────────

function SchedulePageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedLocation } = useLocationContext();
  console.log('selected Location', selectedLocation)
  const { user } = useAuthContext();
  const { setPageTitle } = usePageTitle();

  // ── Data fetching ───────────────────────────────────
  const { data: staffData, isLoading: staffLoading } = useGetStaff(
    user?.businessId,
    selectedLocation?._id,
  );
  const {
    data: schedulesData,
    isLoading: schedulesLoading,
  } = useGetStaffSchedules(selectedLocation?._id);

  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const weekDays = useMemo(() => buildWeekDays(weekStart), [weekStart]);

  const { data: dailyViewData, isLoading: dailyLoading } =
    useGetScheduleDailyView({
      locationId: selectedLocation?._id,
      startDate: format(weekDays[0], "yyyy-MM-dd"),
      endDate: format(weekDays[6], "yyyy-MM-dd"),
    });

  const { data: locationsData, isLoading: locationsLoading } = useGetLocations(
    user?.businessId,
  );

  // ── Derived data ────────────────────────────────────
  const staff = (staffData || []) as unknown as StaffMember[];
  const schedules: Schedule[] = schedulesData || [];
  const locations: LocationDto[] = locationsData || [];
  const dailyView: DailyViewData = dailyViewData || [];
  const loading =
    staffLoading || schedulesLoading || locationsLoading || dailyLoading;

  // ── Mutations ───────────────────────────────────────
  const updateLocationHoursMutation = useUpdateLocationWeeklyHours();
  const createScheduleMutation = useCreateStaffSchedule();
  const updateScheduleMutation = useUpdateStaffSchedule();
  const deleteScheduleMutation = useDeleteStaffSchedule();

  // ── Local state ─────────────────────────────────────
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editingSchedules, setEditingSchedules] = useState<EditableSchedule[]>(
    [],
  );
  const [locationWeeklyHours, setLocationWeeklyHours] =
    useState<WeeklyWorkingHours | null>(null);
  const [savingLocationHours, setSavingLocationHours] = useState(false);
  const [isLocationHoursModalOpen, setIsLocationHoursModalOpen] =
    useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const selectedLocationId = selectedLocation?._id;

  useEffect(() => {
    setPageTitle(t("Schedule"));
    return () => {
      setPageTitle(null);
    };
  }, [setPageTitle, t]);

  useEffect(() => {
    const selected = locations.find((loc) => loc._id === selectedLocationId);
    if (selected?.weeklyWorkingHours) {
      setLocationWeeklyHours(selected.weeklyWorkingHours);
    }
  }, [locations, selectedLocationId]);

  // ── Computed / memos ────────────────────────────────

  const locationScopedSchedules = useMemo(() => {
    if (!selectedLocationId) return [];
    return schedules.filter(
      (s) => getLocationIdFromSchedule(s) === selectedLocationId,
    );
  }, [schedules, selectedLocationId]);

  const visibleStaff = useMemo(() => {
    if (!selectedLocationId) return [];
    return staff;
  }, [staff, selectedLocationId]);

  const staffSchedulesMap = useMemo(() => {
    const map = new Map<string, Schedule[]>();
    for (const schedule of locationScopedSchedules) {
      const staffId = getScheduleStaffId(schedule);
      if (!staffId) continue;
      const list = map.get(staffId) || [];
      list.push(schedule);
      map.set(staffId, list);
    }
    return map;
  }, [locationScopedSchedules]);

  const locationNameMap = useMemo(() => {
    const map = new Map<string, string>();
    locations.forEach((loc) => map.set(loc._id, loc.name));
    return map;
  }, [locations]);

  const selectedLocationData = useMemo(() => {
    if (!selectedLocationId) return null;
    return locations.find((loc) => loc._id === selectedLocationId) || null;
  }, [locations, selectedLocationId]);

  // ── Action handlers ─────────────────────────────────

  const createScheduleForStaff = (staffMember: StaffMember) => {
    const staffLocationId = selectedLocationId || staffMember.locationIds?.[0];
    if (!staffLocationId) {
      toast.error(t("No location is assigned to this staff member."));
      return;
    }
    setEditingStaff(staffMember);
    setEditingSchedules([]);
    setIsEditModalOpen(true);
  };

  const openStaffCalendar = (
    scheduleId: string | null,
    staffId?: string | null,
  ) => {
    if (staffId) {
      const params = new URLSearchParams();
      if (selectedLocationId) params.set("locationId", selectedLocationId);
      const query = params.toString();
      router.push(`/schedule/staff-${staffId}${query ? `?${query}` : ""}`);
      return;
    }
    if (!scheduleId) {
      toast.error(t("No schedule found for this staff member."));
      return;
    }
    router.push(`/schedule/${scheduleId}`);
  };

  const openStaffScheduleEdit = (staffMember: StaffMember) => {
    const staffMemberSchedules = staffSchedulesMap.get(staffMember._id) || [];
    if (!staffMemberSchedules.length) {
      toast.error(t("No schedule found for this staff member."));
      return;
    }

    // Enrich with daily view data if available
    const dailyGroup = dailyView.find(
      (g) =>
        (typeof g.staff === "string" ? g.staff : g.staff._id) === staffMember._id,
    );
    const enriched = staffMemberSchedules.map((sch) => {
      const match = dailyGroup?.schedules.find((s) => s._id === sch._id);
      return {
        ...sch,
        dayleschedules: match?.dayleschedules || [],
      } as EditableSchedule;
    });

    setEditingStaff(staffMember);
    setEditingSchedules(enriched);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedSchedules = async (
    scheduleData: EditableSchedule[],
  ) => {
    if (!editingStaff) {
      toast.error(t("Staff member is missing."));
      return;
    }

    const existing = staffSchedulesMap.get(editingStaff._id) || [];
    const existingById = new Map(existing.map((item) => [item._id, item]));
    const incomingIds = new Set(
      scheduleData.filter((item) => item._id).map((item) => item._id),
    );

    const schedulesToDelete = existing.filter(
      (item) => !incomingIds.has(item._id),
    );
    const schedulesToUpdate = scheduleData.filter((item) => item._id);
    const schedulesToCreate = scheduleData.filter((item) => !item._id);

    try {
      // Delete removed schedules
      await Promise.all(
        schedulesToDelete.map((s) =>
          deleteScheduleMutation.mutateAsync(s._id),
        ),
      );

      // Update existing schedules
      await Promise.all(
        schedulesToUpdate.map((schedule) => {
          const existingSchedule = existingById.get(schedule._id);
          const locationId =
            schedule.locationId ||
            getLocationIdFromSchedule(schedule as unknown as Schedule) ||
            getLocationIdFromSchedule(existingSchedule as Schedule) ||
            selectedLocationId ||
            editingStaff.locationIds?.[0] ||
            "";

          if (!locationId) throw new Error("Missing locationId");

          return updateScheduleMutation.mutateAsync({
            id: schedule._id,
            data: {
              startDate: schedule.startDate,
              endDate: schedule.endDate,
              weeklyWorkingHours: schedule.weeklyWorkingHours,
              breaks: schedule.breaks,
              locationId,
            },
          });
        }),
      );

      // Create new schedules
      await Promise.all(
        schedulesToCreate.map((schedule) => {
          const locationId =
            schedule.locationId ||
            getLocationIdFromSchedule(schedule as unknown as Schedule) ||
            selectedLocationId ||
            editingStaff.locationIds?.[0] ||
            "";

          if (!locationId) throw new Error("Missing locationId");

          return createScheduleMutation.mutateAsync({
            startDate: schedule.startDate,
            endDate: schedule.endDate,
            weeklyWorkingHours: schedule.weeklyWorkingHours,
            breaks: schedule.breaks,
            locationId,
            staffId: editingStaff._id,
          });
        }),
      );

      toast.success(t("Schedules saved successfully."));
      setIsEditModalOpen(false);
      setEditingStaff(null);
      setEditingSchedules([]);
      // await loadData();
    } catch (error: any) {
      toast.error(error?.message || t("Failed to save schedules."));
      throw error;
    }
  };

  const openLocationHoursEditor = () => {
    if (!selectedLocationId) {
      toast.error(t("Please select a location first."));
      return;
    }
    setIsLocationHoursModalOpen(true);
  };

  const handleSaveLocationWeeklyHours = async (
    nextWeeklyHours?: WeeklyWorkingHours,
  ) => {
    if (!selectedLocationId) {
      toast.error(t("Please select a location first."));
      return;
    }
    try {
      setSavingLocationHours(true);
      const payloadHours = nextWeeklyHours || locationWeeklyHours;
      await updateLocationHoursMutation.mutateAsync({
        locationId: selectedLocationId,
        weeklyWorkingHours: payloadHours,
      });
      setLocationWeeklyHours(payloadHours!);
      setIsLocationHoursModalOpen(false);
      toast.success(t("Location weekly working hours updated."));
    } catch (error) {
      toast.error(t("Failed to update location weekly working hours."));
      throw error;
    } finally {
      setSavingLocationHours(false);
    }
  };


  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-[460px] w-full" />
      </div>
    );
  }


  return (
    <div>
      {/* Location Hero Card */}
      {selectedLocationId && selectedLocationData && (
        <div className="mb-6">
          <LocationHeroCard 
            location={selectedLocationData} 
            onEditHours={openLocationHoursEditor} 
          />
          
          {/* Warning for missing hours */}
          {(!selectedLocationData?.weeklyWorkingHours ||
            Object.values(selectedLocationData.weeklyWorkingHours).every(
              (day) => !day.workTime.start && !day.workTime.end,
            )) && (
            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
              <p className="text-sm font-bold flex items-center gap-2">
                <Info className="h-4 w-4" />
                {t("няма въведен график и трябва да се създаде")}
              </p>
            </div>
          )}
        </div>
      )}

      {!selectedLocationId && (
        <div className="rounded-2xl border bg-white/80 p-6 shadow-sm backdrop-blur dark:bg-background/80 text-center">
            <h2 className="text-xl font-black text-muted-foreground uppercase tracking-widest">
                {t("Всички локации")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
                {t("Изберете локация за да видите детайлен график")}
            </p>
        </div>
      )}

      {/* Week view */}
      <div className="rounded-2xl border bg-white shadow-sm dark:bg-background">
        <div className="p-4 border-b flex items-center justify-center gap-3 flex-wrap dark:border-gray-800 bg-white/50 dark:bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setWeekStart((prev) => subWeeks(prev, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 font-semibold">
              <CalendarDays className="h-4 w-4" />
              <span>
                {format(weekDays[0], "dd.MM.yyyy")} -{" "}
                {format(weekDays[6], "dd.MM.yyyy")}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setWeekStart((prev) => addWeeks(prev, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

          </div>
        </div>

        <DesktopScheduleBoard
          weekDays={weekDays}
          dayTitles={dayTitles}
          selectedLocationId={selectedLocationId}
          locationNameMap={locationNameMap}
          visibleStaff={visibleStaff}
          staffSchedulesMap={staffSchedulesMap}
          dailyViewData={dailyView}
          onOpenStaffScheduleEdit={openStaffScheduleEdit}
          onOpenStaffCalendar={openStaffCalendar}
          onCreateScheduleForStaff={createScheduleForStaff}
          t={t}
        />

        <MobileScheduleBoard
          weekDays={weekDays}
          dayTitles={dayTitles}
          selectedLocationId={selectedLocationId}
          locationNameMap={locationNameMap}
          visibleStaff={visibleStaff}
          staffSchedulesMap={staffSchedulesMap}
          dailyViewData={dailyView}
          onOpenStaffScheduleEdit={openStaffScheduleEdit}
          onOpenStaffCalendar={openStaffCalendar}
          onCreateScheduleForStaff={createScheduleForStaff}
          t={t}
        />
      </div>

      {/* Schedule modal */}
      <ScheduleModal
        isOpen={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) {
            setEditingStaff(null);
            setEditingSchedules([]);
          }
        }}
        onSave={handleSaveEditedSchedules}
        schedules={editingSchedules}
        defaultLocationId={selectedLocationId}
        locations={locations}
      />

      {/* Location hours modal */}
      {selectedLocationId && selectedLocationData ? (
        <LocationHoursModal
          isOpen={isLocationHoursModalOpen}
          onOpenChange={setIsLocationHoursModalOpen}
          locationName={selectedLocationData.name}
          initialHours={locationWeeklyHours as any}
          isEditMode={!!selectedLocationData.weeklyWorkingHours}
          isSaving={savingLocationHours}
          onSave={handleSaveLocationWeeklyHours}
        />
      ) : null}
    </div>
  );
}

// ─── Exported page ────────────────────────────────────────

export default function ScheduleNewPage() {
  return (
    <ProtectedRoute requiredRoles={["business", "staff", "manager"]}>
      <SchedulePageContent />
    </ProtectedRoute>
  );
}
