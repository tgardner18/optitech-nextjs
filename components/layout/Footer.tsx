import Link from "next/link";
import Image from "next/image";

const FOOTER_LINKS = [
  { label: "Product", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "About",   href: "#" },
  { label: "Contact", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-canvas border-t border-fg/10">
      <div className="px-md py-xl lg:px-lg">

        <div className="flex flex-col gap-lg lg:flex-row lg:items-start lg:justify-between">

          {/* Logo */}
          <Link
            href="/"
            aria-label="OptiTech — Home"
            className="opacity-100 hover:opacity-80 transition-opacity duration-150 ease-quick"
          >
            <Image
              src="/brand/logo/OT.png"
              alt="OptiTech"
              width={160}
              height={40}
              className="h-9 w-auto"
            />
          </Link>

          {/* Nav links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-md lg:gap-lg">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-normal text-fg-muted
                               hover:text-fg transition-colors duration-150 ease-quick"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

        </div>

        {/* Copyright bar */}
        <div className="mt-xl pt-md border-t border-fg/10">
          <p className="text-label tracking-label uppercase text-fg-muted">
            &copy; {new Date().getFullYear()} OptiTech. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
