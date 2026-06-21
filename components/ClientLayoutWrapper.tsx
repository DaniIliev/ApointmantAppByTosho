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
import Chatbot from "@/components/chatBot/Chatbot";

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

  // Show business-help chatbot for business/manager/staff users on internal pages
  const isBusinessRole = user?.role && ["business", "manager", "staff"].includes(user.role as string);
  const isPublicBusinessPage = pathname.startsWith("/business/") && !pathname.includes("/business/business-information") && !pathname.includes("/business/locations") && !pathname.includes("/business/qr-code");
  const showBusinessHelper = isBusinessRole && !isOnboarding && !isPublicBusinessPage;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
         <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <PageTitleProvider>
        <PaddingProvider>
          <RightNavProvider>
            <Toaster expand={false} visibleToasts={3} />
            {user ? (
              <ClientLayout hideLeftNav={hideLeftNav}>
                <AutoCompletePastAppointments disabled={isOnboarding} />
                {children}
                <ChangePasswordModal
                  open={showChangePassword}
                  onClose={() => setShowChangePassword(false)}
                />
                {showBusinessHelper && <Chatbot mode="business-help" />}
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
