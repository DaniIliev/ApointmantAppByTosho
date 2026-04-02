"use client";

import type React from "react";
import { useEffect, useState, useCallback, useRef } from "react";
import { Moon, Sun, Save, Upload } from "lucide-react";
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
import { useTheme as useNextTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/context/PageTitleContext";
import { User } from "@/context/AuthContextTypes";
import { useAuthContext } from "@/context/AuthContext";
import callApi from "../Api/callApi";
import { usePaletteTheme } from "@/components/ThemeProvider";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Bell, BellOff } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

// Дефиниране на наличните палитри
const AVAILABLE_PALETTES = [
  { name: "Blue (Default)", value: "theme-blue", displayColor: "#3b61c0" },
  { name: "Green", value: "theme-green", displayColor: "#4caf50" },
  { name: "Purple", value: "theme-purple", displayColor: "#8a2be2" },
  { name: "Red", value: "theme-red", displayColor: "#DC2626" },
];

export default function SettingsPage() {
  // nextTheme може да бъде undefined на сървъра.
  const { theme: nextTheme, setTheme: setNextTheme } = useNextTheme();
  const { theme: selectedPalette, setTheme: setSelectedPalette } =
    usePaletteTheme();
  const { t } = useTranslation();
  const { setPageTitle } = usePageTitle();
  const { user, token } = useAuthContext();
  const { isSubscribed, subscribeToPush, unsubscribeFromPush } = usePushNotifications();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [mounted, setMounted] = useState(false); // Флаг за успешно монтиране на клиента
  console.log("nextTheme", nextTheme);
  const initialRef = useRef<{
    firstName: string;
    lastName: string;
    phone?: string;
    primaryColor?: string;
    theme?: "light" | "dark";
  } | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [userData, setUserData] = useState<User>({
    _id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profilePictureUrl: "",
    primaryColor: "",
    businessId: "",
    role: "personal",
    mustChangePassword: false,
  });

  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!user?._id) {
        setIsLoading(false);
        return;
      }
      const response: User = await callApi(`/api/auth/user/${user._id}`, "GET");

      setUserData(response);

      if (response.primaryColor && isInitialLoad) {
        setSelectedPalette(response.primaryColor as any);
      }
      if (response.theme && isInitialLoad) {
        setNextTheme(response.theme as "light" | "dark");
      }

      if (isInitialLoad && !initialRef.current) {
        initialRef.current = {
          firstName: response.firstName || "",
          lastName: response.lastName || "",
          phone: response.phone || "",
          primaryColor: response.primaryColor,
          theme: (response as any).theme,
        };
      }
    } catch (error) {
      toast.error(t("Failed to load profile data."));
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [user, setSelectedPalette, isInitialLoad]);

  useEffect(() => {
    // Активираме mounted, след като компонентът се монтира на клиента
    setMounted(true);

    setPageTitle(t("Profile Settings"));

    if (user && isInitialLoad) {
      setNextTheme(user.theme as "light" | "dark");
      fetchUserData();
    }
    return () => {
      setPageTitle(null);
    };
  }, [setPageTitle, t, fetchUserData, user, isInitialLoad]);

  const handleSave = async () => {
    const dataToSave = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      primaryColor: selectedPalette,
      theme: nextTheme,
    };

    try {
      if (!user?._id) {
        toast.error(t("User not authenticated."));
        return;
      }

      const updatedData: User = await callApi(
        `/api/auth/user/${user._id}`,
        "PUT",
        dataToSave
      );

      setUserData((prev) => ({
        ...prev,
        ...updatedData,
      }));

      // Update baseline to the just-saved values
      initialRef.current = {
        firstName: updatedData.firstName || "",
        lastName: updatedData.lastName || "",
        phone: updatedData.phone || "",
        primaryColor: selectedPalette,
        theme: (nextTheme as "light" | "dark") || undefined,
      };
      setIsDirty(false);

      toast.success(
        t("Your profile settings have been updated successfully. 💾")
      );
    } catch (error) {
      toast.error(
        t("Error saving changes: {{message}}", {
          message:
            error instanceof Error
              ? error.message
              : t("An unknown error occurred"),
        })
      );
    }
  };

  const handleCancel = () => {
    const init = initialRef.current;
    if (!init) return;
    setUserData((prev) => ({
      ...prev,
      firstName: init.firstName,
      lastName: init.lastName,
      phone: init.phone || "",
    }));
    if (init.primaryColor) setSelectedPalette(init.primaryColor as any);
    if (init.theme) setNextTheme(init.theme);
  };

  // Track changes to show actions only when modified
  useEffect(() => {
    const init = initialRef.current;
    if (!init || !mounted) {
      setIsDirty(false);
      return;
    }
    const dirty =
      (userData.firstName || "") !== (init.firstName || "") ||
      (userData.lastName || "") !== (init.lastName || "") ||
      (userData.phone || "") !== (init.phone || "") ||
      selectedPalette !== (init.primaryColor || "theme-blue") ||
      (nextTheme as string | undefined) !== init.theme;
    setIsDirty(dirty);
  }, [
    userData.firstName,
    userData.lastName,
    userData.phone,
    selectedPalette,
    nextTheme,
    mounted,
  ]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const payload = {
      profilePicture: file,
    };

    try {
      if (!user?._id) {
        toast.error(t("User not authenticated."));
        return;
      }

      const updatedData: User = await callApi(
        `/api/auth/user/${user._id}/picture`,
        "PUT",
        payload,
        true
      );

      setUserData({
        ...userData,
        profilePictureUrl: updatedData.profilePictureUrl,
      });
      toast.success(t("Profile picture uploaded successfully! 🖼️"));
    } catch (error) {
      toast.error(
        t("Image upload failed: {{message}}", {
          message:
            error instanceof Error
              ? error.message
              : t("An unknown error occurred"),
        })
      );
    }
  };

  // Показваме loading, докато данните се зареждат ИЛИ докато mounted е false
  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  // Добавяме проверка за mounted тук, за да избегнем неактивни контроли, когато nextTheme е undefined
  const isDark = mounted ? nextTheme === "dark" : false;
  const handleToggle = (checked: boolean) =>
    setNextTheme(checked ? "dark" : "light");

  return (
    <div className="min-h-screen">
      <div className="mx-auto space-y-6">
        {/* Карта за Профилна Информация */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary text-2xl">
              {t("Profile Information")}
            </CardTitle>
            <CardDescription>
              {t("Update your personal information and profile picture")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4 pb-4">
            <div className="flex items-center gap-6">
              {/* АВАТАРЪТ Е КЛИКАЕМ */}
              <label
                htmlFor="image-upload"
                className="relative h-24 w-24 cursor-pointer group"
              >
                <Avatar className="h-full w-full">
                  <AvatarImage
                    src={userData.profilePictureUrl || "/placeholder-user.jpg"}
                    alt={`${userData.firstName} ${userData.lastName}`}
                  />
                  <AvatarFallback className="text-2xl">
                    {userData.firstName?.[0] || ""}
                    {userData.lastName?.[0] || ""}
                  </AvatarFallback>
                </Avatar>

                {/* Визуален ефект при ховър/кликане */}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Upload className="h-6 w-6 text-white" />
                </div>
              </label>

              {/* Скрит input елемент */}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleImageUpload}
              />

              {/* Текст до аватара */}
              <div className="flex-1">
                <p className="text-lg font-semibold text-text-primary">{`${userData.firstName} ${userData.lastName}`}</p>
                <p className="mt-1 text-sm text-text-primary/30">
                  {t("Click on the photo to change it.")}
                </p>
                <p className="mt-2 text-xs text-text-primary/30">
                  {t("JPG, PNG or GIF. Max size 2MB.")}
                </p>
              </div>
            </div>

            <Separator />

            {/* Полета за Име и Фамилия */}
            <div className="grid gap-4 sm:grid-cols-2">
              <LabeledInput
                id="firstName"
                label={t("First Name")}
                value={userData.firstName || ""}
                onChange={(e) =>
                  setUserData({ ...userData, firstName: e.target.value })
                }
                placeholder={t("Enter your first name")}
              />
              <LabeledInput
                id="lastName"
                label={t("Last Name")}
                value={userData.lastName || ""}
                onChange={(e) =>
                  setUserData({ ...userData, lastName: e.target.value })
                }
                placeholder={t("Enter your last name")}
              />
            </div>
            {/* Полета за Email и Телефон */}
            <div className="grid gap-4 sm:grid-cols-2">
              <LabeledInput
                id="email"
                label={t("Email")}
                type="email"
                value={userData.email}
                className="opacity-70 cursor-not-allowed"
                placeholder={t("Enter your email address")}
                onChange={() => {}}
              />
              <LabeledInput
                id="phone"
                label={t("Phone")}
                type="tel"
                value={userData.phone || ""}
                onChange={(e) =>
                  setUserData({ ...userData, phone: e.target.value })
                }
                placeholder={t("Enter your phone number")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Карта за Външен Вид */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-primary text-2xl">
              {t("Appearance")}
            </CardTitle>
            <CardDescription>
              {t("Customize the look and feel of your application")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4 pb-4">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label
                  htmlFor="dark-mode"
                  className="text-primary text-base font-medium"
                >
                  {t("Dark Mode")}
                </label>
                <p className="text-sm text-muted-foreground">
                  {t("Switch between light and dark themes")}
                </p>
              </div>

              {/* УСЛОВЕН РЕНДЪР: Използваме isDark и handleToggle, които са дефинирани с проверка за mounted */}
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Switch
                  id="dark-mode"
                  checked={isDark}
                  onCheckedChange={handleToggle}
                  // Добавяме disabled={!mounted}, за да предотвратим кликане, ако nextTheme е undefined
                  disabled={!mounted}
                />
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <Separator />

            {/* Theme Palette Picker */}
            <div className="space-y-4">
              <div className="space-y-0.5">
                <label className="text-primary font-medium">
                  {t("Color Palette")}
                </label>
                <p className="text-sm text-muted-foreground">
                  {t("Select a predefined color palette for the application")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {AVAILABLE_PALETTES.map((palette) => (
                  <button
                    key={palette.value}
                    onClick={() => setSelectedPalette(palette.value as any)}
                    className="h-10 w-10 rounded-md border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: palette.displayColor,
                      border:
                        selectedPalette === palette.value
                          ? `3px solid var(--text-primary)`
                          : `2px solid var(--border)`,
                    }}
                    aria-label={`Select ${palette.name} theme`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Карта за Нотификации */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary text-2xl flex items-center gap-2">
              <Bell className="h-6 w-6" />
              {t("Notifications")}
            </CardTitle>
            <CardDescription>
              {t("Get real-time updates about your appointments")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label
                  className="text-primary text-base font-medium"
                >
                  {t("Push Notifications")}
                </label>
                <p className="text-sm text-muted-foreground">
                  {isSubscribed 
                    ? t("You are currently receiving notifications on this device") 
                    : t("Enable notifications to stay updated")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isSubscribed ? (
                  <Bell className="h-4 w-4 text-primary" />
                ) : (
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                )}
                <Switch
                  checked={isSubscribed}
                  onCheckedChange={async (checked) => {
                    if (checked) {
                      const success = await subscribeToPush(token || "");
                      if (success) {
                        toast.success(t("Notifications enabled! 🔔"));
                      } else {
                        toast.error(t("Failed to enable notifications. Please check your browser settings."));
                      }
                    } else {
                      const success = await unsubscribeFromPush();
                      if (success) {
                        toast.success(t("Notifications disabled."));
                      }
                    }
                  }}
                  disabled={!mounted}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Card - Hidden for social login users */}
        {(!userData.authProvider || userData.authProvider === "local") && (
          <Card>
            <CardHeader>
              <CardTitle className="text-primary text-2xl">
                {t("Change Password")}
              </CardTitle>
              <CardDescription>
                {t("Update your password to keep your account secure")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 pb-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <LabeledInput
                  id="currentPassword"
                  label={t("Current Password")}
                  type="password"
                  placeholder={t("Enter current password")}
                  value={""}
                  onChange={() => {}}
                />
                <div />
                <LabeledInput
                  id="newPassword"
                  label={t("New Password")}
                  type="password"
                  placeholder={t("Enter new password")}
                  value={""}
                  onChange={() => {}}
                />
                <LabeledInput
                  id="confirmNewPassword"
                  label={t("Confirm New Password")}
                  type="password"
                  placeholder={t("Confirm new password")}
                  value={""}
                  onChange={() => {}}
                />
              </div>
              <div className="flex justify-center">
                <Button variant="outline" className="mt-2 text-primary">
                  {t("Update Password")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isDirty && (
          <div className="flex justify-center gap-4">
            <Button iconType="cancel" variant="outline" onClick={handleCancel}>
              {t("Cancel")}
            </Button>
            <Button iconType="save" onClick={handleSave}>
              {t("Save")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
