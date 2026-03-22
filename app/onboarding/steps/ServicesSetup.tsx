"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Check, Plus, Scissors, Trash2 } from "lucide-react";
import callApi from "@/app/Api/callApi";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";

import { getCategoryOptions, Location, Service } from "@/Global/Types/types";

interface ServicesSetupProps {
  locations: Location[];
  onFinish: () => void;
  onBack: () => void;
  initialData?: Service[];
}

export default function ServicesSetup({ locations, onFinish, onBack, initialData }: ServicesSetupProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>(
    initialData && initialData.length > 0
      ? initialData
      : [{ name: "", duration: 30, price: 0, category: "", locationId: locations[0]?._id || "" }]
  );

  const addService = () => {
    setServices([...services, { name: "", duration: 30, price: 0, category: "", locationId: locations[0]?._id || "" }]);
  };

  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  const updateService = (index: number, field: keyof Service, value: string | number | File | null) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value } as Service;
    setServices(newServices);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await Promise.all(
        services.map(ser => {
          if (ser._id) {
            return callApi(`/api/service/${ser._id}`, "PUT", ser);
          }
          return callApi("/api/service", "POST", ser);
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">{t("Service")} #{index + 1}</h3>
                {services.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeService(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  id="category"
                  label="Category"
                  value={ser.category}
                  onValueChange={(val) => updateService(index, "category", val)}
                  placeholder="Select a category"
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
