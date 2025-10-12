"use client";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { LabeledSelect } from "@/components/customUIComponents/LabeledSelect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePageTitle } from "@/context/PageTitleContext";
import { SelectOption } from "@/Global/Types/types";
// Importing the necessary icons for the headers
import {
  ArrowLeft,
  Clock,
  Globe,
  Mail,
  Phone,
  Upload,
  X,
  Info, // Icon for 'General Information'
  Contact, // Icon for 'Contact Details'
  MapPin, // Icon for 'Addresses'
} from "lucide-react";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

// Interface for business information
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
}

const SectionHeader = ({
  icon: Icon, // Accepting the icon component as 'Icon'
  title,
}: {
  icon: React.ElementType; // Type is a React component (e.g., Info, Contact, MapPin)
  title: string;
}) => (
  <div className="flex items-center space-x-3 mb-4 mt-6">
    <Icon className="h-6 w-6 text-blue-400" /> {/* Colored icon */}
    <h2 className="text-xl font-semibold text-white">{title}</h2>
  </div>
);

export default function BusinessFormPage() {
  // imagePreview can be a string (data URL) or null
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(
    null
  );

  const [formData, setFormData] = useState<BusinessInformation>({
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
  });

  const { t } = useTranslation();
  const { setPageTitle } = usePageTitle();
  const generateOptions = (items: string[]): SelectOption[] => {
    return items.map((item) => ({
      id: item, // id and name are the same
      name: item,
    }));
  };

  const cities: SelectOption[] = generateOptions([
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
    "Philadelphia",
    "San Antonio",
    "San Diego",
    "Dallas",
    "San Jose",
  ]);

  const countries: SelectOption[] = generateOptions([
    "United States",
    "Canada",
    "United Kingdom",
    "Germany",
    "France",
    "Spain",
    "Italy",
    "Australia",
    "Japan",
    "Brazil",
  ]);

  useEffect(() => {
    setPageTitle(t("Business Info"));
    return () => {
      setPageTitle(null);
    };
  }, [setPageTitle, t]);
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
  };

  const handleInputChange = (
    field: keyof BusinessInformation,
    valueOrEvent: string | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let value: string;

    if (
      typeof valueOrEvent === "object" &&
      valueOrEvent !== null &&
      "target" in valueOrEvent &&
      valueOrEvent.target instanceof HTMLInputElement
    ) {
      value = valueOrEvent.target.value;
    }
    // If it's a direct value (for LabeledSelect)
    else if (typeof valueOrEvent === "string") {
      value = valueOrEvent;
    } else {
      // fallback or error if the type is not the expected one
      console.error("Unexpected value type in handleInputChange");
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#0f1419] text-white p-4 md:px-8 py-1 font-[Inter]">
      <div className="max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="grid lg:grid-cols-[1fr,1.2fr] gap-8 lg:gap-12">
          {/* Left Side - Image Upload */}
          <div className="space-y-3">
            {/* ⭐️ Section 1: Image 📸 */}
            <SectionHeader icon={Upload} title={t("1. Business Photo")} />
            <Card className="bg-gradient-to-br from-[#2a3142] to-[#1f2533] border border-white/10 overflow-hidden aspect-[1/0.7] shadow-xl">
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={imagePreview as string} // Type assertion, since it's string | ArrayBuffer | null
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

          {/* Right Side - Form Fields */}
          <div className="space-y-6">
            {/* ⭐️ Section 2: General Information 📝 */}
            <SectionHeader icon={Info} title={t("2. General Information")} />
            <div className="grid grid-cols-3 gap-3">
              {/* Category */}
              <LabeledInput
                id="category"
                label={t("Category")}
                placeholder={t("e.g. Hair and Beauty")}
                value={formData.category}
                onChange={(e) => handleInputChange("category", e)} // Passing event
              />

              {/* Business Name */}
              <LabeledInput
                id="businessName"
                label={t("Business Name")}
                placeholder={t("e.g. Luxe Hair Salon")}
                value={formData.businessName}
                onChange={(e) => handleInputChange("businessName", e)}
              />
              <LabeledInput
                id="openingHours"
                label={t("Opening Hours")}
                placeholder={t("e.g. Mon-Fri: 9:00 - 18:00")}
                value={formData.openingHours}
                onChange={(e) => handleInputChange("openingHours", e)}
                className="col-span-2"
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
              {/* Phone */}
              <LabeledInput
                id="phone"
                type="tel"
                label={t("Phone")}
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e)}
              />

              {/* Email */}
              <LabeledInput
                id="email"
                type="email"
                label={t("Email")}
                placeholder="info@luxehairsalon.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e)}
              />
              {/* Website */}
              <LabeledInput
                id="website"
                type="url"
                label={t("Website")}
                placeholder="www.luxehairsalon.com"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e)}
              />
            </div>

            {/* ⭐️ Section 4: Addresses 🗺️ */}
            <SectionHeader icon={MapPin} title={t("4. Addresses")} />
            <div className="grid grid-cols-2 gap-3">
              <LabeledSelect
                id="country"
                label={t("Country")}
                placeholder={t("Select country")}
                value={formData.country}
                onValueChange={(value) => handleInputChange("country", value)}
                options={countries}
              />
              <LabeledSelect
                id="city"
                label={t("City")}
                placeholder={t("Select city")}
                value={formData.city}
                onValueChange={(value) => handleInputChange("city", value)}
                options={cities}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {/* Address Line 1 */}
              <LabeledInput
                id="address"
                label={t("Street and Number")}
                placeholder={t("Street and Number")}
                value={formData.address}
                onChange={(e) => handleInputChange("address", e)}
                className="col-span-2" // Occupies 2 columns
              />

              {/* Postal Code */}
              <LabeledInput
                id="postalCode"
                label={t("Postal Code")}
                placeholder={t("Postal Code")}
                value={formData.postalCode}
                onChange={(e) => handleInputChange("postalCode", e)}
              />

              {/* Address Line 2 */}
              <LabeledInput
                id="addressLine2"
                label={t("Apartment, floor, etc. (optional)")}
                placeholder={t("Apartment, floor, etc. (optional)")}
                value={formData.addressLine2}
                onChange={(e) => handleInputChange("addressLine2", e)}
                className="col-span-3" // Occupies 3 columns for more space
              />
            </div>

            <div className="flex align-center justify-center w-full ">
              <Button
                className="bg-primary hover:bg-primary-dark mb-3"
                size="lg"
                iconType="save"
              >
                {t("Save")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
