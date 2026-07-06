# Site Accelerator

**Site Accelerator** is a configurable, vertical-agnostic site framework built on the **Next.js App Router** and the **Optimizely SaaS CMS**. It is not a single brand site; it is a system for standing up credible, editorially confident marketing sites in any vertical (financial services, healthcare, retail, legal, and more) by re-theming and composing one shared component library through **ThemeManager**, **Visual Builder**, and **display templates**.

Its primary job is **pre-sales enablement**: solution engineers re-skin and re-compose it to show a prospect, in that prospect's own industry, what the SaaS CMS can do — Visual Builder composition, theme management, display templates, and headless delivery.

> The `OT_` content-type prefix and `--ot-` token prefix are **historical and theme-neutral** — they carry no brand meaning and are intentionally not renamed (renaming content-type keys is a breaking CMS migration).

## Stack

- **Next.js 16.2.6** — App Router, TypeScript (no Pages Router)
- **React 19.2.4**
- **Tailwind CSS v4** — configured via `@import "tailwindcss"` in `app/globals.css`; design tokens live in `styles/tokens.css` (there is no `tailwind.config.*`)
- **@optimizely/cms-sdk ^2.0.0** — headless content client (Optimizely Graph)
- **@optimizely/cms-cli ^2.0.0** — syncs TypeScript content-type definitions to the CMS (`yarn cms:push` / `cms:pull`)
- **Recharts** — powers the ChartBlock data visualizations

## Getting started

```bash
yarn install
yarn dev        # dev server on http://localhost:3000
```

Set the environment variables under **Optimizely CMS Setup** below first — the CMS-driven routes need at least `OPTIMIZELY_GRAPH_SINGLE_KEY` and `OPTIMIZELY_CMS_URL` to render content.

### Commands

| Command | What it does |
|---|---|
| `yarn dev` | Start the dev server |
| `yarn build` | Production build |
| `yarn start` | Run the production build |
| `yarn lint` | ESLint (next core-web-vitals + TypeScript rules) |
| `yarn lint:tokens` | Flag hard-coded color literals that should be design tokens |
| `yarn cms:push` | Push TypeScript content types / display templates to the CMS |
| `yarn cms:pull` | Pull the CMS content-type config back down |

> `cms:push` / `cms:pull` load `.env` then `.env.local` via the wrapper scripts — the CLI does not read env files itself.

## Architecture

The App Router lives under `app/`, with the public marketing site grouped in `app/(site)/`.

- **Design tokens** (`styles/tokens.css`) are the brand. Every color / spacing / type / motion value is a `--ot-*` custom property and components reference tokens, never raw values. Dark mode is the default; `data-theme="light"` flips the grounds.
- **ThemeManager axes** re-skin the whole system from the CMS with no code changes: **Primary Font** (Poppins by default, swappable to Source Serif 4 / Sora / Bricolage Grotesque), **Corner Style** (Sharp / Soft / Rounded), and **Motion Intensity** (Calm / Default / Energetic). `buildThemeCSS()` in [`lib/optimizely.ts`](lib/optimizely.ts) emits the overrides from the ThemeManager content type. Fixed-purpose fonts sit alongside the themeable primary: Syne (accent moments), Geist Mono (code / data), Caveat (the QuoteBlock signature), and Tilt Neon (the PrimaryText "neon" effect).
- **Block library** ([`components/blocks/`](components/blocks/)) — the composable Visual Builder blocks (Hero, Card, PrimaryText, Quote, Stat, Feature Grid, Accordion, Tabs, Chart, Blog Feed, and more). Each block follows a fixed four-layer CMS pattern (content type → display template → adapter → React component) and ships a showcase demo in the same task.
- **Showcase** (**`/showcase`**) — a live gallery of every block and layout plus a theme playground, grouped into Blocks / Pages / Layout / Theme. The fastest way to see what exists and how each variant renders under the current theme.
- **CMS-driven pages** render through the catch-all at [`app/(site)/[...slug]/page.tsx`](app/(site)/[...slug]/page.tsx), which fetches by slug via Optimizely Graph and renders the SDK composition tree.

### Project docs

| Doc | Covers |
|---|---|
| [`PRODUCT.md`](PRODUCT.md) | Product purpose, users, brand voice, strategic principles |
| [`DESIGN.md`](DESIGN.md) | Color strategy, typography, elevation, motion, component specs |
| [`Optimizely.md`](Optimizely.md) | CMS integration patterns, page / experience types, Graph queries |
| [`CLAUDE.md`](CLAUDE.md) | Repo conventions and the CMS block-authoring workflow |

