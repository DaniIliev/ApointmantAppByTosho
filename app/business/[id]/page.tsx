"use client";

import { ArrowLeft, Calendar, ChevronRight, Home, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BusinessHeader } from "@/components/sections/business-header";
import { BusinessInfo } from "@/components/sections/business-info";
import { ServicesSection } from "@/components/sections/services-section";
import { StaffSection } from "@/components/sections/staff-section";
import { BusinessMap } from "@/components/sections/business-map";
import { ReviewsSection } from "@/components/sections/reviews-section";
import { BookingPanel } from "@/components/sections/booking-panel";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import { useRouter } from "next/navigation";

// Mock data - in a real app, this would come from a database
const businessData = {
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

export default function BusinessDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Business Header */}
      <BusinessHeader business={businessData} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <BusinessInfo
              business={businessData}
              isEditMode={false}
              onDescriptionChange={function (
                field: string,
                value: string
              ): void {
                throw new Error("Function not implemented.");
              }}
              onHoursChange={function (field: string, value: string): void {
                throw new Error("Function not implemented.");
              }}
            />
            <ServicesSection businessId={params.id} isEditMode={false} />
            <StaffSection businessId={params.id} />
            <BusinessMap business={businessData} />
            <ReviewsSection businessId={params.id} />
          </div>

          {/* Right Column - Booking Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingPanel business={businessData} />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform z-40"
        aria-label="Back to top"
      >
        <ChevronRight className="h-5 w-5 -rotate-90" />
      </button>
    </div>
  );
}
