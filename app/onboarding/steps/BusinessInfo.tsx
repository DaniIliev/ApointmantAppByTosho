"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { useTranslation } from "react-i18next";
import callApi from "@/app/Api/callApi";
import { ArrowLeft, ArrowRight, Building } from "lucide-react";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import { Business } from "@/Global/Types/types";
import { getBusinessCategories } from "@/Global/Types/types";

interface BusinessInfoStepProps {
  onNext: (info: Business) => void;
  onBack: () => void;
  initialData?: Business;
}

import { useAuthContext } from "@/context/AuthContext";

import { ImageUpload } from "@/components/customUIComponents/ImageUpload";

export default function BusinessInfoStep({ onNext, onBack, initialData }: BusinessInfoStepProps) {
  const { t } = useTranslation();
  const { refreshToken, user } = useAuthContext();
  const BUSINESS_CATEGORIES = getBusinessCategories(t);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: initialData?.businessName || "",
    category: initialData?.category || "",
    aboutUs: initialData?.aboutUs || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    website: initialData?.website || "",
    businessImageUrl: initialData?.businessImageUrl || "" as any,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isUpdate = !!initialData?._id;
      const method = isUpdate ? "PUT" : "POST";
      const endpoint = isUpdate ? `/api/business/${initialData._id}` : "/api/business";
      
      const payload = { ...formData };
      const useMultipart = formData.businessImageUrl instanceof File;
      
      const response = await callApi(endpoint, method, payload, useMultipart);
      if (!isUpdate) {
        await refreshToken();
      }
      onNext({ ...formData, ...response });
    } catch (error) {
      console.error("Failed to save business info:", error);
      onNext(formData as any); // Fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
          <Building className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{t("Tell us about your business")}</h2>
          <p className="text-muted-foreground">{t("This information will be visible to your customers.")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <LabeledInput
              id="businessName"
              label={t("Business Name")}
              value={formData.businessName}
              onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
              placeholder={t("Enter your business name")}
              required
            />
            <LabeledSelect<string>
              id="category"
              label={t("Category")}
              placeholder={t("Select a category")}
              value={formData.category}
              onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
              options={BUSINESS_CATEGORIES}
            />
            <LabeledInput
              id="email"
              label={t("Email")}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder={t("business@example.com")}
            />
            <LabeledInput
              id="phone"
              label={t("Phone")}
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder={t("+359...")}
            />
            <LabeledInput
              id="website"
              label={t("Website")}
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder={t("https://...")}
            />
          </div>

          <div className="space-y-6">
            <ImageUpload
              label={t("Business Photo")}
              value={formData.businessImageUrl}
              onChange={(file) => setFormData(prev => ({ ...prev, businessImageUrl: file }))}
              onRemove={() => setFormData(prev => ({ ...prev, businessImageUrl: "" }))}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("About Us")}
              </label>
              <textarea
                className="w-full min-h-[120px] rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                value={formData.aboutUs}
                onChange={(e) => setFormData(prev => ({ ...prev, aboutUs: e.target.value }))}
                placeholder={t("Describe your business in a few words...")}
                maxLength={500}
              />
              <p className="text-right text-xs text-muted-foreground">
                {formData.aboutUs.length}/500
              </p>
            </div>
          </div>
        </div>

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
