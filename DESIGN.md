---
name: Site Accelerator
description: Configurable multi-vertical site framework. Token-driven, dark-first by default, depth-forward, choreographed motion. Full CMS theme override via ThemeManager. Impeccable-collaborative component expansion.
colors:
  brand: "var(--ot-brand)"          # default oklch(55% 0.18 195) — overrideable via ThemeManager
  brand-hover: "var(--ot-brand-hover)"
  accent: "var(--ot-accent)"        # default oklch(82% 0.19 145) — signal green
  canvas: "var(--ot-canvas)"
  surface: "var(--ot-surface)"
  fg: "var(--ot-fg)"
  fg-muted: "var(--ot-fg-muted)"
  fg-on-brand: "var(--ot-fg-on-brand)"
typography:
  display:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "clamp(3rem, 8vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    letterSpacing: "0.06em"
rounded:
  none: "0px"
  input: "4px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "32px"
  xl: "64px"
  2xl: "128px"
---

# Design System: Site Accelerator

## 1. Overview and Evolution

Site Accelerator is a **configurable, multi-vertical site framework** built on the Optimizely SaaS CMS: one shared component library and token system that can be re-themed into a credible site for any vertical (financial services, healthcare, retail, legal, and more) without code changes. Its first incarnation was a single teal brand site; that look now survives only as the **default theme** — one example skin among many, not the framework's identity.

The design framework has two jobs:

1. **Standalone quality** — the default theme (mineral teal palette, Poppins type system, dark-first grounds) must look like a considered, professional design in its own right. Not a template, not a generic demo. Something that earns attention. Every vertical theme built on the framework must clear that same bar.

2. **Rebranding surface** — everything visually distinctive is expressed through semantic CSS tokens (`--ot-brand`, `--ot-accent`, `--ot-canvas`, etc.) that the ThemeManager overrides via a CMS-injected `<style>` block. Swap the brand color and watch the entire site — bloom halos, gradient fills, button fills, blockquote borders, chromatic shadows — recalibrate automatically. (The `--ot-` token prefix is a historical name; it is theme-neutral and carries no brand meaning.)

**Creative North Star: "The Kinetic Editorial"**

Precision-crafted. Editorial confidence. Choreographed motion. This is the character of the default theme and the **craft bar every vertical theme must meet** — the framework signals its values through how convincingly it presents itself in any industry. Depth and motion are expressive tools, not decorations. A vertical theme may dial the energy up or down, but never below this standard of craft.

**What this is not:**
- A static design spec. Components expand collaboratively with impeccable, which adds polish and advanced effects.
- A fixed brand. The token system is the brand; any color, for any vertical, can be the brand.
- A single-industry look. The default theme is one expression; the framework's whole point is range across verticals.
- A vanilla Claude Code output. The depth system, bloom effects, stagger choreography, and glass surfaces are deliberately distinct from default Tailwind patterns.

---

## 2. The Theme Token System

All visual identity flows through CSS custom properties defined in `styles/tokens.css` and mapped to Tailwind utilities in `app/globals.css` via `@theme inline`.

### Semantic roles (not brand names)

| Token | Default | Role |
|---|---|---|
| `--ot-brand` | `oklch(55% 0.18 195)` | The committed color. Fills hero panels, CTAs, primary surfaces. 30–60% of primary views. |
| `--ot-brand-hover` | `oklch(38% 0.16 195)` | Depth state on brand surfaces — hover, active, shadow reference. |
| `--ot-accent` | `oklch(82% 0.19 145)` | Signal green. Badges, highlights, alternative CTAs, semantic callouts. |
| `--ot-accent-hover` | `oklch(68% 0.17 145)` | Deeper accent for hover states. |
| `--ot-canvas` | `oklch(12% 0.012 195)` | Outermost page background. Darkest in dark mode, lightest in light mode. |
| `--ot-surface` | `oklch(20% 0.022 195)` | Component panels, one elevation above canvas. |
| `--ot-fg` | `oklch(97% 0.005 195)` | Primary text. Adapts to mode. |
| `--ot-fg-muted` | `oklch(68% 0.06 195)` | Secondary text, nav links at rest, metadata. |
| `--ot-fg-on-brand` | `oklch(97% 0.005 195)` | Text on brand-colored fills. Always light for contrast. |
| `--ot-fg-on-accent` | `oklch(12% 0.012 195)` | Text on accent-colored fills. Always dark. |

