# Optimizely SaaS CMS — Architecture Guide

This document explains how Optimizely SaaS CMS is integrated into this Next.js project: how content types, display templates, and components relate to each other, how GraphQL is used to fetch content, and how the preview system works. Read this before adding any new CMS-driven content.

---

## Mental model

The CMS and the front end share a contract expressed in TypeScript. Editors work in the Visual Builder; content is stored in the CMS and delivered over Optimizely Graph (a GraphQL API). The Next.js app queries that API, resolves each piece of content to a React component, and renders it.

There are four distinct layers for every content block:

```
Content Type  →  Display Template  →  CMS Adapter  →  React Component
(schema)         (settings schema)    (cms/components)  (components/blocks)
```

Every layer has a specific responsibility and they must all stay in sync.

---

## Environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `OPTIMIZELY_GRAPH_SINGLE_KEY` | `lib/optimizely.ts` | Single-key for all public Graph queries |
| `OPTIMIZELY_CMS_URL` | Preview routes, layout | Base URL of the CMS instance (e.g. `https://app-xyz.cms.optimizely.com`) |
| `OPTIMIZELY_CMS_CLIENT_ID` | `cms-cli` only | OAuth client for pushing content type definitions |
| `OPTIMIZELY_CMS_CLIENT_SECRET` | `cms-cli` only | OAuth client secret |

`OPTIMIZELY_GRAPH_SINGLE_KEY` is the only key required at runtime for the front end. The CLI credentials are only needed when running `npx @optimizely/cms-cli config push` to sync content type definitions to the CMS.

---

## SDK initialization (`lib/optimizely.ts` + `cms/registry.ts`)

The root layout (`app/layout.tsx`) imports both files at the top:

```ts
import '@/lib/optimizely'   // configures the SDK with the Graph single key
import '@/cms/registry'     // registers all content types, display templates, and React components
```

These imports run once on server startup. Nothing else in the app needs to call the SDK initializers.

### `lib/optimizely.ts`

Calls `config({ apiKey })` from `@optimizely/cms-sdk` exactly once (guarded by an `initialized` flag). Exports:

- `getClient()` — returns the initialized Graph client; used everywhere content is fetched
- `getSiteSettings(domain)` — fetches the `OT_ThemeManager` instance whose `frontEndDomain` matches the current request's hostname, falling back to the first available instance. Wrapped in React `cache()` so Header, Footer, and layout all share a single Graph round-trip per request.
- `buildThemeCSS(settings)` — converts ThemeManager color values into inline CSS custom property overrides
- `getRequestDomain()` — reads the `Host` header from the Next.js request context

### `cms/registry.ts`

Calls three SDK functions:

- `initDisplayTemplateRegistry([...])` — tells the SDK which display templates exist and what settings they expose
- `initContentTypeRegistry([...])` — tells the SDK what fields each content type has so it can build the correct GraphQL fragment when fetching compositions
- `initReactComponentRegistry({ resolver: {...} })` — maps content type keys (e.g. `"OT_HeroBlock"`) to the React adapter components that render them

All three registries must stay in sync with each other and with the `optimizely.config.mjs` file. Missing entries cause silent render failures.

---

## Content types (`cms/content-types/`)

A content type is a TypeScript-declared schema that defines what fields editors can fill in. It maps exactly to what the CMS stores and what the Graph API returns.

```ts
export const OT_HeroBlock = contentType({
  key: 'OT_HeroBlock',          // unique identifier — must match everywhere
  displayName: 'Hero Block',    // label editors see in the CMS
  baseType: '_component',       // what kind of content this is (see below)
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'], // where it can appear
  properties: {
    headline: { type: 'string', displayName: 'Headline', group: 'OT_Content', sortOrder: 20 },
    visual:   { type: 'contentReference', allowedTypes: ['_image'], ... },
    primaryCtaUrl: { type: 'url', ... },
  },
})
```

### Base types

| `baseType` | Meaning |
|---|---|
| `_component` | A reusable block of content — the most common type. Can be standalone (shared content) or placed inside an experience. |
| `_experience` | A page composed in the Visual Builder. Contains a composition tree (sections → rows → columns → blocks). |
| `_page` | A traditional CMS page with a URL. Less common in this project. |
| `_image`, `_video` | Built-in media types. Used as `allowedTypes` constraints on `contentReference` fields. |

### Property types

