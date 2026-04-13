"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import callApi from "@/app/Api/callApi";
import { useDashboardDate } from "@/context/DashboardDateContext";

interface Location {
  _id: string;
  name: string;
}

export function LocationSelector() {
  const { t } = useTranslation();
  const { locationId, setLocationId } = useDashboardDate();
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await callApi("/api/locations", "GET");
        setLocations(data || []);
      } catch (err) {
        console.error("Failed to fetch locations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const selectedLocation = locations.find((loc) => loc._id === locationId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 h-9"
          disabled={loading}
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin className="h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate">
              {selectedLocation ? selectedLocation.name : t("All Locations")}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 shadow-xl border-slate-200 dark:border-slate-800" align="start">
        <Command className="dark:bg-slate-950">
          <CommandInput placeholder={t("Search location...")} className="h-9" />
          <CommandList>
            <CommandEmpty>{t("No location found.")}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all-locations"
                onSelect={() => {
                  setLocationId(null);
                  setOpen(false);
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    locationId === null ? "opacity-100" : "opacity-0"
                  )}
                />
                {t("All Locations")}
              </CommandItem>
              {locations.map((loc) => (
                <CommandItem
                  key={loc._id}
                  value={loc.name}
                  onSelect={() => {
                    setLocationId(loc._id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      locationId === loc._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {loc.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
