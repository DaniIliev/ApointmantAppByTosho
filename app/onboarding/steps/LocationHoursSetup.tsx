"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import callApi from "@/app/Api/callApi";
import { LocationHoursModal } from "@/components/location/LocationHoursModal";
import { LocationHeroCard } from "@/app/schedule/components/LocationHeroCard";
import { Button } from "@/components/ui/button";
import {
  Location,
  LocationOpeningHours,
  LocationsOpeningHours,
  Staff,
  TimeRange,
} from "@/Global/Types/types";

const dayKeys = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

type DayKey = (typeof dayKeys)[number];

interface LocationHoursSetupProps {
  locations: Location[];
  staff: Staff[];
  onNext: (hours: LocationsOpeningHours) => void;
  onBack: () => void;
  initialData?: LocationsOpeningHours;
}

const createDefaultDay = (isDayOff: boolean): TimeRange =>
  isDayOff ? { start: null, end: null } : { start: null, end: null };

const createDefaultLocationHours = (): LocationOpeningHours => ({
  monday: { isDayOff: false, workTime: createDefaultDay(false) },
  tuesday: { isDayOff: false, workTime: createDefaultDay(false) },
  wednesday: { isDayOff: false, workTime: createDefaultDay(false) },
  thursday: { isDayOff: false, workTime: createDefaultDay(false) },
  friday: { isDayOff: false, workTime: createDefaultDay(false) },
  saturday: { isDayOff: true, workTime: createDefaultDay(true) },
  sunday: { isDayOff: true, workTime: createDefaultDay(true) },
});

const cloneLocationHours = (value: LocationOpeningHours) =>
  JSON.parse(JSON.stringify(value)) as LocationOpeningHours;

const toWeeklyWorkingHoursPayload = (value: LocationOpeningHours) =>
  dayKeys.reduce(
    (acc, dayKey) => {
      const dayValue = value[dayKey];

      acc[dayKey] = {
        isDayOff: dayValue.isDayOff,
        workTime: dayValue.isDayOff
          ? { start: null, end: null }
          : {
              start: dayValue.workTime.start || null,
              end: dayValue.workTime.end || null,
            },
      };

      return acc;
    },
    {} as Record<
      DayKey,
      {
        isDayOff: boolean;
        workTime: { start: string | null; end: string | null };
      }
    >,
  );

const summarizeLocationHours = (value: LocationOpeningHours) =>
  dayKeys.map((dayKey) => {
    const dayValue = value[dayKey];

    return {
      dayKey,
      timeLabel: dayValue.isDayOff
        ? "Off"
        : `${dayValue.workTime.start || "--:--"} - ${dayValue.workTime.end || "--:--"}`,
      isDayOff: dayValue.isDayOff,
    };
  });

export default function LocationHoursSetup({
  locations,
  staff: _staff,
  onNext,
  onBack,
  initialData,
}: LocationHoursSetupProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [hours, setHours] = useState<LocationsOpeningHours>({});
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);

  useEffect(() => {
    if (!locations.length) return;

    setHours((current) => {
      const next = { ...current };

      locations.forEach((location, index) => {
        const locationId = String(location._id || index);
        const initialHours =
          initialData?.[locationId] ??
          next[locationId] ??
          createDefaultLocationHours();

        next[locationId] = cloneLocationHours(initialHours);
      });

      return next;
    });
  }, [initialData, locations]);

  const openEditor = (locationId: string) => {
    setEditingLocationId(locationId);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingLocationId(null);
  };

  const handleSaveHours = (newHours: any) => {
    if (!editingLocationId) return;

    setHours((prev) => ({
      ...prev,
      [editingLocationId]: cloneLocationHours(newHours),
    }));

    closeEditor();
  };

  const selectedLocation =
    locations.find(
      (location, index) => String(location._id || index) === editingLocationId,
    ) || null;

  const selectedLocationHasSavedConfig = editingLocationId
    ? Boolean(initialData?.[editingLocationId])
    : false;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      await Promise.all(
        locations.map(async (location, index) => {
          const locationId = String(location._id || index);
          const locationHours = hours[locationId];
          if (!location._id || !locationHours) return;

          await callApi(`/api/locations/${location._id}/weekly-hours`, "PUT", {
            weeklyWorkingHours: toWeeklyWorkingHoursPayload(locationHours),
          });
        }),
      );

      onNext(hours);
    } catch (error) {
      toast.error(t("Failed to save location working hours"));
    } finally {
      setLoading(false);
    }
  };

  if (locations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <Clock className="h-12 w-12 animate-pulse text-muted-foreground" />
        <h3 className="text-xl font-bold">{t("No locations found")}</h3>
        <p className="text-muted-foreground">
          {t("Please go back and add at least one location first.")}
        </p>
        <Button onClick={onBack} variant="outline" iconType="back">
          {t("Back to Locations")}
        </Button>
      </div>
    );
  }

  if (Object.keys(hours).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-12 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">
          {t("Initializing location hours...")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Clock className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{t("Location Hours Setup")}</h2>
          <p className="text-muted-foreground">
            {t(
              "Review the configured hours for each location and edit them in a modal.",
            )}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {locations.map((location, index) => {
          const locationId = String(location._id || index);
          const value = hours[locationId];
          if (!value) return null;

          const locationWithHours = {
            ...location,
            weeklyWorkingHours: value,
          };

          return (
            <LocationHeroCard
              key={locationId}
              location={locationWithHours}
              onEditHours={() => openEditor(locationId)}
            />
          );
        })}

        <div className="flex justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            iconType="back"
          >
            {t("Back")}
          </Button>
          <Button type="submit" disabled={loading} iconType="save">
            {loading ? t("Saving...") : t("Save")}
          </Button>
        </div>
      </form>

      {selectedLocation && (
        <LocationHoursModal
          isOpen={isEditorOpen}
          onOpenChange={(open) => {
            if (!open) closeEditor();
            else setIsEditorOpen(true);
          }}
          locationName={selectedLocation.name}
          initialHours={(hours[editingLocationId!] ?? createDefaultLocationHours()) as any}
          isEditMode={selectedLocationHasSavedConfig}
          onSave={handleSaveHours}
        />
      )}
    </div>
  );
}
