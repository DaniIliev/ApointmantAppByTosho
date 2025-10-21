// "use client";

// import type React from "react";
// import { useEffect, useState, useCallback } from "react";
// import { Moon, Sun, Save, Upload } from "lucide-react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Switch } from "@/components/ui/switch";
// import { Separator } from "@/components/ui/separator";
// import { toast } from "sonner";
// import { useTheme as useNextTheme } from "next-themes";
// import { Button } from "@/components/ui/button";
// import { LabeledInput } from "@/components/customUIComponents/LabeledInput";
// import { useTranslation } from "react-i18next";
// import { usePageTitle } from "@/context/PageTitleContext";
// import { User } from "@/context/AuthContextTypes";
// import { useAuthContext } from "@/context/AuthContext";
// import callApi from "../Api/callApi";
// import { usePaletteTheme } from "@/components/ThemeProvider";

// // Дефиниране на наличните палитри
// const AVAILABLE_PALETTES = [
//   { name: "Blue (Default)", value: "theme-blue", displayColor: "#3b61c0" },
//   { name: "Green", value: "theme-green", displayColor: "#4caf50" },
//   { name: "Purple", value: "theme-purple", displayColor: "#8a2be2" },
//   { name: "Red", value: "theme-red", displayColor: "#DC2626" },
// ];

// export default function SettingsPage() {
//   const { theme: nextTheme, setTheme: setNextTheme } = useNextTheme();
//   const { theme: selectedPalette, setTheme: setSelectedPalette } =
//     usePaletteTheme();
//   const { t } = useTranslation();
//   const { setPageTitle } = usePageTitle();
//   const { user } = useAuthContext();
//   const [isLoading, setIsLoading] = useState(true);
//   const [isInitialLoad, setIsInitialLoad] = useState(true);
//   const [mounted, setMounted] = useState(false); // НОВО: Флаг за успешно монтиране на клиента

//   const [userData, setUserData] = useState<User>({
//     _id: "",
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     profilePictureUrl: "",
//     primaryColor: "",
//     businessId: "",
//     role: "personal",
//   });

//   const fetchUserData = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       if (!user?._id) {
//         console.warn("User ID is missing, skipping fetchUserData.");
//         setIsLoading(false);
//         return;
//       }
//       const response: User = await callApi(`/api/auth/user/${user._id}`, "GET");

//       setUserData(response);

//       // Прилагаме темата от базата данни само при първоначално зареждане
//       if (response.primaryColor && isInitialLoad) {
//         setSelectedPalette(response.primaryColor as any);
//       }
//     } catch (error) {
//       console.error("Error fetching user data:", error);
//       toast.error("Failed to load profile data.");
//     } finally {
//       setIsLoading(false);
//       setIsInitialLoad(false); // Деактивираме флага след първото зареждане
//     }
//   }, [user, setSelectedPalette, isInitialLoad]);

//   useEffect(() => {
//     // ВАЖНО: Активираме mounted, след като компонентът се монтира на клиента
//     setMounted(true);

//     setPageTitle(t("Profile Settings"));
//     // Извикваме fetchUserData само ако user съществува И това е първо зареждане
//     if (user && isInitialLoad) {
//       fetchUserData();
//     }
//     return () => {
//       setPageTitle(null);
//     };
//   }, [setPageTitle, t, fetchUserData, user, isInitialLoad]);

//   const handleSave = async () => {
//     const dataToSave = {
//       firstName: userData.firstName,
//       lastName: userData.lastName,
//       phone: userData.phone,
//       primaryColor: selectedPalette, // Изпращаме името на класа
//       theme: nextTheme, // Изпращаме Dark/Light режима
//     };

//     try {
//       if (!user?._id) {
//         toast.error("User not authenticated.");
//         return;
//       }

//       const updatedData: User = await callApi(
//         `/api/auth/user/${user._id}`,
//         "PUT",
//         dataToSave
//       );

//       setUserData((prev) => ({
//         ...prev,
//         ...updatedData,
//       }));

//       toast.success("Your profile settings have been updated successfully. 💾");
//     } catch (error) {
//       console.error("Save error:", error);
//       toast.error(
//         `Error saving changes: ${
//           error instanceof Error ? error.message : "An unknown error occurred"
//         }`
//       );
//     }
//   };

//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const payload = {
//       profilePicture: file,
//     };

//     try {
//       if (!user?._id) {
//         toast.error("User not authenticated.");
//         return;
//       }

//       const updatedData: User = await callApi(
//         `/api/auth/user/${user._id}/picture`,
//         "PUT",
//         payload,
//         true
//       );

