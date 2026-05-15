import type { Metadata } from "next";
import { SectionLabel, Token, Ground } from "../components";

export const metadata: Metadata = {
  title: "Tokens — Design System — OptiTech",
};

// ── Data ─────────────────────────────────────────────────────────────────────

const COLORS = [
  {
    token: "--ot-brand",
    twBg: "bg-brand",
    name: "Brand",
    darkValue:  "oklch(55% 0.18 195)",
    lightValue: "oklch(55% 0.18 195)",
    modeFixed: true,
    usage: "Primary fill. Commits to large surface areas: hero panels, section backgrounds, primary CTAs. 30–60% of primary views. Replace to rebrand.",
    border: false,
  },
  {
    token: "--ot-brand-hover",
    twBg: "bg-brand-hover",
    name: "Brand Hover",
    darkValue:  "oklch(38% 0.16 195)",
    lightValue: "oklch(38% 0.16 195)",
    modeFixed: true,
    usage: "Brand depth variant. Hover and active states on brand-colored surfaces and buttons.",
    border: false,
  },
  {
    token: "--ot-canvas",
    twBg: "bg-canvas",
    name: "Canvas",
    darkValue:  "oklch(12% 0.012 195)",
    lightValue: "oklch(97% 0.005 195)",
    modeFixed: false,
    usage: "Outermost page background. Deepest dark in dark mode; near-white (teal-tinted) in light mode.",
    border: true,
  },
  {
    token: "--ot-surface",
    twBg: "bg-surface",
    name: "Surface",
    darkValue:  "oklch(20% 0.022 195)",
    lightValue: "oklch(93% 0.008 195)",
    modeFixed: false,
    usage: "Component surface — one tone above canvas. Panels, feature sections, form backgrounds.",
    border: false,
  },
  {
    token: "--ot-fg",
    twBg: "bg-fg",
    name: "Foreground",
    darkValue:  "oklch(97% 0.005 195)",
    lightValue: "oklch(12% 0.012 195)",
    modeFixed: false,
    usage: "Primary text and content. High contrast against canvas in both modes. Also used for UI chrome.",
    border: false,
  },
  {
    token: "--ot-fg-muted",
    twBg: "bg-fg-muted",
    name: "Foreground Muted",
    darkValue:  "oklch(68% 0.06 195)",
    lightValue: "oklch(38% 0.05 195)",
    modeFixed: false,
    usage: "Secondary text. Navigation links at rest, metadata, labels, de-emphasised content.",
    border: false,
  },
  {
    token: "--ot-fg-on-brand",
    twBg: "bg-fg-on-brand",
    name: "Foreground on Brand",
    darkValue:  "oklch(97% 0.005 195)",
    lightValue: "oklch(97% 0.005 195)",
    modeFixed: true,
    usage: "Text and borders placed on brand-colored fills. Always light — the brand teal requires high-contrast foreground in both modes.",
    border: false,
  },
  {
    token: "--ot-accent",
    twBg: "bg-accent",
    name: "Accent",
    darkValue:  "oklch(82% 0.19 145)",
    lightValue: "oklch(82% 0.19 145)",
    modeFixed: true,
    usage: "Signal green. Badges, highlights, secondary CTAs, and moments needing vivid contrast against teal.",
    border: false,
  },
  {
    token: "--ot-accent-hover",
    twBg: "bg-accent-hover",
    name: "Accent Hover",
    darkValue:  "oklch(68% 0.17 145)",
    lightValue: "oklch(68% 0.17 145)",
    modeFixed: true,
    usage: "Deeper signal green for hover and active states on accent-colored surfaces.",
    border: false,
  },
  {
    token: "--ot-fg-on-accent",
    twBg: "bg-fg-on-accent",
    name: "Foreground on Accent",
    darkValue:  "oklch(12% 0.012 195)",
    lightValue: "oklch(12% 0.012 195)",
    modeFixed: true,
    usage: "Dark text and icons on accent surfaces.",
    border: false,
  },
] as const;

