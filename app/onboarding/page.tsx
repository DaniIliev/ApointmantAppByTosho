"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import RoleSelection from "./steps/RoleSelection";
import BusinessInfoStep from "./steps/BusinessInfo";
import LocationsSetup from "./steps/LocationsSetup";
import StaffSetup, { type Staff } from "./steps/StaffSetup";
import LocationHoursSetup from "./steps/LocationHoursSetup";
import callApi from "@/app/Api/callApi";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Business,
  Location,
  LocationsOpeningHours,
} from "@/Global/Types/types";
import { UserRole } from "@/lib/permissions";

interface OnboardingData {
  role: UserRole;
  businessInfo: Business;
  locations: Location[];
  staff: Staff[];
  hours: LocationsOpeningHours;
}

export default function OnboardingPage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    role: (user?.role as UserRole) || "personal",
    businessInfo: {
      businessName: "",
      category: "",
      aboutUs: "",
      plan: "none",
      subscriptionStatus: "none",
    },
    locations: [],
    staff: [],
    hours: {},
  });
  // Simple step orchestration
  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => Math.max(1, prev - 1));

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ["onboardingData", user?.businessId],
    queryFn: async () => {
      if (!user || !user.businessId) return null;
      
      const bizId = user.businessId;

      // 1. Fetch Business
      const businessData: Business = await callApi(
        `/api/business/${bizId}`,
        "GET",
      );

      if (!businessData) return null;

      // 2. Fetch Locations
      const locationsData = await callApi(
        `/api/locations?businessId=${bizId}`,
        "GET",
      );

      // 3. Fetch Staff
      const staffData = await callApi(
        `/api/staff/staff-list?businessId=${bizId}&ignoreLocation=true`,
        "GET",
      );

      // 4. Fetch Location Schedules (Opening Hours)
      const hoursData: LocationsOpeningHours = {};

      locationsData.forEach((location: any, index: number) => {
        const locId = String(location?._id || index);
        const weekly = location?.weeklyWorkingHours || {};

        const mapDay = (day: any, defaultDayOff: boolean) => {
          const isDayOff =
            typeof day?.isDayOff === "boolean"
              ? day.isDayOff
              : defaultDayOff;

          return {
            isDayOff,
            workTime: isDayOff
              ? { start: null, end: null }
              : {
                  start: day?.workTime?.start || null,
                  end: day?.workTime?.end || null,
                },
          };
        };

        hoursData[locId] = {
          monday: mapDay(weekly?.monday, false),
          tuesday: mapDay(weekly?.tuesday, false),
          wednesday: mapDay(weekly?.wednesday, false),
          thursday: mapDay(weekly?.thursday, false),
          friday: mapDay(weekly?.friday, false),
          saturday: mapDay(weekly?.saturday, true),
          sunday: mapDay(weekly?.sunday, true),
        };
      });

      return {
        role: "business" as UserRole,
        businessInfo: businessData,
        locations: locationsData,
        staff: staffData,
        hours: hoursData,
      };
    },
    enabled: !!user?.businessId,
  });

  useEffect(() => {
    if (fetchedData) {
      setOnboardingData((prev) => ({ ...prev, ...fetchedData }));
    }
  }, [fetchedData]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <RoleSelection
            onNext={(role: "personal" | "business") => {
              setOnboardingData((prev) => ({ ...prev, role }));
              if (role === "personal") {
                router.push("/dashboard");
              } else {
                nextStep();
              }
            }}
          />
        );
      case 2:
        return (
          <BusinessInfoStep
            initialData={onboardingData.businessInfo}
            onNext={(info: Business) => {
              setOnboardingData((prev) => ({ ...prev, businessInfo: info }));
              nextStep();
            }}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <LocationsSetup
            initialData={onboardingData.locations}
            onNext={(locations: Location[]) => {
              setOnboardingData((prev) => ({ ...prev, locations }));
              nextStep();
            }}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <StaffSetup
            locations={onboardingData.locations}
            initialData={onboardingData.staff}
            onNext={(staff: Staff[]) => {
              setOnboardingData((prev) => ({ ...prev, staff }));
              nextStep();
            }}
            onBack={prevStep}
          />
        );
      case 5:
        return (
          <LocationHoursSetup
            locations={onboardingData.locations}
            staff={onboardingData.staff}
            initialData={onboardingData.hours}
            onNext={(hours: LocationsOpeningHours) => {
              setOnboardingData((prev) => ({ ...prev, hours }));
              router.push("/pricing");
            }}
            onBack={prevStep}
          />
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-6">
      <div className="w-full max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  currentStep >= step
                    ? "bg-primary text-white scale-110 shadow-lg"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content with framer-motion */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
