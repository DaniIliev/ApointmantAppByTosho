// "use client";

// import { useState, useRef, useEffect, useCallback } from "react";
// import Link from "next/link";
// import { useTranslation } from "react-i18next";
// import { usePathname, useRouter } from "next/navigation";
// import {
//   User,
//   Menu,
//   X,
//   Info,
//   Bell,
//   Globe,
//   LogIn,
//   UserPlus,
//   CheckCircle,
// } from "lucide-react";
// import { usePageTitle } from "@/context/PageTitleContext";
// import useClickOutside from "@/Global/Hooks/useClickOutside";
// import { useAuthContext } from "@/context/AuthContext";
// import io from "socket.io-client";
// import callApi from "@/app/Api/callApi";
// import { toast } from "sonner";
// import { formatDistanceToNow, parseISO } from "date-fns";

// // --- Configuration Data ---
// const supportedLanguages = [
//   { code: "bg", name: "Bulgarian", flagSrc: "/Flag_of_Bulgaria.png" },
//   { code: "en", name: "English", flagSrc: "/Flag_of_the_United_Kingdom.png" },
//   { code: "de", name: "German", flagSrc: "/Flag_of_Germany.png" },
// ];

// // --- Interfaces ---
// interface AppointmentTime {
//   start: string;
//   end: string;
// }

// interface Appointment {
//   _id: string;
//   clientName: string;
//   serviceName: string;
//   appointmentTime: AppointmentTime;
// }

// interface Alert {
//   _id: string;
//   isRead: boolean;
//   message: string;
//   createdAt: string;
//   appointment: Appointment;
// }

// interface TopNavProps {
//   onToggleLeftNav: () => void;
//   isLeftNavOpen: boolean;
// }

// // --- Helper Components for Dropdowns ---

// interface DropdownProps {
//   children: React.ReactNode;
//   isOpen: boolean;
//   reference: React.RefObject<HTMLDivElement | null>;
//   alignment: "left" | "right";
// }

// const DropdownMenu = ({
//   children,
//   isOpen,
//   reference,
//   alignment,
// }: DropdownProps) => {
//   if (!isOpen) return null;
//   return (
//     <div
//       ref={reference}
//       className={`absolute mt-3 z-50 w-72 md:w-80 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-0 transition-opacity duration-300 ease-out ${
//         alignment === "right" ? "right-0" : "left-0"
//       }`}
//     >
//       {children}
//     </div>
//   );
// };

// interface AlertDropdownProps {
//   t: (key: string) => string;
//   alerts: Alert[];
//   alertsRef: React.RefObject<HTMLDivElement | null>;
//   isAlertsOpen: boolean;
//   handleAlertClick: (alert: Alert) => Promise<void>;
//   handleConfirmAppointment: (alert: Alert) => Promise<void>;
//   onClose: () => void;
// }

// const AlertsDropdown = ({
//   t,
//   alerts,
//   alertsRef,
//   isAlertsOpen,
//   handleAlertClick,
//   handleConfirmAppointment,
//   onClose,
// }: AlertDropdownProps) => {
//   const timeString = (start: string | undefined, end: string | undefined) => {
//     const formatTime = (isoString: string | undefined) =>
//       isoString
//         ? new Date(isoString).toLocaleTimeString("bg-BG", {
//             hour: "2-digit",
//             minute: "2-digit",
//           })
//         : "N/A";
//     return `${formatTime(start)} - ${formatTime(end)}`;
//   };

//   return (
//     <DropdownMenu isOpen={isAlertsOpen} reference={alertsRef} alignment="right">
//       <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar">
//         <h3 className="text-white font-extrabold text-lg mb-3 border-b border-white/10 pb-2">
//           {t("Notifications")}
//           {alerts.length > 0 && (
//             <span className="ml-2 inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
//               {alerts.filter((a) => !a.isRead).length}
//             </span>
//           )}
//         </h3>
//         {alerts.length > 0 ? (
//           alerts.map((alert) => (
//             <div
//               key={alert._id}
//               onClick={() => {
//                 handleAlertClick(alert);
//                 // Optional: route to appointment detail page here if appropriate
//                 // router.push(`/appointments/${alert.appointment._id}`);
//               }}
//               className={`mb-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
//                 !alert.isRead
//                   ? "bg-blue-600/10 border-blue-400/50 hover:bg-blue-600/20"
//                   : "bg-white/5 border-white/10 hover:bg-white/10"
//               }`}
//             >
//               <p className="text-sm font-semibold text-white/90">
//                 {alert.message}
//               </p>
//               <div className="flex justify-between items-center mt-2">
//                 <span className="text-xs text-white/60">
//                   {formatDistanceToNow(parseISO(alert.createdAt), {
//                     addSuffix: true,
//                     includeSeconds: true,
//                   })}
//                 </span>
//                 <span className="text-xs text-white/60">
//                   {timeString(
//                     alert.appointment.appointmentTime.start,
//                     alert.appointment.appointmentTime.end
//                   )}
//                 </span>
//               </div>

