// app/context/PaddingContext.tsx
"use client";

import { createContext, useContext, useState } from "react";

// 1. Създаваме Context
type PaddingContextType = {
  removePadding: boolean;
  setRemovePadding: (shouldRemove: boolean) => void;
};

const PaddingContext = createContext<PaddingContextType | undefined>(undefined);

// 2. Създаваме Provider (доставчик)
export function PaddingProvider({ children }: { children: React.ReactNode }) {
  const [removePadding, setRemovePadding] = useState(false);

  return (
    <PaddingContext.Provider value={{ removePadding, setRemovePadding }}>
      {children}
    </PaddingContext.Provider>
  );
}

// 3. Създаваме Custom Hook за лесно използване
export function usePaddingControl() {
  const context = useContext(PaddingContext);
  if (context === undefined) {
    throw new Error("usePaddingControl must be used within a PaddingProvider");
  }
  return context;
}