const TYPE_SCALE = [
  {
    label: "Display",
    token: "--ot-text-display",
    meta: "Poppins 800 · clamp(3rem, 8vw, 6rem) · lh 0.9 · ls −0.03em",
    classes: "text-display leading-display tracking-display font-extrabold",
    sample: "OptiTech.",
  },
  {
    label: "Headline",
    token: "--ot-text-headline",
    meta: "Poppins 700 · clamp(1.75rem, 4vw, 2.75rem) · lh 1.05 · ls −0.02em",
    classes: "text-headline leading-headline tracking-headline font-bold",
    sample: "Built with conviction.",
  },
  {
    label: "Title",
    token: "--ot-text-title",
    meta: "Poppins 600 · 1.25rem · lh 1.3 · ls −0.01em",
    classes: "text-title leading-title tracking-title font-semibold",
    sample: "Feature highlight label",
  },
  {
    label: "Body",
    token: "--ot-text-body",
    meta: "Poppins 400 · 1rem · lh 1.65 · max 70ch",
    classes: "text-body leading-body font-normal",
    sample:
      "OptiTech is designed for people who want clarity, not noise. The copy earns attention rather than demanding it — every word works toward a single outcome: a visitor who leaves with enough confidence to take the next step.",
  },
  {
    label: "Label",
    token: "--ot-text-label",
    meta: "Poppins 600 · 0.8125rem · ls +0.06em · uppercase",
    classes: "text-label tracking-label font-semibold uppercase",
    sample: "Section tag · Metadata · Timestamp",
  },
] as const;

const POPPINS_WEIGHTS = [
  { weight: "100", label: "Thin",       twClass: "font-thin"      },
  { weight: "200", label: "ExtraLight", twClass: "font-extralight" },
  { weight: "300", label: "Light",      twClass: "font-light"      },
  { weight: "400", label: "Normal",     twClass: "font-normal"     },
  { weight: "500", label: "Medium",     twClass: "font-medium"     },
  { weight: "600", label: "SemiBold",   twClass: "font-semibold"   },
  { weight: "700", label: "Bold",       twClass: "font-bold"       },
  { weight: "800", label: "ExtraBold",  twClass: "font-extrabold"  },
  { weight: "900", label: "Black",      twClass: "font-black"      },
] as const;

const SYNE_VARIANTS = [
  {
    label: "Clean",
    darkColor:  "oklch(97% 0.005 195)",
    lightColor: "oklch(12% 0.012 195)",
    hollow: false,
    lightContrastWarning: false,
    token: "font-syne text-fg",
    usage: "Default state. Near-white on dark, dark on light.",
  },
  {
    label: "Brand",
    darkColor:  "oklch(55% 0.18 195)",
    lightColor: "oklch(55% 0.18 195)",
    hollow: false,
    lightContrastWarning: false,
    token: "font-syne text-brand",
    usage: "Brand teal. Signature OptiTech color for section openers and pull quotes.",
  },
  {
    label: "Accent",
    darkColor:  "oklch(82% 0.19 145)",
    lightColor: "oklch(82% 0.19 145)",
    hollow: false,
    lightContrastWarning: true,
    token: "font-syne text-accent",
    usage: "Signal green. Electric contrast against teal surfaces.",
  },
  {
    label: "Hollow",
    darkColor:  "transparent",
    lightColor: "transparent",
    hollow: true,
    lightContrastWarning: false,
    token: "font-syne syne-hollow",
    usage: "Wire letterforms: transparent fill, brand stroke. Best at headline size and above.",
  },
] as const;

const DISPLAY_GRADIENTS = [
  {
    label: "Brand Sweep",
    cssClass: "display-gradient-brand",
    usage: "Teal-family depth. Light-leading edge deepens to brand-hover at the tail.",
  },
  {
    label: "Signal to Teal",
    cssClass: "display-gradient-warm",
    usage: "Signal green to brand teal: electric at the start, grounded at the close.",
  },
  {
    label: "Luminous",
    cssClass: "display-gradient-luminous",
    usage: "Near-white bleeding into brand teal. Lit-from-above quality.",
  },
  {
    label: "Electric",
    cssClass: "display-gradient-ember",
    usage: "Signal green monochromatic: bright to deep. High tension within the accent family.",
  },
] as const;