| `type` | GraphQL shape | Notes |
|---|---|---|
| `string` | plain scalar | Also supports `format: 'selectOne'` with an `enum` list for dropdowns |
| `richText` | `{ html, json }` | Full rich-text editor (TinyMCE). Access `.json` in adapters and render with `<RichText content={content.body?.json ?? undefined} />` from `@optimizely/cms-sdk/react/richText`. Never use `.html` with `dangerouslySetInnerHTML`. |
| `url` | `InferredUrl` object | Shape: `{ default, hierarchical, internal, graph, base, type }` — all string or null. Use `content.myField?.default` for the plain URL string. Never treat this as a plain string; accessing it as `String(content.myField)` will give `[object Object]`. |
| `contentReference` | `InferredContentReference` object | Shape: `{ url: InferredUrl, item, key }`. Use `src(field)` from `getPreviewUtils` to extract the URL, or access `.url?.default` directly. For content references that have sub-item metadata (e.g. `articleRoot`), the URL is at `.url?.hierarchical`, not `._metadata.url`. |
| `link` | `{ text, title, target, url: InferredUrl }` | For CTAs and navigation links. The href is `field?.url?.default`; always add `rel="noopener noreferrer"` when `target === '_blank'`. |
| `boolean` | plain scalar | |
| `integer` | plain scalar | |
| `json` | plain scalar | Stored and returned as a raw JSON string — parse on the client |
| `array` | array of items | Items can be `{ type: 'component', contentType: SomeType }` for nested structured content |

### Property definition rules — SDK type constraints

These are non-obvious constraints enforced by the SDK's TypeScript types. Violating them produces build errors.

- **Enum `value` not `key`**: dropdown items must be `{ value: 'foo', displayName: 'Foo' }`, not `{ key: 'foo' }`.
- **Flat validation**: `maxLength` is a top-level property field — there is no `validation: {}` wrapper object.
- **`isLocalized` not `localized`**: the localization flag is `isLocalized: true`.
- **`required` is unsupported**: the SDK types do not include a `required` field — omit it.
- **`xhtml` does not exist**: rich text is `type: 'richText'`, not `type: 'xhtml'`.

### Controlling child content types (`mayContainTypes`)

`_page`, `_experience`, and `_folder` content types can declare which child content types editors are allowed to create inside them in the CMS tree. Without this, the CMS defaults to "None" and editors cannot add child pages.

```ts
export const BlankExperience = contentType({
  key: 'BlankExperience',
  baseType: '_experience',
  mayContainTypes: ['_self', 'OT_BlogPage', 'OT_FolderPage'],
  // '_self' = "same type as me", avoids circular import
  // string keys avoid circular imports between co-dependent files
  ...
})
```

`mayContainTypes` accepts an array of `ContentType` references or string keys. Use string keys when two files would otherwise circularly import each other (e.g. `BlankExperience` and `OT_FolderPage` both reference each other).

### Composite/nested content types

Some content types exist purely as structured sub-items inside an array field — they are never placed independently. Examples: `OT_NavigationItem`, `OT_NavigationSubItem`, `OT_FooterLink`, `OT_FooterColumn`. These must still be registered in `initContentTypeRegistry` so the SDK can build GraphQL fragments for them.

### The ThemeManager (`OT_ThemeManager`)

A special `_component` block that acts as site-wide configuration. It is stored in CMS Shared Content (not in a page tree or experience). The front end queries all ThemeManager instances, then filters by `frontEndDomain` to find the right one for the current deployment. Fields cover:

- Logo (contentReference to media library) + logoFit, logoAlt, logoInvertDark
- Default theme mode (dark/light)
- Header CTA (label + URL)
- Primary navigation (array of `OT_NavigationItem`)
- Footer columns (array of `OT_FooterColumn`) + copyright + legal links
- Color overrides for the 11 CSS custom properties in `styles/tokens.css`

Color overrides use raw CSS values (hex, `oklch(...)`, `hsl(...)`, etc.). If a field is blank the token falls back to the value in `styles/tokens.css`. `buildThemeCSS()` converts populated fields into an inline `<style>` tag injected in `<head>` before first paint.

---

## Display templates (`cms/display-templates/`)

A display template defines the **visual presentation options** for a content type or a composition node. These are the settings panels editors see in the Visual Builder sidebar — things like background color, layout direction, column width, spacing, etc.

```ts
export const OT_HeroDefault = displayTemplate({
  key: 'OT_HeroDefault',
  displayName: 'Hero Default',
  contentType: 'OT_HeroBlock',   // which content type this template belongs to
  isDefault: true,               // the CMS uses this if no template is explicitly chosen
  settings: {
    layout: {
      displayName: 'Panel layout',
      editor: 'select',
      choices: {
        imageRight: { displayName: 'Image Right (Default)' },
        imageLeft:  { displayName: 'Image Left' },
      },
    },
    color: { ... },
    animation: { ... },
  },
})
```

Display templates do not contain content — they only carry **how** to render the content. The SDK passes the selected choices as a `displaySettings` object to the React adapter at render time.