//               {/* Confirmation is a specific action, keep it clear */}
//               <div className="flex justify-end mt-3 border-t border-white/10 pt-2">
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation(); // Prevents alert click
//                     handleConfirmAppointment(alert);
//                     onClose();
//                   }}
//                   className="flex items-center px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-md"
//                 >
//                   <CheckCircle className="w-3 h-3 mr-1" />
//                   {t("Confirm")}
//                 </button>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p className="text-white/80 text-center py-4">
//             {t("You have no new notifications.")}
//           </p>
//         )}
//       </div>
//     </DropdownMenu>
//   );
// };

// // --- Main Component ---
// export default function TopNav({
//   onToggleLeftNav,
//   isLeftNavOpen,
// }: TopNavProps) {
//   const { t, i18n } = useTranslation();
//   const { pageTitle } = usePageTitle();
//   const { logout, user } = useAuthContext();

//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [isHelpOpen, setIsHelpOpen] = useState(false);
//   const [isAlertsOpen, setIsAlertsOpen] = useState(false);
//   const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);
//   const [alerts, setAlerts] = useState<Alert[]>([]);
//   const hasUnreadAlerts = alerts.some((alert) => !alert.isRead);

//   // --- Refs for Click Outside ---
//   const profileRef = useRef<HTMLDivElement>(null);
//   const helpRef = useRef<HTMLDivElement>(null);
//   const alertsRef = useRef<HTMLDivElement>(null);
//   const languagesRef = useRef<HTMLDivElement>(null);

//   useClickOutside(profileRef, () => setIsProfileOpen(false));
//   useClickOutside(helpRef, () => setIsHelpOpen(false));
//   useClickOutside(alertsRef, () => setIsAlertsOpen(false));
//   useClickOutside(languagesRef, () => setIsLanguagesOpen(false));

//   const router = useRouter();
//   const pathname = usePathname();

//   // --- Dropdown Toggle Logic ---
//   const closeAllDropdowns = useCallback(() => {
//     setIsProfileOpen(false);
//     setIsHelpOpen(false);
//     setIsAlertsOpen(false);
//     setIsLanguagesOpen(false);
//   }, []);

//   const toggleDropdown =
//     (setter: React.Dispatch<React.SetStateAction<boolean>>, state: boolean) =>
//     () => {
//       closeAllDropdowns();
//       setter(!state);
//     };

//   const handleSignOut = () => {
//     logout();
//     setIsProfileOpen(false);
//   };

//   const changeLanguage = (lng: string) => {
//     i18n.changeLanguage(lng);
//     // Logic to change URL path while preserving current route, if locale is part of the path structure
//     const pathParts = pathname.split("/");
//     const currentLangIndex = pathParts.indexOf(i18n.language);

//     let newPathname;
//     if (currentLangIndex !== -1) {
//       pathParts[currentLangIndex] = lng;
//       newPathname = pathParts.join("/");
//     } else {
//       // Fallback or a simpler push if locale is not explicitly in the URL segment
//       newPathname = pathname.startsWith(`/${i18n.language}`)
//         ? pathname.replace(`/${i18n.language}`, `/${lng}`)
//         : pathname;
//     }

//     router.push(newPathname);
//     setIsLanguagesOpen(false);
//   };

//   // --- Alert Handlers ---
//   const handleConfirmAppointment = async (alert: Alert) => {
//     try {
//       const appointmentId = alert.appointment._id;
//       const alertId = alert._id;

//       // Step 1: Request to confirm the appointment
//       const confirmedAppointment = await callApi(
//         `/api/appointment/${appointmentId}/status`,
//         "PUT",
//         { status: "confirmed" }
//       );

