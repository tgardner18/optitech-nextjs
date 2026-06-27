This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

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

The **Analytics** and **Settings** sections in the sidebar are placeholders and are marked "Soon" — they are not yet wired up.

### Where things live

| Concern | Location |
|---|---|
| Routes & pages | [`app/opti-admin/`](app/opti-admin/) |
| Data / auth API routes | [`app/api/opti-admin/`](app/api/opti-admin/) |
| UI components (shell, nav, clients) | [`components/admin/`](components/admin/) |
| Auth helpers, Graph queries, content-type list | [`lib/admin/`](lib/admin/) |

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out the [Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy this app is via the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
