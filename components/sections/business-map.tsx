"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Location } from "@/Global/Types/types";

interface BusinessMapProps {
  selectedLocation: Location;
}
const getGoogleMapLink = (address: string, city: string) => {
  const fullAddress = `${address}, ${city}`;
  const encodedAddress = encodeURIComponent(fullAddress);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
};

export function BusinessMap({ selectedLocation }: BusinessMapProps) {
  const address = selectedLocation?.address;
  const city = selectedLocation?.city;
  const fullAddress = `${address}, ${city}`;
  const { t } = useTranslation();

  const mapLink = getGoogleMapLink(address, city);

  const fallbackEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    fullAddress
  )}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  const handleOpenMaps = () => {
    window.open(mapLink, "_blank", "noopener,noreferrer");
  };
  return (
    <Card className="shadow-lg pt-2 pb-4">
      <CardHeader className="flex flex-row align-center justify-between items-center border-b">
        <div className="flex items-center gap-3">
          <MapPin className="h-6 w-6 text-primary" />
          <CardTitle className="font-bold text-primary text-2xl font-sans">
            {t("Our Location")}
          </CardTitle>
        </div>

        {/* Бутон за директна навигация (икона на мобилни устройства) */}
        <Button
          variant="outline"
          onClick={handleOpenMaps}
          size="sm"
          className="px-2 sm:px-3"
          aria-label={t("Open in Maps") as string}
        >
          <span className="hidden sm:inline">{t("Open in Maps")}</span>
          <ArrowUpRight className="h-4 w-4 sm:ml-1" />
        </Button>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Интерактивна Google Map (iframe) */}
          <div className="relative w-full h-80 rounded-lg overflow-hidden border-2 border-primary/20 shadow-md">
            <iframe
              width="100%"
              height="100%"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={fallbackEmbedUrl} // Използваме Fallback URL за по-голяма съвместимост без API ключ
              aria-label={`Location of ${address}`}
              className="border-0"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

