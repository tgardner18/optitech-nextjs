/**
 * Server-only Optimizely REST API v2 client.
 * ─────────────────────────────────────────────────────────────────────────
 * Used by the Experiment Simulator to dynamically list the operator's Web
 * Experimentation projects/experiments and assemble the IDs the Event API
 * needs. The token is a server secret (OPTIMIZELY_REST_API_TOKEN) and MUST
 * NOT be sent to the browser — every call site is a server route that returns
 * only the derived data.
 *
 * API reference (docs.developers.optimizely.com):
 *   Base:   https://api.optimizely.com/v2
 *   Auth:   Authorization: Bearer <token>   (wrong token → 403, missing → 401)
 *   Paging: page/per_page query params + a `LINK` response header (rel="next")
 */
import 'server-only'
import { cache } from 'react'

const BASE = 'https://api.optimizely.com/v2'
const PER_PAGE = 100

export class OptimizelyRestError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'OptimizelyRestError'
  }
}

/** True when the server has a REST token configured. Routes 503 when false. */
export function isRestConfigured(): boolean {
  return Boolean(process.env.OPTIMIZELY_REST_API_TOKEN)
}

function token(): string {
  const t = process.env.OPTIMIZELY_REST_API_TOKEN
  if (!t) {
    throw new OptimizelyRestError(
      503,
      'OPTIMIZELY_REST_API_TOKEN is not configured on the server.',
    )
  }
  return t
}

function humanError(status: number, body: string): string {
  switch (status) {
    case 401: return 'Optimizely REST API: unauthorized (401) — token missing or malformed.'
    case 403: return 'Optimizely REST API: authentication failed (403) — invalid or unauthorized token.'
    case 404: return 'Optimizely REST API: not found (404).'
    case 429: return 'Optimizely REST API: rate limited (429) — try again shortly.'
    default:  return `Optimizely REST API error ${status}: ${body.slice(0, 200)}`
  }
}

/** Parse a Link header, return the URL for rel="next" if present. */
function nextLink(header: string | null): string | null {
  if (!header) return null
  for (const part of header.split(',')) {
    const m = part.match(/<([^>]+)>\s*;\s*rel="?next"?/)
    if (m) return m[1]
  }
  return null
}

async function getJson<T>(url: string): Promise<{ data: T; linkHeader: string | null }> {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: 'application/json',
    },
    // These calls run in server routes; never cache credentialed responses.
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new OptimizelyRestError(res.status, humanError(res.status, body))
  }

  const data = (await res.json()) as T
  return { data, linkHeader: res.headers.get('link') }
}

/** GET a collection endpoint, following LINK rel="next" until exhausted. */
async function getAll<T>(path: string, params: Record<string, string | number> = {}): Promise<T[]> {
  const qs = new URLSearchParams({ per_page: String(PER_PAGE), ...Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ) })
  let url: string | null = `${BASE}${path}?${qs.toString()}`
  const out: T[] = []

  // Bounded to avoid an unexpected infinite paging loop.
  for (let page = 0; url && page < 50; page++) {
    const { data, linkHeader }: { data: T[]; linkHeader: string | null } = await getJson<T[]>(url)
    out.push(...data)
    url = nextLink(linkHeader)
  }
  return out
}

// ─── Raw API shapes (only the fields we consume) ────────────────────────────

export interface OptiProject {
  id: number
  name: string
  account_id: number
  platform?: string
  status?: string
  is_flags_enabled?: boolean
}

interface OptiVariationRaw {
  variation_id?: number
  id?: number
  name: string
  weight?: number
}

interface OptiMetricRaw {
  event_id?: number
  aggregator?: string
  field?: string
  scope?: string
}

export interface OptiExperiment {
  id: number
  name: string
  status?: string
  campaign_id?: number
  layer_id?: number
  project_id?: number
  type?: string
}

interface OptiExperimentDetail extends OptiExperiment {
  variations?: OptiVariationRaw[]
  metrics?: OptiMetricRaw[]
  account_id?: number
}

interface OptiEvent {
  id: number
  key: string
  name: string
  event_type?: string
  project_id?: number
  archived?: boolean
}

// ─── Derived shapes returned to the browser ─────────────────────────────────

export interface ProjectSummary {
  id: string
  name: string
  accountId: string
  /** 'fx' = Feature Experimentation (flags), 'web' = Web Experimentation. */
  type: 'web' | 'fx'
}

export interface ExperimentSummary {
  id: string
  name: string
  status: string
}

export interface EventSummary {
  /** Event catalog id — this is the Event API `entity_id`. */
  id: string
  key: string
  name: string
}

export interface BlueprintVariation {
  id: string
  name: string
  weight: number
}

export interface BlueprintEvent {
  entityId: string
  key: string
  name: string
}

/**
 * Everything the Event API payload needs for one experiment, assembled from
 * the experiment detail + the project's event catalog.
 */
export interface ExperimentBlueprint {
  accountId: string
  projectId: string
  campaignId: string   // == experiment layer_id (Event API decision.campaign_id)
  experimentId: string
  name: string
  variations: BlueprintVariation[]
  /** The experiment's metric events, in metric order, resolved to entity ids. */
  events: BlueprintEvent[]
}

// ─── Web vs Feature Experimentation ─────────────────────────────────────────

/**
 * The v2 API is shared by Web and Feature Experimentation. The Event API
 * `campaign_activated` convention (Experiment Simulator) is Web-only, so that
 * path filters to Web projects. Feature Experimentation projects report
 * `is_flags_enabled: true`.
 */
