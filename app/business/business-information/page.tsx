"use client";
import callApi from "@/app/Api/callApi";
import { HoverImagePreview } from "@/components/customUIComponents/HoverImagePreview";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { useAuthContext } from "@/context/AuthContext";
import { usePageTitle } from "@/context/PageTitleContext";
import { getBusinessCategories } from "@/Global/Types/types";

import { Upload, Info, Contact, MapPin } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export interface BusinessInformation {
  category: string;
  businessName: string;
  aboutUs: string;
  openingHours: string;
  email: string;
  website: string;
  businessImageUrl?: string;
}

const getInitialState = (): BusinessInformation => ({
  category: "",
  businessName: "",
  openingHours: "",
  aboutUs: "",
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
  <div className="flex items-center gap-2 mb-1">
    <div className=" rounded-lg ">
      <Icon className="h-6 w-6 text-primary dark:text-primary" />
    </div>
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
      {title}
    </h2>
  </div>
);

function BusinessInformationPageContent() {
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(
    null,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
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
    return () => setPageTitle(null);
  }, [setPageTitle, t]);

  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!user?.businessId) {
        setIsLoading(false);
        return;
      }
      try {
        const data: BusinessInformation = await callApi(
          `/api/business/${user.businessId}`,
          "GET",
        );
        const normalizedData = { ...getInitialState(), ...data };
        setFormData(normalizedData);
        setInitialFormData(normalizedData);
        if (data.businessImageUrl) setImagePreview(data.businessImageUrl);
      } catch (error) {
        console.error("Error fetching business info:", error);
        toast.error(t("Could not load business information."));
      } finally {
        setIsLoading(false);
      }
    };
    fetchBusinessData();
  }, [user?.businessId, t]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
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
    valueOrEvent:
      | string
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value =
      typeof valueOrEvent === "string"
        ? valueOrEvent
        : valueOrEvent.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;
    setIsSaving(true);
    const payload: any = { ...formData };
    if (imageFile) payload.businessImageUrl = imageFile;

    try {
      const updatedData: BusinessInformation = await callApi(
        `/api/business/${user?.businessId}`,
        "PUT",
        payload,
        true,
      );
      const newNormalizedData = {
        ...formData,
        businessImageUrl: updatedData.businessImageUrl || "",
      };
      setFormData(newNormalizedData);
      setInitialFormData(newNormalizedData);
      setImageFile(null);
      if (updatedData.businessImageUrl)
        setImagePreview(updatedData.businessImageUrl);
      toast.success(t("Business information saved successfully!"));
    } catch (error: any) {
      console.error("Error saving business info:", error);
      toast.error(
        t(`Error: ${error.message || "Could not save information."}`),
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-[#0f1419] dark:via-[#1a1f2e] dark:to-[#0f1419]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            {t("Loading business information...")}
          </p>
        </div>
      </div>
    );
  }

  const currentImageSource =
    (imagePreview as string) || formData.businessImageUrl;

  return (
    <div>
      <div className="mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          <div className="lg:h-full">
            <Card className="bg-white dark:bg-gradient-to-br dark:from-[#1f2533] dark:to-[#2a3142] border border-gray-200 dark:border-white/10 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
              {currentImageSource ? (
                <div className="p-4 space-y-3">
                  <HoverImagePreview
                    src={currentImageSource as string}
                    alt={t("Business preview")}
                    previewTitle={formData.businessName || t("Business image")}
                    onDelete={removeImage}
                    className="w-full h-[260px]"
                  />
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full min-h-[320px] cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
                  <div className="p-6 rounded-full bg-primary dark:bg-primary-dark mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="h-10 w-10 " />
                  </div>
                  <span className="text-gray-700 dark:text-white/80 font-semibold">
                    {t("Click to upload a photo")}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {t("16:10 aspect ratio recommended")}
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

          <div className="lg:h-full">
            <Card className="bg-white dark:bg-gradient-to-br dark:from-[#1f2533] dark:to-[#2a3142] border border-gray-200 dark:border-white/10 p-6 shadow-lg h-full">
              <SectionHeader icon={Info} title={t("General Information")} />
              <div className="mt-5 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <LabeledSelect<string>
                    id="category"
                    label={t("Category")}
                    placeholder={t("Select a category")}
                    value={formData.category}
                    onValueChange={(val) => handleInputChange("category", val)}
                    options={BUSINESS_CATEGORIES}
                  />
                  <LabeledInput
                    id="businessName"
                    label={t("Business Name")}
                    value={formData.businessName}
                    onChange={(e) =>
                      handleInputChange("businessName", e.target.value)
                    }
                  />
                </div>

                <LabeledInput
                  label={t("About us")}
                  id="aboutUs"
                  value={formData.aboutUs}
                  onChange={(e) => handleInputChange("aboutUs", e.target.value)}
                  placeholder={t("Tell customers about your business...")}
                  rows={3}
                  max={6}
                />
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-6 mt-6">
          <Card className="bg-white dark:bg-gradient-to-br dark:from-[#1f2533] dark:to-[#2a3142] border border-gray-200 dark:border-white/10 p-6 shadow-lg">
            <SectionHeader icon={Contact} title={t("Contact Info")} />
            <div className="mt-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <LabeledInput
                  id="email"
                  type="email"
                  label={t("Email")}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                <LabeledInput
                  id="website"
                  type="url"
                  label={t("Website")}
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gradient-to-br dark:from-[#1f2533] dark:to-[#2a3142] border border-gray-200 dark:border-white/10 p-6 shadow-lg">
            <SectionHeader icon={MapPin} title={t("Locations")} />
            <div className="mt-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                {t(
                  "Manage your business branches and locations. Each location has its own address, phone, and opening hours.",
                )}
              </p>
              <Button
                onClick={() => (window.location.href = "/business/locations")}
                className="w-full sm:w-auto rounded-full"
                iconType="add"
              >
                {t("Manage Locations")}
              </Button>
            </div>
          </Card>

          {hasChanges && (
            <div className="sticky bottom-4 z-10 flex justify-center pt-2">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg min-w-[200px]"
                size="lg"
                iconType="save"
                onClick={handleSubmit}
                disabled={isSaving}
              >
                {isSaving ? t("Saving...") : t("Save Changes")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BusinessInformationPage() {
  return (
    <ProtectedRoute requiredRoles={["business", "manager"]}>
      <BusinessInformationPageContent />
    </ProtectedRoute>
  );
}
