"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Image from "next/image";
import callApi from "../Api/callApi";
import { useAuthContext } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

interface SignInFormProps {
  onBack?: () => void;
  onSuccess?: (user: any) => void;
}

export function SignInForm({ onBack, onSuccess }: SignInFormProps) {
  const { t } = useTranslation();
  const { login } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = { email, password };
      const authedUser: any = await callApi("/api/auth/login", "POST", payload);
      login(payload);
      if (authedUser?.token) {
        localStorage.setItem("token", authedUser.token);
      }
      onSuccess?.(authedUser);
    } catch (err: any) {
      setError(err?.message || t("Authentication failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" w-full flex items-center justify-center animate-in fade-in duration-500">
      <div className="relative w-full max-w-lg">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-500 via-primary to-pink-500 rounded-3xl opacity-75 blur-sm dark:blur-xl" />
        <div className="w-full relative bg-white dark:bg-gray-900 backdrop-blur-xl rounded-3xl p-6 border border-primary/20 shadow-6xl">
          <div className="flex justify-center mb-4">
            <Image src="/AppointmantPro.png" alt="logo" width={40} height={40} className="w-10 h-auto" />
          </div>

          <div className="flex justify-center mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold theme-text-gradient">
                AppointDI®
              </span>
            </div>
          </div>

          {/* Welcome text */}
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold mb-2">{t("Welcome!")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("Please enter your details")}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <LabeledInput
                id="email"
                label={t("Email")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("Email") || "Email"}
                onClear={() => setEmail("")}
                className="!bg-transparent"
                required
              />
            </div>

            <div className="relative">
              <LabeledInput
                id="password"
                label={t("Password")}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("Password") || "Password"}
                className="!bg-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={
                  showPassword ? t("Hide password") : t("Show password")
                }
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {error && (
              <div className="text-xs text-red-500 font-medium -mt-2">
                {error}
              </div>
            )}

            <div className="w-full flex justify-center">
              <Button
                type="submit"
                disabled={loading}
                iconType="send"
                className="rounded-full w-30 py-5 flex justify-center items-center"
              >
                {loading ? t("Logging in...") : t("Log in")}
              </Button>
            </div>

            <div className="text-center">
              <a
                href="/forgot-password"
                className="text-sm text-foreground hover:text-primary transition-colors"
              >
                {t("Forgot password?")}
              </a>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <span>Don&apos;t have an account? </span>
              <a
                href="/register"
                className="text-primary hover:text-accent font-semibold hover:underline transition-colors"
              >
                Create one here
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default SignInForm;
