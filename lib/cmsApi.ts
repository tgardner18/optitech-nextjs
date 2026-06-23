// ─── Optimizely SaaS CMS Management API client ──────────────────────────────
//
// Runtime (non-CLI) access to the CMS Content Management API, used by the CMP
// publish webhook to create/update an OT_BlogPage draft. Auth + endpoints were
// taken from the bundled cms-cli OpenAPI schema and reuse the SAME credentials
// as cms:push (OPTIMIZELY_CMS_CLIENT_ID / OPTIMIZELY_CMS_CLIENT_SECRET).
//
//   token   — POST {gateway}/oauth/token  (JSON client_credentials) → Bearer
//   exists  — GET  {gateway}/v1/content/{key}
//   create  — POST {gateway}/v1/content                 (NewContent + initialVersion)
//   update  — POST {gateway}/v1/content/{key}/versions  (new draft ContentVersion)
//
// Idempotency: the CMP content_guid is used verbatim as the CMS content key (both
// are 32-hex GUIDs). First publish creates the item; re-publish adds a fresh
// draft version to the same key — same page/URL, updated content.

const GATEWAY = (process.env.OPTIMIZELY_CMS_API_URL || 'https://api.cms.optimizely.com').replace(/\/$/, '')
const TOKEN_URL = `${GATEWAY}/oauth/token`
const API = `${GATEWAY}/v1`

let cachedToken: { token: string; expiresAt: number } | null = null

export function cmsConfigured(): boolean {
  return Boolean(process.env.OPTIMIZELY_CMS_CLIENT_ID && process.env.OPTIMIZELY_CMS_CLIENT_SECRET)
}

export async function getCmsAccessToken(): Promise<string> {
  const clientId = process.env.OPTIMIZELY_CMS_CLIENT_ID
  const clientSecret = process.env.OPTIMIZELY_CMS_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('OPTIMIZELY_CMS_CLIENT_ID / OPTIMIZELY_CMS_CLIENT_SECRET are not set')
  }
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 60_000) return cachedToken.token

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }),
  })
  if (!res.ok) throw new Error(`CMS token mint failed: ${res.status} ${await res.text()}`)
  const json = (await res.json()) as { access_token: string; expires_in?: number }
  cachedToken = { token: json.access_token, expiresAt: now + (json.expires_in ?? 3600) * 1000 }
  return cachedToken.token
}

export type BlogPageProperties = {
  blogStyle?: string
  headline: string
  subHeadline?: string
  topic?: string
  /** A cms://content/<key> reference (e.g. the federated CMP DAM asset). */
  featuredImage?: string
  /** Body HTML (CMS stores rich text as an HTML string). */
  body?: string
  readTime?: string
}

export type UpsertBlogInput = {
  /** Existing CMS key to update; omit to create (the CMS assigns the key). */
  existingKey?: string
  container: string
  locale: string
  displayName: string
  routeSegment: string
  properties: BlogPageProperties
}

export type UpsertResult = {
  action: 'created' | 'updated'
  status: number
  body: string
  /** The CMS content key (assigned on create, or the existing key on update). */
  cmsKey?: string
}

// Allow the federated graph:cmp_PublicImageAsset reference to be set on
// featuredImage (a contentReference whose allowedTypes is ['_image']) without a
// reference-type validation failure. Content is created as draft for review.
const SKIP_REF_VALIDATION = { 'cms-skip-validation': 'references' }

// Bare draft version (no properties) used to create the item / a new draft. The
// CMS create makes an EMPTY item; properties are then applied via a merge-patch
// on the version (mirrors the Management API's create-then-populate pattern).
// status is intentionally omitted — the CMS rejects assigning status on create;
// new items/versions default to draft.
function bareVersion(input: UpsertBlogInput) {
  return {
    contentType: 'OT_BlogPage',
    locale: input.locale,
    displayName: input.displayName,
    routeSegment: input.routeSegment,
  }
}

// Creates the OT_BlogPage (CMS assigns the key) on first publish, or adds a
// fresh draft version to the existing key on re-publish (same page/URL), then
// merge-patches the properties onto that draft version. Returns the action, the
// resolved CMS key, and the raw CMS response (logged by the caller so any shape
// mismatch surfaces immediately).
export async function upsertBlogPage(input: UpsertBlogInput): Promise<UpsertResult> {
  const token = await getCmsAccessToken()
  const authJson = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  const action: 'created' | 'updated' = input.existingKey ? 'updated' : 'created'

  // 1. Create the item (empty draft, key auto-assigned) or add a new draft
  //    version to the existing item.
  const createRes = input.existingKey
    ? await fetch(`${API}/content/${input.existingKey}/versions`, {
        method: 'POST',
        headers: authJson,
        body: JSON.stringify(bareVersion(input)),
      })
    : await fetch(`${API}/content`, {
        method: 'POST',
        headers: authJson,
        body: JSON.stringify({
          contentType: 'OT_BlogPage',
          container: input.container,
          initialVersion: bareVersion(input),
        }),
      })

  const createText = await createRes.text()
  if (!createRes.ok) return { action, status: createRes.status, body: createText }

  // create → NewContentNode { key, initialVersion: { version } };
  // new-version → ContentVersion { key, version }.
  const created = JSON.parse(createText || '{}')
  const cmsKey: string = input.existingKey ?? created?.key
  const version: number | string | undefined = created?.initialVersion?.version ?? created?.version
  if (!cmsKey || version == null) {
    return { action, status: createRes.status, body: `created but missing key/version: ${createText}`, cmsKey }
  }

  // 2. Apply the content via JSON Merge Patch on the draft version. skip-validation
  // references lets the federated graph:cmp_PublicImageAsset reference be set on
  // featuredImage (a contentReference whose allowedTypes is ['_image']).
  const patchRes = await fetch(`${API}/content/${cmsKey}/versions/${version}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/merge-patch+json', ...SKIP_REF_VALIDATION },
    body: JSON.stringify({ properties: input.properties }),
  })
  return { action, status: patchRes.status, body: await patchRes.text(), cmsKey }
}
