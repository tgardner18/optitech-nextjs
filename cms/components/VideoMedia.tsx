import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'

// Preview adapter for the built-in VideoMedia asset type.
// When a video is selected in the CMS media library and opened in the
// Visual Builder preview, this component renders it. The video URL lives
// in content._metadata.url.default (src() resolves it + appends the
// preview token), mirroring ImageMediaAdapter for the '_video' base type.

type Props = {
  content: any
  displaySettings?: Record<string, string | boolean>
}

export default function VideoMediaAdapter({ content }: Props) {
  const { pa, src } = getPreviewUtils(content)
  const videoSrc = src(content._metadata)
  const label    = content._metadata?.displayName ?? ''
  const mimeType = content._metadata?.mimeType    ?? ''

  if (!videoSrc) {
    return (
      <div
        {...pa(content.__composition)}
        className="w-full flex items-center justify-center bg-surface border border-fg/10 rounded"
        style={{ minHeight: 200 }}
      >
        <p className="text-label text-fg-muted/60 font-mono px-md">
          Video not available — publish the asset to display it here
        </p>
      </div>
    )
  }

  return (
    <div
      {...pa(content.__composition)}
      className="w-full flex flex-col items-center gap-sm p-md"
    >
      <video
        src={videoSrc}
        controls
        muted
        className="max-w-full w-auto object-contain rounded"
        style={{ maxHeight: 480 }}
      />
      {(label || mimeType) && (
        <p className="text-label text-fg-muted font-mono text-center">
          {label}
          {mimeType && <span className="ml-sm opacity-50">{mimeType}</span>}
        </p>
      )}
    </div>
  )
}
