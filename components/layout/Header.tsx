"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";

const NAV_LINKS = [
  { label: "Product",  href: "#" },
  { label: "Pricing",  href: "#" },
  { label: "About",    href: "#" },
  { label: "Showcase", href: "/showcase" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-canvas">
        <div className="flex items-center justify-between px-md py-md lg:px-lg">

          {/* Wordmark */}
          <Link
            href="/"
            className="text-sm font-extrabold tracking-[0.12em] uppercase text-fg"
          >
            OptiTech
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden lg:flex items-center gap-lg"
            aria-label="Primary navigation"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-normal text-fg-muted
                           transition-colors duration-150 ease-quick
                           hover:text-fg"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop controls: theme toggle + CTA */}
          <div className="hidden lg:flex items-center gap-md">
            <ThemeToggle />
            <Link
              href="#"
              className="bg-brand hover:bg-brand-hover
                         text-fg-on-brand text-label font-semibold tracking-label uppercase
                         px-7 py-3
                         transition-colors duration-150 ease-quick
                         focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-[3px]"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile controls: theme toggle + hamburger */}
          <div className="lg:hidden flex items-center gap-sm">
            <ThemeToggle />
            <button
              type="button"
              className="flex flex-col justify-center gap-1.5 p-sm"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span
                className={`block w-5 h-px bg-fg origin-center transition-transform duration-200 ease-quick
                            ${menuOpen ? "translate-y-0.75 rotate-45" : ""}`}
              />
              <span
                className={`block w-5 h-px bg-fg transition-opacity duration-150
                            ${menuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block w-5 h-px bg-fg origin-center transition-transform duration-200 ease-quick
                            ${menuOpen ? "-translate-y-0.75 -rotate-45" : ""}`}
              />
            </button>
          </div>

        </div>
      </header>

      {/* Mobile full-height overlay — sits below sticky header via z-40 */}
      <div
        aria-hidden={!menuOpen}
        className={`lg:hidden fixed inset-0 z-40 bg-canvas flex flex-col pt-20 px-md
                    transition-opacity duration-200 ease-quick
                    ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <nav aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block text-headline font-bold text-fg py-md border-b border-fg/10
                         hover:text-fg-muted transition-colors duration-150 ease-quick"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-lg">
          <Link
            href="#"
            className="inline-block bg-brand hover:bg-brand-hover
                       text-fg-on-brand text-label font-semibold tracking-label uppercase
                       px-12 py-4
                       transition-colors duration-150 ease-quick"
            onClick={() => setMenuOpen(false)}
          >
            Get Started
          </Link>
        </div>
      </div>
    </>
  );
}
