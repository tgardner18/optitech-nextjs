import type { ReactNode } from 'react'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'

type Props = {
  node: any
  index: number
  displaySettings?: Record<string, string | boolean>
  children: ReactNode
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
  small:  'py-sm',
  medium: 'py-md',
  large:  'py-lg',
  xl:     'py-xl',
}

const horizontalPaddingClasses: Record<string, string> = {
  none:   'px-0',
  small:  'px-sm',
  medium: 'px-md',
  large:  'px-lg',
}

const justifyClasses: Record<string, string> = {
  center: 'justify-center',
  end:    'justify-end',
  start:  'justify-start',
}

const alignClasses: Record<string, string> = {
  center:  'items-center',
  end:     'items-end',
  start:   'items-start',
  stretch: '',
}

export default function Column({ node, displaySettings = {}, children }: Props) {
  const { pa } = getPreviewUtils(node)

  const span    = String(displaySettings.gridSpan           ?? 'auto')
  const spacing = String(displaySettings.contentSpacing    ?? 'medium')
  const justify = String(displaySettings.justifyContent    ?? 'start')
  const align   = String(displaySettings.alignContent      ?? 'stretch')
  const vPad    = String(displaySettings.verticalPadding   ?? 'none')
  const hPad    = String(displaySettings.horizontalPadding ?? 'none')
  const nudgeRaw = String(displaySettings.columnRhythmNudge ?? 'none')
  const nudge    = nudgeRaw === 'none' ? undefined : nudgeRaw

  const spanClass    = span === 'auto' ? 'flex-1 min-w-0' : 'flex-none w-full'
  const spacingClass = contentSpacingClasses[spacing]     ?? contentSpacingClasses.medium
  const justifyClass = justifyClasses[justify]            ?? ''
  const alignClass   = alignClasses[align]                ?? ''
  const vPadClass    = verticalPaddingClasses[vPad]       ?? ''
  const hPadClass    = horizontalPaddingClasses[hPad]     ?? ''

  return (
    <div
      className={`vb:col flex flex-col self-stretch ${spanClass} ${spacingClass} ${vPadClass} ${hPadClass} ${justifyClass} ${alignClass}`}
      data-col-span={span !== 'auto' ? span : undefined}
      data-nudge={nudge}
      {...pa(node)}
    >
      {children}
    </div>
  )
}
