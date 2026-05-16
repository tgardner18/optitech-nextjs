import type { ReactNode } from 'react'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'

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

const minHeightClasses: Record<string, string> = {
  auto:   '',
  half:   'min-h-[50vh]',
  screen: 'min-h-screen',
}

const bgColorClasses: Record<string, string> = {
  none:         '',
  canvas:       'bg-canvas',
  surface:      'bg-surface',
  brand:        'bg-brand',
  'brand-deep': 'bg-brand-hover',
}

const overlayClasses: Record<string, string> = {
  none:  '',
  dark:  'bg-canvas/70',
  brand: 'bg-brand/50',
}

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

  const breakpoint = String(displaySettings.showAsRowFrom    ?? 'md')
  const spacing    = String(displaySettings.contentSpacing   ?? 'medium')
  const justify    = String(displaySettings.justifyContent   ?? 'start')
  const align      = String(displaySettings.alignItems       ?? 'start')
  const vPadding   = String(displaySettings.verticalPadding  ?? 'none')
  const minH       = String(displaySettings.minHeight        ?? 'auto')
  const bgColor    = String(displaySettings.backgroundColor  ?? 'none')
  const bgImage    = displaySettings.backgroundImage ? String(displaySettings.backgroundImage) : ''
  const overlay    = String(displaySettings.imageOverlay     ?? 'none')
  const wrap              = displaySettings.wrapColumns      === true
  const reverse           = displaySettings.reverseColumns   === true
  const entranceAnimation = String(displaySettings.entranceAnimation ?? 'none')

  const breakpointTable = reverse ? rowBreakpointReverseClasses : rowBreakpointClasses
  const breakpointClass = breakpointTable[breakpoint]        ?? breakpointTable.md
  const spacingClass    = contentSpacingClasses[spacing]     ?? contentSpacingClasses.medium
  const vPaddingClass   = verticalPaddingClasses[vPadding]   ?? ''
  const minHClass       = minHeightClasses[minH]             ?? ''
  const bgColorClass    = bgColorClasses[bgColor]            ?? ''
  const overlayClass    = overlayClasses[overlay]            ?? ''
  const justifyClass    = justifyClasses[justify]            ?? ''
  const alignClass      = alignItemsClasses[align]           ?? ''

  const hasOverlay  = overlayClass.length > 0
  const isAnimated  = entranceAnimation !== 'none'

  return (
    <div
      className={`vb:row relative isolate flex ${wrap ? 'flex-wrap' : ''} ${breakpointClass} ${spacingClass} ${vPaddingClass} ${minHClass} ${bgColorClass} ${justifyClass} ${alignClass}`}
      style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      data-stagger={isAnimated ? entranceAnimation : undefined}
      {...pa(node)}
    >
      {hasOverlay && (
        <div className={`absolute inset-0 -z-10 ${overlayClass}`} aria-hidden="true" />
      )}
      {children}
    </div>
  )
}