### CMS theme override

The ThemeManager content type exposes color fields for each semantic token. When populated, `buildThemeCSS()` generates an inline `<style>` block injected before first paint in `app/layout.tsx`. The overrides land as `:root { --ot-brand: ...; }` and `[data-theme="light"] { ... }` rules, sitting above the defaults in source order.

**Implication for component authors:** never hardcode a color value (`oklch(55% 0.18 195)`) in component CSS. Always reference a semantic token (`var(--ot-brand)`) or its Tailwind alias (`bg-brand`, `text-fg-muted`, etc.). The bloom and gradient tokens (below) use CSS Relative Color Syntax to derive alpha variants from the semantic tokens — they update automatically when the theme changes.

### Bloom / halo tokens (auto-derived)

```css
--ot-bloom-brand:        oklch(from var(--ot-brand) l c h / 0.80)
--ot-bloom-brand-ring:   oklch(from var(--ot-brand) l c h / 0.50)
--ot-bloom-brand-faint:  oklch(from var(--ot-brand) l c h / 0.25)
--ot-bloom-brand-border: oklch(from var(--ot-brand) l c h / 0.15)
--ot-bloom-accent:        oklch(from var(--ot-accent) l c h / 0.60)
--ot-bloom-accent-ring:   oklch(from var(--ot-accent) l c h / 0.45)
--ot-bloom-accent-border: oklch(from var(--ot-accent) l c h / 0.18)
--ot-bloom-accent-faint:  oklch(from var(--ot-accent) l c h / 0.13)
```

These power chromatic shadows (`box-shadow: 0 8px 32px var(--ot-bloom-brand-faint)`), glow rings on media blocks, and card hover effects. Because they derive from the semantic tokens via relative color syntax, they follow CMS theme overrides without any additional wiring.

### Display gradient fills (four named treatments)

Available as global CSS classes. Use at display scale only, at most once per composition.

| Class | Direction | Usage |
|---|---|---|
| `.display-gradient-brand` | brand lighter → brand deeper | Primary brand statement headlines |
| `.display-gradient-warm` | accent → brand | Cross-spectrum contrast moments |
| `.display-gradient-luminous` | fg → brand | Luminous editorial headers |
| `.display-gradient-ember` | accent bright → accent deep | High-energy signal moments |

All four adapt automatically to the active theme (dark/light) and to CMS color overrides.

---

## 3. Color Philosophy

### The committed rule

The brand color fills large surface areas — it is a presence, not punctuation. In the default teal theme, Oxidized Teal fills hero panels, entire section backgrounds, CTA buttons. If a layout uses the brand color on less than 20% of its primary surface, it is drifting toward generic. Push it back.

### The tint rule

No neutral is ever truly neutral. In the default theme, canvas (dark mode) and fg-on-brand (light text) both carry the brand hue at low chroma. The palette feels like one material. When implementing custom themes via the ThemeManager, apply the same principle: canvas and surface should carry a hint of the brand hue, even at very low chroma.

### Dark-first grounds

Dark mode is the default. `data-theme="dark"` on `<html>` is set before first paint via an inline script (avoiding flash). Light mode is a full inversion of canvas/surface/fg tokens, activated by `data-theme="light"`. The brand and accent tokens are constant across modes; only the grounds and text adapt. The ThemeManager can set separate canvas/surface/fg-muted values for each mode.

---

## 4. Typography

**One themeable primary family + fixed-role companions.**