//       // If successful
//       if (confirmedAppointment) {
//         // Step 2: Request to delete the alert
//         await callApi(`/api/alerts/${alertId}`, "DELETE");

//         setAlerts((prevAlerts) =>
//           prevAlerts.filter((a) => a._id !== alert._id)
//         );

//         toast.success(t("Appointment confirmed successfully!"));
//       }
//     } catch (error) {
//       console.error("Failed to confirm appointment:", error);
//       toast.error(t("Failed to confirm appointment. Please try again."));
//     }
//   };

//   const handleAlertClick = async (alert: Alert) => {
//     if (!alert.isRead) {
//       try {
//         await callApi(`/api/alerts/${alert._id}/read`, "PUT", {});
//         setAlerts((prevAlerts) =>
//           prevAlerts.map((a) =>
//             a._id === alert._id ? { ...a, isRead: true } : a
//           )
//         );
//       } catch (error) {
//         console.error("Failed to mark alert as read:", error);
//       }
//     }
//     // No need to close alerts dropdown here, as the user might want to check other alerts.
//   };

//   // --- Socket.IO and Initial Fetch Effect ---
//   useEffect(() => {
//     if (user && (user.role === "staff" || user.role === "business")) {
//       // NOTE: Replace "http://localhost:8080" with your actual environment variable for production
//       const socket = io("http://localhost:8080");

//       socket.on("connect", () => {
//         if (user && user._id) {
//           socket.emit("joinRoom", user._id);
//         }
//       });

//       socket.on("newAppointment", (newAlert: Alert) => {
//         // Ensure new alerts are added to the top and set as unread (default from backend, but good to ensure)
//         setAlerts((prevAlerts) => [
//           { ...newAlert, isRead: false },
//           ...prevAlerts,
//         ]);
//       });

//       const fetchAlerts = async () => {
//         try {
//           const fetchedAlerts = await callApi("/api/alerts", "GET");
//           if (fetchedAlerts) {
//             setAlerts(fetchedAlerts);
//           }
//         } catch (error) {
//           console.error("Error fetching alerts:", error);
//         }
//       };
//       fetchAlerts();

//       return () => {
//         socket.disconnect();
//       };
//     }
//   }, [user]); // Depend on user to re-run on login/logout

//   // --- Render ---
//   return (
//     <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-foreground backdrop-blur-lg border-b border-white/10">
//       <div className="flex items-center justify-between px-6 py-3">
//         {/* Left Section: Logo and Nav Toggle */}
//         <div className="flex items-center space-x-4">
//           {user && (
//             <button
//               onClick={onToggleLeftNav}
//               aria-label={isLeftNavOpen ? t("Close Menu") : t("Open Menu")}
//               className="p-2 rounded-full border border-primary/20 hover:border-primary/50 text-white bg-primary hover:bg-primary-dark transition-all duration-200"
//             >
//               {isLeftNavOpen ? (
//                 <X className="w-5 h-5" />
//               ) : (
//                 <Menu className="w-5 h-5" />
//               )}
//             </button>
//           )}
//           <h1 className="text-xl font-bold">
//             <Link
//               href="/"
//               className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:opacity-90 transition-opacity"
//             >
//               {t("AppointmentPro")}
//             </Link>
//           </h1>
//         </div>

//         {/* Center Section: Page Title */}
//         <div className="hidden md:flex flex-grow justify-center">
//           {pageTitle && (
//             <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
//               {t(pageTitle)}
//             </h2>
//           )}
//         </div>

//         {/* Right Section: User/Guest Actions */}
//         {user ? (
//           <div className="flex items-center space-x-2 md:space-x-4">
//             {/* Alerts Dropdown */}
//             <div className="relative" ref={alertsRef}>
//               <button
//                 onClick={toggleDropdown(setIsAlertsOpen, isAlertsOpen)}
//                 aria-label={t("Notifications")}
//                 className={`p-2 rounded-full hover:bg-white/10 transition-colors duration-200 relative focus:outline-none focus:ring-2 focus:ring-primary ${
//                   isAlertsOpen ? "bg-white/10" : ""
//                 }`}
//               >
//                 <Bell
//                   className={`w-5 h-5 transition-colors duration-200 ${
//                     hasUnreadAlerts
//                       ? "text-red-400 animate-pulse"
//                       : "text-primary"
//                   }`}
//                 />
//                 <span>{t("Alert")}</span>
//                 {hasUnreadAlerts && (
//                   <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
//                 )}
//               </button>
//               <AlertsDropdown
//                 t={t}
//                 alerts={alerts}
//                 alertsRef={alertsRef}
//                 isAlertsOpen={isAlertsOpen}
//                 handleAlertClick={handleAlertClick}
//                 handleConfirmAppointment={handleConfirmAppointment}
//                 onClose={closeAllDropdowns}
//               />
//             </div>

