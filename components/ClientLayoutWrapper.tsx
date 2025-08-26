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

export default function ClientLayoutWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { user } = useAuthContext();
  useEffect(() => {
    const parts = pathname.split("/");
    const localeFromPath = parts[1];

    if (i18n.languages.includes(localeFromPath)) {
      i18n.changeLanguage(localeFromPath);
    } else {
      const fallbackLocale = Array.isArray(i18n.options.fallbackLng)
        ? i18n.options.fallbackLng[0]
        : i18n.options.fallbackLng;
      if (fallbackLocale) {
        i18n.changeLanguage(fallbackLocale);
      }
    }
  }, [pathname]);

  return (
    <I18nextProvider i18n={i18n}>
      <PageTitleProvider>
        <RightNavProvider>
          {user ? (
            <ClientLayout>{children}</ClientLayout>
          ) : (
            <GuestLayout>{children}</GuestLayout>
          )}
        </RightNavProvider>
      </PageTitleProvider>
    </I18nextProvider>
  );
}
