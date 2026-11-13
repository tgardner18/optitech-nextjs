'use client'

import { useState, useCallback, useId, useMemo, useRef } from 'react'
import {
  LayoutGrid, List, Search, X, ArrowDownToLine,
  File, FileText, FileSpreadsheet, Presentation, Image as LucideImage, Video, Archive,
  type LucideIcon,
} from 'lucide-react'
import Pagination from '@/components/ui/Pagination'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import type { ResourceAsset } from '@/lib/resourceLibrary'

// Presentation lives in components/blocks/resource-library.css, keyed on the data attributes below.

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FAMILIES: Record<string, string[]> = {
  Documents:     ['pdf', 'doc', 'docx', 'odt', 'rtf', 'txt'],
  Spreadsheets:  ['xls', 'xlsx', 'ods', 'csv'],
  Presentations: ['ppt', 'pptx', 'odp', 'key'],
  Images:        ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'bmp', 'tiff'],
  Video:         ['mp4', 'mov', 'avi', 'webm', 'mkv', 'wmv'],
  Archives:      ['zip', 'rar', 'tar', 'gz', '7z', 'bz2'],
}
const FAMILY_ORDER = [...Object.keys(FAMILIES), 'Other']
const FAMILY_ICON: Record<string, LucideIcon> = {
  Documents: FileText, Spreadsheets: FileSpreadsheet, Presentations: Presentation,
  Images: LucideImage, Video, Archives: Archive, Other: File,
}
const TYPE_WORD: Record<string, string> = {
  pdf: 'PDF document', doc: 'Word document', docx: 'Word document', odt: 'Text document', rtf: 'Text document',
  txt: 'Text file', xls: 'Excel spreadsheet', xlsx: 'Excel spreadsheet', csv: 'CSV spreadsheet',
  ppt: 'PowerPoint presentation', pptx: 'PowerPoint presentation', zip: 'ZIP archive',
}

const extOf = (a: ResourceAsset) => (a.extension ?? '').toLowerCase().replace(/^\./, '')
const familyOf = (ext: string) => FAMILY_ORDER.find(f => FAMILIES[f]?.includes(ext)) ?? 'Other'
const wordOf = (ext: string) => TYPE_WORD[ext] ?? (ext ? `${ext.toUpperCase()} file` : 'File')

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

// ─── One file: an article whose title is the link, stretched over the whole row or card ───

function FileItem({ asset, view, showFileSize }: { asset: ResourceAsset; view: 'grid' | 'list'; showFileSize: boolean }) {
  const ext    = extOf(asset)
  const fam    = familyOf(ext)
  const Icon   = FAMILY_ICON[fam]
  const size   = showFileSize ? formatFileSize(asset.fileSize) : null
  const word   = wordOf(ext)
  const tags   = asset.tags ?? []
  const cap    = view === 'grid' ? 3 : 4

  const body = (
    <>
      <h3 data-part="title">
        <a data-part="link" href={asset.url} download={downloadFilename(asset)} target="_blank" rel="noopener noreferrer">
          {asset.title}
          <span className="sr-only"> ({word}{size ? `, ${size}` : ''}, opens in a new tab)</span>
        </a>
      </h3>
      <p data-part="meta"><span>{word}</span>{size && <span>{size}</span>}</p>
      {asset.description && <p data-part="desc">{asset.description}</p>}
      {tags.length > 0 && (
        <ul data-part="tags" aria-label="Tags">
          {tags.slice(0, cap).map(tag => <li key={tag}>{tag}</li>)}
          {tags.length > cap && <li data-more="">+{tags.length - cap}</li>}
        </ul>
      )}
    </>
  )
  const dl = (
    <span data-part="dl" aria-hidden="true"><ArrowDownToLine size={18} strokeWidth={2} /><span data-part="dl-t">Download</span></span>
  )

  if (view === 'grid') {
    return (
      <li>
        <article data-part="card">
          <div data-part="band">
            <span data-part="band-ic" aria-hidden="true"><Icon size={34} strokeWidth={1.6} /></span>
            <b data-part="band-t">{ext ? ext.toUpperCase() : 'FILE'}</b>
          </div>
          <div data-part="card-body">{body}</div>
          {dl}
        </article>
      </li>
    )
  }
  return (
    <li>
      <article data-part="item">
        <span data-part="tile" aria-hidden="true"><Icon size={22} strokeWidth={1.75} /><b>{ext ? ext.toUpperCase() : 'FILE'}</b></span>
        <div data-part="body">{body}</div>
        {dl}
      </article>
    </li>
  )
}

// ─── ResourceLibraryClient ────────────────────────────────────────────────────

