import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils }             from '@optimizely/cms-sdk/react/server'
import { OT_ResourceLibraryBlock as OT_ResourceLibraryBlockContentType } from '@/cms/content-types/OT_ResourceLibraryBlock'
import { getResourceLibraryStyles }    from '@/cms/styling/OT_ResourceLibraryBlock.styling'
import { getResourceLibraryAssets }    from '@/lib/resourceLibrary'
import ResourceLibraryBlock, { ErrorState } from '@/components/blocks/ResourceLibraryBlock'

type Props = {
  content:          ContentProps<typeof OT_ResourceLibraryBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

// ─── OT_ResourceLibraryBlock adapter ─────────────────────────────────────────
//
// Async server component — fetches DAM assets from the configured folder.
//
// assets === null  →  folder ID not configured; shows "not configured" empty state.
// assets === []    →  folder is empty / no filter matches; shows empty state.
// Graph error      →  getResourceLibraryAssets catches and returns [].

export default async function OT_ResourceLibraryBlockAdapter({
  content,
  displaySettings = {},
}: Props) {
  const { pa }            = getPreviewUtils(content)
  const styleOptions      = getResourceLibraryStyles(content.layout ? { ...displaySettings, layout: content.layout } : displaySettings)
  const entranceAnimation = String(displaySettings?.entranceAnimation ?? 'none')

  const eyebrow    = content.eyebrow    ?? undefined
  const title      = content.title      ?? undefined
  const folderId   = content.damFolderId?.trim() || undefined

  // null = folder not configured; fetch only when folderId is present
  const assets = folderId
    ? await getResourceLibraryAssets(folderId, styleOptions.filterType)
    : null

  return (
    <div
      {...pa(content.__composition)}
      className="w-full"
      data-stagger={entranceAnimation !== 'none' ? entranceAnimation : undefined}
    >
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
