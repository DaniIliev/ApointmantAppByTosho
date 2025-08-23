"use client";

import type React from "react";
import { useState } from "react";
import TopNav from "@/components/navigation/top-nav";
import LeftNav from "@/components/navigation/left-nav";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLeftNavOpen, setIsLeftNavOpen] = useState(true);

  const toggleLeftNav = () => {
    setIsLeftNavOpen(!isLeftNavOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <TopNav onToggleLeftNav={toggleLeftNav} isLeftNavOpen={isLeftNavOpen} />
      </div>
      <div className="flex flex-1 pt-16 transition-all duration-300">
        <LeftNav isOpen={isLeftNavOpen} />

        <main
          className={`flex-1 p-2 transition-all duration-300 ${
            isLeftNavOpen ? "ml-62" : "ml-0"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
