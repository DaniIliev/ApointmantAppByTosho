// @/context/ThemeContext.tsx (МОДИФИЦИРАН)
"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

// Дефинирай всички възможни класове на палитрата
type Theme = "theme-blue" | "theme-green" | "theme-purple" | "theme-red";
const ALL_THEME_CLASSES: Theme[] = [
  "theme-blue",
  "theme-green",
  "theme-purple",
  "theme-red",
];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // theme-blue е твоята default палитра от :root
  const [theme, setTheme] = useState<Theme>(() => {
    // Зареждаме темата синхронно при първоначалния рендер
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("selectedPalette") as Theme;
      return savedTheme && ALL_THEME_CLASSES.includes(savedTheme)
        ? savedTheme
        : "theme-blue";
    }
    return "theme-blue";
  });

  useEffect(() => {
    // Прилагаме темата към DOM при монтиране
    applyThemeClass(theme);
  }, []);

  const applyThemeClass = (themeClass: Theme) => {
    const html = document.documentElement;

    // 1. Премахваме всички възможни класове за палитри
    ALL_THEME_CLASSES.forEach((t) => {
      html.classList.remove(t);
    });

    // 2. Добавяме избрания клас
    html.classList.add(themeClass);
  };

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("selectedPalette", newTheme);
    applyThemeClass(newTheme); // Прилагаме промяната към DOM-а
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
            {children}   {" "}
    </ThemeContext.Provider>
  );
}

export function usePaletteTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