### Composition display templates (Section / Row / Column)

The Visual Builder composes pages from sections, which contain rows, which contain columns, which contain blocks. Each structural node has its own display template:

| Template | `baseType` / `nodeType` | Purpose |
|---|---|---|
| `OT_LandingSection` | `baseType: '_section'` | Controls width, vertical spacing, min-height, background color of a section |
| `OT_LandingRow` | `nodeType: 'row'` | Controls flex direction, gap, alignment, background, entrance animation |
| `OT_LandingColumn` | `nodeType: 'column'` | Controls column span (1–12), padding, alignment |

**Important:** `_section` uses `baseType`, not `nodeType`. Only `'row'` and `'column'` are valid `nodeType` values. Using `nodeType: 'section'` was a past bug — the display template must use `baseType: '_section'` to be recognized by the SDK.

---

## CMS adapter components (`cms/components/`)

Adapters are the bridge between what the CMS returns and what the React component needs. They are registered in `initReactComponentRegistry` and called by the SDK automatically when the composition renderer encounters their content type key.

Every adapter follows the same pattern:

```tsx
import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_HeroBlock as OT_HeroBlockContentType } from '@/cms/content-types/OT_HeroBlock'
import { getHeroStyles } from '@/cms/styling/OT_HeroBlock.styling'
import HeroBlock from '@/components/blocks/HeroBlock'

type Props = {
  content: ContentProps<typeof OT_HeroBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

export default function OT_HeroBlock({ content, displaySettings = {} }: Props) {
  const { pa, src } = getPreviewUtils(content)
  const styleOptions = getHeroStyles(displaySettings)

  return (
    <div {...pa(content.__composition)}>
      <HeroBlock
        headline={content.headline ?? ''}
        visualSrc={src(content.visual)}
        styleOptions={styleOptions}
        pa={pa}
      />
    </div>
  )
}
```

**Import aliasing:** The content type export name (`OT_HeroBlock`) collides with the adapter's default export function name. Always import the content type with a `...ContentType` alias: `import { OT_HeroBlock as OT_HeroBlockContentType }`.

**`ContentProps<typeof OT_HeroBlockContentType>`** generates a typed interface from the content type definition. Each property is typed according to its SDK property type — e.g. `string | null`, `InferredUrl | null`, `InferredRichText | null`. This catches incorrect field access at build time.

**Note on `displaySettings`:** This remains `Record<string, string | boolean>` because the styling helpers (`cms/styling/`) accept that broad type. The trade-off is intentional — updating the styling helper signatures to accept `ContentProps<typeof OT_HeroDefault>` would cascade changes through many files for little practical benefit.

**`getPreviewUtils(content)`** returns two helpers:

- `pa(fieldOrNode)` — "property attributes". When preview mode is active, returns `{ "data-epi-property-name": "fieldName" }` or `{ "data-epi-block-id": "..." }`, enabling the CMS overlay for on-page editing. In production it returns `{}`. Spread it onto the relevant DOM element.
- `src(contentReference)` — extracts `url.default` from a contentReference field. Returns `undefined` if the field is empty.

**`displaySettings`** is a flat `Record<string, string | boolean>` of the choices the editor made in the display template's settings panel. The adapter passes these to a styling helper (see below).

The outer `<div {...pa(content.__composition)}>` is the **block container** — it carries the block-level `data-epi-block-id` attribute. This is what the CMS uses to draw the selection overlay around the entire block. The inner `pa(fieldName)` calls mark individual editable properties.

---

## Styling helpers (`cms/styling/`)

One helper file per block translates the raw `displaySettings` object into the typed `styleOptions` structure the React component expects.

```ts
// cms/styling/OT_HeroBlock.styling.ts
export function getHeroStyles(s: Record<string, string | boolean>): HeroStyleOptions {
  return {
    layout:    (s.layout    ?? 'imageRight') as HeroStyleOptions['layout'],
    color:     (s.color     ?? 'brand')      as HeroStyleOptions['color'],
    animation: (s.animation ?? 'none')       as HeroStyleOptions['animation'],
  }
}
```

This layer exists to keep TypeScript-aware. `displaySettings` comes from the SDK as `Record<string, string | boolean>`; the styling helper casts the values to the correct union types and applies defaults, preventing those concerns from leaking into the pure React component.

---

## React block components (`components/blocks/`)

These are the actual visual components. They know nothing about the CMS. They receive typed props and render HTML + Tailwind classes using `cva` (class-variance-authority) for variant logic.

Every renderable prop that should be editable in-place has `pa` spread onto the element carrying that text or image:

```tsx
<h1 {...pa('headline')}>{headline}</h1>
<p  {...pa('body')}>{body}</p>
```

