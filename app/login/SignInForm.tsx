"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import callApi from "../Api/callApi";
import { useAuthContext } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { toast } from "sonner";

interface SignInFormProps {
  onBack?: () => void;
  onSuccess?: (user: any) => void;
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const { t } = useTranslation();
  const { login, user } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);
  const [otpMode, setOtpMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (otpMode) {
        // OTP login
        const payload = { email, otp: password };
        await login(payload);
      } else {
        // Normal login
        const payload = { email, password };
        await login(payload);
      }
    } catch (err: any) {
      setError(t("Login failed. Invalid email or password."));
      console.log("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSend = async (forgotEmail: string) => {
    setForgotLoading(true);
    setForgotError(null);
    try {
      await callApi("/api/auth/forgot-password", "POST", {
        email: forgotEmail,
      });
      setForgotSent(true);
      setOtpMode(true);
      setEmail(forgotEmail);
      setPassword("");
      setForgotOpen(false);
    } catch (err: any) {
      setForgotError(err?.message || t("Failed to send email"));
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center animate-in fade-in duration-700">
      <div className="relative w-full max-w-md">
        {/* Animated Background Glow */}
        <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500 via-primary to-pink-500 rounded-[2.5rem] opacity-70 blur-md dark:blur-2xl" />

        <div className="w-full relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 border border-primary/10 shadow-2xl overflow-hidden">
          {/* Top Logo */}
          <div className="flex flex-col items-center mb-8">
            <span className="theme-logo-mask" aria-hidden="true" />
            <div className="text-center">
              <h1 className="text-xl font-extrabold tracking-tight theme-text-gradient mb-1">
                {t("AppointDI®")}
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                {t("Sign in to your account")}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <LabeledInput
                  id="email"
                  label={t("Email")}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("Enter your email")}
                  onClear={() => setEmail("")}
                  required
                />
              </div>

              <div className="space-y-1.5 relative">
                <div className="relative group">
                  <LabeledInput
                    id="password"
                    label={otpMode ? t("One-time Password") : t("Password")}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      otpMode ? t("Enter 6-digit code") : t("••••••••")
                    }
                    required
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    className="text-xs font-bold text-primary hover:text-accent transition-colors hover:underline underline-offset-4"
                    onClick={() => {
                      setForgotOpen(true);
                      setForgotSent(false);
                      setForgotError(null);
                    }}
                  >
                    {t("Forgot password?")}
                  </button>
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
                t("Logging in...")
              ) : (
                <>
                  {t("Log in")}
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M4 3L7 6L4 9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </>
              )}
            </Button>

            <div className="relative my-8">
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
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                  {t("Google")}
                </span>
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
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                  {t("Facebook")}
                </span>
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              {t("Don't have an account?")}{" "}
              <a
                href="/register"
                className="text-primary hover:text-accent font-bold transition-colors hover:underline underline-offset-4"
              >
                {t("Join now")}
              </a>
            </p>
          </form>
        </div>
      </div>
      <ForgotPasswordModal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        onSend={handleForgotSend}
        loading={forgotLoading}
        error={forgotError}
        sent={forgotSent}
      />
    </div>
  );
}
export default SignInForm;
