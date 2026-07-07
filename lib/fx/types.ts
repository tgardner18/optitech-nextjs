/**
 * Optimizely Feature Experimentation — shared types.
 */
export type {
  Client as OptimizelySDK,
  OptimizelyDecision,
  OptimizelyUserContext,
  EventTags,
} from '@optimizely/optimizely-sdk'

/** Result of a server-side feature-flag decision. */
export interface VariantDecision {
  enabled: boolean
  variationKey: string | null
  flagKey: string
  userId: string
  ruleKey: string | null
  variables: Record<string, unknown>
  reasons: string[]
}

/**
 * Result of a CMS content-variation decision.
 *
 * Mapping convention: the FX variation key IS the CMS variation slug
 * (lowercased). Author creates a CMS variation named `hero_alt` and a matching
 * FX variation `hero_alt`; they bind by name.
 */
export interface ContentVariantDecision {
  enabled: boolean
  contentVariation: string | null  // CMS variation slug (null = serve default)
  flagKey: string
  userId: string
  fxVariationKey: string | null    // raw FX variation key (for debugging)
  variables: Record<string, unknown>
  reasons: string[]
}
