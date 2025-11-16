"use client";

import React, { useEffect, useState } from "react";
import PricingSection from "@/components/Pricing/PricingSection";
import BusinessSetupModal from "@/components/BusinessSetup/BusinessSetupModal";
import { useSearchParams } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

export default function PricingPage() {
  const params = useSearchParams();
  const onboarding = params.get("onboarding") === "1";
  const [openSetup, setOpenSetup] = useState(false);
  const { user } = useAuthContext();

  useEffect(() => {
    if (onboarding) setOpenSetup(true);
  }, [onboarding]);

  return (
    <div className="min-h-screen bg-background">
      <PricingSection />
      <BusinessSetupModal
        open={openSetup}
        onOpenChange={setOpenSetup}
        businessId={user?.businessId}
      />
    </div>
  );
}
