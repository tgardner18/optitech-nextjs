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
                               # (e.g. https://optitech-nextjs-tim.vercel.app)
                               # Used to build <link rel="canonical"> hrefs and
                               # JSON-LD pageUrl values. Falls back to the
                               # request Host header when not set (useful in dev).

# OptiAdmin dashboard (see "OptiAdmin Dashboard" below)
OPTI_ADMIN_USER=               # Username for the /opti-admin sign-in
OPTI_ADMIN_PASSWORD=           # Password for the /opti-admin sign-in
                               # If either is unset, /opti-admin login is disabled
                               # (the auth endpoint returns 503 "not configured").
```

### Syncing content types to the CMS

Content type and display template definitions live in [`cms/content-types/`](cms/content-types/) and [`cms/display-templates/`](cms/display-templates/) and are pushed to your CMS instance with the `@optimizely/cms-cli`, wrapped by [`scripts/cms-push.mjs`](scripts/cms-push.mjs):

```bash
yarn cms:push            # push content types / templates to the CMS
yarn cms:push:dry        # build & validate the manifest without pushing
yarn cms:pull            # pull the current schema from the CMS
```

**Which instance gets pushed** is determined entirely by the `OPTIMIZELY_CMS_CLIENT_ID` / `OPTIMIZELY_CMS_CLIENT_SECRET` credentials. The push script resolves them from an env file in this order:

1. `.env.<branch>` — the per-branch-instance convention (slashes in the branch name are sanitized, e.g. `feature/x` → `.env.feature-x`).
2. `.env.local` — fallback so a fresh clone works without a per-branch file.

Override with `CMS_ENV_FILE=path yarn cms:push`. The credentials must be in that file — the dev server auto-loads `.env.local`, but the CLI does not.

#### First push to a fresh instance — the `mayContainTypes` cycle

The page types reference each other through `mayContainTypes` (a Folder may contain an Experience, which may contain a Blog page, …). Those declared references form a cycle. This is **fine on an instance where the types already exist** (the push is an update), but on a **fresh instance** the importer has to *create* all the types in one atomic manifest, and a cyclic set of references has no valid creation order. The server rejects it:

```
Content type 'BlankExperience' has a circular dependency through 'OT_BlogPage,OT_CampaignPage,OT_FolderPage'.
```

…which then cascades into misleading `Unable to find a content type 'OT_…'` errors as the whole import rolls back. Nothing is created (the import is atomic), so it is safe to retry.

To resolve it, run the **opt-in bootstrap**, which pushes in two phases — first with every `mayContainTypes` stripped (so all types create with no declared references), then the full manifest (the references now resolve against types that already exist):

```bash
yarn cms:push:bootstrap          # or: yarn cms:push --ignore-circular-dependency  (alias: --bootstrap)
```

> **Why it's opt-in (off by default):** the bootstrap forces `ignore-data-loss-warnings` to create/restore the cyclic types. That's always safe on an empty instance, but could mask real data loss on a populated one — so a plain `yarn cms:push` never forces it. A bare push that hits the cycle simply surfaces the error and points you here. Established instances never hit this path; the first push just succeeds.

### Shared block preview — set a default application in the CMS

If your CMS instance has more than one application (site) defined, you **must** designate one of them as the default. Without a default application, the Visual Builder does not know which front-end URL to use when opening a shared block in the preview panel, and editors will see the "Preview is not configured" message.

To set the default:

1. Log in to the Optimizely CMS admin.
2. Go to **Settings → Applications**.
3. Select the application that corresponds to this Vercel deployment.
4. Enable the **Default application** toggle.

Once set, shared block previews will load in the Visual Builder iframe using this site's preview URL.

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