function isWebExperimentation(p: OptiProject): boolean {
  if (p.is_flags_enabled === true) return false
  if (p.platform && p.platform !== 'web') return false
  return true
}

function projectType(p: OptiProject): 'web' | 'fx' {
  return isWebExperimentation(p) ? 'web' : 'fx'
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * List projects. Defaults to Web Experimentation projects only (the Experiment
 * Simulator relies on this). Pass `includeFeatureExperimentation: true` to also
 * return FX/flags projects — used by the Traffic Simulator, which fires events
 * by key through ODP/FX and so can use events from any project (e.g. a central
 * FX "Events" project).
 */
export async function listProjects(
  opts: { includeFeatureExperimentation?: boolean } = {},
): Promise<ProjectSummary[]> {
  const projects = await getAll<OptiProject>('/projects')
  return projects
    .filter((p) => opts.includeFeatureExperimentation || isWebExperimentation(p))
    .map((p) => ({
      id: String(p.id),
      name: p.name,
      accountId: String(p.account_id),
      type: projectType(p),
    }))
}

export async function listExperiments(projectId: string): Promise<ExperimentSummary[]> {
  const experiments = await getAll<OptiExperiment>('/experiments', { project_id: projectId })
  return experiments.map((e) => ({
    id: String(e.id),
    name: e.name,
    status: e.status ?? 'unknown',
  }))
}

/** List a project's (non-archived) events — the catalog the Traffic Simulator
 *  funnel builder drags from. */
export async function listEvents(projectId: string): Promise<EventSummary[]> {
  const catalog = await getAll<OptiEvent>('/events', { project_id: projectId })
  return catalog
    .filter((e) => !e.archived)
    .map((e) => ({ id: String(e.id), key: e.key, name: e.name }))
}

/**
 * Union of events across several projects (deduped by event key). An empty
 * `projectIds` resolves to ALL projects the token sees — including Feature
 * Experimentation projects, so a central FX "Events" project's events are
 * included. Per-project failures are skipped rather than failing the request.
 */
export async function listEventsForProjects(projectIds: string[]): Promise<EventSummary[]> {
  let ids = projectIds
  if (ids.length === 0) {
    ids = (await listProjects({ includeFeatureExperimentation: true })).map((p) => p.id)
  }
  const results = await Promise.all(
    ids.map((id) => listEvents(id).catch(() => [] as EventSummary[])),
  )
  const seen = new Map<string, EventSummary>()
  for (const list of results) {
    for (const e of list) {
      if (!seen.has(e.key)) seen.set(e.key, e)
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Global event catalog keyed by event id, unioned across ALL accessible
 * projects. Event ids are unique across the account, so this resolves a metric's
 * `event_id` even when the event's home is a different project (cross-project
 * events — e.g. a central FX "Events" project). React cache()-wrapped so one
 * request builds it once. Per-project failures are skipped.
 */
const buildEventCatalogById = cache(async (): Promise<Map<string, BlueprintEvent>> => {
  const projects = await listProjects({ includeFeatureExperimentation: true })
  const perProject = await Promise.all(
    projects.map((p) => getAll<OptiEvent>('/events', { project_id: p.id }).catch(() => [] as OptiEvent[])),
  )
  const byId = new Map<string, BlueprintEvent>()
  for (const catalog of perProject) {
    for (const e of catalog) {
      if (e.archived) continue
      const id = String(e.id)
      if (!byId.has(id)) byId.set(id, { entityId: id, key: e.key, name: e.name })
    }
  }
  return byId
})

/**
 * Assemble the full blueprint for one experiment: variation ids/weights, the
 * layer (campaign) id, account/project ids, and the metric events resolved to
 * their entity ids (event `id` from the events catalog).
 */
export async function getExperimentBlueprint(experimentId: string): Promise<ExperimentBlueprint> {
  const { data: exp } = await getJson<OptiExperimentDetail>(
    `${BASE}/experiments/${encodeURIComponent(experimentId)}`,
  )

  const projectId = exp.project_id != null ? String(exp.project_id) : ''
  const campaignId = exp.campaign_id ?? exp.layer_id
  if (campaignId == null) {
    throw new OptimizelyRestError(
      422,
      `Experiment ${experimentId} has no campaign_id/layer_id — cannot map to the Event API.`,
    )
  }

  // account_id may be on the experiment; otherwise resolve from the project.
  let accountId = exp.account_id != null ? String(exp.account_id) : ''
  if (!accountId && projectId) {
    const { data: project } = await getJson<OptiProject>(
      `${BASE}/projects/${encodeURIComponent(projectId)}`,
    )
    accountId = String(project.account_id)
  }

  const variations: BlueprintVariation[] = (exp.variations ?? []).map((v) => ({
    id: String(v.variation_id ?? v.id ?? ''),
    name: v.name,
    weight: typeof v.weight === 'number' ? v.weight : 0,
  })).filter((v) => v.id)

  // Resolve metric event_ids → {entityId, key, name} against the GLOBAL event
  // catalog (unioned across all projects), so metrics that point at
  // cross-project events (e.g. a central FX "Events" project) still resolve.
  // Preserve metric order (funnel ordering matters).
  const events: BlueprintEvent[] = []
  if (exp.metrics?.length) {
    const byId = await buildEventCatalogById()
    for (const m of exp.metrics) {
      if (m.event_id == null) continue
      const ev = byId.get(String(m.event_id))
      if (ev) events.push(ev)
    }
  }

  return {
    accountId,
    projectId,
    campaignId: String(campaignId),
    experimentId: String(exp.id),
    name: exp.name,
    variations,
    events,
  }
}
