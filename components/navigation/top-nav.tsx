"use client";

import { useState, useRef } from "react";
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
            {" "}
            {/* Намален space-x */}
            <div className="relative" ref={alertsRef}>
              <button
                onClick={toggleAlerts}
                className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
              >
                <Bell className="w-4 h-4 text-white" /> {/* Намален размер */}
              </button>
              {isAlertsOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-4">
                  <p className="text-white/80">
                    {t("You have no new notifications.")}
                  </p>
                </div>
              )}
            </div>
            <div className="relative" ref={languagesRef}>
              <button
                onClick={toggleLanguages}
                className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
              >
                <Globe className="w-4 h-4 text-white" /> {/* Намален размер */}
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
                <Info className="w-4 h-4 text-white" /> {/* Намален размер */}
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
              className="flex items-center px-4 py-2 rounded-full text-white/80 bg-white/5 hover:bg-white/10 transition-colors duration-200"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {t("Login")}
            </Link>
            <Link
              href="/register"
              className="flex items-center px-4 py-2 rounded-full text-white/80 bg-white/5 hover:bg-white/10 transition-colors duration-200"
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
