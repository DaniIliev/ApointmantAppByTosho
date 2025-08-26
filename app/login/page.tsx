"use client";

import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogIn } from "lucide-react";
import callApi from "../Api/callApi";
import { useAuthContext } from "@/context/AuthContext";

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
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-br from-primary to-accent rounded-3xl shadow-2xl">
              <LogIn className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
            {t("Welcome Back")} {/* Wrap text */}
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            {t("Sign in to continue your journey")}
          </p>
        </div>

        <Card className="border-2 shadow-2xl bg-card/70 backdrop-blur-lg border-primary/20">
          <CardHeader className="pb-8">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("Sign In")} {/* Wrap text */}
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {t("Enter your credentials to access your account")}{" "}
              {/* Wrap text */}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="text-base font-semibold text-foreground"
                >
                  {t("Email Address")} {/* Wrap text */}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("Enter your email address")}
                  className="h-14 text-base border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="password"
                  className="text-base font-semibold text-foreground"
                >
                  {t("Password")} {/* Wrap text */}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("Enter your password")}
                  className="h-14 text-base border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  required
                />
              </div>

              <div className="text-right">
                <a
                  href="/forgot-password"
                  className="text-primary hover:text-accent font-medium hover:underline transition-all duration-300"
                >
                  {t("Forgot your password?")} {/* Wrap text */}
                </a>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 rounded-xl"
              >
                {t("Sign In")} {/* Wrap text */}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-lg text-muted-foreground">
          {t("Don't have an account?")} {/* Wrap text */}
          <a
            href="/register"
            className="text-primary hover:text-accent font-bold hover:underline transition-all duration-300"
          >
            {t("Create one here")} {/* Wrap text */}
          </a>
        </div>
      </div>
    </div>
  );
}
