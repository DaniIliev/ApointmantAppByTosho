"use client";

import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import callApi from "../Api/callApi";
import { useAuthContext } from "@/context/AuthContext"; // 👈 твоя custom input
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuthContext();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      email: formData.email,
      password: formData.password,
    };

    const authedUser: any = await callApi("/api/auth/login", "POST", payload);
    login(formData);
    console.log("authedUser", authedUser);
    localStorage.setItem("token", authedUser.token);
  };

  return (
    <div className="flex items-center justify-center p-4 relative overflow-hidden">
      <div className="relative w-full max-w-md space-y-8 z-10">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
            {t("Welcome Back")}
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            {t("Sign in to continue your journey")}
          </p>
        </div>

        <Card className="py-6 border-2 shadow-2xl bg-card/70 backdrop-blur-lg border-primary/20">
          <CardHeader className="pb-8">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("Sign In")}
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {t("Enter your credentials to access your account")}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-3">
                <LabeledInput
                  id="email"
                  label={t("Email Address")}
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder={t("Enter your email address")}
                />
              </div>

              {/* Password */}
              <div className="space-y-3">
                <LabeledInput
                  id="password"
                  label={t("Password")}
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder={t("Enter your password")}
                />
              </div>

              <div className="text-right">
                <a
                  href="/forgot-password"
                  className="text-primary hover:text-accent font-medium hover:underline transition-all duration-300"
                >
                  {t("Forgot your password?")}
                </a>
              </div>

              <Button
                type="submit"
                className="w-40 block mx-auto h-10 text-lg font-bold bg-primary hover:bg-primary-dark transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 rounded-xl"
              >
                {t("Sign In")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-lg text-muted-foreground">
          {t("Don't have an account?")}{" "}
          <a
            href="/register"
            className="text-primary hover:text-accent font-bold hover:underline transition-all duration-300"
          >
            {t("Create one here")}
          </a>
        </div>
      </div>
    </div>
  );
}
