'use client'

import React, { useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import callApi from "../Api/callApi";
import { useAuthContext } from "@/context/AuthContext";

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setUser } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    repassword: "",
    firstName: "",
    lastName: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.repassword) {
      setError(t("Passwords do not match"));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      };

      await callApi("/api/auth/register", "POST", payload);

      try {
        const loginResp: any = await callApi("/api/auth/login", "POST", {
          email: formData.email,
          password: formData.password,
        });
        if (loginResp?.token) {
          localStorage.setItem("token", loginResp.token);
        }
        if (loginResp?.user) {
          setUser(loginResp.user);
        }
      } catch {}
      
      router.push("/onboarding");
    } catch (err: any) {
      setError(err?.message || t("Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-3 animate-in fade-in duration-700">
      <div className="relative w-full max-w-md">
        {/* Animated Background Glow */}
        <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500 via-primary to-pink-500 rounded-[2.5rem] opacity-70 blur-md dark:blur-2xl" />
        
        <div className="w-full relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 border border-primary/10 shadow-2xl overflow-hidden">
          {/* Top Logo */}
          <div className="flex flex-col items-center mb-8">
              <span className="theme-logo-mask" aria-hidden="true" />
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight theme-text-gradient mb-1">
                {t("Join AppointDI®")}
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                {t("Create your account and start scheduling")}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <LabeledInput
                id="email"
                label={t("Email Address")}
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder={t("Enter your email")}
                onClear={() => handleInputChange("email", "")}
                required
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LabeledInput
                  id="firstName"
                  label={t("First Name")}
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder={t("First name")}
                  required
                />
                <LabeledInput
                  id="lastName"
                  label={t("Last Name")}
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder={t("Last name")}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative group">
                  <LabeledInput
                    id="password"
                    label={t("Password")}
                    type={"password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder={t("••••••••")}
                    required
                  />
                </div>
                <div className="relative group">
                  <LabeledInput
                    id="repassword"
                    label={t("Confirm Password")}
                    type={"password"}
                    value={formData.repassword}
                    onChange={(e) => handleInputChange("repassword", e.target.value)}
                    placeholder={t("••••••••")}
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3 text-xs text-red-600 dark:text-red-400 font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl py-6 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all flex justify-center items-center gap-2 group"
            >
              {loading ? (
                t("Creating account...")
              ) : (
                <>
                  {t("Sign up")}
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M4 3L7 6L4 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </>
              )}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center px-2">
                <span className="w-full border-t border-muted/50"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="bg-white dark:bg-gray-900 px-4 text-muted-foreground/60">
                  {t("Or connect with")}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-6">
              <button
                type="button"
                className="group relative flex flex-col items-center gap-2"
                onClick={() => {
                  window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/google`;
                }}
              >
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 border border-primary/10 shadow-sm flex items-center justify-center group-hover:shadow-md group-hover:border-primary/20 transition-all group-hover:-translate-y-1">
                   <Image
                      src="/google.png"
                      alt="Google"
                      width={28}
                      height={28}
                      className="w-12 h-12 object-contain"
                    />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{t("Google")}</span>
              </button>
              
              <button
                type="button"
                className="group relative flex flex-col items-center gap-2"
                onClick={() => {
                  window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/facebook`;
                }}
              >
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 border border-primary/10 shadow-sm flex items-center justify-center group-hover:shadow-md group-hover:border-primary/20 transition-all group-hover:-translate-y-1">
                   <Image
                      src="/Facebook.png"
                      alt="Facebook"
                      width={28}
                      height={28}
                      className="w-7 h-7 object-contain"
                    />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{t("Facebook")}</span>
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t("Already have an account?")}{" "}
              <a
                href="/login"
                className="text-primary hover:text-accent font-bold transition-colors hover:underline underline-offset-4"
              >
                {t("Sign in here")}
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
  
}
