import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "night-light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: "light", toggleTheme: () => {} });

const THEME_ORDER: Theme[] = ["light", "dark", "night-light"];

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("feastfleet-theme") as Theme | null;
    if (stored && THEME_ORDER.includes(stored)) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "night-light");
    if (theme === "dark") root.classList.add("dark");
    if (theme === "night-light") root.classList.add("night-light");
    localStorage.setItem("feastfleet-theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => {
      const idx = THEME_ORDER.indexOf(t);
      return THEME_ORDER[(idx + 1) % THEME_ORDER.length];
    });

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
