"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
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
  createdAt: string;
  updatedAt?: string;
  type: string;
  appointment?: AppointmentInfo;
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
      console.log("alert", alert);
      const appointmentId = alert.appointment?._id;
      const alertId = alert._id;

      if (!appointmentId) {
        toast.error(t("This alert has no appointment to confirm."));
        return;
      }

      // Стъпка 1: Изпращаме заявка за потвърждаване на срещата
      const confirmedAppointment = await callApi(
        `/api/appointment/${appointmentId}/status`,
        "PUT",
        { status: "confirmed" }
      );

      console.log("alertId", alertId);
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
        console.log("alert", alert);

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-foreground backdrop-blur-xl">
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
          <h1 className="flex align-end text-l font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            <Image
              src="/AppointmantPro.png"
              alt="logo"
              width={32}
              height={32}
              className="w-8 h-auto"
            />
            <span className="">{t("AppointDI ")}</span>
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
                    alerts.map((alert) => {
                      const appt = alert.appointment;
                      const hasAppt = alert.type === "appointment" && !!appt;
                      return (
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
                          {hasAppt ? (
                            <>
                              <p className="text-xs text-white/60 mt-1">
                                {t("Appointment from")}:
                                {appt?.clientName ?? t("Unknown")}
                              </p>
                              <p className="text-xs text-white/60">
                                {t("Time")}:
                                {appt?.appointmentTime?.start
                                  ? new Date(
                                      appt.appointmentTime.start
                                    ).toLocaleTimeString("bg-BG", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "N/A"}
                                -
                                {appt?.appointmentTime?.end
                                  ? new Date(
                                      appt.appointmentTime.end
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
                                  className="px-3 py-1 text-sm font-semibold text-white bg-accent rounded-full hover:bg-accent/80 transition-colors"
                                >
                                  {t("Confirm")}
                                </button>
                              </div>
                            </>
                          ) : (
                            <p className="text-xs text-white/60 mt-1">
                              {new Date(alert.createdAt).toLocaleString(
                                "bg-BG"
                              )}
                            </p>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-white/80">
                      {t("You have no new notifications.")}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Language Button: show only on md+ when authorized */}
            <div className="relative hidden md:block" ref={languagesRef}>
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

            <div className="relative hidden md:block" ref={helpRef}>
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

            {/* Profile Button with Text (hidden on mobile) */}
            <div className="relative hidden md:block" ref={profileRef}>
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
          </div>
        )}
      </div>
    </nav>
  );
}
