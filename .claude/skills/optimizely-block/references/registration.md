# Registration — the three `cms/registry.ts` edits

`cms/registry.ts` makes three init calls. A new block needs **one entry in each**
(four imports: the content type, the display template, the adapter; a sub-item
content type adds a fifth import into `initContentTypeRegistry` only). Miss any
one and the block fails — usually silently.

Order the file uses: imports, then `initDisplayTemplateRegistry([...])`, then
`initContentTypeRegistry([...])`, then `initReactComponentRegistry({ resolver })`.

## 1. Display template

```ts
import { OT_PricingDefault } from '@/cms/display-templates/OT_PricingDefault'
// …
initDisplayTemplateRegistry([
  // …existing,
  OT_PricingDefault,
])
```
**Failure mode if omitted:** the SDK can't resolve the template tag; the block
renders with default/empty display settings (variant choices do nothing).

## 2. Content type

```ts
import { OT_PriceTier }    from '@/cms/content-types/OT_PriceTier'    // sub-item, if any
import { OT_PricingBlock } from '@/cms/content-types/OT_PricingBlock'
// …
initContentTypeRegistry([
  // …existing,
  OT_PriceTier,      // register sub-items too, or their fields never resolve
  OT_PricingBlock,
])
```
**Failure mode if omitted:** the SDK auto-generates an **empty** GraphQL fragment
for the type, so the block receives no field data (everything renders blank).
Sub-items that aren't registered return null fields inside the array.

## 3. React component (the resolver)

```ts
import OT_PricingBlockAdapter from '@/cms/components/OT_PricingBlock'
// …
initReactComponentRegistry({
  resolver: {
    // …existing,
    OT_PricingBlock: OT_PricingBlockAdapter,   // key = content-type key
    // for a section: OT_PricingSection: OT_PricingSectionAdapter,
  },
})
```
**Failure mode if omitted:** the composition renderer finds no component for the
type key and renders **nothing** — the most common "my block doesn't show up" bug.

The resolver also holds the fixed composition keys — do not touch them:
`BlankSection`, `_Row`, `_Column`.

> All three registries must stay in sync with each other **and** with
> `optimizely.config.mjs`. Registering a type immediately adds it to every
> auto-generated GraphQL fragment, so it must be **pushed** before `yarn build`
> (see push-checklist.md).

## Catch-all page route

CMS pages render through the catch-all at **`app/(site)/[...slug]/page.tsx`**
(wrapped in `withAppContext`, using `getContentByPath` / `getPreviewContent`).
A registered `_component` block needs **no** route work — it renders wherever the
Visual Builder composition places it. Only a new `_page` type needs a branch in
that route (detected via `exp?.__typename === 'OT_YourPage'`).

## Do NOT register or push OptiForms

`OptiFormsChoiceElement`, `OptiFormsContainerData`, etc. are **Optimizely Forms**
(a separate hosted product), present in `initContentTypeRegistry` ONLY so the SDK
can build composition fragments. They are **not** authored with this four-layer
pattern:

- Don't create display templates, adapters, styling, or showcase entries for them.
- Don't push them — `optimizely.config.mjs` excludes both globs
  (`!cms/content-types/OptiForms*.ts`, `!cms/display-templates/OptiForms*.ts`).
  Pushing a Forms display template fails with
  `Unable to find a content type 'OptiFormsContainerData'` because the backing
  type is intentionally never pushed.
- Form preview/render issues are Forms-service config, not app code.
