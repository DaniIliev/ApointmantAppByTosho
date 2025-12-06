"use client";

import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import { Lock, Crown } from "lucide-react";
import { ReactNode } from "react";
import { UserRole } from "@/lib/permissions";

interface NavigationItemGuardProps {
  feature?:
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
  requiredRoles?: UserRole[];
  children: ReactNode;
  showBadge?: boolean;
}

/**
 * NavigationItemGuard
 * Wraps navigation items and adds badges for premium features
 * Optionally hides items if user doesn't have access
 */
export function NavigationItemGuard({
  feature,
  requiredRoles,
  children,
  showBadge = true,
}: NavigationItemGuardProps) {
  const { canAccessFeature, userRole } = usePermissions();

  // Check role access
  if (requiredRoles && userRole && !requiredRoles.includes(userRole)) {
    return null; // Hide nav item if role doesn't match
  }

  // Check feature access
  const hasAccess = feature ? canAccessFeature(feature) : true;

  return (
    <div className="relative flex items-center w-full">
      {children}
      {showBadge && !hasAccess && (
        <Badge
          variant="secondary"
          className="ml-auto bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5"
        >
          <Crown className="h-3 w-3" />
        </Badge>
      )}
      {!hasAccess && (
        <Lock className="ml-2 h-3 w-3 text-muted-foreground opacity-50" />
      )}
    </div>
  );
}
