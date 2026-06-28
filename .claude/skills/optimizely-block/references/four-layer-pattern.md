# Four-layer pattern — working templates

Every block flows: **Content Type → Display Template → CMS Adapter → UI
Component**. Templates below mirror `OT_StatBlock` (the model sibling). Replace
`Pricing` / `pricing` with your block name.

---

## 1. Content type — `cms/content-types/OT_PricingBlock.ts`

```ts
import { contentType } from '@optimizely/cms-sdk'

export const OT_PricingBlock = contentType({
  key:                  'OT_PricingBlock',
  displayName:          'Pricing Block',
  description:          'Short description editors see in the CMS.',
  baseType:             '_component',
  compositionBehaviors: ['elementEnabled', 'sectionEnabled'], // where it can be placed
  properties: {
    eyebrow: { type: 'string',   isLocalized: true, maxLength: 60,  displayName: 'Eyebrow', group: 'OT_Content', sortOrder: 5,  indexingType: 'searchable' },
    heading: { type: 'string',   isLocalized: true, maxLength: 120, displayName: 'Heading', group: 'OT_Content', sortOrder: 8,  indexingType: 'searchable' },
    body:    { type: 'richText',  isLocalized: true,                displayName: 'Body',    group: 'OT_Content', sortOrder: 10 },
    image:   { type: 'contentReference', allowedTypes: ['_image'],  displayName: 'Image',   group: 'OT_Content', sortOrder: 20 },
    // CTA: url + string label — NOT a `link` type (see sdk-property-rules.md)
    ctaLabel: { type: 'string', isLocalized: true, maxLength: 40,   displayName: 'CTA Label', group: 'OT_Content', sortOrder: 30 },
    ctaUrl:   { type: 'url',                                        displayName: 'CTA URL',   group: 'OT_Content', sortOrder: 40 },
  },
})
```

### Array of structured sub-items (the `OT_StatItem` pattern)

A content type with an `array` of `{ type: 'component', contentType: ... }` is
how repeatable structured items work. The sub-item is its own content type,
registered in `initContentTypeRegistry` only (no template/adapter/showcase).

```ts
// cms/content-types/OT_PriceTier.ts  (the sub-item)
export const OT_PriceTier = contentType({
  key: 'OT_PriceTier', displayName: 'Price Tier', baseType: '_component',
  properties: {
    name:  { type: 'string', maxLength: 40,  displayName: 'Name',  group: 'OT_Content', sortOrder: 10 },
    price: { type: 'string', maxLength: 20,  displayName: 'Price', group: 'OT_Content', sortOrder: 20 },
  },
})

// inside OT_PricingBlock.properties:
tiers: {
  type: 'array', displayName: 'Tiers', group: 'OT_Content', sortOrder: 50,
  items: { type: 'component', contentType: OT_PriceTier },
},
```

> **Config-as-content:** a high-impact "which kind/which way/which view" choice
> (effect, layout, media side, view) is authored as a `selectOne` field on the
> content type, not a display-template setting. Design knobs (color, size,
> density, animation) stay in the display template.
>
> ```ts
> direction: {
>   type: 'string', format: 'selectOne', displayName: 'Layout',
>   enum: [
>     { value: 'split',   displayName: 'Split (Default)' },
>     { value: 'stacked', displayName: 'Stacked' },
>   ],
>   group: 'OT_Content', sortOrder: 5,
> },
> ```
> The adapter merges it into the styling input:
> `getPricingStyles(content.direction ? { ...displaySettings, direction: content.direction } : displaySettings)`.

---

## 2a. Display template — block (keys on `contentType`)

`cms/display-templates/OT_PricingDefault.ts`

```ts
import { displayTemplate } from '@optimizely/cms-sdk'

export const OT_PricingDefault = displayTemplate({
  key:         'OT_PricingDefault',
  displayName: 'Pricing Block',
  contentType: 'OT_PricingBlock',   // ← block templates bind to a content type
  isDefault:   true,
  settings: {
    color: {
      displayName: 'Background', editor: 'select', sortOrder: 10,
      choices: {
        canvas:  { displayName: 'Canvas (Default)', sortOrder: 10 },
        surface: { displayName: 'Surface',          sortOrder: 20 },
        brand:   { displayName: 'Brand',            sortOrder: 30 },
      },
    },
    entranceAnimation: {
      displayName: 'Entrance animation', editor: 'select', sortOrder: 90,
      choices: {
        none:  { displayName: 'None (Default)', sortOrder: 10 },
        fade:  { displayName: 'Fade in',        sortOrder: 20 },
        slide: { displayName: 'Slide up',       sortOrder: 30 },
      },
    },
  },
})
```

Notes from the live templates:
- Boolean toggles are modeled as `select` with string keys `'true'` / `'false'`
  (CMS choice keys must be ≥2 chars). The styling helper coerces them.
- Numeric choices use prefixed keys (`col2`/`col3`/`col4`), mapped in the helper.
- Shared icon dropdowns import `ICON_CHOICES_WITH_NONE` from
  `cms/display-templates/_shared/iconChoices`.

## 2b. Display template — section (keys on `baseType: '_section'`)

```ts
export const OT_PricingSection = displayTemplate({
  key:        'OT_PricingSection',
  displayName:'Pricing Section',
  baseType:   '_section',   // ← sections key on baseType, NOT contentType
  isDefault:  true,
  settings: { /* gridWidth, verticalSpacing, backgroundColor, … */ },
})
```

---

## 3a. CMS adapter — block (server component)

