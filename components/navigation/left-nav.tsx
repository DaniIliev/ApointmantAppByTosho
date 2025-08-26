"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  UserPlus,
  LogIn,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";

interface LeftNavProps {
  isOpen: boolean;
}

export default function LeftNav({ isOpen }: LeftNavProps) {
  const { t } = useTranslation();
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: t("Dashboard"), icon: LayoutDashboard },
    { href: "/performance", label: t("Performance"), icon: TrendingUp },
    {
      href: "/appointment-types",
      label: t("Appointment Types"),
      icon: ClipboardList,
    },
  ];

  return (
    <nav
      className={`fixed left-0 top-17.5 bottom-0 bg-slate-900/20 backdrop-blur-xl border-r border-white/10 z-40 transition-all duration-300 ${
        isOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full"
      }`}
    >
      <div
        className={`p-6 overflow-hidden ${
          isOpen ? "opacity-100" : "opacity-0"
        } transition-opacity duration-300`}
      >
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500/30 to-blue-500/30 border border-white/20 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
