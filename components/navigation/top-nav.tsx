"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Menu, X, Info, Bell, Languages } from "lucide-react";
import { usePageTitle } from "@/context/PageTitleContext";

interface TopNavProps {
  onToggleLeftNav: () => void;
  isLeftNavOpen: boolean;
}

export default function TopNav({
  onToggleLeftNav,
  isLeftNavOpen,
}: TopNavProps) {
  const { pageTitle } = usePageTitle();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);

  const handleSignOut = () => {
    console.log("User signed out.");
    setIsProfileOpen(false);
  };

  const handleHelpClick = () => {
    setIsHelpOpen(!isHelpOpen);
  };

  const handleAlertsClick = () => {
    setIsAlertsOpen(!isAlertsOpen);
  };

  const handleLanguagesClick = () => {
    setIsLanguagesOpen(!isLanguagesOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/20 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
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
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            AppointmentPro
          </h1>
        </div>

        <div className="hidden md:flex flex-grow justify-center">
          {pageTitle && (
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
              {pageTitle}
            </h2>
          )}
        </div>

        <div className="flex items-center space-x-6">
          {/* <Link
            href="/login"
            className="text-white/80 hover:text-white transition-colors duration-200 hover:bg-white/10 px-3 py-2 rounded-lg"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="text-white/80 hover:text-white transition-colors duration-200 hover:bg-white/10 px-3 py-2 rounded-lg"
          >
            Register
          </Link>
          <Link
            href="/about"
            className="text-white/80 hover:text-white transition-colors duration-200 hover:bg-white/10 px-3 py-2 rounded-lg"
          >
            About Us
          </Link>
          <Link
            href="/blog"
            className="text-white/80 hover:text-white transition-colors duration-200 hover:bg-white/10 px-3 py-2 rounded-lg"
          >
            Blog
          </Link> */}

          <div className="relative">
            <button
              onClick={handleAlertsClick}
              className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
            >
              <Bell className="w-5 h-5 text-white" />
            </button>
            {isAlertsOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-4">
                <p className="text-white/80">Нямате нови известия.</p>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={handleLanguagesClick}
              className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
            >
              <Languages className="w-5 h-5 text-white" />
            </button>
            {isLanguagesOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
                <button className="block w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-t-xl">
                  Български
                </button>
                <button className="block w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-b-xl">
                  English
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={handleHelpClick}
              className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
            >
              <Info className="w-5 h-5 text-white" />
            </button>
            {isHelpOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
                <Link
                  href="/help/faq"
                  onClick={() => setIsHelpOpen(false)}
                  className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-t-xl"
                >
                  Често задавани въпроси
                </Link>
                <Link
                  href="/help/contact"
                  onClick={() => setIsHelpOpen(false)}
                  className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-b-xl"
                >
                  Свържете се с нас
                </Link>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="p-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/20 hover:border-white/40 transition-all duration-200"
            >
              <User className="w-5 h-5 text-white" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
                <Link
                  href="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 rounded-t-xl"
                >
                  Profile Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 rounded-b-xl"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
