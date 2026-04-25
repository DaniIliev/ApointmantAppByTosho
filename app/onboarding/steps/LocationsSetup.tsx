"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, MapPin, Plus, Trash2 } from "lucide-react";
import callApi from "@/app/Api/callApi";
import { toast } from "sonner";
import { Location } from "@/Global/Types/types";
import { useMutation } from "@tanstack/react-query";

interface LocationsSetupProps {
  onNext: (locations: Location[]) => void;
  onBack: () => void;
  initialData?: Location[];
}

import { ImageUpload } from "@/components/customUIComponents/ImageUpload";

export default function LocationsSetup({
  onNext,
  onBack,
  initialData,
}: LocationsSetupProps) {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  type LocationField =
    | "name"
    | "address"
    | "addressLine2"
    | "postalCode"
    | "city"
    | "country"
    | "phone"
    | "email"
    | "website";

  type LocationValidationErrors = Partial<Record<LocationField, string>>;

  const [validationErrors, setValidationErrors] = useState<
    Record<number, LocationValidationErrors>
  >({});

  const phoneRegex = /^\+?[0-9\s()\-]{6,20}$/;
  const [locations, setLocations] = useState<Location[]>(
    initialData && initialData.length > 0
      ? initialData
      : [
          {
            name: "",
            address: "",
            city: "",
            phone: "",
            country: "България",
            isDefault: true,
            imageUrl: "" as any,
          },
        ],
  );

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setLocations(initialData);
    }
  }, [initialData]);

  const validateLocation = (location: Location): LocationValidationErrors => {
    const errors: LocationValidationErrors = {};

    if (!location.name?.trim()) {
      errors.name = t("Location name is required");
    }

    if (!location.address?.trim()) {
      errors.address = t("Address is required");
    }

    if (!location.city?.trim()) {
      errors.city = t("City is required");
    }
    return errors;
  };

  const validateAllLocations = (allLocations: Location[]) => {
    const errorsByIndex: Record<number, LocationValidationErrors> = {};

    allLocations.forEach((location, index) => {
      const locationErrors = validateLocation(location);
      if (Object.keys(locationErrors).length > 0) {
        errorsByIndex[index] = locationErrors;
      }
    });

    return errorsByIndex;
  };

  const addLocation = () => {
    setLocations([
      ...locations,
      {
        name: "",
        address: "",
        addressLine2: "",
        postalCode: "",
        city: "",
        phone: "",
        email: "",
        website: "",
        country: "България",
        isDefault: false,
        imageUrl: "" as any,
      },
    ]);
  };

  const removeLocation = (index: number) => {
    if (locations.length > 1) {
      setLocations(locations.filter((_, i) => i !== index));
      setValidationErrors({});
    }
  };

  const updateLocation = (index: number, field: keyof Location, value: any) => {
    const newLocations = [...locations];
    newLocations[index] = { ...newLocations[index], [field]: value };
    setLocations(newLocations);
    if (submitted) {
      setValidationErrors((prev) => ({
        ...prev,
        [index]: validateLocation(newLocations[index]),
      }));
    }
  };

  const mutation = useMutation({
    mutationFn: async (locationsToSave: Location[]) => {
      return await Promise.all(
        locationsToSave.map(async (loc) => {
          const isNew = !loc._id;

          if (!isNew) {
            const original = (initialData || []).find((o) => o._id === loc._id);
            if (original) {
              const hasChanged =
                loc.name !== original.name ||
                loc.address !== original.address ||
                loc.addressLine2 !== original.addressLine2 ||
                loc.city !== original.city ||
                loc.phone !== original.phone ||
                loc.email !== original.email ||
                loc.website !== original.website ||
                loc.country !== original.country ||
                loc.isDefault !== original.isDefault ||
                loc.postalCode !== original.postalCode ||
                loc.imageUrl instanceof File;

              if (!hasChanged) return loc; // Return original if no changes
            }
          }

          const method = isNew ? "POST" : "PUT";
          const endpoint = isNew
            ? "/api/locations"
            : `/api/locations/${loc._id}`;
          const useMultipart = (loc.imageUrl as any) instanceof File;

          return callApi(endpoint, method, loc, useMultipart);
        }),
      );
    },
    onSuccess: (savedLocations) => {
      onNext(savedLocations);
    },
    onError: (error) => {
      console.error("Failed to save locations:", error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const errors = validateAllLocations(locations);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error(t("Please fix location form errors"));
      return;
    }

    mutation.mutate(locations);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
          <MapPin className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{t("Where are you located?")}</h2>
          <p className="text-muted-foreground">
            {t("You can add multiple branches or just one main location.")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          {locations.map((loc, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/50 relative"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">
                  {t("Location")} {index + 1}
                </h3>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 self-start">
                  <LabeledInput
                    id={`name-${index}`}
                    label={t("Internal Name")}
                    value={loc.name}
                    onChange={(e) =>
                      updateLocation(index, "name", e.target.value)
                    }
                    placeholder={t("e.g. Downtown, Uptown")}
                    required
                    showError={submitted}
                    errorText={validationErrors[index]?.name || t("Required")}
                  />
                  <LabeledInput
                    id={`phone-${index}`}
                    label={t("Phone")}
                    value={loc.phone || ""}
                    onChange={(e) =>
                      updateLocation(index, "phone", e.target.value)
                    }
                    placeholder={t("Contact phone for this branch")}
                  />
                  <LabeledInput
                    id={`email-${index}`}
                    label={t("Email")}
                    value={loc.email || ""}
                    onChange={(e) =>
                      updateLocation(index, "email", e.target.value)
                    }
                    placeholder={t("branch@example.com")}
                  />
                  {validationErrors[index]?.email && (
                    <p className="md:col-span-2 text-xs text-red-500 -mt-2">
                      {validationErrors[index]?.email}
                    </p>
                  )}
                  <LabeledInput
                    id={`city-${index}`}
                    label={t("City")}
                    value={loc.city}
                    onChange={(e) =>
                      updateLocation(index, "city", e.target.value)
                    }
                    placeholder={t("City")}
                    required
                    showError={submitted}
                    errorText={validationErrors[index]?.city || t("Required")}
                  />
                  <LabeledInput
                    id={`country-${index}`}
                    label={t("Country")}
                    value={loc.country || "България"}
                    onChange={(e) =>
                      updateLocation(index, "country", e.target.value)
                    }
                    placeholder={t("Country")}
                  />
                  <LabeledInput
                    id={`postalCode-${index}`}
                    label={t("Postal Code")}
                    placeholder={t("12345")}
                    value={loc.postalCode || ""}
                    onChange={(e) =>
                      updateLocation(index, "postalCode", e.target.value)
                    }
                  />
                  <div className="md:col-span-2">
                    <LabeledInput
                      id={`address-${index}`}
                      label={t("Full Address")}
                      value={loc.address}
                      onChange={(e) =>
                        updateLocation(index, "address", e.target.value)
                      }
                      placeholder={t("Street, Number, etc.")}
                      required
                      showError={submitted}
                      errorText={
                        validationErrors[index]?.address || t("Required")
                      }
                    />
                  </div>
                </div>
                <div className="md:col-span-1 self-start">
                  <ImageUpload
                    value={loc.imageUrl}
                    onChange={(file) => updateLocation(index, "imageUrl", file)}
                    onRemove={() => updateLocation(index, "imageUrl", "")}
                    fullWidth
                  />
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
          <Button type="submit" disabled={mutation.isPending} iconType="next">
            {mutation.isPending ? t("Saving...") : t("Next Step")}
          </Button>
        </div>
      </form>
    </div>
  );
}
