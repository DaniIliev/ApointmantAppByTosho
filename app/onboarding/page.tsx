"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import RoleSelection from "./steps/RoleSelection";
import BusinessInfoStep from "./steps/BusinessInfo";
import LocationsSetup from "./steps/LocationsSetup";
import StaffSetup, { type Staff } from "./steps/StaffSetup";
import HoursSetup from "./steps/HoursSetup";
import ServicesSetup from "./steps/ServicesSetup";
import callApi from "@/app/Api/callApi";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Business,
  Location,
  Service,
  LocationsOpeningHours,
} from "@/Global/Types/types";
import { UserRole } from "@/lib/permissions";

interface OnboardingData {
  role: UserRole;
  businessInfo: Business;
  locations: Location[];
  staff: Staff[];
  hours: LocationsOpeningHours;
  services: Service[];
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
    services: [],
  });
  // Simple step orchestration
  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => Math.max(1, prev - 1));

  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.businessId || hasFetched.current) return;
      hasFetched.current = true;

      try {
        // 1. Fetch Business
        const businessData: Business = await callApi(
          `/api/business/${user.businessId}`,
          "GET",
        );

        if (businessData) {
          const bizId = businessData._id;

          // 2. Fetch Locations
          const locationsData = await callApi(
            `/api/locations?businessId=${bizId}`,
            "GET",
          );

          // 3. Fetch Staff
          const staffData = await callApi(
            `/api/staff/staff-list?businessId=${bizId}`,
            "GET",
          );

          // 4. Fetch Services
          const servicesData = await callApi(
            `/api/service?businessId=${bizId}`,
            "GET",
          );

          // 5. Fetch Location Schedules (Opening Hours)
          const hoursData: LocationsOpeningHours = {};

          // We can fetch all schedules for the business and filter for location schedules (staff: null)
          // The backend will use req.user property to filter by business
          // Fetch all schedules for the business, explicitly ignoring the x-location-id header
          const allSchedules = await callApi(
            `/api/staff-schedules?locationId=null&staffId=null`,
            "GET",
          );

          allSchedules.forEach((sch: any) => {
            // Only use location-level schedules (where staff is null) for opening hours
            // And use the location ID as the key
            const locId = sch.location?._id || sch.location;

            if (!sch.staff && locId) {
              const startDateStr = sch.startDate
                ? sch.startDate.split("T")[0]
                : new Date().toISOString().split("T")[0];
              const endDateStr = sch.endDate
                ? sch.endDate.split("T")[0]
                : new Date(
                    new Date().setFullYear(new Date().getFullYear() + 10),
                  )
                    .toISOString()
                    .split("T")[0];

              hoursData[locId] = {
                _id: sch._id,
                workTime: sch.workTime,
                isDayOff: sch.isDayOff,
                break1: sch.break1 || { start: null, end: null },
                break2: sch.break2 || { start: null, end: null },
                break3: sch.break3 || { start: null, end: null },
                startDate: startDateStr,
                endDate: endDateStr,
              } as any;
            }
          });

          setOnboardingData({
            role: "business",
            businessInfo: businessData,
            locations: locationsData,
            staff: staffData,
            hours: hoursData,
            services: servicesData,
          });
        }
      } catch (error) {
        console.error("Failed to fetch onboarding data:", error);
      }
    };

    fetchData();
  }, [user?.businessId]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <RoleSelection
            onNext={(role: "personal" | "business") => {
              setOnboardingData((prev) => ({ ...prev, role }));
              if (role === "personal") {
                // Clients might have less steps or just finish
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
          <HoursSetup
            locations={onboardingData.locations}
            staff={onboardingData.staff}
            initialData={onboardingData.hours}
            onNext={(hours: LocationsOpeningHours) => {
              setOnboardingData((prev) => ({ ...prev, hours }));
              nextStep();
            }}
            onBack={prevStep}
          />
        );
      case 6:
        return (
          <ServicesSetup
            locations={onboardingData.locations}
            staff={onboardingData.staff}
            initialData={onboardingData.services}
            onFinish={() => {
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
            {[1, 2, 3, 4, 5, 6].map((step) => (
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
              style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
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
