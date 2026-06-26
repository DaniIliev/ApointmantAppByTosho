import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import callApi from "@/app/Api/callApi";

import type {
  Schedule,
  DailyViewData,
  WorkHourEntry,
  CreateSchedulePayload,
  UpdateSchedulePayload,
  UpdateDailySchedulePayload,
} from "@/app/schedule/types";

// ─── Query keys ───────────────────────────────────────────

const KEYS = {
  schedules: "sn-schedules",
  dailyView: "sn-daily-view",
  scheduleDetails: "sn-schedule-details",
  staffDetails: "sn-staff-details",
} as const;

// ─── GET: all schedules for a location ────────────────────

export const useGetStaffSchedules = (locationId?: string) => {
  return useQuery<Schedule[]>({
    queryKey: [KEYS.schedules, locationId],
    queryFn: async (): Promise<Schedule[]> => {
      const query = locationId
        ? `?locationId=${locationId}`
        : "?locationId=all";
      return await callApi(`/api/staff-schedules${query}`, "GET");
    },
  });
};

// ─── GET: daily view (week grid data) ─────────────────────

interface DailyViewParams {
  locationId?: string;
  startDate: string;
  endDate: string;
}

export const useGetScheduleDailyView = (params: DailyViewParams) => {
  return useQuery<DailyViewData>({
    queryKey: [
      KEYS.dailyView,
      params.locationId,
      params.startDate,
      params.endDate,
    ],
    queryFn: async (): Promise<DailyViewData> => {
      if (!params.locationId) return [];
      const query = `?locationId=${params.locationId}&startDate=${params.startDate}&endDate=${params.endDate}`;
      return await callApi(`/api/staff-schedules/daily-view${query}`, "GET");
    },
    enabled: !!params.locationId && !!params.startDate && !!params.endDate,
  });
};

// ─── GET: schedule details (single schedule daily data) ───

export const useGetScheduleDetails = (scheduleId?: string) => {
  return useQuery<WorkHourEntry[]>({
    queryKey: [KEYS.scheduleDetails, scheduleId],
    queryFn: async (): Promise<WorkHourEntry[]> => {
      if (!scheduleId) return [];
      return await callApi(
        `/api/staff-schedules/${scheduleId}/details`,
        "GET",
      );
    },
    enabled: !!scheduleId,
  });
};

// ─── GET: merged daily data by staff ──────────────────────

export const useGetScheduleDetailsByStaff = (
  staffId?: string,
  locationId?: string,
) => {
  return useQuery<WorkHourEntry[]>({
    queryKey: [KEYS.staffDetails, staffId, locationId],
    queryFn: async (): Promise<WorkHourEntry[]> => {
      if (!staffId) return [];
      const params = new URLSearchParams();
      if (locationId) params.set("locationId", locationId);
      const qs = params.toString();
      return await callApi(
        `/api/staff-schedules/details/by-staff/${staffId}${qs ? `?${qs}` : ""}`,
        "GET",
      );
    },
    enabled: !!staffId,
  });
};

// ─── POST: create schedule ────────────────────────────────

export const useCreateStaffSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation<Schedule, Error, CreateSchedulePayload>({
    mutationFn: async (data) => {
      console.log('data', data)
      return await callApi("/api/staff-schedules", "POST", data);

    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEYS.schedules] });
      queryClient.invalidateQueries({ queryKey: [KEYS.dailyView] });
    },
  });
};

// ─── PUT: update schedule ─────────────────────────────────

interface UpdateScheduleMutationVars {
  id: string;
  data: UpdateSchedulePayload;
}

export const useUpdateStaffSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation<Schedule, Error, UpdateScheduleMutationVars>({
    mutationFn: async ({ id, data }) => {
      return await callApi(`/api/staff-schedules/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEYS.schedules] });
      queryClient.invalidateQueries({ queryKey: [KEYS.dailyView] });
    },
  });
};

// ─── PUT: update daily schedule (single day) ──────────────

interface UpdateDailyMutationVars {
  scheduleId: string;
  data: UpdateDailySchedulePayload;
}

export const useUpdateDailySchedule = () => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, UpdateDailyMutationVars>({
    mutationFn: async ({ scheduleId, data }) => {
      return await callApi(
        `/api/staff-schedules/${scheduleId}/details`,
        "PUT",
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEYS.scheduleDetails] });
      queryClient.invalidateQueries({ queryKey: [KEYS.staffDetails] });
      queryClient.invalidateQueries({ queryKey: [KEYS.dailyView] });
    },
  });
};

// ─── DELETE: delete schedule ──────────────────────────────

export const useDeleteStaffSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (id) => {
      return await callApi(`/api/staff-schedules/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEYS.schedules] });
      queryClient.invalidateQueries({ queryKey: [KEYS.dailyView] });
    },
  });
};

// ─── POST: apply schedule to all staff ────────────────────

export const useApplyScheduleToAll = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (scheduleId) => {
      return await callApi("/api/staff-schedules/apply-to-all", "POST", {
        scheduleId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEYS.schedules] });
      queryClient.invalidateQueries({ queryKey: [KEYS.dailyView] });
    },
  });
};

// ─── GET: affected appointments ───────────────────────────

export const useGetAffectedAppointments = (staffId?: string, scheduleId?: string, date?: string) => {
  return useQuery<any[]>({
    queryKey: ["sn-affected-appointments", staffId, scheduleId, date],
    queryFn: async (): Promise<any[]> => {
      if ((!staffId && !scheduleId) || !date) return [];
      return await callApi(
        `/api/staff-schedules/appointments/affected?staffId=${staffId || ""}&scheduleId=${scheduleId || ""}&date=${date}`,
        "GET"
      );
    },
    enabled: (!!staffId || !!scheduleId) && !!date,
  });
};

// ─── POST: notify day off ─────────────────────────────────

export const useNotifyDayOff = () => {
  return useMutation<{ message: string }, Error, { appointmentIds: string[], customMessage?: string }>({
    mutationFn: async ({ appointmentIds, customMessage }) => {
      return await callApi("/api/staff-schedules/appointments/notify-day-off", "POST", {
        appointmentIds,
        customMessage,
      });
    },
  });
};
