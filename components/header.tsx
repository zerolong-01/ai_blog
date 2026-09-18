"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Blog" },
  { href: "/series", label: "Series" },
  { href: "/search", label: "Search" }
] satisfies Array<{ href: Route; label: string }>;

export function Header() {
  const pathname = usePathname();
  const [menuState, setMenuState] = useState({ pathname, open: false });
  const menuOpen = menuState.pathname === pathname && menuState.open;
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  if (menuState.pathname !== pathname) {
    setMenuState({ pathname, open: false });
  }

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuState({ pathname, open: false });
        menuButtonRef.current?.focus();
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen, pathname]);

  function isCurrentPage(href: Route) {
    if (href === "/") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="siteHeader">
      <div className="container navShell">
        <Link href="/" className="brandMark">
          <span className="brandGlyph" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>
            <strong>Stacked AI</strong>
            <small>INTELLIGENCE / APPLIED</small>
          </span>
        </Link>

        <button
          ref={menuButtonRef}
          type="button"
          className="mobileMenuToggle"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMenuState({ pathname, open: !menuOpen })}
        >
          <span className="menuIcon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>{menuOpen ? "Close" : "Menu"}</span>
        </button>

        <div id="primary-navigation" className={`navMenu ${menuOpen ? "navMenuOpen" : ""}`}>
          <nav className="mainNav" aria-label="Primary">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isCurrentPage(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="navActions">
            <ThemeToggle />
            <Link href="/tools" className="navCta">
              Read blog
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
