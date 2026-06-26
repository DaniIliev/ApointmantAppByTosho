"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, isAuthLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading) {
      if (user) {
        router.replace("/home");
      } else {
        router.replace("/for-business");
      }
    }
  }, [user, isAuthLoading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
