import { useEffect, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import callApi from "@/app/Api/callApi";

export type StaffMember = {
  _id: string;
  firstName: string;
  lastName: string;
};

export function useStaffOptions() {
  const { user } = useAuthContext();
  const [staffOptions, setStaffOptions] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      if (!user?.businessId) return;
      try {
        setLoadingStaff(true);
        const staffList = await callApi(
          `/api/staff/staff-list?businessId=${user.businessId}`,
          "GET"
        );
        if (Array.isArray(staffList)) {
          setStaffOptions(staffList as StaffMember[]);
        }
      } catch (error) {
        console.error("Failed to load staff list", error);
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchStaff();
  }, [user?.businessId]);

  return { staffOptions, loadingStaff };
}
