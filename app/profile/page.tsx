"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Moon, Sun, Save, Upload } from "lucide-react";
// Премахнати са shadcn/ui Input и Label
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
// ИМПОРТИТЕ ЗА useTranslation И usePageTitle СА ПРЕМАХНАТИ
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/context/PageTitleContext";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const { setPageTitle } = usePageTitle();
  const [userData, setUserData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    image: "/placeholder-user.jpg",
  });

  useEffect(() => {
    setPageTitle(t("Profile Settings"));
    return () => {
      setPageTitle(null);
    };
  }, []);

  const [primaryColor, setPrimaryColor] = useState("#8B5A3C");

  const handleSave = () => {
    toast.success("Your profile settings have been updated successfully.");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData({ ...userData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">
              {"Profile Information"}
            </CardTitle>
            <CardDescription>
              {"Update your personal information and profile picture"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={userData.image || "/placeholder.svg"}
                  alt={`${userData.firstName} ${userData.lastName}`}
                />
                <AvatarFallback className="text-2xl">
                  {userData.firstName[0]}
                  {userData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    {"Upload Photo"}
                  </Button>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageUpload}
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  {"JPG, PNG or GIF. Max size 2MB."}
                </p>
              </div>
            </div>

            <Separator />

            {/* Name Fields - Използва LabeledInput */}
            <div className="grid gap-4 sm:grid-cols-2">
              <LabeledInput
                id="firstName"
                label={"First Name"}
                value={userData.firstName}
                onChange={(e) =>
                  setUserData({ ...userData, firstName: e.target.value })
                }
                placeholder={"Enter your first name"}
              />
              <LabeledInput
                id="lastName"
                label={"Last Name"}
                value={userData.lastName}
                onChange={(e) =>
                  setUserData({ ...userData, lastName: e.target.value })
                }
                placeholder={"Enter your last name"}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Email - Използва LabeledInput */}
              <LabeledInput
                id="email"
                label={"Email"}
                type="email"
                value={userData.email}
                onChange={(e) =>
                  setUserData({ ...userData, email: e.target.value })
                }
                placeholder={"Enter your email address"}
              />
              <LabeledInput
                id="phone"
                label={"Phone"}
                type="tel"
                value={userData.phone}
                onChange={(e) =>
                  setUserData({ ...userData, phone: e.target.value })
                }
                placeholder={"Enter your phone number"}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">
              {"Appearance"}
            </CardTitle>
            <CardDescription>
              {"Customize the look and feel of your application"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label htmlFor="dark-mode" className="text-base font-medium">
                  {"Dark Mode"}
                </label>
                <p className="text-sm text-muted-foreground">
                  {"Switch between light and dark themes"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Switch
                  id="dark-mode"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                />
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <Separator />

            {/* Primary Color Picker */}
            <div className="space-y-4">
              <div className="space-y-0.5">
                <label
                  htmlFor="primary-color"
                  className="text-base font-medium"
                >
                  {"Primary Color"}
                </label>
                <p className="text-sm text-muted-foreground">
                  {"Choose your preferred accent color"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {/* Използваме LabeledInput за цветния хекс код */}
                <LabeledInput
                  id="primary-color-text"
                  label={"Hex Code"}
                  type="text" // Използваме text, за да покажем hex кода
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-32"
                />
                <input
                  id="primary-color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-md border-0 p-0"
                  style={{ minWidth: "40px" }} // Фиксирана ширина за по-добър вид
                />
                <div className="flex gap-2">
                  {["#8B5A3C", "#2563EB", "#059669", "#DC2626", "#7C3AED"].map(
                    (color) => (
                      <button
                        key={color}
                        onClick={() => setPrimaryColor(color)}
                        className="h-10 w-10 rounded-md border-2 border-border transition-all hover:scale-110"
                        style={{ backgroundColor: color }}
                        aria-label={`Select ${color} as primary color`}
                      />
                    )
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {"Selected color"}:{" "}
                <span className="font-mono font-semibold">{primaryColor}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline">{"Cancel"}</Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            {"Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
