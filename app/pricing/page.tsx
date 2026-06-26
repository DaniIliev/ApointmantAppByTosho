"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PricingSection from "@/components/Pricing/PricingSection";
import BusinessSetupModal from "@/components/BusinessSetup/BusinessSetupModal";
import { useSearchParams } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

function PricingPageContent() {
  const { t } = useTranslation();
  const params = useSearchParams();
  const onboarding = params.get("onboarding") === "1";
  const [openSetup, setOpenSetup] = useState(false);
  const { user } = useAuthContext();

  useEffect(() => {
    if (onboarding) setOpenSetup(true);
  }, [onboarding]);

  return (
    <div className="bg-background" aria-label={t("Pricing Page")}>
      <PricingSection />
      <BusinessSetupModal
        open={openSetup}
        onOpenChange={setOpenSetup}
        businessId={user?.businessId}
      />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={null}>
      <PricingPageContent />
    </Suspense>
  );
}
