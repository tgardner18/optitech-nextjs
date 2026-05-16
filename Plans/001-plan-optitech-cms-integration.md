# Plan: OptiTech Next.js → Optimizely Visual Builder

## Context

The OptiTech marketing site in `app/page.tsx` is fully hardcoded React — two blocks with inline prop values. Seven production-quality block components already exist in `components/blocks/` (Hero, Card, PrimaryText, Quote, RichText, Image, Video). Marketers need to manage the home page via **Optimizely Visual Builder**: drag blocks into rows, edit copy inline, and see live preview without a deploy.

**What already exists:**
- Optimizely SaaS CMS instance is provisioned — all credentials are in `.env.local` (Graph key, CMS URL, client ID/secret). Only `OPTIMIZELY_PREVIEW_SECRET` is missing.
- `@optimizely/cms-sdk ^2.0.0` and `@optimizely/cms-cli ^2.0.0` are installed.
- All 7 block components exist in `components/blocks/` as pure presentational React.
- `app/page.tsx` is already a Server Component (no `'use client'`).
- `app/layout.tsx` is a Server Component with hardcoded `<Header />` and `<Footer />`.
- `Header.tsx` is `'use client'` (mobile menu `useState`) with hardcoded nav links.
- `Footer.tsx` is a Server Component with hardcoded links.
- `OT_` naming prefix is established for all project CMS content types.

**What does not exist yet:**
- `optimizely.config.mjs` — CLI reads this for the type push
- `cms/` directory — no content types, display templates, registry, or adapter components
- `lib/optimizely.ts` — no SDK client initializer
- `/api/draft` routes — no preview mode wiring
- `OT_SiteSettings` content type (Header/Footer CMS data)
- `OT_LandingExperience` content type

**Outcome:** A marketer creates one `OT_LandingExperience` in CMS at path `/`, drags OT blocks into rows in Visual Builder, edits content inline, and the Next.js app renders it at `http://localhost:3000/` with live preview. Header and footer content come from a `OT_SiteSettings` instance at `/site-settings`.

---

## Architectural pattern: content vs. style settings

This project follows the same split used in the reference Astro CMS demo:

- **Content type** (`contentType()`) — defines editable *content* fields only: text, URLs, rich text, image references. These are what marketers type into. No visual/style properties here.
- **Display template** (`displayTemplate()`) — defines *style settings* as `editor: 'select'` dropdowns. Each setting's choices carry the token-key strings the component needs (e.g., `"brand"`, `"imageRight"`, `"glow"`). Marketers pick from a labeled dropdown, never type a token string.
- **`*Styling.ts` helper** — one per block. Reads the `displaySettings` dictionary from the composition node and maps choice keys to the typed CVA variant inputs the existing `components/blocks/` component expects. This is the only place token strings are translated to typed props.
- **CMS adapter component** (`cms/components/OT_*.tsx`) — Server Component. Receives `content` (text fields) and `displaySettings` (style choice keys). Calls the Styling helper to get typed props. Calls `getPreviewUtils(content)` for inline-editing attributes. Renders the existing `components/blocks/` presentational component.

---

## Content type catalog

All types defined via `contentType()` from `@optimizely/cms-sdk` in `cms/content-types/`, using the `OT_` prefix.

**Content types carry content fields only.** Style settings live on the display template (see next section). Content properties go in the `OT_Content` property group.

### Draggable blocks — `_component`, `elementEnabled` + `sectionEnabled`

---

**`OT_HeroBlock`**
`OT_Content`: `eyebrow: string`, `headline: string`, `body: string`, `primaryCtaLabel: string`, `primaryCtaUrl: url`, `secondaryCtaLabel: string`, `secondaryCtaUrl: url`, `visualUrl: url`, `visualAlt: string`

---

**`OT_CardBlock`**
`OT_Content`: `heading: string`, `eyebrow: string`, `description: string`, `imageUrl: url`, `imageAlt: string`, `ctaLabel: string`, `ctaUrl: url`

---

**`OT_PrimaryTextBlock`**
`OT_Content`: `eyebrow: string`, `headline: string`

---

**`OT_QuoteBlock`**
`OT_Content`: `quote: string`, `attributionName: string`, `attributionTitle: string`

---

**`OT_RichTextBlock`**
`OT_Content`: `content: richText`

---

**`OT_ImageBlock`**
`OT_Content`: `src: url`, `alt: string`, `caption: string`

---

**`OT_VideoBlock`**
`OT_Content`: `src: url`, `title: string`, `caption: string`

---

### Experience — `_experience`

