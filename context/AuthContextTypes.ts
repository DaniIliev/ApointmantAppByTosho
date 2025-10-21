export type User = {
  _id: string;
  email: string;
  role: "personal" | "business" | "staff";
  firstName?: string;
  lastName?: string;
  phone?: string;
  businessId: string;
  profilePictureUrl?: string; // Променено от 'image' на 'profilePictureUrl' за консистентност с бекенда
  primaryColor?: string; // Добавено
};

export type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (formData: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  // updateUser: (updatedData: Partial<User>) => void;
};
