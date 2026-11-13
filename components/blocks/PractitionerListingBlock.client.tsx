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
import Button from '@/components/ui/Button'
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

// ─── View toggle ───────────────────────────────────────────────────────────────
// Segmented control to switch between the card grid and the list, whatever the CMS default.

function ViewToggle({
  view,
  onChange,
}: {
  view: PractitionerListingLayout
  onChange: (v: PractitionerListingLayout) => void
}) {
  return (
    <div data-part="toggle" role="group" aria-label="Layout">
      <button type="button" aria-label="Grid" aria-pressed={view === 'grid'} onClick={() => onChange('grid')}>
        <LayoutGrid size={18} strokeWidth={2} aria-hidden />
      </button>
      <button type="button" aria-label="List" aria-pressed={view === 'list'} onClick={() => onChange('list')}>
        <List size={18} strokeWidth={2} aria-hidden />
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
  const { areaOptions, locationOptions, languageOptions, areaCounts, locationCounts, languageCounts } = useMemo(() => {
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
    // How many profiles each option matches, so the dropdown can show it.
    const tally = (m: Map<string, string>, vals: (p: PractitionerCardData) => (string | undefined)[]) => {
      const out: Record<string, number> = {}
      for (const [k, display] of m) {
        out[display] = practitioners.filter(p => vals(p).some(v => v?.trim().toLowerCase() === k)).length
      }
      return out
    }
    const byLabel = (x: string, y: string) => x.localeCompare(y)
    return {
      areaOptions:     [...a.values()].sort(byLabel),
      locationOptions: [...loc.values()].sort(byLabel),
      languageOptions: [...l.values()].sort(byLabel),
      areaCounts:      tally(a,   p => p.practiceAreas.map(x => x.areaName)),
      locationCounts:  tally(loc, p => [p.officeLocation]),
      languageCounts:  tally(l,   p => parseLanguages(p.languages)),
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

  const hasControls = showSearchFilters
  const facets = [
    { label: 'Specialty', values: areas,     set: setAreas },
    { label: 'Location',  values: locations, set: setLocations },
    { label: 'Language',  values: langs,     set: setLangs },
  ]

  return (
    <>
      {/* ── Controls ── */}
      <div data-part="controls" data-min={hasControls ? undefined : ''}>
        <div data-part="bar">
          {showSearchFilters && (
            <div data-part="field">
              <Search size={18} strokeWidth={2} data-part="field-ic" aria-hidden />
              <label htmlFor={searchId} className="sr-only">Search by name or specialty</label>
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by name or specialty"
                autoComplete="off"
              />
              {query && (
                <button type="button" data-part="icon-btn" onClick={() => setQuery('')} aria-label="Clear search">
                  <X size={16} strokeWidth={2} aria-hidden />
                </button>
              )}
            </div>
          )}
          <ViewToggle view={view} onChange={setView} />
        </div>

        {showSearchFilters && (
          <>
            <div data-part="facets">
              <div data-part="facet-row">
                {areaOptions.length > 0 && (
                  <MultiSelect scoped label="Specialty" options={areaOptions} counts={areaCounts} selected={areas} onChange={setAreas} onSurface={onSurface} searchPlaceholder="Filter specialties" />
                )}
                {locationOptions.length > 0 && (
                  <MultiSelect scoped label="Location" options={locationOptions} counts={locationCounts} selected={locations} onChange={setLocations} onSurface={onSurface} searchPlaceholder="Filter locations" />
                )}
                {languageOptions.length > 0 && (
                  <MultiSelect scoped label="Language" options={languageOptions} counts={languageCounts} selected={langs} onChange={setLangs} onSurface={onSurface} searchPlaceholder="Filter languages" />
                )}
              </div>
              <p data-part="count" role="status">
                <b>{results.length}</b> {results.length === 1 ? 'profile' : 'profiles'}
              </p>
            </div>

            {filtersActive && (
              <div data-part="applied" aria-label="Applied filters">
                {facets.flatMap(f => f.values.map(v => (
                  <button
                    key={`${f.label}-${v}`}
                    type="button"
                    data-part="pill"
                    aria-label={`Remove ${f.label.toLowerCase()} filter: ${v}`}
                    onClick={() => f.set(f.values.filter(x => x !== v))}
                  >
                    {v}<X size={14} strokeWidth={2} aria-hidden />
                  </button>
                )))}
                <button type="button" data-part="text-btn" onClick={clearAll}>Clear all</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Results ── */}
      {results.length === 0 ? (
        <div data-part="empty">
          <span data-part="empty-ic" aria-hidden="true">
            {filtersActive ? <SlidersHorizontal size={26} strokeWidth={1.75} /> : <UserSearch size={26} strokeWidth={1.75} />}
          </span>
          <p data-part="empty-t">{emptyMessage}</p>
          {filtersActive && (
            <>
              <p data-part="empty-d">Try a different name or specialty, or remove a filter.</p>
              <Button variant="brand" onClick={clearAll}>Clear search &amp; filters</Button>
            </>
          )}
        </div>
      ) : view === 'list' ? (
        <ul data-part="rows">
          {results.map(p => (
            <li key={p.key}>
              <PractitionerListRow practitioner={p} onSurface={onSurface} density={density} />
            </li>
          ))}
        </ul>
      ) : (
        <ul data-part="cards" data-cols={columns}>
          {results.map(p => (
            <li key={p.key}>
              <PractitionerCard practitioner={p} onSurface={onSurface} density={density} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
