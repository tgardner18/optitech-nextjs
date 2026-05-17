# OptiTech CMS Repair & Integration Plan

**Created:** 2026-05-16  
**Status:** In progress  
**Goal:** Fix display settings rendering, preview, SiteSettings wiring, and clean up orphaned components so the site is fully CMS-driven end-to-end.

---

## Context

The architecture is sound. Content types, display templates, composition adapters (Section/Row/Column), and the registry are all in place from the prior integration sprint. The problems are specific bugs and missing wiring — not design flaws.

**Reference repos consulted:**
- `https://github.com/tgardner18/astro-saas-cms-demo` — fully configured Optimizely SaaS CMS site; primary reference for patterns
- `https://github.com/episerver/content-js-sdk` — official SDK source; used to understand `getPreviewUtils`, `withAppContext`, `displaySettings` flow

---

## Phase 1 — Fix the display settings pipeline

**Status:** ✅ Complete

### 1a. Fix `OT_LandingSection` — wrong `nodeType` cast ✅

**File:** `cms/display-templates/OT_LandingSection.ts`

SDK confirmed: `NODE_TYPES = ['row', 'column']` — `'section'` is not valid. However `'_section'` IS a valid `BaseTypes` value (from `ALL_BASE_TYPES`). Fixed by replacing the bad cast with the correct target:

```ts
// Before (broken):
nodeType: 'section' as 'row',
// After (fixed):
baseType: '_section',
```

---

### 1b. `OT_Style` property group — not needed ✅

Audited all `cms/content-types/*.ts` — no properties use `group: 'OT_Style'`. Style settings correctly live on display templates, not content types. No config change required.

---

### 1c. Register display templates at runtime ✅

**File:** `cms/registry.ts`

Added `initDisplayTemplateRegistry` import and call with all 10 display templates (7 block defaults + Section/Row/Column).

---

### 1d. Re-push to CMS ✅

```
npx @optimizely/cms-cli config push
```

Result: **13 content types + 10 display templates pushed successfully.**

- [ ] Confirm section/row/column display settings panels appear in Visual Builder
- [ ] Set a value (e.g., Hero background → "Canvas") and confirm it renders on preview page

---

## Phase 2 — Fix preview

**Status:** 2a done — 2b/2c need manual verification in CMS

### 2a. Fix `/api/draft` route — wrong token validation ✅

**File:** `app/api/draft/route.ts`

Removed static secret comparison — was always returning 401 since Optimizely sends a dynamic JWT, not a static secret. Now simply checks that `preview_token` is present; the Graph API validates the JWT itself.

**Note:** Primary preview flow uses `/preview` + `withAppContext` directly. This draft route only matters if you need Next.js draft-mode cookies to persist across in-preview navigations.

---

### 2b. Confirm CMS preview URL configuration

In the Optimizely CMS instance, verify the channel's preview URL is set to:
- Dev: `http://localhost:3000/preview`
- Production: `https://<your-domain>/preview`

If it's pointing to `/api/draft` that's the wrong target for the main preview flow.

- [ ] Check CMS → Settings → Channels → Preview URL
- [ ] Update if incorrect

---

### 2c. Verify `communicationinjector.js` loads

**File:** `app/preview/page.tsx:40`

```tsx
<script async src={`${cmsUrl}/util/javascript/communicationinjector.js`} />
```

`cmsUrl` reads from `OPTIMIZELY_CMS_URL`. The `.env` file has this set but `.env.local` is the authoritative Next.js runtime source. Confirm it's present in `.env.local`.

- [ ] Verify `OPTIMIZELY_CMS_URL` is in `.env.local`
- [ ] Open preview in browser DevTools → Network and confirm the script loads (200)
- [ ] Test: edit content in Visual Builder → confirm preview updates

---

## Phase 3 — Wire `OT_SiteSettings` to Header/Footer

**Status:** Not started

### 3a. Add logo image field to `OT_SiteSettings`

**File:** `cms/content-types/OT_SiteSettings.ts`

Currently has `logoAlt` (string) but no actual logo image reference. Add:
```ts
logo: { type: 'contentReference', allowedTypes: ['_image'], displayName: 'Logo', group: 'OT_Content', sortOrder: 5 },
```

- [ ] Add `logo` field
- [ ] Push updated content type to CMS

---

### 3b. Add `getSiteSettings()` to `lib/optimizely.ts`

Query by fixed path `/site-settings`:
```ts
export async function getSiteSettings() {
  const results = await getClient().getContentByPath('/site-settings')
  return results?.[0] ?? null
}
```

- [ ] Implement and export `getSiteSettings()`

---

### 3c. Convert Header to a server component with CMS data

**File:** `components/layout/Header.tsx`

Currently `'use client'` with hardcoded nav links. The client boundary is only needed for the mobile menu toggle. Refactor:

- `Header.tsx` → server component; fetches `getSiteSettings()`, passes nav data down
- `MobileMenuButton.tsx` → new thin `'use client'` component for the hamburger/overlay only

