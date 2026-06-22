import type { ReactNode } from 'react'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import SliderRow from '@/cms/compositions/SliderRow'

type Props = {
  node: any
  index: number
  displaySettings?: Record<string, string | boolean>
  children: ReactNode
}

const rowBreakpointClasses: Record<string, string> = {
  sm:    'flex-col sm:flex-row',
  md:    'flex-col md:flex-row',
  lg:    'flex-col lg:flex-row',
  xl:    'flex-col xl:flex-row',
  never: 'flex-col',
}

const rowBreakpointReverseClasses: Record<string, string> = {
  sm:    'flex-col sm:flex-row-reverse',
  md:    'flex-col md:flex-row-reverse',
  lg:    'flex-col lg:flex-row-reverse',
  xl:    'flex-col xl:flex-row-reverse',
  never: 'flex-col',
}

const contentSpacingClasses: Record<string, string> = {
  none:   'gap-0',
  small:  'gap-sm',
  medium: 'gap-md',
  large:  'gap-lg',
  xl:     'gap-xl',
}

const verticalPaddingClasses: Record<string, string> = {
  none:   'py-0',
  small:  'py-md',
  medium: 'py-lg',
  large:  'py-xl',
  xl:     'py-2xl',
}

const bgColorClasses: Record<string, string> = {
  none:      '',
  canvas:    'bg-canvas',
  surface:   'bg-surface',
  brand:     'bg-brand',
  brandDeep: 'bg-brand-hover',
  glass:     'bg-glass',
}

// Rows with a dark fill need to assert dark theme so nested text tokens
// (text-fg, text-fg-muted) resolve to the light values from :root / [data-theme="dark"].
// Without this, a brand or glass row inside a light-mode page uses dark text on dark bg.
const DARK_BG = new Set(['brand', 'brandDeep', 'glass'])

const justifyClasses: Record<string, string> = {
  center:  'justify-center',
  end:     'justify-end',
  start:   'justify-start',
  between: 'justify-between',
  evenly:  'justify-evenly',
}

const alignItemsClasses: Record<string, string> = {
  center:   'items-center',
  end:      'items-end',
  stretch:  'items-stretch',
  baseline: 'items-baseline',
  start:    'items-start',
}

export default function Row({ node, displaySettings = {}, children }: Props) {
  const { pa } = getPreviewUtils(node)

  const templateKey = String(node?.displayTemplateKey ?? '')
  const isSlider    = templateKey === 'OT_LandingRowSlider'

  const breakpoint = String(displaySettings.showAsRowFrom    ?? 'md')
  const spacing    = String(displaySettings.contentSpacing   ?? 'medium')
  const justify    = String(displaySettings.justifyContent   ?? 'start')
  const align      = String(displaySettings.alignItems       ?? 'start')
  const vPadding   = String(displaySettings.verticalPadding  ?? 'small')
  const bgColor    = String(displaySettings.backgroundColor  ?? 'none')
  const rhythm            = String(displaySettings.columnRhythm      ?? 'none')
  const wrap              = displaySettings.wrapColumns      === true
  const reverse           = displaySettings.reverseColumns   === true
  const entranceAnimation = String(displaySettings.entranceAnimation ?? 'none')

  const breakpointTable = reverse ? rowBreakpointReverseClasses : rowBreakpointClasses
  const breakpointClass = breakpointTable[breakpoint]        ?? breakpointTable.md
  const spacingClass    = contentSpacingClasses[spacing]     ?? contentSpacingClasses.medium
  const vPaddingClass   = verticalPaddingClasses[vPadding]   ?? ''
  const bgColorClass    = bgColorClasses[bgColor]            ?? ''
  const justifyClass    = justifyClasses[justify]            ?? ''
  const alignClass      = alignItemsClasses[align]           ?? ''

  const isAnimated  = entranceAnimation !== 'none'

  if (isSlider) {
    return (
      <SliderRow
        transition={String(displaySettings.sliderTransition  ?? 'slide')}
        controls={String(displaySettings.sliderControls      ?? 'both')}
        autoplay={String(displaySettings.sliderAutoplay      ?? 'off')}
        loop={String(displaySettings.sliderLoop              ?? 'loop')}
        peek={String(displaySettings.sliderPeek              ?? 'none')}
        gap={spacing}
        verticalPadding={vPaddingClass}
        bgColorClass={bgColorClass}
        staggerAttr={isAnimated ? entranceAnimation : undefined}
        paProps={pa(node) as Record<string, unknown>}
      >
        {children}
      </SliderRow>
    )
  }

  return (
    <div
      className={`vb:row flex ${wrap ? 'flex-wrap' : ''} ${breakpointClass} ${spacingClass} ${vPaddingClass} ${bgColorClass} ${justifyClass} ${alignClass}`}
      data-theme={DARK_BG.has(bgColor) ? 'dark' : undefined}
      data-stagger={isAnimated ? entranceAnimation : undefined}
      data-rhythm={rhythm !== 'none' ? rhythm : undefined}
      {...pa(node)}
      data-bp={breakpoint}
    >
      {children}
    </div>
  )
}
