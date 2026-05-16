import { use, type ReactNode } from 'react'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { RowBreakpointContext } from '@/cms/compositions/RowBreakpointContext'

type Props = {
  node: any
  index: number
  displaySettings?: Record<string, string | boolean>
  children: ReactNode
}

// One span map per Row breakpoint so column widths activate at the same
// viewport size the row switches from stacked to side-by-side.
const gridSpanBySm: Record<string, string> = {
  auto:  'flex-1',
  col1:  'sm:basis-1/12  flex-1',
  col2:  'sm:basis-2/12  flex-1',
  col3:  'sm:basis-3/12  flex-1',
  col4:  'sm:basis-4/12  flex-1',
  col5:  'sm:basis-5/12  flex-1',
  col6:  'sm:basis-6/12  flex-1',
  col7:  'sm:basis-7/12  flex-1',
  col8:  'sm:basis-8/12  flex-1',
  col9:  'sm:basis-9/12  flex-1',
  col10: 'sm:basis-10/12 flex-1',
  col11: 'sm:basis-11/12 flex-1',
  col12: 'sm:basis-full  flex-1',
}

const gridSpanByMd: Record<string, string> = {
  auto:  'flex-1',
  col1:  'md:basis-1/12  flex-1',
  col2:  'md:basis-2/12  flex-1',
  col3:  'md:basis-3/12  flex-1',
  col4:  'md:basis-4/12  flex-1',
  col5:  'md:basis-5/12  flex-1',
  col6:  'md:basis-6/12  flex-1',
  col7:  'md:basis-7/12  flex-1',
  col8:  'md:basis-8/12  flex-1',
  col9:  'md:basis-9/12  flex-1',
  col10: 'md:basis-10/12 flex-1',
  col11: 'md:basis-11/12 flex-1',
  col12: 'md:basis-full  flex-1',
}

const gridSpanByLg: Record<string, string> = {
  auto:  'flex-1',
  col1:  'lg:basis-1/12  flex-1',
  col2:  'lg:basis-2/12  flex-1',
  col3:  'lg:basis-3/12  flex-1',
  col4:  'lg:basis-4/12  flex-1',
  col5:  'lg:basis-5/12  flex-1',
  col6:  'lg:basis-6/12  flex-1',
  col7:  'lg:basis-7/12  flex-1',
  col8:  'lg:basis-8/12  flex-1',
  col9:  'lg:basis-9/12  flex-1',
  col10: 'lg:basis-10/12 flex-1',
  col11: 'lg:basis-11/12 flex-1',
  col12: 'lg:basis-full  flex-1',
}

const gridSpanByXl: Record<string, string> = {
  auto:  'flex-1',
  col1:  'xl:basis-1/12  flex-1',
  col2:  'xl:basis-2/12  flex-1',
  col3:  'xl:basis-3/12  flex-1',
  col4:  'xl:basis-4/12  flex-1',
  col5:  'xl:basis-5/12  flex-1',
  col6:  'xl:basis-6/12  flex-1',
  col7:  'xl:basis-7/12  flex-1',
  col8:  'xl:basis-8/12  flex-1',
  col9:  'xl:basis-9/12  flex-1',
  col10: 'xl:basis-10/12 flex-1',
  col11: 'xl:basis-11/12 flex-1',
  col12: 'xl:basis-full  flex-1',
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
  center: 'items-center',
  end:    'items-end',
  start:  'items-start',
}

export default function Column({ node, displaySettings = {}, children }: Props) {
  const { pa } = getPreviewUtils(node)

  const rowBreakpoint = use(RowBreakpointContext)
  const gridSpanMap =
    rowBreakpoint === 'sm'    ? gridSpanBySm :
    rowBreakpoint === 'lg'    ? gridSpanByLg :
    rowBreakpoint === 'xl'    ? gridSpanByXl :
    gridSpanByMd

  const span    = String(displaySettings.gridSpan          ?? 'auto')
  const spacing = String(displaySettings.contentSpacing    ?? 'medium')
  const justify = String(displaySettings.justifyContent    ?? 'start')
  const align   = String(displaySettings.alignContent      ?? 'start')
  const vPad    = String(displaySettings.verticalPadding   ?? 'none')
  const hPad    = String(displaySettings.horizontalPadding ?? 'none')

  const spanClass    = gridSpanMap[span] ?? gridSpanMap.auto
  const spacingClass = contentSpacingClasses[spacing]     ?? contentSpacingClasses.medium
  const justifyClass = justifyClasses[justify]            ?? ''
  const alignClass   = alignClasses[align]                ?? ''
  const vPadClass    = verticalPaddingClasses[vPad]       ?? ''
  const hPadClass    = horizontalPaddingClasses[hPad]     ?? ''

  return (
    <div
      className={`vb:col flex flex-col self-stretch ${spanClass} ${spacingClass} ${vPadClass} ${hPadClass} ${justifyClass} ${alignClass}`}
      {...pa(node)}
    >
      {children}
    </div>
  )
}
