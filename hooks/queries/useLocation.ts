import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import callApi from "@/app/Api/callApi";
import { LocationDto } from "@/app/schedule/types"; // adjust type import if needed

export const useGetLocations = (businessId?: string) => {
  return useQuery({
    queryKey: ["locations", businessId],
    queryFn: async (): Promise<LocationDto[]> => {
      if (!businessId) return [];
      return await callApi(`/api/locations?businessId=${businessId}`, "GET");
    },
    enabled: !!businessId,
  });
};

export const useUpdateLocationWeeklyHours = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ locationId, weeklyWorkingHours }: { locationId: string; weeklyWorkingHours: any }) => {
      return await callApi(`/api/locations/${locationId}/weekly-hours`, "PUT", { weeklyWorkingHours });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
};
