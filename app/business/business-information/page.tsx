"use client";
import callApi from "@/app/Api/callApi";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
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
  <div className="flex items-center gap-3 mb-1">
    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10">
      <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    </div>
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
      {title}
    </h2>
  </div>
);

function BusinessInformationPageContent() {
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
    if (isLoading) {
      return (
        <div
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#0f1419] text-white"
          aria-live="polite"
        >
          <p>{t("Loading business information...")}</p>
        </div>
      );
    }

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
      <div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-[#0f1419] dark:via-[#1a1f2e] dark:to-[#0f1419]"
        aria-live="polite"
      >
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            {t("Loading business information...")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-[#0f1419] dark:via-[#1a1f2e] dark:to-[#0f1419] py-8 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr,1.5fr] gap-6 lg:gap-8">
          {/* Left Column - Business Photo */}
          <div className="space-y-4">
            <SectionHeader icon={Upload} title={t("Business Photo")} />
            <Card className="bg-white dark:bg-gradient-to-br dark:from-[#1f2533] dark:to-[#2a3142] border border-gray-200 dark:border-white/10 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              {currentImageSource ? (
                <div className="relative w-full aspect-[16/10] group">
                  <img
                    src={currentImageSource}
                    alt={t("Business preview")}
                    style={{ objectFit: "cover" }}
                    className="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <Button
                      onClick={removeImage}
                      size="icon"
                      variant="destructive"
                      className="shadow-2xl rounded-full scale-90 group-hover:scale-100 transition-transform"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-[16/10] cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200 group">
                  <div className="p-6 rounded-full bg-blue-50 dark:bg-blue-500/10 mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-all duration-200 group-hover:scale-110">
                    <Upload className="h-10 w-10 text-blue-500 dark:text-blue-400" />
                  </div>
                  <span className="text-gray-700 dark:text-white/80 font-semibold text-lg">
                    {t("Click to upload a photo")}
                  </span>
                  <span className="text-gray-500 dark:text-white/50 text-sm mt-2">
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

            {/* Info Card */}
            <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    {t("Photo Tips")}
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400/80">
                    {t(
                      "Use a high-quality image that represents your business. A good photo helps customers recognize and trust your brand."
                    )}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Form Sections */}
          <div className="space-y-6">
            {/* General Information Section */}
            <Card className="bg-white dark:bg-gradient-to-br dark:from-[#1f2533] dark:to-[#2a3142] border border-gray-200 dark:border-white/10 p-6 shadow-lg">
              <SectionHeader icon={Info} title={t("General Information")} />
              <div className="mt-5 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
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
                    "Tell customers about your business, services, and what makes you unique..."
                  )}
                  rows={3}
                />
              </div>
            </Card>

            {/* Contact Details Section */}
            <Card className="bg-white dark:bg-gradient-to-br dark:from-[#1f2533] dark:to-[#2a3142] border border-gray-200 dark:border-white/10 p-6 shadow-lg">
              <SectionHeader icon={Contact} title={t("Contact Details")} />
              <div className="mt-5 space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
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
                    placeholder="info@business.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e)}
                  />
                  <LabeledInput
                    id="website"
                    type="url"
                    label={t("Website")}
                    placeholder="www.business.com"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e)}
                  />
                </div>
              </div>
            </Card>

            {/* Address Section */}
            <Card className="bg-white dark:bg-gradient-to-br dark:from-[#1f2533] dark:to-[#2a3142] border border-gray-200 dark:border-white/10 p-6 shadow-lg">
              <SectionHeader icon={MapPin} title={t("Business Address")} />
              <div className="mt-5 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
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
                <div className="grid md:grid-cols-2 gap-4">
                  <LabeledInput
                    id="address"
                    label={t("Street and Number")}
                    placeholder={t("123 Main Street")}
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e)}
                    className="md:col-span-2"
                  />

                  <LabeledInput
                    id="postalCode"
                    label={t("Postal Code")}
                    placeholder={t("12345")}
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange("postalCode", e)}
                  />
                </div>

                <LabeledInput
                  id="addressLine2"
                  label={t("Apartment, floor, etc. (optional)")}
                  placeholder={t("Suite 100, 2nd Floor...")}
                  value={formData.addressLine2}
                  onChange={(e) => handleInputChange("addressLine2", e)}
                />
              </div>
            </Card>

            {/* Save Button */}
            {hasChanges && (
              <div className="sticky bottom-4 z-10 flex justify-center pt-2">
                <Button
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 min-w-[200px]"
                  size="lg"
                  iconType="save"
                  onClick={handleSubmit}
                  disabled={isSaving || isLoading}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {t("Saving...")}
                    </span>
                  ) : (
                    t("Save Changes")
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BusinessInformationPage() {
  return (
    <ProtectedRoute requiredRoles={["business"]}>
      <BusinessInformationPageContent />
    </ProtectedRoute>
  );
}
