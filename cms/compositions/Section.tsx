import type { ReactNode } from 'react'
import { getPreviewUtils, OptimizelyGridSection } from '@optimizely/cms-sdk/react/server'

type Props = {
  content: any
  displaySettings?: Record<string, string | boolean>
}

// SDK 2.1.0 added DefaultComponentWrapper which injects `display:block` around
// every block, breaking the flex height chain (column → block → h-full). This
// replacement keeps the CMS editing attributes while staying a flex item so
// h-full / flex-1 on block wrappers correctly fill the column height.
function BlockWrapper({ children, node }: { children: ReactNode; node: any }) {
  const { pa } = getPreviewUtils(node)
  return (
    <div {...pa(node)} style={{ display: 'flex', flexDirection: 'column', flex: '1', width: '100%', minWidth: 0 }}>
      {children}
    </div>
  )
}

const widthClasses: Record<string, string> = {
  full:    'w-full',
  narrow:  'max-w-4xl w-full mx-auto px-lg',
  wide:    'max-w-7xl w-full mx-auto px-lg',
  default: 'container mx-auto px-lg w-full',
}

const verticalSpacingClasses: Record<string, string> = {
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

// brand, brandDeep, and glass are all dark surfaces — force dark theme so
// nested text/button tokens resolve to light values regardless of the page theme.
const DARK_BG = new Set(['brand', 'brandDeep', 'glass'])

export default function Section({ content, displaySettings = {} }: Props) {
  const { pa } = getPreviewUtils(content)

  const width              = String(displaySettings.gridWidth          ?? 'default')
  const vSpace             = String(displaySettings.verticalSpacing    ?? 'large')
  const bgColor            = String(displaySettings.backgroundColor    ?? 'none')
  const overlap            = String(displaySettings.sectionOverlap     ?? 'none')
  const entranceAnimation  = String(displaySettings.entranceAnimation  ?? 'none')

  const widthClass   = widthClasses[width]              ?? widthClasses.default
  const vSpaceClass  = verticalSpacingClasses[vSpace]   ?? verticalSpacingClasses.large
  const bgColorClass = bgColorClasses[bgColor]          ?? ''

  const isAnimated   = entranceAnimation !== 'none'

  return (
    <section
      className={`vb:section flex flex-col w-full ${bgColorClass}`}
      data-theme={DARK_BG.has(bgColor) ? 'dark' : undefined}
      data-overlap={overlap !== 'none' ? overlap : undefined}
      {...pa(content)}
      data-stagger={isAnimated ? entranceAnimation : undefined}
    >
      <div className={`flex flex-col flex-1 ${widthClass} ${vSpaceClass}`}>
        <OptimizelyGridSection nodes={content.nodes ?? []} ComponentWrapper={BlockWrapper} />
      </div>
    </section>
  )
}
