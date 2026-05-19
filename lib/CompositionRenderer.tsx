/**
 * Drop-in replacement for OptimizelyComposition that correctly passes
 * displaySettings to top-level component nodes.
 *
 * The SDK's OptimizelyComposition computes parsedDisplaySettings for
 * CompositionComponentNode entries but forwards it only to the Wrapper,
 * not to OptimizelyComponent.  OptimizelyGridSection (used for blocks
 * nested inside sections) does pass it correctly.  This renderer fixes
 * the gap so any block placed at the experience root also receives its
 * configured display settings.
 */
import { OptimizelyComponent } from '@optimizely/cms-sdk/react/server'
import { DisplayTemplates } from '@optimizely/cms-sdk'

const { parseDisplaySettings } = DisplayTemplates

function isComponentNode(node: any): boolean {
  return node.__typename === 'CompositionComponentNode'
}

export function CompositionRenderer({ nodes }: { nodes: any[] }) {
  return nodes.map((node) => {
    const displaySettings = parseDisplaySettings(node.displaySettings)

    if (isComponentNode(node)) {
      return (
        <OptimizelyComponent
          key={node.key}
          content={{ ...node.component, __composition: node }}
          displaySettings={displaySettings}
        />
      )
    }

    if (!node.type) return null

    return (
      <OptimizelyComponent
        key={node.key}
        content={{ ...node, __typename: node.type }}
        displaySettings={displaySettings}
      />
    )
  })
}
