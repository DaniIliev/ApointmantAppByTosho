"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, User } from "./AuthContextTypes";
import { jwtDecode } from "jwt-decode";
import { findUserByID } from "@/app/Api/services/userService";
import callApi from "@/app/Api/callApi";
import { redirect } from "next/navigation";
import LoadingBackdrop from "@/components/ui/LoadingBackdrop";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (shouldRedirect) {
      redirect("/dashboard");
    }
  }, [shouldRedirect]);

  const login = async (formData: { email: string; password: string }) => {
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
      };
      const authedUser: any = await callApi("/api/auth/login", "POST", payload);

      setToken(authedUser.token);
      localStorage.setItem("token", authedUser.token);

      const decodedUser = jwtDecode<any>(authedUser.token);
      if (decodedUser && decodedUser._id) {
        findUserByID(decodedUser._id)
          .then((fetchedUser) => {
            setUser(fetchedUser);
          })
          .catch((error) => {
            console.error("Error fetching user after login:", error);
            setUser(null);
          });
      }
      setShouldRedirect(true);
    } catch (error) {
      console.error("Invalid token:", error);
      setUser(null);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    redirect("login");
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
            redirect("/login");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          logout();
          setIsLoading(false);
          redirect("/login");
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
