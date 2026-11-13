import React, { type ReactNode } from 'react'
import { getPreviewUtils, OptimizelyGridSection } from '@optimizely/cms-sdk/react/server'
import { groupAdjacentComponents, type CompositionNode } from './groupAdjacentComponents'

type Props = {
  node: any
  index: number
  displaySettings?: Record<string, string | boolean>
  children: ReactNode
}

/**
 * Content type names that get merged when 2+ instances sit adjacently in a
 * column — each renders through one combined component instead of
 * independently. Tab Items merge into one tab switcher; Stat/Feature Items
 * merge into a wrapping 2-column grid. Extend this list (and register a
 * `__<Type>Group` adapter) if another element type needs the same treatment.
 */
const GROUPABLE_TYPES = ['OT_TabItemBlock', 'OT_StatItemBlock', 'OT_FeatureItemBlock']

function buildGroupNode(nodes: CompositionNode[]): CompositionNode {
  const leader = nodes[0]
  return {
    __typename:         'CompositionComponentNode',
    nodeType:            'component',
    key:                 `group-${leader.key}`,
    displayTemplateKey:  leader.displayTemplateKey,
    // Raw {key,value}[] form — OptimizelyGridSection parses this itself, so
    // the leading node's settings become "the group's" settings for free.
    displaySettings:     leader.displaySettings,
    component: {
      __typename:   `__${leader.component.__typename}Group`,
      __groupNodes: nodes,
    },
  }
}

/**
 * Splits `nodes` on every groupable type and replaces each contiguous run of
 * 2+ matching nodes with one synthetic group node. Lone matches, and every
 * other node, pass through untouched — the SDK's normal per-node resolution
 * still handles them (which is what gives an isolated Tab Item its own
 * single-tab fallback chrome via its regular adapter).
 */
function buildRenderNodes(nodes: CompositionNode[]): { renderNodes: CompositionNode[]; changed: boolean } {
  let renderNodes = nodes
  let changed = false

  for (const typeName of GROUPABLE_TYPES) {
    const segments = groupAdjacentComponents(renderNodes, typeName)
    if (!segments.some(s => s.type === 'group')) continue
    changed = true
    renderNodes = segments.flatMap(seg =>
      seg.type === 'single' ? [seg.node] : [buildGroupNode(seg.nodes)],
    )
  }

  return { renderNodes, changed }
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

  // `children` arrives as the SDK's own <OptimizelyGridSection nodes={node.nodes} .../>
  // element, already carrying whatever row/column/ComponentWrapper overrides the
  // page passed at the top of the tree (e.g. Section.tsx's BlockWrapper). When a
  // groupable run is found, re-render with the same passthrough props and only
  // `nodes` replaced — anything we can't safely read falls back to the SDK's
  // untouched rendering rather than risk dropping that wrapper.
  let content: ReactNode = children
  const rawNodes = (node?.nodes ?? []) as CompositionNode[]
  const { renderNodes, changed } = buildRenderNodes(rawNodes)
  if (changed && React.isValidElement(children) && children.type === OptimizelyGridSection) {
    content = (
      <OptimizelyGridSection
        {...(children.props as Record<string, unknown>)}
        nodes={renderNodes as any}
      />
    )
  }

  if (displaySettings.formLayout === true || displaySettings.formLayout === 'true') {
    const n = Number(String(displaySettings.gridSpan ?? '').replace('col', ''))
    return (
      <div
        data-part="col"
        style={Number.isFinite(n) && n > 0 ? ({ '--span': n } as React.CSSProperties) : undefined}
        {...pa(node)}
      >
        {content}
      </div>
    )
  }

  const span    = String(displaySettings.gridSpan           ?? 'auto')
  const spacing = String(displaySettings.contentSpacing    ?? 'medium')
  const justify = String(displaySettings.justifyContent    ?? 'start')
  const align   = String(displaySettings.alignContent      ?? 'stretch')
  const vPad    = String(displaySettings.verticalPadding   ?? 'none')
  const hPad    = String(displaySettings.horizontalPadding ?? 'none')
  const nudgeRaw = String(displaySettings.columnRhythmNudge ?? 'none')
  const nudge    = nudgeRaw === 'none' ? undefined : nudgeRaw
  const bleedRaw = String(displaySettings.columnBleed ?? 'none')
  const bleed    = bleedRaw === 'none' ? undefined : bleedRaw

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
      data-col-bleed={bleed}
      data-nudge={nudge}
      data-col-valign={justify !== 'start' ? justify : undefined}
      {...pa(node)}
    >
      {content}
    </div>
  )
}