**`OT_LandingExperience`**
`mayContainTypes: ['_section', 'OT_HeroBlock', 'OT_CardBlock', 'OT_PrimaryTextBlock', 'OT_QuoteBlock', 'OT_RichTextBlock', 'OT_ImageBlock', 'OT_VideoBlock']`
No content properties — body is the composition tree.
Reuse the SDK's built-in `BlankSectionContentType` for rows/columns.

---

### Singleton — `_page`

The SDK has no `_singleton` base type. Use **`OT_SiteSettings`** as `_page` with `mayContainTypes: []`, and create exactly one instance at path `/site-settings`.

Embed-only nested components (no `compositionBehaviors`):

**`OT_NavItem`** — `label: string`, `url: url`, `hasDropdown: boolean`
**`OT_FooterLink`** — `label: string`, `url: url`
**`OT_FooterColumn`** — `title: string`, `links: array<component>` of `OT_FooterLink`

**`OT_SiteSettings`** (`_page`, `mayContainTypes: []`)
`OT_Content`: `logoAlt: string`, `ctaLabel: string`, `ctaUrl: url`, `copyright: string`, `navItems: array<component>` of `OT_NavItem`, `footerTagline: string`, `footerColumns: array<component>` of `OT_FooterColumn`, `legalLinks: array<component>` of `OT_FooterLink`
_(Logo image stays as a local asset for now — add `logo: contentReference` when CMS media is wired up.)_

---

## Display templates

Defined in `cms/display-templates/` via `displayTemplate()`. Each block's template must be pushed to CMS for the block to appear in the Visual Builder palette.

The `settings` field on each template defines the style dropdowns marketers see in the right-hand panel when a block is selected. Choice keys must exactly match the token strings the corresponding `*Styling.ts` helper expects.

---

### Structural templates (rows and columns)

**`OT_LandingRow`** — `nodeType: 'row'`, `isDefault: true`. No style settings needed initially.

**`OT_LandingColumn`** — `nodeType: 'column'`, `isDefault: true`. No style settings needed initially.

---

### `OT_HeroDefault` — default template for `OT_HeroBlock`

| Setting key | Display name | Editor | Choices (key → label) |
|---|---|---|---|
| `layout` | Panel layout | select | `imageRight` → "Image Right (Default)", `imageLeft` → "Image Left" |
| `color` | Background color | select | `brand` → "Brand — Teal (Default)", `canvas` → "Canvas — Dark", `surface` → "Surface" |
| `animation` | Entrance animation | select | `none` → "None (Default)", `fade` → "Fade In", `slide` → "Slide Up", `parallax` → "Parallax" |

---

### `OT_CardDefault` — default template for `OT_CardBlock`

| Setting key | Display name | Editor | Choices (key → label) |
|---|---|---|---|
| `fill` | Card fill | select | `ghost` → "Ghost (Default)", `surface` → "Surface", `brand` → "Brand — Teal", `light` → "Light", `glass` → "Glass" |
| `border` | Border | select | `none` → "None (Default)", `subtle` → "Subtle", `brand` → "Brand Teal" |
| `imageStyle` | Image treatment | select | `top` → "Top (Default)", `background` → "Background", `side` → "Side", `float` → "Floating" |
| `imageSide` | Image side | select | `left` → "Left (Default)", `right` → "Right" |
| `hover` | Hover effect | select | `none` → "None (Default)", `lift` → "Lift", `glow` → "Glow" |
| `density` | Padding density | select | `default` → "Default", `compact` → "Compact", `spacious` → "Spacious" |
| `noise` | Noise texture | select | `false` → "Off (Default)", `true` → "On" |
| `accentLine` | Accent line | select | `none` → "None (Default)", `top` → "Top Edge" |

---

### `OT_PrimaryTextDefault` — default template for `OT_PrimaryTextBlock`

| Setting key | Display name | Editor | Choices (key → label) |
|---|---|---|---|
| `alignment` | Alignment | select | `left` → "Left (Default)", `center` → "Centered" |
| `color` | Background color | select | `canvas` → "Canvas — Dark (Default)", `brand` → "Brand — Teal", `surface` → "Surface" |
| `size` | Heading scale | select | `headline` → "Headline (Default)", `display` → "Display — Largest", `title` → "Title", `label` → "Label" |
| `gradient` | Heading gradient | select | `none` → "None (Default)", `brand` → "Brand Teal", `warm` → "Warm", `luminous` → "Luminous", `ember` → "Ember" |

_Note: gradient only renders visually when `size` is `display`. The Styling helper applies it regardless; the CVA compound variant enforces the constraint._

---

### `OT_QuoteDefault` — default template for `OT_QuoteBlock`

