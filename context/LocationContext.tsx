"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Location } from "./AuthContextTypes";
import { useAuthContext } from "./AuthContext";

type LocationContextType = {
  locations: Location[];
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location | null) => void;
  isLoading: boolean;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthContext();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && user.locations) {
      setLocations(user.locations);
      
      // Try to restore from localStorage
      const storedLocationId = localStorage.getItem("selectedLocationId");
      if (storedLocationId) {
        const found = user.locations.find((l) => l._id === storedLocationId);
        if (found) {
          setSelectedLocation(found);
        } else if (user.locations.length > 0) {
          setSelectedLocation(user.locations[0]);
        }
      } else if (user.locations.length > 0) {
        setSelectedLocation(user.locations[0]);
      }
    } else {
      setLocations([]);
      setSelectedLocation(null);
    }
    setIsLoading(false);
  }, [user]);

  const handleSetSelectedLocation = (location: Location | null) => {
    setSelectedLocation(location);
    if (location) {
      localStorage.setItem("selectedLocationId", location._id);
    } else {
      localStorage.removeItem("selectedLocationId");
    }
  };

  return (
    <LocationContext.Provider
      value={{
        locations,
        selectedLocation,
        setSelectedLocation: handleSetSelectedLocation,
        isLoading,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocationContext must be used within a LocationProvider");
  }
  return context;
};
