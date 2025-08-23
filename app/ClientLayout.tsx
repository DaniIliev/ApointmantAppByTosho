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
    <>
      <TopNav onToggleLeftNav={toggleLeftNav} isLeftNavOpen={isLeftNavOpen} />
      <LeftNav isOpen={isLeftNavOpen} />
      <main
        className={`mt-20 min-h-screen transition-all duration-300 ${
          isLeftNavOpen ? "ml-64" : "ml-0"
        }`}
      >
        {children}
      </main>
    </>
  );
}
