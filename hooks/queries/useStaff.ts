import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import callApi from "@/app/Api/callApi";
import { StaffMember } from "@/app/staff/types";

type CreateStaffInput =
  | Partial<StaffMember>
  | {
      staffData: Partial<StaffMember>;
      showToast?: boolean;
    };

export const useGetStaff = (businessId?: string, locationId?: string) => {
  return useQuery({
    queryKey: ["staff", businessId, locationId],
    queryFn: async (): Promise<StaffMember[]> => {
      if (!businessId) return [];
      const locationQuery = locationId ? `&locationId=${locationId}` : "";
      return await callApi(
        `/api/staff/staff-list?businessId=${businessId}${locationQuery}`,
        "GET",
      );
    },
    enabled: !!businessId,
  });
};

export const useCreateStaff = (options?: { showToast?: boolean }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateStaffInput) => {
      const staffData = "staffData" in input ? input.staffData : input;
      const showToast =
        "showToast" in input ? input.showToast : (options?.showToast ?? true);

      return await callApi(
        "/api/staff/invite",
        "POST",
        staffData,
        false,
        showToast,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
      showToast,
    }: {
      id: string;
      data: Partial<StaffMember>;
      showToast?: boolean;
    }) => {
      return await callApi(
        `/api/staff/${id}`,
        "PUT",
        data,
        false,
        showToast ?? true,
      );
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
