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

    // A structure node whose own content type is registered (e.g. a
    // `_section` that owns its own internal composition, like
    // OptiFormsContainerData — unlike a purely-structural VB row/column,
    // which has no `.type` at all and never reaches this branch) keeps its
    // real properties on `node.component`, exactly like a
    // CompositionComponentNode does above. Confirmed live: `node.key` is
    // this placement's own composition-node key, a different value from
    // `node.component._metadata.key` (the content item's actual key) —
    // spreading `node` itself, not `node.component`, silently dropped
    // OptiFormsContainerData's own Title/Description/DependencyRules and
    // `_metadata` on every page using this renderer (home, slug, preview),
    // even though its nested fields (step/row/column/field) still came
    // through via `node.nodes`.
    return (
      <OptimizelyComponent
        key={node.key}
        content={{ ...node.component, __composition: node, __typename: node.type }}
        displaySettings={displaySettings}
      />
    )
  })
}