| Setting key | Display name | Editor | Choices (key → label) |
|---|---|---|---|
| `color` | Background color | select | `canvas` → "Canvas — Dark (Default)", `brand` → "Brand — Teal", `surface` → "Surface" |
| `alignment` | Alignment | select | `left` → "Left (Default)", `center` → "Centered" |
| `size` | Quote scale | select | `large` → "Large (Default)", `small` → "Small" |

---

### `OT_RichTextDefault` — default template for `OT_RichTextBlock`

| Setting key | Display name | Editor | Choices (key → label) |
|---|---|---|---|
| `color` | Background color | select | `canvas` → "Canvas — Dark (Default)", `brand` → "Brand — Teal", `surface` → "Surface" |
| `alignment` | Alignment | select | `left` → "Left (Default)", `center` → "Centered" |
| `size` | Type scale | select | `editorial` → "Editorial (Default)", `compact` → "Compact" |
| `treatment` | First paragraph | select | `standard` → "Standard (Default)", `lead` → "Lead — Deck size", `dropcap` → "Drop Cap" |
| `ruledHeadings` | Ruled headings | select | `false` → "Off (Default)", `true` → "On — teal rule above h2/h3" |

---

### `OT_ImageDefault` — default template for `OT_ImageBlock`

| Setting key | Display name | Editor | Choices (key → label) |
|---|---|---|---|
| `ratio` | Aspect ratio | select | `auto` → "Natural (Default)", `16:9` → "16:9 Widescreen", `4:3` → "4:3", `3:2` → "3:2", `1:1` → "Square" |
| `overlay` | Brand overlay | select | `false` → "Off (Default)", `true` → "Teal wash" |
| `frame` | Frame treatment | select | `none` → "None (Default)", `offset` → "Offset — bold editorial", `glow` → "Glow — atmospheric" |
| `animate` | Scroll reveal | select | `false` → "Off (Default)", `true` → "Wipe reveal" |
| `captionPosition` | Caption position | select | `below` → "Below (Default)", `inset` → "Inset over image" |
| `shadow` | Chromatic shadow | select | `false` → "Off (Default)", `true` → "Teal + green bloom" |

---

### `OT_VideoDefault` — default template for `OT_VideoBlock`

| Setting key | Display name | Editor | Choices (key → label) |
|---|---|---|---|
| `ratio` | Aspect ratio | select | `16:9` → "16:9 (Default)", `4:3` → "4:3", `3:2` → "3:2", `1:1` → "Square" |
| `overlay` | Brand overlay | select | `false` → "Off (Default)", `true` → "Teal wash on poster" |
| `frame` | Frame treatment | select | `none` → "None (Default)", `offset` → "Offset — bold editorial", `glow` → "Glow — atmospheric" |
| `captionPosition` | Caption position | select | `below` → "Below (Default)", `inset` → "Inset over thumbnail" |
| `shadow` | Chromatic shadow | select | `false` → "Off (Default)", `true` → "Teal + green bloom" |

---

## Files to add / change

### New

**`optimizely.config.mjs`** (project root)
Exports `buildConfig({ components: [...glob 'cms/content-types/*.ts', ...glob 'cms/display-templates/*.ts'] })`. Default path the CLI reads on `config push`.

**`.env.local` — add one line**
```
OPTIMIZELY_PREVIEW_SECRET=<random hex string>
```

**`lib/optimizely.ts`**
Exports a `getClient()` helper wrapping `GraphClient` from `@optimizely/cms-sdk`. The `GraphClient` constructor reads `OPTIMIZELY_GRAPH_SINGLE_KEY` from env automatically. Validate during implementation whether an explicit `config({})` call is also needed.

**`cms/content-types/`** — one file per type:
`OT_HeroBlock.ts`, `OT_CardBlock.ts`, `OT_PrimaryTextBlock.ts`, `OT_QuoteBlock.ts`, `OT_RichTextBlock.ts`, `OT_ImageBlock.ts`, `OT_VideoBlock.ts`, `OT_LandingExperience.ts`, `OT_SiteSettings.ts`, `OT_NavItem.ts`, `OT_FooterLink.ts`, `OT_FooterColumn.ts`

**`cms/display-templates/`** — one file per template:
`OT_LandingRow.ts`, `OT_LandingColumn.ts`, `OT_HeroDefault.ts`, `OT_CardDefault.ts`, `OT_PrimaryTextDefault.ts`, `OT_QuoteDefault.ts`, `OT_RichTextDefault.ts`, `OT_ImageDefault.ts`, `OT_VideoDefault.ts`

**`cms/styling/`** — one file per draggable block:

