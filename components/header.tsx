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
          <span>
            <strong>Stacked AI</strong>
          </span>
        </Link>

        <nav className="mainNav" aria-label="Primary">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="navActions">
          <ThemeToggle />
          <Link href="/tools" className="navCta">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
