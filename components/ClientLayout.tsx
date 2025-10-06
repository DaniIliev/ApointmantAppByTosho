"use client";

import type React from "react";
import { useState } from "react";
import TopNav from "@/components/navigation/top-nav";
import LeftNav from "@/components/navigation/left-nav";
import RightNavigation from "./navigation/right-nav";
import { useRightNav } from "@/context/RightNavContext";
import Chatbot from "./chatBot/Chatbot";
import Footer from "./Footer/Footer";

const LEFT_NAV_OPEN_WIDTH_CLASS = "ml-64";
const LEFT_NAV_CLOSED_WIDTH_CLASS = "ml-20";
const RIGHT_NAV_OPEN_WIDTH_CLASS = "mr-10";
const RIGHT_NAV_CLOSED_WIDTH_CLASS = "mr-0";

export default function ClientLayout({
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
        <LeftNav isOpen={isLeftNavOpen} />

        <main
          className={`
            flex-1 
            transition-all duration-300
            ${
              isLeftNavOpen
                ? LEFT_NAV_OPEN_WIDTH_CLASS
                : LEFT_NAV_CLOSED_WIDTH_CLASS
            }
            ${
              isRightNavVisible
                ? RIGHT_NAV_OPEN_WIDTH_CLASS
                : RIGHT_NAV_CLOSED_WIDTH_CLASS
            }
               min-h-[87vh] 
               p-7 relative overflow-hidden
          `}
        >
          {children}
        </main>
        <RightNavigation />
      </div>
      <Chatbot />
      <div
        className={`   
                      transition-all duration-300         ${
                        isLeftNavOpen
                          ? LEFT_NAV_OPEN_WIDTH_CLASS
                          : LEFT_NAV_CLOSED_WIDTH_CLASS
                      }
            ${
              isRightNavVisible
                ? RIGHT_NAV_OPEN_WIDTH_CLASS
                : RIGHT_NAV_CLOSED_WIDTH_CLASS
            }`}
      >
        <Footer />
      </div>
    </div>
  );
}