//             {/* Languages Dropdown */}
//             <div className="relative" ref={languagesRef}>
//               <button
//                 onClick={toggleDropdown(setIsLanguagesOpen, isLanguagesOpen)}
//                 aria-label={t("Change Language")}
//                 className={`p-2 rounded-full hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${
//                   isLanguagesOpen ? "bg-white/10" : ""
//                 }`}
//               >
//                 <Globe className="w-5 h-5 text-primary" />
//                 <span>{t("Language")}</span>
//               </button>
//               <DropdownMenu
//                 isOpen={isLanguagesOpen}
//                 reference={languagesRef}
//                 alignment="right"
//               >
//                 <div role="menu" className="p-1">
//                   {supportedLanguages.map((lang) => (
//                     <button
//                       key={lang.code}
//                       onClick={() => changeLanguage(lang.code)}
//                       role="menuitem"
//                       className={`flex items-center w-full text-left px-4 py-2 rounded-lg transition-colors duration-150 ${
//                         i18n.language === lang.code
//                           ? "bg-primary/20 text-primary font-semibold"
//                           : "text-white/80 hover:text-white hover:bg-white/10"
//                       }`}
//                     >
//                       <img
//                         src={lang.flagSrc}
//                         alt={`${lang.name} Flag`}
//                         className="w-5 h-4 mr-3 rounded shadow-md"
//                       />
//                       {t(lang.name)}
//                     </button>
//                   ))}
//                 </div>
//               </DropdownMenu>
//             </div>

//             {/* Help Dropdown */}
//             <div className="relative" ref={helpRef}>
//               <button
//                 onClick={toggleDropdown(setIsHelpOpen, isHelpOpen)}
//                 aria-label={t("Help and Support")}
//                 className={`p-2 rounded-full hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${
//                   isHelpOpen ? "bg-white/10" : ""
//                 }`}
//               >
//                 <Info className="w-5 h-5 text-primary" />
//                 <span>{t("Info")}</span>
//               </button>
//               <DropdownMenu
//                 isOpen={isHelpOpen}
//                 reference={helpRef}
//                 alignment="right"
//               >
//                 <div role="menu" className="p-1">
//                   <Link
//                     href="/help/faq"
//                     onClick={closeAllDropdowns}
//                     role="menuitem"
//                     className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-150"
//                   >
//                     {t("FAQ")}
//                   </Link>
//                   <Link
//                     href="/help/contact"
//                     onClick={closeAllDropdowns}
//                     role="menuitem"
//                     className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-150"
//                   >
//                     {t("Contact Us")}
//                   </Link>
//                 </div>
//               </DropdownMenu>
//             </div>