Each file exports a single `get<Block>Styles(displaySettings: DisplaySettingsFragment[])` function (mirroring `getButtonStyles` in the reference). It calls `getDictionaryFromDisplaySettings` (or the SDK v2 equivalent) to get a `Record<string, string>`, then maps each setting key to the typed prop value the corresponding `components/blocks/` component expects.

Example shape for `OT_HeroBlock`:
```ts
export function getHeroStyles(displaySettings) {
  const s = toDictionary(displaySettings)
  return {
    layout:    (s.layout    ?? 'imageRight') as HeroStyleOptions['layout'],
    color:     (s.color     ?? 'brand')      as HeroStyleOptions['color'],
    animation: (s.animation ?? 'none')       as HeroStyleOptions['animation'],
  }
}
```

Boolean-valued settings (`noise`, `overlay`, `shadow`, `animate`, `ruledHeadings`) are stored as the string `"true"` / `"false"` in CMS; the helper converts them: `s.noise === 'true'`.

Files: `OT_HeroBlock.styling.ts`, `OT_CardBlock.styling.ts`, `OT_PrimaryTextBlock.styling.ts`, `OT_QuoteBlock.styling.ts`, `OT_RichTextBlock.styling.ts`, `OT_ImageBlock.styling.ts`, `OT_VideoBlock.styling.ts`

**`cms/registry.ts`**
Calls `initReactComponentRegistry({ resolver: { OT_HeroBlock, OT_CardBlock, OT_PrimaryTextBlock, OT_QuoteBlock, OT_RichTextBlock, OT_ImageBlock, OT_VideoBlock } })`. Keys must match the content type `key` values. Imported as a side-effect from `app/layout.tsx`.

**`cms/components/OT_HeroBlock.tsx`** (and one per draggable block)
Server Component adapter. Signature: `({ content, displaySettings })`. Responsibilities:
1. Call the block's `*Styling.ts` helper to get typed `styleOptions`.
2. Call `const { pa } = getPreviewUtils(content)` for inline-editing attributes.
3. Map `content.*` fields to the existing `components/blocks/HeroBlock` prop names.
4. Spread `{...pa('headline')}` etc. on the wrapper elements for each editable field.
5. Render the existing presentational component from `components/blocks/`.

`OT_ImageBlock.tsx` and `OT_VideoBlock.tsx` require special handling — the underlying blocks are `'use client'` components. The adapter wraps them in a Server Component shell and applies `pa()` attributes to an outer `<div>` keyed to each content field (URL, alt, caption), since the client component's internals aren't accessible from the server.

**`app/api/draft/route.ts`**
`GET` handler. Reads Optimizely's `PreviewParams` shape (`preview_token`, `key`, `ctx`, `ver`, `loc`). Validates `preview_token` against `OPTIMIZELY_PREVIEW_SECRET`. Calls `(await draftMode()).enable()`. Redirects to the path in `ctx`.

**`app/api/draft/disable/route.ts`**
Calls `(await draftMode()).disable()` and returns 200.

---

### Refactored

**`app/page.tsx`** — stays a Server Component; replace hardcoded blocks with CMS fetch:
```
const dm  = await draftMode()
const exp = dm.isEnabled
  ? await getClient().getPreviewContent(previewParams, { cache: false })
  : await getClient().getContentByPath('/', { cache: 'force-cache' })

return (
  <>
    <OptimizelyComposition nodes={exp.composition.nodes} />
    {dm.isEnabled && <PreviewComponent />}
  </>
)
```

**`app/layout.tsx`** — three changes:
1. Side-effect imports: `import '@/lib/optimizely'` and `import '@/cms/registry'`
2. `const settings = await getClient().getContentByPath('/site-settings')`
3. Pass as props: `<Header settings={settings} />` and `<Footer settings={settings} />`

**`components/layout/Header.tsx`** — stays `'use client'` (mobile menu state). Add a `settings` prop typed to the `OT_SiteSettings` content shape; replace the `NAV_LINKS` constant and hardcoded CTA with CMS values. Receives server-fetched data as serializable props — no client-side fetching needed.

**`components/layout/Footer.tsx`** — add `settings` prop. Replace `FOOTER_LINKS` and hardcoded copyright with `settings.footerColumns`, `settings.legalLinks`, and `settings.copyright`.

---

### Reused SDK symbols (do not re-implement)

- `contentType`, `displayTemplate`, `buildConfig` — `@optimizely/cms-sdk`
- `GraphClient`, `.getContentByPath()`, `.getPreviewContent()` — `@optimizely/cms-sdk`
- `OptimizelyComposition`, `getPreviewUtils` — `@optimizely/cms-sdk/react/server`
- `PreviewComponent` — `@optimizely/cms-sdk/react/client`
- `initReactComponentRegistry` — `@optimizely/cms-sdk`
- `draftMode` — `next/headers`
- `BlankSectionContentType` — `@optimizely/cms-sdk`

