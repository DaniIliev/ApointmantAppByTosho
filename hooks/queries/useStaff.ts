import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import callApi from "@/app/Api/callApi";
import { StaffMember } from "@/app/staff/types";

export const useGetStaff = (businessId?: string, locationId?: string) => {
  return useQuery({
    queryKey: ["staff", businessId, locationId],
    queryFn: async (): Promise<StaffMember[]> => {
      if (!businessId) return [];
      const locationQuery = locationId ? `&locationId=${locationId}` : "";
      return await callApi(`/api/staff/staff-list?businessId=${businessId}${locationQuery}`, "GET");
    },
    enabled: !!businessId,
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (staffData: Partial<StaffMember>) => {
      return await callApi("/api/staff/invite", "POST", staffData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StaffMember> }) => {
      return await callApi(`/api/staff/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await callApi(`/api/staff/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};
