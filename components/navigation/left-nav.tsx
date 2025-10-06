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
  ListTodo,
  Calendar,
  Users,
  House,
  Briefcase,
} from "lucide-react";

import { useAuthContext } from "@/context/AuthContext";

interface LeftNavProps {
  isOpen: boolean;
}

export default function LeftNav({ isOpen }: LeftNavProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { user } = useAuthContext();
  const navItems =
    user?.role === "business" || user?.role === "staff"
      ? [
          { href: "/home", label: t("Home"), icon: House },
          { href: "/dashboard", label: t("Dashboard"), icon: LayoutDashboard },
          { href: "/performance", label: t("Performance"), icon: TrendingUp },
          {
            href: "/appointment-types",
            label: t("Types"),
            icon: ClipboardList,
          },
          {
            href: "/business-configuration",
            label: t("Types"),
            icon: ClipboardList,
          },
          { href: "/schedule", label: t("Schedule"), icon: Calendar },
          { href: "/staff", label: t("Staff Management"), icon: Users },
        ]
      : [
          { href: "/home", label: t("For Clients"), icon: Users }, // По-добра икона за "Клиенти"
          { href: "/business", label: t("For Business"), icon: Briefcase }, // Различен път и икона
          { href: "/login", label: t("Sign in"), icon: LogIn }, // По-добра икона за "Вход"
        ];

  return (
    <nav
      className={`bg-primary-foreground fixed left-0 top-17.5 bottom-0  backdrop-blur-xl border-r border-white/10 z-40 transition-all duration-300 ${
        // Променена логика за ширина и позиция
        isOpen ? "w-64 translate-x-0" : "w-20 translate-x-0" // w-20 е новата минимална ширина за иконите
      }`}
    >
      <div
        // Премахваме opacity анимацията от тук, за да не скриваме иконите
        className={`p-4 overflow-hidden h-full`} // Намалих p-6 на p-4 за по-компактен вид при затворено
      >
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                // Променени класове: премахваме space-x-3 при затворено меню и оправяме py/px
                className={`flex items-center whitespace-nowrap rounded-xl transition-all duration-200 
                  ${
                    isOpen ? "space-x-3 px-4 py-3" : "justify-center px-0 py-3"
                  } // Адаптираме padding и spacing
                  ${
                    isActive
                      ? "bg-primary text-white hover:bg-primary-dark"
                      : "text-text-primary hover:text-white hover:bg-primary-dark"
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span
                  className={`font-medium transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0 absolute"
                  } ${!isOpen && "hidden"}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useTranslation } from "react-i18next";
// import {
//   LayoutDashboard,
//   UserPlus,
//   LogIn,
//   ClipboardList,
//   TrendingUp,
//   ListTodo,
//   Calendar,
//   Users,
//   House,
//   Briefcase,
// } from "lucide-react";

// import { useAuthContext } from "@/context/AuthContext";

// interface LeftNavProps {
//   isOpen: boolean;
// }

// export default function LeftNav({ isOpen }: LeftNavProps) {
//   const { t } = useTranslation();
//   const pathname = usePathname();
//   const { user } = useAuthContext();
//   const navItems =
//     user?.role === "business" || user?.role === "staff"
//       ? [
//           { href: "/home", label: t("Home"), icon: House },
//           { href: "/dashboard", label: t("Dashboard"), icon: LayoutDashboard },
//           { href: "/performance", label: t("Performance"), icon: TrendingUp },
//           {
//             href: "/appointment-types",
//             label: t("Types"),
//             icon: ClipboardList,
//           },
//           { href: "/schedule", label: t("Schedule"), icon: Calendar },
//           { href: "/staff", label: t("Staff Management"), icon: Users },
//         ]
//       : // Навигация за други роли (вероятно "client" или неаутентикиран потребител)
//         [
//           { href: "/home", label: t("For Clients"), icon: Users }, // По-добра икона за "Клиенти"
//           { href: "/business", label: t("For Business"), icon: Briefcase }, // Различен път и икона
//           { href: "/login", label: t("Sign in"), icon: LogIn }, // По-добра икона за "Вход"
//         ];

//   return (
//     <nav
//       className={`bg-primary-foreground fixed left-0 top-17.5 bottom-0  backdrop-blur-xl border-r border-white/10 z-40 transition-all duration-300 ${
//         isOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full"
//       }`}
//     >
//       <div
//         className={`p-6 overflow-hidden ${
//           isOpen ? "opacity-100" : "opacity-0"
//         } transition-opacity duration-300`}
//       >
//         <div className="space-y-2">
//           {navItems.map((item) => {
//             const Icon = item.icon;
//             const isActive = pathname === item.href;

//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
//                   isActive
//                     ? "bg-primary text-white hover:bg-primary-dark"
//                     : "text-text-primary hover:text-white hover:bg-primary-dark"
//                 }`}
//               >
//                 <Icon className="w-5 h-5" />
//                 <span className="font-medium">{item.label}</span>
//               </Link>
//             );
//           })}
//         </div>
//       </div>
//     </nav>
//   );
// }