- [ ] Create `MobileMenuButton.tsx` client component (hamburger + overlay)
- [ ] Refactor `Header.tsx` to server component; reads nav items and logo from SiteSettings
- [ ] Handle null/fallback gracefully if SiteSettings not yet created in CMS

---

### 3d. Convert Footer to use CMS data

**File:** `components/layout/Footer.tsx`

- [ ] Fetch SiteSettings in Footer (or pass as prop from a parent server component)
- [ ] Render `footerColumns`, `legalLinks`, `copyright`, `footerTagline` from CMS data

---

### 3e. Create SiteSettings in CMS

- [ ] Create one `OT_SiteSettings` instance at path `/site-settings` in CMS
- [ ] Add logo, nav items, footer columns, copyright
- [ ] Verify Header and Footer render CMS data

---

## Phase 4 — Fix `BlankExperience` adapter gap

**Status:** Not started

**File:** `cms/registry.ts`

`BlankExperience` is registered in `initContentTypeRegistry` but has no component in `initReactComponentRegistry`. If a BlankExperience page is fetched, the composition renderer finds no component and renders nothing silently.

- [ ] Create `cms/components/BlankExperience.tsx` — a minimal adapter that renders `<OptimizelyGridSection nodes={content.composition?.nodes ?? []} />`
- [ ] Register it in `initReactComponentRegistry` as `BlankExperience: BlankExperienceAdapter`

---

## Phase 5 — Clean up orphaned static components

**Status:** Not started

The `app/(site)/showcase/` section was built for the static design system phase. It references hardcoded static data and is partially orphaned now that CMS adapters exist.

**Decision needed:**
- Option A: Update showcase to demonstrate CMS-driven blocks (useful as dev reference)
- Option B: Remove showcase entirely

Other components:
- `components/ui/Button.tsx`, `ThemeToggle.tsx` — still used by Header; **keep**
- `components/providers/ThemeProvider.tsx`, `MotionObserver.tsx` — used by root layout; **keep**
- `components/blocks/*.tsx` — the rendering layer used by `cms/components/`; **all keep**

- [ ] Decide on showcase fate
- [ ] Remove or update showcase accordingly

---

## Phase 6 — (Future) `OT_ThemeSettings` for multi-tenant theming

**Status:** Planned, not started

Once phases 1–4 are stable, add an `OT_ThemeSettings` shared block that holds brand color token overrides (brand color, accent, logo, font choice). These inject CSS variables at the layout level via an inline `<style>` tag, overriding the defaults in `styles/tokens.css`. This is the "install once per site" framework config block.

Reference: Astro demo's `SiteStyles` component and `siteStylesHelper.ts`.

- [ ] Define `OT_ThemeSettings` content type (color pickers or token-key selects for brand/accent/canvas/surface)
- [ ] Add a `ThemeStyleInjector` server component that renders `<style>` with overridden CSS variables
- [ ] Mount in root `app/layout.tsx`
- [ ] Test: change brand color in CMS → verify site recolors on next page load

---

## Execution order

| Phase | What | Why first |
|-------|------|-----------|
| 1 | Fix section nodeType + initDisplayTemplateRegistry + re-push | Unblocks all display settings — nothing else matters until this works |
| 2 | Fix draft route + confirm CMS preview URL + verify communicationinjector | Unblocks live preview in Visual Builder |
| 3 | SiteSettings → Header/Footer wiring | Makes site fully CMS-driven end-to-end |
| 4 | BlankExperience adapter | Prevents silent render failures |
| 5 | Showcase cleanup | Polish, not blocking |
| 6 | ThemeSettings block | Future, once core is proven |

---

## Notes / Decisions log

| Date | Note |
|------|------|
| 2026-05-16 | Plan created after full audit of project + reference repos |
| 2026-05-16 | Confirmed: display template `nodeType: 'section' as 'row'` is a definite bug; section settings won't render until fixed |
| 2026-05-16 | Confirmed: draft route preview_token validation is wrong (compares JWT to static secret) |
| 2026-05-16 | OT_SiteSettings is `_page` type queried by path — keep as `_page`, just need to add the missing logo field and wire Header/Footer |
| 2026-05-16 | Showcase pages under `app/(site)/showcase/` are static design system demos — decision on keep/remove deferred to Phase 5 |
| 2026-05-16 | **Phase 1 complete.** SDK confirmed `NODE_TYPES = ['row','column']`; fixed section template to `baseType: '_section'` (valid per ALL_BASE_TYPES). Added `initDisplayTemplateRegistry` to registry.ts. CLI push result: 13 content types + 10 display templates imported. |
| 2026-05-16 | **Phase 2a complete.** Draft route no longer compares preview_token to static secret — just checks presence. |
| 2026-05-16 | OT_Style property group confirmed not needed — no content-type properties use it; style settings correctly live only on display templates. |
