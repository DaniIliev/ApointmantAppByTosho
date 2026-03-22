"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import LoadingBackdrop from "@/components/ui/LoadingBackdrop";
import { toast } from "sonner";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthContext();

  useEffect(() => {
    const token = searchParams.get("token");
    const userString = searchParams.get("user");

    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        localStorage.setItem("token", token);
        setUser(user);
        toast.success("Successfully logged in!");
        
        // Check if user needs onboarding
        if (!user.role || user.role === "guest" || user.role === "none") {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        toast.error("Authentication failed. Please try again.");
        router.push("/login");
      }
    } else {
      toast.error("Authentication failed. Missing data.");
      router.push("/login");
    }
  }, [router, searchParams, setUser]);

  return <LoadingBackdrop loading={true} />;
}