The **primary family** drives the entire hierarchy (display → body → label). It is **Poppins by default and swappable per vertical** through the ThemeManager "Primary Font" axis, which overrides the `--ot-font-sans` token (Tailwind `font-sans`). Every primary ships the same 300–800 weight ladder, so all type levels hold across a swap with no FOUT (`display: swap` + build-time `next/font`).

| Token / axis value | Font | Role |
|---|---|---|
| `--ot-font-sans` (default) | Poppins | Primary — the whole hierarchy: display, headline, title, body, label, buttons, nav. |
| Primary axis → `--font-primary-a` | Source Serif 4 | Primary alternate — institutional / editorial pole (medical, financial, legal). The one sanctioned serif. |
| Primary axis → `--font-primary-b` | Sora | Primary alternate — precise / engineered pole (technical brands). |
| Primary axis → `--font-primary-c` | Bricolage Grotesque | Primary alternate — expressive / character pole. |
| `--font-syne` | Syne (variable) | Fixed accent/display only. Section openers, pull quotes. Once per viewport max. Not themeable. |
| `--font-mono` | Geist Mono | Code samples, technical labels, data readouts. |
| `--ot-font-signature` | Caveat 400 | Signature only — the QuoteBlock LaserSignature. Never general copy. |

**Component authors:** reference `--ot-font-sans` (or `font-sans`) for the primary family — never a raw `--font-poppins`, which bypasses the theme axis. **Serif is permitted only** as the Source Serif primary selected through the axis; never introduce another serif or hardcode a family.

### Scale and hierarchy

| Level | Size | Weight | Line height | Tracking | Token |
|---|---|---|---|---|---|
| Display | `clamp(3rem, 8vw, 6rem)` | 800 | 0.9 | −0.03em | `text-display` |
| Headline | `clamp(1.75rem, 4vw, 2.75rem)` | 700 | 1.05 | −0.02em | `text-headline` |
| Title | `1.25rem` | 600 | 1.3 | −0.01em | `text-title` |
| Body | `1rem` | 400 | 1.65 | — | `text-body` |
| Label | `0.8125rem` | 600 | — | +0.06em uppercase | `text-label` |

**Weight ladder rule:** Adjacent hierarchy levels must differ by at least 100 in weight. The 600→400 jump between Title and Body is the sharpest and most intentional step in the scale.

### Syne usage rules

- Weight 400–525 only. `--ot-weight-syne` is set to 450. Above 525 the geometry bloats.
- Variants: Clean (`text-fg`), Brand (`text-brand`), Hollow (`.syne-hollow` — wire letterforms via `-webkit-text-stroke`).
- Never use Syne on body copy or below headline scale.
- Never on light backgrounds with Accent color — insufficient contrast.

### Retro display headers

A sanctioned 70s/80s editorial register for **display-scale headers only**. This is not a departure from the Kinetic Editorial north star — it's the poster-confidence end of it. Two flavors are approved; both must obey the constraints below.

**Editorial / poster** — chunky extruded or isometric display type with hard 45° shadow stacks and depth. The existing `.display-extrude` (§9) and `.card-hover-tilt` are the canonical tools. Concert-poster scale and weight; commit to the depth.

**Chromatic / print** — offset channel-split (faux CMYK misregistration), halftone dot texture, and screenprint-style overprint on display headers. The "channels" are derived from the brand and accent tokens (e.g. a brand-tinted layer offset from an accent-tinted layer), never from cyan/magenta/yellow literals.

**Constraints (non-negotiable):**
- **Display scale only** — `text-display`, and at most once per composition (same budget rule as `display-gradient-*`). Never on headline, title, body, or label.
- **Tinted grounds, never pure black.** Retro treatments sit on `--ot-canvas`/`--ot-surface` (which carry brand hue at low chroma). Pure `#000` + neon is the banned synthwave look — that's the line.
- **Tokens only.** Every color in the effect resolves from `--ot-brand` / `--ot-accent` / `--ot-fg` (or their bloom derivatives). No color literals — the effect must recalibrate under a CMS theme override like everything else.
- **Legibility holds.** The underlying letterforms must still meet WCAG 2.1 AA against their ground; offset/halftone layers are decoration on top of a legible base, not a replacement for it.
- **Motion-safe.** Any animated entrance (e.g. the `--display-depth` ramp on `.display-extrude`) degrades under `prefers-reduced-motion: reduce`.

