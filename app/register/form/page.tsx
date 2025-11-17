"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import callApi from "../../Api/callApi";
import { useTranslation } from "react-i18next";
import { CustomTooltip } from "@/components/customUIComponents/CustomTooltip";
import { useAuthContext } from "@/context/AuthContext";

type AccountType = "personal" | "business";

export default function RegisterFormPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const accountType = (searchParams.get("type") as AccountType) || "personal";
  const { setUser } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Setup modal now lives on /pricing page

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    repassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    businessName: "",
    businessPhone: "",
    businessAddress: "",
    taxId: "",
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
        role: accountType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone:
          accountType === "business" ? formData.businessPhone : formData.phone,
        ...(accountType === "business" && {
          businessName: formData.businessName,
        }),
      };

      await callApi("/api/auth/register", "POST", payload);

      if (accountType === "business") {
        // Silent login so Pricing page can call protected APIs
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
        router.push("/pricing?onboarding=1");
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      setError(err?.message || t("Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full flex items-center justify-center animate-in fade-in duration-500">
        <div className="relative w-full max-w-2xl">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-500 via-primary to-pink-500 rounded-3xl opacity-75 blur-sm" />
          <div className="w-full relative bg-white dark:bg-gray-900 backdrop-blur-xl rounded-3xl p-6 border border-primary/20 shadow-6xl">
            <div className="position absolute top-4 left-4">
              <CustomTooltip
                onClick={() => router.push("/register")}
                tooltipText={t("Back")}
                icon={<ArrowLeft className="hover:text-primary h-6 w-6" />}
              />
            </div>
            <div className="flex justify-center mb-4">
              <Image
                src="/AppointmantPro.png"
                alt="logo"
                width={40}
                height={40}
                className="w-10 h-auto"
              />
            </div>

            <div className="flex justify-center mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold theme-text-gradient">
                  AppointDI®
                </span>
              </div>
            </div>

            {/* Welcome text */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">
                {accountType === "personal"
                  ? t("Personal Account")
                  : t("Business Account")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("Complete your registration below")}
              </p>
            </div>

            {/* Form */}
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
                <div className="relative">
                  <LabeledInput
                    id="password"
                    label={t("Password")}
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder={t("Create a password")}
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

                <div className="relative">
                  <LabeledInput
                    id="repassword"
                    label={t("Confirm Password")}
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.repassword}
                    onChange={(e) =>
                      handleInputChange("repassword", e.target.value)
                    }
                    placeholder={t("Confirm password")}
                    className="!bg-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={
                      showConfirmPassword
                        ? t("Hide password")
                        : t("Show password")
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LabeledInput
                  id="firstName"
                  label={t("First Name")}
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  placeholder={t("First name")}
                  onClear={() => handleInputChange("firstName", "")}
                  className="!bg-transparent"
                  required
                />
                <LabeledInput
                  id="lastName"
                  label={t("Last Name")}
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  placeholder={t("Last name")}
                  onClear={() => handleInputChange("lastName", "")}
                  className="!bg-transparent"
                  required
                />
              </div>

              {accountType === "personal" && (
                <LabeledInput
                  id="phone"
                  label={t("Phone Number")}
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder={t("Your phone number")}
                  onClear={() => handleInputChange("phone", "")}
                  className="!bg-transparent"
                />
              )}

              {accountType === "business" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <LabeledInput
                      id="businessName"
                      label={t("Business Name")}
                      value={formData.businessName}
                      onChange={(e) =>
                        handleInputChange("businessName", e.target.value)
                      }
                      placeholder={t("Your business name")}
                      onClear={() => handleInputChange("businessName", "")}
                      className="!bg-transparent"
                      required
                    />
                    <LabeledInput
                      id="businessPhone"
                      label={t("Business Phone")}
                      type="tel"
                      value={formData.businessPhone}
                      onChange={(e) =>
                        handleInputChange("businessPhone", e.target.value)
                      }
                      placeholder={t("Business phone")}
                      onClear={() => handleInputChange("businessPhone", "")}
                      className="!bg-transparent"
                      required
                    />
                  </div>

                  <LabeledInput
                    id="businessAddress"
                    label={t("Business Address")}
                    value={formData.businessAddress}
                    onChange={(e) =>
                      handleInputChange("businessAddress", e.target.value)
                    }
                    placeholder={t("Business address")}
                    onClear={() => handleInputChange("businessAddress", "")}
                    className="!bg-transparent"
                  />

                  <LabeledInput
                    id="taxId"
                    label={t("Tax ID")}
                    value={formData.taxId}
                    onChange={(e) => handleInputChange("taxId", e.target.value)}
                    placeholder={t("Tax ID number")}
                    onClear={() => handleInputChange("taxId", "")}
                    className="!bg-transparent"
                  />
                </>
              )}

              {error && (
                <div className="text-xs text-red-500 font-medium">{error}</div>
              )}

              <div className="w-full flex justify-center pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  iconType="send"
                  className="rounded-full w-30 py-5 flex justify-center items-center"
                >
                  {loading ? t("Creating account...") : t("Sign up")}
                </Button>
              </div>

              <div className="mt-2 text-center text-sm text-muted-foreground">
                <span>{t("Already have an account?")} </span>
                <a
                  href="/login"
                  className="text-primary hover:text-accent font-semibold hover:underline transition-colors"
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
