"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import {
  hasRouteAccess,
  getPlanFromName,
  type PlanType,
} from "@/lib/permissions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: ("personal" | "business" | "staff")[];
  requiredPlan?: PlanType[];
  featureName?: string;
}

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication, specific roles, or plan access
 */
export default function ProtectedRoute({
  children,
  requiredRoles,
  requiredPlan,
  featureName,
}: ProtectedRouteProps) {
  const { user } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState<string | null>(null);

  useEffect(() => {
    // Small delay to avoid flash
    const timer = setTimeout(() => setIsChecking(false), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle redirects in useEffect to avoid setState during render
  useEffect(() => {
    if (shouldRedirect) {
      router.push(shouldRedirect);
    }
  }, [shouldRedirect, router]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check authentication
  if (!user) {
    if (!shouldRedirect) {
      setShouldRedirect(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check role access
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-red-100 p-3">
                  <Lock className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-primary">Access Denied</h2>
              <p className="text-muted-foreground">
                This page is only available to{" "}
                {requiredRoles.join(", ").replace(/,([^,]*)$/, " and$1")}{" "}
                accounts.
              </p>
              <p className="text-sm text-muted-foreground">
                Your account type: <strong>{user.role}</strong>
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <Button variant="outline" onClick={() => router.back()}>
                  Go Back
                </Button>
                <Link href="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check plan access
  const userPlanType = getPlanFromName(user.subscriptionPlan || user.plan);

  // Business accounts need active subscription to access features
  if (
    user.role === "business" &&
    user.subscriptionStatus !== "active" &&
    userPlanType === "none" &&
    pathname !== "/pricing" &&
    pathname !== "/profile"
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-amber-100 p-3">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-primary">
                Subscription Required
              </h2>
              <p className="text-muted-foreground">
                Business accounts need an active subscription to access this
                feature. Choose a plan to get started.
              </p>
              <p className="text-sm text-muted-foreground">
                Subscription status:{" "}
                <strong className="capitalize">
                  {user.subscriptionStatus || "none"}
                </strong>
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <Button variant="outline" onClick={() => router.back()}>
                  Go Back
                </Button>
                <Link href="/pricing">
                  <Button className="bg-primary hover:bg-primary-dark">
                    View Plans
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requiredPlan && !requiredPlan.includes(userPlanType)) {
    return (
      <div className="flex items-center h-full justify-center px-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-amber-100 p-3">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-primary">
                Upgrade Required
              </h2>
              <p className="text-muted-foreground">
                {featureName || "This feature"} is available on{" "}
                {requiredPlan.join(", ").replace(/,([^,]*)$/, " and$1")} plans.
              </p>
              <div className="bg-muted/50 rounded-lg  space-y-2">
                <p className="text-sm text-text-primary font-medium">
                  Your current plan:{" "}
                  <span className="text-primary capitalize">
                    {userPlanType}
                  </span>
                </p>
                {requiredPlan[0] === "starter" && (
                  <ul className="text-sm text-left space-y-1 text-muted-foreground">
                    <li>✓ Up to 3 staff members</li>
                    <li>✓ Basic analytics</li>
                    <li>✓ Kanban & Task Manager</li>
                  </ul>
                )}
                {requiredPlan[0] === "professional" && (
                  <ul className="text-sm text-left space-y-1 text-muted-foreground">
                    <li>✓ Up to 10 staff members</li>
                    <li>✓ Advanced analytics</li>
                    <li>✓ SMS notifications</li>
                    <li>✓ Priority support</li>
                  </ul>
                )}
              </div>
              <div className="flex gap-2 justify-center pb-4">
                <Button variant="outline" onClick={() => router.back()}>
                  Go Back
                </Button>
                <Link href="/pricing">
                  <Button className="bg-primary hover:bg-primary-dark">
                    View Plans
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check general route access via permissions
  const access = hasRouteAccess(
    pathname,
    user.role,
    userPlanType,
    true,
    user.subscriptionStatus
  );

  if (!access.allowed) {
    if (access.reason === "subscription_required") {
      return (
        <div className="flex items-center justify-center min-h-screen px-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-amber-100 p-3">
                    <TrendingUp className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-primary">
                  Active Subscription Required
                </h2>
                <p className="text-muted-foreground">
                  Please subscribe to a plan to access business features.
                </p>
                <div className="flex gap-2 justify-center pt-2">
                  <Button variant="outline" onClick={() => router.back()}>
                    Go Back
                  </Button>
                  <Link href="/pricing">
                    <Button>View Plans</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (
      access.reason === "plan_upgrade_required" ||
      access.reason === "feature_not_available"
    ) {
      return (
        <div className="flex items-center justify-center min-h-screen px-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-amber-100 p-3">
                    <TrendingUp className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-primary">
                  Premium Feature
                </h2>
                <p className="text-muted-foreground">
                  This feature requires a plan upgrade.
                </p>
                <div className="flex gap-2 justify-center pt-2">
                  <Button variant="outline" onClick={() => router.back()}>
                    Go Back
                  </Button>
                  <Link href="/pricing">
                    <Button>Upgrade Plan</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Fallback for other access denials
    if (!shouldRedirect) {
      setShouldRedirect("/dashboard");
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Access granted
  return <>{children}</>;
}
