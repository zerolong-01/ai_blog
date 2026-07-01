"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const nextTheme = document.documentElement.dataset.theme || "light";
    setTheme(nextTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("theme", nextTheme);
  }

  return (
    <button className="themeToggle" onClick={toggleTheme} type="button" aria-label="Toggle theme">
      {theme === "dark" ? "Light" : "Dark"} mode
    </button>
  );
}
