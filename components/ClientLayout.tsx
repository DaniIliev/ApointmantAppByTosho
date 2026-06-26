"use client";

import type React from "react";
import { useState } from "react";
import TopNav from "@/components/navigation/top-nav";
import LeftNav from "@/components/navigation/left-nav";
import RightNavigation from "./navigation/right-nav";
import { usePaddingControl } from "@/context/PaddingContext";
import ProfilePicturePrompt from "@/components/auth/ProfilePicturePrompt";

export const LEFT_NAV_OPEN_WIDTH_CLASS = "ml-0 lg:ml-64";
export const LEFT_NAV_CLOSED_WIDTH_CLASS = "ml-0 lg:ml-20";

export default function ClientLayout({
  children,
  hideLeftNav = false,
}: Readonly<{
  children: React.ReactNode;
  hideLeftNav?: boolean;
}>) {
  const [isLeftNavOpen, setIsLeftNavOpen] = useState(false);

  const toggleLeftNav = () => {
    setIsLeftNavOpen(!isLeftNavOpen);
  };
  const { removePadding } = usePaddingControl();

  return (
    <div className="flex flex-col min-h-screen py-6">
      <div className="fixed top-0 left-0 right-0 z-50">
        <TopNav onToggleLeftNav={toggleLeftNav} isLeftNavOpen={isLeftNavOpen} hideLeftNav={hideLeftNav} />
      </div>
      <div className="flex flex-1 pt-12.5 transition-all duration-300">
        {!hideLeftNav && (
          <LeftNav isOpen={isLeftNavOpen} onClose={() => setIsLeftNavOpen(false)} />
        )}

        {/* Mobile & Tablet Backdrop */}
        {isLeftNavOpen && !hideLeftNav && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
            onClick={() => setIsLeftNavOpen(false)}
            aria-hidden="true"
          />
        )}

        <main
          className={`
            flex-1 
            transition-all duration-300
            ${
              hideLeftNav
                ? "ml-0"
                : isLeftNavOpen
                ? LEFT_NAV_OPEN_WIDTH_CLASS
                : LEFT_NAV_CLOSED_WIDTH_CLASS
            }
              ${!removePadding ? "p-2 md:p-7" : ""} relative overflow-hidden
          `}
        >
          {children}
        </main>
        {!hideLeftNav && <RightNavigation />}
      </div>
      <ProfilePicturePrompt />
    </div>
  );
}
