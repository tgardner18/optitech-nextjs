'use client'

import { useState, useCallback } from 'react'
import {
  LayoutGrid, List, ChevronLeft, ChevronRight,
  File, FileText, Image as LucideImage, Video, Archive, ArrowDownToLine,
  type LucideIcon,
} from 'lucide-react'
import { cva } from 'class-variance-authority'
import type { ResourceAsset } from '@/lib/resourceLibrary'

// ─── Helpers ──────────────────────────────────────────────────────────────────

type FileKind = { icon: LucideIcon; label: string }

function resolveFileKind(extension: string | null): FileKind {
  const ext = (extension ?? '').toLowerCase().replace(/^\./, '')
  if (['pdf'].includes(ext))
    return { icon: FileText, label: 'PDF' }
  if (['doc', 'docx', 'odt', 'rtf'].includes(ext))
    return { icon: FileText, label: ext.toUpperCase() }
  if (['ppt', 'pptx', 'odp', 'key'].includes(ext))
    return { icon: File, label: ext.toUpperCase() }
  if (['xls', 'xlsx', 'ods', 'csv'].includes(ext))
    return { icon: File, label: ext.toUpperCase() }
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'bmp', 'tiff'].includes(ext))
    return { icon: LucideImage, label: ext.toUpperCase() }
  if (['mp4', 'mov', 'avi', 'webm', 'mkv', 'wmv'].includes(ext))
    return { icon: Video, label: ext.toUpperCase() }
  if (['zip', 'rar', 'tar', 'gz', '7z', 'bz2'].includes(ext))
    return { icon: Archive, label: ext.toUpperCase() }
  return { icon: File, label: ext ? ext.toUpperCase() : 'FILE' }
}