When impeccable introduces a new retro treatment (a halftone overlay utility, a channel-split class), document it as a named global utility in §9 and add it to the relevant block's display-template settings vocabulary so editors can control it.

---

## 5. Elevation and Depth

Depth is a design signal. It communicates hierarchy, surface material, and attention target. This system uses three depth instruments. Apply selectively — depth applied uniformly is noise.

### Color depth (always available)

The token system creates inherent depth without additional treatment. Surface over Canvas reads as a raised panel. Brand-filled sections command presence through saturation contrast alone. This is the baseline — every layout has it automatically.

### Glass surfaces

`backdrop-filter: blur()` creates material depth and floating. The system has **one** true-glassmorphism utility plus a heavier opaque sibling; both are token-derived and follow the theme.

**`.bg-glass` — true glassmorphism (the single reconciled philosophy).** The tint is *always* token-derived from `--ot-fg` via relative color syntax — never raw white/black — and `backdrop-filter` does the actual frosting. Because the tint reads from `--ot-fg`, it inverts with the theme automatically:
- on the default dark canvas → light frost on dark,
- in light mode → **dark** frost on light.

This is what keeps glass compliant with *"never light-frosted on light backgrounds"* — in both directions — without a second variant:
```
background:        oklch(from var(--ot-fg) l c h / 0.07);   /* low-alpha tint — blur shows through */
border:            oklch(from var(--ot-fg) l c h / 0.20);
::before sheen:    oklch(from var(--ot-fg) l c h / 0.12);
backdrop-filter:   blur(18px) saturate(180%);                /* the frosting */
```
The background MUST stay low-alpha — a high-alpha or opaque fill occludes the blur and it stops being glass.

**`.banner-glass` — heavier opaque material (intentionally NOT unified with `.bg-glass`).** A near-opaque `canvas/75` treatment for sticky/announcement bars where legibility outranks see-through. Different material, different job; do not converge the two.

**Brand-tinted glass** (`.btn-glass`, panels over brand surfaces): a brand-derived tint over the same `--ot-fg` sheen, e.g. `oklch(from var(--ot-brand) l c h / 0.16)`.

**Rule:** Glass earns its blur when there is something visually interesting beneath — an image, a brand fill, a layered section background. Glass over a flat same-color surface is a non-effect. Sticky navigation glass is always appropriate.

### Chromatic shadows (tinted to brand)

All shadows carry the brand hue. Neutral grey shadows break the mineral palette.

**Resting elevation** (cards or panels above field):
```
box-shadow: 0 4px 24px var(--ot-bloom-brand-faint)
```

**Hover intensification:**
```
box-shadow: 0 8px 32px var(--ot-bloom-brand-faint), 0 16px 48px var(--ot-bloom-accent-faint)
```

### Bloom / glow effects (media and cards)

Image and video blocks support chromatic bloom — a soft halo ring derived from `--ot-bloom-brand-ring` and `--ot-bloom-accent-ring` that appears around media elements. Cards support `.card-hover-lift` (translate + shadow) and `.card-hover-glow` (shadow intensification) global utility classes defined in `globals.css`. Both respect `prefers-reduced-motion`.

---

## 6. Motion

Motion is editorial expression — it makes momentum visible. The system has two motion instruments.

### Easing curves

| Token | Curve | Use |
|---|---|---|
| `--ot-ease-kinetic` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances, composition reveals, block animations |
| `--ot-ease-quick` | `cubic-bezier(0.25, 1, 0.5, 1)` | UI state changes — hover, focus, active |

### Stagger system (MotionObserver)

`MotionObserver` (`components/providers/MotionObserver.tsx`) is a client-side IntersectionObserver that watches `[data-stagger]` elements. When a row enters the viewport, the observer adds `data-in` and the CSS in `globals.css` animates each child column with a 120ms delay between them.

