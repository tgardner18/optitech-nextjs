import { FolderOpen, AlertCircle } from 'lucide-react'
import { cva } from 'class-variance-authority'
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

// ─── CVA ─────────────────────────────────────────────────────────────────────

const sectionCva = cva('px-md lg:px-lg py-lg', {
  variants: {
    color: {
      canvas:  'bg-canvas',
      surface: 'bg-surface',
    },
  },
  defaultVariants: { color: 'canvas' },
})

// ─── Empty + error states ─────────────────────────────────────────────────────

function EmptyState({ message, sub }: { message: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-xl gap-md text-center">
      <FolderOpen className="w-10 h-10 text-fg-muted opacity-40" aria-hidden="true" />
      <div>
        <p className="text-title font-semibold text-fg-muted">{message}</p>
        {sub && <p className="text-label text-fg-muted/60 mt-xs">{sub}</p>}
      </div>
    </div>
  )
}

function ErrorState() {
  return (
    <div className="flex items-center justify-center gap-sm py-xl text-fg-muted">
      <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
      <p className="text-label font-semibold uppercase tracking-label">
        Files could not be loaded at this time
      </p>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export type ResourceLibraryBlockProps = {
  eyebrow?:      string
  title?:        string
  assets:        ResourceAsset[] | null
  styleOptions?: Partial<ResourceLibraryStyleOptions>
  pa?:           (prop: string) => { 'data-epi-property-name'?: string }
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

  return (
    <section className={sectionCva({ color })}>
      {/* ── Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-sm mb-md">
        <div>
          {eyebrow && (
            <p
              className="text-label tracking-label uppercase font-semibold text-fg-muted mb-xs"
              {...pa('eyebrow')}
            >
              {eyebrow}
            </p>
          )}
          {title && (
            <h2
              className="text-title font-semibold text-fg leading-tight"
              {...pa('title')}
            >
              {title}
            </h2>
          )}
        </div>

        {!unconfigured && !empty && (
          <span className="text-label tracking-label uppercase font-semibold text-fg-muted border border-fg/10 px-sm py-xs">
            {assets!.length} {assets!.length === 1 ? 'file' : 'files'}
          </span>
        )}
      </div>

      {/* ── Content ── */}
      {unconfigured ? (
        <EmptyState
          message="No collection selected"
          sub="Browse DAM and pick an anchor asset to populate this library."
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
          color={color}
          showFileSize={showFileSize}
          pageSize={pageSize}
          label={title}
        />
      )}
    </section>
  )
}

// ErrorState is exported so the adapter can render it on Graph failures
export { ErrorState }
