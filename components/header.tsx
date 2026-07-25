"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Blog" },
  { href: "/categories", label: "Categories" },
  { href: "/search", label: "Search" }
] satisfies Array<{ href: Route; label: string }>;

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

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
          <span>
            <strong>Stacked AI</strong>
          </span>
        </Link>

        <button
          ref={menuButtonRef}
          type="button"
          className="mobileMenuToggle"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMenuOpen((open) => !open)}
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
