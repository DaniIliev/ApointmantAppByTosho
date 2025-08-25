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
import callApi from "../Api/callApi";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(t("Form submitted:"), { accountType, ...formData });

    const payload = {
      email: formData.email,
      password: formData.password,
      role: accountType,
      phone:
        accountType == "business" ? formData.businessPhone : formData.phone,
      ...(accountType == "business" && {
        name: formData.businessName,
      }),
    };
    const authedUser = await callApi("/api/auth/register", "POST", payload);
    console.log("authedUser", authedUser);
  };

  return (
    <div className="min-h-[87vh] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Условно прилагаме flexbox класове, за да центрираме съдържанието, когато няма избрана форма */}
      <div
        className={`w-full max-w-7xl mx-auto z-10 
        ${
          accountType
            ? "flex flex-col lg:flex-row items-stretch lg:space-x-12"
            : "flex flex-col items-center justify-center"
        }`}
      >
        {/* Лява Колона: Избор на тип акаунт */}
        <div
          className={`flex flex-col items-center space-y-6 w-full ${
            accountType ? "lg:w-1/2" : "lg:max-w-md"
          }`}
        >
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-3xl shadow-2xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
              {t("Join the Future")}
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              {t("Choose your path and unlock endless possibilities")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
            <Card
              className={`cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl border-2 backdrop-blur-sm ${
                accountType === "personal"
                  ? "ring-4 ring-primary/50 border-primary bg-gradient-to-br from-primary/10 to-accent/5 shadow-2xl"
                  : "hover:border-accent/50 hover:bg-gradient-to-br hover:from-accent/5 hover:to-primary/5 bg-card/60"
              }`}
              onClick={() => setAccountType("personal")}
            >
              <CardContent className="flex flex-col items-center p-6 space-y-3">
                <div
                  className={`p-3 rounded-2xl transition-all duration-300 ${
                    accountType === "personal"
                      ? "bg-gradient-to-br from-primary to-accent text-white shadow-lg"
                      : "bg-muted/50 text-muted-foreground hover:bg-gradient-to-br hover:from-primary/20 hover:to-accent/20"
                  }`}
                >
                  <User className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg">{t("Personal")}</h3>
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
              <CardContent className="flex flex-col items-center p-6 space-y-3">
                <div
                  className={`p-3 rounded-2xl transition-all duration-300 ${
                    accountType === "business"
                      ? "bg-gradient-to-br from-primary to-accent text-white shadow-lg"
                      : "bg-muted/50 text-muted-foreground hover:bg-gradient-to-br hover:from-primary/20 hover:to-accent/20"
                  }`}
                >
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg">{t("Business")}</h3>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  {t("Ideal for teams and organizations")}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-md text-muted-foreground w-full max-w-md">
            {t("Already have an account?")}{" "}
            <a
              href="/login"
              className="text-primary hover:text-accent font-bold hover:underline transition-all duration-300"
            >
              {t("Sign in here")}
            </a>
          </div>
        </div>

        {/* Дясна Колона: Формата */}
        {accountType && (
          <div className="w-full lg:w-1/2 flex items-center mt-8 lg:mt-0">
            <Card className="border-2 shadow-2xl bg-card/70 backdrop-blur-lg border-primary/20 w-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {accountType === "personal"
                    ? t("Personal Details")
                    : t("Business Information")}
                </CardTitle>
                <CardDescription className="text-md text-muted-foreground">
                  {t("Complete your {{accountType}} registration below", {
                    accountType,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-semibold text-foreground"
                    >
                      {t("Email Address")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("Enter your email address")}
                      className="h-10 text-sm border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-lg"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label
                        htmlFor="password"
                        className="text-sm font-semibold text-foreground"
                      >
                        {t("Password")}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder={t("Create a password")}
                        className="h-10 text-sm border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-lg"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="repassword"
                        className="text-sm font-semibold text-foreground"
                      >
                        {t("Confirm Password")}
                      </Label>
                      <Input
                        id="repassword"
                        type="password"
                        placeholder={t("Confirm password")}
                        className="h-10 text-sm border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-lg"
                        value={formData.repassword}
                        onChange={(e) =>
                          handleInputChange("repassword", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  {accountType === "personal" && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label
                            htmlFor="firstName"
                            className="text-sm font-semibold text-foreground"
                          >
                            {t("First Name")}
                          </Label>
                          <Input
                            id="firstName"
                            placeholder={t("First name")}
                            className="h-10 text-sm border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-lg"
                            value={formData.firstName}
                            onChange={(e) =>
                              handleInputChange("firstName", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="lastName"
                            className="text-sm font-semibold text-foreground"
                          >
                            {t("Last Name")}
                          </Label>
                          <Input
                            id="lastName"
                            placeholder={t("Last name")}
                            className="h-10 text-sm border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-lg"
                            value={formData.lastName}
                            onChange={(e) =>
                              handleInputChange("lastName", e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className="text-sm font-semibold text-foreground"
                        >
                          {t("Phone Number")}
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder={t("Your phone number")}
                          className="h-10 text-sm border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-lg"
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                        />
                      </div>
                    </>
                  )}

                  {accountType === "business" && (
                    <>
                      <div className="space-y-2">
                        <Label
                          htmlFor="businessName"
                          className="text-sm font-semibold text-foreground"
                        >
                          {t("Business Name")}
                        </Label>
                        <Input
                          id="businessName"
                          placeholder={t("Your business name")}
                          className="h-10 text-sm border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-lg"
                          value={formData.businessName}
                          onChange={(e) =>
                            handleInputChange("businessName", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label
                            htmlFor="businessEmail"
                            className="text-sm font-semibold text-foreground"
                          >
                            {t("Business Email")}
                          </Label>
                          <Input
                            id="businessEmail"
                            type="email"
                            placeholder={t("Business email")}
                            className="h-10 text-sm border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-lg"
                            value={formData.businessEmail}
                            onChange={(e) =>
                              handleInputChange("businessEmail", e.target.value)
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="businessPhone"
                            className="text-sm font-semibold text-foreground"
                          >
                            {t("Business Phone")}
                          </Label>
                          <Input
                            id="businessPhone"
                            type="tel"
                            placeholder={t("Business phone")}
                            className="h-10 text-sm border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-lg"
                            value={formData.businessPhone}
                            onChange={(e) =>
                              handleInputChange("businessPhone", e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="businessAddress"
                          className="text-sm font-semibold text-foreground"
                        >
                          {t("Business Address")}
                        </Label>
                        <Input
                          id="businessAddress"
                          placeholder={t("Business address")}
                          className="h-10 text-sm border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-lg"
                          value={formData.businessAddress}
                          onChange={(e) =>
                            handleInputChange("businessAddress", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="taxId"
                          className="text-sm font-semibold text-foreground"
                        >
                          {t("Tax ID")}
                        </Label>
                        <Input
                          id="taxId"
                          placeholder={t("Tax ID number")}
                          className="h-10 text-sm border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-lg"
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
                    className="w-full h-10 text-md font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 rounded-lg"
                  >
                    {t("Create Your Account")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
