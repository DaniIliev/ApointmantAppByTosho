/**
 * Plan and Permission Configuration
 * Defines feature access based on user roles and subscription plans
 */

export type PlanType = "none" | "starter" | "professional" | "enterprise";
export type UserRole = "personal" | "business" | "staff" | "admin" | "manager";

export interface PlanLimits {
  maxStaff: number;
  maxAppointmentTypes: number;
  maxLocations: number;
  features: {
    analytics: boolean;
    advancedAnalytics: boolean;
    smsNotifications: boolean;
    emailNotifications: boolean;
    kanban: boolean;
    taskManager: boolean;
    multiLocation: boolean;
    apiAccess: boolean;
    customIntegrations: boolean;
    prioritySupport: boolean;
    phoneSupport: boolean;
  };
}

/**
 * Plan feature matrix
 */
export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  none: {
    maxStaff: 0,
    maxAppointmentTypes: 0,
    maxLocations: 0,
    features: {
      analytics: false,
      advancedAnalytics: false,
      smsNotifications: false,
      emailNotifications: false,
      kanban: false,
      taskManager: false,
      multiLocation: false,
      apiAccess: false,
      customIntegrations: false,
      prioritySupport: false,
      phoneSupport: false,
    },
  },
  starter: {
    maxStaff: 3,
    maxAppointmentTypes: 15,
    maxLocations: 1,
    features: {
      analytics: true,
      advancedAnalytics: false,
      smsNotifications: false,
      emailNotifications: true,
      kanban: true,
      taskManager: true,
      multiLocation: false,
      apiAccess: false,
      customIntegrations: false,
      prioritySupport: false,
      phoneSupport: false,
    },
  },
  professional: {
    maxStaff: 10,
    maxAppointmentTypes: 50,
    maxLocations: 3,
    features: {
      analytics: true,
      advancedAnalytics: true,
      smsNotifications: true,
      emailNotifications: true,
      kanban: true,
      taskManager: true,
      multiLocation: true,
      apiAccess: false,
      customIntegrations: false,
      prioritySupport: true,
      phoneSupport: false,
    },
  },
  enterprise: {
    maxStaff: -1, // unlimited
    maxAppointmentTypes: -1, // unlimited
    maxLocations: -1, // unlimited
    features: {
      analytics: true,
      advancedAnalytics: true,
      smsNotifications: true,
      emailNotifications: true,
      kanban: true,
      taskManager: true,
      multiLocation: true,
      apiAccess: true,
      customIntegrations: true,
      prioritySupport: true,
      phoneSupport: true,
    },
  },
};

/**
 * Route access configuration based on roles
 */
export interface RoutePermission {
  path: string;
  allowedRoles: UserRole[];
  requiresAuth: boolean;
  requiredPlan?: PlanType[];
  requiredFeature?: keyof PlanLimits["features"];
}

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Public routes (no authentication required)
  {
    path: "/",
    allowedRoles: ["personal", "business", "staff", "manager"],
    requiresAuth: false,
  },
  {
    path: "/home",
    allowedRoles: ["personal", "business", "staff", "manager"],
    requiresAuth: false,
  },
  {
    path: "/about",
    allowedRoles: ["personal", "business", "staff", "manager"],
    requiresAuth: false,
  },
  {
    path: "/blog",
    allowedRoles: ["personal", "business", "staff", "manager"],
    requiresAuth: false,
  },
  {
    path: "/for-business",
    allowedRoles: ["personal", "business", "staff", "manager"],
    requiresAuth: false,
  },
  {
    path: "/pricing",
    allowedRoles: ["personal", "business", "staff", "manager"],
    requiresAuth: false,
  },
  {
    path: "/login",
    allowedRoles: ["personal", "business", "staff", "manager"],
    requiresAuth: false,
  },
  {
    path: "/register",
    allowedRoles: ["personal", "business", "staff", "manager"],
    requiresAuth: false,
  },

  // Business owner only routes
  {
    path: "/dashboard",
    allowedRoles: ["business", "staff", "manager"],
    requiresAuth: true,
  },
  {
    path: "/staff",
    allowedRoles: ["business", "manager"],
    requiresAuth: true,
  },
  {
    path: "/schedule",
    allowedRoles: ["business", "staff", "manager"],
    requiresAuth: true,
  },
  {
    path: "/appointment-types",
    allowedRoles: ["business", "manager"],
    requiresAuth: true,
  },
  {
    path: "/business",
    allowedRoles: ["business", "manager"],
    requiresAuth: true,
  },
  {
    path: "/performance",
    allowedRoles: ["business", "staff", "manager"],
    requiresAuth: true,
    requiredFeature: "analytics",
  },
  {
    path: "/kanban",
    allowedRoles: ["business", "staff", "manager"],
    requiresAuth: true,
    requiredFeature: "kanban",
    requiredPlan: ["starter", "professional", "enterprise"],
  },
  {
    path: "/taskManager",
    allowedRoles: ["business", "staff", "manager"],
    requiresAuth: true,
    requiredFeature: "taskManager",
    requiredPlan: ["starter", "professional", "enterprise"],
  },

  // Shared authenticated routes (all authenticated users)
  {
    path: "/profile",
    allowedRoles: ["personal", "business", "staff", "manager"],
    requiresAuth: true,
  },
  {
    path: "/admin/grant-access",
    allowedRoles: ["admin"],
    requiresAuth: true,
  },
];

