'use client'

import React, { useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { Eye, EyeOff } from "lucide-react";
import callApi from "../Api/callApi";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "sonner";

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setUser } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

      // Silent login to start onboarding
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
      toast.error(err?.message || t("Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-2xl mx-auto z-10 flex flex-col items-center">
        <div className="relative w-full max-w-xl">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-500 via-primary to-pink-500 rounded-3xl opacity-75 blur-sm" />
          <div className="w-full relative bg-white dark:bg-gray-900 backdrop-blur-xl rounded-3xl p-8 border border-primary/20 shadow-6xl">
            <div className="flex justify-center mb-6">
              <Image
                src="/AppointmantPro.png"
                alt="logo"
                width={48}
                height={48}
                className="w-12 h-auto"
              />
            </div>

            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight mb-2">
                {t("Join AppointDI")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("Create your account and start scheduling")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <LabeledInput
                id="email"
                label={t("Email Address")}
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder={t("Enter your email address")}
                onClear={() => handleInputChange("email", "")}
                className="!bg-transparent"
                required
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LabeledInput
                  id="firstName"
                  label={t("First Name")}
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder={t("First name")}
                  onClear={() => handleInputChange("firstName", "")}
                  className="!bg-transparent"
                  required
                />
                <LabeledInput
                  id="lastName"
                  label={t("Last Name")}
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder={t("Last name")}
                  onClear={() => handleInputChange("lastName", "")}
                  className="!bg-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <LabeledInput
                    id="password"
                    label={t("Password")}
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder={t("Create a password")}
                    className="!bg-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-2 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <div className="relative">
                  <LabeledInput
                    id="repassword"
                    label={t("Confirm Password")}
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.repassword}
                    onChange={(e) => handleInputChange("repassword", e.target.value)}
                    placeholder={t("Confirm password")}
                    className="!bg-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    className="absolute right-2 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 font-medium">{error}</p>
              )}

              <div className="w-full flex justify-center pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  iconType="send"
                  className="rounded-full w-full py-6 flex justify-center items-center text-lg font-bold"
                >
                  {loading ? t("Creating account...") : t("Sign up")}
                </Button>
              </div>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted/50"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-900 px-2 text-muted-foreground">
                    {t("Or continue with")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 py-6 rounded-2xl border-primary/20 hover:bg-primary/5"
                  onClick={() => {
                    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/google`;
                  }}
                >
                  <Image src="/google.svg" alt="Google" width={20} height={20} className="w-5 h-5" />
                  <span className="font-semibold">Google</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 py-6 rounded-2xl border-primary/20 hover:bg-primary/5"
                  onClick={() => {
                    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/facebook`;
                  }}
                >
                  <Image src="/facebook.svg" alt="Facebook" width={20} height={20} className="w-5 h-5" />
                  <span className="font-semibold">Facebook</span>
                </Button>
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
