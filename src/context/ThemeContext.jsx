"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider } from "flowbite-react";
import { customTheme } from "@/context/theme";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

export function CustomThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  // On mount, read the persisted preference or system preference
  useEffect(() => {
    const stored = localStorage.getItem("hisab-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved = stored ?? (prefersDark ? "dark" : "light");
    applyTheme(resolved);
    setTheme(resolved);
  }, []);

  function applyTheme(value) {
    const root = document.documentElement;
    if (value === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }

  function toggleTheme() {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("hisab-theme", next);
      applyTheme(next);
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ThemeProvider theme={customTheme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
