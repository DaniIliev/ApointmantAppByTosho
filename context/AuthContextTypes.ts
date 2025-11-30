import { UserRole } from "@/lib/permissions";

export type User = {
  _id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  businessId: string;
  profilePictureUrl?: string;
  primaryColor?: string;
  theme?: "light" | "dark";

  // Subscription fields from database
  subscriptionPlan?: string; // "Starter_Monthly", "Professional_Annual", "Enterprise_Monthly", "none"
  subscriptionStatus?:
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "incomplete"
    | "none";
  subscriptionBusinessId?: string;
  subscriptionActivatedAt?: string;
  subscriptionCurrentPeriodEnd?: string;

  // Computed fields for easier access
  plan?: string; // Kept for backward compatibility
  planType?: "free" | "starter" | "professional" | "enterprise"; // Normalized plan type
};

export type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (formData: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  // updateUser: (updatedData: Partial<User>) => void;
};
