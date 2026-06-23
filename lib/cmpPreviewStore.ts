// ─── CMP preview delivery store ─────────────────────────────────────────────
//
// Shared between the webhook handler (writes) and the render page (reads).
//
// Durable backend: Vercel KV / Upstash Redis via its REST API (plain fetch — no
// SDK dependency). This is REQUIRED for the production CMP flow: CMP caches the
// completed preview URL and fetches it later, on a possibly-different serverless
// instance, so the content must outlive the request that captured it.
//
// Falls back to an in-memory store (held on globalThis to survive dev HMR) when
// no KV env vars are present — fine for `yarn dev` and capture/inspect, but not
// durable on Vercel. Provision Vercel KV and the code lights up automatically.
//
// Recognised env vars (either naming works):
//   KV_REST_API_URL   / KV_REST_API_TOKEN          (Vercel KV integration)
//   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (Upstash marketplace)

export type CmpDelivery = {
  receivedAt: string
  meta: Record<string, unknown>
  payload: unknown
}

const TTL_SECONDS = 86_400 // previews are ephemeral — expire after a day
const keyFor = (previewId: string) => `cmp:preview:${previewId}`
const LATEST_KEY = 'cmp:preview:latest'

// ── KV (Upstash REST) ────────────────────────────────────────────────────────

function kvConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? { url, token } : null
}

// Runs a single Redis command via the Upstash REST endpoint, which accepts the
// command as a JSON array body and replies { result }.
async function kvCommand(args: (string | number)[]): Promise<unknown> {
  const cfg = kvConfig()
  if (!cfg) return null
  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`KV ${String(args[0])} failed: ${res.status} ${await res.text()}`)
  const json = (await res.json()) as { result?: unknown }
  return json.result ?? null
}

// ── In-memory fallback ─────────────────────────────────────────────────────────

type MemStore = { latest: CmpDelivery | null; byPreviewId: Map<string, CmpDelivery> }
const globalRef = globalThis as unknown as { __cmpPreviewMemStore?: MemStore }
const mem: MemStore =
  globalRef.__cmpPreviewMemStore ??
  (globalRef.__cmpPreviewMemStore = { latest: null, byPreviewId: new Map() })

// ── Public API ───────────────────────────────────────────────────────────────

export async function putDelivery(delivery: CmpDelivery, previewId?: string): Promise<void> {
  if (kvConfig()) {
    const value = JSON.stringify(delivery)
    await kvCommand(['SET', LATEST_KEY, value, 'EX', TTL_SECONDS])
    if (previewId) await kvCommand(['SET', keyFor(previewId), value, 'EX', TTL_SECONDS])
    return
  }
  mem.latest = delivery
  if (previewId) mem.byPreviewId.set(previewId, delivery)
}

export async function getLatestDelivery(): Promise<CmpDelivery | null> {
  if (kvConfig()) {
    const raw = await kvCommand(['GET', LATEST_KEY])
    return typeof raw === 'string' ? (JSON.parse(raw) as CmpDelivery) : null
  }
  return mem.latest
}

export async function getDeliveryByPreviewId(previewId: string): Promise<CmpDelivery | null> {
  if (kvConfig()) {
    const raw = await kvCommand(['GET', keyFor(previewId)])
    return typeof raw === 'string' ? (JSON.parse(raw) as CmpDelivery) : null
  }
  return mem.byPreviewId.get(previewId) ?? null
}

/** True when a durable KV backend is configured (vs. the in-memory fallback). */
export function previewStoreIsDurable(): boolean {
  return kvConfig() !== null
}

// ── Publish-event capture (phase 4) ─────────────────────────────────────────
// Latest-only capture of the CMP publish webhook, so /api/cmp-publish can be
// inspected via GET while we learn the payload shape. Separate key from the
// preview deliveries above.
const PUBLISH_LATEST_KEY = 'cmp:publish:latest'
let memPublishLatest: CmpDelivery | null = null

export async function putPublishDelivery(delivery: CmpDelivery): Promise<void> {
  if (kvConfig()) {
    await kvCommand(['SET', PUBLISH_LATEST_KEY, JSON.stringify(delivery), 'EX', TTL_SECONDS])
    return
  }
  memPublishLatest = delivery
}

export async function getLatestPublishDelivery(): Promise<CmpDelivery | null> {
  if (kvConfig()) {
    const raw = await kvCommand(['GET', PUBLISH_LATEST_KEY])
    return typeof raw === 'string' ? (JSON.parse(raw) as CmpDelivery) : null
  }
  return memPublishLatest
}

// ── CMP content_guid → CMS content key mapping (phase 4 idempotency) ─────────
// The CMS assigns its own key on create (client-supplied keys are forbidden), so
// we persist content_guid → CMS key to update the same page on re-publish.
const mapKey = (contentGuid: string) => `cmp:blog:map:${contentGuid}`
const memBlogMap = new Map<string, string>()

export async function getMappedCmsKey(contentGuid: string): Promise<string | null> {
  if (kvConfig()) {
    const raw = await kvCommand(['GET', mapKey(contentGuid)])
    return typeof raw === 'string' ? raw : null
  }
  return memBlogMap.get(contentGuid) ?? null
}

export async function setMappedCmsKey(contentGuid: string, cmsKey: string): Promise<void> {
  if (kvConfig()) {
    await kvCommand(['SET', mapKey(contentGuid), cmsKey])
    return
  }
  memBlogMap.set(contentGuid, cmsKey)
}