Two modes, controlled by the Visual Builder's Row display settings:
- `data-stagger="slide"` — `slideUp`: `opacity: 0 + translateY(1.5rem)` → natural position
- `data-stagger="fade"` — `fadeIn`: `opacity: 0` → `opacity: 1`

Both use `--ot-ease-kinetic` at 0.6s duration.

### Block-level animations

Individual blocks (currently HeroBlock) support an `animation` display setting: `none`, `fade`, `slide`, `parallax`. Implemented with `motion-safe:animate-fade-in` and `motion-safe:animate-slide-up` + staggered `animationDelay` values per element within the block.

### The reduced-motion requirement

Every animation and transition in the system must degrade gracefully under `prefers-reduced-motion: reduce`. Use the `motion-safe:` Tailwind modifier for all animation utilities. The stagger system's `@media (prefers-reduced-motion: no-preference)` guard means reduced-motion users see content immediately at full opacity with no layout shift.

---

## 7. Responsiveness

The layout system is driven by Visual Builder composition settings rather than component-level breakpoints. Editors control responsiveness through the Section/Row/Column display templates.

**Row breakpoints** (`showAsRowFrom`): sm (640px), md (768px), lg (1024px), xl (1280px), or never. Below the chosen breakpoint, columns stack vertically.

**Column spans**: 1–12 twelfths, or `auto` (equal). Flex-basis is applied at the Row's chosen breakpoint via `[data-bp="*"] [data-col-span="*"]` selectors in `globals.css`.

**Section width**: full-bleed, container (default), wide (max-7xl), narrow (max-4xl).

**Implication for component authors:** block components should be designed to work at any width from ~280px (single column, narrow viewport) to ~1400px (full-bleed). Never assume a fixed container width inside a block.

---

## 8. Component Inventory

### Navigation (Header)

Server component fed by ThemeManager. Dark glass sticky bar — `bg-canvas/80 backdrop-blur-md` with `border-b border-fg/5`. Logo area, primary nav links (desktop: inline; mobile: full-height overlay via `MobileMenu.tsx` client component), and CTA button. All content CMS-driven.

**Desktop dropdown (mega menu).** A single flat `bg-surface` panel — no angled clip-path, no two-zone brand/canvas dissolve. Built entirely on semantic tokens (`bg-surface`, `text-fg`, `border-fg/*`), so the whole panel inverts automatically between dark and light mode and reads correctly on any ThemeManager theme. Structure is a single column of inset rows, each an optional icon tile + title + description, with a trailing `ArrowRight` that slides in on hover. Corners follow the Corner Style axis (`rounded-ot-surface` panel + tiles, `rounded-ot-control` rows) — sharp by default, rounded under a soft/rounded theme. Depth is a chromatic brand-hued bloom shadow (`--ot-bloom-brand-faint` / `--ot-bloom-brand-border`, never grey) plus the 1px brand→accent horizon along the top edge. Rows reveal with a 45ms-per-item kinetic stagger on open. The rest icon is `text-fg` ink (never the `brand` token) so it stays legible on `surface` in both modes and under any brand darkness — themeable colors are unsafe as foreground on a themeable ground; the brand color instead lives in the faint `bg-brand/10` tile tint and the solid `bg-brand` hover fill (icon → `fg-on-brand`), the one earned moment of color. Icons are optional per item, sourced from the shared `ICON_REGISTRY` via a `selectOne` field on `OT_NavigationSubItem` (same canonical library as the block icon pickers) and rendered on both desktop and mobile.

### Blocks (currently built)

