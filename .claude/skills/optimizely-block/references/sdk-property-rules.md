# SDK property rules (learned the hard way)

These are non-obvious constraints the `@optimizely/cms-sdk` TypeScript types (and
the CMS CLI) enforce in THIS repo. Getting one wrong is either a TS build error
or a `config push` failure.

| Rule | Correct | Wrong |
|---|---|---|
| Enum items use `value` | `{ value: 'line', displayName: 'Line' }` | `{ key: 'line', … }` |
| `maxLength` is top-level | `maxLength: 80` at the property root | `validation: { maxLength: 80 }` (no such wrapper) |
| Localization flag | `isLocalized: true` | `localized: true` |
| `required` | Not supported — omit it | `required: true` (TS error) |
| Rich text type | `type: 'richText'` (returns `{ html, json }`) | `type: 'xhtml'` |
| Dropdown on a content field | `type: 'string', format: 'selectOne', enum: [{ value, displayName }]` | a bare string and hoping for a picker |
| Single-select choice editor | display-template `editor: 'select'` with `choices` **or** content-field `format: 'selectOne'` | — |
| `link` type | returns `{ url, text, title, target }` — render each field | treating it as a plain URL string |
| `url` vs `link` | `type: 'url'` is a plain URL object (`.default`); `link` carries metadata | using `.url` on a `url`-typed prop |
| **CTAs** | `type: 'url'` + a separate `type: 'string'` label | `ctaLink: { type: 'link', isLocalized: true }` — **500s on `config push`** |
| `mayContainTypes` | only on `_page` / `_experience` / `_folder` | on a `_component` |
| Self-reference in `mayContainTypes` | the string `'_self'` | circular import of the same file |

## CTA trap (the one that bites)

A localized `link` type crashes the CMS CLI push. Always model a CTA as:

```ts
ctaLabel: { type: 'string', isLocalized: true, maxLength: 40, displayName: 'CTA Label', group: 'OT_Content', sortOrder: 30 },
ctaUrl:   { type: 'url',                                      displayName: 'CTA URL',   group: 'OT_Content', sortOrder: 40 },
```

`type: 'link'` is reliable **only** for navigation component types (footer/nav
items), not for block CTAs.

## Choice-key constraints (display templates)

- Choice keys must be alphanumeric/underscore and **≥ 2 chars**.
- Booleans → `select` with `'true'` / `'false'` string keys; coerce in the
  styling helper (`s.glass === true || s.glass === 'true'`).
- Numbers → prefixed keys (`col2`/`col3`/`col4`); map them in the helper.
- Variant keys that the component spells differently get normalized in the
  helper (e.g. `hoverFill` choice → `'hover-fill'` variant).

## Property groups

Assign every property a `group`. The declared groups (in
`optimizely.config.mjs → propertyGroups`) are:

`OT_Content` (editable content) · `OT_Style` (visual variant overrides) ·
`OT_Theme` · `OT_SEO` · `OT_Integrations`.

> **Atomic-rollback rule.** A property referencing a `group` that is NOT declared
> in `optimizely.config.mjs` rolls back **all** content types in the push. The
> symptom is misleading: a few `property group 'X' does not match an existing
> group` errors plus a cascade of `Unable to find a content type 'OT_…'` errors
> for display templates (which imported fine but can't bind to the rolled-back
> types). Fix: declare the group in `propertyGroups` before using it, then
> re-push. New visual/config fields belong in `OT_Content` or `OT_Style`, both
> already declared.

## `baseType` quick reference

| `baseType` | Use |
|---|---|
| `_component` | A block (most common). Add `compositionBehaviors`. |
| `_experience` | A Visual Builder page (composition tree). |
| `_page` | A traditional CMS page with a URL + dedicated React renderer. |
| `_image` / `_video` | Built-in media; use as `allowedTypes` on `contentReference`. |

`compositionBehaviors`: `'elementEnabled'` (placeable inside a column) and/or
`'sectionEnabled'` (placeable as a full-width section). A type with
`elementEnabled` may **not** also carry a nested component array — if you need an
array sub-item, make the parent reference-only or section-enabled (see how
`OT_StatBlock` uses only `sectionEnabled`).