//             {/* Profile Dropdown (Avatar) */}
//             <div className="relative" ref={profileRef}>
//               <button
//                 onClick={toggleDropdown(setIsProfileOpen, isProfileOpen)}
//                 aria-label={t("User Profile Menu")}
//                 className="p-2 rounded-full bg-primary hover:bg-primary-dark transition-all duration-200 border-2 border-primary/50 focus:outline-none focus:ring-2 focus:ring-accent"
//               >
//                 <User className="w-5 h-5 text-white" />
//               </button>
//               <DropdownMenu
//                 isOpen={isProfileOpen}
//                 reference={profileRef}
//                 alignment="right"
//               >
//                 <div role="menu" className="p-1">
//                   <div className="px-4 py-3 border-b border-white/10">
//                     <p className="text-sm font-semibold text-white truncate">
//                       {user?.email || t("Guest")}
//                     </p>
//                     <p className="text-xs text-white/60 capitalize">
//                       {t(user?.role || "user")}
//                     </p>
//                   </div>
//                   <Link
//                     href="/profile"
//                     onClick={closeAllDropdowns}
//                     role="menuitem"
//                     className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-150 rounded-lg"
//                   >
//                     {t("Profile Settings")}
//                   </Link>
//                   <button
//                     onClick={handleSignOut}
//                     role="menuitem"
//                     className="block w-full text-left px-4 py-2 text-red-400 hover:text-white hover:bg-red-500/20 transition-colors duration-150 rounded-lg"
//                   >
//                     {t("Sign Out")}
//                   </button>
//                 </div>
//               </DropdownMenu>
//             </div>
//           </div>
//         ) : (
//           /* Guest Actions (Login/Register) */
//           <div className="flex items-center space-x-2 md:space-x-4">
//             <Link
//               href="/login"
//               className="flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full text-white bg-primary hover:bg-primary-dark transition-colors duration-200 text-sm font-semibold shadow-md"
//             >
//               <LogIn className="w-4 h-4 mr-2" />
//               {t("Login")}
//             </Link>
//             <Link
//               href="/register"
//               className="hidden sm:flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full text-white border border-white/20 hover:border-white/50 transition-colors duration-200 text-sm font-semibold"
//             >
//               <UserPlus className="w-4 h-4 mr-2" />
//               {t("Register")}
//             </Link>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// }
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  Menu,
  X,
  Info,
  Bell,
  Globe,
  LogIn,
  UserPlus,
} from "lucide-react";
import { usePageTitle } from "@/context/PageTitleContext";
import useClickOutside from "@/Global/Hooks/useClickOutside";
import { useAuthContext } from "@/context/AuthContext";
import io from "socket.io-client";
import callApi from "@/app/Api/callApi";
import { toast } from "sonner";

// Интерфейс за аларма
interface Alert {
  _id: string;
  isRead: boolean;
  message: string;
  createdAt: string;
  appointment: {
    _id: string;
    clientName: string;
    serviceName: string;
    appointmentTime: { start: string; end: string };
  };
}

interface TopNavProps {
  onToggleLeftNav: () => void;
  isLeftNavOpen: boolean;
}

