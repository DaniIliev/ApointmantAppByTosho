"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useRightNav } from "@/context/RightNavContext";
import { ChevronRight, MoreVertical } from "lucide-react";

export default function RightNavigation() {
  const { extraRightNavMenu } = useRightNav();
  return extraRightNavMenu ? (
    <RightNavBubbles content={extraRightNavMenu} />
  ) : null;
}

function RightNavBubbles({ content }: { content: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hiddenHostRef = useRef<HTMLDivElement | null>(null);
  const [top, setTop] = useState<number>(
    typeof window !== "undefined" ? window.innerHeight * 0.12 : 300
  );
  const [isDragging, setIsDragging] = useState(false);
  const [open, setOpen] = useState(false);
  const startYRef = useRef<number>(0);
  const movedRef = useRef<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
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
    <div>
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
            <div className="pointer-events-none flex items-center justify-center h-full w-full scale-90 text-white">
              {content}
            </div>
          ) : open ? (
            <ChevronRight className="h-5 w-5 text-white" />
          ) : (
            <MoreVertical className="h-5 w-5 text-white" />
          )}
        </div>

        <div ref={hiddenHostRef} className="hidden">
          {content}
        </div>
        {open && (
          <div
            className={cn(
              "absolute right-16 top-1/2 -translate-y-1/2",
              "bg-primary-foreground border border-border rounded-2xl shadow-xl",
              "p-2 max-w-[70vw] text-white"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-white">{content}</div>
          </div>
        )}
      </div>
    </div>
  );
}
