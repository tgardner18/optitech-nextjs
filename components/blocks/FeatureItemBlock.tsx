'use client'

import { cn } from '@/lib/utils'
import FeatureTile, { type FeatureItem, type FeatureTileStyleOptions } from './FeatureTile'

export type { FeatureItem }

export type FeatureItemBlockProps = {
  feature:       FeatureItem
  styleOptions?: FeatureTileStyleOptions
}

export default function FeatureItemBlock({ feature, styleOptions = {} }: FeatureItemBlockProps) {
  // featureCardCva's 'brand' variant is a light overlay tint designed to sit
  // on an already-dark section (see FeatureGridBlock's bg-brand-fill
  // wrapper) — a standalone tile needs to supply that dark surface itself,
  // or the tint (and its light text) is invisible on the page background.
  const isDarkSurface = (styleOptions.color ?? 'canvas') === 'brand'

  return (
    <div
      className={cn(isDarkSurface && 'bg-brand-fill rounded-ot-surface')}
      data-theme={isDarkSurface ? 'dark' : undefined}
      data-block="feature"
      data-solo=""
      data-color={styleOptions.color ?? 'canvas'}
    >
      <FeatureTile feature={feature} styleOptions={styleOptions} variant="card" />
    </div>
  )
}