For adding or editing CMS blocks, the **optimizely-block** skill (`.claude/skills/optimizely-block/`) encodes the exact four-layer + showcase + push workflow and the seven artifacts each block needs to be complete.

## Claude Code skills

This repo ships a project-scoped [Claude Code](https://claude.com/claude-code) skill for Optimizely CMS work, under [`.claude/skills/`](.claude/skills/). It is picked up automatically when a request matches — you don't have to name it.

### `optimizely-block`

Encodes this repo's exact workflow for **any** work on a CMS block or section — creating, extending, restyling, or wiring one up. It triggers on requests like *"add a Testimonial block"*, *"add a field to the Card block"*, or *"new hero variant"*, and supersedes the generic `optimizely-model` / `optimizely-model-react` plugin skills for anything touching `cms/` or `components/blocks/`. It captures the **four-layer + showcase + push** workflow and the **seven artifacts** a block needs to be complete: content type, display template, CMS adapter, UI component, three `cms/registry.ts` entries, the showcase demo, and the showcase nav item.

Reference files (`.claude/skills/optimizely-block/references/`):

| Reference | Covers |
|---|---|
| `four-layer-pattern.md` | Content type, block + section display templates, adapters, the UI component, and rich-text / image / link / array rendering |
| `sdk-property-rules.md` | SDK property gotchas: enum `value` not `key`, top-level `maxLength`, `isLocalized`, `richText` not `xhtml`, the CTA-must-be-`url`+`string` rule, property groups, and the atomic property-group rollback |
| `registration.md` | The three `cms/registry.ts` edits, each failure mode, and the catch-all route note |
| `showcase-sync.md` | The four showcase-page edits plus the one nav edit every new block needs |
| `push-checklist.md` | Preflight, push-before-build, instance-decided-by-creds, Graph re-index lag, and the atomic-rollback symptom decoder |

## Optimizely CMS Setup

### Required environment variables

```bash
# .env.local (development) or Vercel environment settings (production)
OPTIMIZELY_GRAPH_SINGLE_KEY=   # Graph single-key for public content queries
OPTIMIZELY_CMS_URL=            # Full CMS instance URL (e.g. https://app-xxx.cms.optimizely.com/)
OPTIMIZELY_CMS_CLIENT_ID=      # OAuth client ID for content type sync (cms-cli)
OPTIMIZELY_CMS_CLIENT_SECRET=  # OAuth client secret for content type sync (cms-cli)

# SEO / metadata
NEXT_PUBLIC_SITE_URL=          # Canonical site origin — no trailing slash
                               # (e.g. https://your-site.vercel.app)
                               # Used to build <link rel="canonical"> hrefs and
                               # JSON-LD pageUrl values. Falls back to the
                               # request Host header when not set (useful in dev).

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN=      # Mapbox public token (pk....) for map rendering
                               # and address geocoding. Required for
                               # OT_LocationListingBlock — the map view renders an
                               # unconfigured-state notice without it, and
                               # addresses are not geocoded. The grid and list
                               # views work without it. Create a token at
                               # https://account.mapbox.com/access-tokens/

# OptiAdmin dashboard (see "OptiAdmin Dashboard" below)
OPTI_ADMIN_USER=               # Username for the /opti-admin sign-in
OPTI_ADMIN_PASSWORD=           # Password for the /opti-admin sign-in
                               # If either is unset, /opti-admin login is disabled
                               # (the auth endpoint returns 503 "not configured").
```

### Shared block preview — set a default application in the CMS

If your CMS instance has more than one application (site) defined, you **must** designate one of them as the default. Without a default application, the Visual Builder does not know which front-end URL to use when opening a shared block in the preview panel, and editors will see the "Preview is not configured" message.

To set the default:

1. Log in to the Optimizely CMS admin.
2. Go to **Settings → Applications**.
3. Select the application that corresponds to this Vercel deployment.
4. Enable the **Default application** toggle.

Once set, shared block previews will load in the Visual Builder iframe using this site's preview URL.

## CMP Content Preview

This app can render a live preview of a blog authored in **Optimizely Content Marketing Platform (CMP)**, so a marketer editing in CMP sees it laid out in this site's blog UI before it's ever published to the CMS. When an editor clicks **Preview** in CMP, CMP fires a `content_preview_requested` webhook at this app; the app renders the payload through the same [`BlogPage`](components/pages/BlogPage.tsx) component the CMS uses and hands the URL back to CMP, which embeds it in its preview pane.

> This is **separate** from the CMS Visual Builder "Shared block preview" above. That previews CMS content; this previews CMP content. They share no configuration.

### How it works

1. CMP POSTs `content_preview_requested` to **`/api/cmp-preview`** with the full content and a `callback-secret` header.
2. The handler verifies the secret, then persists the delivery to the durable store (keyed by `preview_id`).
3. It POSTs `acknowledge` (we can render it), then `complete` with the render URL `…/cmp-preview?id=<preview_id>`.
4. CMP caches that URL and embeds **`/cmp-preview`** in an iframe. That page loads the stored payload, resolves the featured image to a public CDN URL, and renders `BlogPage`.

The acknowledge/complete calls and image resolution authenticate to CMP via the OAuth2 **client-credentials** flow (no user login / redirect involved).

### Required environment variables

```bash
# .env.local (development) or Vercel environment settings (production)

# CMP API app — Settings → Apps in CMP (OAuth2 client credentials).
# The app registration asks for a redirect/Authorization Callback URL; it is
# only used by the authorization-code flow and is unused here — any valid URL is fine.
CMP_CLIENT_ID=                 # client_id of the CMP App
CMP_CLIENT_SECRET=             # client_secret of the CMP App
CMP_CALLBACK_SECRET=           # must match the "callback secret" set on the CMP webhook;
                               # CMP sends it as the `callback-secret` request header so
                               # inbound webhooks can be verified

# Durable preview store — Vercel Marketplace → Upstash → Redis (NOT "Vercel KV",
# which is retired). Connect it to the project and Vercel injects these. Without
# them the store falls back to in-memory (fine for `yarn dev`, NOT reliable on
# Vercel, since CMP fetches the completed URL later on a possibly-different instance).
KV_REST_API_URL=               # also accepts UPSTASH_REDIS_REST_URL
KV_REST_API_TOKEN=             # also accepts UPSTASH_REDIS_REST_TOKEN

# CMP → CMS publish (see "Publishing CMP content to the CMS" below). Required
# ONLY for the publish flow — the preview flow above does not use it.
CMP_BLOG_CONTAINER_KEY=        # CMS content key of the container/folder under which
                               # OT_BlogPage entries are created (e.g. the "Blog"
                               # folder). Without it the publish webhook captures
                               # but skips the CMS write (cmsWrite.status === 'skipped').
```

If `CMP_*` are unset the webhook still captures and the renderer still works locally — it just skips verification and the acknowledge/complete round-trip.

### Setup steps

1. **Create a CMP App** (CMP → **Settings → Apps**) with App Role *Other*. Save and copy its `client_id` / `client_secret` → `CMP_CLIENT_ID` / `CMP_CLIENT_SECRET`. The redirect URL field is required by the form but unused by this integration.
2. **Provision the durable store**: Vercel project → **Storage → Upstash → Redis**, then **connect it to the project**. Vercel injects `KV_REST_API_URL` / `KV_REST_API_TOKEN`.
3. **Recreate the blog content type in CMP** (`cmp_opti_blog`) with field keys matching the mapping in [`lib/cmpBlog.ts`](lib/cmpBlog.ts): `headline`, `subHeadline`, `topic` (choice), `featuredImage` (library-asset), `body` (rich-text), `readTime`.
4. **Create the CMP webhook** (CMP → **Settings → Webhooks**): event `content_preview_requested`, target URL `https://<your-deployment>/api/cmp-preview`, and set a **callback secret** — use the same value as `CMP_CALLBACK_SECRET`.
5. **Set all env vars in Vercel** (Production) and **redeploy**, then click **Preview** on a CMP blog.

### Inspecting & troubleshooting

- **GET `/api/cmp-preview`** returns the most recently captured webhook delivery as JSON — handy for confirming payload shape.
- The handler logs each step to the Vercel **Functions** logs, prefixed `[cmp-preview]` — including the verbatim `acknowledge →` and `complete →` status + response body. If `complete` is not 2xx, that logged body names the exact field at fault.
- The render page accepts `?id=<preview_id>` (a specific delivery) and `?style=impact|atmospheric|editorial` (header treatment; defaults to `editorial`).
- Framing inside CMP is already permitted by the global `frame-ancestors … *.cms.optimizely.com` policy in [`next.config.mjs`](next.config.mjs).

### Where things live

| Concern | Location |
|---|---|
| Webhook handler (verify → store → acknowledge/complete) | [`app/api/cmp-preview/route.ts`](app/api/cmp-preview/route.ts) |
| Render page | [`app/cmp-preview/page.tsx`](app/cmp-preview/page.tsx) |
| CMP API client (token, callbacks, asset resolve) | [`lib/cmpApi.ts`](lib/cmpApi.ts) |
| Payload → `BlogPageContent` mapping | [`lib/cmpBlog.ts`](lib/cmpBlog.ts) |
| Durable delivery store (Upstash REST + in-memory fallback) | [`lib/cmpPreviewStore.ts`](lib/cmpPreviewStore.ts) |

### Publishing CMP content to the CMS

Beyond preview, this app can **create the blog in the CMS** when a CMP workflow publishes it. CMP fires an `asset_published` webhook at **`/api/cmp-publish`**; the handler verifies the `callback-secret` (reuses `CMP_CALLBACK_SECRET`), maps the payload with the same [`lib/cmpBlog.ts`](lib/cmpBlog.ts), and creates a draft `OT_BlogPage` via the CMS Management API — updating the **same** page on re-publish (it persists a `content_guid → CMS key` mapping in the durable store, since the CMS assigns its own key on create).

**Two extra requirements beyond the preview env vars:**

- **`CMP_BLOG_CONTAINER_KEY`** — the CMS content key of the container/folder the blog pages should be created under. Find it in the CMS by opening the target folder (its key appears in the content URL / Management API). This is the one new front-end variable the publish flow needs.
- **CMS Management API credentials** — `OPTIMIZELY_CMS_CLIENT_ID` / `OPTIMIZELY_CMS_CLIENT_SECRET`, the **Manage Content** key pair from CMS **Settings → API Keys** (the same creds the CLI uses).

**Grant the API key access to the target subtree.** When this app creates a blog it acts as the *"user"* writing programmatically — so the Management API key must hold content-access rights on the branch of the CMS tree where blogs are created (the `CMP_BLOG_CONTAINER_KEY` container and its descendants), exactly as you would grant a human editor. In the CMS, open that container → **Access rights**, add the API key (its **ID** from Settings → API Keys → Manage Content, the GUID-like value — *not* the Graph app key) as a principal, and grant at least **Read, Create, Change** (Delete too if re-publish should replace; Publish/Administer are not needed — items are created as draft for review). Inherited rights from a parent item work as well. Without these grants the create call fails with a 403/permission error in the `[cmp-publish]` logs even though the credentials themselves are valid.

If either the container key or the creds are missing the webhook still captures the delivery but skips the write — visible as `cmsWrite.status === 'skipped'` in the response and the `[cmp-publish]` Vercel logs. **GET `/api/cmp-publish`** returns the most recent delivery plus the last write outcome.

**Setup:** add a second CMP webhook (event `asset_published`, target `https://<your-deployment>/api/cmp-publish`, same callback secret), set `CMP_BLOG_CONTAINER_KEY` + the CMS creds in Vercel, and redeploy.

| Concern | Location |
|---|---|
| Publish webhook (verify → map → create/update) | [`app/api/cmp-publish/route.ts`](app/api/cmp-publish/route.ts) |
| CMS Management API client (`upsertBlogPage`) | [`lib/cmsApi.ts`](lib/cmsApi.ts) |
| `content_guid → CMS key` mapping (idempotent re-publish) | [`lib/cmpPreviewStore.ts`](lib/cmpPreviewStore.ts) |

## OptiAdmin Dashboard

OptiAdmin is a lightweight, self-contained admin area for inspecting the content in your Optimizely CMS instance. It lives under [`app/opti-admin/`](app/opti-admin/) and reads live data through Optimizely Graph — it is read-only and does not write back to the CMS.

Visit **`/opti-admin`** on any deployment (e.g. [http://localhost:3000/opti-admin](http://localhost:3000/opti-admin)) to reach it.

### Access & authentication

- Sign-in lives at **`/opti-admin/login`** and uses a single set of credentials from `OPTI_ADMIN_USER` / `OPTI_ADMIN_PASSWORD` (see the env block above). This is intentionally simple env-var auth — not a multi-user system.
- A successful login sets an `httpOnly` session cookie holding a SHA-256 token derived from the credentials. The session lasts **8 hours**.
- If the credentials are not configured on the server, the auth endpoint returns **503** and login is disabled. The data endpoints under [`app/api/opti-admin/`](app/api/opti-admin/) reject any request without a valid session cookie with **401**.
- The admin area runs under its own neutral token scope (`.opti-admin`), decoupled from the marketing site's brand theme, so its appearance is independent of the CMS theme.

### What's included

- **Dashboard** (`/opti-admin`) — a block-type inventory of the registered content types (grouped by content / media / data / layout category) plus a list of the most recently published/scheduled content.
- **Component Usage** (`/opti-admin/component-usage`) — pick a block type and see which pages use it. Block types are counted by recursively scanning Visual Builder compositions (Section → Row → Column → Component); page types (`BlankExperience`, `OT_BlogPage`) are queried directly. Only content type keys in [`lib/admin/contentTypes.ts`](lib/admin/contentTypes.ts) may be queried.
- **Content Calendar** (`/opti-admin/calendar`) — browse published and scheduled content by date across the CMS.
- **Work Requests** (`/opti-admin/work-requests`) — an external-facing form (Sales, HR, Product, …) that creates a work request directly in **Optimizely CMP**, without giving the requester CMP access. Pick a CMP Request Type template, the form adapts to that template's fields, and submitting POSTs a work request to CMP server-side. See "Submitting a CMP Work Request" below — this is a presales demo, not production hardened, and it talks to CMP's Requests API, which is marked **Experimental** in Optimizely's docs.

The **Analytics** and **Settings** sections in the sidebar are placeholders and are marked "Soon" — they are not yet wired up.

### Submitting a CMP Work Request

`/opti-admin/work-requests` lets someone outside CMP (Sales, HR, Product, …) file a work request into **Optimizely Content Marketing Platform** without needing a CMP seat. It's a template-driven form: pick a CMP **Request Type** template, the form renders that template's actual fields, and submitting creates the work request in CMP through server-side API routes — the requester never sees or holds a CMP credential.

This uses CMP's **Requests** REST API (`/v3/templates`, `/v3/work-requests`), which Optimizely's docs mark **"Experimental"** — the contract could shift. The field-definition shape returned by `GET /v3/templates/{id}` wasn't confirmed ahead of time; [`app/api/opti-admin/cmp-templates/[id]/route.ts`](<app/api/opti-admin/cmp-templates/[id]/route.ts>) logs the raw response (non-production) so it can be checked against a live template, and [`lib/admin/cmpWorkRequests.ts`](lib/admin/cmpWorkRequests.ts) normalizes across a few plausible key-name variants rather than assuming one.

**CMP-side setup:**

1. **Reuse (or create) the CMP OAuth2 client-credentials App** — CMP → **Settings → Apps & Webhooks**. This is the same app used by [CMP Content Preview](#cmp-content-preview) above; both share `CMP_CLIENT_ID` / `CMP_CLIENT_SECRET`. No new env vars are needed for this feature.
2. **Find a template id to test against** — CMP → **Requests → Templates**. Open the Request Type template you want to demo and copy its id (or hit `GET /api/opti-admin/cmp-templates` once logged into OptiAdmin, which lists every template CMP returns).
3. Open `/opti-admin/work-requests`, pick that template from the dropdown, fill in the fields it renders, and submit — it lands in CMP under **Requests**.

**Requester context:** name / email / department are collected outside the CMP template (CMP's `form_fields` has no separate "requester" concept). The API route folds a "Submitted via external request form by …" line into the first `brief` / `text_area` / `richtext` field the template defines; if the template has none, that context is logged server-side but not attached to the CMP payload.

### Where things live

| Concern | Location |
|---|---|
| Routes & pages | [`app/opti-admin/`](app/opti-admin/) |
| Data / auth API routes | [`app/api/opti-admin/`](app/api/opti-admin/) |
| UI components (shell, nav, clients) | [`components/admin/`](components/admin/) |
| Auth helpers, Graph queries, content-type list | [`lib/admin/`](lib/admin/) |
| CMP templates + work-request API routes | [`app/api/opti-admin/cmp-templates/`](app/api/opti-admin/cmp-templates/), [`app/api/opti-admin/work-requests/`](app/api/opti-admin/work-requests/) |
| CMP templates/work-request API client (token reused from CMP Preview) | [`lib/cmpApi.ts`](lib/cmpApi.ts) |
| Template field-shape types + normalization (Experimental API) | [`lib/admin/cmpWorkRequests.ts`](lib/admin/cmpWorkRequests.ts) |

## Deployment

Deployed on **Vercel**. Set every environment variable from the sections above in the Vercel project (Production scope), then deploy.

Content-type and display-template changes are a **separate** step from the app deploy: run `yarn cms:push` to sync them to the CMS. The target instance is decided by the `OPTIMIZELY_CMS_CLIENT_ID` / `OPTIMIZELY_CMS_CLIENT_SECRET` credentials in your environment, so double-check those point at the intended instance before pushing.