The `pa` function is threaded down from the adapter as a prop. In non-preview contexts it's a no-op `() => ({})`. This pattern means the React component stays pure and testable.

---

## Experiences and composition rendering

An **experience** is a page type built in the Visual Builder. The `BlankExperience` content type (`baseType: '_experience'`) is the only experience type in this project — all pages use it.

When a page is fetched, the Graph API returns a `composition.nodes` tree. The SDK's `<OptimizelyComposition nodes={...} />` component walks that tree, resolves each node to the registered Section/Row/Column/Block adapters, and renders them.

### Composition tree structure

```
BlankExperience (experience)
└── Section (OT_LandingSection display template)
    └── Row (OT_LandingRow display template)
        ├── Column (OT_LandingColumn display template)
        │   └── OT_HeroBlock (block)
        └── Column
            └── OT_CardBlock (block)
```

The Section/Row/Column adapters are registered under fixed SDK keys in `initReactComponentRegistry`:

```ts
BlankSection: BlankSectionAdapter,   // SDK's internal key for experience sections
_Row:         RowAdapter,             // SDK's fixed key for row nodes
_Column:      ColumnAdapter,          // SDK's fixed key for column nodes
```

**Section** renders a `<section>` element and delegates its children to `<OptimizelyGridSection nodes={content.nodes} />`, which handles the row/column recursion.

**Row** renders a flex container. It reads `displaySettings` for breakpoint, gap, alignment, background color, background image, overlay, animation, and reverse order.

**Column** renders a flex column. It reads `displaySettings` for span (1–12), padding, and content alignment.

Blocks that have `compositionBehaviors: ['elementEnabled', 'sectionEnabled']` in their content type definition can be placed directly inside an experience node or used as a shared block. Those without these behaviors can only be referenced from other content types (e.g. ThemeManager is queried directly, not placed in a Visual Builder composition).

---

## GraphQL — how content is fetched

Optimizely Graph is a hosted GraphQL API. All queries go through the Graph client returned by `getClient()`.

### Automatic query building via the SDK

When rendering a composition, the SDK uses the content type registry to auto-generate the GraphQL fragment for each block type. This is why all content types must be registered even if they have no custom properties — without registration the SDK generates an empty fragment and the block receives no field data.

### Direct queries (manual GraphQL)

For content that lives outside a composition — like `OT_ThemeManager` — you write the query yourself using `client.request()`:

```ts
const data = await getClient().request(THEME_QUERY, {})
```

The query targets the content type by its key as the root field name:

```graphql
query GetThemeManagers {
  OT_ThemeManager(limit: 20) {
    items {
      frontEndDomain
      logo { url { default } }
      primaryNavigation {
        menuLink { text title target url { default } }
        subNavItems { menuLink { ... } description }
      }
    }
  }
}
```

**Shape rules for direct queries:**
- `url` fields return `{ default }` — always use `.url.default`
- `contentReference` fields return the referenced item expanded; access `.url.default` for the asset URL
- `array` fields of component sub-types return an array of objects with the sub-type's properties
- `link` fields return `{ text, title, target, url { default } }`

### Preview queries

For draft/unpublished content, `getClient().getPreviewContent(previewParams)` is used instead of `getContentByPath`. The SDK handles the auth token exchange internally. Always pass `{ cache: false }` for preview fetches.

### React `cache()` deduplication

Any function that calls `getClient()` and is called from multiple server components in the same request should be wrapped in React's `cache()` function. This prevents duplicate Graph round-trips when, for example, both `app/layout.tsx` and `Header.tsx` each call `getSiteSettings()`.

---

## Routing

### Site routes (`app/(site)/`)

**`app/(site)/[...slug]/page.tsx`** — the catch-all CMS page route. For every URL segment, it:

1. Calls `getClient().getContentByPath(path)` to fetch the experience at that path
2. If draft mode is active and a `preview_token` is present, calls `getClient().getPreviewContent(previewParams)` instead
3. If the response has `composition.nodes`, renders `<OptimizelyComposition nodes={...} />`
4. If in draft mode but the content is a standalone block (no composition), redirects to `/preview`
5. Otherwise calls `notFound()`

### Draft entry points (`app/api/draft/`)

There are two draft API routes:

**`/api/draft/route.ts`** — simple draft mode enabler. Sets the Next.js draft mode cookie and redirects to the target path with all preview params as query string parameters. Used when the CMS has the preview URL set to this endpoint.

**`/api/draft/[...slug]/route.ts`** — smarter draft enabler. Fetches the content item by key + version to determine its type, then routes to the appropriate preview location:
- `_Experience` → redirects to the experience's CMS URL path
- `_Component` → redirects to `/preview` (shared block preview)
- `_Page` → redirects to the page's URL

