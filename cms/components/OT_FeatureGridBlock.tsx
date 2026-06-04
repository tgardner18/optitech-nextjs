import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils }                                from '@optimizely/cms-sdk/react/server'
import { OT_FeatureGridBlock as OT_FeatureGridBlockContentType } from '@/cms/content-types/OT_FeatureGridBlock'
import { getFeatureGridStyles, getFeatureGridIcons }      from '@/cms/styling/OT_FeatureGridBlock.styling'
import FeatureGridBlock, { type FeatureItem }             from '@/components/blocks/FeatureGridBlock'

type Props = {
  content:          ContentProps<typeof OT_FeatureGridBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

function resolveUrl(v: unknown): string | undefined {
  if (!v) return undefined
  if (typeof v === 'string') return v
  if (typeof v === 'object' && v !== null && 'default' in v) return String((v as Record<string, unknown>).default)
  return undefined
}

/**
 * Build FeatureItem[] from CMS content (without icons — those come from display
 * settings and are merged in below).
 *
 * Supports two formats:
 *   1. CMS array: content.features[] — OT_FeatureItem components (production)
 *   2. Items array: content.items[]  — showcase / testing format
 */
function buildFeatures(content: any): Omit<FeatureItem, 'icon'>[] {
  // Format 1: CMS array property (OT_FeatureItem components)
  if (Array.isArray(content.features)) {
    return (content.features as any[])
      .filter(item => item?.headline)
      .map(item => ({
        headline: String(item.headline),
        body:     item.body?.json ?? undefined,
        ctaLabel: item.ctaLabel ? String(item.ctaLabel) : undefined,
        ctaUrl:   resolveUrl(item.ctaUrl),
      }))
  }

  return []
}

export default function OT_FeatureGridBlockAdapter({ content, displaySettings = {} }: Props) {
  const { pa }       = getPreviewUtils(content)
  const styleOptions = getFeatureGridStyles(displaySettings)
  const slotIcons    = getFeatureGridIcons(displaySettings)

  const features: FeatureItem[] = buildFeatures(content).map((feature, i) => ({
    ...feature,
    icon: slotIcons[i],
  }))

  return (
    <div {...pa(content.__composition)} className="w-full">
      <FeatureGridBlock
        features={features}
        eyebrow={content.eyebrow    ?? undefined}
        heading={content.heading    ?? undefined}
        subheading={content.subheading ?? undefined}
        ctaLabel={content.ctaLabel  ?? undefined}
        ctaUrl={resolveUrl(content.ctaUrl)}
        styleOptions={styleOptions}
      />
    </div>
  )
}