//       setUserData({
//         ...userData,
//         profilePictureUrl: updatedData.profilePictureUrl,
//       });
//       toast.success("Profile picture uploaded successfully! 🖼️");
//     } catch (error) {
//       console.error("Image upload error:", error);
//       toast.error(
//         `Image upload failed: ${
//           error instanceof Error ? error.message : "An unknown error occurred"
//         }`
//       );
//     }
//   };

//   // Показваме loading, докато данните се зареждат ИЛИ докато mounted е false
//   if (isLoading || !mounted) {
//     return <div className="p-8 text-center">Loading settings...</div>;
//   }

//   return (
//     <div className="min-h-screen p-4 sm:p-6 lg:p-8">
//       <div className="max-w-6xl mx-auto space-y-6">
//         {/* Карта за Профилна Информация */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="font-serif text-2xl">
//               Profile Information
//             </CardTitle>
//             <CardDescription>
//               Update your personal information and profile picture
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <div className="flex items-center gap-6">
//               {/* АВАТАРЪТ Е КЛИКАЕМ */}
//               <label
//                 htmlFor="image-upload"
//                 className="relative h-24 w-24 cursor-pointer group"
//               >
//                 <Avatar className="h-full w-full">
//                   <AvatarImage
//                     src={userData.profilePictureUrl || "/placeholder-user.jpg"}
//                     alt={`${userData.firstName} ${userData.lastName}`}
//                   />
//                   <AvatarFallback className="text-2xl">
//                     {userData.firstName?.[0] || ""}
//                     {userData.lastName?.[0] || ""}
//                   </AvatarFallback>
//                 </Avatar>

//                 {/* Визуален ефект при ховър/кликане */}
//                 <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
//                   <Upload className="h-6 w-6 text-white" />
//                 </div>
//               </label>

//               {/* Скрит input елемент */}
//               <input
//                 id="image-upload"
//                 type="file"
//                 accept="image/*"
//                 className="sr-only"
//                 onChange={handleImageUpload}
//               />

//               {/* Текст до аватара */}
//               <div className="flex-1">
//                 <p className="text-lg font-semibold">{`${userData.firstName} ${userData.lastName}`}</p>
//                 <p className="mt-1 text-sm text-muted-foreground">
//                   Кликнете върху снимката, за да я промените.
//                 </p>
//                 <p className="mt-2 text-xs text-muted-foreground">
//                   JPG, PNG или GIF. Макс. размер 2MB.
//                 </p>
//               </div>
//             </div>

//             <Separator />

//             {/* Полета за Име и Фамилия */}
//             <div className="grid gap-4 sm:grid-cols-2">
//               <LabeledInput
//                 id="firstName"
//                 label={"First Name"}
//                 value={userData.firstName || ""}
//                 onChange={(e) =>
//                   setUserData({ ...userData, firstName: e.target.value })
//                 }
//                 placeholder={"Enter your first name"}
//               />
//               <LabeledInput
//                 id="lastName"
//                 label={"Last Name"}
//                 value={userData.lastName || ""}
//                 onChange={(e) =>
//                   setUserData({ ...userData, lastName: e.target.value })
//                 }
//                 placeholder={"Enter your last name"}
//               />
//             </div>
//             {/* Полета за Email и Телефон */}
//             <div className="grid gap-4 sm:grid-cols-2">
//               <LabeledInput
//                 id="email"
//                 label={"Email"}
//                 type="email"
//                 value={userData.email}
//                 className="opacity-70 cursor-not-allowed"
//                 placeholder={"Enter your email address"}
//                 onChange={() => {}}
//               />
//               <LabeledInput
//                 id="phone"
//                 label={"Phone"}
//                 type="tel"
//                 value={userData.phone || ""}
//                 onChange={(e) =>
//                   setUserData({ ...userData, phone: e.target.value })
//                 }
//                 placeholder={"Enter your phone number"}
//               />
//             </div>
//           </CardContent>
//         </Card>

//         {/* Карта за Външен Вид */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="font-serif text-2xl">Appearance</CardTitle>
//             <CardDescription>
//               Customize the look and feel of your application
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {/* Dark Mode Toggle */}
//             <div className="flex items-center justify-between">
//               <div className="space-y-0.5">
//                 <label htmlFor="dark-mode" className="text-base font-medium">
//                   Dark Mode
//                 </label>
//                 <p className="text-sm text-muted-foreground">
//                   Switch between light and dark themes
//                 </p>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Sun className="h-4 w-4 text-muted-foreground" />
//                 <Switch
//                   id="dark-mode"
//                   checked={nextTheme === "dark"}
//                   onCheckedChange={(checked) =>
//                     setNextTheme(checked ? "dark" : "light")
//                   }
//                 />
//                 <Moon className="h-4 w-4 text-muted-foreground" />
//               </div>
//             </div>

//             <Separator />

