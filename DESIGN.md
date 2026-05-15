<!-- Upgraded from seed 2026-05-14. Re-run /impeccable document once real components exist to capture live tokens. -->

---
name: OptiTech
description: Bold, forward-moving brand site. Committed oxidized teal, geometric sans, choreographed motion.
colors:
  teal-anchor: "oklch(55% 0.18 195)"
  teal-deep: "oklch(38% 0.16 195)"
  editorial-black: "oklch(12% 0.012 195)"
  press-room: "oklch(20% 0.022 195)"
  press-white: "oklch(97% 0.005 195)"
  blueprint: "oklch(68% 0.06 195)"
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
components:
  button-primary:
    backgroundColor: "{colors.teal-anchor}"
    textColor: "{colors.press-white}"
    rounded: "{rounded.none}"
    padding: "16px 48px"
  button-primary-hover:
    backgroundColor: "{colors.teal-deep}"
    textColor: "{colors.press-white}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.press-white}"
    rounded: "{rounded.none}"
    padding: "15px 47px"
  button-ghost-hover:
    backgroundColor: "oklch(97% 0.005 195 / 0.08)"
    textColor: "{colors.press-white}"
---

# Design System: OptiTech

## 1. Overview

**Creative North Star: "The Kinetic Signal"**

OptiTech is designed to feel purpose-built by people with a strong point of view. The visual language draws from design-tool precision (Figma, Framer, Arc) — not their fame, but their quality of self-referential craft: a product that demonstrates its own values in how it presents itself.

Color commits rather than accents. Oxidized Teal fills 30-60% of primary surfaces — a presence, not punctuation. Poppins carries the entire type system: hierarchy through weight and scale, not through serif/sans switching. At display sizes (weight 800, tight tracking at -0.03em), the geometric forms read as impactful and forward-moving. At body size (weight 400), the same family provides the comfortable, modern legibility the user asked for. One face, one system, total coherence.

The surface palette runs dark. Physical scene: a consumer discovering OptiTech on their laptop in the evening, skeptical but curious. The committed teal makes the brand statement immediately; ink-black sections carry seriousness and depth; press-white panels enable comfortable long-form reading. Three grounds, one unified hue family.

This system explicitly rejects: generic startup-cream (off-white cards, pastel blobs, rounded pill grids), corporate navy, and the neon-on-black crypto aesthetic.

**Key Characteristics:**
- Committed teal anchor — a surface color, not an accent
- Single geometric sans (Poppins) with weight/scale hierarchy (800 to 400)
- Sharp corners everywhere — no pill shapes, no softened cards
- Choreographed entrances as brand expression; flat and still at rest
- Every neutral tinted toward the teal hue; nothing truly neutral

## 2. Colors: The Mineral Palette

One color commits. Everything else defers to it.

