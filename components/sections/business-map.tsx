// components/sections/business-map.tsx (ФИНАЛНА ВЕРСИЯ - БЕЗ EDIT MODE С GOOGLE MAPS)
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button"; // Добавяме Button за линка

interface BusinessMapProps {
  business: {
    name: string;
    address: string;
    city: string;
    state: string;
    // Оставяме координатите, но ще използваме пълния адрес за Google Maps URL
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  // isEditMode е премахнат
}

// Функцията генерира URL за вграден Google Map, който използва пълния адрес
const getGoogleMapEmbedUrl = (address: string, city: string, state: string) => {
  const fullAddress = `${address}, ${city}, ${state}`;
  // Кодираме адреса за URL
  const encodedAddress = encodeURIComponent(fullAddress);

  // Използвайте своя API ключ тук, ако искате да активирате картата!
  const apiKey = "YOUR_GOOGLE_MAPS_API_KEY";

  // URL за вградена карта (iframe)
  return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}`;
};

// Функцията генерира директен линк към Google Maps за навигация
const getGoogleMapLink = (address: string, city: string, state: string) => {
  const fullAddress = `${address}, ${city}, ${state}`;
  const encodedAddress = encodeURIComponent(fullAddress);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
};

export function BusinessMap({ business }: BusinessMapProps) {
  const fullAddress = `${business.address}, ${business.city}, ${business.state}`;
  // const mapEmbedUrl = getGoogleMapEmbedUrl(
  //   business.address,
  //   business.city,
  //   business.state
  // );
  const mapLink = getGoogleMapLink(
    business.address,
    business.city,
    business.state
  );

  // Ако нямате API ключ или не искате да го използвате:
  // Използвайте този URL за iframe, той обикновено работи без ключ за основни нужди:
  const fallbackEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    fullAddress
  )}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  const handleOpenMaps = () => {
    window.open(mapLink, "_blank", "noopener,noreferrer");
  };
  return (
    <Card className="shadow-lg pt-2">
      <CardHeader className="flex flex-row align-center justify-between items-center border-b">
        <div className="flex items-center gap-3">
          <MapPin className="h-6 w-6 text-primary" />
          <CardTitle className="font-bold text-2xl font-sans">
            Our Location
          </CardTitle>
        </div>

        {/* Бутон за директна навигация */}
        <Button variant="outline" onClick={handleOpenMaps}>
          Open in Maps
          <ArrowUpRight className="h-4 w-4 ml-1" />
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
              aria-label={`Location of ${business.name}`}
              className="border-0"
            />
          </div>

          {/* Информация за адреса */}
          <div className="text-base space-y-1">
            <p className="font-bold text-lg text-primary">{business.name}</p>
            <p className="text-muted-foreground">{fullAddress}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// "use client";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { MapPin } from "lucide-react";
// import { Input } from "../ui/input";

// interface BusinessMapProps {
//   business: {
//     name: string;
//     address: string;
//     city: string;
//     state: string;
//     coordinates: {
//       lat: number;
//       lng: number;
//     };
//   };
//   isEditMode: boolean;
// }

// export function BusinessMap({ business, isEditMode }: BusinessMapProps) {
//   const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s-l+5B4FFF(${business.coordinates.lng},${business.coordinates.lat})/${business.coordinates.lng},${business.coordinates.lat},14,0/800x400@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;

//   return (
//     <Card>
//       {/* ... CardHeader */}
//       <CardContent>
//         <div className="space-y-4">
//           {/* Map Image/Interactive Map */}
//           <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden border border-border">
//             {/* В Edit Mode, тук може да има интерактивна Mapbox/Google Maps карта с плъзгащ се маркер */}
//             <img
//               src={mapUrl || "/placeholder.svg"}
//               alt={`Map showing ${business.name} location`}
//               className="w-full h-full object-cover"
//             />
//           </div>

//           <div className="text-sm space-y-2">
//             <p className="font-semibold mb-1 font-sans">{business.name}</p>
//             {isEditMode ? (
//               <>
//                 <Input
//                   type="text"
//                   defaultValue={business.address}
//                   placeholder="Address"
//                 />
//                 <div className="flex gap-2">
//                   <Input
//                     type="text"
//                     defaultValue={business.city}
//                     placeholder="City"
//                   />
//                   <Input
//                     type="text"
//                     defaultValue={business.state}
//                     placeholder="State"
//                     className="w-1/3"
//                   />
//                 </div>
//                 <p className="text-xs text-muted-foreground pt-2">
//                   Coordinates: {business.coordinates.lat},{" "}
//                   {business.coordinates.lng}
//                 </p>
//               </>
//             ) : (
//               <p className="text-muted-foreground">
//                 {business.address}, {business.city}, {business.state}
//               </p>
//             )}
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
