"use client";
import callApi from "@/app/Api/callApi";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthContext } from "@/context/AuthContext";
import { usePageTitle } from "@/context/PageTitleContext";
import { getBusinessCategories } from "@/Global/Types/types";

import { Upload, X, Info, Contact, MapPin } from "lucide-react";
import React, { ChangeEvent, useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export interface BusinessInformation {
  category: string;
  businessName: string;
  aboutUs: string;
  openingHours: string;
  address: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  businessImageUrl?: string; // Съществуващият URL, ако има такъв
}

// Помощна функция за инициализация на състоянието (използвана за изчистване на кода)
const getInitialState = (): BusinessInformation => ({
  category: "",
  businessName: "",
  openingHours: "",
  aboutUs: "",
  address: "",
  addressLine2: "",
  postalCode: "",
  city: "",
  country: "",
  phone: "",
  email: "",
  website: "",
  businessImageUrl: "",
});

const SectionHeader = ({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) => (
  <div className="flex items-center space-x-3 mb-4 mt-6">
    <Icon className="h-6 w-6 text-blue-400" />
    <h2 className="text-xl font-semibold text-white">{title}</h2>
  </div>
);

export default function BusinessFormPage() {
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(
    null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Ново състояние за съхранение на оригиналните данни, заредени от API
  const [initialFormData, setInitialFormData] =
    useState<BusinessInformation>(getInitialState);

  const [formData, setFormData] =
    useState<BusinessInformation>(getInitialState);

  const { t } = useTranslation();
  const { setPageTitle } = usePageTitle();
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const BUSINESS_CATEGORIES = getBusinessCategories(t);
  const hasChanges = useMemo(() => {
    const formChanged = Object.keys(formData).some((key) => {
      const k = key as keyof BusinessInformation;
      return formData[k] !== initialFormData[k];
    });

    const imageChanged =
      !!imageFile || (formData.businessImageUrl && imagePreview === null);

    return formChanged || imageChanged;
  }, [formData, initialFormData, imageFile, imagePreview]);

  useEffect(() => {
    setPageTitle(t("Business Info"));
    return () => {
      setPageTitle(null);
    };
  }, [setPageTitle, t]);

  // Ефект за зареждане на данните от API при отваряне
  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!user?.businessId) {
        setIsLoading(false);
        return;
      }
      const url = `/api/business/${user.businessId}`;
      try {
        const data: BusinessInformation = await callApi(url, "GET");

        // Проверка и нормализиране на данните, ако е необходимо
        const normalizedData = {
          ...getInitialState(), // Осигурява всички ключове
          ...data,
        };

        setFormData(normalizedData);
        setInitialFormData(normalizedData);

        // Задаваме imagePreview, ако има съществуващ imageUrl
        if (data.businessImageUrl) {
          setImagePreview(data.businessImageUrl);
        }
      } catch (error) {
        console.error("Error fetching business info:", error);
        toast.error(t("Could not load business information."));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessData();
  }, [user?.businessId, t]);

  // Хендлър за качване на изображение
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("file on handleupload", file);
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setFormData((prev) => ({ ...prev, businessImageUrl: "" }));
  };

  const handleInputChange = (
    field: keyof BusinessInformation,
    valueOrEvent: string | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let value: string;

    if (
      typeof valueOrEvent === "object" &&
      valueOrEvent !== null &&
      "target" in valueOrEvent
    ) {
      const target = valueOrEvent.target as
        | HTMLInputElement
        | HTMLTextAreaElement;
      if (target && "value" in target) {
        value = target.value;
      } else {
        console.error("Event target missing value property.");
        return;
      }
    } else if (typeof valueOrEvent === "string") {
      value = valueOrEvent;
    } else {
      console.error("Unexpected value type in handleInputChange");
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasChanges) {
      toast.info(t("No changes to save."));
      return;
    }

    setIsSaving(true);

    const payload: { [key: string]: any } = {
      ...formData,
    };

    // Ако има нов файл, го добавяме
    console.log("imageFile", imageFile);
    if (imageFile) {
      payload.businessImageUrl = imageFile;
      // delete payload.businessImageUrl;
    }
    // else if (initialFormData.businessImageUrl && imagePreview === null) {
    //   payload.businessImageUrl = "";
    //   payload.businessImageUrl = formData.businessImageUrl;
    // }

    const url = `/api/business/${user?.businessId}`;

    try {
      // 5. Изпращане на данните като multipartForm: true
      const updatedBusinessData: BusinessInformation = await callApi(
        url,
        "PUT",
        payload,
        true
      );

      // При успешен запис, актуализираме initialFormData и formData
      const newNormalizedData = {
        ...formData,
        businessImageUrl: updatedBusinessData.businessImageUrl || "",
      };

      setFormData(newNormalizedData);
      setInitialFormData(newNormalizedData);

      // Изчистваме imageFile, тъй като вече е запазен
      setImageFile(null);

      // Актуализираме imagePreview до новия URL, ако има такъв
      if (updatedBusinessData.businessImageUrl) {
        setImagePreview(updatedBusinessData.businessImageUrl);
      }

      toast.success(t("Business information saved successfully!"));
    } catch (error: any) {
      console.error("Error saving business info:", error);
      toast.error(
        t(`Error: ${error.message || "Could not save information."}`)
      );
    } finally {
      setIsSaving(false);
    }
  };

  const currentImageSource =
    (imagePreview as string | undefined) || formData.businessImageUrl;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#0f1419] text-white">
        <p>{t("Loading business information...")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#0f1419] text-white p-4 md:px-8 py-1 font-[Inter]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr,1.2fr] gap-8 lg:gap-12">
          <div className="space-y-3">
            <SectionHeader icon={Upload} title={t("1. Business Photo")} />
            <Card className="bg-gradient-to-br from-[#2a3142] to-[#1f2533] border border-white/10 overflow-hidden aspect-[1/0.7] shadow-xl">
              {currentImageSource ? ( // Използваме currentImageSource
                <div className="relative w-full h-full">
                  <img
                    src={currentImageSource}
                    alt={t("Business preview")}
                    style={{ objectFit: "cover" }}
                    className="w-full h-full"
                  />
                  <Button
                    onClick={removeImage}
                    size="icon"
                    variant="destructive"
                    className="absolute top-3 right-3 shadow-lg rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-white/5 transition-colors group">
                  <div className="p-4 rounded-full bg-white/5 mb-4 group-hover:bg-white/10 transition-colors">
                    <Upload className="h-8 w-8 text-blue-400" />
                  </div>
                  <span className="text-white/70 font-medium">
                    {t("Click to upload a photo")}
                  </span>
                  <span className="text-white/40 text-sm mt-1">
                    {t("PNG, JPG up to 10MB")}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <SectionHeader icon={Info} title={t("2. General Information")} />
            <div className="grid grid-cols-2 gap-3">
              <LabeledSelect<string>
                id="category"
                label={t("Category")}
                placeholder={t("e.g. Hair and Beauty")}
                value={formData.category}
                onValueChange={(e) => handleInputChange("category", e)}
                options={BUSINESS_CATEGORIES}
              />

              <LabeledInput
                id="businessName"
                label={t("Business Name")}
                placeholder={t("e.g. Luxe Hair Salon")}
                value={formData.businessName}
                onChange={(e) => handleInputChange("businessName", e)}
              />
            </div>
            <LabeledInput
              label={t("About us")}
              id="aboutUs"
              value={formData.aboutUs}
              onChange={(e) => handleInputChange("aboutUs", e)}
              placeholder={t(
                "Add any additional information about your Business..."
              )}
              rows={2}
            />
            <SectionHeader icon={Contact} title={t("3. Contact Details")} />
            <div className="grid grid-cols-3 gap-3">
              <LabeledInput
                id="phone"
                type="tel"
                label={t("Phone")}
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e)}
              />

              <LabeledInput
                id="email"
                type="email"
                label={t("Email")}
                placeholder="info@luxehairsalon.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e)}
              />
              <LabeledInput
                id="website"
                type="url"
                label={t("Website")}
                placeholder="www.luxehairsalon.com"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e)}
              />
            </div>

            <SectionHeader icon={MapPin} title={t("4. Addresses")} />
            <div className="grid grid-cols-2 gap-3">
              <LabeledInput
                id="country"
                label={t("Country")}
                placeholder={t("Select country")}
                value={formData.country}
                onChange={(value) => handleInputChange("country", value)}
              />
              <LabeledInput
                id="city"
                label={t("City")}
                placeholder={t("Select city")}
                value={formData.city}
                onChange={(value) => handleInputChange("city", value)}
              />
            </div>
            <div
              className={`grid grid-cols-3 gap-3 ${
                hasChanges ? "p-1" : "pb-3"
              }`}
            >
              <LabeledInput
                id="address"
                label={t("Street and Number")}
                placeholder={t("Street and Number")}
                value={formData.address}
                onChange={(e) => handleInputChange("address", e)}
                className="col-span-2"
              />

              <LabeledInput
                id="postalCode"
                label={t("Postal Code")}
                placeholder={t("Postal Code")}
                value={formData.postalCode}
                onChange={(e) => handleInputChange("postalCode", e)}
              />

              <LabeledInput
                id="addressLine2"
                label={t("Apartment, floor, etc. (optional)")}
                placeholder={t("Apartment, floor, etc. (optional)")}
                value={formData.addressLine2}
                onChange={(e) => handleInputChange("addressLine2", e)}
                className="col-span-3"
              />
            </div>

            {hasChanges && (
              <div className="flex align-center justify-center w-full ">
                <Button
                  className="bg-primary hover:bg-primary-dark mb-4"
                  size="lg"
                  iconType="save"
                  onClick={handleSubmit}
                  disabled={isSaving || isLoading}
                >
                  {isSaving ? t("Saving...") : t("Save")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
