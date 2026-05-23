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
- **@optimizely/cms-cli ^2.0.0** — syncs TypeScript content type definitions to Optimizely CMS; requires `.env` with `OPTIMIZELY_CMS_URL`, `OPTIMIZELY_CMS_CLIENT_ID`, `OPTIMIZELY_CMS_CLIENT_SECRET`

## Architecture

App Router structure under `app/`:
- `layout.tsx` — root layout; loads Geist/Geist Mono via `next/font/google`, sets CSS variable font assignments
- `page.tsx` — home route
- `globals.css` — Tailwind v4 import + CSS custom properties for `--background`/`--foreground` and dark mode

Path alias `@/*` maps to the project root (e.g. `@/app/...`, `@/lib/...`).

Tailwind v4 note: there is no `tailwind.config.ts`. Customizations go in `globals.css` using `@theme`.

## Block Components & Showcase

Every new block component added to `components/blocks/` must also get a static demonstration section on the showcase page (`app/showcase/page.tsx`) in the same task. The showcase section should:

- Show the block in all meaningful `styleOptions` combinations (color schemes, sizes, orientation variants, etc.)
- Use realistic placeholder copy consistent with the OptiTech brand voice
- Be added as a clearly labelled section following the existing showcase page conventions

This is a standing requirement — do not wait to be asked.

## Design Context

Full design specs live in [PRODUCT.md](PRODUCT.md) and [DESIGN.md](DESIGN.md). Read both before any UI work.

**Register:** Brand (marketing site — design IS the product)
**North Star:** "The Kinetic Editorial" — precision-crafted, editorial confidence, choreographed motion
**Key constraints:**
- Committed color strategy: one saturated anchor fills 30–60% of the surface (not an accent)
- Serif display + sans body typography; serif never below 1.5rem
- Layered depth system: dark glass, ambient shadows (can be resting), color depth from the mineral palette; `prefers-reduced-motion` required for all motion
- WCAG 2.1 AA on all text and interactive states

**Hard prohibitions (from DESIGN.md):** no gradient text, no side-stripe borders >1px, no SaaS-cream/blob aesthetic, no corporate navy, no neon-on-black/Web3 energy, no layout-property animations.

---

## CMS Development Patterns

Reference for adding any CMS-related piece without re-deriving conventions from existing files.

### File locations

| Artifact | Location |
|---|---|
| Content type definition | `cms/content-types/YourBlock.ts` |
| Display template | `cms/display-templates/YourBlockDefault.ts` |
| CMS adapter (React) | `cms/components/YourBlock.tsx` |
| Composition section adapter | `cms/compositions/YourSection.tsx` |
| UI component | `components/blocks/YourBlock.tsx` |
| Registration | `cms/registry.ts` |

### Naming conventions

- Block content types: `OT_` prefix + PascalCase + `Block` suffix → `OT_HeroBlock`
- Section content types: `OT_` prefix + PascalCase + `Section` suffix → `OT_ImageBgSection`
- Display templates: content type key + `Default` suffix → `OT_HeroDefault`
- Adapters: content type key only (no suffix) — the file is the suffix

### Property groups

Always assign properties to the standard groups:
- `group: 'OT_Content'` — editable content fields (text, images, links)
- `group: 'OT_Style'` — visual variant overrides

### Content type — VB block

```typescript
// cms/content-types/OT_YourBlock.ts
import { contentType } from '@optimizely/cms-sdk'

export const OT_YourBlock = contentType({
  key: 'OT_YourBlock',
  displayName: 'Your Block',
  baseType: '_component',
  compositionBehaviors: ['elementEnabled'],   // add 'sectionEnabled' if it can span a full row
  properties: {
    heading: { type: 'string', displayName: 'Heading', group: 'OT_Content', sortOrder: 10 },
    body:     { type: 'string', displayName: 'Body',    group: 'OT_Content', sortOrder: 20 },
    // url type: { type: 'url', isLocalized: true }
    // image:   { type: 'contentReference', allowedTypes: ['_image'] }
    // bool:    { type: 'boolean' }
    // int:     { type: 'integer' }
    // json:    { type: 'json' }
    // array with nested component: { type: 'array', items: { type: 'component', contentType: OtherType } }
  },
})
```