**`/api/draft/disable/route.ts`** — disables Next.js draft mode.

---

## Preview system

The Optimizely Visual Builder opens a preview iframe pointing at the Next.js app. The preview system has several moving parts.

### `communicationinjector.js`

A script served from the CMS instance itself (`${OPTIMIZELY_CMS_URL}/util/javascript/communicationinjector.js`). It must be loaded on every preview page. It sets up `window.epi`, the message bridge between the CMS editor and the front-end iframe.

### `<PreviewComponent />`

Imported from `@optimizely/cms-sdk/react/client`. A client component that subscribes to CMS events (content saved, selection changed) and triggers full re-renders by updating URL search params. This is how the preview iframe refreshes when an editor makes a change.

### On-page editing (`components/draft/OnPageEdit.tsx`)

A client component that subscribes to the `contentSaved` event on `window.epi` and updates `innerHTML` of elements marked with `data-epi-property-name` in place — giving instant feedback for simple text edits without a full page reload.

### `withAppContext`

A higher-order component from `@optimizely/cms-sdk/react/server`. Wrap any page that renders CMS compositions with it. It provides the app context that `OptimizelyComposition` needs to resolve component registry lookups and inject preview metadata.

```tsx
export default withAppContext(CmsPage)
```

### `/preview` page (`app/preview/page.tsx`)

A dedicated page for rendering standalone blocks (those not placed inside an experience). It calls `getPreviewContent()`, then:

- If the result has `composition.nodes` → it is an experience; renders full layout + `<OptimizelyComposition>`
- Otherwise → it is a standalone block; renders `<OptimizelyComponent content={standaloneContent} />`

For standalone blocks, `__composition: { key: contentKey }` is synthesized onto the content object so the adapter's `pa(content.__composition)` call generates the correct `data-epi-block-id` attribute for the CMS overlay.

### Draft route group (`app/(draft)/`)

A separate route group layout for draft rendering. Loads `communicationinjector.js` and mounts `<OnPageEditBridge />` (the client-side `OnPageEdit` component). Forced to `dynamic = 'force-dynamic'` and `revalidate = 0` so draft content is never cached.

### Default application requirement

If the CMS instance has more than one application defined, a default application must be set (Settings → Applications in the CMS admin). Without a default, the Visual Builder cannot determine which front-end URL to use for shared block previews and shows "Preview is not configured."

---

## Preview vs production — rendering differences

The CMS preview renders through the same Next.js app as production, but there are structural and data differences that affect how components look. This causes persistent visual discrepancies between the CMS editor and the live site. Understanding these differences prevents incorrect "bug" diagnoses and guides better component design.

### How each preview context works

| Context | Entry route | Data source | Layout |
|---|---|---|---|
| **Visual Builder (experience)** | slug route, draft mode active | `getPreviewContent(previewParams)` | Full site layout (Header + Footer) |
| **Page preview (`_page` type)** | slug route, draft mode active | `getPreviewContent(previewParams)` | Full site layout (Header + Footer) |
| **Standalone block preview** | `/preview?key=...` | `getPreviewContent(previewParams)` | No site layout — `OptimizelyComponent` renders directly against canvas background |

### Data differences between preview and public

When draft mode is active, content comes from `getPreviewContent()` (SDK direct return). When public, `_page` types run a targeted GraphQL query (`getBlogPage`, etc.) that explicitly requests all needed fields.

**Key difference**: `getPreviewContent()` may return content references in a different shape than a Content Graph query. Fields that rely on Content Graph expansion (like `featuredImage.url.default`) may be present as a raw content reference object with a `key` but no expanded URL. Always test that any `?.url?.default` access has a graceful fallback — do not assume it is equivalent to the published Graph result.

**Example** — atmospheric blog header: `imageUrl = featuredImage?.url?.default` may be `undefined` in preview even when an image is assigned. The component must show a branded fallback background rather than relying on the image to fill the space.

### Visual differences to expect and design around

**1. Standalone block previews look sparse**

`OptimizelyComponent` renders the block with no surrounding layout. The block appears in the top-left of a dark canvas page. This is correct behaviour — the block adapter (`cms/components/`) should wrap its output in a preview shell that provides minimum padding and a full-height background so editors can see the block clearly without surrounding page context.

Pattern — add to every adapter that will be previewed standalone:
```tsx
return (
  <div className="min-h-screen bg-canvas flex items-start justify-start p-xl">
    <div {...pa(content.__composition)} className="...your-block-styles...">
      {/* block content */}
    </div>
  </div>
)
```

**2. `vh`-based sizing behaves differently in the preview iframe**