---

## Visual Builder wiring

1. Each CMS adapter spreads `{...pa('fieldName')}` on the wrapper element for each editable text field, emitting `data-epi-property-name` so Visual Builder attaches inline-edit overlays.
2. Style changes are made through the right-hand **Display Settings** panel in Visual Builder, not by editing text fields. Marketers pick from the labeled dropdown choices defined in each display template.
3. When a marketer changes a style setting (e.g., switches `color` from "Brand — Teal" to "Canvas — Dark"), Visual Builder calls the Next.js preview endpoint with the updated `displaySettings`. The `*Styling.ts` helper re-maps the new choice key → CVA variant → new CSS classes on re-render.
4. **Preview URL** (register in CMS admin → Settings → Applications):
   `https://<host>/api/draft?preview_token={token}&key={key}&ctx={ctx}&ver={ver}&loc={loc}`
   Use `ngrok` or `cloudflared` to expose localhost for local development.
5. `<PreviewComponent />` (mounted only when `draftMode().isEnabled`) listens to postMessage save events and triggers a Server Component re-fetch with `cache: false`.

---

## Provisioning checklist

CMS is already provisioned. Steps remaining:

1. Add `OPTIMIZELY_PREVIEW_SECRET=<random hex>` to `.env.local`.
2. `npx optimizely-cms-cli login` — confirm credentials.
3. Author content types and display templates, then `npx optimizely-cms-cli config push`. Verify all `OT_*` types appear in CMS admin → Content Types.
4. Register the preview URL in CMS admin → Settings → Applications.

---

## Verification (end-to-end smoke test)

1. `yarn dev` — page renders current hardcoded blocks; no CMS errors.
2. After refactoring `app/page.tsx`: page 500s until an Experience at `/` exists — expected.
3. In CMS, create `OT_SiteSettings` at `/site-settings`, populate nav items and footer columns, publish.
4. Create `OT_LandingExperience` at `/`. Drag in an `OT_HeroBlock`, `OT_PrimaryTextBlock`, and `OT_CardBlock`. Fill content fields. Publish.
5. Reload `http://localhost:3000/` — page renders with CMS-driven content, same visual appearance as the hardcoded version.
6. Open the Experience in Visual Builder → `/api/draft?...` fires → redirects to `/` with draft cookie → `data-epi-property-name` attributes visible in DevTools.
7. Select a Hero block → right-hand Display Settings panel shows the `color`, `layout`, `animation` dropdowns.
8. Switch Hero `color` to "Canvas — Dark" → save → page re-renders with the canvas background without a full reload.
9. Inline-edit the Hero headline → save → headline updates live.
10. Check Header: nav labels and CTA come from `OT_SiteSettings`, not hardcoded constants.

---

## Known risks / unknowns

- **`OT_CardBlock` has existing CMS instances.** This type was not deleted during cleanup (other OT_ types were). Before pushing content types, delete the remaining card content instances in CMS, then delete the stale `OT_CardBlock` type definition. The new type (content-only, no style props) will push cleanly.

- **`getDictionaryFromDisplaySettings` equivalent.** The reference Astro project imports this helper from a project-local `graphql/shared/displaySettingsHelpers.ts`. The `@optimizely/cms-sdk ^2.0.0` may expose a built-in equivalent or the `displaySettings` array may need to be reduced manually. Check the SDK types before writing the Styling helpers.

- **`ImageBlock` and `VideoBlock` are `'use client'`.** The `pa()` inline-editing approach only works on server-rendered elements. For these blocks, `pa()` attributes can only be applied to a surrounding Server Component shell. Visual Builder inline editing will be limited to panel-level field editing (clicking the field in the right panel) rather than clicking directly on the image — acceptable for URL/alt fields.

- **`OT_SiteSettings` singleton convention.** CMS won't prevent a second instance. Add a README note.

- **Local preview requires a public URL.** Visual Builder's iframe can't reach `localhost:3000`. Use `ngrok` or `cloudflared tunnel` for local testing.

- **Tailwind v4 scanning.** After adding `cms/components/**/*.tsx` and `cms/styling/**/*.ts`, confirm Tailwind picks them up. If not, add an explicit `@source "../cms"` directive in `globals.css`.

- **`previewParams` shape.** Validate the exact query-string-to-`getPreviewContent()` mapping against the installed SDK version before implementing `/api/draft`. Read `node_modules/@optimizely/cms-sdk/dist/` types.
