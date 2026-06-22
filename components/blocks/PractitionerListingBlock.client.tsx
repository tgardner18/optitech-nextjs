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
import MultiSelect from '@/components/ui/MultiSelect'
import PractitionerCard from '@/components/practitioner/PractitionerCard'
import PractitionerListRow from '@/components/practitioner/PractitionerListRow'

type Props = {
  practitioners: PractitionerCardData[]
  layout:        PractitionerListingLayout
  columns:       PractitionerListingColumns
  color:         PractitionerListingColor
  showSearchFilters: boolean
  density:       PractitionerListingDensity
  emptyMessage:  string
}

const GRID_COLS: Record<PractitionerListingColumns, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
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
    'inline-flex h-12 w-12 items-center justify-center motion-safe:transition-colors duration-150 ' +
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
// Owns search + filter state. The three facets (specialty, location, language)
// are derived ONLY from the loaded practitioner set — never a fixed list — so
// the same block serves any vertical. Each facet is multi-select: values OR
// within a facet, facets AND across each other.

export default function PractitionerListingClient({
  practitioners,
  layout,
  columns,
  color,
  showSearchFilters,
  density,
  emptyMessage,
}: Props) {
  const [query, setQuery]         = useState('')
  const [areas, setAreas]         = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [langs, setLangs]         = useState<string[]>([])
  const [view, setView]           = useState<PractitionerListingLayout>(layout)
  const searchId = useId()

  const onSurface = color === 'surface'

  // Derive facet options from the loaded set, de-duplicated case-insensitively.
  const { areaOptions, locationOptions, languageOptions } = useMemo(() => {
    const a = new Map<string, string>()   // lowercased → display
    const loc = new Map<string, string>()
    const l = new Map<string, string>()
    const add = (m: Map<string, string>, raw: string | undefined) => {
      const v = raw?.trim()
      if (!v) return
      const k = v.toLowerCase()
      if (!m.has(k)) m.set(k, v)
    }
    for (const p of practitioners) {
      for (const area of p.practiceAreas) add(a, area.areaName)
      add(loc, p.officeLocation)
      for (const lang of parseLanguages(p.languages)) add(l, lang)
    }
    const byLabel = (x: string, y: string) => x.localeCompare(y)
    return {
      areaOptions:     [...a.values()].sort(byLabel),
      locationOptions: [...loc.values()].sort(byLabel),
      languageOptions: [...l.values()].sort(byLabel),
    }
  }, [practitioners])

  // Apply search + filters: OR within a facet, AND across facets.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const areaSet = new Set(areas.map(s => s.toLowerCase()))
    const locSet  = new Set(locations.map(s => s.toLowerCase()))
    const langSet = new Set(langs.map(s => s.toLowerCase()))

    return practitioners.filter(p => {
      if (areaSet.size) {
        const match = p.practiceAreas.some(a => a.areaName && areaSet.has(a.areaName.toLowerCase()))
        if (!match) return false
      }
      if (locSet.size) {
        const loc = p.officeLocation?.trim().toLowerCase()
        if (!loc || !locSet.has(loc)) return false
      }
      if (langSet.size) {
        const pls = parseLanguages(p.languages).map(l => l.toLowerCase())
        if (!pls.some(l => langSet.has(l))) return false
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
  }, [practitioners, query, areas, locations, langs])

  const filtersActive = !!query || areas.length > 0 || locations.length > 0 || langs.length > 0
  const clearAll = () => {
    setQuery('')
    setAreas([])
    setLocations([])
    setLangs([])
  }

  const inputBg = onSurface ? 'bg-canvas' : 'bg-surface'
  const hasControls = showSearchFilters

  return (
    <div>
      {/* ── Controls ── */}
      <div className={`mb-lg flex flex-col gap-md ${hasControls ? 'border-b border-fg/10 pb-md' : ''}`}>
        {/* Search + view toggle share the top row; the toggle is always available
            so visitors can switch layout regardless of the CMS default. */}
        <div className="flex items-center gap-md">
          {showSearchFilters && (
            // Width cap uses the numeric spacing multiplier (136 = 34rem), NOT a
            // named size: this theme's spacing tokens (xs..2xl) shadow Tailwind's
            // container scale, so max-w-xl resolves to --spacing-xl (64px), not
            // 36rem, and would collapse the field. Every named max-w in that
            // token range has the same trap.
            <div className="relative flex-1 min-w-0 max-w-136">
              <label htmlFor={searchId} className="sr-only">
                Search by name or specialty
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

        {/* Facet dropdowns + result meta. Dropdowns cluster left; count + clear
            sit right, wrapping below the facets on narrow viewports. */}
        {showSearchFilters && (
          <div className="flex flex-col gap-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-sm">
              {areaOptions.length > 0 && (
                <MultiSelect
                  label="Specialty"
                  options={areaOptions}
                  selected={areas}
                  onChange={setAreas}
                  onSurface={onSurface}
                  searchPlaceholder="Filter specialties"
                />
              )}
              {locationOptions.length > 0 && (
                <MultiSelect
                  label="Location"
                  options={locationOptions}
                  selected={locations}
                  onChange={setLocations}
                  onSurface={onSurface}
                  searchPlaceholder="Filter locations"
                />
              )}
              {languageOptions.length > 0 && (
                <MultiSelect
                  label="Language"
                  options={languageOptions}
                  selected={langs}
                  onChange={setLangs}
                  onSurface={onSurface}
                  searchPlaceholder="Filter languages"
                />
              )}
            </div>

            <div className="flex items-center gap-md">
              <p className="font-mono text-xs uppercase tracking-label text-fg-muted/70" aria-live="polite">
                <span className="text-fg">{results.length}</span>{' '}
                {results.length === 1 ? 'profile' : 'profiles'}
              </p>
              {filtersActive && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-xs text-label uppercase tracking-label font-semibold text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <X size={13} strokeWidth={2} aria-hidden />
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}
      </div>

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
