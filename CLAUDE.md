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
- **@optimizely/cms-cli ^2.0.0** — syncs TypeScript content type definitions to Optimizely CMS; needs `OPTIMIZELY_CMS_CLIENT_ID` / `OPTIMIZELY_CMS_CLIENT_SECRET` in `process.env` (the CLI does not load `.env` files itself — see [CLI sync](#cli-sync) for the `.env` / `.env.local` workflow)

## Architecture

App Router structure under `app/`:
- `layout.tsx` — root layout; loads Geist/Geist Mono via `next/font/google`, sets CSS variable font assignments
- `page.tsx` — home route
- `globals.css` — Tailwind v4 import + CSS custom properties for `--background`/`--foreground` and dark mode

Path alias `@/*` maps to the project root (e.g. `@/app/...`, `@/lib/...`).

Tailwind v4 note: there is no `tailwind.config.ts`. Customizations go in `globals.css` using `@theme`.

## Block Components & Showcase

Every new block component added to `components/blocks/` must also get a static demonstration section on the showcase **in the same task**. The showcase has two parts — both must be updated:

1. **Block showcase page** — `app/(site)/showcase/blocks/[block]/page.tsx`
   - Add the block slug to the `BLOCK_SLUGS` const array
   - Add an entry to `BLOCK_META` record
   - Write a `<YourBlockShowcase />` component with all meaningful `styleOptions` combinations
   - Add a `case 'your-block': return <YourBlockShowcase />` to the switch statement
   - Use realistic, vertical-neutral placeholder copy consistent with the showcase's default theme voice

2. **Showcase nav config** — `app/(site)/showcase/config.ts`
   - Add `{ label: 'Your Block', slug: 'your-block' }` to the `items` array inside the `'blocks'` category
   - Without this the block is unreachable from the nav — the page exists but no link points to it

This is a standing requirement — do not wait to be asked.

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
  // mayContainTypes: ['_self', 'OT_OtherPage', 'OT_BlogPage']  ← _page/_experience/_folder only
  properties: {
    heading: { type: 'string',   displayName: 'Heading', group: 'OT_Content', sortOrder: 10, isLocalized: true, maxLength: 80 },
    body:    { type: 'richText', displayName: 'Body',    group: 'OT_Content', sortOrder: 20, isLocalized: true },
    // url type:    { type: 'url', isLocalized: true }
    // image:       { type: 'contentReference', allowedTypes: ['_image'] }
    // bool:        { type: 'boolean' }
    // int:         { type: 'integer' }
    // json:        { type: 'json' }
    // selectOne:   { type: 'string', format: 'selectOne', enum: [{ value: 'foo', displayName: 'Foo' }] }
    // array with nested component: { type: 'array', items: { type: 'component', contentType: OtherType } }
  },
})
```

### SDK property type rules — learned the hard way

These are non-obvious SDK constraints. Getting them wrong causes TypeScript build errors.

| Rule | Correct | Wrong |
|---|---|---|
| Enum items use `value` | `{ value: 'line', displayName: 'Line' }` | `{ key: 'line', displayName: 'Line' }` |
| Validation is top-level | `maxLength: 80` at property root | `validation: { maxLength: 80 }` — does not exist |
| Localization flag | `isLocalized: true` | `localized: true` — wrong key |
| `required` field | Not supported by SDK types — omit | `required: true` — causes TS error |
| Rich text type | `type: 'richText'` | `type: 'xhtml'` — not a valid SDK type |
| Rich text GraphQL shape | Returns `{ html, json }` — render via `<RichText content={content.body?.json} />` | Treating it as a plain string, or using `.html` with `dangerouslySetInnerHTML` |
| Link type shape | `type: 'link'` returns `{ url, text, title, target }` — render each field explicitly | Treating it as a plain string URL |
| URL vs link | `type: 'url'` is a plain string; `type: 'link'` has metadata | Using `.url` on a `'url'` type property |
| `link` type: do NOT use for CTAs | Use `type: 'url'` + separate `type: 'string'` label instead. `type: 'link'` with `isLocalized: true` causes a 500 on `config push`; `link` is only reliable for navigation types (`_component` nav items) | `ctaLink: { type: 'link', isLocalized: true }` — crashes the CMS CLI push |
| `mayContainTypes` | Available on `_page`, `_experience`, `_folder` base types | Not available on `_component` |
| Child type self-reference | Use `'_self'` string | Circular import of the same file |
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

Use `ContentProps` for type-safe access to content and display settings. Always use optional chaining (`?.`) on all content property access — draft content may have unset properties.

```tsx
// cms/components/OT_YourBlock.tsx — server component
import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { RichText } from '@optimizely/cms-sdk/react/richText'
import { OT_YourBlock } from '@/cms/content-types/OT_YourBlock'
import { OT_YourBlockDefault } from '@/cms/display-templates/OT_YourBlockDefault'
import YourBlock from '@/components/blocks/YourBlock'