The CMS preview iframe is typically narrower and shorter than a real browser viewport. A header with `min-h-[68vh]` that fills two-thirds of the screen on Vercel may fill the *entire* visible area of the CMS preview iframe, hiding the content that `justify-end` pushes to the bottom. Mitigate with responsive min-heights:

```tsx
// Good — smaller on constrained viewports (including CMS iframe)
className="min-h-[55vh] lg:min-h-[68vh]"

// Bad — always 68 % of whatever viewport the iframe has
className="min-h-[68vh]"
```

**3. Featured images may not load in preview**

Image URLs from `getPreviewContent()` resolve to CMS-hosted assets. In some contexts the image may fail to load (indexing delay, transient auth). Components with full-bleed background images must declare a hardcoded fallback background colour so the editor sees a branded surface, not a black void.

```tsx
// Hardcode the fallback — do not rely solely on CSS variables for critical backgrounds.
// bg-brand via a Tailwind class resolves through CSS custom properties and
// still works; but an inline style with an explicit oklch value guarantees
// something visible even before the theme CSS has applied.
<header style={{ backgroundColor: 'oklch(38% 0.16 195)' }}>
  {imageUrl && <img src={imageUrl} className="absolute inset-0 w-full h-full object-cover" />}
</header>
```

**4. CSS custom properties resolve identically in preview and production**

The root layout (`app/layout.tsx`) runs for every route including `/preview` and the slug route in draft mode. `data-theme` is set via an inline script before first paint, and `styles/tokens.css` defines all `--ot-*` variables in `:root`. CSS custom properties are available in every preview context — do not duplicate or hardcode design token values in adapters as a "preview fix." The exception is critical background colours where a hardcoded fallback guarantees visibility before the first CSS paint (see point 3 above).

**5. `pa()` attributes are no-ops in production**

`getPreviewUtils(content)` returns a `pa` function that emits `data-epi-property-name` or `data-epi-block-id` attributes only when preview mode is active. In production it returns `{}`. Never gate rendering logic on the presence of `pa` attributes — they are metadata overlays, not conditional flags.

### Checklist for every new component

Before shipping a block or page adapter:

- [ ] Does the component have a visible fallback if `featuredImage?.url?.default` is null?
- [ ] If the component uses `min-h-[Xvh]`, is it responsive enough that the CMS iframe won't hide the content?
- [ ] Does the standalone block adapter wrap in a `min-h-screen bg-canvas p-xl` preview shell?
- [ ] Are all design token references via `var(--ot-*)` or Tailwind utilities, not hardcoded colour values (except critical fallback backgrounds)?
- [ ] Does `pa()` appear on every directly-editable field and on `content.__composition`?

---

## CLI — syncing content types to the CMS

The `optimizely.config.mjs` file tells the CLI what to push:

```js
export default {
  components: [
    'cms/content-types/*.ts',
    'cms/display-templates/*.ts',
    // Exclude built-in OptiForms types — owned by the Forms product,
    // cannot be modified via the CLI.
    '!cms/content-types/OptiForms*.ts',
  ],
  propertyGroups: [
    { key: 'OT_Content',      displayName: 'Content',           sortOrder: 100 },
    { key: 'OT_Theme',        displayName: 'Theme',             sortOrder: 200 },
    { key: 'OT_SEO',          displayName: 'Search & Discovery', sortOrder: 300 },
    { key: 'OT_Integrations', displayName: 'Integrations',      sortOrder: 400 },
  ],
}
```

Run `npx @optimizely/cms-cli config push` after any change to a content type or display template. The CLI reads the TypeScript files, serializes the schema, and pushes it to the CMS via the OAuth credentials in `.env.local`. The front end can start using new fields immediately after a push.

**Never rename a content type key.** Renaming breaks existing content in the CMS. Add new types or new fields; avoid removing or renaming existing ones unless the content has been migrated.

---

## Adding a new CMS page type — checklist

`_page` types are traditional CMS pages with URLs. Unlike `_experience` types (which render a Visual Builder composition), they are fetched and rendered by a dedicated React component in the Next.js route handler.

1. **Content type** — create `cms/content-types/OT_MyPage.ts` using `contentType({ key, baseType: '_page', properties })`. No `compositionBehaviors` (pages are not placed inside compositions).

2. **Register** — in `cms/registry.ts`, add the content type to `initContentTypeRegistry` only. No display template, no adapter, no `initReactComponentRegistry` entry is needed for page types.

3. **Push to CMS** — run `npx @optimizely/cms-cli config push`.

4. **Data fetching** — add query functions to `lib/blog.ts` (or a new `lib/my-page.ts`). Use `getClient().request(QUERY, vars)` for direct GraphQL queries. For related content (e.g. latest posts), use `cache()` from React to deduplicate cross-component fetches.

