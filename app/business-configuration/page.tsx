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
      {/* Заглавие и Switch за режим */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Edit
              className={`h-5 w-5 ${
                isEditMode ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <Label htmlFor="edit-mode" className="text-lg font-sans">
              Edit Mode
            </Label>
            <Switch
              id="edit-mode"
              checked={isEditMode}
              onCheckedChange={setIsEditMode}
            />
            <Eye
              className={`h-5 w-5 ${
                !isEditMode ? "text-primary" : "text-muted-foreground"
              }`}
            />
          </div>
          {isEditMode && (
            <Button onClick={handleSave} className="ml-4">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          )}
        </div>
      </div>

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

      {/* Save Button for mobile/bottom */}
      {isEditMode && (
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-card border-t z-50 lg:hidden">
          <Button onClick={handleSave} className="w-full">
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}

function ConfigCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-sans">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
