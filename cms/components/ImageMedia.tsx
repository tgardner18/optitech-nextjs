import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'

// Preview adapter for the built-in ImageMedia asset type.
// When an image is selected in the CMS media library and opened in the
// Visual Builder preview, this component renders it. The image URL lives
// in content._metadata.url.default (src() resolves it + appends the
// preview token). Max-height caps the render so it doesn't flood the canvas.

type Props = {
  content: any
  displaySettings?: Record<string, string | boolean>
}

export default function ImageMediaAdapter({ content }: Props) {
  const { pa, src } = getPreviewUtils(content)
  // _metadata.url has shape { default, hierarchical, ... } — src() reads .default
  const imageSrc = src(content._metadata)
  const alt       = content._metadata?.displayName ?? ''
  const mimeType  = content._metadata?.mimeType    ?? ''

  if (!imageSrc) {
    return (
      <div
        {...pa(content.__composition)}
        className="w-full flex items-center justify-center bg-surface border border-fg/10 rounded"
        style={{ minHeight: 200 }}
      >
        <p className="text-label text-fg-muted/60 font-mono px-md">
          Image not available — publish the asset to display it here
        </p>
      </div>
    )
  }

  return (
    <div
      {...pa(content.__composition)}
      className="w-full flex flex-col items-center gap-sm p-md"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={alt}
        className="max-w-full w-auto object-contain rounded"
        style={{ maxHeight: 480 }}
      />
      {(alt || mimeType) && (
        <p className="text-label text-fg-muted font-mono text-center">
          {alt}
          {mimeType && <span className="ml-sm opacity-50">{mimeType}</span>}
        </p>
      )}
    </div>
  )
}