//             {/* Theme Palette Picker */}
//             <div className="space-y-4">
//               <div className="space-y-0.5">
//                 <label className="text-base font-medium">Color Palette</label>
//                 <p className="text-sm text-muted-foreground">
//                   Select a predefined color palette for the application
//                 </p>
//               </div>
//               <div className="flex items-center gap-4">
//                 {AVAILABLE_PALETTES.map((palette) => (
//                   <button
//                     key={palette.value}
//                     onClick={() => setSelectedPalette(palette.value as any)}
//                     className="h-10 w-10 rounded-md border-2 transition-all hover:scale-110"
//                     style={{
//                       backgroundColor: palette.displayColor,
//                       border:
//                         selectedPalette === palette.value
//                           ? `3px solid var(--text-primary)`
//                           : `2px solid var(--border)`,
//                     }}
//                     aria-label={`Select ${palette.name} theme`}
//                   />
//                 ))}
//               </div>
//               <p className="text-sm text-muted-foreground">
//                 Selected palette:
//                 <span className="font-mono font-semibold">
//                   {selectedPalette}
//                 </span>
//               </p>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Save Button */}
//         <div className="flex justify-end gap-4">
//           <Button variant="outline">Cancel</Button>
//           <Button onClick={handleSave}>
//             <Save className="mr-2 h-4 w-4" />
//             Save Changes
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import type React from "react";
import { useEffect, useState, useCallback } from "react";
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
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [mounted, setMounted] = useState(false); // Флаг за успешно монтиране на клиента
  console.log("nextTheme", nextTheme);
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
    } catch (error) {
      toast.error("Failed to load profile data.");
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
        toast.error("User not authenticated.");
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

      toast.success("Your profile settings have been updated successfully. 💾");
    } catch (error) {
      toast.error(
        `Error saving changes: ${
          error instanceof Error ? error.message : "An unknown error occurred"
        }`
      );
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const payload = {
      profilePicture: file,
    };

    try {
      if (!user?._id) {
        toast.error("User not authenticated.");
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
      toast.success("Profile picture uploaded successfully! 🖼️");
    } catch (error) {
      toast.error(
        `Image upload failed: ${
          error instanceof Error ? error.message : "An unknown error occurred"
        }`
      );
    }
  };

  // Показваме loading, докато данните се зареждат ИЛИ докато mounted е false
  if (isLoading) {
    // Можем да махнем !mounted от тук, за да покажем съдържанието, докато се монтира.
    return <div className="p-8 text-center">Loading settings...</div>;
  }

  // Добавяме проверка за mounted тук, за да избегнем неактивни контроли, когато nextTheme е undefined
  const isDark = mounted ? nextTheme === "dark" : false;
  const handleToggle = (checked: boolean) =>
    setNextTheme(checked ? "dark" : "light");

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Карта за Профилна Информация */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and profile picture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                <p className="text-lg font-semibold">{`${userData.firstName} ${userData.lastName}`}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Кликнете върху снимката, за да я промените.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  JPG, PNG или GIF. Макс. размер 2MB.
                </p>
              </div>
            </div>

            <Separator />

            {/* Полета за Име и Фамилия */}
            <div className="grid gap-4 sm:grid-cols-2">
              <LabeledInput
                id="firstName"
                label={"First Name"}
                value={userData.firstName || ""}
                onChange={(e) =>
                  setUserData({ ...userData, firstName: e.target.value })
                }
                placeholder={"Enter your first name"}
              />
              <LabeledInput
                id="lastName"
                label={"Last Name"}
                value={userData.lastName || ""}
                onChange={(e) =>
                  setUserData({ ...userData, lastName: e.target.value })
                }
                placeholder={"Enter your last name"}
              />
            </div>
            {/* Полета за Email и Телефон */}
            <div className="grid gap-4 sm:grid-cols-2">
              <LabeledInput
                id="email"
                label={"Email"}
                type="email"
                value={userData.email}
                className="opacity-70 cursor-not-allowed"
                placeholder={"Enter your email address"}
                onChange={() => {}}
              />
              <LabeledInput
                id="phone"
                label={"Phone"}
                type="tel"
                value={userData.phone || ""}
                onChange={(e) =>
                  setUserData({ ...userData, phone: e.target.value })
                }
                placeholder={"Enter your phone number"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Карта за Външен Вид */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label htmlFor="dark-mode" className="text-base font-medium">
                  Dark Mode
                </label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
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
                <label className="text-base font-medium">Color Palette</label>
                <p className="text-sm text-muted-foreground">
                  Select a predefined color palette for the application
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
              <p className="text-sm text-muted-foreground">
                Selected palette:
                <span className="font-mono font-semibold">
                  {selectedPalette}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
