/**
 * Optimizely Feature Experimentation — server-side SDK client singleton.
 *
 * The SDK key is supplied by the caller (resolved per-domain from
 * OT_ThemeManager.featureExperimentationSdkKey), NOT fetched here — this module
 * stays decoupled from how/where the key is configured.
 *
 * - First call with a key: fetch datafile from CDN, create & cache the client.
 * - Subsequent calls: return the cached client until the TTL expires.
 * - Concurrent calls: share one in-flight initialization promise.
 * - No key: returns null (callers treat this as "FX disabled" → serve default).
 */
import {
  createInstance,
  createOdpManager,
  createStaticProjectConfigManager,
  type Client,
} from '@optimizely/optimizely-sdk'

export type OptimizelySDK = Client

let clientInstance: Client | null = null
let clientPromise: Promise<Client | null> | null = null
let cachedSdkKey: string | null = null
let cacheTimestamp: number | null = null

// 5s TTL — near-instant FX experiment propagation during demos. The webhook
// (/api/fx-refresh) also calls resetClient() for immediate cache-busting.
const CACHE_TTL_MS = 5 * 1000

function isCacheExpired(): boolean {
  if (!cacheTimestamp) return true
  return Date.now() - cacheTimestamp > CACHE_TTL_MS
}

async function createOptimizelyClient(sdkKey: string): Promise<Client | null> {
  try {
    const datafileUrl = `https://cdn.optimizely.com/datafiles/${sdkKey}.json`
    const response = await fetch(datafileUrl)
    if (!response.ok) {
      console.error('[FX] Failed to fetch datafile:', response.status, response.statusText)
      return null
    }
    const datafileString = await response.text()

    const client = createInstance({
      projectConfigManager: createStaticProjectConfigManager({ datafile: datafileString }),
      // odpManager enables realtime audience segment qualification via
      // userContext.fetchQualifiedSegments(). The visitor is identified to ODP
      // by our canonical optimizely_user_id (see browser-client + variant-resolver),
      // so segments resolve against the same identity FX and Web Exp use.
      odpManager: createOdpManager(),
    })

    if (!client) {
      console.error('[FX] createInstance returned null')
      return null
    }
    return client
  } catch (error) {
    console.error('[FX] Failed to initialize SDK:', error)
    return null
  }
}

/**
 * Returns the FX client singleton for the given SDK key, or null when no key is
 * provided. Refreshes the datafile when the TTL expires or the key changes.
 */
export async function getOptimizelyClient(sdkKey?: string | null): Promise<Client | null> {
  if (!sdkKey) return null

  if (clientInstance !== null && cachedSdkKey === sdkKey && !isCacheExpired()) {
    return clientInstance
  }

  // TTL expired → drop and re-init below.
  if (clientInstance !== null && isCacheExpired()) {
    clientInstance = null
    clientPromise = null
  }

  // Key changed → drop and re-init below.
  if (cachedSdkKey && cachedSdkKey !== sdkKey) {
    clientInstance = null
    clientPromise = null
  }

  if (clientPromise !== null) return clientPromise

  cachedSdkKey = sdkKey
  clientPromise = createOptimizelyClient(sdkKey).then((client) => {
    clientInstance = client
    cacheTimestamp = Date.now()
    // On failure, clear so the next request retries.
    if (client === null) {
      clientPromise = null
      cachedSdkKey = null
      cacheTimestamp = null
    }
    return client
  })

  return clientPromise
}

/**
 * Reset the singleton, forcing a fresh datafile fetch on the next request.
 * Called by /api/fx-refresh for instant cache-busting during demos.
 */
export function resetClient(): void {
  clientInstance = null
  clientPromise = null
  cachedSdkKey = null
  cacheTimestamp = null
}
