"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { findUserByID } from "@/app/Api/services/userService";

interface DecodedToken {
  id: string;
  _id?: string;
  role?: string;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthContext();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;

    const token = searchParams.get("token");

    if (token) {
      hasProcessed.current = true;
      localStorage.setItem("token", token);
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        const userId = decodedToken._id || decodedToken.id;

        if (userId) {
          findUserByID(userId)
            .then((fullUser) => {
              setUser(fullUser);
              toast.success("Successfully logged in!");

              // Check if user needs onboarding
              if (
                !fullUser.role ||
                fullUser.role === "guest" ||
                fullUser.role === "none"
              ) {
                router.push("/onboarding");
              } else {
                router.push("/dashboard");
              }
            })
            .catch((error) => {
              console.error("Error fetching full user data:", error);
              toast.error("Authentication failed. Please try again.");
              router.push("/login");
            });
        } else {
          toast.error("Authentication failed. Invalid token.");
          router.push("/login");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        toast.error("Authentication failed. Please try again.");
        router.push("/login");
      }
    } else {
      toast.error("Authentication failed. Missing data.");
      router.push("/login");
    }
  }, [router, searchParams, setUser]);

  return null;
}
