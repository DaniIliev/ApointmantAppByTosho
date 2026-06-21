"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  LogIn,
  Users,
  House,
  Briefcase,
  ChevronDown,
  Settings,
  Clock,
  UserCog,
  CreditCard,
  // New Icons for better context
  Info, // For Business Information
  BarChart3, // For Performance
  CircleDollarSign,
  Info as InfoIcon,
  User as UserIcon,
  QrCode,
  LogOut,
  LayoutList,
  ShieldCheck, // For QR Code page
  MapPin,
  Receipt,
  MessageCircle,
} from "lucide-react";


import { useAuthContext } from "@/context/AuthContext";
import useClickOutside from "@/Global/Hooks/useClickOutside";

interface NavItem {
  href?: string;
  label: string;
  icon: any;
  children?: NavItem[];
}

interface LeftNavProps {
  isOpen: boolean;
  onClose?: () => void;
}

// --- SubMenu Component ---
const SubMenu = ({
  item,
  pathname,
  isOpen,
}: {
  item: NavItem;
  pathname: string;
  isOpen: boolean;
}) => {
  const hasActiveChild = item.children?.some(
    (child) =>
      pathname === child.href ||
      child.children?.some((nested) => pathname === nested.href),
  );
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(!!hasActiveChild);
  const isActive = item.href ? pathname === item.href : hasActiveChild;
  const Icon = item.icon;

  const handleToggle = () => {
    if (item.children) {
      setIsSubmenuOpen((prev) => !prev);
    }
  };

  // Base classes за родителския елемент
  const baseClasses = `flex items-center whitespace-nowrap rounded-xl transition-all duration-200 w-full text-left
    ${isOpen ? "space-x-3 px-4 py-3" : "justify-center px-0 py-3"}
    ${
      isActive
        ? "bg-primary text-white hover:bg-primary-dark"
        : "text-text-primary hover:text-white hover:bg-primary-dark"
    }`;

  if (!item.children) {
    return (
      <li className="list-none">
        <Link href={item.href || "#"} className={baseClasses}>
          <Icon className="w-5 h-5" />
          <span
            className={`font-medium transition-opacity duration-300 flex-grow ${
              isOpen ? "opacity-100" : "opacity-0 absolute"
            } ${!isOpen && "hidden"}`}
          >
            {item.label}
          </span>
        </Link>
      </li>
    );
  }

  return (
    <li className="list-none">
      <button
        onClick={handleToggle}
        className={baseClasses}
        aria-expanded={isSubmenuOpen}
      >
        <Icon className="w-5 h-5" />
        <span
          className={`font-medium transition-opacity duration-300 flex-grow ${
            isOpen ? "opacity-100" : "opacity-0 absolute"
          } ${!isOpen && "hidden"}`}
        >
          {item.label}
        </span>
        {isOpen && (
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isSubmenuOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        )}
      </button>

      {isSubmenuOpen && (
        <ul
          className={`
          mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? "pl-4" : "pl-0"} 
        `}
        >
          {item.children.map((child) => {
            // Recursive call to handle deeper nesting (like Configuration)
            if (child.children) {
              return (
                <SubMenu
                  key={child.label}
                  item={child}
                  pathname={pathname}
                  isOpen={isOpen}
                />
              );
            }
            const ChildIcon = child.icon;

            return (
              <li key={child.href} className="list-none">
                <Link
                  href={child.href || "#"}
                  className={`flex items-center whitespace-nowrap rounded-xl transition-all duration-200 py-3 text-sm 
                    ${isOpen ? "px-4 space-x-3" : "justify-center px-0"} 
                    ${
                      pathname === child.href
                        ? "bg-primary text-white hover:bg-primary-dark"
                        : "text-text-primary hover:text-white hover:bg-primary-dark"
                    }`}
                >
                  {ChildIcon && <ChildIcon className="w-5 h-5" />}

                  <span
                    className={`font-medium transition-opacity duration-300 ${
                      isOpen ? "opacity-100" : "opacity-0 absolute"
                    } ${!isOpen && "hidden"}`}
                  >
                    {child.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};

import { LocationSelector } from "./LocationSelector";

export default function LeftNav({ isOpen, onClose }: LeftNavProps) {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ... (rest of the component logic)

  useClickOutside(langRef, () => setIsLangOpen(false));

  // ... (rest of the component logic)

  useEffect(() => {
    if (!isOpen) setIsLangOpen(false);
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchCurrentX.current;
    if (diff > 50 && onClose) {
      // Swiped left more than 50px
      onClose();
    }
  };

  const navItems: NavItem[] =
    user?.role === "admin"
      ? [
          { href: "/admin/dashboard", label: t("Admin Dashboard"), icon: LayoutDashboard },
          {
            href: "/admin/grant-access",
            label: t("Grant Access"),
            icon: ShieldCheck,
          },
        ]
      : user?.role === "business" ||
        user?.role === "manager" ||
        user?.role === "staff"
      ? [
          { href: "/home", label: t("Home"), icon: House },

          { href: "/dashboard", label: t("Dashboard"), icon: LayoutDashboard },
          {
            label: t("Business"),
            icon: Briefcase,
            children: [
              // {
              //   href: "/for-business",
              //   label: t("For Business"),
              //   icon: Briefcase,
              // },

              {
                href: "/business/" + (user?.businessId || ""),
                label: t("My Public Page"),
                icon: Users,
              },
              {
                href: "/business/qr-code",
                label: t("QR Code"),
                icon: QrCode,
              },
              {
                label: t("Configuration"),
                icon: Settings,
                children: [
                  {
                    href: "/business/business-information",
                    label: t("Business Info"),
                    icon: Info,
                  },
                  {
                    href: "/business/locations",
                    label: t("Locations"),
                    icon: MapPin,
                  },
                  { href: "/schedule", label: t("Schedule"), icon: Clock },
                  {
                    href: "/staff",
                    label: t("Staff Management"),
                    icon: UserCog,
                  },
                  {
                    href: "/appointment-types",
                    label: t("Service Types"),
                    icon: CircleDollarSign,
                  },
                  ...(user?.role === "business"
                    ? [
                        {
                          href: "/settings/payments",
                          label: t("Payments"),
                          icon: CreditCard,
                        },
                        {
                          href: "/dashboard/subscription",
                          label: t("Subscription"),
                          icon: Receipt,
                        },
                      ]
                    : []),
                ],
              },
            ],
          },
          {
            href: "/performance",
            label: t("Performance"),
            icon: BarChart3,
          },
          {
            href: "/chat",
            label: t("Messages"),
            icon: MessageCircle,
          },
          {
            href: "/kanban",
            label: t("Task Manager"),
            icon: LayoutList,
          },
        ]
      : [
          // { href: "/home", label: t("For Clients"), icon: Users },
          { href: "/for-business", label: t("For Business"), icon: Briefcase },
          { href: "/login", label: t("Sign in"), icon: LogIn },
        ];

  if (!mounted) return null;

  return (
    <nav
      className={`zIndex-100 bg-primary-foreground fixed left-0 top-17.5 bottom-0 backdrop-blur-xl z-40 transition-all duration-300 
        ${
          isOpen
            ? "w-64 translate-x-0 shadow-2xl md:shadow-none"
            : "w-64 -translate-x-full"
        }
        ${isOpen ? "lg:w-64 lg:translate-x-0" : "lg:w-20 lg:translate-x-0"}
      `}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={`h-full flex flex-col relative`}>
        <div className="pt-5 px-3">
          <LocationSelector isOpen={isOpen} />
        </div>
        <div className="space-y-2 flex-1 overflow-y-auto pt-2 pb-24 px-3">
          {navItems.map((item) => (
            <SubMenu
              key={item.label}
              item={item}
              pathname={pathname}
              isOpen={isOpen}
            />
          ))}
        </div>
        {user && (
          <div className="lg:hidden absolute left-0 right-0 bottom-0 p-3 border-t border-white/10 bg-primary-foreground">
            <div className="flex items-center justify-around">
              {/* Profile */}
              <Link
                href="/profile"
                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                <UserIcon className="w-5 h-5 text-primary" />
                <span className="text-[11px] text-primary mt-1">
                  {t("Profile")}
                </span>
              </Link>
              {/* Help */}
              <Link
                href="/help/contact"
                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                <InfoIcon className="w-5 h-5 text-primary" />
                <span className="text-[11px] text-primary mt-1">
                  {t("Help")}
                </span>
              </Link>
              <Link
                href="/for-business"
                onClick={() => logout()}
                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5 text-primary" />
                <span className="text-[11px] text-primary mt-1">
                  {t("Logout")}
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
