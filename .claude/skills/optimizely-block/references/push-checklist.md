# Push checklist

Syncing content types + display templates to the CMS. The scripts (from
`package.json`):

```bash
yarn cms:push   # node --env-file=.env --env-file-if-exists=.env.local … cms-cli config push
yarn cms:pull   # same, config pull
yarn build      # next build (runs static generation → queries Graph)
yarn dev        # next dev (no static generation; unaffected by un-pushed types)
```

## Preflight (before `yarn cms:push`)

- [ ] **Every `group` is declared** in `optimizely.config.mjs → propertyGroups`
      (`OT_Content`, `OT_Style`, `OT_Theme`, `OT_SEO`, `OT_Integrations`). An
      undeclared group rolls back **all** content types atomically.
- [ ] **No localized `link` CTA.** CTAs are `url` + `string` label. A localized
      `link` type 500s the push.
- [ ] **OptiForms excluded.** Don't add Forms types/templates; the
      `!cms/...OptiForms*.ts` globs must keep excluding them. Pushing a Forms
      display template fails (`Unable to find a content type 'OptiFormsContainerData'`).
- [ ] **Registered x3** — content type, display template, resolver entry all in
      `cms/registry.ts` (+ any sub-item content type).
- [ ] Enum items use `value` (not `key`); `maxLength` top-level; `isLocalized`
      (not `localized`); no `required`.

## Push BEFORE you build

Registering a type in `cms/registry.ts` immediately adds it to every
auto-generated GraphQL fragment. If the type isn't in the Graph schema yet,
`yarn build` static generation fails with:

```
HTTP 400: Unknown type "OT_PricingBlock"
   (or: Cannot query field "<field>" on type "OT_PricingBlock")
```

`yarn dev` does **not** static-generate, so it won't surface this — only `build`
(and Vercel) will. Order is always: **push → verify Graph → build**.

> **Graph re-index lag.** After a push, Optimizely Graph re-indexes its schema
> asynchronously. A large change (many new fields/types at once) can take a few
> minutes; a build immediately after may still 400 with "Cannot query field".
> Re-running `yarn cms:push` typically nudges the sync; otherwise wait and
> re-build. Confirm a field is live with a direct probe:
> ```bash
> KEY=$(grep '^OPTIMIZELY_GRAPH_SINGLE_KEY=' .env.local | cut -d= -f2)
> curl -s "https://cg.optimizely.com/content/v2?auth=$KEY" -H 'Content-Type: application/json' \
>   -d '{"query":"{ OT_PricingBlock(limit:1){ items { heading } } }"}'
> ```
> No `"errors"` in the response = schema is live; build will pass.

## Which instance gets the push

The CLI does **not** read `.env` itself; the scripts feed it via
`--env-file=.env --env-file-if-exists=.env.local`. The target instance is decided
**entirely by the `OPTIMIZELY_CMS_CLIENT_ID` / `OPTIMIZELY_CMS_CLIENT_SECRET`**
in `.env`, not by any flag. `OPTIMIZELY_CMS_URL` is the CMS **UI** host
(`app-….cms.optimizely.com`), NOT the API gateway — the CLI ignores it and uses
the shared SaaS gateway, routed by the creds. Wrong creds → silently pushes to
the wrong instance. The Graph **read** key (`OPTIMIZELY_GRAPH_SINGLE_KEY`)
decides which instance the front end reads, so push creds and Graph key must
point at the same instance.

The subcommand is `config push` (not bare `push`).

## Atomic-rollback symptom decoder

A push that "should" have worked but reports a cluster of errors:

| You see | Real cause | Fix |
|---|---|---|
| `property group 'X' does not match an existing group` **plus** a cascade of `Unable to find a content type 'OT_…'` (for display templates) | A property uses a `group` not declared in `propertyGroups`. The content-type import is atomic, so ALL types rolled back; the templates then can't bind. | Add the group to `optimizely.config.mjs`, re-push. |
| `Unable to find a content type 'OptiFormsContainerData'` | A Forms display template slipped past the exclusion globs. | Ensure both `OptiForms*` globs exclude it; never push Forms. |
| `500` during push, only after adding a CTA | A localized `link`-typed property. | Model the CTA as `url` + `string` label. |
| `HTTP 400: Unknown type "OT_X"` at **build** | Built before pushing, or Graph hasn't re-indexed. | Push first; wait for Graph; re-build. |

## After a clean push

Run `yarn build`. A green build (all static pages generated) confirms the Graph
schema accepts the new type and all seven artifacts are wired. Then optionally
`yarn lint` / `yarn lint:tokens` (the token guard fails on raw color literals in
`components/blocks/` — use `oklch(from var(--ot-*) …)` or token utilities).
