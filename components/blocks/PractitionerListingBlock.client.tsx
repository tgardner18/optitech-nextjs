'use client'

import { useMemo, useState, useId } from 'react'
import { Search, SlidersHorizontal, UserSearch, X, LayoutGrid, List } from 'lucide-react'
import type { PractitionerCardData } from '@/lib/practitioners'
import { parseLanguages } from '@/lib/practitionerFormat'
import type {
  PractitionerListingColor,
  PractitionerListingColumns,
  PractitionerListingDensity,
  PractitionerListingLayout,
} from '@/cms/styling/OT_PractitionerListingBlock.styling'
import PractitionerCard from '@/components/practitioner/PractitionerCard'
import PractitionerListRow from '@/components/practitioner/PractitionerListRow'

type Props = {
  practitioners: PractitionerCardData[]
  layout:        PractitionerListingLayout
  columns:       PractitionerListingColumns
  color:         PractitionerListingColor
  showSearch:    boolean
  showFilters:   boolean
  density:       PractitionerListingDensity
  emptyMessage:  string
}

const GRID_COLS: Record<PractitionerListingColumns, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        'inline-flex items-center px-sm py-1 text-label uppercase tracking-label font-semibold ' +
        'motion-safe:transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ' +
        (active
          ? 'bg-brand text-fg-on-brand'
          : 'border border-fg/15 text-fg-muted hover:text-fg hover:border-fg/35')
      }
    >
      {children}
    </button>
  )
}

// ─── Filter group ───────────────────────────────────────────────────────────────

function FilterGroup({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string
  options: string[]
  selected: string | null
  onSelect: (value: string | null) => void
}) {
  if (options.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-x-sm gap-y-xs">
      <span className="font-mono text-xs uppercase tracking-label text-fg-muted/60 mr-xs">{label}</span>
      <Chip active={selected === null} onClick={() => onSelect(null)}>
        All
      </Chip>
      {options.map(opt => (
        <Chip key={opt} active={selected === opt} onClick={() => onSelect(selected === opt ? null : opt)}>
          {opt}
        </Chip>
      ))}
    </div>
  )
}

// ─── View toggle ───────────────────────────────────────────────────────────────
//
// Segmented control letting the visitor switch between the card grid and the
// compact list, regardless of the CMS-set default layout.

function ViewToggle({
  view,
  onChange,
}: {
  view: PractitionerListingLayout
  onChange: (v: PractitionerListingLayout) => void
}) {
  const btn = (active: boolean) =>
    'inline-flex h-10 w-10 items-center justify-center motion-safe:transition-colors duration-150 ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ' +
    (active ? 'bg-brand text-fg-on-brand' : 'text-fg-muted hover:text-fg')

  return (
    <div className="inline-flex flex-none border border-fg/15" role="group" aria-label="Choose layout">
      <button type="button" aria-label="Grid view" aria-pressed={view === 'grid'} onClick={() => onChange('grid')} className={btn(view === 'grid')}>
        <LayoutGrid size={16} strokeWidth={2} aria-hidden />
      </button>
      <button type="button" aria-label="List view" aria-pressed={view === 'list'} onClick={() => onChange('list')} className={`${btn(view === 'list')} border-l border-fg/15`}>
        <List size={16} strokeWidth={2} aria-hidden />
      </button>
    </div>
  )
}

// ─── Directory client ─────────────────────────────────────────────────────────
//
// Owns search + filter state. Filter options are derived ONLY from the loaded
// practitioner set — never a fixed list — so the same block serves any vertical.

