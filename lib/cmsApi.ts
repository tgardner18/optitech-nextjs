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

// Enabled CMS locales, cached. The CMS rejects content created with a locale
// that hasn't been provisioned (e.g. CMP emits en_US → en-US, but the instance
// only has en/fr/es enabled), so we resolve incoming tags against this set.
let cachedLocales: { locales: string[]; expiresAt: number } | null = null

async function getEnabledCmsLocales(token: string): Promise<string[]> {
  const now = Date.now()
  if (cachedLocales && cachedLocales.expiresAt > now) return cachedLocales.locales
  const res = await fetch(`${API}/locales`, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) return [] // resolver falls back to the original tag on failure
  const page = (await res.json()) as { items?: Array<{ key?: string; isEnabled?: boolean }> }
  const locales = (page.items ?? []).filter((i) => i.isEnabled && i.key).map((i) => i.key as string)
  cachedLocales = { locales, expiresAt: now + 10 * 60_000 }
  return locales
}

// Resolve a BCP-47 tag to a locale that actually exists & is enabled in the CMS.
// Exact match wins; otherwise fall back to a same-language locale (en-US → en),
// then to en, then to the first enabled locale. Returns the original tag if the
// locale list can't be fetched (let the CMS produce its own error).
export async function resolveCmsLocale(locale: string, token: string): Promise<string> {
  const enabled = await getEnabledCmsLocales(token)
  if (enabled.length === 0) return locale
  if (enabled.includes(locale)) return locale
  const lang = locale.split('-')[0].toLowerCase()
  return enabled.find((l) => l.toLowerCase() === lang)
    ?? enabled.find((l) => l.split('-')[0].toLowerCase() === lang)
    ?? (enabled.includes('en') ? 'en' : enabled[0])
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

// Returns the draft version number for a content key + locale (the version a
// fresh create produced), used because create's 201 carries no version.
//
// The version listing is eventually consistent: immediately after create it can
// come back empty, in which case the caller would skip the property patch and
// leave a title-only draft. So retry with a short backoff until the version
// shows up (typically the first attempt, occasionally the second).
async function getDraftVersion(key: string, locale: string, token: string): Promise<string | undefined> {
  const delaysMs = [0, 250, 500, 1000, 2000]
  for (const delay of delaysMs) {
    if (delay) await new Promise((r) => setTimeout(r, delay))
    const res = await fetch(`${API}/content/${key}/versions`, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) continue
    const page = (await res.json()) as { items?: Array<{ version?: string; status?: string; locale?: string }> }
    const items = page.items ?? []
    const draft = items.find((i) => i.status === 'draft' && i.locale === locale) ?? items.find((i) => i.status === 'draft') ?? items[0]
    if (draft?.version) return draft.version
  }
  return undefined
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

  // Map the incoming tag onto a locale the instance actually has enabled
  // (e.g. CMP's en-US → en), so create doesn't 400 on an unprovisioned locale.
  input = { ...input, locale: await resolveCmsLocale(input.locale, token) }

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

  if (!createRes.ok) {
    return { action, status: createRes.status, body: await createRes.text() }
  }

  // Both create and new-version return 201 with an empty body; the resource is
  // in the Location header:
  //   create      → .../content/{key}
  //   new-version → .../content/{key}/versions/{version}
  const location = createRes.headers.get('location') ?? ''
  const m = location.match(/\/content\/([^/?]+)(?:\/versions\/([^/?]+))?/)
  const cmsKey = input.existingKey ?? m?.[1]
  let version = m?.[2]

  if (!cmsKey) {
    // 500: create reported success but we can't locate the item to patch.
    return { action, status: 500, body: `created but no key in Location: ${location}` }
  }
  // Create gives no version in Location — look up the draft version to patch.
  if (!version) {
    version = await getDraftVersion(cmsKey, input.locale, token)
  }
  if (!version) {
    // The draft exists (title set) but we never found a version to patch, so the
    // properties would be skipped — surface this as an error rather than a silent
    // 201, otherwise the caller logs a title-only draft as a successful publish.
    return { action, status: 500, body: `created (${cmsKey}) but no draft version found — properties not applied`, cmsKey }
  }

  // 2. Apply the content via JSON Merge Patch on the draft version. skip-validation
  // references lets the federated graph:cmp_PublicImageAsset reference be set on
  // featuredImage (a contentReference whose allowedTypes is ['_image']).
  // The v1 API represents each property value as a PropertyData object
  // ({ value: … }), not a bare value. Most types take the bare value; richText
  // (body) takes an { html } object. Drop undefineds.
  const propertyData: Record<string, { value: unknown }> = {}
  for (const [k, v] of Object.entries(input.properties)) {
    if (v === undefined) continue
    propertyData[k] = { value: k === 'body' ? { html: v } : v }
  }

  const patchRes = await fetch(`${API}/content/${cmsKey}/versions/${version}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/merge-patch+json', ...SKIP_REF_VALIDATION },
    body: JSON.stringify({ properties: propertyData }),
  })
  return { action, status: patchRes.status, body: await patchRes.text(), cmsKey }
}
