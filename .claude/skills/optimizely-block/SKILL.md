---
name: optimizely-block
description: >-
  Use for ANY work on an Optimizely CMS block or section in THIS repository:
  creating, extending, restyling, or wiring one up. Triggers on requests like
  "add a Testimonial block", "create an OT_PricingBlock", "new hero variant",
  "add a section", "add a field to the Card block", "make a stat row", "wire a
  showcase demo" even when the user never says "skill". It encodes this repo's
  exact four-layer + showcase + push workflow and the SEVEN artifacts a block
  needs to be complete. This SUPERSEDES the generic optimizely-model and
  optimizely-model-react skills for any work inside this repo; whenever a task
  touches cms/ or components/blocks/, prefer THIS skill.
---

# Optimizely Block Authoring (this repo)

Authoring CMS blocks and sections for this Next.js + Optimizely SaaS CMS repo.
It captures the **actual conventions in the codebase**, not generic SDK docs.

> Supersedes `optimizely-model` / `optimizely-model-react` here. Those describe
> the bare SDK; this repo has a fixed four-layer + showcase + push workflow with
> seven required artifacts. Follow this skill for work under `cms/` or
> `components/blocks/`.

## Definition of done — SEVEN artifacts, together

A block is **not** complete until all seven exist and reference each other with
the **same** content-type key and slug. A half-wired block renders as nothing
(silent failure) or breaks the production build.

| # | Artifact | Path |
|---|---|---|
| 1 | Content type | `cms/content-types/OT_<Name>Block.ts` |
| 2 | Display template | `cms/display-templates/OT_<Name>Default.ts` |
| 3 | CMS adapter (server) | `cms/components/OT_<Name>Block.tsx` |
| 4 | UI component (pure React) | `components/blocks/<Name>Block.tsx` |
| 5 | Registry — **three** entries | `cms/registry.ts` (content type + display template + resolver) |
| 6 | Showcase demo | `app/(site)/showcase/blocks/[block]/page.tsx` (slug + meta + component + switch) |
| 7 | Showcase nav item | `app/(site)/showcase/config.ts` (`items` array) |

**Optional, when the block needs them:**
- **Styling helper** — `cms/styling/OT_<Name>Block.styling.ts`: maps the flat
  `displaySettings` record to a typed `StyleOptions` object with defaults. Use
  it once there is more than a field or two of visual config (see `OT_StatBlock`).
- **Sub-item content type** — `cms/content-types/OT_<Name>Item.ts` for an array
  property of structured items (see `OT_StatItem` inside `OT_StatBlock`). It is
  registered in `initContentTypeRegistry` only (no template/adapter/showcase).
- **Section variant** — `cms/compositions/<Name>Section.tsx` + a section display
  template keyed on `baseType: '_section'` (see `cms/compositions/Section.tsx`
  and `OT_LandingSection`). Sections render `OptimizelyGridSection`, not props.

The model sibling to copy is **`OT_StatBlock`** — read all of its files before
starting (it has the array sub-item + styling-helper pattern in full).

## Naming conventions

- Block content type: `OT_` + PascalCase + `Block` → `OT_PricingBlock`.
- Section content type: `OT_` + PascalCase + `Section` → `OT_ImageBgSection`.
- Display template key: content-type key + `Default` → `OT_PricingDefault`.
- Adapter file = the **content-type key** (no suffix): `cms/components/OT_PricingBlock.tsx`.
- UI component: `components/blocks/PricingBlock.tsx` (no `OT_`).
- Showcase slug: kebab-case (`pricing`), identical in all three showcase spots.

> The `OT_` / `--ot-` prefix is **historical and theme-neutral** (this started as
> one teal brand; the token system is the product now). Never read brand meaning
> into it and **never mass-rename it** — renaming a content-type key is a
> breaking CMS migration.

## Ordered workflow

1. **Read a sibling first.** Open every file of `OT_StatBlock` (all seven spots
   plus its styling helper and `OT_StatItem`). Mirror its shapes exactly.
2. **Content type** (`cms/content-types/`) — `contentType({ key, displayName,
   baseType: '_component', compositionBehaviors, properties })`. Add
   `'sectionEnabled'` and/or `'elementEnabled'`. See
   [references/sdk-property-rules.md](references/sdk-property-rules.md).
3. **Display template** (`cms/display-templates/`) — block templates key on
   `contentType`; section templates key on `baseType: '_section'`. Visual-design
   knobs only (color, density, animation). Block *configuration* (effect, view,
   left/right) now lives as a `selectOne` field on the **content type**, not here
   — see [references/four-layer-pattern.md](references/four-layer-pattern.md).
4. **CMS adapter** (`cms/components/`) — server component. `getPreviewUtils`,
   styling helper, typed `ContentProps`, `pa()` wiring. Never reach the UI
   component directly from a composition; it goes through this adapter.
5. **UI component** (`components/blocks/`) — pure React, `cva` variants, typed
   props, `pa` threaded as a prop. **No `@optimizely/cms-sdk` import.**
6. **Register x3** in `cms/registry.ts`, in order — see
   [references/registration.md](references/registration.md).
7. **Showcase x2** — page demo + nav item — see
   [references/showcase-sync.md](references/showcase-sync.md).
8. **Preflight, then push** — see [references/push-checklist.md](references/push-checklist.md).
   **Push BEFORE you build**, or `yarn build` fails with `HTTP 400: Unknown type`.

## `pa()` click-to-edit rules

`const { pa, src } = getPreviewUtils(content)` returns no-ops in production and
the CMS overlay attributes in preview. Spread it correctly or click-to-edit
breaks:

| Element | Spread |
|---|---|
| Block container (the outer wrapper in the adapter) | `{...pa(content.__composition)}` |
| Section / page container | `{...pa(content)}` |
| Individual editable field | `{...pa('fieldName')}` on the element rendering it |
| Array container | `{...pa('arrayFieldName')}` on the wrapper, **never** on items |

- Array items use `key={item._metadata?.key ?? i}`, not the array index alone.
- Field-level click-to-edit only works if the adapter renders that element
  itself (`<h2 {...pa('heading')}>`); fields delegated wholesale to the UI
  component get the block overlay but not a per-field highlight.
- `pa()` attributes are metadata only — never gate render logic on them.

## After creating a block

1. Confirm all **seven** artifacts exist and share the same key + slug. Grep the
   content-type key across `cms/` and the slug across the two showcase files.
2. Walk [references/push-checklist.md](references/push-checklist.md) (group
   declared, OptiForms excluded, no localized `link` CTA, registered x3).
3. Offer to run **`yarn cms:push`** (the instance is decided by the creds in
   `.env`, not by any flag), then **`yarn build`** to confirm the Graph schema
   accepts the new type.

## Reference files

- [four-layer-pattern.md](references/four-layer-pattern.md) — working templates
  for all four layers + section adapter + rich-text/image/link/array rendering.
- [sdk-property-rules.md](references/sdk-property-rules.md) — the property rules
  learned the hard way, property groups, and the atomic-rollback rule.
- [registration.md](references/registration.md) — the three `registry.ts` edits,
  each failure mode, the catch-all route, the OptiForms warning.
- [showcase-sync.md](references/showcase-sync.md) — the exact four edits to the
  showcase page + one nav edit, against the real shapes.
- [push-checklist.md](references/push-checklist.md) — preflight, push-before-build,
  instance-by-creds, atomic-rollback symptom decoder.