5. **React component** — create `components/pages/MyPage.tsx`. Receives all content as typed props. No CMS SDK imports.

6. **Route handler** — in `app/(site)/[...slug]/page.tsx`, add a branch inside the `!exp?.composition?.nodes` block that checks `exp?.__typename === 'OT_MyPage'`. For public requests make a targeted direct query to fetch all fields (the initial `getContentByPath` call may not return page-specific fields). For draft/preview mode, `exp` from `getPreviewContent` already contains all fields and can be used directly.

7. **Showcase** — add a `<YourPageShowcase />` component to `app/(site)/showcase/blocks/[block]/page.tsx` and a `{ label: 'Your Page', slug: 'your-page' }` entry to `app/(site)/showcase/config.ts`.

### How `_page` routing differs from `_experience`

| | `_experience` | `_page` |
|---|---|---|
| Renders via | `<CompositionRenderer>` (SDK composition tree) | Dedicated React component |
| Display template | Yes — controls Visual Builder settings | Not needed |
| CMS adapter | One per block type inside the experience | Not needed |
| Route detection | `exp?.composition?.nodes` exists | `exp?.__typename === 'OT_MyPage'` |
| Preview mode | Uses `exp` from `getPreviewContent` directly | Same |
| Field data source | SDK auto-generates fragment from registry | Direct GraphQL query in `lib/` |

### Existing `_page` types

| Type key | Component | Data fetching |
|---|---|---|
| `OT_BlogPage` | `components/pages/BlogPage.tsx` | `lib/blog.ts` — `getBlogPage(key)`, `getLatestBlogPosts(excludeKey)` |

---

## OptiForm elements — separate service, not the CMS SDK

The `OptiFormsChoiceElement`, `OptiFormsTextboxElement`, `OptiFormsNumberElement`, and related types that appear in `cms/registry.ts` and `cms/content-types/` are **Optimizely Forms** — a hosted form service that is separate from the Optimizely SaaS CMS SDK. They are registered in the content type registry purely so the SDK can include them in GraphQL composition fragments (preventing HTTP 400 errors), but they are **not authored through the four-layer block pattern**.

Do not:
- Create display templates for OptiForm types
- Build CMS adapters for OptiForm types following the `OT_` pattern
- Attempt to style OptiForm fields using `cms/styling/` helpers
- Try to add OptiForm types to `compositionBehaviors`

If editors report form preview issues or the forms service does not render in the preview iframe, the root cause is the Forms service configuration (webhook endpoints, form IDs, or site permissions) — not the Next.js application code.

---

## Adding a new CMS block — checklist

Follow all steps in order; omitting any step causes silent failures.

1. **Content type** — create `cms/content-types/OT_MyBlock.ts` using `contentType({ key, baseType, compositionBehaviors, properties })`. Add `compositionBehaviors: ['elementEnabled', 'sectionEnabled']` if the block should be placeable in experiences.

2. **Display template** — create `cms/display-templates/OT_MyDefault.ts` using `displayTemplate({ key, contentType: 'OT_MyBlock', isDefault: true, settings })`. Define every editor-controllable visual option as a `select` setting with named choices.

3. **Register** — in `cms/registry.ts`, add the content type to `initContentTypeRegistry`, the display template to `initDisplayTemplateRegistry`, and the adapter to `initReactComponentRegistry`.

4. **Push to CMS** — run `npx @optimizely/cms-cli config push`. Verify the count in the output matches expectations.

5. **Styling helper** — create `cms/styling/OT_MyBlock.styling.ts`. Export a function that translates `Record<string, string | boolean>` → typed `MyStyleOptions`, applying defaults for each setting.

6. **Adapter** — create `cms/components/OT_MyBlock.tsx`. Import `getPreviewUtils`, the styling helper, and the React component. Follow the standard adapter pattern: outer `<div {...pa(content.__composition)}>`, spread `pa` on each editable element.

7. **React component** — create `components/blocks/MyBlock.tsx`. Pure React component with typed props. Use `cva` for variant logic driven by `styleOptions`. Spread `pa('fieldName')` on each element that holds an editable property. The component must not import anything from `@optimizely/cms-sdk`.

8. **Showcase** — add a `<YourBlockShowcase />` component to `app/(site)/showcase/blocks/[block]/page.tsx`, a case in the switch statement, and a `{ label: 'Your Block', slug: 'your-block' }` entry to `app/(site)/showcase/config.ts`. Both files must be updated or the block won't be reachable from the nav.

---

## File map

