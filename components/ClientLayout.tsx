"use client";

import type React from "react";
import { useState } from "react";
import TopNav from "@/components/navigation/top-nav";
import LeftNav from "@/components/navigation/left-nav";
import RightNavigation from "./navigation/right-nav";
import { useRightNav } from "@/context/RightNavContext";
import Footer from "./Footer/Footer";
import { usePaddingControl } from "@/context/PaddingContext";

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
    <div className="flex flex-col min-h-screen ">
      <div className="fixed top-0 left-0 right-0 z-50">
        <TopNav onToggleLeftNav={toggleLeftNav} isLeftNavOpen={isLeftNavOpen} hideLeftNav={hideLeftNav} />
      </div>
      <div className="flex flex-1 pt-12.5 transition-all duration-300">
        {!hideLeftNav && <LeftNav isOpen={isLeftNavOpen} />}

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
    </div>
  );
}
