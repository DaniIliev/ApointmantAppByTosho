"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { I18nextProvider } from "react-i18next";
import ClientLayout from "@/components/ClientLayout";
import { PageTitleProvider } from "@/context/PageTitleContext";
import { RightNavProvider } from "@/context/RightNavContext";
import i18n from "@/i18n";
import { AuthProvider, useAuthContext } from "@/context/AuthContext";
import GuestLayout from "./GuestLayout";
import { Toaster } from "sonner";
import { PaddingProvider } from "@/context/PaddingContext";

export default function ClientLayoutWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { user } = useAuthContext();
  // Apply persisted language once on mount (avoid overriding manual selections on navigation)
  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("appLocale") : null;
    if (stored && stored !== i18n.language) {
      i18n.changeLanguage(stored);
    }
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <PageTitleProvider>
        <PaddingProvider>
          <RightNavProvider>
            {user ? (
              <ClientLayout>
                <Toaster />
                {children}
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
