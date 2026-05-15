import type { Metadata } from "next";
import { SectionLabel } from "./components";

export const metadata: Metadata = {
  title: "Design System — OptiTech",
};

const SECTIONS = [
  {
    number: "01",
    label: "Design Tokens",
    href: "/showcase/tokens",
    count: "6 categories",
    description:
      "The foundational layer: color, typography, spacing, motion, buttons, and form elements. Defined in tokens.css — replace values to rebrand without touching any component.",
  },
  {
    number: "02",
    label: "Block Components",
    href: "/showcase/blocks",
    count: "5 blocks",
    description:
      "CMS-driven, composable sections. Each block maps style options 1:1 to content properties and resolves variants through CVA. Grouped by content type: hero, typography, quote, media.",
  },
  {
    number: "03",
    label: "Page Types",
    href: "/showcase/pages",
    count: "Coming soon",
    description:
      "Full-page compositions showing how blocks combine. Landing, blog, feature, and campaign layouts demonstrating the system at scale.",
  },
] as const;

export default function ShowcaseOverviewPage() {
  return (
    <section className="px-md py-xl lg:px-lg">
      <SectionLabel index="00 · Welcome" title="Design System" />
      <p className="text-body leading-body text-fg-muted mb-2xl max-w-[65ch]">
        Built token-first. Every visual decision traces back to a named value
        in{" "}
        <code className="font-mono text-fg text-label">styles/tokens.css</code>.
        Replace a token value, rebrand the system.
      </p>

      <div className="flex flex-col">
        {SECTIONS.map((s) => (
          <a
            key={s.href}
            href={s.href}
            className="group flex items-start gap-lg py-xl border-t border-fg/10
                       transition-colors duration-150 ease-quick"
          >
            <span
              className="font-mono font-extrabold leading-none shrink-0 select-none
                         text-fg/8 group-hover:text-brand/20 transition-colors duration-150 ease-quick
                         w-16 text-right tabular-nums"
              style={{ fontSize: "3rem", letterSpacing: "-0.02em" }}
            >
              {s.number}
            </span>
            <div className="flex-1 min-w-0 pt-xs">
              <div className="flex items-baseline gap-md mb-sm flex-wrap">
                <p className="text-title font-semibold leading-title tracking-title text-fg group-hover:text-brand transition-colors duration-150 ease-quick">
                  {s.label}
                </p>
                <span className="text-label tracking-label uppercase font-semibold text-fg-muted">
                  {s.count}
                </span>
              </div>
              <p className="text-body leading-body text-fg-muted max-w-[60ch]">
                {s.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
