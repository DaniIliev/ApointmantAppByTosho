"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { useTranslation } from "react-i18next";
import { Plus, Scissors, Trash2 } from "lucide-react";
import callApi from "@/app/Api/callApi";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";

import { getCategoryOptions, Location, Service } from "@/Global/Types/types";

import { ImageUpload } from "@/components/customUIComponents/ImageUpload";
import { Staff } from "@/Global/Types/types";
import { MultiSelectCombobox } from "@/components/customUIComponents/MultiSelectCombobox";
import { PaymentOptionSelector } from "@/components/customUIComponents/PaymentOptionSelector";
import { cn } from "@/lib/utils";

interface ServicesSetupProps {
  locations: Location[];
  staff: Staff[];
  onFinish: () => void;
  onBack: () => void;
  initialData?: Service[];
}

export default function ServicesSetup({
  locations,
  staff,
  onFinish,
  onBack,
  initialData,
}: ServicesSetupProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>(
    initialData && initialData.length > 0
      ? initialData
      : [
          {
            name: "",
            description: "",
            duration: 30,
            price: 0,
            category: "",
            locationId: locations[0]?._id || "",
            staffMembers: [],
            paymentOption: "cash",
            isGroup: false,
            capacity: 1,
          },
        ],
  );

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setServices(initialData);
    }
  }, [initialData]);

  const addService = () => {
    setServices([
      ...services,
      {
        name: "",
        description: "",
        duration: 30,
        price: 0,
        category: "",
        locationId: locations[0]?._id || "",
        staffMembers: [],
        paymentOption: "cash",
        isGroup: false,
        capacity: 1,
      },
    ]);
  };

  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  const updateService = (index: number, field: keyof Service, value: any) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value } as Service;
    setServices(newServices);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await Promise.all(
        services.map(async (ser) => {
          const isNew = !ser._id;

          if (!isNew) {
            const original = (initialData || []).find((o) => o._id === ser._id);
            if (original) {
              const hasChanged =
                ser.name !== original.name ||
                (ser.description || "") !== (original.description || "") ||
                ser.duration !== original.duration ||
                ser.price !== original.price ||
                ser.category !== original.category ||
                ser.locationId !== original.locationId ||
                ser.paymentOption !== original.paymentOption ||
                Boolean(ser.isGroup) !== Boolean(original.isGroup) ||
                (ser.capacity ?? 1) !== (original.capacity ?? 1) ||
                ser.imageUrl instanceof File ||
                JSON.stringify(ser.staffMembers) !==
                  JSON.stringify(original.staffMembers);

              if (!hasChanged) return ser;
            }
          }

          const method = isNew ? "POST" : "PUT";
          const endpoint = isNew ? "/api/service" : `/api/service/${ser._id}`;
          const useMultipart = (ser.imageUrl as any) instanceof File;

          return callApi(endpoint, method, ser, useMultipart);
        }),
      );
      onFinish();
    } catch (error) {
      console.error("Failed to save services:", error);
      onFinish();
    } finally {
      setLoading(false);
    }
  };
  const categoryOptions = getCategoryOptions(t);
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
          <Scissors className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{t("Define your services")}</h2>
          <p className="text-muted-foreground">
            {t("Create the service menu for your clients to book.")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          {services.map((ser, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/50"
            >
              <div className="flex justify-between items-center mb-4 border-b pb-4">
                <h3 className="font-bold text-lg">
                  {t("Service")} #{index + 1}
                </h3>
                {services.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeService(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LabeledInput
                    id={`service-name-${index}`}
                    label={t("Service Name")}
                    value={ser.name}
                    onChange={(e) =>
                      updateService(index, "name", e.target.value)
                    }
                    placeholder={t("e.g. Consultation, Haircut")}
                    required
                  />
                  <LabeledSelect<string>
                    id={`category-${index}`}
                    label={t("Category")}
                    value={ser.category}
                    onValueChange={(val) =>
                      updateService(index, "category", val)
                    }
                    placeholder={t("Select a category")}
                    options={categoryOptions}
                  />
                  <MultiSelectCombobox
                    items={staff.map((s) => ({
                      id: s._id || s.email,
                      name: `${s.firstName} ${s.lastName}`,
                    }))}
                    selectedIds={(ser.staffMembers || []).map(
                      (s) => s._id || (s as any).email,
                    )}
                    onSelectIdsChange={(newIds) => {
                      const newStaffMembers = newIds
                        .map((id) => {
                          const staffMember = staff.find(
                            (s) => (s._id || s.email) === id,
                          );
                          return staffMember
                            ? {
                                _id: staffMember._id!,
                                name: `${staffMember.firstName} ${staffMember.lastName}`,
                                email: staffMember.email,
                              }
                            : null;
                        })
                        .filter(Boolean) as any;
                      updateService(index, "staffMembers", newStaffMembers);
                    }}
                    getLabel={(item) => item.name}
                    label={t("Assign Staff")}
                    searchPlaceholder={t("Search staff...")}
                    emptyMessage={t("No staff added yet.")}
                  />
                  <LabeledInput
                    id={`service-duration-${index}`}
                    label={t("Duration (min)")}
                    type="number"
                    value={ser.duration.toString()}
                    onChange={(e) =>
                      updateService(index, "duration", parseInt(e.target.value))
                    }
                    required
                  />
                  <LabeledInput
                    id={`service-price-${index}`}
                    label={`${t("Price")} (€)`}
                    type="number"
                    value={ser.price.toString()}
                    onChange={(e) =>
                      updateService(index, "price", parseFloat(e.target.value))
                    }
                    required
                  />
                  <LabeledSelect
                    id={`service-location-${index}`}
                    label={t("Location")}
                    value={ser?.locationId || ""}
                    onValueChange={(val) =>
                      updateService(index, "locationId", val)
                    }
                    options={locations.map((loc, i) => ({
                      id: loc?._id || i.toString(),
                      name: loc?.name || `Location ${i + 1}`,
                    }))}
                    placeholder={t("Select location")}
                  />
                  <div className="md:col-span-2">
                    <LabeledInput
                      id={`service-description-${index}`}
                      label={t("Description (Optional)")}
                      value={ser.description || ""}
                      onChange={(e) =>
                        updateService(index, "description", e.target.value)
                      }
                      placeholder={t("Brief description of the service")}
                      multiline
                    />
                  </div>
                  <div className="md:col-span-2">
                    <PaymentOptionSelector
                      value={ser.paymentOption || "cash"}
                      onChange={(option) =>
                        updateService(index, "paymentOption", option)
                      }
                      disabled={loading}
                    />
                  </div>

                  <div className="md:col-span-2 p-4 rounded-xl border border-primary/10 bg-primary/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base font-semibold">
                          {t("Group Appointment")}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t(
                            "Allow multiple clients to book the same time slot.",
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateService(index, "isGroup", !ser.isGroup)
                        }
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                          ser.isGroup ? "bg-primary" : "bg-gray-300",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                            ser.isGroup ? "translate-x-6" : "translate-x-1",
                          )}
                        />
                      </button>
                    </div>

                    {ser.isGroup && (
                      <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <LabeledInput
                          id={`service-capacity-${index}`}
                          label={t("Max Clients (Capacity)")}
                          value={(ser.capacity ?? 1).toString()}
                          onChange={(e) =>
                            updateService(
                              index,
                              "capacity",
                              Math.max(1, Number(e.target.value) || 1),
                            )
                          }
                          placeholder="10"
                          type="number"
                          min="1"
                        />
                      </div>
                    )}
                  </div>
                </div>
                {/* <div className="md:col-span-1 space-y-4 self-start"> */}
                <ImageUpload
                  value={ser.imageUrl}
                  onChange={(file) => updateService(index, "imageUrl", file)}
                  onRemove={() => updateService(index, "imageUrl", "")}
                />
                {/* </div> */}
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addService}
          className="w-full rounded-2xl py-6 border-dashed border-2 flex gap-2 items-center justify-center font-bold"
        >
          <Plus className="h-5 w-5" />
          {t("Add Another Service")}
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
          <Button type="submit" disabled={loading} iconType="next">
            {loading ? t("Finishing...") : t("Complete Setup")}
          </Button>
        </div>
      </form>
    </div>
  );
}
