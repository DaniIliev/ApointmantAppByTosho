import { useEffect, useState } from "react";
import callApi from "@/app/Api/callApi";

export type Location = {
  _id: string;
  name: string;
};

export function useLocationOptions() {
  const [locationOptions, setLocationOptions] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoadingLocations(true);
        const locations = await callApi("/api/locations", "GET");
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
  }, []);

  return { locationOptions, loadingLocations };
}
