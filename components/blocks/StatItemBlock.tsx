'use client'

import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import StatTile, { type StatItem, type StatEffect, type StatTileStyleOptions } from './StatTile'

export type { StatItem, StatEffect }

export type StatItemBlockProps = {
  stat:          StatItem
  styleOptions?: StatTileStyleOptions
  effect?:       StatEffect
}

// visible boundary (unlike the section's continuous divided row). The shadow
// pair reads as a soft raised panel: a faint inner top highlight (the "light
// catching the near edge" cue) plus the standard brand-hued resting bloom
// beneath. Kept deliberately restrained — the panel's own bg/border contrast
// against its ground is untouched, so this adds depth without approaching
// neumorphism's washed-out, low-contrast signature.
const panelCva = cva(
  'rounded-ot-surface border shadow-[inset_0_1px_0_0_oklch(from_var(--ot-fg)_l_c_h/0.08),0_4px_24px_var(--ot-bloom-brand-faint)]',
  {
    variants: {
      color: {
        brand:   'bg-brand-fill border-transparent',
        canvas:  'bg-surface border-fg/10',
        surface: 'bg-fg/6 border-fg/10',
      },
    },
    defaultVariants: { color: 'brand' },
  }
)

function glassPanelClass(color: NonNullable<StatTileStyleOptions['color']>): string {
  if (color === 'surface') return 'banner-glass-surface'
  if (color === 'canvas')  return 'banner-glass'
  return 'bg-glass border-transparent'
}

export default function StatItemBlock({
  stat,
  styleOptions = {},
  effect = 'none',
}: StatItemBlockProps) {
  const color = styleOptions.color ?? 'brand'
  const glass = styleOptions.glass ?? false
  const isDarkSurface = color === 'brand'

  return (
    <div
      className={cn('rounded-ot-surface', glass ? glassPanelClass(color) : panelCva({ color }))}
      data-theme={isDarkSurface ? 'dark' : undefined}
      data-block="stat"
      data-solo=""
      data-color={color}
      data-glass={glass ? 'yes' : 'no'}
      data-effect={effect}
      data-place={styleOptions.iconPlacement ?? 'inline'}
    >
      <StatTile
        stat={stat}
        styleOptions={styleOptions}
        effect={effect}
        variant="row"
        className="p-lg"
        align="center"
      />
    </div>
  )
}
