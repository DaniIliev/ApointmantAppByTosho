"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, User } from "./AuthContextTypes";
import { jwtDecode } from "jwt-decode";
import { findUserByID } from "@/app/Api/services/userService";
import callApi from "@/app/Api/callApi";
import LoadingBackdrop from "@/components/ui/LoadingBackdrop";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const login = async (formData: {
    email: string;
    password?: string;
    otp?: string;
  }) => {
    try {
      let authedUser: any;
      if (formData.otp) {
        // OTP login
        authedUser = await callApi("/api/auth/otp-login", "POST", {
          email: formData.email,
          otp: formData.otp,
        });
      } else {
        // Normal login
        authedUser = await callApi("/api/auth/login", "POST", {
          email: formData.email,
          password: formData.password,
        });
      }

      setToken(authedUser.token);
      localStorage.setItem("token", authedUser.token);

      const decodedUser = jwtDecode<any>(authedUser.token);
      const userId = decodedUser._id || decodedUser.id;
      if (userId) {
        findUserByID(userId)
          .then((fetchedUser) => {
            setUser(fetchedUser);
          })
          .catch((error) => {
            console.error("Error fetching user after login:", error);
            setUser(null);
          });
      }
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Invalid token:", error);
      setUser(null);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    router.push("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const decodedUser = jwtDecode<any>(storedToken);
          if (decodedUser && decodedUser.id) {
            const fetchedUser: User = await findUserByID(decodedUser.id);
            setUser(fetchedUser);
            setToken(storedToken);
          } else {
            console.warn("Invalid token or missing _id in token.");
            logout();
            setIsLoading(false);
            router.push("/login");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          logout();
          setIsLoading(false);
          router.push("/login");
        }
      } else {
        setUser(null);
        setIsLoading(false);
        // redirect("/login");
      }
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  // const updateUser = (updatedData: Partial<User>) => {
  //   setUser((prevUser) => {
  //     if (!prevUser) return null;
  //     return {
  //       ...prevUser,
  //       ...updatedData,
  //     };
  //   });
  // };
  return (
    <AuthContext.Provider value={{ user, setUser, token, login, logout }}>
      {isLoading ? <LoadingBackdrop loading={true} /> : children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
