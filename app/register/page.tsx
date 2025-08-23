"use client";

import type React from "react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
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
import { Building2, User, Sparkles } from "lucide-react";

type AccountType = "personal" | "business" | null;

export default function RegisterPage() {
  const { t } = useTranslation();
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    repassword: "",
    // Personal fields
    firstName: "",
    lastName: "",
    phone: "",
    // Business fields
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    businessAddress: "",
    taxId: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(t("Form submitted:"), { accountType, ...formData });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-l from-accent/40 to-primary/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative w-full max-w-lg space-y-8 z-10">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-br from-primary to-accent rounded-3xl shadow-2xl">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
            {t("Join the Future")}
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            {t("Choose your path and unlock endless possibilities")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card
            className={`cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl border-2 backdrop-blur-sm ${
              accountType === "personal"
                ? "ring-4 ring-primary/50 border-primary bg-gradient-to-br from-primary/10 to-accent/5 shadow-2xl"
                : "hover:border-accent/50 hover:bg-gradient-to-br hover:from-accent/5 hover:to-primary/5 bg-card/60"
            }`}
            onClick={() => setAccountType("personal")}
          >
            <CardContent className="flex flex-col items-center p-8 space-y-4">
              <div
                className={`p-4 rounded-2xl transition-all duration-300 ${
                  accountType === "personal"
                    ? "bg-gradient-to-br from-primary to-accent text-white shadow-lg"
                    : "bg-muted/50 text-muted-foreground hover:bg-gradient-to-br hover:from-primary/20 hover:to-accent/20"
                }`}
              >
                <User className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-xl">{t("Personal")}</h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                {t("Perfect for individuals and creative projects")}
              </p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl border-2 backdrop-blur-sm ${
              accountType === "business"
                ? "ring-4 ring-primary/50 border-primary bg-gradient-to-br from-primary/10 to-accent/5 shadow-2xl"
                : "hover:border-accent/50 hover:bg-gradient-to-br hover:from-accent/5 hover:to-primary/5 bg-card/60"
            }`}
            onClick={() => setAccountType("business")}
          >
            <CardContent className="flex flex-col items-center p-8 space-y-4">
              <div
                className={`p-4 rounded-2xl transition-all duration-300 ${
                  accountType === "business"
                    ? "bg-gradient-to-br from-primary to-accent text-white shadow-lg"
                    : "bg-muted/50 text-muted-foreground hover:bg-gradient-to-br hover:from-primary/20 hover:to-accent/20"
                }`}
              >
                <Building2 className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-xl">{t("Business")}</h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                {t("Ideal for teams and organizations")}
              </p>
            </CardContent>
          </Card>
        </div>

        {accountType && (
          <Card className="border-2 shadow-2xl bg-card/70 backdrop-blur-lg border-primary/20">
            <CardHeader className="pb-8">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {accountType === "personal"
                  ? t("Personal Details")
                  : t("Business Information")}
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                {t("Complete your {{accountType}} registration below", {
                  accountType,
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="email"
                    className="text-base font-semibold text-foreground"
                  >
                    {t("Email Address")}
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
                    {t("Password")}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("Create a secure password")}
                    className="h-14 text-base border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="repassword"
                    className="text-base font-semibold text-foreground"
                  >
                    {t("Confirm Password")}
                  </Label>
                  <Input
                    id="repassword"
                    type="password"
                    placeholder={t("Confirm your password")}
                    className="h-14 text-base border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                    value={formData.repassword}
                    onChange={(e) =>
                      handleInputChange("repassword", e.target.value)
                    }
                    required
                  />
                </div>

                {/* Personal Account Fields */}
                {accountType === "personal" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label
                          htmlFor="firstName"
                          className="text-base font-semibold text-foreground"
                        >
                          {t("First Name")}
                        </Label>
                        <Input
                          id="firstName"
                          placeholder={t("First name")}
                          className="h-14 text-base border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                          value={formData.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <Label
                          htmlFor="lastName"
                          className="text-base font-semibold text-foreground"
                        >
                          {t("Last Name")}
                        </Label>
                        <Input
                          id="lastName"
                          placeholder={t("Last name")}
                          className="h-14 text-base border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                          value={formData.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="phone"
                        className="text-base font-semibold text-foreground"
                      >
                        {t("Phone Number")}
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder={t("Your phone number")}
                        className="h-14 text-base border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                      />
                    </div>
                  </>
                )}

                {/* Business Account Fields */}
                {accountType === "business" && (
                  <>
                    <div className="space-y-3">
                      <Label
                        htmlFor="businessName"
                        className="text-base font-semibold text-foreground"
                      >
                        {t("Business Name")}
                      </Label>
                      <Input
                        id="businessName"
                        placeholder={t("Your business name")}
                        className="h-14 text-base border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                        value={formData.businessName}
                        onChange={(e) =>
                          handleInputChange("businessName", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="businessEmail"
                        className="text-base font-semibold text-foreground"
                      >
                        {t("Business Email")}
                      </Label>
                      <Input
                        id="businessEmail"
                        type="email"
                        placeholder={t("Business email address")}
                        className="h-14 text-base border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                        value={formData.businessEmail}
                        onChange={(e) =>
                          handleInputChange("businessEmail", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="businessPhone"
                        className="text-base font-semibold text-foreground"
                      >
                        {t("Business Phone")}
                      </Label>
                      <Input
                        id="businessPhone"
                        type="tel"
                        placeholder={t("Business phone number")}
                        className="h-14 text-base border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                        value={formData.businessPhone}
                        onChange={(e) =>
                          handleInputChange("businessPhone", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="businessAddress"
                        className="text-base font-semibold text-foreground"
                      >
                        {t("Business Address")}
                      </Label>
                      <Input
                        id="businessAddress"
                        placeholder={t("Business address")}
                        className="h-14 text-base border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                        value={formData.businessAddress}
                        onChange={(e) =>
                          handleInputChange("businessAddress", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="taxId"
                        className="text-base font-semibold text-foreground"
                      >
                        {t("Tax ID")}
                      </Label>
                      <Input
                        id="taxId"
                        placeholder={t("Tax identification number")}
                        className="h-14 text-base border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                        value={formData.taxId}
                        onChange={(e) =>
                          handleInputChange("taxId", e.target.value)
                        }
                        required
                      />
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 rounded-xl"
                >
                  {t("Create Your Account")}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="text-center text-lg text-muted-foreground">
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