function formatFileSize(bytes: number | null): string | null {
  if (bytes === null || bytes <= 0) return null
  if (bytes < 1024)            return `${bytes} B`
  if (bytes < 1024 * 1024)     return `${Math.round(bytes / 1024)} KB`
  if (bytes < 1024 ** 3)       return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`
}

function downloadFilename(asset: ResourceAsset): string {
  const ext = asset.extension ? `.${asset.extension.replace(/^\./, '')}` : ''
  return `${asset.title}${ext}`
}

// ─── CVA ──────────────────────────────────────────────────────────────────────

const cardCva = cva(
  'resource-card group h-full flex flex-col overflow-hidden border border-fg/8',
  {
    variants: {
      color: {
        canvas:  'bg-surface',
        surface: 'bg-canvas/50',
      },
    },
    defaultVariants: { color: 'canvas' },
  },
)

// ─── Sub-components ───────────────────────────────────────────────────────────

function IconChip({ icon: Icon, size = 'md' }: { icon: LucideIcon; size?: 'sm' | 'md' | 'lg' }) {
  const sizeCls = {
    sm: 'w-8 h-8 [&>svg]:w-4 [&>svg]:h-4',
    md: 'w-10 h-10 [&>svg]:w-5 [&>svg]:h-5',
    lg: 'w-12 h-12 [&>svg]:w-6 [&>svg]:h-6',
  }[size]
  return (
    <div
      className={`shrink-0 flex items-center justify-center bg-brand/10 text-brand ${sizeCls}`}
      aria-hidden="true"
    >
      <Icon />
    </div>
  )
}

function ExtBadge({ label }: { label: string }) {
  return (
    <span className="text-label tracking-label uppercase font-semibold text-fg-muted border border-fg/10 px-[6px] py-px">
      {label}
    </span>
  )
}

function TagPill({ tag }: { tag: string }) {
  return (
    <span className="text-label font-medium text-fg-muted/80 bg-fg/[0.06] border border-fg/8 px-[6px] py-px">
      {tag}
    </span>
  )
}

// ─── List row ─────────────────────────────────────────────────────────────────

function ListRow({ asset, showFileSize }: { asset: ResourceAsset; showFileSize: boolean }) {
  const { icon, label } = resolveFileKind(asset.extension)
  const size     = formatFileSize(asset.fileSize)
  const filename = downloadFilename(asset)

  return (
    <a
      href={asset.url}
      download={filename}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-md px-md py-[14px] border-t border-fg/5 hover:bg-fg/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-0 motion-safe:transition-colors motion-safe:duration-150"
      aria-label={`Download ${asset.title} (${label}${size ? `, ${size}` : ''})`}
    >
      <IconChip icon={icon} size="md" />

      <div className="flex-1 min-w-0">
        <p className="text-body font-medium text-fg leading-tight truncate">{asset.title}</p>
        {asset.description && (
          <p className="text-label text-fg-muted mt-[2px] truncate">{asset.description}</p>
        )}
        {asset.tags && asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-xs mt-[5px]">
            {asset.tags.slice(0, 4).map(tag => <TagPill key={tag} tag={tag} />)}
          </div>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-sm shrink-0">
        <ExtBadge label={label} />
        {showFileSize && size && (
          <span className="text-label text-fg-muted font-semibold tracking-label tabular-nums">
            {size}
          </span>
        )}
      </div>

      <div
        className="shrink-0 ml-sm text-brand opacity-60 group-hover:opacity-100 motion-safe:transition-[opacity,transform] motion-safe:duration-150 group-hover:translate-x-1"
        aria-hidden="true"
      >
        <ArrowDownToLine className="w-5 h-5" />
      </div>
    </a>
  )
}

// ─── Grid card ────────────────────────────────────────────────────────────────

function GridCard({
  asset,
  color,
  showFileSize,
}: {
  asset: ResourceAsset
  color: 'canvas' | 'surface'
  showFileSize: boolean
}) {
  const { icon, label } = resolveFileKind(asset.extension)
  const size     = formatFileSize(asset.fileSize)
  const filename = downloadFilename(asset)
  const Icon     = icon

  return (
    <div className={cardCva({ color })}>
      {/* Brand header band — scan-line sweeps on card hover (CSS .resource-card-band::after) */}
      <div className="resource-card-band bg-brand flex items-center justify-center h-20 shrink-0">
        {/* dur-exempt: 240ms — icon hover lift; nearest token quick(200ms) Δ40ms / base(320ms) Δ80ms, would change feel */}
        <div
          className="relative z-10 text-fg-on-brand opacity-70 group-hover:opacity-100 motion-safe:transition-[transform,opacity] motion-safe:duration-[240ms] motion-safe:ease-kinetic motion-safe:group-hover:-translate-y-[3px] motion-safe:group-hover:scale-110"
          aria-hidden="true"
        >
          <Icon className="w-9 h-9" />
        </div>
      </div>

      {/* Body — flex-1 ensures the download CTA always sits at the card foot */}
      <div className="flex flex-col gap-sm px-md pt-md pb-md flex-1">
        <p
          className="text-body font-semibold text-fg leading-snug line-clamp-3"
          title={asset.title}
        >
          {asset.title}
        </p>

        <div className="flex items-center flex-wrap gap-sm">
          <ExtBadge label={label} />
          {showFileSize && size && (
            <span className="text-label text-fg-muted font-semibold tracking-label tabular-nums">
              {size}
            </span>
          )}
        </div>

        {asset.description && (
          <p className="text-label text-fg-muted line-clamp-2">{asset.description}</p>
        )}

        {asset.tags && asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-xs mt-auto pt-xs">
            {asset.tags.slice(0, 3).map(tag => <TagPill key={tag} tag={tag} />)}
          </div>
        )}
      </div>

      {/* Download CTA — pre-activates on card group-hover, deeper on direct hover */}
      <a
        href={asset.url}
        download={filename}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-sm px-md py-sm border-t border-fg/8
          text-label font-semibold tracking-label uppercase text-fg-muted
          group-hover:text-fg group-hover:bg-brand/[0.08]
          hover:text-fg-on-brand hover:bg-brand hover:border-brand
          motion-safe:transition-[color,background-color,border-color] motion-safe:duration-(--ot-dur-quick) motion-safe:ease-quick
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
        aria-label={`Download ${asset.title} (${label}${size ? `, ${size}` : ''})`}
      >
        <ArrowDownToLine
          className="w-4 h-4 motion-safe:transition-transform motion-safe:duration-(--ot-dur-quick) motion-safe:ease-kinetic motion-safe:group-hover:translate-y-[2px] motion-safe:hover:translate-y-[4px]"
          aria-hidden="true"
        />
        Download
      </a>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onChange,
}: {
  page:       number
  totalPages: number
  total:      number
  pageSize:   number
  onChange:   (p: number) => void
}) {
  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to   = Math.min(page * pageSize, total)

  const btnBase     = 'inline-flex items-center justify-center w-9 h-9 border text-label font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
  const btnInactive = 'border-fg/15 text-fg-muted hover:border-fg/30 hover:text-fg'
  const btnActive   = 'bg-brand border-transparent text-fg-on-brand'
  const btnDisabled = 'border-fg/8 text-fg/25 cursor-not-allowed'

  // Always show first, last, and ±1 around current; insert ellipsis for gaps
  const pages = new Set<number>()
  pages.add(1)
  pages.add(totalPages)
  for (let i = Math.max(1, page - 1); i <= Math.min(totalPages, page + 1); i++) pages.add(i)
  const pageList = [...pages].sort((a, b) => a - b)

  return (
    <div className="mt-xl flex flex-col items-center gap-md">
      <p className="text-label text-fg-muted">
        Showing <strong>{from}–{to}</strong> of <strong>{total}</strong> files
      </p>
      <div className="flex items-center gap-xs">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className={`${btnBase} ${page <= 1 ? btnDisabled : btnInactive}`}
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </button>

        {pageList.map((p, i) => {
          const prev    = pageList[i - 1]
          const showGap = prev !== undefined && p - prev > 1
          return (
            <span key={p} className="flex items-center gap-xs">
              {showGap && (
                <span className="w-9 text-center text-label select-none text-fg-muted">…</span>
              )}
              <button
                type="button"
                aria-label={`Page ${p}`}
                aria-current={p === page ? 'page' : undefined}
                onClick={() => onChange(p)}
                className={`${btnBase} ${p === page ? btnActive : btnInactive}`}
              >
                {p}
              </button>
            </span>
          )
        })}

        <button
          type="button"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className={`${btnBase} ${page >= totalPages ? btnDisabled : btnInactive}`}
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

// ─── ResourceLibraryClient ────────────────────────────────────────────────────

export type ResourceLibraryClientProps = {
  assets:        ResourceAsset[]
  defaultLayout: 'list' | 'grid'
  color:         'canvas' | 'surface'
  showFileSize:  boolean
  pageSize:      number
  label?:        string
}

type View = 'grid' | 'list'

export default function ResourceLibraryClient({
  assets,
  defaultLayout,
  color,
  showFileSize,
  pageSize,
  label,
}: ResourceLibraryClientProps) {
  const [view, setView] = useState<View>(defaultLayout)
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(assets.length / pageSize))
  const safePage   = Math.min(page, totalPages)
  const pageAssets = assets.slice((safePage - 1) * pageSize, safePage * pageSize)

  const changePage = useCallback((p: number) => {
    setPage(p)
    window.scrollBy({ top: -120, behavior: 'smooth' })
  }, [])

  const toggleBase     = 'p-[7px] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
  const toggleActive   = 'text-brand'
  const toggleInactive = 'text-fg-muted/50 hover:text-fg-muted'

  return (
    <div>
      {/* ── View toggle ── */}
      <div className="flex items-center justify-end mb-md">
        <div className="flex items-center gap-0" role="group" aria-label="View mode">
          <button
            type="button"
            aria-label="Grid view"
            aria-pressed={view === 'grid'}
            onClick={() => setView('grid')}
            className={`${toggleBase} ${view === 'grid' ? toggleActive : toggleInactive}`}
          >
            <LayoutGrid size={17} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="List view"
            aria-pressed={view === 'list'}
            onClick={() => setView('list')}
            className={`${toggleBase} ${view === 'list' ? toggleActive : toggleInactive}`}
          >
            <List size={17} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* ── Asset list / grid ── */}
      {view === 'list' ? (
        <div className="border border-fg/8" role="list" aria-label={label ?? 'Resource library'}>
          {pageAssets.map((asset, i) => (
            <div key={`${asset.url}-${i}`} role="listitem">
              <ListRow asset={asset} showFileSize={showFileSize} />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="grid gap-md"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
          role="list"
          aria-label={label ?? 'Resource library'}
        >
          {pageAssets.map((asset, i) => (
            <div key={`${asset.url}-${i}`} role="listitem" className="flex flex-col">
              <GridCard asset={asset} color={color} showFileSize={showFileSize} />
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      <Pagination
        page={safePage}
        totalPages={totalPages}
        total={assets.length}
        pageSize={pageSize}
        onChange={changePage}
      />
    </div>
  )
}