export default function TopNav({
  onToggleLeftNav,
  isLeftNavOpen,
}: TopNavProps) {
  const { t, i18n } = useTranslation();
  const { pageTitle } = usePageTitle();
  const { logout, user } = useAuthContext();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const hasUnreadAlerts = alerts.some((alert) => !alert.isRead);

  const profileRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);
  const languagesRef = useRef<HTMLDivElement>(null);

  useClickOutside(profileRef, () => setIsProfileOpen(false));
  useClickOutside(helpRef, () => setIsHelpOpen(false));
  useClickOutside(alertsRef, () => setIsAlertsOpen(false));
  useClickOutside(languagesRef, () => setIsLanguagesOpen(false));

  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = () => {
    logout();
    setIsProfileOpen(false);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Това е временно решение за Next.js 13/14 app router i18n
    // В реално приложение може да се наложи по-сложна логика за пренасочване
    const newPathname = pathname.replace(`/${i18n.language}`, `/${lng}`);
    router.push(newPathname);
    setIsLanguagesOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsHelpOpen(false);
    setIsAlertsOpen(false);
    setIsLanguagesOpen(false);
  };

  const toggleHelp = () => {
    setIsHelpOpen(!isHelpOpen);
    setIsProfileOpen(false);
    setIsAlertsOpen(false);
    setIsLanguagesOpen(false);
  };

  const toggleAlerts = () => {
    setIsAlertsOpen(!isAlertsOpen);
    setIsProfileOpen(false);
    setIsHelpOpen(false);
    setIsLanguagesOpen(false);
  };

  const toggleLanguages = () => {
    setIsLanguagesOpen(!isLanguagesOpen);
    setIsProfileOpen(false);
    setIsHelpOpen(false);
    setIsAlertsOpen(false);
  };

  const handleConfirmAppointment = async (alert: Alert) => {
    try {
      const appointmentId = alert.appointment._id;
      const alertId = alert._id;

      // Стъпка 1: Изпращаме заявка за потвърждаване на срещата
      const confirmedAppointment = await callApi(
        `/api/appointment/${appointmentId}/status`,
        "PUT",
        { status: "confirmed" }
      );

      // Ако срещата е успешно потвърдена
      if (confirmedAppointment) {
        // Стъпка 2: Изпращаме заявка за изтриване на алармата
        await callApi(`/api/alerts/${alertId}`, "DELETE");

        setAlerts((prevAlerts) =>
          prevAlerts.filter((a) => a._id !== alert._id)
        );

        toast.success(t("Appointment confirmed successfully!"));
      }
    } catch (error) {
      console.error("Failed to confirm appointment:", error);
      toast.error(t("Failed to confirm appointment. Please try again."));
    }
  };

  const handleAlertClick = async (alert: Alert) => {
    if (!alert.isRead) {
      try {
        await callApi(`/api/alerts/${alert._id}/read`, "PUT", {});
        setAlerts((prevAlerts) =>
          prevAlerts.map((a) =>
            a._id === alert._id ? { ...a, isRead: true } : a
          )
        );
      } catch (error) {
        console.error("Failed to mark alert as read:", error);
      }
    }
  };

  useEffect(() => {
    console.log("user", user);
    if (user && (user.role === "staff" || user.role === "business")) {
      const socket = io("http://localhost:8080");

      socket.on("connect", () => {
        console.log("Connected to Socket.IO server:", socket.id);
        if (user && user._id) {
          socket.emit("joinRoom", user._id);
        }
      });

      socket.on("newAppointment", (newAlert) => {
        console.log("Received new alert:", newAlert);
        setAlerts((prevAlerts) => [newAlert, ...prevAlerts]);
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket.IO disconnected:", reason);
      });

      const fetchAlerts = async () => {
        console.log("Fetching alerts from API...");
        try {
          const fetchedAlerts = await callApi("/api/alerts", "GET");
          if (fetchedAlerts) {
            setAlerts(fetchedAlerts);
          }
        } catch (error) {
          console.error("Error fetching alerts:", error);
        }
      };
      fetchAlerts();

      return () => {
        console.log("Cleaning up Socket.IO connection...");
        socket.disconnect();
      };
    }
  }, [user]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-foreground backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-2">
        <div className="flex items-center space-x-4">
          {/* {user && ( */}
          <button
            onClick={onToggleLeftNav}
            className="p-2 rounded-lg bg-primary border-white/20 hover:bg-primary-dark hover:border-white/40 transition-all duration-200"
          >
            {isLeftNavOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t("AppointmentPro")}
          </h1>
        </div>

        <div className="hidden md:flex flex-grow justify-center">
          {pageTitle && (
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
              {t(pageTitle)}
            </h2>
          )}
        </div>

        {user ? (
          // MODIFIED: Adjusted for vertical buttons with labels
          <div className="flex items-center space-x-4">
            {/* Alerts/Notifications Button with Text */}
            <div className="relative" ref={alertsRef}>
              <button
                onClick={toggleAlerts}
                className={`flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 relative ${
                  hasUnreadAlerts ? "animate-wiggle" : ""
                }`}
              >
                <Bell
                  className={`w-5 h-5 transition-colors duration-200 ${
                    hasUnreadAlerts ? "text-red-400" : "text-primary"
                  }`}
                />
                {hasUnreadAlerts && (
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-ping-once" />
                )}
                <span className="text-xs text-primary mt-1">{t("Alerts")}</span>
              </button>
              {isAlertsOpen && (
                <div className="absolute right-0 mt-2 w-72 md:w-80 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-4 max-h-96 overflow-y-auto">
                  <h3 className="text-white font-bold mb-3">
                    {t("Notifications")}
                  </h3>
                  {alerts.length > 0 ? (
                    alerts.map((alert) => (
                      <div
                        key={alert._id}
                        onClick={() => handleAlertClick(alert)}
                        className={`mb-2 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          !alert.isRead
                            ? "bg-blue-600/20 border-l-4 border-blue-400"
                            : "bg-white/5"
                        } hover:bg-white/10`}
                      >
                        <p className="text-sm font-semibold text-white/90">
                          {alert.message}
                        </p>
                        <p className="text-xs text-white/60 mt-1">
                          {t("Appointment from")}:{" "}
                          {alert.appointment.clientName}
                        </p>
                        <p className="text-xs text-white/60">
                          {t("Time")}:{" "}
                          {alert.appointment.appointmentTime.start
                            ? new Date(
                                alert.appointment.appointmentTime.start
                              ).toLocaleTimeString("bg-BG", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}{" "}
                          -{" "}
                          {alert.appointment.appointmentTime.end
                            ? new Date(
                                alert.appointment.appointmentTime.end
                              ).toLocaleTimeString("bg-BG", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </p>
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConfirmAppointment(alert);
                            }}
                            className="px-3 py-1 text-sm font-semibold text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors"
                          >
                            {t("Confirm")}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-white/80">
                      {t("You have no new notifications.")}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Language Button with Text */}
            <div className="relative" ref={languagesRef}>
              <button
                onClick={toggleLanguages}
                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-xs text-primary mt-1">
                  {t("Language")}
                </span>
              </button>
              {isLanguagesOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
                  <button
                    onClick={() => changeLanguage("bg")}
                    className="flex items-center w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <img
                      src="/Flag_of_Bulgaria.png"
                      alt="Bulgarian Flag"
                      className="w-5 h-4 mr-2"
                    />
                    {t("Bulgarian")}
                  </button>
                  <button
                    onClick={() => changeLanguage("en")}
                    className="flex items-center w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <img
                      src="/Flag_of_the_United_Kingdom.png"
                      alt="British Flag"
                      className="w-5 h-4 mr-2"
                    />
                    {t("English")}
                  </button>
                  <button
                    onClick={() => changeLanguage("de")}
                    className="flex items-center w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <img
                      src="/Flag_of_Germany.png"
                      alt="German Flag"
                      className="w-5 h-4 mr-2"
                    />
                    {t("German")}
                  </button>
                </div>
              )}
            </div>

            <div className="relative" ref={helpRef}>
              <button
                onClick={toggleHelp}
                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                <Info className="w-5 h-5 text-primary" />
                <span className="text-xs text-primary mt-1">{t("Help")}</span>
              </button>
              {isHelpOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
                  <Link
                    href="/help/faq"
                    onClick={toggleHelp}
                    className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-t-xl"
                  >
                    {t("FAQ")}
                  </Link>
                  <Link
                    href="/help/contact"
                    onClick={toggleHelp}
                    className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-b-xl"
                  >
                    {t("Contact Us")}
                  </Link>
                </div>
              )}
            </div>

            {/* Profile Button with Text */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={toggleProfile}
                aria-label={t("User Profile Menu")}
                className="p-2 rounded-full bg-primary hover:bg-primary-dark transition-all duration-200 border-2 border-primary/50 focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <User className="w-5 h-5 text-white" />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
                  <Link
                    href="/profile"
                    onClick={toggleProfile}
                    className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 rounded-t-xl"
                  >
                    {t("Profile Settings")}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 rounded-b-xl z-50"
                  >
                    {t("Sign Out")}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <div className="relative" ref={languagesRef}>
              <button
                onClick={toggleLanguages}
                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-xs text-primary mt-1">
                  {t("Language")}
                </span>
              </button>
              {isLanguagesOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
                  <button
                    onClick={() => changeLanguage("bg")}
                    className="flex items-center w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <img
                      src="/Flag_of_Bulgaria.png"
                      alt="Bulgarian Flag"
                      className="w-5 h-4 mr-2"
                    />
                    {t("Bulgarian")}
                  </button>
                  <button
                    onClick={() => changeLanguage("en")}
                    className="flex items-center w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <img
                      src="/Flag_of_the_United_Kingdom.png"
                      alt="British Flag"
                      className="w-5 h-4 mr-2"
                    />
                    {t("English")}
                  </button>
                  <button
                    onClick={() => changeLanguage("de")}
                    className="flex items-center w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <img
                      src="/Flag_of_Germany.png"
                      alt="German Flag"
                      className="w-5 h-4 mr-2"
                    />
                    {t("German")}
                  </button>
                </div>
              )}
            </div>
            {/* <Link
              href="/login"
              className="flex items-center px-4 py-2 rounded-full text-black bg-white/5 hover:bg-white/10 transition-colors duration-200"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {t("Login")}
            </Link>
            <Link
              href="/register"
              className="flex items-center px-4 py-2 rounded-full text-black bg-white/5 hover:bg-white/10 transition-colors duration-200"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {t("Register")}
            </Link> */}
          </div>
        )}
      </div>
    </nav>
  );
}
