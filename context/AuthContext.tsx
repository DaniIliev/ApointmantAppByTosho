"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, User } from "./AuthContextTypes";
import { jwtDecode } from "jwt-decode";
import { findUserByID } from "@/app/Api/services/userService";
import callApi from "@/app/Api/callApi";
import { useRouter } from "next/navigation";

interface DecodedToken {
  id: string;
  _id?: string;
  role?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();

  const login = async (formData: {
    email: string;
    password?: string;
    otp?: string;
  }) => {
    try {
      let authedUser: { token: string };
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

      const decodedUser = jwtDecode<DecodedToken>(authedUser.token);
      const userId = decodedUser._id || decodedUser.id;
      if (userId) {
        findUserByID(userId, false)
          .then((fetchedUser) => {
            setUser(fetchedUser);
            if (
              !fetchedUser.role ||
              !["personal", "business", "staff", "admin", "manager"].includes(
                fetchedUser.role,
              )
            ) {
              router.push("/onboarding");
            } else {
              router.push("/dashboard");
            }
          })
          .catch((error) => {
            console.error("Error fetching user after login:", error);
            setUser(null);
            router.push("/login");
          });
      }
    } catch (error: unknown) {
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

  const refreshToken = async () => {
    try {
      const data = await callApi("/api/auth/refresh-token", "GET");
      if (data.token) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
        setUser(data.user);
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      setIsAuthLoading(true);
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const decodedUser = jwtDecode<DecodedToken>(storedToken);
          const userId = decodedUser?._id || decodedUser?.id;
          if (decodedUser && userId) {
            const fetchedUser: User = await findUserByID(userId, false);
            setUser(fetchedUser);
            setToken(storedToken);

            const isPublicRoute =
              window.location.pathname === "/" ||
              window.location.pathname === "/login" ||
              window.location.pathname === "/register" ||
              window.location.pathname.startsWith("/business/");

            if (
              !isPublicRoute &&
              (!fetchedUser.role ||
                !["personal", "business", "staff", "admin", "manager"].includes(
                  fetchedUser.role,
                ))
            ) {
              if (window.location.pathname !== "/onboarding") {
                router.push("/onboarding");
              }
            }
          } else {
            console.warn("Invalid token or missing _id in token.");
            logout();
            router.push("/login");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          logout();
          router.push("/login");
        }
      } else {
        setUser(null);
      }

      setIsAuthLoading(false);
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
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        isAuthLoading,
        login,
        logout,
        refreshToken,
      }}
    >
      {children}
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