export default function PractitionerListingClient({
  practitioners,
  layout,
  columns,
  color,
  showSearch,
  showFilters,
  density,
  emptyMessage,
}: Props) {
  const [query, setQuery]   = useState('')
  const [area, setArea]     = useState<string | null>(null)
  const [language, setLang] = useState<string | null>(null)
  const [view, setView]     = useState<PractitionerListingLayout>(layout)
  const searchId = useId()

  const onSurface = color === 'surface'

  // Derive filter options from the loaded set.
  const { areaOptions, languageOptions } = useMemo(() => {
    const areas = new Map<string, string>()      // lowercased → display
    const langs = new Map<string, string>()
    for (const p of practitioners) {
      for (const a of p.practiceAreas) {
        if (a.areaName) {
          const k = a.areaName.toLowerCase()
          if (!areas.has(k)) areas.set(k, a.areaName)
        }
      }
      for (const l of parseLanguages(p.languages)) {
        const k = l.toLowerCase()
        if (!langs.has(k)) langs.set(k, l)
      }
    }
    const byLabel = (a: string, b: string) => a.localeCompare(b)
    return {
      areaOptions:     [...areas.values()].sort(byLabel),
      languageOptions: [...langs.values()].sort(byLabel),
    }
  }, [practitioners])

  // Apply search + filters.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return practitioners.filter(p => {
      if (area) {
        const has = p.practiceAreas.some(a => a.areaName?.toLowerCase() === area.toLowerCase())
        if (!has) return false
      }
      if (language) {
        const langs = parseLanguages(p.languages).map(l => l.toLowerCase())
        if (!langs.includes(language.toLowerCase())) return false
      }
      if (q) {
        const haystack = [
          p.firstName,
          p.lastName,
          p.credentials,
          ...p.practiceAreas.map(a => a.areaName),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [practitioners, query, area, language])

  const filtersActive = !!query || !!area || !!language
  const clearAll = () => {
    setQuery('')
    setArea(null)
    setLang(null)
  }

  const inputBg = onSurface ? 'bg-canvas' : 'bg-surface'

  const hasControls = (showSearch || showFilters) && (showSearch || areaOptions.length > 0 || languageOptions.length > 0)

  return (
    <div>
      {/* ── Controls ── */}
      <div className="mb-lg flex flex-col gap-md">
        {/* Search + view toggle share the top row; the toggle is always available
            so visitors can switch layout regardless of the CMS default. */}
        <div className="flex items-center gap-md">
          {showSearch && (
            <div className="relative flex-1 min-w-0 max-w-xl">
              <label htmlFor={searchId} className="sr-only">
                Search practitioners by name or specialty
              </label>
              <Search
                size={18}
                strokeWidth={1.75}
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-muted"
              />
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by name or specialty"
                className={`${inputBg} h-12 w-full rounded-input border border-fg/15 pl-11 ${query ? 'pr-11' : 'pr-4'} text-base text-fg placeholder:text-fg-muted/60 motion-safe:transition-[border-color,box-shadow] duration-150 focus:border-brand focus:outline-none focus:[box-shadow:0_0_0_2px_var(--ot-bloom-brand-ring)] [&::-webkit-search-cancel-button]:appearance-none`}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center text-fg-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <X size={16} strokeWidth={2} aria-hidden />
                </button>
              )}
            </div>
          )}

          <div className="ml-auto flex-none">
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>

        {showFilters && (areaOptions.length > 0 || languageOptions.length > 0) && (
          <div className="flex flex-col gap-sm">
            <FilterGroup label="Specialty" options={areaOptions} selected={area} onSelect={setArea} />
            <FilterGroup label="Language" options={languageOptions} selected={language} onSelect={setLang} />
          </div>
        )}
      </div>

      {/* ── Result count + clear ── */}
      {hasControls && (
        <div className="mb-md flex items-center justify-between gap-sm border-b border-fg/10 pb-sm">
          <p className="font-mono text-xs uppercase tracking-label text-fg-muted/70" aria-live="polite">
            <span className="text-fg">{results.length}</span>{' '}
            {results.length === 1 ? 'practitioner' : 'practitioners'}
          </p>
          {filtersActive && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-xs text-label uppercase tracking-label font-semibold text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <X size={13} strokeWidth={2} aria-hidden />
              Clear
            </button>
          )}
        </div>
      )}

      {/* ── Results ── */}
      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-sm py-2xl text-center">
          <span
            className="flex items-center justify-center w-14 h-14 text-brand"
            style={{
              background: 'oklch(from var(--ot-brand) l c h / 0.12)',
              border:     '1px solid var(--ot-bloom-brand-border)',
            }}
            aria-hidden
          >
            {filtersActive ? <SlidersHorizontal size={24} strokeWidth={1.5} /> : <UserSearch size={24} strokeWidth={1.5} />}
          </span>
          <p className="text-title font-semibold text-fg">{emptyMessage}</p>
          {filtersActive && (
            <button
              type="button"
              onClick={clearAll}
              className="btn-signal mt-xs inline-flex items-center gap-xs bg-brand text-fg-on-brand px-md py-sm text-label uppercase tracking-label font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Clear search & filters
            </button>
          )}
        </div>
      ) : view === 'list' ? (
        <ul className={`flex flex-col ${density === 'compact' ? 'gap-sm' : 'gap-md'}`}>
          {results.map(p => (
            <li key={p.key}>
              <PractitionerListRow practitioner={p} onSurface={onSurface} density={density} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className={`grid grid-cols-1 ${GRID_COLS[columns]} ${density === 'compact' ? 'gap-sm' : 'gap-md'}`}>
          {results.map(p => (
            <li key={p.key} className="flex">
              <PractitionerCard practitioner={p} onSurface={onSurface} density={density} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
