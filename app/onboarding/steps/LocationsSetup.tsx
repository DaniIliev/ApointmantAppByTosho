"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, MapPin, Plus, Trash2 } from "lucide-react";
import callApi from "@/app/Api/callApi";

import { Location } from "@/Global/Types/types";

interface LocationsSetupProps {
  onNext: (locations: Location[]) => void;
  onBack: () => void;
  initialData?: Location[];
}

import { ImageUpload } from "@/components/customUIComponents/ImageUpload";

export default function LocationsSetup({ onNext, onBack, initialData }: LocationsSetupProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<Location[]>(
    initialData && initialData.length > 0
      ? initialData
      : [{ name: "", address: "", city: "", phone: "", country: "България", isDefault: true, imageUrl: "" as any }]
  );

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setLocations(initialData);
    }
  }, [initialData]);

  const addLocation = () => {
    setLocations([...locations, { name: "", address: "", city: "", phone: "", country: "България", isDefault: false, imageUrl: "" as any }]);
  };

  const removeLocation = (index: number) => {
    if (locations.length > 1) {
      setLocations(locations.filter((_, i) => i !== index));
    }
  };

  const updateLocation = (index: number, field: keyof Location, value: any) => {
    const newLocations = [...locations];
    newLocations[index] = { ...newLocations[index], [field]: value };
    setLocations(newLocations);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Save each location (POST for new, PUT for existing)
      const savedLocations = await Promise.all(
        locations.map(async (loc) => {
          const isNew = !loc._id;
          
          if (!isNew) {
            const original = (initialData || []).find(o => o._id === loc._id);
            if (original) {
              const hasChanged = 
                loc.name !== original.name ||
                loc.address !== original.address ||
                loc.city !== original.city ||
                loc.phone !== original.phone ||
                loc.postalCode !== original.postalCode ||
                (loc.imageUrl instanceof File);
              
              if (!hasChanged) return loc; // Return original if no changes
            }
          }

          const method = isNew ? "POST" : "PUT";
          const endpoint = isNew ? "/api/locations" : `/api/locations/${loc._id}`;
          const useMultipart = (loc.imageUrl as any) instanceof File;
          
          return callApi(endpoint, method, loc, useMultipart);
        })
      );
      onNext(savedLocations);
    } catch (error) {
      console.error("Failed to save locations:", error);
      onNext(locations); // Fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div >
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
          <MapPin className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{t("Where are you located?")}</h2>
          <p className="text-muted-foreground">{t("You can add multiple branches or just one main location.")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          {locations.map((loc, index) => (
            <div key={index} className="p-6 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/50 relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">{t("Location")} {index + 1}</h3>
                {locations.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLocation(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <ImageUpload
                    label={t("Location Image")}
                    value={loc.imageUrl}
                    onChange={(file) => updateLocation(index, "imageUrl", file)}
                    onRemove={() => updateLocation(index, "imageUrl", "")}
                  />
                </div>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LabeledInput
                    id={`name-${index}`}
                    label={t("Internal Name")}
                    value={loc.name}
                    onChange={(e) => updateLocation(index, "name", e.target.value)}
                    placeholder={t("e.g. Downtown, Uptown")}
                    required
                  />
                  <LabeledInput
                    id={`phone-${index}`}
                    label={t("Phone")}
                    value={loc.phone || ""}
                    onChange={(e) => updateLocation(index, "phone", e.target.value)}
                    placeholder={t("Contact phone for this branch")}
                    required
                  />
                  <LabeledInput
                    id={`city-${index}`}
                    label={t("City")}
                    value={loc.city}
                    onChange={(e) => updateLocation(index, "city", e.target.value)}
                    placeholder={t("City")}
                    required
                  />
                  <LabeledInput
                    id={`postalCode-${index}`}
                    label={t("Postal Code")}
                    placeholder={t("12345")}
                    value={loc.postalCode || ""}
                    onChange={(e) => updateLocation(index, "postalCode", e.target.value)}
                  />
                  <div className="md:col-span-2">
                    <LabeledInput
                      id={`address-${index}`}
                      label={t("Full Address")}
                      value={loc.address}
                      onChange={(e) => updateLocation(index, "address", e.target.value)}
                      placeholder={t("Street, Number, etc.")}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addLocation}
          className="w-full rounded-2xl py-6 border-dashed border-2 hover:border-primary hover:text-primary transition-all flex gap-2 items-center justify-center font-bold"
        >
          <Plus className="h-5 w-5" />
          {t("Add Another Location")}
        </Button>

        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            iconType="back"
          >
            {t("Back")}
          </Button>
          <Button
            type="submit"
            disabled={loading}
            iconType="next"
          >
            {loading ? t("Saving...") : t("Next Step")}
          </Button>
        </div>
      </form>
    </div>
  );
}
