"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface RightNavContextType {
  extraRightNavMenu: ReactNode | null;
  setExtraRightNavMenu: (content: ReactNode | null) => void;
  isRightNavVisible: boolean;
  setIsRightNavVisible: (visible: boolean) => void;
}

const RightNavContext = createContext<RightNavContextType | undefined>(
  undefined
);

export function RightNavProvider({ children }: { children: ReactNode }) {
  const [extraRightNavMenu, setExtraRightNavMenu] = useState<ReactNode | null>(
    null
  );
  const [isRightNavVisible, setIsRightNavVisible] = useState<boolean>(false);

  return (
    <RightNavContext.Provider
      value={{
        extraRightNavMenu,
        setExtraRightNavMenu,
        isRightNavVisible,
        setIsRightNavVisible,
      }}
    >
      {children}
    </RightNavContext.Provider>
  );
}

export function useRightNav() {
  const context = useContext(RightNavContext);
  if (context === undefined) {
    throw new Error("useRightNav must be used within a RightNavProvider");
  }
  return context;
}