`cms/components/OT_PricingBlock.tsx` — bridges CMS data → UI props.

```tsx
import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { RichText } from '@optimizely/cms-sdk/react/richText'
import { OT_PricingBlock as OT_PricingBlockContentType } from '@/cms/content-types/OT_PricingBlock'
import { getPricingStyles } from '@/cms/styling/OT_PricingBlock.styling'
import PricingBlock from '@/components/blocks/PricingBlock'

type Props = {
  content:          ContentProps<typeof OT_PricingBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

export default function OT_PricingBlockAdapter({ content, displaySettings = {} }: Props) {
  const { pa, src }       = getPreviewUtils(content)
  const styleOptions      = getPricingStyles(displaySettings)
  const entranceAnimation = String(displaySettings?.entranceAnimation ?? 'none')

  return (
    <div
      {...pa(content.__composition)}                          // ← block container
      className="w-full"
      data-stagger={entranceAnimation !== 'none' ? entranceAnimation : undefined}
    >
      <PricingBlock
        eyebrow={content.eyebrow ?? undefined}
        heading={content.heading ?? undefined}
        body={content.body?.json ?? undefined}                // richText → .json
        imageSrc={src(content.image)}                         // contentReference → url
        cta={content.ctaLabel ? { label: content.ctaLabel, href: content.ctaUrl?.default ?? '#' } : undefined}
        styleOptions={styleOptions}
        pa={pa}
      />
    </div>
  )
}
```

> Import-alias the content type as `...ContentType` because the export name
> collides with the adapter's default export.

## 3b. CMS adapter — section

`cms/compositions/PricingSection.tsx` — sections render the grid tree, not props.

```tsx
import { getPreviewUtils, OptimizelyGridSection } from '@optimizely/cms-sdk/react/server'

type Props = { content: any; displaySettings?: Record<string, string | boolean> }

export default function PricingSection({ content, displaySettings = {} }: Props) {
  const { pa } = getPreviewUtils(content)
  return (
    <section className="vb:section flex flex-col w-full" {...pa(content)}>   {/* pa(content) */}
      <div className="flex flex-col flex-1 container mx-auto px-lg py-xl">
        <OptimizelyGridSection nodes={content.nodes ?? []} />
      </div>
    </section>
  )
}
```

---

## 4. UI component — `components/blocks/PricingBlock.tsx`

Pure React. `cva` for variants. **No `@optimizely/cms-sdk` import.** `pa` is
threaded as a no-op-able prop.

```tsx
import { cva } from 'class-variance-authority'
import { RichText } from '@optimizely/cms-sdk/react/richText' // type-only use is fine; see note

const sectionCva = cva('px-md lg:px-lg py-lg lg:py-xl', {
  variants: { color: { canvas: 'bg-canvas', surface: 'bg-surface', brand: 'bg-brand-fill' } },
  defaultVariants: { color: 'canvas' },
})

export type PricingStyleOptions = { color?: 'canvas' | 'surface' | 'brand' }

export type PricingBlockProps = {
  eyebrow?: string
  heading?: string
  body?:    Parameters<typeof RichText>[0]['content'] | null  // richText json
  imageSrc?: string
  cta?:     { label: string; href: string }
  styleOptions?: PricingStyleOptions
  pa?: (prop: string) => Record<string, unknown>
}

export default function PricingBlock({
  eyebrow, heading, body, imageSrc, cta, styleOptions = {}, pa = () => ({}),
}: PricingBlockProps) {
  const { color = 'canvas' } = styleOptions
  return (
    <section className={sectionCva({ color })} data-theme={color === 'brand' ? 'dark' : undefined}>
      {eyebrow && <p className="text-label uppercase tracking-label font-semibold text-fg-muted" {...pa('eyebrow')}>{eyebrow}</p>}
      {heading && <h2 className="text-headline font-bold tracking-headline text-fg text-balance" {...pa('heading')}>{heading}</h2>}
      {body && (
        <div data-rich-text="" className="text-body leading-body text-fg-muted" {...pa('body')}>
          <RichText content={body} />
        </div>
      )}
      {cta && <a href={cta.href} className="btn-signal …">{cta.label}</a>}
    </section>
  )
}
```

> The repo's UI components do import `RichText` from
> `@optimizely/cms-sdk/react/richText` to render rich-text JSON (it is a pure
> renderer). The hard rule is **no `@optimizely/cms-sdk` server/SDK imports**
> (`config`, `getPreviewUtils`, `ContentProps`, registries) in `components/`.

---

## Field-type rendering cheatsheet

| Field type | In adapter | In UI |
|---|---|---|
| `richText` | `content.body?.json ?? undefined` | `<RichText content={body} />` inside a `data-rich-text` wrapper; **never** `.html` + `dangerouslySetInnerHTML` |
| `contentReference` (image) | `const url = src(content.image)`; for srcset `const { getSrcset, getAlt } = damAssets(content)` | `next/image` with `src`, `srcSet={getSrcset(content.image)}`, `alt={getAlt(content.image, '')}` |
| `url` | `content.ctaUrl?.default` | plain `<a href>` |
| `link` (nav only) | `{ url, text, title, target }` — add `rel="noopener noreferrer"` when `target === '_blank'` | render each field explicitly |
| `array` of components | map `content.items ?? []`, `pa('items')` on the container | `key={item._metadata?.key ?? i}` |

`damAssets` is imported from `@optimizely/cms-sdk`; `src`/`getSrcset`/`getAlt`
come from `getPreviewUtils` / `damAssets` in the **adapter** only.
