"use client";

import type React from "react";
import { useState } from "react";
import TopNav from "@/components/navigation/top-nav";
import { useRightNav } from "@/context/RightNavContext";

// Дефинираме ширините на навигациите като константи за по-лесно управление
const LEFT_NAV_OPEN_WIDTH_CLASS = "ml-64";
const LEFT_NAV_CLOSED_WIDTH_CLASS = "ml-0";
const RIGHT_NAV_OPEN_WIDTH_CLASS = "mr-10";
const RIGHT_NAV_CLOSED_WIDTH_CLASS = "mr-0";

export default function GuestLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLeftNavOpen, setIsLeftNavOpen] = useState(true);
  const { isRightNavVisible } = useRightNav();

  const toggleLeftNav = () => {
    setIsLeftNavOpen(!isLeftNavOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <TopNav onToggleLeftNav={toggleLeftNav} isLeftNavOpen={isLeftNavOpen} />
      </div>
      <div className="flex flex-1 pt-17.5 transition-all duration-300">
        <main
          className={`
            flex-1 
            transition-all duration-300
               min-h-[87vh] bg-gradient-to-br from-primary/20 via-background to-accent/20 p-7 relative overflow-hidden
          `}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
