import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils }             from '@optimizely/cms-sdk/react/server'
import { OT_ResourceLibraryBlock } from '@/cms/content-types/OT_ResourceLibraryBlock'
import { getResourceLibraryStyles }    from '@/cms/styling/OT_ResourceLibraryBlock.styling'
import { getResourceLibraryAssets }    from '@/lib/resourceLibrary'
import ResourceLibraryBlock, { ErrorState } from '@/components/blocks/ResourceLibraryBlock'

type Props = {
  content:          ContentProps<typeof OT_ResourceLibraryBlock>
  displaySettings?: Record<string, string | boolean>
}

// ─── OT_ResourceLibraryBlock adapter ─────────────────────────────────────────
//
// Async server component — performs the two-step Graph fetch at render time:
//   1. Resolve collectionId from the editor-selected anchor DAM asset.
//   2. Fetch all sibling assets from that collection, filtered by type.
//
// assets === null  →  anchor not configured; shows "not configured" empty state.
// assets === []    →  collection is empty / no filter matches; shows empty state.
// Graph error      →  getResourceLibraryAssets catches and returns []; adapter
//                     treats a missing anchor key as the "not configured" case.

export default async function OT_ResourceLibraryBlockAdapter({
  content,
  displaySettings = {},
}: Props) {
  const { pa }         = getPreviewUtils(content)
  const styleOptions   = getResourceLibraryStyles(displaySettings)

  // Extract text fields
  const eyebrow = content.eyebrow ?? undefined
  const title   = content.title   ?? undefined

  // Extract the anchor asset key from the CMS content reference.
  // ContentReference objects expose `key` at the top level.
  const anchorKey: string | undefined = content.anchorAsset?.key
    ? String(content.anchorAsset.key)
    : undefined

  // null = anchor not configured; fetch only when key is present
  const assets = anchorKey
    ? await getResourceLibraryAssets(anchorKey, styleOptions.filterType)
    : null

  return (
    <div {...pa(content.__composition)} className="w-full">
      <ResourceLibraryBlock
        eyebrow={eyebrow}
        title={title}
        assets={assets}
        styleOptions={styleOptions}
        pa={pa}
      />
    </div>
  )
}
