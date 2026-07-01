import type { Route } from "next";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Reviews" },
  { href: "/categories", label: "Categories" },
  { href: "/search", label: "Search" }
] satisfies Array<{ href: Route; label: string }>;

export function Header() {
  return (
    <header className="siteHeader">
      <div className="container navShell">
        <Link href="/" className="brandMark">
          <span className="brandBadge">AI</span>
          <span>
            <strong>Stacked AI Reviews</strong>
            <small>Tools worth your time</small>
          </span>
        </Link>

        <nav className="mainNav" aria-label="Primary">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