| Block | Key display settings | Notable effects |
|---|---|---|
| **HeroBlock** | layout (image left/right), color (brand/canvas/surface), animation (none/fade/slide/parallax) | Split-panel layout, per-element stagger, CVA variant system |
| **CardBlock** | fill, border, imageStyle (top/left/right), imageSide, hover (lift/glow/none), density, noise, accentLine, maxHeight | `.card-hover-lift` / `.card-hover-glow` global classes |
| **PrimaryTextBlock** | color (brand/canvas/surface), align, size, eyebrow style, CTA style | Editorial typography moment; supports Syne accent heading |
| **QuoteBlock** | color, size, attribution style | Pull quote with large typographic treatment |
| **RichTextBlock** | color, size, treatment (standard/lead/dropcap/incipit), ruledHeadings, textScale, textWeight, **columns** (single/dual/triple), **ground** (flat/ruled/grain/framed), **dividers** (rule/ornament/asterism), **numberedHeadings**, **reveal** (none/cascade) | The **reading surface** (vs PrimaryText's statement). TinyMCE output styled via `[data-rich-text]` scoped CSS. Every setting targets long-form copy that a single headline can't carry: broadsheet multi-column flow, print grounds (ledger ruling / halftone grain / framed page), editorial section breaks (❧ / ⁂), CSS-counter chapter numbers, small-caps incipit, and a pure-CSS scroll-driven reading-cadence reveal (`animation-timeline: view()`, `@supports`-gated, motion-safe). |
| **ImageBlock** | aspectRatio, objectFit, bloom (brand/accent/none), caption, rounded | Chromatic bloom glow ring from bloom tokens |
| **VideoBlock** | aspectRatio, bloom, caption | Same bloom system as ImageBlock |
| **StatBlock** | color (brand/canvas/surface), layout (row/grid), glass | Animated counters, staggered entrance, divider lines |
| **FeatureGridBlock** | color, layout (grid/list), glass | Icon + heading + body feature tiles |
| **TrustRail** | motion (scroll/fade/static), treatment (mono/color), background (canvas/surface/brand), size (sm/md/lg), density, glass | Seamless CSS marquee (doubled track + `paddingRight` seam fix), IntersectionObserver fade, mono grayscale + hover lift, brand-surface white silhouette. `brand` uses `.bg-brand-fill` (radial gradient, matching every other block) instead of a flat fill, so the `glass` panel has something to blur. Headline renders as a flanking-hairline "mark" (DividerBlock idiom) rather than a bare label. Every logo lifts + catches a brand-bloom `drop-shadow` on hover regardless of treatment. `glass` adds the same 1px brand→accent top-edge horizon as the nav dropdown/footer. |

### TrustRail logo image guidance

**Format: SVG is strongly preferred.** The component applies `grayscale`, `opacity`, and `brightness`/`invert` CSS filters depending on the treatment setting. These filters produce clean, crisp results on vector SVG files. Raster images (PNG, JPG) look acceptable but may show filter artifacts at small sizes and on retina displays.

- **SVG** — best results at any size; filters are perfectly sharp; file size is usually smaller than PNG
- **Transparent PNG** — acceptable fallback when SVG is unavailable; use the highest resolution available (2× or 3× the display size)
- **JPG or opaque PNG** — avoid; the grayscale filter will expose the background color, breaking the mono treatment

**Recommended dimensions:** logos vary in proportions, but a height of 80–160px in the source SVG viewBox works well across all three size settings (sm/md/lg). Width is unconstrained — the component respects natural aspect ratio up to `5 × height`.

**Transparency is required** for the `mono` and `brand` treatments to work correctly. On a `brand` background, logos are forced to white silhouette via `brightness(0) invert(1)` — a transparent background is mandatory for this to produce the correct result.

### Composition structure

Section, Row, and Column adapters render the Visual Builder tree. See `Optimizely.md` for the full composition architecture.

---

## 9. Special CSS Utilities (globals.css)

These global utilities reference bloom tokens and must be defined in `globals.css` — not as Tailwind arbitrary values — so they follow CMS theme overrides automatically.

| Class | Effect |
|---|---|
| `.card-hover-lift` | `translateY(-4px)` + chromatic shadow on hover |
| `.card-hover-glow` | Chromatic shadow intensification on hover (no transform) |
| `.btn-signal` | `::before` fill sweep left-to-right on hover/focus, 220ms kinetic ease |
| `.syne-hollow` | Wire letterform — transparent fill, brand-color `-webkit-text-stroke` |
| `.display-gradient-brand` | Prismatic depth fill (brand tones, 3-layer shadow) |
| `.display-gradient-warm` | Prismatic depth fill (accent → brand) |
| `.display-gradient-luminous` | Prismatic depth fill (fg → brand) |
| `.display-gradient-ember` | Prismatic depth fill (accent range) |
| `.display-extrude` | Isometric extrusion — fg face + accent rim stroke + 12-layer 45° shadow stack. Max depth 0.42em. Animated via `--display-depth` on entrance. |
| `.card-hover-tilt` | Isometric back-face visible at rest (solid 2-layer offset shadow in brand-hover). On hover: `perspective(900px) rotateX(-3deg) rotateY(5deg)` + deepened shadow. Reduced-motion: shadow only. |
| `.logo-invert-dark` | `filter: brightness(0) invert(1)` in dark mode; removed in light mode |
| `.tab-scroller` | Horizontal tab-trigger strip. Dynamic `mask-image` edge-feather (driven by `--fade-l`/`--fade-r` set from scroll position) signals off-canvas tabs; inert when nothing overflows. Pairs with scroll-snap + JS `scrollIntoView` keeping the active trigger in view; `scroll-behavior` is reduced-motion gated. |

### Header Effects (consolidated set)

The heading block (`OT_PrimaryTextBlock`) exposes a single **Header effect** select. Every option is token-derived (works on any brand/accent scheme) and handles both dark and light mode (mode-agnostic construction on the mode-constant brand/accent tokens, or an explicit `[data-theme="light"]` pass). All are motion-safe and keep a legible base letterform.

| Marketer label | Class | Effect |
|---|---|---|
| Gradient | `.ot-fx-gradient` | Static brand→accent diagonal `background-clip:text` fill; light mode darkens both stops |
| Animated Gradient | `.ot-depth-liquid` | The fill animated as a slow shimmer/sweep; freezes mid-sweep under reduced-motion |
| 3D Depth | `.ot-depth-extrude` | Hard isometric 45° offset shadow stack; `[data-theme=light]` + `.bg-brand-fill` variants |
| Embossed | `.ot-depth-emboss` | Carved-into-surface: opposing cavity shadow + rim highlight |
| Outline | `.ot-depth-outline` | Hollow wire letterforms, brand stroke + `drop-shadow` glow |
| Glitch | `.ot-fx-chromatic` | RGB channel-split fringe (brand/accent offsets) on an fg face; subtle motion-safe jitter |
| Highlight | `.ot-fx-highlight` | Accent marker swipe behind the text (inline span, `box-decoration-break: clone`); fg-on-accent text |
| Glow | `.ot-fx-glow` | Backlit aurora halo (brand + accent bloom `drop-shadow`); tightened on light grounds |

The older `.display-gradient-*` / `.display-extrude` classes are superseded by this set and no longer exposed in the CMS.

---

## 10. Impeccable Collaboration

Components in this system are built in collaboration with the **impeccable** skill, which adds polish, advanced effects, and visual distinctiveness beyond a baseline implementation. The process:

1. A block component is first built to the patterns in this document — correct token usage, CVA variant system, preview attribute wiring, responsive behavior.
2. Impeccable then refines the component — tightening motion, adding depth layers (bloom, glass, subtle 3D transforms), improving typographic rhythm, adding micro-interactions and hover choreography.
3. Advanced effects that impeccable introduces become part of the display template's settings vocabulary, so editors can control them from the CMS.

**What impeccable adds to blocks (examples):**
- Inset depth on cards: subtle `inset-shadow` or `box-shadow inset` in dark glass register
- 3D perspective tilt on hover: `rotateX` / `rotateY` via `perspective` + `transform-style: preserve-3d`
- Kinetic CTA underlines: `scaleX` transforms on `::after` pseudo-elements
- Layered section backgrounds: stacked gradients + noise texture + brand-bloom halo
- Media shimmer: animated gradient overlay on image/video load states

When impeccable introduces a new effect, document it here under the relevant component section and add any new global utilities to section 9.

---

## 11. Do's and Don'ts

### Do

- **Do** use semantic tokens (`var(--ot-brand)`, `bg-brand`, `text-fg-muted`) everywhere — never hardcode color values in component CSS.
- **Do** let the brand color fill large surface areas. 30–60% of a primary view. Restraint lives in the neutrals.
- **Do** use `box-shadow` with bloom tokens for elevation — chromatic, not grey.
- **Do** use dark glass (`bg-canvas/75 backdrop-blur-md`) for floating elements over visual content. Ask "what is beneath this?" before applying.
- **Do** apply `motion-safe:` modifier to all animation utilities. Stagger and block animations must work at zero motion.
- **Do** use sharp corners (`rounded-none`) on all interactive elements — buttons, cards, panels. The only permitted non-zero radius is `rounded-input` (4px) on form inputs.
- **Do** use `text-wrap: balance` on headlines and `text-wrap: pretty` on body paragraphs.
- **Do** use weight contrast of 200+ between adjacent type hierarchy levels.
- **Do** tint every neutral toward the brand hue when implementing custom themes.
- **Do** meet WCAG 2.1 AA on all text and interactive states, including body copy on surface/canvas backgrounds.
- **Do** use `transform` and `opacity` only for animated properties. Never animate `width`, `height`, `top`, `left`.
- **Do** lean into 70s/80s **retro display treatments** at display scale — extruded/isometric poster type (`.display-extrude`), warm multi-tone fills, and chromatic/print effects (offset channel split, halftone, screenprint misregistration). These are part of the Kinetic Editorial voice, not a violation of the Web3 ban — provided they stay on tinted grounds (never pure black), derive every color from brand/accent/fg tokens, hold WCAG 2.1 AA, and appear at display scale only. See §4 *Retro display headers* for the full constraint set.

### Don't

- **Don't** hardcode `oklch(55% 0.18 195)` or any color literal in component code. That color lives in `tokens.css` as `--ot-brand`. Component code references the token.
- **Don't** use light frosted glass (white/near-white `backdrop-blur` on light backgrounds). The system's glass is dark-tinted. If it looks like an iOS popover, it's wrong.
- **Don't** use neutral grey shadows (`rgba(0,0,0,0.2)` etc.). Shadows carry the brand hue via bloom tokens.
- **Don't** use the SaaS cream aesthetic: off-white cards, pastel gradient blobs, rounded pill buttons, floating feature icon grids.
- **Don't** reach for a vertical's cliché-by-reflex when theming a new industry: healthcare teal-on-white, financial services navy-and-gold, legal mahogany-and-serif, retail loud-discount-banners. A vertical theme must read as credible for its industry without being that category's obvious training-data default. Re-skin with a committed, considered palette, not the first guess.
- **Don't** use corporate navy, or the synthwave/crypto look: neon-bright literals glowing on pure black (`#000`), laser grids receding into a void, chrome-and-magenta "Web3 energy." The ban is on *that specific aesthetic* — neon-on-true-black with token-bypassing color literals — **not** on a retro feel in general. Retro editorial display treatments are explicitly sanctioned (see the Do below and §4 *Retro display headers*); the line they must not cross is leaving the tinted-ground / semantic-token system.
- **Don't** use side-stripe borders (a colored `border-left` or `border-right` > 1px as a decorative accent). Use background tints, full borders, or nothing.
- **Don't** use Syne below headline scale, at weight above 525, or more than once per viewport.
- **Don't** use display gradient fills (`display-gradient-*`) on sub-display type or more than once per composition.
- **Don't** assume a fixed container width inside block components. Blocks render at any width from a full-bleed section to a narrow column.
- **Don't** introduce new layout-shifting animation properties without a `prefers-reduced-motion: reduce` fallback.
- **Don't** add `rounded-lg`, `rounded-xl`, or `rounded-full` to buttons or cards. Sharp corners are the system's identity.
