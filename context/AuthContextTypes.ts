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
  theme?: "light" | "dark"; // Добавено за поддръжка на тъмна/светла тема
};

export type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (formData: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  // updateUser: (updatedData: Partial<User>) => void;
};
