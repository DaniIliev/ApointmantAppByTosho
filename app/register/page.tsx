"use client";

import type React from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, User } from "lucide-react";

type AccountType = "personal" | "business";

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleAccountTypeSelect = (type: AccountType) => {
    router.push(`/register/form?type=${type}`);
  };

  return (
    <div className="min-h-full flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-2xl mx-auto z-10 flex flex-col items-center">
        <div className="text-center space-y-4 mb-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/AppointmantPro.png"
              alt="logo"
              width={48}
              height={48}
              className="w-12 h-auto"
            />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
            {t("Join Our Team")}
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
          <div
            className="relative cursor-pointer group"
            onClick={() => handleAccountTypeSelect("personal")}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-500 via-primary to-pink-500 rounded-3xl opacity-45 blur-sm" />
            <Card className="relative transition-all duration-500 hover:scale-105 backdrop-blur-sm bg-white dark:bg-gray-900 rounded-3xl shadow-6xl border border-primary/20">
              <CardContent className="flex flex-col items-center p-8 space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg">
                  <User className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-xl text-text-primary">
                  {t("Personal")}
                </h3>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  {t("Perfect for individuals and creative projects")}
                </p>
              </CardContent>
            </Card>
          </div>
          <div
            className="relative cursor-pointer group"
            onClick={() => handleAccountTypeSelect("business")}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-500 via-primary to-pink-500 rounded-3xl opacity-45 blur-sm" />
            <Card className="relative transition-all duration-500 hover:scale-105 backdrop-blur-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-primary/20">
              <CardContent className="flex flex-col items-center p-8 space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg">
                  <Building2 className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-xl text-text-primary">
                  {t("Business")}
                </h3>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  {t("Ideal for teams and organizations")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center text-md text-muted-foreground mt-8">
          {t("Already have an account?")}{" "}
          <a
            href="/login"
            className="text-primary hover:text-accent font-bold hover:underline transition-all duration-300"
          >
            {t("Sign in here")}
          </a>
        </div>
      </div>
    </div>
  );
}
