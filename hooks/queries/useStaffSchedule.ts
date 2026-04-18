// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import callApi from "@/app/Api/callApi";
// import { Schedule, DailyViewData } from "@/app/schedule/types";

// export const useGetStaffSchedules = (locationId?: string) => {
//   return useQuery({
//     queryKey: ["staff-schedules", locationId],
//     queryFn: async (): Promise<Schedule[]> => {
//       const scheduleQuery = locationId ? `?locationId=${locationId}` : "?locationId=all";
//       return await callApi(`/api/staff-schedules${scheduleQuery}`, "GET");
//     },
//   });
// };

// export const useGetScheduleDailyView = (params: { locationId?: string; startDate: string; endDate: string }) => {
//   return useQuery({
//     queryKey: ["staff-schedules-daily", params.locationId, params.startDate, params.endDate],
//     queryFn: async (): Promise<DailyViewData> => {
//       if (!params.locationId) return [];
//       const query = `?locationId=${params.locationId}&startDate=${params.startDate}&endDate=${params.endDate}`;
//       return await callApi(`/api/staff-schedules/daily-view${query}`, "GET");
//     },
//     enabled: !!params.locationId && !!params.startDate && !!params.endDate,
//   });
// };

// export const useCreateStaffSchedule = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (data: any) => {
//       return await callApi("/api/staff-schedules", "POST", data);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["staff-schedules"] });
//     },
//   });
// };

// export const useUpdateStaffSchedule = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async ({ id, data }: { id: string; data: any }) => {
//       return await callApi(`/api/staff-schedules/${id}`, "PUT", data);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["staff-schedules"] });
//     },
//   });
// };

// export const useDeleteStaffSchedule = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (id: string) => {
//       return await callApi(`/api/staff-schedules/${id}`, "DELETE");
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["staff-schedules"] });
//     },
//   });
// };
