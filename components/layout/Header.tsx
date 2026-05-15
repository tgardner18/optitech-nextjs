"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Button from "@/components/ui/Button";

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
      <header className="sticky top-0 z-50 bg-canvas/80 backdrop-blur-md border-b border-fg/5">
        <div className="flex items-center justify-between px-md py-md lg:px-lg">

          {/* Logo */}
          <Link href="/" aria-label="OptiTech — Home">
            <Image
              src="/brand/logo/OT.png"
              alt="OptiTech"
              width={160}
              height={40}
              className="h-10 w-auto"
              priority
            />
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
            <Button href="#" size="sm">Get Started</Button>
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
          <Button href="#" onClick={() => setMenuOpen(false)}>Get Started</Button>
        </div>
      </div>
    </>
  );
}