const SPACING = [
  { token: "--ot-space-xs",  name: "xs",  value: "4px"   },
  { token: "--ot-space-sm",  name: "sm",  value: "8px"   },
  { token: "--ot-space-md",  name: "md",  value: "16px"  },
  { token: "--ot-space-lg",  name: "lg",  value: "32px"  },
  { token: "--ot-space-xl",  name: "xl",  value: "64px"  },
  { token: "--ot-space-2xl", name: "2xl", value: "128px" },
] as const;

const MOTION = [
  {
    label: "Kinetic",
    token: "--ot-ease-kinetic",
    twClass: "ease-kinetic",
    value: "cubic-bezier(0.16, 1, 0.3, 1)",
    curve: "Expo ease-out",
    usage: "Choreographed entrances and large motion statements. Elements arrive fast, settle decisively.",
  },
  {
    label: "Quick",
    token: "--ot-ease-quick",
    twClass: "ease-quick",
    value: "cubic-bezier(0.25, 1, 0.5, 1)",
    curve: "Quart ease-out",
    usage: "UI state transitions: hover colors, focus rings, short-distance micro-interactions.",
  },
] as const;

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ShowcaseTokensPage() {
  return (
    <>
      {/* ── 01 Colors ── */}
      <section id="colors" className="px-md py-xl lg:px-lg">
        <SectionLabel index="01 · Tokens" title="Color Palette" />
        <p className="text-body leading-body text-fg-muted mb-lg max-w-[65ch]">
          Tokens use semantic role names so any theme can be applied by replacing values in{" "}
          <Token name="styles/tokens.css" /> without touching component code.
          Swatches reflect the active mode — toggle dark / light to compare.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-lg">
          {COLORS.map((c) => (
            <div key={c.token}>
              <div
                className={`h-20 w-full ${c.twBg} ${c.border ? "border border-fg/15" : ""}`}
              />
              <div className="mt-sm space-y-xs">
                <div className="flex items-center gap-sm flex-wrap">
                  <p className="text-title font-semibold leading-title text-fg">{c.name}</p>
                  {c.modeFixed && (
                    <span className="text-label tracking-label uppercase font-semibold text-brand">
                      Fixed
                    </span>
                  )}
                </div>
                {c.modeFixed ? (
                  <p className="font-mono text-label text-fg-muted">{c.darkValue}</p>
                ) : (
                  <div className="flex flex-col gap-xs">
                    <p className="font-mono text-label text-fg-muted">
                      <span className="text-fg-muted/50">dark </span>{c.darkValue}
                    </p>
                    <p className="font-mono text-label text-fg-muted">
                      <span className="text-fg-muted/50">light </span>{c.lightValue}
                    </p>
                  </div>
                )}
                <p className="text-label text-fg-muted leading-body">{c.usage}</p>
                <Token name={c.token} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 02 Typography ── */}
      <section id="typography" className="px-md py-xl lg:px-lg">
        <SectionLabel index="02 · Tokens" title="Type Scale" />
        <div className="flex flex-col gap-xl">
          {TYPE_SCALE.map((t) => (
            <div key={t.label}>
              <div className="flex flex-wrap items-baseline gap-x-md gap-y-xs mb-md">
                <span className="text-label tracking-label uppercase text-brand font-semibold">
                  {t.label}
                </span>
                <span className="font-mono text-label text-fg-muted/60">{t.meta}</span>
              </div>
              <p className={`text-fg ${t.classes}`}>{t.sample}</p>
              <div className="mt-sm">
                <Token name={t.token} />
              </div>
            </div>
          ))}
        </div>

        {/* On brand surface */}
        <div className="mt-xl border-t border-fg/10 pt-lg">
          <p className="text-label tracking-label uppercase text-fg-muted mb-md font-semibold">
            On Brand Surface
          </p>
          <div className="bg-brand p-lg">
            <p className="text-label tracking-label uppercase text-fg-on-brand/60 font-semibold mb-xs">
              Label on brand
            </p>
            <h3 className="text-headline font-bold leading-headline tracking-headline text-fg-on-brand">
              Forward momentum.
            </h3>
            <p className="text-body leading-body text-fg-on-brand/80 mt-md max-w-[55ch]">
              Body copy on the brand surface uses{" "}
              <code className="font-mono text-fg-on-brand">fg-on-brand</code> — always
              light, regardless of mode.
            </p>
          </div>
        </div>

        {/* Poppins weight spectrum */}
        <div className="mt-xl border-t border-fg/10 pt-lg">
          <div className="flex items-baseline gap-md mb-md">
            <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
              Poppins Weight Spectrum
            </p>
            <span className="font-mono text-label text-fg-muted/50">
              100 – 900 · all weights loaded
            </span>
          </div>
          <div className="flex flex-col divide-y divide-fg/5">
            {POPPINS_WEIGHTS.map((w) => (
              <div key={w.weight} className="flex items-center gap-md py-sm">
                <div className="w-36 shrink-0 flex items-baseline gap-sm">
                  <span className="font-mono text-label text-fg-muted/40 w-8 tabular-nums">
                    {w.weight}
                  </span>
                  <span className="text-label tracking-label uppercase text-fg-muted font-semibold">
                    {w.label}
                  </span>
                </div>
                <p className={`text-title leading-title text-fg flex-1 ${w.twClass}`}>
                  OptiTech — precision craft.
                </p>
                <Token name={w.twClass} />
              </div>
            ))}
          </div>
        </div>

        {/* Syne accent header variants */}
        <div className="mt-xl border-t border-fg/10 pt-lg">
          <div className="flex items-baseline gap-md mb-xs">
            <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
              Syne
            </p>
            <span className="font-mono text-label text-fg-muted/50">
              Variable 400–800 · wght 450 · accent headers
            </span>
          </div>
          <p className="text-label text-fg-muted leading-body mb-lg max-w-[60ch]">
            Geometric variable font for accent headers and pull moments. Weight
            locked to 450. Use at most once per viewport.
          </p>
          <div className="flex flex-col gap-md">
            {SYNE_VARIANTS.map((v) => (
              <div key={v.label}>
                <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs mb-sm">
                  <span className="text-label tracking-label uppercase text-brand font-semibold">
                    {v.label}
                  </span>
                  <span className="text-label text-fg-muted/60 flex-1 min-w-0">{v.usage}</span>
                  <Token name={v.token} />
                </div>
                <div className="grid grid-cols-2 gap-sm">
                  <div className="p-lg flex flex-col gap-xs" style={{ background: "oklch(12% 0.012 195)" }}>
                    <p className="text-label tracking-label uppercase font-semibold" style={{ color: "oklch(68% 0.06 195)" }}>
                      Dark
                    </p>
                    <p
                      className={`font-syne text-headline leading-none tracking-headline${v.hollow ? " syne-hollow" : ""}`}
                      style={{ fontWeight: 450, color: v.darkColor }}
                    >
                      Forward.
                    </p>
                  </div>
                  <div className="p-lg flex flex-col gap-xs" style={{ background: "oklch(97% 0.005 195)" }}>
                    <p className="text-label tracking-label uppercase font-semibold" style={{ color: "oklch(38% 0.05 195)" }}>
                      Light{v.lightContrastWarning ? " · low contrast" : ""}
                    </p>
                    <p
                      className={`font-syne text-headline leading-none tracking-headline${v.hollow ? " syne-hollow" : ""}`}
                      style={{ fontWeight: 450, color: v.lightColor }}
                    >
                      Forward.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Display text gradients */}
        <div className="mt-xl border-t border-fg/10 pt-lg">
          <div className="flex items-baseline gap-md mb-xs">
            <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
              Display Gradients
            </p>
            <span className="font-mono text-label text-fg-muted/50">
              text-display · 4 palette variants · adapts to active theme
            </span>
          </div>
          <p className="text-label text-fg-muted leading-body mb-lg max-w-[60ch]">
            Gradient fills for display-sized type only. Use once per composition.
          </p>
          <div className="flex flex-col gap-lg">
            {DISPLAY_GRADIENTS.map((g) => (
              <div key={g.label}>
                <div className="grid grid-cols-2 gap-xs mb-sm">
                  <div className="p-lg" style={{ background: "oklch(12% 0.012 195)" }}>
                    <p className="text-label tracking-label uppercase font-semibold mb-sm" style={{ color: "oklch(68% 0.06 195)" }}>
                      Dark
                    </p>
                    <p className={`text-display font-extrabold leading-display tracking-display ${g.cssClass}`}>
                      OptiTech.
                    </p>
                  </div>
                  <div data-theme="light" className="p-lg" style={{ background: "oklch(97% 0.005 195)" }}>
                    <p className="text-label tracking-label uppercase font-semibold mb-sm" style={{ color: "oklch(38% 0.05 195)" }}>
                      Light
                    </p>
                    <p className={`text-display font-extrabold leading-display tracking-display ${g.cssClass}`}>
                      OptiTech.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-baseline gap-x-md gap-y-xs">
                  <p className="text-label tracking-label uppercase font-semibold text-fg-muted">
                    {g.label}
                  </p>
                  <p className="text-label text-fg-muted/70 flex-1 min-w-0">{g.usage}</p>
                  <code className="inline-block font-mono text-label px-sm py-xs bg-surface text-fg-muted">
                    .{g.cssClass}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 03 Buttons ── */}
      <section id="buttons" className="px-md py-xl lg:px-lg">
        <SectionLabel index="03 · Tokens" title="Buttons" />
        <div className="flex flex-col gap-lg">
          <Ground label="On Canvas" className="bg-canvas border border-fg/10">
            <div className="flex flex-col gap-sm items-start">
              <button
                type="button"
                className="bg-brand hover:bg-brand-hover text-fg-on-brand text-label font-semibold tracking-label uppercase
                           px-12 py-4 transition-colors duration-150 ease-quick
                           focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-[3px]"
              >
                Get Started
              </button>
              <p className="text-label text-fg-muted">Primary</p>
            </div>
            <div className="flex flex-col gap-sm items-start">
              <button
                type="button"
                className="border border-fg/40 hover:border-fg/70 hover:bg-fg/8
                           text-fg text-label font-semibold tracking-label uppercase
                           px-12 py-4 transition-colors duration-150 ease-quick
                           focus-visible:outline-2 focus-visible:outline-fg focus-visible:outline-offset-[3px]"
              >
                Learn More
              </button>
              <p className="text-label text-fg-muted">Ghost</p>
            </div>
            <div className="flex flex-col gap-sm items-start">
              <button
                type="button"
                className="bg-brand hover:bg-brand-hover text-fg-on-brand text-label font-semibold tracking-label uppercase
                           px-7 py-3 transition-colors duration-150 ease-quick
                           focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-[3px]"
              >
                Get Started
              </button>
              <p className="text-label text-fg-muted">Primary · Nav scale</p>
            </div>
          </Ground>

          <Ground label="On Brand" className="bg-brand">
            <div className="flex flex-col gap-sm items-start">
              <button
                type="button"
                className="bg-brand-hover hover:bg-canvas text-fg-on-brand text-label font-semibold tracking-label uppercase
                           px-12 py-4 transition-colors duration-150 ease-quick
                           focus-visible:outline-2 focus-visible:outline-fg-on-brand focus-visible:outline-offset-[3px]"
              >
                Get Started
              </button>
              <p className="text-label text-fg-on-brand/60">Primary</p>
            </div>
            <div className="flex flex-col gap-sm items-start">
              <button
                type="button"
                className="border border-fg-on-brand/40 hover:border-fg-on-brand/70 hover:bg-fg-on-brand/8
                           text-fg-on-brand text-label font-semibold tracking-label uppercase
                           px-12 py-4 transition-colors duration-150 ease-quick
                           focus-visible:outline-2 focus-visible:outline-fg-on-brand focus-visible:outline-offset-[3px]"
              >
                Learn More
              </button>
              <p className="text-label text-fg-on-brand/60">Ghost</p>
            </div>
          </Ground>
        </div>
      </section>

      {/* ── 04 Form Elements ── */}
      <section id="inputs" className="px-md py-xl lg:px-lg">
        <SectionLabel index="04 · Tokens" title="Form Elements" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
          <div>
            <p className="text-label tracking-label uppercase text-fg-muted mb-md font-semibold">Default</p>
            <div className="bg-surface p-md">
              <label className="block text-label tracking-label uppercase text-fg-muted mb-sm font-semibold">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                readOnly
                className="w-full bg-canvas border border-fg/15 text-fg placeholder:text-fg-muted
                           text-body font-normal rounded-input px-md py-sm outline-none"
              />
            </div>
          </div>
          <div>
            <p className="text-label tracking-label uppercase text-fg-muted mb-md font-semibold">Focus</p>
            <div className="bg-surface p-md">
              <label className="block text-label tracking-label uppercase text-fg-muted mb-sm font-semibold">
                Email address
              </label>
              <input
                type="email"
                defaultValue="tim@optitech.io"
                readOnly
                className="w-full bg-canvas border border-brand text-fg text-body font-normal rounded-input px-md py-sm outline-none"
              />
              <p className="text-label text-fg-muted/60 mt-xs">Border shifts to brand. No glow.</p>
            </div>
          </div>
          <div>
            <p className="text-label tracking-label uppercase text-fg-muted mb-md font-semibold">Error</p>
            <div className="bg-surface p-md">
              <label className="block text-label tracking-label uppercase text-fg-muted mb-sm font-semibold">
                Email address
              </label>
              <input
                type="email"
                defaultValue="not-an-email"
                readOnly
                className="w-full bg-canvas text-fg text-body font-normal rounded-input px-md py-sm outline-none"
                style={{ border: "1px solid oklch(60% 0.22 25)" }}
              />
              <p className="text-label mt-xs" style={{ color: "oklch(60% 0.22 25)" }}>
                Enter a valid email address.
              </p>
            </div>
          </div>
        </div>
        <p className="text-label text-fg-muted leading-body mt-lg">
          Radius exception: inputs use <code className="font-mono text-fg">rounded-input</code> (4px).
          All other components use sharp corners.
        </p>
      </section>

      {/* ── 05 Spacing ── */}
      <section id="spacing" className="px-md py-xl lg:px-lg">
        <SectionLabel index="05 · Tokens" title="Spacing Scale" />
        <div className="flex flex-col gap-md">
          {SPACING.map((s) => (
            <div key={s.token} className="flex items-center gap-md">
              <div className="w-12 shrink-0">
                <span className="text-label tracking-label uppercase text-fg font-semibold">{s.name}</span>
              </div>
              <div className="h-5 bg-brand shrink-0" style={{ width: s.value }} />
              <div className="flex items-center gap-sm flex-wrap">
                <span className="font-mono text-label text-fg-muted">{s.value}</span>
                <Token name={s.token} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 06 Motion ── */}
      <section id="motion" className="px-md py-xl lg:px-lg">
        <SectionLabel index="06 · Tokens" title="Motion" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md mb-md">
          {MOTION.map((m) => (
            <div key={m.token} className="bg-surface p-lg">
              <div className="flex items-baseline gap-md mb-sm">
                <p className="text-label tracking-label uppercase text-brand font-semibold">{m.label}</p>
                <span className="text-label text-fg-muted/60 font-mono">{m.curve}</span>
              </div>
              <p className="font-mono text-label text-fg/80 mb-md">{m.value}</p>
              <p className="text-label text-fg-muted leading-body mb-md">{m.usage}</p>
              <div className="flex flex-wrap gap-sm">
                <Token name={m.token} />
                <Token name={m.twClass} />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-surface p-lg">
          <p className="text-label tracking-label uppercase text-fg-muted mb-sm font-semibold">
            Reduced Motion
          </p>
          <p className="text-label text-fg-muted leading-body">
            All transitions must degrade to instant display when{" "}
            <code className="font-mono text-fg">prefers-reduced-motion: reduce</code>{" "}
            is set. Use the Tailwind{" "}
            <code className="font-mono text-fg">motion-safe:</code>{" "}
            variant or wrap in{" "}
            <code className="font-mono text-fg">@media (prefers-reduced-motion: no-preference)</code>.
          </p>
        </div>
      </section>
    </>
  );
}