### Primary
- **Oxidized Teal** (`oklch(55% 0.18 195)`, approx #0e7e80): The anchor. Fills hero panels, full-bleed sections, entire backgrounds. 30-60% of any primary view. Not an accent — a commitment.
- **Verdigris Deep** (`oklch(38% 0.16 195)`, approx #0b5557): Hover state on teal surfaces, depth accents, buttons on teal backgrounds. Recedes while staying in family.

### Neutral
- **Editorial Black** (`oklch(12% 0.012 195)`, approx #0e1c1c): Deepest background. Navigation, footer, large dark sections. Near-black but distinctly tinted.
- **Press Room** (`oklch(20% 0.022 195)`, approx #172e2e): Dark content surface for feature sections, secondary panels. Lighter than Editorial Black; creates depth in dark-ground layouts.
- **Press White** (`oklch(97% 0.005 195)`, approx #f3fafa): Light reading surfaces and text on dark or teal backgrounds. Not white; tinted.
- **Blueprint** (`oklch(68% 0.06 195)`, approx #7cb5b6): Secondary text on dark backgrounds. Labels, navigation links at rest, de-emphasized content.

**The Committed Rule.** The teal anchor fills large surface areas — it is not sparingly applied. Restraint lives in the neutrals. If a view uses Oxidized Teal on less than 20% of its surface, the palette is drifting toward Restrained. Push it back.

**The Tint Rule.** No neutral is ever truly neutral. Editorial Black, Press Room, and Press White all carry the teal hue at low chroma (0.005-0.022). The palette is unified, not collaged from unrelated values. Never use `#000000`, `#111111`, or `#ffffff` without tinting.

## 3. Typography: One Face, Full Commitment

**Primary Font:** Poppins (Google Fonts — add via `next/font/google`)
**Accent Display Font:** Syne (Google Fonts, variable — for accent headers and pull moments only)
**Mono Font:** Geist Mono (already installed — for code samples and technical labels)

**Character:** Poppins is the entire voice. A geometric sans-serif with an unusually high x-height and consistent stroke width — extremely legible at body sizes, and at display sizes (weight 800, negative tracking) it becomes dense and impactful. The system expresses hierarchy entirely through scale and weight contrast, never through typeface switching.

**Installation note:** Add Poppins to `app/layout.tsx` via `next/font/google`, providing weights `[400, 500, 600, 700, 800]`.

### Hierarchy
- **Display** (Poppins 800, `clamp(3rem, 8vw, 6rem)`, line-height 0.9, tracking -0.03em): Hero and section-opener headlines. Short, punchy, asymmetric where possible. Never more than 14 characters on a line.
- **Headline** (Poppins 700, `clamp(1.75rem, 4vw, 2.75rem)`, line-height 1.05, tracking -0.02em): Sub-section openers, feature callouts. Strong hierarchy step below Display.
- **Title** (Poppins 600, `1.25rem`, line-height 1.3, tracking -0.01em): Card headers, navigation labels, strong UI text.
- **Body** (Poppins 400, `1rem`, line-height 1.65): Prose. Hard cap at 70ch. The comfortable reading size the design is optimized for.
- **Label** (Poppins 600, `0.8125rem`, tracking +0.06em, uppercase): Metadata, section tags, timestamps. Uppercase with generous tracking.

### Syne (Accent Display)

Geometric variable font used sparingly as an accent layer above the Poppins system. Never replaces Poppins for headlines or body — it punctuates rather than narrates.

- **Weight:** 450 only (`style={{ fontWeight: 450 }}`). Above 525 the geometry bloats. Token: `--ot-weight-syne`.
- **Usage:** Accent headers, section openers, pull quotes. At most once per viewport.
- **Variants:** Clean (`text-fg`), Brand (`text-brand`), Accent (`text-accent`), Hollow (`.syne-hollow` — wire letterforms via `-webkit-text-stroke`).
- **Color note:** Accent (amber) at 68% lightness against the light canvas fails WCAG 3:1. Prefer Clean, Brand, or Hollow on light backgrounds.

**The Weight Ladder Rule.** Adjacent hierarchy levels must differ by at least 100 in font weight. Display (800) to Headline (700) to Title (600) to Body (400). Never two adjacent levels at the same weight; the jump from 600 to 400 between Title and Body is intentional and creates the clearest separation in the scale.

## 4. Elevation

Flat at rest. Depth appears in motion.

This system does not use shadow to communicate static layering. Three surface tones (Press Room, Editorial Black, and Oxidized Teal) create depth through color alone — no shadows stack on top. Shadows appear only as state responses: a teal-tinted glow on hover for primary interactive elements, and during the brief window of an animated entrance (elements arriving from an offset into rest position).

**The Flat Resting Rule.** No component carries a drop shadow in its default state. A resting shadow signals the surface doesn't know where it belongs. A hover shadow says "this responds to you." Only interactive surfaces that benefit from that signal should use hover shadows.

### Shadow Vocabulary
- **Hover Lift** (`0 8px 32px oklch(55% 0.18 195 / 0.25)`): Teal-tinted ambient glow on hover for teal primary buttons and prominent interactive elements. Appears on hover; does not persist at rest.

## 5. Components

### Buttons

Sharp corners define the entire button system. No border-radius; no pill shapes. Uppercase lettering with tracked spacing.

- **Shape:** Sharp (0px radius). Padding: 16px vertical / 48px horizontal.
- **Primary:** Oxidized Teal (`teal-anchor`) background, Press White text. Hover: `teal-deep` background + `translateY(-2px)`. Active: snap back to rest.
- **Ghost:** Transparent background, 1px solid border at `oklch(97% 0.005 195 / 0.40)`, Press White text. Used on dark or teal surfaces. Hover: border opacity to 0.70, faint background fill `oklch(97% 0.005 195 / 0.08)`.
- **Focus:** 2px solid outline at the button's own primary color, 3px offset. Always visible; never suppressed.
- **Typography:** Poppins 600, 0.875rem, tracking +0.06em, uppercase.

### Navigation

Typographic, minimal, sticky.

- **Background:** Editorial Black.
- **Logo:** Poppins 800, 0.875rem, tracking +0.12em, uppercase, Press White.
- **Links at rest:** Poppins 400, 0.875rem, Blueprint color.
- **Links on hover:** Transition to Press White (0.15s ease-out-quart).
- **CTA:** Primary button at compact scale (12px / 28px padding, 0.8125rem).
- **Mobile:** Collapses to wordmark + hamburger; links stack full-width in a full-height overlay.

### Text Input

- **Shape:** 4px radius (the only non-zero radius in the system — input fields earn a slight softening).
- **Background:** Editorial Black or Press Room depending on surface.
- **Border:** 1px solid `oklch(97% 0.005 195 / 0.15)` at rest.
- **Focus:** Border becomes 1px solid `teal-anchor`; no glow, no spread. The color change is the signal.
- **Placeholder:** Blueprint color.
- **Error:** Border becomes `oklch(60% 0.22 25)` (warm red); no icon, no side stripe. Color alone carries the state.

## 6. Do's and Don'ts

### Do:
- **Do** let Oxidized Teal fill large surface areas: hero panels, full-bleed sections, entire page backgrounds. It is a presence, not punctuation.
- **Do** use Poppins at display sizes (3rem+) with tight letter-spacing (-0.025em to -0.035em). The geometric forms become impactful, not just large.
- **Do** use weight contrast of 200+ between adjacent type levels. The Weight Ladder Rule exists because the jump from 600 to 400 is the sharpest, most legible step.
- **Do** tint every neutral toward the teal hue (chroma 0.005-0.022). Press White reads as warm teal-white; Editorial Black reads as teal-black. The palette should feel like one material.
- **Do** use asymmetry and forward tension in layout. Symmetric grid with equal gutters signals nothing is happening.
- **Do** choreograph entrances with `cubic-bezier(0.16, 1, 0.3, 1)` (expo ease-out). Elements arrive with vertical offset or opacity transition, then rest. The entrance is the motion statement.
- **Do** respect `prefers-reduced-motion`: every choreographed sequence and transition must degrade to an instant display when the user has set this preference.
- **Do** meet WCAG 2.1 AA contrast on all text and interactive states, including Poppins 400 body copy over Press Room.

### Don't:
- **Don't** use the SaaS cream aesthetic: off-white backgrounds, rounded pill buttons, pastel gradient blobs, floating icon-feature grids. It is the category's first training-data reflex.
- **Don't** use the corporate enterprise blue playbook: navy/grey palettes, stock-photo hero images, feature bullet lists, formal copywriting.
- **Don't** let the design read as a crypto or Web3 launch site: no neon, no floating orbs or particle effects, no speculative urgency.
- **Don't** use gradient text (`background-clip: text` + gradient) decoratively or on sub-display type. **Permitted exception:** the four `.display-gradient-*` utility classes in `globals.css` (`display-gradient-brand`, `display-gradient-warm`, `display-gradient-luminous`, `display-gradient-ember`) may be used on `text-display`-scale type only. Rules: dark canvas only, once per composition, never on body or headline copy.
- **Don't** use side-stripe borders (a colored `border-left` or `border-right` greater than 1px as an accent on cards, callouts, or list items). Rewrite with background tints, full borders, or nothing.
- **Don't** animate CSS layout properties (`width`, `height`, `top`, `left`). Use `transform` and `opacity` only.
- **Don't** round buttons or cards beyond `input: 4px`. The sharp-corner geometry is a deliberate system choice. Introducing `rounded-lg` or `rounded-full` anywhere breaks the system's identity.
- **Don't** use Poppins below 0.75rem. The geometric letterforms lose definition at very small sizes. Drop to `system-ui` below that threshold.
