"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Check, Plus, Scissors, Trash2 } from "lucide-react";
import callApi from "@/app/Api/callApi";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";

import { getCategoryOptions, Location, Service } from "@/Global/Types/types";

import { ImageUpload } from "@/components/customUIComponents/ImageUpload";
import { Staff } from "@/Global/Types/types";
import { Checkbox } from "@/components/ui/checkbox";

interface ServicesSetupProps {
  locations: Location[];
  staff: Staff[];
  onFinish: () => void;
  onBack: () => void;
  initialData?: Service[];
}

export default function ServicesSetup({ locations, staff, onFinish, onBack, initialData }: ServicesSetupProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>(
    initialData && initialData.length > 0
      ? initialData
      : [{ name: "", duration: 30, price: 0, category: "", locationId: locations[0]?._id || "", staffs: [] }]
  );

  const addService = () => {
    setServices([...services, { name: "", duration: 30, price: 0, category: "", locationId: locations[0]?._id || "", staffs: [] }]);
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

  const toggleStaff = (serviceIndex: number, staffMember: Staff) => {
    const service = services[serviceIndex];
    if (!service) return;
    
    const currentStaffs = service.staffs || [];
    const isAssigned = currentStaffs.some(s => s._id === staffMember._id);
    
    let newStaffs;
    if (isAssigned) {
      newStaffs = currentStaffs.filter(s => s._id !== staffMember._id);
    } else {
      newStaffs = [...currentStaffs, { _id: staffMember._id!, name: `${staffMember.firstName} ${staffMember.lastName}` }];
    }
    
    updateService(serviceIndex, "staffs", newStaffs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await Promise.all(
        services.map(ser => {
          const method = ser._id ? "PUT" : "POST";
          const endpoint = ser._id ? `/api/service/${ser._id}` : "/api/service";
          const useMultipart = (ser.imageUrl as any) instanceof File;
          
          return callApi(endpoint, method, ser, useMultipart);
        })
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
    <div >
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
          <Scissors className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{t("Define your services")}</h2>
          <p className="text-muted-foreground">{t("Create the service menu for your clients to book.")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          {services.map((ser, index) => (
            <div key={index} className="p-6 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex justify-between items-center mb-4 border-b pb-4">
                <h3 className="font-bold text-lg">{t("Service")} #{index + 1}</h3>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                  <ImageUpload
                    label={t("Service Image")}
                    value={ser.imageUrl}
                    onChange={(file) => updateService(index, "imageUrl", file)}
                    onRemove={() => updateService(index, "imageUrl", "")}
                  />
                  
                  <div className="space-y-3">
                    <label className="text-sm font-medium block">{t("Assign Staff")}</label>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 border rounded-xl bg-white dark:bg-gray-900">
                      {staff.length > 0 ? staff.map(s => (
                        <div key={s._id} className="flex items-center space-x-2 p-1 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                          <Checkbox 
                            id={`staff-${index}-${s._id}`}
                            checked={(ser.staffs || []).some(assigned => assigned._id === s._id)}
                            onCheckedChange={() => toggleStaff(index, s)}
                          />
                          <label 
                            htmlFor={`staff-${index}-${s._id}`}
                            className="text-sm cursor-pointer select-none truncate"
                          >
                            {s.firstName} {s.lastName}
                          </label>
                        </div>
                      )) : (
                        <p className="text-xs text-muted-foreground italic p-2">{t("No staff added yet.")}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <LabeledInput
                      id={`service-name-${index}`}
                      label={t("Service Name")}
                      value={ser.name}
                      onChange={(e) => updateService(index, "name", e.target.value)}
                      placeholder={t("e.g. Consultation, Haircut")}
                      required
                    />
                  </div>
                  <LabeledSelect<string>
                    id={`category-${index}`}
                    label={t("Category")}
                    value={ser.category}
                    onValueChange={(val) => updateService(index, "category", val)}
                    placeholder={t("Select a category")}
                    options={categoryOptions}
                  />  
                  <LabeledInput
                    id={`service-duration-${index}`}
                    label={t("Duration (min)")}
                    type="number"
                    value={ser.duration.toString()}
                    onChange={(e) => updateService(index, "duration", parseInt(e.target.value))}
                    required
                  />
                  <LabeledInput
                    id={`service-price-${index}`}
                    label={t("Price")}
                    type="number"
                    value={ser.price.toString()}
                    onChange={(e) => updateService(index, "price", parseFloat(e.target.value))}
                    required
                  />
                  <LabeledSelect
                    id={`service-location-${index}`}
                    label={t("Location")}
                    value={ser.locationId || ""}
                    onValueChange={(val) => updateService(index, "locationId", val)}
                    options={locations.map((loc, i) => ({ id: loc._id || i.toString(), name: loc.name }))}
                    placeholder={t("Select location")}
                  />
                </div>
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
          <Button
            type="submit"
            disabled={loading}
            iconType="next"
          >
            {loading ? t("Finishing...") : t("Complete Setup")}
          </Button>
        </div>
      </form>
    </div>
  );
}