type Props = {
  content: ContentProps<typeof OT_YourBlock>
  displaySettings?: ContentProps<typeof OT_YourBlockDefault>
}

export default function OT_YourBlockAdapter({ content, displaySettings }: Props) {
  const { pa } = getPreviewUtils(content)

  const color = displaySettings?.color ?? 'canvas'

  return (
    <div {...pa(content.__composition)}>   {/* pa(__composition) for blocks */}
      <YourBlock
        heading={content.heading ?? ''}
        body={content.body?.json ?? undefined}
        color={color as 'canvas' | 'surface' | 'brand'}
      />
    </div>
  )
}
```

**Granular click-to-edit (preview mode):** The container-level `pa(content.__composition)` enables block selection in Visual Builder. For field-level click-to-edit, the adapter must render those elements directly rather than delegating them to the UI component:

```tsx
// When individual fields need click-to-edit highlight, render them in the adapter:
return (
  <div {...pa(content.__composition)}>
    <h2 {...pa('heading')}>{content.heading ?? ''}</h2>
    <RichText content={content.body?.json ?? undefined} />
    {/* Delegate remaining layout/styling to the UI component if needed */}
  </div>
)
```

**Rich text rendering:** Always use `<RichText>` from `@optimizely/cms-sdk/react/richText` with the `.json` field — never `dangerouslySetInnerHTML` with `.html`.

```tsx
import { RichText } from '@optimizely/cms-sdk/react/richText'
<RichText content={content.body?.json ?? undefined} />
```

**Image handling:** Use `damAssets` and `src` from `getPreviewUtils` for contentReference image properties:

```tsx
import { damAssets } from '@optimizely/cms-sdk'
import Image from 'next/image'

const { pa, src } = getPreviewUtils(content)
const { getSrcset, getAlt } = damAssets(content)
const imageUrl = src(content.image)

{imageUrl && (
  <Image
    src={imageUrl}
    srcSet={getSrcset(content.image)}
    sizes="(max-width: 768px) 100vw, 50vw"
    alt={getAlt(content.image, '')}
    fill
  />
)}
```

**Link type rendering:** `type: 'link'` returns an object with `url`, `text`, `title`, and `target` — always add `rel="noopener noreferrer"` for `_blank` links:

```tsx
{content.ctaLink && (
  <a
    href={content.ctaLink.url}
    target={content.ctaLink.target}
    title={content.ctaLink.title}
    rel={content.ctaLink.target === '_blank' ? 'noopener noreferrer' : undefined}
  >
    {content.ctaLink.text || 'Learn more'}
  </a>
)}
```

**Arrays of components/references:** Put `pa()` on the container, not on each item. Prefer `_metadata?.key` over array index for stable React keys:

```tsx
<div {...pa('items')}>
  {(content.items ?? []).map((item) => (
    <OptimizelyComponent key={item._metadata?.key ?? item.id} content={item} />
  ))}
</div>
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
| Block / element — container | `{...pa(content.__composition)}` on the outer wrapper div in the adapter |
| Block / element — individual field | `{...pa('fieldName')}` on the element that renders the field (enables click-to-edit highlight) |
| Section / page | `{...pa(content)}` |
| Array container | `{...pa('arrayFieldName')}` on the wrapping element; never on individual items |

### Adding a CMS-driven page route

CMS pages are served from `app/[[...slug]]/page.tsx` (catch-all). That route fetches the page by slug using `GraphClient` and renders via the SDK's composition renderer. Check that file for the exact fetch/render pattern before adding a new experience type.

For a new **experience page type** (e.g. `OT_BlogPage`):
1. Create content type with `baseType: '_experience'` or `'_page'`
2. Register in `initContentTypeRegistry`
3. The catch-all route handles rendering automatically if the content type is registered

### CLI sync

The Optimizely CMS CLI (`@optimizely/cms-cli`) syncs TypeScript definitions to the SaaS CMS. It needs these vars **present in `process.env`** at run time:
```
OPTIMIZELY_CMS_CLIENT_ID=
OPTIMIZELY_CMS_CLIENT_SECRET=
```

