"use client";
import { I18nextProvider } from "react-i18next";
import ClientLayout from "@/components/ClientLayout";
import { PageTitleProvider } from "@/context/PageTitleContext";
import { RightNavProvider } from "@/context/RightNavContext";
import i18n from "@/i18n";
import { useAuthContext } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import ChangePasswordModal from "@/components/customUIComponents/ChangePasswordModal";
import GuestLayout from "./GuestLayout";
import { Toaster } from "sonner";
import { PaddingProvider } from "@/context/PaddingContext";
import AutoCompletePastAppointments from "@/components/Global/AutoCompletePastAppointments";
import { usePathname } from "next/navigation";

export default function ClientLayoutWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useAuthContext();
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    if (user && user.mustChangePassword) {
      setShowChangePassword(true);
    } else {
      setShowChangePassword(false);
    }
  }, [user]);

  // Register Service Worker for PWA
  useEffect(() => {
    if (
      ("serviceWorker" in navigator && window.location.protocol === "https:") ||
      window.location.hostname === "localhost"
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered:", registration);
          })
          .catch((error) => {
            console.log("SW registration failed:", error);
          });
      });
    }
  }, []);

  // Apply persisted language once on mount
  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("appLocale") : null;
    if (stored && stored !== i18n.language) {
      i18n.changeLanguage(stored);
    }
  }, []);

  const pathname = usePathname();
  const isOnboarding = pathname === "/onboarding";
  const hasNoRole =
    !user?.role ||
    !["personal", "business", "staff", "admin", "manager"].includes(
      user.role as any,
    );
  const hideLeftNav = isOnboarding || hasNoRole;

  return (
    <I18nextProvider i18n={i18n}>
      <PageTitleProvider>
        <PaddingProvider>
          <RightNavProvider>
            {user ? (
              <ClientLayout hideLeftNav={hideLeftNav}>
                <Toaster />
                <AutoCompletePastAppointments />
                {children}
                <ChangePasswordModal
                  open={showChangePassword}
                  onClose={() => setShowChangePassword(false)}
                />
              </ClientLayout>
            ) : (
              <GuestLayout>{children}</GuestLayout>
            )}
          </RightNavProvider>
        </PaddingProvider>
      </PageTitleProvider>
    </I18nextProvider>
  );
}
