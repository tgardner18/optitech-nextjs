# Showcase sync — four edits + one nav edit

Every block ships a static showcase demo. There is **no auto-discovery**: the
route exists only if the slug is in `BLOCK_SLUGS`, and it is reachable only if
the nav item is in `config.ts`. The **slug string must be byte-identical** in all
three places (`BLOCK_SLUGS`, the `switch`, and `config.ts`).

File A: `app/(site)/showcase/blocks/[block]/page.tsx` (four edits)
File B: `app/(site)/showcase/config.ts` (one edit)

Use realistic, vertical-neutral copy. **No lorem ipsum, no fake metrics, no dead
links.** Match the voice of the neighboring demos.

---

## Edit 1 — add the slug to `BLOCK_SLUGS`

```ts
const BLOCK_SLUGS = [
  'hero', 'card', 'primary-text', 'quote', 'rich-text',
  'image', 'video', 'stat', 'feature-grid', 'trust-rail',
  'accordion', 'tabs', 'blog-feed', 'button', 'chart', 'banner', 'resource-library',
  'callout', 'divider', 'event-listing', 'practitioner-listing', 'location-listing',
  'pricing',   // ← add
] as const
```
This array drives `generateStaticParams`; the slug's type is `BlockSlug`.

## Edit 2 — add a `BLOCK_META` entry

```ts
const BLOCK_META: Record<BlockSlug, { label: string; cmsKey: string; description: string }> = {
  // …existing,
  'pricing': { label: 'PricingBlock', cmsKey: 'OT_PricingBlock', description: 'One-paragraph description of what the block does and its key display settings.' },
}
```
`label` = UI component name, `cmsKey` = content-type key. Used by
`generateMetadata` and the `<BlockHeader slug=… />` helper.

## Edit 3 — write the showcase component

Server component (the page is **not** `'use client'` — it imports server
adapters). Use the in-file helpers `BlockHeader`, `VariantGroup`, `VariantLabel`.
Render through the **adapter** with `content` + `displaySettings`, exactly like
the neighbors:

```tsx
function PricingShowcase() {
  return (
    <>
      <BlockHeader slug="pricing" />
      <VariantGroup label="Color schemes" />
      {[
        { label: 'Canvas',  content: { heading: 'Plans that scale with you', /* … */ }, displaySettings: { color: 'canvas' } },
        { label: 'Brand',   content: { heading: 'Plans that scale with you', /* … */ }, displaySettings: { color: 'brand' } },
      ].map(item => (
        <div key={item.label} className="border-t border-fg/5">
          <VariantLabel label={item.label} />
          <OT_PricingBlock content={item.content as any} displaySettings={item.displaySettings} />
        </div>
      ))}
      <div className="pb-xl" />
    </>
  )
}
```
Import the adapter at the top of the file:
`import OT_PricingBlock from '@/cms/components/OT_PricingBlock'`.

> Config-as-content fields (e.g. `direction`, `mediaSide`, `headerEffect`) are
> passed inside `content`, not `displaySettings`. Design knobs (color, density)
> go in `displaySettings`. (The adapter reads each from the right place.)

## Edit 4 — add the `switch` case

```tsx
switch (block as BlockSlug) {
  // …existing,
  case 'pricing': return <PricingShowcase />
  default:        return notFound()
}
```

## Edit 5 (File B) — the nav item

`app/(site)/showcase/config.ts`, inside the `'blocks'` category `items` array:

```ts
{ label: 'Pricing', slug: 'pricing' },
```
Without this the route renders but is unreachable from the nav (the listing
redirects to `hero`).

---

## Self-check

- Slug identical in `BLOCK_SLUGS`, the `switch`, and `config.ts`.
- `cmsKey` in `BLOCK_META` equals the content-type key and the resolver key.
- Showcase imports the **adapter** (`cms/components/…`), never the UI component
  directly (the page is a server component; adapters are server-only).
- Demo copy is real and on-voice; cover the meaningful `styleOptions`
  combinations and the no-image / empty states where relevant.