export type ResourceLibraryClientProps = {
  assets:        ResourceAsset[]
  defaultLayout: 'list' | 'grid'
  showFileSize:  boolean
  pageSize:      number
  label?:        string
}

type View = 'grid' | 'list'

export default function ResourceLibraryClient({ assets, defaultLayout, showFileSize, pageSize, label }: ResourceLibraryClientProps) {
  const [view, setView] = useState<View>(defaultLayout)
  const [page, setPage] = useState(1)
  const [q, setQ]       = useState('')
  const [type, setType] = useState<string>('all')
  const prefersReducedMotion = usePrefersReducedMotion()
  const searchId = useId()
  const listRef  = useRef<HTMLUListElement>(null)

  // Search and file-type chips only earn their place once there is more than one page to look through.
  const many = assets.length > pageSize

  const families = useMemo(() => {
    const counts = new Map<string, number>()
    for (const a of assets) counts.set(familyOf(extOf(a)), (counts.get(familyOf(extOf(a))) ?? 0) + 1)
    return FAMILY_ORDER.filter(f => counts.has(f)).map(f => ({ key: f, count: counts.get(f)! }))
  }, [assets])

  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return assets.filter(a =>
      (type === 'all' || familyOf(extOf(a)) === type) &&
      (!needle || [a.title, a.description ?? '', ...(a.tags ?? [])].join(' ').toLowerCase().includes(needle)),
    )
  }, [assets, q, type])

  const totalPages = Math.max(1, Math.ceil(matches.length / pageSize))
  const safePage   = Math.min(page, totalPages)
  const pageAssets = matches.slice((safePage - 1) * pageSize, safePage * pageSize)
  const from       = (safePage - 1) * pageSize + 1
  const to         = Math.min(safePage * pageSize, matches.length)
  const filtered   = q.trim() !== '' || type !== 'all'

  const changePage = useCallback((p: number) => {
    setPage(p)
    // Bring the top of the list into view (instant for visitors who prefer reduced motion).
    listRef.current?.scrollIntoView({ block: 'start', behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }, [prefersReducedMotion])

  return (
    <>
      <div data-part="controls">
        {many && (
          <div data-part="field">
            <Search data-part="field-ic" size={18} strokeWidth={2} aria-hidden />
            <label htmlFor={searchId} className="sr-only">Search resources</label>
            <input
              id={searchId}
              type="search"
              value={q}
              onChange={e => { setQ(e.target.value); setPage(1) }}
              placeholder="Search by title, description, or tag"
              autoComplete="off"
            />
            {q && (
              <button type="button" data-part="icon-btn" aria-label="Clear search" onClick={() => { setQ(''); setPage(1) }}>
                <X size={16} strokeWidth={2} aria-hidden />
              </button>
            )}
          </div>
        )}

        <div data-part="toggle" role="group" aria-label="Layout">
          <button type="button" aria-label="Grid" aria-pressed={view === 'grid'} onClick={() => setView('grid')}>
            <LayoutGrid size={18} strokeWidth={1.75} aria-hidden />
          </button>
          <button type="button" aria-label="List" aria-pressed={view === 'list'} onClick={() => setView('list')}>
            <List size={18} strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        {many && families.length > 1 && (
          <div data-part="types" role="group" aria-label="File type">
            <button type="button" data-part="chip" aria-pressed={type === 'all'} onClick={() => { setType('all'); setPage(1) }}>
              All<span data-part="chip-n">{assets.length}</span>
            </button>
            {families.map(f => (
              <button key={f.key} type="button" data-part="chip" aria-pressed={type === f.key} onClick={() => { setType(f.key); setPage(1) }}>
                {f.key}<span data-part="chip-n">{f.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <p data-part="status" role="status">
        {matches.length > 0 && (
          <>
            Showing <b>{from}–{to}</b> of <b>{matches.length}</b> {matches.length === 1 ? 'file' : 'files'}
            {filtered ? (matches.length === 1 ? ' that matches' : ' that match') : ''}
          </>
        )}
      </p>

      {matches.length > 0 ? (
        <ul ref={listRef} data-part={view === 'grid' ? 'cards' : 'list'} aria-label={label ?? 'Resource library'}>
          {pageAssets.map((asset, i) => (
            <FileItem key={`${asset.url}-${i}`} asset={asset} view={view} showFileSize={showFileSize} />
          ))}
        </ul>
      ) : (
        <div data-part="empty" role="status">
          <span data-part="empty-ic" aria-hidden="true"><Search size={26} strokeWidth={1.75} /></span>
          <p data-part="empty-t">No files match</p>
          <p data-part="empty-d">Try a different word, or clear the search and file type.</p>
        </div>
      )}

      <Pagination page={safePage} totalPages={totalPages} onChange={changePage} label="Resource pages" />
    </>
  )
}
