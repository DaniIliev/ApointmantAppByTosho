"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { findUserByID } from "@/app/Api/services/userService";
import { useTranslation } from "react-i18next";

interface DecodedToken {
  id: string;
  _id?: string;
  role?: string;
}

function AuthCallbackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthContext();
  const { t } = useTranslation();

  useEffect(() => {
    const token = searchParams.get("token");

    // Prevent duplicate processing using sessionStorage (survives React Strict Mode re-mounts)
    const cacheKey = `auth_processed_${token}`;
    if (!token || sessionStorage.getItem(cacheKey)) return;

    sessionStorage.setItem(cacheKey, "true");
    localStorage.setItem("token", token);

    (async () => {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        const userId = decodedToken._id || decodedToken.id;

        if (userId) {
          try {
            const fullUser = await findUserByID(userId);
            setUser(fullUser);
            toast.success(t("Successfully logged in"));

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
          } catch (error) {
            console.error("Error fetching full user data:", error);
            toast.error(t("Failed to retrieve user data"));
            router.push("/login");
          }
        } else {
          toast.error(t("auth.invalidToken"));
          router.push("/login");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        toast.error(t("Sign-in failed. Invalid token received."));
        router.push("/login");
      }
    })();
  }, [router, searchParams, setUser]);

  return null;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackPageContent />
    </Suspense>
  );
}
