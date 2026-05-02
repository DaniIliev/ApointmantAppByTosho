import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import callApi from "@/app/Api/callApi";
import { LocationDto } from "@/app/schedule/types"; // adjust type import if needed
import { Location } from "@/Global/Types/types";

type LocationSaveInput = {
  location: Partial<Location>;
  showToast?: boolean;
};

type UpdateLocationWeeklyHoursInput = {
  locationId: string;
  weeklyWorkingHours: any;
  showToast?: boolean;
};

type DeleteLocationInput = {
  locationId: string;
  showToast?: boolean;
};

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

export const useCreateLocation = (options?: { showToast?: boolean }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ location, showToast }: LocationSaveInput) => {
      const shouldShowToast = showToast ?? options?.showToast ?? true;
      const useMultipart = location.imageUrl instanceof File;

      return await callApi(
        "/api/locations",
        "POST",
        location,
        useMultipart,
        shouldShowToast,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
};

export const useUpdateLocation = (options?: { showToast?: boolean }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      locationId,
      location,
      showToast,
    }: {
      locationId: string;
      location: Partial<Location>;
      showToast?: boolean;
    }) => {
      const shouldShowToast = showToast ?? options?.showToast ?? true;
      const useMultipart = location.imageUrl instanceof File;

      return await callApi(
        `/api/locations/${locationId}`,
        "PUT",
        location,
        useMultipart,
        shouldShowToast,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
};

export const useUpdateLocationWeeklyHours = (options?: {
  showToast?: boolean;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      locationId,
      weeklyWorkingHours,
      showToast,
    }: UpdateLocationWeeklyHoursInput) => {
      const shouldShowToast = showToast ?? options?.showToast ?? true;
      return await callApi(
        `/api/locations/${locationId}/weekly-hours`,
        "PUT",
        { weeklyWorkingHours },
        false,
        shouldShowToast,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
};

export const useDeleteLocation = (options?: { showToast?: boolean }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ locationId, showToast }: DeleteLocationInput) => {
      const shouldShowToast = showToast ?? options?.showToast ?? true;
      return await callApi(
        `/api/locations/${locationId}`,
        "DELETE",
        undefined,
        false,
        shouldShowToast,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
};
