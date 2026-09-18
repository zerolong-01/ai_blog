"use client";

import { useSyncExternalStore } from "react";

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function getTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerTheme() {
  return "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, getTheme, getServerTheme);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    try {
      window.localStorage.setItem("theme", nextTheme);
    } catch {
      // The current page can still switch themes when browser storage is unavailable.
    }
  }

  return (
    <button className="themeToggle" onClick={toggleTheme} type="button" aria-label="Toggle theme">
      {theme === "dark" ? "Light" : "Dark"} mode
    </button>
  );
}
