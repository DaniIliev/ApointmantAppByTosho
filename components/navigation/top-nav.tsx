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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/20 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          {user && (
            <button
              onClick={onToggleLeftNav}
              className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/20 hover:border-white/40 transition-all duration-200"
            >
              {isLeftNavOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          )}
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
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
          <div className="flex items-center space-x-4">
            <div className="relative" ref={alertsRef}>
              <button
                onClick={toggleAlerts}
                className={`p-2 rounded-full hover:bg-white/10 transition-colors duration-200 relative ${
                  hasUnreadAlerts ? "animate-wiggle" : ""
                }`}
              >
                <Bell
                  className={`w-4 h-4 transition-colors duration-200 ${
                    hasUnreadAlerts ? "text-red-400" : "text-white"
                  }`}
                />
                {hasUnreadAlerts && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-ping-once" />
                )}
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
            <div className="relative" ref={languagesRef}>
              <button
                onClick={toggleLanguages}
                className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
              >
                <Globe className="w-4 h-4 text-white" />
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
                className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
              >
                <Info className="w-4 h-4 text-white" />
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
            <div className="relative" ref={profileRef}>
              <button
                onClick={toggleProfile}
                className="p-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/20 hover:border-white/40 transition-all duration-200"
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
            <Link
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
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
