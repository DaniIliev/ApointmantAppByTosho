// app/business-configuration/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch"; // Ще трябва да си добавиш този компонент (ако използваш shadcn/ui)
import { Label } from "@/components/ui/label"; // Label за Switch
import { BusinessInfo } from "@/components/sections/business-info";
import { ServicesSection } from "@/components/sections/services-section";
import { StaffSection } from "@/components/sections/staff-section";
import { BusinessMap } from "@/components/sections/business-map";
import { Button } from "@/components/ui/button";
import { Save, Eye, Edit } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/context/PageTitleContext";
import { BusinessHeader } from "@/components/sections/business-header";

// Mock Data (Същите данни, които се ползват за визуализация)
// В реално приложение, това ще се зареди с API call
const initialBusinessData = {
  id: 1,
  name: "Luxe Hair Salon",
  category: "Hair & Beauty",
  rating: 4.8,
  reviews: 234,
  address: "123 Main St, Downtown",
  city: "New York",
  state: "NY",
  zipCode: "10001",
  phone: "(555) 123-4567",
  email: "info@luxehairsalon.com",
  website: "www.luxehairsalon.com",
  description:
    "Luxe Hair Salon is a premier destination for hair styling, coloring, and treatments. Our experienced stylists are dedicated to bringing out your natural beauty with personalized service and the latest techniques.",
  hours: {
    monday: "9:00 AM - 8:00 PM",
    tuesday: "9:00 AM - 8:00 PM",
    wednesday: "9:00 AM - 8:00 PM",
    thursday: "9:00 AM - 8:00 PM",
    friday: "9:00 AM - 9:00 PM",
    saturday: "8:00 AM - 6:00 PM",
    sunday: "10:00 AM - 5:00 PM",
  },
  coordinates: {
    lat: 40.7589,
    lng: -73.9851,
  },
  images: ["/modern-hair-salon.png", "/luxury-spa-interior.png"],
};

export default function BusinessConfigurationPage() {
  const [businessData, setBusinessData] = useState(initialBusinessData);
  const [isEditMode, setIsEditMode] = useState(false);

  const { t } = useTranslation();
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle(t("Business Configuration"));
    return () => {
      setPageTitle(null);
    };
  }, [setPageTitle, t]);
  // Функции за запазване и управление на промените
  const handleSave = () => {
    console.log("Saving changes to business data:", businessData);
    // TODO: Implement API call to save data
    setIsEditMode(false); // Излизане от режим на редактиране след запазване
  };

  // Пример за функция, която може да бъде подадена на компонентите
  const handleBusinessInfoChange = (field: string, value: any) => {
    setBusinessData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="space-y-10">
        {/* <ConfigCard title="General Information & Hours"> */}
        <BusinessHeader business={initialBusinessData} />
        <BusinessInfo
          business={businessData}
          isEditMode={isEditMode}
          onHoursChange={handleBusinessInfoChange} // Нова функция за промяна
          onDescriptionChange={handleBusinessInfoChange} // Нова функция за промяна
        />
        <ServicesSection
          businessId={businessData.id.toString()}
          isEditMode={isEditMode}
        />
        <StaffSection businessId={businessData.id.toString()} />

        <BusinessMap business={businessData} />
      </div>
    </div>
  );
}
