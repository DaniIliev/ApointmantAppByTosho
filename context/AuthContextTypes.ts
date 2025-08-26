export type User = {
  id: string;
  email: string;
  role: "personal" | "businnes";
  firstName?: string;
  lastName?: string;
};

export type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (formData: { email: string; password: string }) => Promise<void>;
  logout: () => void;
};
