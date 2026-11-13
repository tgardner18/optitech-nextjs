import { FolderOpen, AlertCircle } from 'lucide-react'
import type { ResourceAsset } from '@/lib/resourceLibrary'
import ResourceLibraryClient from './ResourceLibraryClient'

// ─── Style option types ───────────────────────────────────────────────────────

export type ResourceLibraryStyleOptions = {
  layout:       'list' | 'grid'
  color:        'canvas' | 'surface'
  showFileSize: boolean
  filterType:   'all' | 'documents' | 'images' | 'video'
  pageSize:     number
}

// ─── Empty + error states ─────────────────────────────────────────────────────

function EmptyState({ message, sub }: { message: string; sub?: string }) {
  return (
    <div data-part="empty" role="status">
      <span data-part="empty-ic" aria-hidden="true"><FolderOpen size={26} strokeWidth={1.75} /></span>
      <p data-part="empty-t">{message}</p>
      {sub && <p data-part="empty-d">{sub}</p>}
    </div>
  )
}

function ErrorState() {
  return (
    <div data-block="resources" data-color="canvas">
      <div data-part="in">
        <div data-part="empty" role="status">
          <span data-part="empty-ic" aria-hidden="true"><AlertCircle size={26} strokeWidth={1.75} /></span>
          <p data-part="empty-t">Files could not be loaded at this time</p>
        </div>
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export type ResourceLibraryBlockProps = {
  eyebrow?:      string
  title?:        string
  assets:        ResourceAsset[] | null
  styleOptions?: Partial<ResourceLibraryStyleOptions>
  pa?:           (prop?: string | { key: string }) => Record<string, string | undefined>
}

export default function ResourceLibraryBlock({
  eyebrow,
  title,
  assets,
  styleOptions = {},
  pa = () => ({}),
}: ResourceLibraryBlockProps) {
  const {
    layout       = 'list',
    color        = 'canvas',
    showFileSize = false,
    pageSize     = 12,
  } = styleOptions

  const unconfigured = assets === null
  const empty        = !unconfigured && assets.length === 0

  const hasHead = Boolean(eyebrow || title)

  return (
    <section data-block="resources" data-color={color}>
      <div data-part="in">
        {hasHead && (
          <header data-part="head">
            {eyebrow && <p data-part="eyebrow" {...pa('eyebrow')}>{eyebrow}</p>}
            {title && <h2 {...pa('title')}>{title}</h2>}
          </header>
        )}

        {unconfigured ? (
          <EmptyState
            message="No folder configured"
            sub="Enter a DAM Folder ID in the block properties to populate this library."
          />
        ) : empty ? (
          <EmptyState
            message="No files available"
            sub="This collection is empty or no files match the current filter."
          />
        ) : (
          <ResourceLibraryClient
            assets={assets!}
            defaultLayout={layout}
            showFileSize={showFileSize}
            pageSize={pageSize}
            label={title}
          />
        )}
      </div>
    </section>
  )
}

// ErrorState is exported so the adapter can render it on Graph failures
export { ErrorState }
