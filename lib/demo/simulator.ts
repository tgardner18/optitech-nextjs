/**
 * Traffic Simulator
 * ─────────────────────────────────────────────────────────────────────────
 * Fires synthetic ODP events through an operator-defined funnel so a demo has
 * credible volume. The operator builds a 1–5 step funnel from a connected
 * Optimizely project's events (see components/admin/TrafficSimulator.tsx);
 * each visitor is identified in ODP via `zaius.customer()` and then walks the
 * funnel, firing events through the same `trackConversion()` path the real UI
 * uses (FX → ODP).
 *
 * Funnel model (per-step continuation):
 *   • Step 1 fires for every simulated visitor (the entry event).
 *   • Each later step has a continuation rate — the fraction of the PREVIOUS
 *     step's visitors who advance. Once a visitor drops off, they fire no
 *     further steps.
 *
 * BigQuery sync is optional and off by default.
 */
import { trackConversion } from '@/lib/fx/track'
import { syncRandomUserToBigQuery } from '@/lib/bq/sync'
import type { DemoAccount } from '@/lib/demo/personas'
import type { RandomUserProfile } from '@/lib/demo/randomUser'

export type SimAccountType = 'personal' | 'business'

/** One funnel step. `rate` is the continuation fraction (0..1) vs the previous
 *  step; it is ignored for the first step, which always fires. */
export interface TrafficFunnelStep {
  eventKey: string
  name: string
  rate: number
}

export interface SimUser {
  customerId: string
  email: string
  firstName: string
  lastName: string
  accountType: SimAccountType
  /** index-aligned with the funnel: did this visitor fire step i? */
  fired: boolean[]
}

export interface SimConfig {
  funnel: TrafficFunnelStep[]
  totalUsers: number
  /** Delay between events within one user journey, ms (default 80) */
  eventDelayMs?: number
  /** Delay between users, ms (default 40) */
  userDelayMs?: number
  /** Also write each fake user to BigQuery (default false) */
  syncToBigQuery?: boolean
  onProgress?: (p: SimProgress) => void
  onLog?: (entry: SimLogEntry) => void
  shouldAbort?: () => boolean
}

export interface SimProgress {
  completed: number
  total: number
  percent: number
  /** fires per funnel step (index-aligned with config.funnel) */
  stepCounts: number[]
  errors: number
}

export interface SimLogEntry {
  type: 'info' | 'success' | 'warn' | 'error'
  message: string
}

export interface SimResult {
  totalSimulated: number
  stepCounts: number[]
  /** last step fires ÷ total simulated */
  conversionRate: number
  errors: number
  durationMs: number
  aborted: boolean
}

export interface ExpectedOutcomes {
  totalVisitors: number
  /** approximate fires per step (cumulative product of rates) */
  perStep: { name: string; approx: number }[]
  conversionRate: number
  estimatedDurationSec: number
}

const DEFAULTS = { eventDelayMs: 80, userDelayMs: 40 }

const FIRST_NAMES = [
  'James', 'Emma', 'Oliver', 'Ava', 'William', 'Sophia', 'Benjamin', 'Isabella',
  'Lucas', 'Mia', 'Henry', 'Charlotte', 'Alexander', 'Amelia', 'Mason', 'Harper',
  'Ethan', 'Evelyn', 'Daniel', 'Abigail', 'Michael', 'Emily', 'Matthew', 'Elizabeth',
  'Joseph', 'Sofia', 'Samuel', 'Avery', 'David', 'Ella', 'Carter', 'Scarlett',
  'Owen', 'Grace', 'Wyatt', 'Chloe', 'John', 'Victoria', 'Jack', 'Riley',
  'Liam', 'Aria', 'Sebastian', 'Lily', 'Julian', 'Aurora', 'Ezra', 'Zoey',
]

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen',
  'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera',
]

