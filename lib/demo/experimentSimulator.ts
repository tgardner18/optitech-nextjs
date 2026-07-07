/**
 * Experiment Simulator — Optimizely Event API direct ingestion (dynamic).
 * ─────────────────────────────────────────────────────────────────────────
 * Posts synthetic decisions + conversion events straight to
 *   POST https://logx.optimizely.com/v1/events
 * for ANY Web Experimentation A/B test the operator selects. The experiment
 * IDs come from the REST API (see lib/optimizely/rest.ts → ExperimentBlueprint)
 * and the per-step conversion behaviour is configured in the funnel editor.
 *
 * This is a generalized port of the original Brightstream-specific simulator:
 *   • N variations (assigned by weight), not just control/variant_b
 *   • the funnel is the experiment's own ordered metric events, each with a
 *     per-variation continuation rate supplied by the operator
 *   • account/project/campaign/experiment/variation/event ids are all dynamic
 *
 * Event API conventions (docs.developers.optimizely.com):
 *   • decision.campaign_id  == experiment layer_id
 *   • campaign_activated event.entity_id == decision.campaign_id, type
 *     "campaign_activated" (the impression; fired for every visitor)
 *   • conversion event.entity_id == the event catalog `id`
 *   • enrich_decisions:true — Optimizely links later conversions to the prior
 *     decision by visitor_id; a fresh uuid per event is required (dedup key)
 *   • send X-Optimizely-Strict:true so malformed payloads 4xx instead of 204
 *
 * Anti-SRM design: variation assignment is a per-visitor weighted draw (never
 * an exact even split), and the visitor count is jittered ±3% so a report
 * never reads as a round number.
 */

const ENDPOINT = 'https://logx.optimizely.com/v1/events'
const COUNT_JITTER = 0.03

// ─── Blueprint (mirrors lib/optimizely/rest.ts, duplicated to keep this file
//     importable from client components without pulling in `server-only`) ────

export interface SimVariation {
  id: string
  name: string
  weight: number
}

export interface SimEvent {
  entityId: string
  key: string
  name: string
}

export interface ExperimentBlueprint {
  accountId: string
  projectId: string
  campaignId: string
  experimentId: string
  name: string
  variations: SimVariation[]
  events: SimEvent[]
}

/** One funnel step: an event + the per-variation probability it fires, given
 *  the previous step fired. Keyed by variation id. */
export interface FunnelStep {
  entityId: string
  key: string
  name: string
  /** variationId → continuation rate (0..1) */
  rates: Record<string, number>
}

export interface ExpSimConfig {
  blueprint: ExperimentBlueprint
  funnel: FunnelStep[]
  totalUsers: number
  batchSize?: number
  batchDelayMs?: number
  onProgress?: (p: ExpSimProgress) => void
  onLog?: (entry: ExpSimLogEntry) => void
  shouldAbort?: () => boolean
}

export interface ExpSimProgress {
  completed: number
  total: number
  percent: number
  errors: number
  /** variationId → visitors assigned so far */
  variationCounts: Record<string, number>
  /** total passes per funnel step (index-aligned with config.funnel) */
  stepCounts: number[]
}

export interface ExpSimLogEntry {
  type: 'info' | 'success' | 'warn' | 'error'
  message: string
}

export interface VariationResult {
  id: string
  name: string
  assigned: number
  /** passed the final funnel step */
  converted: number
  conversionRate: number
}

export interface ExpSimResult {
  targetTotal: number
  actualTotal: number
  variations: VariationResult[]
  /** best variation conversion rate ÷ first (baseline) variation rate */
  liftRatio: number
  errors: number
  durationMs: number
  aborted: boolean
}

