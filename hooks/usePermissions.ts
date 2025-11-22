"use client";

import { useMemo } from "react";
import { useAuthContext } from "@/context/AuthContext";
import {
  hasFeatureAccess,
  hasRouteAccess,
  canAddStaff,
  getPlanFromName,
  PLAN_LIMITS,
  type PlanType,
} from "@/lib/permissions";

/**
 * usePermissions Hook
 * Provides easy access to permission checking throughout the app
 *
 * @example
 * ```tsx
 * const { canAccessFeature, canAccessRoute, planLimits } = usePermissions();
 *
 * if (canAccessFeature("advancedAnalytics")) {
 *   // Show advanced analytics
 * }
 * ```
 */
export function usePermissions() {
  const { user } = useAuthContext();

  const userPlanType: PlanType = useMemo(() => {
    const planName = user?.subscriptionPlan || user?.plan;
    return getPlanFromName(planName);
  }, [user?.subscriptionPlan, user?.plan]);

  const isSubscriptionActive = useMemo(() => {
    if (user?.role === "personal") return true;

    // Check if subscription status is active
    return user?.subscriptionStatus === "active";
  }, [user?.role, user?.subscriptionStatus]);

  const planLimits = useMemo(() => {
    return PLAN_LIMITS[userPlanType];
  }, [userPlanType]);

  /**
   * Check if user can access a specific feature
   */
  const canAccessFeature = (
    feature: keyof typeof PLAN_LIMITS.none.features
  ): boolean => {
    return hasFeatureAccess(feature, userPlanType);
  };

  /**
   * Check if user can access a specific route
   */
  const canAccessRoute = (
    path: string
  ): {
    allowed: boolean;
    reason?: string;
  } => {
    return hasRouteAccess(
      path,
      user?.role || null,
      userPlanType,
      !!user,
      user?.subscriptionStatus
    );
  };

  /**
   * Check if user can add more staff members
   */
  const canAddMoreStaff = (currentCount: number): boolean => {
    return canAddStaff(currentCount, userPlanType);
  };

  /**
   * Get maximum allowed staff for current plan
   */
  const maxStaff = useMemo(() => {
    return planLimits.maxStaff === -1 ? Infinity : planLimits.maxStaff;
  }, [planLimits.maxStaff]);

  /**
   * Check if user is on a specific plan or higher
   */
  const isOnPlanOrHigher = (targetPlan: PlanType): boolean => {
    const planHierarchy: PlanType[] = [
      "none",
      "starter",
      "professional",
      "enterprise",
    ];
    const currentIndex = planHierarchy.indexOf(userPlanType);
    const targetIndex = planHierarchy.indexOf(targetPlan);
    return currentIndex >= targetIndex;
  };

  /**
   * Get user's current plan type
   */
  const currentPlan = userPlanType;

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!user;

  /**
   * Get user's role
   */
  const userRole = user?.role;

  /**
   * Check if user is business owner
   */
  const isBusinessOwner = user?.role === "business";

  /**
   * Check if user is staff member
   */
  const isStaff = user?.role === "staff";

  /**
   * Check if user is personal account
   */
  const isPersonal = user?.role === "personal";

  return {
    // User info
    user,
    userRole,
    isAuthenticated,
    isBusinessOwner,
    isStaff,
    isPersonal,

    // Plan info
    currentPlan,
    planLimits,
    isSubscriptionActive,
    maxStaff,

    // Permission checks
    canAccessFeature,
    canAccessRoute,
    canAddMoreStaff,
    isOnPlanOrHigher,
  };
}