/**
 * Helper function to check if user has access to a route
 */
export function hasRouteAccess(
  path: string,
  userRole: UserRole | null,
  userPlan: PlanType | null,
  isAuthenticated: boolean,
  subscriptionStatus?: string,
): { allowed: boolean; reason?: string } {
  // Find matching route permission
  if (userRole === "admin") {
    return { allowed: true };
  }
  const routePermission = ROUTE_PERMISSIONS.find((r) =>
    path.startsWith(r.path),
  );

  if (!routePermission) {
    return { allowed: true };
  }

  // Check authentication
  if (routePermission.requiresAuth && !isAuthenticated) {
    return { allowed: false, reason: "authentication_required" };
  }

  // Check role
  if (userRole && !routePermission.allowedRoles.includes(userRole)) {
    return { allowed: false, reason: "insufficient_role" };
  }

  // Business accounts must have an active subscription for business-only routes
  if (
    (userRole === "business" || userRole === "staff") &&
    routePermission.requiresAuth &&
    !routePermission.path.startsWith("/profile") &&
    !routePermission.path.startsWith("/pricing") &&
    (subscriptionStatus !== "active" || !userPlan || userPlan === "none")
  ) {
    return { allowed: false, reason: "subscription_required" };
  }
  // Check plan requirement
  if (
    routePermission.requiredPlan &&
    userPlan &&
    !routePermission.requiredPlan.includes(userPlan)
  ) {
    return { allowed: false, reason: "plan_upgrade_required" };
  }

  // Check feature requirement
  if (routePermission.requiredFeature && userPlan) {
    const planLimits = PLAN_LIMITS[userPlan];
    if (!planLimits.features[routePermission.requiredFeature]) {
      return { allowed: false, reason: "feature_not_available" };
    }
  }

  return { allowed: true };
}

/**
 * Check if user can add more staff
 */
export function canAddStaff(
  currentStaffCount: number,
  userPlan: PlanType,
): boolean {
  const limit = PLAN_LIMITS[userPlan].maxStaff;
  return limit === -1 || currentStaffCount < limit;
}

/**
 * Check if feature is available for plan
 */
export function hasFeatureAccess(
  feature: keyof PlanLimits["features"],
  userPlan: PlanType,
): boolean {
  return PLAN_LIMITS[userPlan].features[feature];
}

/**
 * Get plan from plan name string (from database)
 * Handles values like "Starter_Monthly", "Professional_Annual", "none"
 */
export function getPlanFromName(planName: string | undefined): PlanType {
  if (!planName || planName === "none") return "none";

  const normalized = planName.toLowerCase();
  if (normalized.includes("starter")) return "starter";
  if (normalized.includes("professional")) return "professional";
  if (normalized.includes("enterprise")) return "enterprise";

  return "none";
}

/**
 * Check if subscription is active
 */
export function isSubscriptionActive(status: string | undefined): boolean {
  return status === "active";
}