export interface ExpExpectedOutcomes {
  targetVisitors: number
  jitterRange: [number, number]
  perVariation: { id: string; name: string; approxShare: number; endToEndRate: number }[]
  liftRatio: number
  estimatedDurationSec: number
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/** Optimizely visitor ids are 32-hex strings (no dashes). */
function makeVisitorId(): string {
  return uuid().replace(/-/g, '')
}

function jitterCount(target: number): number {
  const noise = (Math.random() - 0.5) * 2 * COUNT_JITTER
  return Math.max(1, Math.round(target * (1 + noise)))
}

function jitterRange(target: number): [number, number] {
  return [Math.round(target * (1 - COUNT_JITTER)), Math.round(target * (1 + COUNT_JITTER))]
}

/** Weighted per-visitor variation draw. Falls back to uniform if weights sum
 *  to 0. Natural variance keeps the split SRM-safe (never an exact even split). */
function makeVariationPicker(variations: SimVariation[]): () => SimVariation {
  const total = variations.reduce((s, v) => s + (v.weight > 0 ? v.weight : 0), 0)
  if (total <= 0) {
    return () => variations[Math.floor(Math.random() * variations.length)]
  }
  const cumulative: number[] = []
  let acc = 0
  for (const v of variations) {
    acc += v.weight > 0 ? v.weight : 0
    cumulative.push(acc)
  }
  return () => {
    const r = Math.random() * total
    for (let i = 0; i < cumulative.length; i++) {
      if (r < cumulative[i]) return variations[i]
    }
    return variations[variations.length - 1]
  }
}

// ─── Event API payload construction ────────────────────────────────────────

interface EventApiEvent {
  entity_id: string
  key?: string
  timestamp: number
  type: 'campaign_activated' | 'other'
  uuid: string
}

interface EventApiDecision {
  campaign_id: string
  experiment_id: string
  variation_id: string
  is_campaign_holdback: boolean
}

interface EventApiVisitor {
  visitor_id: string
  attributes: unknown[]
  snapshots: { decisions: EventApiDecision[]; events: EventApiEvent[] }[]
}

interface EventApiPayload {
  account_id: string
  project_id?: string
  anonymize_ip: boolean
  client_name: string
  client_version: string
  enrich_decisions: boolean
  visitors: EventApiVisitor[]
}

interface SimVisitor {
  visitorId: string
  variation: SimVariation
  /** index-aligned with funnel: did this visitor pass step i? */
  passed: boolean[]
}

function makeVisitor(pick: () => SimVariation, funnel: FunnelStep[]): SimVisitor {
  const variation = pick()
  const passed: boolean[] = []
  let alive = true
  for (const step of funnel) {
    const rate = step.rates[variation.id] ?? 0
    alive = alive && Math.random() < rate
    passed.push(alive)
  }
  return { visitorId: makeVisitorId(), variation, passed }
}

function buildVisitorPayload(
  v: SimVisitor,
  blueprint: ExperimentBlueprint,
  funnel: FunnelStep[],
  baseTimestamp: number,
): EventApiVisitor {
  const stepMs = 60_000
  let ts = baseTimestamp

  const events: EventApiEvent[] = [
    // Impression / decision marker — every visitor.
    {
      entity_id: blueprint.campaignId,
      timestamp: ts,
      type: 'campaign_activated',
      uuid: uuid(),
    },
  ]

  funnel.forEach((step, i) => {
    if (!v.passed[i]) return
    ts += stepMs
    events.push({
      entity_id: step.entityId,
      key: step.key,
      timestamp: ts,
      type: 'other',
      uuid: uuid(),
    })
  })

  return {
    visitor_id: v.visitorId,
    attributes: [],
    snapshots: [
      {
        decisions: [
          {
            campaign_id: blueprint.campaignId,
            experiment_id: blueprint.experimentId,
            variation_id: v.variation.id,
            is_campaign_holdback: false,
          },
        ],
        events,
      },
    ],
  }
}

function buildBatchPayload(
  batch: SimVisitor[],
  blueprint: ExperimentBlueprint,
  funnel: FunnelStep[],
): EventApiPayload {
  // Spread visitors over a ~30-minute window so sessions don't share a second.
  const windowMs = 30 * 60 * 1000
  const now = Date.now()

  return {
    account_id: blueprint.accountId,
    ...(blueprint.projectId ? { project_id: blueprint.projectId } : {}),
    anonymize_ip: true,
    client_name: 'optitech-demo-simulator',
    client_version: '1.0.0',
    enrich_decisions: true,
    visitors: batch.map((v) => {
      const offset = Math.floor(Math.random() * windowMs)
      return buildVisitorPayload(v, blueprint, funnel, now - windowMs + offset)
    }),
  }
}

async function postBatch(payload: EventApiPayload): Promise<void> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Optimizely-Strict': 'true',
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Event API ${res.status}: ${body.slice(0, 200)}`)
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

/** End-to-end conversion rate for a variation = product of its per-step rates. */
function endToEnd(variationId: string, funnel: FunnelStep[]): number {
  if (funnel.length === 0) return 0
  return funnel.reduce((p, step) => p * (step.rates[variationId] ?? 0), 1)
}

export function expectedOutcomes(
  cfg: Pick<ExpSimConfig, 'blueprint' | 'funnel' | 'totalUsers' | 'batchSize' | 'batchDelayMs'>,
): ExpExpectedOutcomes {
  const target = Math.max(0, cfg.totalUsers ?? 0)
  const [lo, hi] = jitterRange(target)
  const batchSize = cfg.batchSize ?? 25
  const batchDelay = cfg.batchDelayMs ?? 60

  const weightTotal = cfg.blueprint.variations.reduce((s, v) => s + (v.weight > 0 ? v.weight : 0), 0)
  const perVariation = cfg.blueprint.variations.map((v) => ({
    id: v.id,
    name: v.name,
    approxShare: weightTotal > 0
      ? (v.weight > 0 ? v.weight : 0) / weightTotal
      : 1 / Math.max(1, cfg.blueprint.variations.length),
    endToEndRate: endToEnd(v.id, cfg.funnel),
  }))

  const rates = perVariation.map((p) => p.endToEndRate)
  const baseline = rates[0] ?? 0
  const best = rates.length ? Math.max(...rates) : 0
  const lift = baseline > 0 ? best / baseline : 0

  const batches = Math.ceil(target / batchSize)
  const estDurationMs = batches * (150 + batchDelay)

  return {
    targetVisitors: target,
    jitterRange: [lo, hi],
    perVariation,
    liftRatio: lift,
    estimatedDurationSec: Math.max(1, Math.round(estDurationMs / 1000)),
  }
}

export async function runExperimentSimulation(config: ExpSimConfig): Promise<ExpSimResult> {
  const { blueprint, funnel } = config
  const batchSize = Math.max(1, config.batchSize ?? 25)
  const batchDelayMs = Math.max(0, config.batchDelayMs ?? 60)
  const start = Date.now()
  const log = (entry: ExpSimLogEntry) => config.onLog?.(entry)

  const target = config.totalUsers
  const actual = jitterCount(target)
  const pick = makeVariationPicker(blueprint.variations)

  log({ type: 'info', message: `Experiment: ${blueprint.name} (${blueprint.experimentId})` })
  log({ type: 'info', message: `Target ${target.toLocaleString()} → simulating ${actual.toLocaleString()} visitors (±3% jitter)` })
  log({ type: 'info', message: `Endpoint: ${ENDPOINT} · account ${blueprint.accountId} · campaign ${blueprint.campaignId}` })

  const visitors: SimVisitor[] = Array.from({ length: actual }, () => makeVisitor(pick, funnel))

  const variationCounts: Record<string, number> = Object.fromEntries(
    blueprint.variations.map((v) => [v.id, 0]),
  )
  const stepCounts = funnel.map(() => 0)
  const progress: ExpSimProgress = {
    completed: 0,
    total: actual,
    percent: 0,
    errors: 0,
    variationCounts,
    stepCounts,
  }

  let aborted = false

  for (let i = 0; i < visitors.length; i += batchSize) {
    if (config.shouldAbort?.()) {
      aborted = true
      log({ type: 'warn', message: `Aborted at visitor ${i}/${visitors.length}` })
      break
    }

    const batch = visitors.slice(i, i + batchSize)
    const payload = buildBatchPayload(batch, blueprint, funnel)

    try {
      await postBatch(payload)
      for (const v of batch) {
        progress.variationCounts[v.variation.id] = (progress.variationCounts[v.variation.id] ?? 0) + 1
        v.passed.forEach((ok, si) => {
          if (ok) progress.stepCounts[si]++
        })
      }
    } catch (err) {
      progress.errors += batch.length
      log({ type: 'error', message: `Batch ${Math.floor(i / batchSize) + 1}: ${err instanceof Error ? err.message : String(err)}` })
    }

    progress.completed = Math.min(i + batch.length, visitors.length)
    progress.percent = Math.round((progress.completed / visitors.length) * 100)
    config.onProgress?.({ ...progress, variationCounts: { ...progress.variationCounts }, stepCounts: [...progress.stepCounts] })

    const batchNum = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(visitors.length / batchSize)
    log({ type: 'info', message: `Batch ${batchNum}/${totalBatches} · ${progress.completed}/${visitors.length}` })

    if (batchDelayMs > 0 && i + batchSize < visitors.length) {
      await sleep(batchDelayMs)
    }
  }

  const lastStep = funnel.length - 1
  const variations: VariationResult[] = blueprint.variations.map((v) => {
    const assigned = visitors.filter((u) => u.variation.id === v.id).length
    const converted = lastStep >= 0
      ? visitors.filter((u) => u.variation.id === v.id && u.passed[lastStep]).length
      : 0
    return {
      id: v.id,
      name: v.name,
      assigned,
      converted,
      conversionRate: assigned > 0 ? converted / assigned : 0,
    }
  })

  const baseline = variations[0]?.conversionRate ?? 0
  const best = variations.reduce((m, v) => Math.max(m, v.conversionRate), 0)

  const result: ExpSimResult = {
    targetTotal: target,
    actualTotal: actual,
    variations,
    liftRatio: baseline > 0 ? best / baseline : 0,
    errors: progress.errors,
    durationMs: Date.now() - start,
    aborted,
  }

  log({
    type: aborted ? 'warn' : 'success',
    message: `${aborted ? 'Aborted' : 'Complete'} in ${(result.durationMs / 1000).toFixed(1)}s · ${result.liftRatio.toFixed(2)}× lift · ${result.errors} errors`,
  })

  return result
}