### Display template — block (links to content type)

```typescript
// cms/display-templates/OT_YourBlockDefault.ts
import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_YourBlockDefault = displayTemplate({
  key:         'OT_YourBlockDefault',  // unique template key
  displayName: 'Your Block',
  contentType: 'OT_YourBlock',         // ← block templates use contentType, not baseType
  isDefault:   true,
  settings: {
    color: {
      displayName: 'Background',
      editor:      'select',
      sortOrder:   10,
      choices: {
        canvas:  { displayName: 'Canvas',  sortOrder: 10 },
        surface: { displayName: 'Surface', sortOrder: 20 },
        brand:   { displayName: 'Brand',   sortOrder: 30 },
      },
    },
  },
})
```

### Display template — composition section (full-width VB section)

```typescript
// cms/display-templates/OT_YourSectionTemplate.ts
import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_YourSectionTemplate = displayTemplate({
  key:         'OT_YourSection',    // matches content type key
  displayName: 'Your Section',
  baseType:    '_section',          // ← sections use baseType, not contentType
  isDefault:   true,
  settings: { /* same settings pattern */ },
})
```

### CMS adapter — block

```tsx
// cms/components/OT_YourBlock.tsx — server component
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import YourBlock from '@/components/blocks/YourBlock'

type Props = { content: any; displaySettings?: Record<string, string | boolean> }

export default function OT_YourBlockAdapter({ content, displaySettings = {} }: Props) {
  const { pa } = getPreviewUtils(content)

  const color = String(displaySettings.color ?? 'canvas')

  return (
    <div {...pa(content.__composition)}>   {/* pa(__composition) for blocks */}
      <YourBlock
        heading={content.heading ?? ''}
        body={content.body ?? undefined}
        color={color as 'canvas' | 'surface' | 'brand'}
      />
    </div>
  )
}
```

### CMS adapter — composition section

```tsx
// cms/compositions/OT_YourSection.tsx — server component
import { getPreviewUtils, OptimizelyGridSection } from '@optimizely/cms-sdk/react/server'

type Props = { content: any; displaySettings?: Record<string, string | boolean> }

export default function OT_YourSection({ content, displaySettings = {} }: Props) {
  const { pa } = getPreviewUtils(content)

  return (
    <section className="vb:section flex flex-col w-full" {...pa(content)}>   {/* pa(content) for sections */}
      <div className="flex flex-col flex-1 container mx-auto px-lg py-xl">
        <OptimizelyGridSection nodes={content.nodes ?? []} />
      </div>
    </section>
  )
}
```

### Registration — `cms/registry.ts` (three places every time)

```typescript
// 1. Display templates
initDisplayTemplateRegistry([
  // ...existing,
  OT_YourBlockDefault,
])

// 2. Content types
initContentTypeRegistry([
  // ...existing,
  OT_YourBlock,
])

// 3. React components — key is the content type key
initReactComponentRegistry({
  resolver: {
    // ...existing,
    OT_YourBlock: OT_YourBlockAdapter,
    // For sections, key is also the content type key:
    OT_YourSection: OT_YourSectionAdapter,
  },
})
```

### pa() usage rules

| Element type | Spread on |
|---|---|
| Block / element | `{...pa(content.__composition)}` |
| Section / page | `{...pa(content)}` |

### Adding a CMS-driven page route

CMS pages are served from `app/[[...slug]]/page.tsx` (catch-all). That route fetches the page by slug using `GraphClient` and renders via the SDK's composition renderer. Check that file for the exact fetch/render pattern before adding a new experience type.

For a new **experience page type** (e.g. `OT_BlogPage`):
1. Create content type with `baseType: '_experience'` or `'_page'`
2. Register in `initContentTypeRegistry`
3. The catch-all route handles rendering automatically if the content type is registered

### CLI sync

The Optimizely CMS CLI (`@optimizely/cms-cli`) syncs TypeScript definitions to the SaaS CMS. Requires `.env` with:
```
OPTIMIZELY_CMS_URL=
OPTIMIZELY_CMS_CLIENT_ID=
OPTIMIZELY_CMS_CLIENT_SECRET=
```
Run via: `npx @optimizely/cms-cli push` (check the package for exact command — there is no custom yarn script configured).