const STATES = ['California', 'Texas', 'Florida', 'New York', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia']
const CITIES = ['Springfield', 'Franklin', 'Clinton', 'Madison', 'Georgetown', 'Arlington', 'Salem', 'Fairview']

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

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

function makeUser(index: number, funnel: TrafficFunnelStep[]): SimUser {
  const first = pick(FIRST_NAMES)
  const last = pick(LAST_NAMES)
  const accountType: SimAccountType = Math.random() < 0.75 ? 'personal' : 'business'

  // Step-gated funnel: step 0 always fires; each later step is a coin flip
  // against its continuation rate, and a drop-off halts the rest.
  const fired: boolean[] = []
  let alive = true
  funnel.forEach((step, i) => {
    if (i === 0) {
      alive = true
    } else {
      alive = alive && Math.random() < step.rate
    }
    fired.push(alive)
  })

  return {
    customerId: `sim-${uuid()}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}.${index}@demo-sim.test`,
    firstName: first,
    lastName: last,
    accountType,
    fired,
  }
}

/** Identify a simulated visitor in ODP via zaius.customer(). No-op if the ODP
 *  snippet (window.zaius) isn't present. */
function identifySimUser(user: SimUser): void {
  if (typeof window === 'undefined' || !window.zaius) return

  window.zaius.customer(
    { customer_id: user.customerId, email: user.email },
    {
      first_name: user.firstName,
      last_name: user.lastName,
      state: pick(STATES),
      city: pick(CITIES),
      country: 'United States',
      customertype: user.accountType === 'personal' ? 'Personal' : 'Business',
      demo_user: true,
      signup_source: 'simulator',
    },
  )
}

async function runUserJourney(user: SimUser, funnel: TrafficFunnelStep[], eventDelayMs: number): Promise<void> {
  identifySimUser(user)
  await sleep(eventDelayMs)

  for (let i = 0; i < funnel.length; i++) {
    if (!user.fired[i]) break // drop-off — no further steps fire
    trackConversion(funnel[i].eventKey, { simulator: true, funnel_step: i + 1 })
    await sleep(eventDelayMs)
  }
}

function toRandomUserProfile(user: SimUser): RandomUserProfile {
  return {
    gender: Math.random() > 0.5 ? 'male' : 'female',
    name: { title: '', first: user.firstName, last: user.lastName },
    email: user.email,
    phone: '',
    cell: '',
    picture: { large: '', medium: '', thumbnail: '' },
    location: {
      street: { number: 0, name: '' },
      city: pick(CITIES),
      state: pick(STATES),
      country: 'United States',
      postcode: '00000',
    },
    dob: { date: '1985-01-01T00:00:00.000Z', age: 40 },
    login: { uuid: user.customerId.replace(/^sim-/, ''), username: user.email },
  }
}

const EMPTY_ACCOUNTS: DemoAccount[] = []

export function expectedOutcomes(
  cfg: Pick<SimConfig, 'funnel' | 'totalUsers' | 'eventDelayMs' | 'userDelayMs'>,
): ExpectedOutcomes {
  const total = Math.max(0, cfg.totalUsers ?? 0)
  const eventDelay = cfg.eventDelayMs ?? DEFAULTS.eventDelayMs
  const userDelay = cfg.userDelayMs ?? DEFAULTS.userDelayMs

  let cumulative = 1
  const perStep = cfg.funnel.map((step, i) => {
    cumulative = i === 0 ? 1 : cumulative * step.rate
    return { name: step.name, approx: Math.round(total * cumulative) }
  })

  const conversionRate = perStep.length ? (perStep[perStep.length - 1].approx / (total || 1)) : 0
  // ~1 event per fired step; approximate avg events/user by summing the
  // cumulative continuation product across steps.
  const avgEventsPerUser = perStep.reduce((s, p) => s + p.approx / (total || 1), 0)
  const estDurationMs = total * (avgEventsPerUser * eventDelay + userDelay)

  return {
    totalVisitors: total,
    perStep,
    conversionRate,
    estimatedDurationSec: Math.max(1, Math.round(estDurationMs / 1000)),
  }
}

export async function runSimulation(config: SimConfig): Promise<SimResult> {
  const funnel = config.funnel
  const eventDelayMs = config.eventDelayMs ?? DEFAULTS.eventDelayMs
  const userDelayMs = config.userDelayMs ?? DEFAULTS.userDelayMs
  const start = Date.now()
  const log = (entry: SimLogEntry) => config.onLog?.(entry)

  if (funnel.length === 0) {
    throw new Error('Build a funnel of at least one event before running.')
  }

  const users: SimUser[] = Array.from({ length: config.totalUsers }, (_, i) => makeUser(i, funnel))

  log({ type: 'info', message: `Simulating ${config.totalUsers} visitors through a ${funnel.length}-step funnel: ${funnel.map((f) => f.name).join(' → ')}` })
  if (typeof window !== 'undefined' && !window.zaius) {
    log({ type: 'warn', message: 'ODP (window.zaius) not detected — identify/track calls will no-op. Check the ODP snippet is configured for this site.' })
  }
  if (config.syncToBigQuery) {
    log({ type: 'warn', message: 'BigQuery sync enabled — each user will be written to BQ' })
  }

  const progress: SimProgress = {
    completed: 0,
    total: config.totalUsers,
    percent: 0,
    stepCounts: funnel.map(() => 0),
    errors: 0,
  }

  let aborted = false

  for (let i = 0; i < users.length; i++) {
    if (config.shouldAbort?.()) {
      aborted = true
      log({ type: 'warn', message: `Aborted at user ${i}/${users.length}` })
      break
    }

    const user = users[i]
    try {
      await runUserJourney(user, funnel, eventDelayMs)
      user.fired.forEach((ok, si) => {
        if (ok) progress.stepCounts[si]++
      })

      if (config.syncToBigQuery) {
        syncRandomUserToBigQuery(toRandomUserProfile(user), user.accountType, EMPTY_ACCOUNTS, 'register')
      }
    } catch (err) {
      progress.errors++
      log({ type: 'error', message: `User ${user.customerId}: ${err instanceof Error ? err.message : String(err)}` })
    }

    progress.completed = i + 1
    progress.percent = Math.round(((i + 1) / users.length) * 100)
    config.onProgress?.({ ...progress, stepCounts: [...progress.stepCounts] })

    const logEvery = Math.max(1, Math.min(25, Math.floor(users.length / 20)))
    if ((i + 1) % logEvery === 0 || i === users.length - 1) {
      log({
        type: 'info',
        message: `${i + 1}/${users.length} · ${funnel.map((f, si) => `${f.name} ${progress.stepCounts[si]}`).join(' · ')}`,
      })
    }

    if (userDelayMs > 0) await sleep(userDelayMs)
  }

  const lastStep = funnel.length - 1
  const result: SimResult = {
    totalSimulated: progress.completed,
    stepCounts: [...progress.stepCounts],
    conversionRate: progress.completed > 0 ? progress.stepCounts[lastStep] / progress.completed : 0,
    errors: progress.errors,
    durationMs: Date.now() - start,
    aborted,
  }

  log({
    type: aborted ? 'warn' : 'success',
    message: `${aborted ? 'Aborted' : 'Complete'} in ${(result.durationMs / 1000).toFixed(1)}s · ${progress.stepCounts[lastStep]} reached "${funnel[lastStep].name}" (${(result.conversionRate * 100).toFixed(1)}%)`,
  })

  return result
}
