"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useRightNav } from "@/context/RightNavContext";
import { ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";

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
            "fixed right-0 z-10 hidden md:flex flex-col justify-start",
            "bg-primary-foreground shadow-lg",
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
              "hover:bg-primary/20 hover:border-primary/10"
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

      {/* Mobile: Draggable bubble on the right side */}
      {extraRightNavMenu && <MobileRightBubbles content={extraRightNavMenu} />}
    </>
  );
}

function MobileRightBubbles({ content }: { content: React.ReactNode }) {
  // Only render on mobile (hidden on md+ via CSS)
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hiddenHostRef = useRef<HTMLDivElement | null>(null);
  const [top, setTop] = useState<number>(
    typeof window !== "undefined" ? window.innerHeight * 0.2 : 300
  );
  const [isDragging, setIsDragging] = useState(false);
  const [open, setOpen] = useState(false);
  const startYRef = useRef<number>(0);
  const movedRef = useRef<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      // Keep bubble within viewport
      const vh = window.innerHeight;
      setTop((prev) => Math.min(Math.max(prev, 64), vh - 64));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startYRef.current = e.clientY;
    movedRef.current = false;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    if (Math.abs(e.clientY - startYRef.current) > 3) movedRef.current = true;
    const newTop = e.clientY - 20; // center the 40px bubble
    const vh = window.innerHeight;
    const clamped = Math.min(Math.max(newTop, 40), vh - 40);
    setTop(clamped);
  };

  const triggerPrimaryAction = () => {
    const host = hiddenHostRef.current;
    if (!host) return;
    const target = host.querySelector('button, [role="button"], a[href]') as
      | HTMLButtonElement
      | HTMLAnchorElement
      | null;
    target?.click?.();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    // Toggle only if it wasn't a drag
    if (!movedRef.current) {
      if (React.Children.count(content) === 1) {
        // Single action: trigger directly
        triggerPrimaryAction();
      } else {
        setOpen((v) => !v);
      }
    }
  };

  const onPointerCancel = () => {
    setIsDragging(false);
  };

  return (
    <div className="md:hidden">
      {/* Draggable main bubble */}
      <div
        ref={containerRef}
        style={{ top, right: 4 }}
        className={cn(
          "absolute z-40 select-none touch-none",
          "transition-shadow",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <div
          role="button"
          aria-label="Open quick actions"
          tabIndex={0}
          className={cn(
            "h-10 w-10 rounded-full shadow-lg border border-border overflow-hidden",
            "bg-primary text-white flex items-center justify-center",
            "active:scale-95 transition-transform focus:outline-none focus-visible:outline-none"
          )}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (React.Children.count(content) === 1) triggerPrimaryAction();
              else setOpen((v) => !v);
            }
          }}
        >
          {React.Children.count(content) === 1 ? (
            <div className="pointer-events-none flex items-center justify-center h-full w-full scale-90">
              {content}
            </div>
          ) : open ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <MoreVertical className="h-5 w-5" />
          )}
        </div>

        {/* Hidden host to invoke single action programmatically */}
        <div ref={hiddenHostRef} className="hidden">
          {content}
        </div>

        {/* Bubble panel */}
        {open && (
          <div
            className={cn(
              "absolute right-16 top-1/2 -translate-y-1/2",
              "bg-primary-foreground border border-border rounded-2xl shadow-xl",
              "p-2 max-w-[70vw]"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">{content}</div>
          </div>
        )}
      </div>
    </div>
  );
}
