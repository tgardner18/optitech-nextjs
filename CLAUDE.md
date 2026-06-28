# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Non-standard Next.js version

This project uses **Next.js 16.2.6** with **React 19.2.4** — versions that may differ significantly from your training data. APIs, conventions, and file structure may have changed. Before writing any Next.js code, read the relevant guide in `node_modules/next/dist/docs/`. Heed deprecation notices.

The docs are organized as:
- `node_modules/next/dist/docs/01-app/` — App Router (used in this project)
- `node_modules/next/dist/docs/02-pages/` — Pages Router
- `node_modules/next/dist/docs/03-architecture/`

## Commands

```bash
yarn dev        # Start dev server on localhost:3000
yarn build      # Production build
yarn start      # Run production build
yarn lint       # ESLint (eslint-config-next core-web-vitals + TypeScript rules)
```
## Optimizely 
When configuring elements for the Optimizely SaaS CMS refer back to https://github.com/episerver/content-js-sdk#documentation for tips on how to work with the official SDK. 

No test runner is configured yet.

## Stack

- **Next.js 16.2.6** — App Router, TypeScript, no Pages Router
- **React 19.2.4**
- **Tailwind CSS v4** — configured via `@import "tailwindcss"` in `globals.css`; theme tokens defined with `@theme inline` (v4 syntax, not `tailwind.config.*`)
- **@optimizely/cms-sdk ^2.0.0** — headless CMS client; initialize with `GraphClient` using a single app key
- **@optimizely/cms-cli ^2.0.0** — syncs TypeScript content type definitions to Optimizely CMS; needs `OPTIMIZELY_CMS_CLIENT_ID` / `OPTIMIZELY_CMS_CLIENT_SECRET` in `process.env` (the CLI does not load `.env` files itself — use the `yarn cms:push` / `cms:pull` scripts; see the optimizely-block skill at `.claude/skills/optimizely-block/references/push-checklist.md`)

## Architecture

App Router structure under `app/`:
- `layout.tsx` — root layout; loads Geist/Geist Mono via `next/font/google`, sets CSS variable font assignments
- `page.tsx` — home route
- `globals.css` — Tailwind v4 import + CSS custom properties for `--background`/`--foreground` and dark mode

Path alias `@/*` maps to the project root (e.g. `@/app/...`, `@/lib/...`).

Tailwind v4 note: there is no `tailwind.config.ts`. Customizations go in `globals.css` using `@theme`.

## Block Components & Showcase

Every new block in `components/blocks/` must ship its showcase demo **in the same task** — both the
block page (`app/(site)/showcase/blocks/[block]/page.tsx`) and the nav config
(`app/(site)/showcase/config.ts`). This is a standing requirement; do not wait to be asked. The exact
edits are in the **optimizely-block** skill — see `.claude/skills/optimizely-block/references/showcase-sync.md`.

## Design Context

Full design specs live in [PRODUCT.md](PRODUCT.md) and [DESIGN.md](DESIGN.md). Read both before any UI work.

**What this is:** **Site Accelerator** — a configurable, vertical-agnostic site framework on the Optimizely SaaS CMS for standing up credible sites in any vertical (financial services, healthcare, retail, legal, …), primarily for pre-sales / solution-engineer demos. The mineral-teal look is the **default theme**, not the identity: the token system is the brand, and any vertical re-skins it via ThemeManager. The `OT_` / `--ot-` prefix on content types and tokens is **historical and theme-neutral** — do not read brand meaning into it, and do not mass-rename it (renaming content-type keys is a breaking CMS migration).

**Register:** Brand (the design IS the product — configurable demo sites)
**North Star:** "The Kinetic Editorial" — precision-crafted, editorial confidence, choreographed motion. This is the default theme's character and the craft bar **every vertical theme must meet**.
**Key constraints:**
- Committed color strategy: one saturated anchor fills 30–60% of the surface (not an accent)
- Token-driven type system: one **themeable primary family** drives the whole hierarchy (display/headline/title/body/label) via `--ot-font-sans` — Poppins by default, swappable per vertical through the ThemeManager "Primary Font" axis to Source Serif 4, Sora, or Bricolage Grotesque (all weight-ladder-matched). Syne for accent moments only (headline scale and up, at most once per viewport), Geist Mono for code/data, Caveat for the QuoteBlock signature only. Reference `--ot-font-sans`, never a raw `--font-poppins`. Serif is allowed only as the Source Serif primary via the axis.
- Layered depth system: dark glass, ambient shadows (can be resting), chromatic brand-hued shadows from the bloom tokens; `prefers-reduced-motion` required for all motion
- WCAG 2.1 AA on all text and interactive states, in every theme

**Hard prohibitions (from DESIGN.md):** no gradient text, no side-stripe borders >1px, no SaaS-cream/blob aesthetic, no corporate navy, no neon-on-black/Web3 energy, no layout-property animations, no vertical cliché-by-reflex (healthcare teal-on-white, finance navy-and-gold, legal mahogany-serif, retail loud-discount-banners).

---

## CMS Development Patterns

Block and section authoring follows a fixed **four-layer + showcase + push** workflow with **seven**
required artifacts: content type, display template, CMS adapter, UI component, three `cms/registry.ts`
entries, the showcase demo, and the showcase nav item. All of it — working templates, the
“learned the hard way” SDK property rules, registration order, showcase sync, and the push checklist —
lives in the **optimizely-block skill** at `.claude/skills/optimizely-block/`. Use that skill for any
work under `cms/` or `components/blocks/`; it supersedes the generic `optimizely-model` /
`optimizely-model-react` plugin skills here.

- `references/four-layer-pattern.md` — content type, block + section display templates, block + section
  adapters, the UI component, and rich-text / image / link / array rendering.
- `references/sdk-property-rules.md` — enum `value` not `key`, top-level `maxLength`, `isLocalized`,
  no `required`, `richText` not `xhtml`, the CTA-must-be-`url`+`string` rule, property groups, and the
  atomic property-group rollback rule.
- `references/registration.md` — the three registry edits, each failure mode, the catch-all route note,
  and the do-not-push-OptiForms warning.
- `references/showcase-sync.md` — the four showcase-page edits + the one nav edit.
- `references/push-checklist.md` — preflight, push-before-build, instance-decided-by-creds, Graph
  re-index lag, and the atomic-rollback symptom decoder.

### Adding a CMS-driven page route

CMS **pages** are a separate flow from blocks (the block skill does not cover them). They render through
the catch-all at `app/(site)/[...slug]/page.tsx`, which fetches by slug via `GraphClient` and renders the
SDK composition tree. For a new experience/page type (e.g. `OT_BlogPage`): create the content type with
`baseType: '_experience'` or `'_page'`, register it in `initContentTypeRegistry`, and the catch-all
renders it once registered. A `_page` type additionally needs a targeted GraphQL query plus a dedicated
React renderer in the slug route — see `Optimizely.md` for that pattern.
