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
    typeof window !== "undefined" ? window.innerHeight * 0.12 : 300,
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
    if (Math.abs(e.clientY - startYRef.current) > 5) movedRef.current = true;
    const newTop = e.clientY - 20; // center the 40px bubble
    const vh = window.innerHeight;
    const clamped = Math.min(Math.max(newTop, 40), vh - 40);
    setTop(clamped);
  };

  const childArray = React.Children.toArray(content).filter(Boolean);
  const isMultiple = childArray.length > 1;

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
    try {
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    } catch (e) {}

    if (!movedRef.current) {
      if (!isMultiple && childArray.length > 0) {
        triggerPrimaryAction();
      } else if (isMultiple) {
        setOpen((v) => !v);
      }
    }
  };

  const onPointerCancel = () => {
    setIsDragging(false);
  };

  return (
    <>
      <div
        ref={containerRef}
        style={{ top, right: 8 }}
        className={cn(
          "fixed z-50 select-none touch-none", // ensure layout over everything
          "transition-shadow",
          isDragging ? "cursor-grabbing" : "cursor-grab",
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
            "h-[42px] w-[42px] rounded-full shadow-lg overflow-hidden",
            "bg-primary text-primary-foreground flex items-center justify-center",
            "active:scale-95 transition-all duration-200 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            open && "ring-2 ring-primary",
          )}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!isMultiple && childArray.length > 0) triggerPrimaryAction();
              else if (isMultiple) setOpen((v) => !v);
            }
          }}
        >
          {!isMultiple && childArray.length > 0 ? (
            <div className="pointer-events-none flex items-center justify-center h-full w-full scale-90 [&_button]:!border-0 [&_button]:!bg-transparent [&_button]:!shadow-none [&_button]:!ring-0 [&_button]:!outline-none [&_button]:!p-0 [&_button]:rounded-none">
              {content}
            </div>
          ) : open ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <MoreVertical className="h-5 w-5" />
          )}
        </div>

        {/* Hidden host to facilitate direct click triggering for singular tasks */}
        <div ref={hiddenHostRef} className="hidden">
          {content}
        </div>
      </div>

      {/* Popover Menu rendering Generic Vertical List of actions */}
      {open && isMultiple && (
        <div
          className={cn(
            "fixed z-50 -translate-y-1/2",
            "bg-popover border border-border/40 rounded-xl shadow-2xl",
            "p-1.5 min-w-[200px] origin-right animate-in fade-in zoom-in-95 duration-150",
          )}
          style={{ top: top + 21, right: 60 }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="flex flex-col items-stretch gap-1">
            {childArray.map((child, index) => (
              <div key={index} onClick={() => setOpen(false)}>
                {child}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop to dismiss popover */}
      {open && isMultiple && (
        <div
          className="fixed inset-0 z-40 bg-transparent/5"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
