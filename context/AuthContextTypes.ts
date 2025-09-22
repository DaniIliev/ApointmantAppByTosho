export type User = {
  _id: string;
  email: string;
  role: "personal" | "business" | "staff";
  firstName?: string;
  lastName?: string;
  businessId: string;
};

export type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (formData: { email: string; password: string }) => Promise<void>;
  logout: () => void;
};
