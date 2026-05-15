"use client";
import { usePathname } from "next/navigation";

const NAV = [
  {
    label: "Overview",
    href: "/showcase",
    exact: true,
    items: [],
  },
  {
    label: "Tokens",
    href: "/showcase/tokens",
    exact: false,
    items: [
      { href: "/showcase/tokens#colors",     label: "Colors"        },
      { href: "/showcase/tokens#typography", label: "Typography"    },
      { href: "/showcase/tokens#buttons",    label: "Buttons"       },
      { href: "/showcase/tokens#inputs",     label: "Form Elements" },
      { href: "/showcase/tokens#spacing",    label: "Spacing"       },
      { href: "/showcase/tokens#motion",     label: "Motion"        },
    ],
  },
  {
    label: "Components",
    href: "/showcase/blocks",
    exact: false,
    items: [
      { href: "/showcase/blocks#hero",       label: "Hero"       },
      { href: "/showcase/blocks#typography", label: "Typography" },
      { href: "/showcase/blocks#quote",      label: "Quote"      },
      { href: "/showcase/blocks#media",      label: "Media"      },
    ],
  },
  {
    label: "Page Types",
    href: "/showcase/pages",
    exact: false,
    items: [],
  },
];

export default function ShowcaseNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Showcase navigation" className="sticky top-16 p-lg overflow-y-auto max-h-[calc(100vh-4rem)]">
      <p className="text-label tracking-label uppercase text-fg-muted mb-lg font-semibold">
        Design System
      </p>
      <ul className="flex flex-col gap-lg">
        {NAV.map((group) => {
          const isActive = group.exact
            ? pathname === group.href
            : pathname.startsWith(group.href);
          return (
            <li key={group.href}>
              <a
                href={group.href}
                className={`block text-label font-semibold tracking-label uppercase mb-sm transition-colors duration-150 ease-quick ${
                  isActive ? "text-brand" : "text-fg-muted hover:text-fg"
                }`}
              >
                {group.label}
              </a>
              {group.items.length > 0 && (
                <ul className="flex flex-col gap-xs">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className={`block text-sm font-normal py-xs pl-sm transition-colors duration-150 ease-quick ${
                          isActive ? "text-fg-muted hover:text-fg" : "text-fg-muted/40"
                        }`}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
