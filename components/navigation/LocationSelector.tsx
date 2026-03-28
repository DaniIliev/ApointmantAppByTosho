"use client";

import { useLocationContext } from "@/context/LocationContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

export const LocationSelector = ({ isOpen }: { isOpen: boolean }) => {
  const { t } = useTranslation();
  const { locations, selectedLocation, setSelectedLocation } = useLocationContext();

  if (locations.length <= 1) {
    if (locations.length === 1 && isOpen) {
        return (
            <div className="px-4 mb-4">
                <div className="flex items-center gap-2 px-3 py-3 rounded-xl bg-primary/5 border border-primary/10 text-text-primary">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="font-medium truncate text-sm">
                        {locations[0].name}
                    </span>
                </div>
            </div>
        );
    }
    return null;
  }

  return (
    <div className={`px-4 mb-4 transition-all duration-300 ${!isOpen ? "px-2" : "px-4"}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-between gap-2 bg-primary/5 border-primary/10 hover:bg-primary/10 text-text-primary h-auto py-3 rounded-xl ${!isOpen ? "px-2 justify-center" : "px-3"}`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              {isOpen && (
                <span className="font-medium truncate text-sm">
                  {selectedLocation?.name || t("Select Location")}
                </span>
              )}
            </div>
            {isOpen && <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          {locations.map((loc) => (
            <DropdownMenuItem
              key={loc._id}
              onClick={() => setSelectedLocation(loc)}
              className={`cursor-pointer ${selectedLocation?._id === loc._id ? "bg-primary/10 font-bold" : ""}`}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{loc.name}</span>
                <span className="text-[10px] text-muted-foreground truncate">{loc.address}, {loc.city}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
