"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { User, Menu, X, Info, Bell, Globe } from "lucide-react";
import { usePageTitle } from "@/context/PageTitleContext";
import useClickOutside from "@/Global/Hooks/useClickOutside";
import { useAuthContext } from "@/context/AuthContext";
import io from "socket.io-client";
import callApi from "@/app/Api/callApi";
import NotificationsPanel from "./NotificationsPanel";

interface AppointmentInfo {
  _id: string;
  clientName: string;
  clientPhone?: string;
  email?: string;
  appointmentTime: { start: string; end: string };
  service?: { _id: string; name: string } | string;
  status?: string;
  staff?: string;
}

interface Alert {
  _id: string;
  isRead: boolean;
  message: string;
  createdAt?: string;
  updatedAt?: string;
  type: string;
  appointment?: AppointmentInfo;
}

interface TopNavProps {
  onToggleLeftNav: () => void;
  isLeftNavOpen: boolean;
  hideLeftNav?: boolean;
}

export default function TopNav({
  onToggleLeftNav,
  isLeftNavOpen,
  hideLeftNav = false,
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

  const handleSignOut = () => {
    logout();
    setIsProfileOpen(false);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Persist selection so it survives navigation
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("appLocale", lng);
      }
    } catch {
      // Ignore persistence errors (private mode, etc.)
    }
    // Keep current path (no locale prefixes in routes structure)
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

  const normalizeAlert = (rawAlert: unknown): Alert | null => {
    if (!rawAlert || typeof rawAlert !== "object") return null;

    const source = rawAlert as Record<string, unknown>;
    const appointmentCandidate =
      source.appointment && typeof source.appointment === "object"
        ? (source.appointment as Record<string, unknown>)
        : undefined;

    const normalizedAppointment = appointmentCandidate
      ? {
          _id:
            typeof appointmentCandidate._id === "string"
              ? appointmentCandidate._id
              : "",
          clientName:
            typeof appointmentCandidate.clientName === "string"
              ? appointmentCandidate.clientName
              : "",
          appointmentTime:
            appointmentCandidate.appointmentTime &&
            typeof appointmentCandidate.appointmentTime === "object"
              ? {
                  start: String(
                    (
                      appointmentCandidate.appointmentTime as Record<
                        string,
                        unknown
                      >
                    ).start ?? "",
                  ),
                  end: String(
                    (
                      appointmentCandidate.appointmentTime as Record<
                        string,
                        unknown
                      >
                    ).end ?? "",
                  ),
                }
              : { start: "", end: "" },
          service:
            typeof appointmentCandidate.service === "string" ||
            (appointmentCandidate.service &&
              typeof appointmentCandidate.service === "object")
              ? (appointmentCandidate.service as
                  | { _id: string; name: string }
                  | string)
              : undefined,
          clientPhone:
            typeof appointmentCandidate.clientPhone === "string"
              ? appointmentCandidate.clientPhone
              : undefined,
          email:
            typeof appointmentCandidate.email === "string"
              ? appointmentCandidate.email
              : undefined,
          status:
            typeof appointmentCandidate.status === "string"
              ? appointmentCandidate.status
              : undefined,
          staff:
            typeof appointmentCandidate.staff === "string"
              ? appointmentCandidate.staff
              : undefined,
        }
      : undefined;

    const normalizedType =
      typeof source.type === "string"
        ? source.type
        : normalizedAppointment
          ? "appointment"
          : "notification";

    return {
      _id: typeof source._id === "string" ? source._id : crypto.randomUUID(),
      isRead: typeof source.isRead === "boolean" ? source.isRead : false,
      message:
        typeof source.message === "string"
          ? source.message
          : "New notification",
      createdAt:
        typeof source.createdAt === "string"
          ? source.createdAt
          : new Date().toISOString(),
      updatedAt:
        typeof source.updatedAt === "string" ? source.updatedAt : undefined,
      type: normalizedType,
      appointment: normalizedAppointment,
    };
  };

  useEffect(() => {
    console.log("user", user);
    if (user && (user.role === "staff" || user.role === "business")) {
      const socket = io(
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
      );

      socket.on("connect", () => {
        console.log("Connected to Socket.IO server:", socket.id);
        if (user && user._id) {
          socket.emit("joinRoom", user._id);
        }
      });

      socket.on("newAppointment", (newAlert) => {
        console.log("Received new alert:", newAlert);
        const normalized = normalizeAlert(newAlert);
        if (!normalized) return;
        setAlerts((prevAlerts) => [normalized, ...prevAlerts]);
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket.IO disconnected:", reason);
      });

      const fetchAlerts = async () => {
        console.log("Fetching alerts from API...");
        try {
          const fetchedAlerts = await callApi("/api/alerts", "GET");
          if (Array.isArray(fetchedAlerts)) {
            const normalizedAlerts = fetchedAlerts
              .map((alert) => normalizeAlert(alert))
              .filter((alert): alert is Alert => alert !== null);
            setAlerts(normalizedAlerts);
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

  const titleOffsetClass = hideLeftNav
    ? "lg:translate-x-0"
    : isLeftNavOpen
      ? "lg:translate-x-32"
      : "lg:translate-x-10";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-foreground backdrop-blur-xl">
      <div className="relative flex items-center px-3 py-2 md:grid md:grid-cols-[auto_1fr_auto] md:items-center md:px-6 md:gap-2">
        <div className="flex items-center space-x-3 min-w-0">
          {!hideLeftNav && (
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
          )}
          <h1 className="flex items-end gap-1 text-l font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            <span className="theme-logo-mask" aria-hidden="true" />
            <span className="sr-only" suppressHydrationWarning>{t("AppointDI")}</span>
            <span className=" sm:inline" suppressHydrationWarning>{t("AppointDI ")}</span>
          </h1>
        </div>

        {/* {pageTitle && (
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 md:hidden max-w-[44vw]">
            <h2 className="truncate text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight text-center">
              {t(pageTitle)}
            </h2>
          </div>
        )} */}

        <div
          className={`hidden md:flex justify-center min-w-0 transition-transform duration-300 ${titleOffsetClass}`}
        >
          {pageTitle && (
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight" suppressHydrationWarning>
              {t(pageTitle)}
            </h2>
          )}
        </div>

        {user ? (
          // MODIFIED: Adjusted for vertical buttons with labels
          <div className="ml-auto flex shrink-0 items-center gap-2 md:space-x-4 md:justify-self-end">
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
                <span className="text-xs text-primary mt-1" suppressHydrationWarning>{t("Alerts")}</span>
              </button>
              {isAlertsOpen && (
                <NotificationsPanel
                  isOpen={isAlertsOpen}
                  alerts={alerts}
                  onAlertsChange={setAlerts}
                />
              )}
            </div>

            {/* Language Button: show only on md+ when authorized */}
            <div className="relative block" ref={languagesRef}>
              <button
                onClick={toggleLanguages}
                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-xs text-primary mt-1" suppressHydrationWarning>
                  {t("Language")}
                </span>
              </button>
              {isLanguagesOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
                  <button
                    onClick={() => changeLanguage("bg")}
                    className="flex items-center w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <Image
                      src="/Flag_of_Bulgaria.png"
                      alt="Bulgarian Flag"
                      className="w-5 h-4 mr-2"
                      width={32}
                      height={32}
                    />
                    {t("Bulgarian")}
                  </button>
                  <button
                    onClick={() => changeLanguage("en")}
                    className="flex items-center w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <Image
                      src="/Flag_of_the_United_Kingdom.png"
                      alt="British Flag"
                      className="w-5 h-4 mr-2"
                      width={32}
                      height={32}
                    />
                    {t("English")}
                  </button>
                  <button
                    onClick={() => changeLanguage("de")}
                    className="flex items-center w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <Image
                      src="/Flag_of_Germany.png"
                      alt="German Flag"
                      className="w-5 h-4 mr-2"
                      width={32}
                      height={32}
                    />
                    {t("German")}
                  </button>
                </div>
              )}
            </div>

            <div className="relative hidden md:block" ref={helpRef}>
              <Link
                href="/help/contact"
                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                <Info className="w-5 h-5 text-primary" />
                <span className="text-xs text-primary mt-1" suppressHydrationWarning>{t("Help")}</span>
              </Link>
            </div>

            {/* Profile Button with Text (hidden on mobile) */}
            <div className="relative hidden md:block" ref={profileRef}>
              {user?.profilePictureUrl ? (
                <button
                  onClick={toggleProfile}
                  aria-label={t("User Profile Menu")}
                  className="rounded-full bg-primary hover:bg-primary-dark transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <Image
                    src={user.profilePictureUrl}
                    alt="Profile Picture"
                    width={36}
                    height={36}
                    className="rounded-full object-cover w-9 h-9"
                  />
                </button>
              ) : (
                <button
                  onClick={toggleProfile}
                  aria-label={t("User Profile Menu")}
                  className="p-2 rounded-full bg-primary hover:bg-primary-dark transition-all duration-200 border-2 border-primary/50 focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <User className="w-5 h-5 text-white" />
                </button>
              )}
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
          <div className="ml-auto flex shrink-0 items-center gap-2 md:space-x-4 md:justify-self-end">
            <div className="relative" ref={languagesRef}>
              <button
                onClick={toggleLanguages}
                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-xs text-primary mt-1" suppressHydrationWarning>
                  {t("Language")}
                </span>
              </button>
              {isLanguagesOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
                  <button
                    onClick={() => changeLanguage("bg")}
                    className="flex items-center w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <Image
                      src="/Flag_of_Bulgaria.png"
                      alt="Bulgarian Flag"
                      className="w-5 h-4 mr-2"
                      width={32}
                      height={32}
                    />
                    {t("Bulgarian")}
                  </button>
                  <button
                    onClick={() => changeLanguage("en")}
                    className="flex items-center w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <Image
                      src="/Flag_of_the_United_Kingdom.png"
                      alt="British Flag"
                      className="w-5 h-4 mr-2"
                      width={32}
                      height={32}
                    />
                    {t("English")}
                  </button>
                  <button
                    onClick={() => changeLanguage("de")}
                    className="flex items-center w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <Image
                      src="/Flag_of_Germany.png"
                      alt="German Flag"
                      className="w-5 h-4 mr-2"
                      width={32}
                      height={32}
                    />
                    {t("German")}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
