"use client";

import { ReactNode } from "react";
import { useAuthContext } from "@/context/AuthContext";
import {
  hasFeatureAccess,
  getPlanFromName,
  type PlanType,
} from "@/lib/permissions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import Link from "next/link";

interface FeatureGateProps {
  feature:
    | "analytics"
    | "advancedAnalytics"
    | "smsNotifications"
    | "emailNotifications"
    | "kanban"
    | "taskManager"
    | "multiLocation"
    | "apiAccess"
    | "customIntegrations"
    | "prioritySupport"
    | "phoneSupport";
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

/**
 * FeatureGate Component
 * Conditionally renders content based on plan feature access
 * Use this for inline feature restrictions within pages
 */
export default function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
}: FeatureGateProps) {
  const { user } = useAuthContext();

  if (!user) {
    return null;
  }

  const userPlanType = getPlanFromName(user.plan);
  const hasAccess = hasFeatureAccess(feature, userPlanType);

  if (hasAccess) {
    return <>{children}</>;
  }

  // User doesn't have access
  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return (
      <Card className="border-2 border-dashed border-muted">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            Upgrade your plan to unlock{" "}
            {feature.replace(/([A-Z])/g, " $1").toLowerCase()}.
          </p>
          <Link href="/pricing">
            <Button size="sm" className="bg-primary hover:bg-primary-dark">
              View Plans
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return null;
}
