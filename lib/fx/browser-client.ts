/**
 * Browser-side Optimizely Feature Experimentation client.
 *
 * Owns:
 *   - FX SDK init in the browser (datafile fetch + createInstance)
 *   - A UserContext bound to the SAME canonical id the server uses
 *     (the `optimizely_user_id` cookie minted by proxy.ts)
 *   - A single TRACK notification listener that forwards every conversion event
 *     into ODP. This is the ONLY place that calls `window.zaius.event()` for
 *     conversion events.
 *
 * Call sites should NOT use this module directly — use `trackConversion()` from
 * `@/lib/fx/track`, which queues events that fire before the client is ready.
 */
import type { Client, OptimizelyUserContext } from '@optimizely/optimizely-sdk'

declare global {
  interface Window {
    __OPTIMIZELY_FX_SDK_KEY__?: string | null
    zaius?: {
      customer: (
        identifiers: { customer_id?: string; email?: string; [key: string]: unknown },
        attributes?: Record<string, unknown>,
      ) => void
      event: (eventName: string, data?: Record<string, unknown>) => void
    }
  }
}

interface BrowserFxClient {
  client: Client
  userContext: OptimizelyUserContext
  userId: string
}

let initPromise: Promise<BrowserFxClient | null> | null = null
let readySnapshot: BrowserFxClient | null = null

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null
}

/**
 * The canonical visitor id. proxy.ts mints `optimizely_user_id` on the first
 * server-rendered page, so by the time any browser code runs it exists. The
 * last-resort anon id only guards against the cookie being unexpectedly absent.
 */
function resolveUserId(): string {
  return readCookie('optimizely_user_id') ?? `anon-${Math.random().toString(36).slice(2)}`
}

/** Expose the canonical id so callers (ODP attributes, event rows) can stamp it consistently. */
export function getVisitorId(): string {
  return resolveUserId()
}

/**
 * Initialize the browser FX client once. Subsequent calls return the same
 * promise. Resolves to `null` when no SDK key is configured (events then fall
 * back to direct ODP — see track.ts).
 */
export function initBrowserFxClient(): Promise<BrowserFxClient | null> {
  if (initPromise) return initPromise

  initPromise = (async () => {
    const sdkKey = window.__OPTIMIZELY_FX_SDK_KEY__
    if (!sdkKey) {
      console.warn('[FX:browser] No SDK key on window, skipping client init')
      return null
    }

    let sdk
    try {
      sdk = await import('@optimizely/optimizely-sdk')
    } catch (e) {
      console.error('[FX:browser] Failed to load @optimizely/optimizely-sdk:', e)
      return null
    }
    const {
      createInstance,
      createStaticProjectConfigManager,
      createBatchEventProcessor,
      createOdpManager,
      NOTIFICATION_TYPES,
    } = sdk

    let datafileString: string
    try {
      const r = await fetch(`https://cdn.optimizely.com/datafiles/${sdkKey}.json`)
      if (!r.ok) {
        console.error('[FX:browser] Datafile fetch failed:', r.status)
        return null
      }
      datafileString = await r.text()
    } catch (e) {
      console.error('[FX:browser] Datafile fetch error:', e)
      return null
    }

    const client = createInstance({
      projectConfigManager: createStaticProjectConfigManager({ datafile: datafileString }),
      // eventProcessor is required for client.track() to fire the TRACK
      // notification (the function exits early on `!this.eventProcessor`).
      eventProcessor: createBatchEventProcessor(),
      // odpManager ties this browser identity to ODP via fs_user_id so realtime
      // audiences align with the server-side fetchQualifiedSegments() path.
      odpManager: createOdpManager(),
    })
    if (!client) {
      console.error('[FX:browser] createInstance returned null')
      return null
    }

    await client.onReady()

    const userId = resolveUserId()
    const userContext = client.createUserContext(userId)
    if (!userContext) {
      console.error('[FX:browser] createUserContext returned null')
      return null
    }

    // The fan-out: every FX trackEvent forwards to ODP. Single integration point
    // for "ODP receives all conversion events". Future sinks (BigQuery, etc.)
    // register parallel listeners here.
    client.notificationCenter.addNotificationListener(
      NOTIFICATION_TYPES.TRACK,
      (payload: {
        eventKey: string
        userId: string
        attributes?: Record<string, unknown>
        eventTags?: Record<string, unknown>
      }) => {
        if (typeof window === 'undefined' || !window.zaius) return
        try {
          window.zaius.event(payload.eventKey, payload.eventTags || {})
        } catch (e) {
          console.warn('[FX→ODP] zaius.event forward failed:', e)
        }
      },
    )

    const ready = { client, userContext, userId }
    readySnapshot = ready
    return ready
  })()

  return initPromise
}

/**
 * Synchronously check whether the client is already initialized AND ready.
 * Used by the track-queue to decide whether to dispatch immediately or queue.
 */
export function getBrowserFxClientSync(): BrowserFxClient | null {
  return readySnapshot
}
