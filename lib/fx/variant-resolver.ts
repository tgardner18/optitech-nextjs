/**
 * Optimizely Feature Experimentation — server-side variant resolution.
 *
 * Identity model: one canonical visitor id (`optimizely_user_id`), minted by
 * proxy.ts on first page visit. This module only READS it (Server Components
 * cannot set cookies during render). The same id is used for Web Experimentation
 * BYOID and ODP identification, so realtime ODP audience segments resolve
 * against the same identity via the SDK's normal fetchQualifiedSegments() path.
 */
import { cookies, headers } from 'next/headers'
import type { OptimizelySegmentOption } from '@optimizely/optimizely-sdk'
import { getOptimizelyClient } from './client'
import type { VariantDecision, ContentVariantDecision } from './types'

const USER_ID_COOKIE = 'optimizely_user_id'

// SDK enum is exported type-only from the main entry; runtime values are string literals.
const SEGMENT_FETCH_OPTIONS: OptimizelySegmentOption[] = ['IGNORE_CACHE' as OptimizelySegmentOption]

const DEV = process.env.OPTIMIZELY_DEV_MODE === 'true'

/**
 * Read the canonical visitor id from the request cookie. proxy.ts guarantees it
 * exists on every matched page request. The ephemeral fallback only triggers if
 * the resolver runs outside the proxy's reach (e.g. an excluded route) — the
 * decision still works, it just isn't sticky for that one call.
 */
async function getUserId(): Promise<string> {
  const jar = await cookies()
  const existing = jar.get(USER_ID_COOKIE)?.value
  if (existing) return existing
  console.warn('[FX] optimizely_user_id cookie missing — using ephemeral id for this request')
  return crypto.randomUUID()
}

/** Build FX user attributes from the current request. */
async function buildAttributes(locale: string): Promise<Record<string, string>> {
  const h = await headers()
  return {
    locale,
    host: h.get('host') ?? '',
  }
}

/** Fetch ODP qualified segments through the SDK's normal path (keyed by fs_user_id). */
async function attachSegments(
  userContext: { fetchQualifiedSegments: (opts: OptimizelySegmentOption[]) => Promise<boolean>; qualifiedSegments: string[] | null },
  label: string,
): Promise<void> {
  try {
    await userContext.fetchQualifiedSegments(SEGMENT_FETCH_OPTIONS)
    if (DEV) console.log(`[FX${label}] qualifiedSegments:`, userContext.qualifiedSegments)
  } catch (error) {
    console.warn(`[FX${label}] segment fetch failed:`, error)
  }
}

/**
 * Resolve a feature-flag decision server-side.
 *
 * @param flagKey  the FX flag key to evaluate
 * @param opts.sdkKey   FX SDK key (from OT_ThemeManager.featureExperimentationSdkKey)
 * @param opts.locale   active locale (added to user attributes)
 * @param opts.attributes  extra user attributes merged over the request-derived ones
 */
export async function resolveVariant(
  flagKey: string,
  opts: { sdkKey?: string | null; locale?: string; attributes?: Record<string, string | boolean | number> } = {},
): Promise<VariantDecision> {
  const userId = await getUserId()
  const fallback: VariantDecision = {
    enabled: false, variationKey: null, flagKey, userId,
    ruleKey: null, variables: {}, reasons: ['FX unavailable, using fallback'],
  }

  try {
    const client = await getOptimizelyClient(opts.sdkKey)
    if (!client) return fallback

    const attributes = { ...(await buildAttributes(opts.locale ?? 'en')), ...(opts.attributes ?? {}) }
    const userContext = client.createUserContext(userId, attributes)
    if (!userContext) {
      console.error('[FX] Failed to create user context')
      return fallback
    }

    await attachSegments(userContext, '')
    const decision = userContext.decide(flagKey)

    if (DEV) {
      console.log('[FX] Decision:', { flagKey, userId, variationKey: decision.variationKey, enabled: decision.enabled, reasons: decision.reasons })
    }

    return {
      enabled: decision.enabled,
      variationKey: decision.variationKey,
      flagKey: decision.flagKey,
      userId,
      ruleKey: decision.ruleKey,
      variables: (decision.variables ?? {}) as Record<string, unknown>,
      reasons: decision.reasons,
    }
  } catch (error) {
    console.error('[FX] Error resolving variant:', error)
    return fallback
  }
}

/**
 * Resolve a CMS content variation via FX.
 *
 * The FX variation key IS the CMS variation slug (lowercased). A "control"/"off"
 * variation (or a disabled flag) maps to null → serve the default experience.
 *
 * @param opts.flagKey  per-experience flag (BlankExperience.FxFlagKey)
 * @param opts.sdkKey   FX SDK key (from OT_ThemeManager.featureExperimentationSdkKey)
 * @param opts.locale   active locale
 */
export async function resolveContentVariant(
  opts: { flagKey?: string | null; sdkKey?: string | null; locale?: string },
): Promise<ContentVariantDecision> {
  const userId = await getUserId()
  const flagKey = opts.flagKey?.trim() || ''
  const fallback: ContentVariantDecision = {
    enabled: false, contentVariation: null, flagKey, userId,
    fxVariationKey: null, variables: {}, reasons: ['FX unavailable, using fallback'],
  }

  if (!flagKey) {
    if (DEV) console.log('[FX:Content] No flag key on experience — serving default')
    return fallback
  }

  try {
    const client = await getOptimizelyClient(opts.sdkKey)
    if (!client) return fallback

    const attributes = await buildAttributes(opts.locale ?? 'en')
    const userContext = client.createUserContext(userId, attributes)
    if (!userContext) {
      console.error('[FX:Content] Failed to create user context')
      return fallback
    }

    await attachSegments(userContext, ':Content')
    const decision = userContext.decide(flagKey)

    // Enabled + a real (non-"off") variation key → use it as the CMS slug.
    const raw = decision.variationKey
    const contentVariation =
      decision.enabled && raw && raw.toLowerCase() !== 'off' ? raw.toLowerCase() : null

    if (DEV) {
      console.log('[FX:Content] Decision:', { flagKey, userId, enabled: decision.enabled, fxVariationKey: raw, contentVariation, reasons: decision.reasons })
    }

    return {
      enabled: decision.enabled,
      contentVariation,
      flagKey: decision.flagKey,
      userId,
      fxVariationKey: raw,
      variables: (decision.variables ?? {}) as Record<string, unknown>,
      reasons: decision.reasons,
    }
  } catch (error) {
    console.error('[FX:Content] Error resolving content variant:', error)
    return fallback
  }
}
