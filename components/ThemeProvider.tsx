"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";

type Theme =
  | "purple-blue"
  | "emerald-teal"
  | "orange-pink"
  | "cyan-violet"
  | "rose-indigo";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("purple-blue");

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem("selectedPalette") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    console.log("Setting theme to:", newTheme);
    setTheme(newTheme);
    localStorage.setItem("selectedPalette", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
