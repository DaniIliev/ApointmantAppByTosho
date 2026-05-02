import { useEffect, useState } from "react";
import callApi from "@/app/Api/callApi";
import { useAuthContext } from "@/context/AuthContext";

export type Location = {
  _id: string;
  name: string;
};

export function useLocationOptions() {
  const { user } = useAuthContext();
  const [locationOptions, setLocationOptions] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        if (!user?.businessId) {
          setLocationOptions([]);
          return;
        }

        setLoadingLocations(true);
        // Filter locations by current business ID
        const locations = await callApi(
          `/api/locations?businessId=${user.businessId}`,
          "GET",
        );
        if (Array.isArray(locations)) {
          setLocationOptions(locations as Location[]);
        }
      } catch (error) {
        console.error("Failed to load locations", error);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [user?.businessId]);

  return { locationOptions, loadingLocations };
}