**How the CLI picks the target instance — and the env gotchas (learned the hard way):**
- **The CLI does NOT load any `.env` file itself.** It reads only from `process.env` (see `node_modules/@optimizely/cms-cli/dist/service/config.js`). `next dev` auto-loads `.env.local`, but a bare `npx @optimizely/cms-cli config push` does not — so the credentials must already be exported in the shell, or loaded via `--env-file`. Editing `.env.local` and immediately running the CLI in the same shell will use whatever was loaded *before* the edit → stale creds → `401 invalid bearer token`.
- **`OPTIMIZELY_CMS_URL` is NOT read by the CLI.** The host is taken from `--host` / `OPTIMIZELY_CMS_API_URL`, else defaults to the shared SaaS gateway `https://api.cms.optimizely.com` (`cmsRestClient.js`). The instance URL (`app-…cms.optimizely.com`) is the CMS UI host, not the API gateway — do not set it as `OPTIMIZELY_CMS_API_URL`. **Which instance the push targets is determined entirely by the `client_id`/`client_secret`.** Wrong creds → silently pushes to the wrong instance.

**Env-file model:** the project uses a standard layered setup, all gitignored except the committed `.env.example` template:
- **`.env`** — the site/project you develop against (the instance's Graph key + CMS client credentials + the deployed `NEXT_PUBLIC_SITE_URL`). To switch to a different instance, edit this file.
- **`.env.local`** — machine-local overrides loaded *after* `.env` (wins on overlap). Holds only what differs locally, e.g. `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.
- **`.env.example`** — committed, documented, no secrets. Copy to `.env` to onboard: `cp .env.example .env`.

The `cms:push` / `cms:pull` scripts feed these files to the CLI explicitly (the CLI does not read `.env` itself), mirroring Next.js precedence — `.env` then `.env.local`:
```bash
yarn cms:push   # → node --env-file=.env --env-file-if-exists=.env.local … config push
yarn cms:pull
```
Because the push target is determined solely by the `client_id`/`client_secret` in `.env`, the instance you push to always matches the instance `.env` points at — no shell-export drift. To run the CLI ad-hoc: `node --env-file=.env --env-file-if-exists=.env.local node_modules/@optimizely/cms-cli/bin/run.js config push` — the subcommand is `config push`, not just `push`.

**Critical:** Registering a content type in `cms/registry.ts` immediately adds it to every GraphQL query the SDK sends. If the type has not been pushed to the CMS Graph schema yet, the Next.js production build (`yarn build`) will fail with `HTTP 400: Unknown type "OT_YourBlock"`. The dev server (`yarn dev`) is not affected. Push the type before deploying.

**Every property `group` used by a content type MUST be declared in `optimizely.config.mjs` → `propertyGroups`.** The content-type portion of a manifest import is **atomic**: a single property referencing an undeclared group (e.g. `group: 'OT_Style'` when `OT_Style` isn't in `propertyGroups`) rolls back *all* content types in the push. The symptom is misleading — you get a handful of `property group 'X' does not match an existing group` errors plus a cascade of `Unable to find a content type 'OT_…'` errors for the display templates (which import fine but can't bind to the rolled-back types). Declared groups: `OT_Content`, `OT_Style`, `OT_Theme`, `OT_SEO`, `OT_Integrations`. Add the group to the config before using it on a property.

### OptiForm elements — not part of this SDK

The `OptiFormsChoiceElement`, `OptiFormsTextboxElement`, and related types registered in `cms/registry.ts` are **Optimizely Forms** components — a separate hosted service, not the CMS SDK. They are included in the content type registry for Graph fragment compatibility but are not authored through the same SDK patterns. Do not attempt to style, preview, or extend them using the four-layer block pattern described above. If editors report form preview issues, the cause is almost certainly the Forms service configuration, not the Next.js app.

**Do not push OptiForms types or their display templates.** `optimizely.config.mjs` excludes both (`!cms/content-types/OptiForms*.ts` and `!cms/display-templates/OptiForms*.ts`). The Forms backing types are never pushed, so pushing a Forms display template (e.g. `OptiFormsContainer.ts`) fails with `Unable to find a content type 'OptiFormsContainerData'`. Forms is not enabled in these environments. If you add a new Forms-related file, make sure the `OptiForms*` glob excludes it from both directories.
