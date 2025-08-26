"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useRightNav } from "@/context/RightNavContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

const RIGHT_NAV_CLOSED_WIDTH = "w-0";
const RIGHT_NAV_OPEN_WIDTH = "w-10";
// const RIGHT_NAV_OFFSET_CLASS = "top-16";

export default function RightNavigation() {
  const { extraRightNavMenu, isRightNavVisible, setIsRightNavVisible } =
    useRightNav();

  const toggleRightNav = () => {
    setIsRightNavVisible(!isRightNavVisible);
  };

  return (
    <>
      {extraRightNavMenu && (
        <aside
          className={cn(
            "fixed right-0 z-10 flex flex-col justify-start",
            "bg-background border-l border-border shadow-lg",
            "h-[calc(100vh-4rem)]",
            "transition-all duration-300 ease-in-out",
            isRightNavVisible ? RIGHT_NAV_OPEN_WIDTH : RIGHT_NAV_CLOSED_WIDTH
          )}
        >
          <button
            onClick={toggleRightNav}
            className={cn(
              "absolute -left-7 top-1/2 -translate-y-1/2",
              "p-1 bg-background border border-border rounded-full shadow-md",
              "transition-transform duration-300 ease-in-out",
              "hover:bg-accent hover:border-primary/20"
            )}
          >
            {isRightNavVisible ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          <div
            className={cn(
              "flex flex-col gap-4 overflow-hidden",
              "transition-opacity duration-300",
              isRightNavVisible ? "opacity-100" : "opacity-0"
            )}
          >
            {extraRightNavMenu}
          </div>
        </aside>
      )}
    </>
  );
}
