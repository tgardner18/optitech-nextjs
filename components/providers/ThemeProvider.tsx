"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function setThemeCookie(theme: Theme) {
  document.cookie = `site-theme=${theme}; path=/; SameSite=Lax; max-age=31536000`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to "dark" — matches the SSR fallback. On mount we sync from the
  // actual data-theme attribute (already set correctly by the server via cookie).
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme") as Theme | null;
    const current: Theme = attr === "light" ? "light" : "dark";

    // Migration: if no site-theme cookie exists yet (first visit after the
    // localStorage-based approach), write localStorage → cookie so subsequent
    // SSR requests get the right theme without a client-side fixup.
    const hasCookie = document.cookie.split(";").some(c => c.trim().startsWith("site-theme="));
    if (!hasCookie) {
      try {
        const ls = localStorage.getItem("site-theme") as Theme | null;
        if (ls === "light" || ls === "dark") {
          setThemeCookie(ls);
          if (ls !== current) {
            document.documentElement.setAttribute("data-theme", ls);
            setTheme(ls);
            return;
          }
        } else {
          // No localStorage value either — write the CMS default as the cookie
          // so the next SSR request is consistent.
          setThemeCookie(current);
        }
      } catch {}
    }

    setTheme(current);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      setThemeCookie(next);
      try { localStorage.setItem("site-theme", next); } catch {}
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
