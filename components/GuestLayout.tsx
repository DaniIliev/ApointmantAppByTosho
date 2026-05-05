"use client";

import type React from "react";
import { useState } from "react";
import TopNav from "@/components/navigation/top-nav";
import { useRightNav } from "@/context/RightNavContext";
import LeftNav from "./navigation/left-nav";
import Footer from "./Footer/Footer";
import { usePaddingControl } from "@/context/PaddingContext";

const LEFT_NAV_OPEN_WIDTH_CLASS = "ml-0 lg:ml-64";
const LEFT_NAV_CLOSED_WIDTH_CLASS = "ml-0 lg:ml-20";
const RIGHT_NAV_OPEN_WIDTH_CLASS = "mr-10";
const RIGHT_NAV_CLOSED_WIDTH_CLASS = "mr-0";

export default function GuestLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLeftNavOpen, setIsLeftNavOpen] = useState(false);
  const { isRightNavVisible } = useRightNav();

  const toggleLeftNav = () => {
    setIsLeftNavOpen(!isLeftNavOpen);
  };
  const { removePadding } = usePaddingControl();
  return (
    <div className="flex flex-col min-h-[70vh]">
      <div className="fixed top-0 left-0 right-0 z-50">
        <TopNav onToggleLeftNav={toggleLeftNav} isLeftNavOpen={isLeftNavOpen} />
      </div>
      <div className="flex flex-1 pt-12.5 transition-all duration-300">
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
                ${!removePadding ? "p-2 md:p-7" : ""} relative overflow-hidden
          `}
        >
          {children}
        </main>
      </div>
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