```
cms/
  content-types/     TypeScript schema definitions (pushed to CMS via CLI)
  display-templates/ Visual setting schemas (pushed to CMS via CLI)
  components/        CMS adapter components (bridge CMS data → React props)
  compositions/      Section / Row / Column structural adapters
  styling/           DisplaySettings → StyleOptions translators

components/
  blocks/            Pure React presentational components
  layout/            Header, Footer, Nav (server components fed by ThemeManager)
  draft/             OnPageEdit (client component for in-place edits)
  preview/           BlockRenderer (wraps OptimizelyComponent for standalone blocks)
  providers/         ThemeProvider, MotionObserver

app/
  layout.tsx         Root: SDK init, ThemeManager fetch, font vars, theme CSS injection
  (site)/
    [...slug]/       Catch-all CMS page renderer
    showcase/        Static design system reference (not CMS-driven)
  (draft)/
    layout.tsx       communicationinjector.js + OnPageEditBridge
    draft/[v]/block/ Draft block preview (deprecated path — use /preview)
  api/draft/         Draft mode API routes
  preview/           Standalone block + experience preview page

lib/
  optimizely.ts      SDK init, getClient, getSiteSettings, buildThemeCSS

cms/
  registry.ts        Registers all types, templates, and components with the SDK

optimizely.config.mjs  CLI push config (paths + property groups)
```

---

## Lessons learned — known gotchas

Consolidated from real build failures and runtime bugs. Read this before starting any CMS work.

### Build fails with "Unknown type OT_YourBlock" on Vercel

**Cause:** Registering a content type in `cms/registry.ts` immediately includes it in every GraphQL composition fragment the SDK auto-generates. If the type hasn't been pushed to the CMS Graph yet, the Next.js static page generation query returns HTTP 400.

**Fix:** Run `npx @optimizely/cms-cli config push` before merging/deploying any new content type. The dev server (`yarn dev`) is not affected because it does not run static page generation.

### CLI command is `config push`, not `push`

The correct command is `npx @optimizely/cms-cli config push`. Running `npx @optimizely/cms-cli push` alone will not push content types.

### `richText` fields return an object, not a string

A `type: 'richText'` property returns `{ html, json }` from GraphQL. Always use the `.json` field and render with the SDK's `<RichText>` component — never use `.html` with `dangerouslySetInnerHTML`:

```tsx
// In the adapter — pass json to the UI component:
body={content.body?.json ?? undefined}

// In the React component — render with the SDK component:
import { RichText } from '@optimizely/cms-sdk/react/richText'

{body && (
  <div className="your-prose-styles" {...pa('body')}>
    <RichText content={body} />
  </div>
)}
```

The wrapping `<div>` provides the styling context (Tailwind classes, `data-rich-text` attributes). `<RichText>` renders Slate JSON nodes inside it.

The UI component's prop type for a rich text field should be:
```ts
body?: Parameters<typeof RichText>[0]['content'] | null
```

### Server adapters cannot be imported in client components

CMS adapter components (`cms/components/OT_*.tsx`) are server components — they import from `@optimizely/cms-sdk/react/server`. Importing them inside a `'use client'` module will either fail silently or produce unexpected output.

The showcase pages (`app/(site)/showcase/blocks/[block]/page.tsx`) are server components — they must **not** have `'use client'` at the top. The adapter imports work correctly there. If a showcase page ever becomes a client component, replace adapter imports with direct imports of the underlying `components/blocks/` component and map props manually.

### Showcase nav requires two file updates

Adding a new block showcase requires updating **both**:
1. `app/(site)/showcase/blocks/[block]/page.tsx` — the showcase component and switch case
2. `app/(site)/showcase/config.ts` — the nav chip entry

Missing the config update means the route exists but is unreachable from the nav. There is no redirect from the listing page; it redirects to `hero` by default.

### `prefers-reduced-motion` gates CSS animations

Custom CSS animation classes defined inside `@media (prefers-reduced-motion: no-preference)` blocks will not animate on machines where Reduce Motion is enabled (macOS: System Settings → Accessibility → Motion → Reduce Motion). This is correct WCAG behaviour, not a bug. For animations that need to be reliable across environments, apply the `animation` property via inline React style, referencing the `@keyframes` name directly. The keyframe definition can remain in `globals.css` without the media query wrapper.

### `mayContainTypes` must be set on page/experience/folder types

Without `mayContainTypes`, the CMS defaults to "None" for allowed child content types, and editors cannot create child pages or nest content in the tree. Every `_page`, `_experience`, and `_folder` type that should contain children needs this field. Use `'_self'` for self-referential nesting and string keys for cross-references to avoid circular imports.

### OptiForm elements are third-party

`OptiFormsChoiceElement` and related types in the registry are Optimizely Forms — a separate service. They exist in the registry only for GraphQL fragment compatibility. Preview and rendering issues with forms are Forms service issues, not Next.js issues.
