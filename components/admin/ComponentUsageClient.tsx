'use client'

import { useState, useCallback } from 'react'
import { Search, ExternalLink, ChevronDown, ChevronUp, FileBox, Globe } from 'lucide-react'
import { ADMIN_BLOCK_TYPES } from '@/lib/admin/contentTypes'
import type { ComponentUsageResult, ContentInstance } from '@/lib/admin/graph'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPageUrl(instance: ContentInstance): string | null {
  // Prefer default URL; fall back to hierarchical path
  return instance.url.default ?? instance.url.hierarchical ?? null
}

function groupByPage(instances: ContentInstance[]): Map<string, ContentInstance[]> {
  const map = new Map<string, ContentInstance[]>()
  for (const inst of instances) {
    const page = getPageUrl(inst) ?? '__standalone__'
    const arr  = map.get(page) ?? []
    arr.push(inst)
    map.set(page, arr)
  }
  return map
}

function isSharedBlock(instance: ContentInstance): boolean {
  // Items with no URL are standalone shared blocks not yet placed on a page
  return !getPageUrl(instance)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CountBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-[6px] bg-brand/[0.09] text-brand text-[0.6875rem] font-semibold tabular-nums">
      {count}
    </span>
  )
}

function PageRow({ url, instances }: { url: string; instances: ContentInstance[] }) {
  const [expanded, setExpanded] = useState(false)
  const isAbsolute = url.startsWith('http')
  const displayUrl = isAbsolute ? url.replace(/^https?:\/\/[^/]+/, '') : url
  const pageTitle  = instances[0]?.displayName || displayUrl

  return (
    <li className="border-b border-fg/[0.06] last:border-none">
      <div className="flex items-center gap-md px-lg py-[11px] hover:bg-fg/[0.025] transition-colors duration-100">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(v => !v)}
          className="shrink-0 text-fg-muted/50 hover:text-fg-muted transition-colors duration-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
        >
          {expanded
            ? <ChevronUp   size={14} strokeWidth={1.75} />
            : <ChevronDown size={14} strokeWidth={1.75} />
          }
        </button>

        {/* Title + URL */}
        <div className="flex-1 min-w-0">
          <p className="text-[0.875rem] font-medium text-fg truncate">{pageTitle}</p>
          <p className="text-[0.75rem] text-fg-muted truncate mt-[1px]">{displayUrl || url}</p>
        </div>

        {/* Locale */}
        <span className="text-[0.75rem] text-fg-muted/60 font-medium w-10 text-center shrink-0">
          {instances[0]?.locale ?? '—'}
        </span>

        {/* Use count */}
        <div className="shrink-0 w-16 flex justify-end">
          <CountBadge count={instances.length} />
        </div>

        {/* Open link */}
        {url !== '__standalone__' && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${pageTitle} in new tab`}
            className="shrink-0 text-fg-muted/40 hover:text-brand transition-colors duration-100"
          >
            <ExternalLink size={13} strokeWidth={1.75} />
          </a>
        )}
      </div>

      {/* Expanded: list instances */}
      {expanded && (
        <ul className="border-t border-fg/[0.05] bg-fg/[0.015]">
          {instances.map(inst => (
            <li key={inst.key} className="flex items-center gap-md px-lg py-[8px] pl-[56px]">
              <FileBox size={12} strokeWidth={1.75} className="shrink-0 text-fg-muted/40" aria-hidden="true" />
              <span className="text-[0.8125rem] text-fg-muted truncate flex-1">
                {inst.displayName || inst.key}
              </span>
              <span className="text-[0.75rem] text-fg-muted/50 shrink-0">
                {inst.status ?? '—'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

type Tab = 'pages' | 'shared'

export default function ComponentUsageClient({ initialType }: { initialType?: string }) {
  const [selectedType, setSelectedType] = useState(initialType ?? ADMIN_BLOCK_TYPES[0].key)
  const [loading,      setLoading]      = useState(false)
  const [result,       setResult]       = useState<ComponentUsageResult | null>(null)
  const [error,        setError]        = useState<string | null>(null)
  const [activeTab,    setActiveTab]    = useState<Tab>('pages')

  const handleSearch = useCallback(async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res  = await fetch(`/api/opti-admin/component-usage?type=${encodeURIComponent(selectedType)}`)
      const data = await res.json() as ComponentUsageResult & { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Search failed.')
        return
      }
      setResult(data)
      setActiveTab('pages')
    } catch {
      setError('Could not reach the server.')
    } finally {
      setLoading(false)
    }
  }, [selectedType])

  // Split results into pages vs standalone shared blocks
  const pageInstances   = result?.instances.filter(i => !isSharedBlock(i)) ?? []
  const sharedInstances = result?.instances.filter(isSharedBlock)          ?? []
  const grouped         = groupByPage(pageInstances)
  const pageEntries     = [...grouped.entries()].filter(([url]) => url !== '__standalone__')

  const typeName = ADMIN_BLOCK_TYPES.find(t => t.key === selectedType)?.displayName ?? selectedType

  const tabClass = (active: boolean) => [
    'px-md py-[6px] text-[0.8125rem] font-semibold border-b-2 transition-colors duration-150',
    active
      ? 'border-brand text-brand'
      : 'border-transparent text-fg-muted hover:text-fg',
  ].join(' ')

  return (
    <div>
      {/* ── Filter bar ── */}
      <div className="flex items-end gap-sm flex-wrap">
        <div className="flex flex-col gap-xs flex-1 min-w-[200px]">
          <label
            htmlFor="component-type-select"
            className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted"
          >
            Component type
          </label>
          <div className="relative">
            <select
              id="component-type-select"
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className={[
                'w-full appearance-none border border-fg/[0.12] bg-canvas px-md pr-[36px] py-[9px]',
                'text-[0.875rem] font-medium text-fg',
                'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20',
                'transition-[border-color,box-shadow] duration-150',
                'rounded-input',
              ].join(' ')}
            >
              {['content', 'data', 'media', 'layout'].map(cat => (
                <optgroup key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)}>
                  {ADMIN_BLOCK_TYPES.filter(t => t.category === cat).map(t => (
                    <option key={t.key} value={t.key}>{t.displayName}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown
              size={14}
              strokeWidth={1.75}
              className="absolute right-[12px] top-1/2 -translate-y-1/2 text-fg-muted/50 pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className={[
            'flex items-center gap-sm px-lg py-[9px]',
            'bg-brand text-fg-on-brand text-[0.8125rem] font-semibold uppercase tracking-[0.06em]',
            'hover:bg-brand-hover transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          ].join(' ')}
        >
          <Search size={14} strokeWidth={2} aria-hidden="true" />
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <p role="alert" className="mt-lg text-[0.875rem] text-fg-muted border border-fg/[0.08] px-md py-sm">
          {error}
        </p>
      )}

      {/* ── Results ── */}
      {result && (
        <div className="mt-xl">
          {/* Summary */}
          <p className="text-[0.875rem] text-fg-muted mb-md">
            <strong className="text-fg font-semibold">{pageEntries.length}</strong>
            {' '}page{pageEntries.length !== 1 ? 's' : ''}&nbsp;·&nbsp;
            <strong className="text-fg font-semibold">{pageInstances.length}</strong>
            {' '}use{pageInstances.length !== 1 ? 's' : ''} of{' '}
            <strong className="text-fg font-semibold">{typeName}</strong>
            {sharedInstances.length > 0 && (
              <>&nbsp;·&nbsp;
                <strong className="text-fg font-semibold">{sharedInstances.length}</strong>
                {' '}shared instance{sharedInstances.length !== 1 ? 's' : ''}
              </>
            )}
          </p>

          {/* Tabs */}
          <div className="flex border-b border-fg/[0.08] mb-0">
            <button type="button" onClick={() => setActiveTab('pages')} className={tabClass(activeTab === 'pages')}>
              Pages <CountBadge count={pageEntries.length} />
            </button>
            <button type="button" onClick={() => setActiveTab('shared')} className={tabClass(activeTab === 'shared')}>
              Shared Blocks <CountBadge count={sharedInstances.length} />
            </button>
          </div>

          {/* Table */}
          <div className="border border-fg/[0.08] border-t-0">
            {/* Header */}
            <div className="flex items-center gap-md px-lg py-[8px] bg-fg/[0.025] border-b border-fg/[0.06]">
              <div className="w-5 shrink-0" />
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted/70 flex-1">Page</p>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted/70 w-10 text-center shrink-0">Locale</p>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted/70 w-16 text-right shrink-0">Uses</p>
              <div className="w-5 shrink-0" />
            </div>

            {/* Rows */}
            {activeTab === 'pages' && (
              <ul>
                {pageEntries.length === 0 ? (
                  <li className="flex flex-col items-center gap-sm py-xl px-lg text-center">
                    <Globe size={24} strokeWidth={1.25} className="text-fg-muted/30" aria-hidden="true" />
                    <p className="text-[0.875rem] text-fg-muted">
                      No page-level instances found for <strong>{typeName}</strong>.
                    </p>
                  </li>
                ) : (
                  pageEntries.map(([url, instances]) => (
                    <PageRow key={url} url={url} instances={instances} />
                  ))
                )}
              </ul>
            )}

            {activeTab === 'shared' && (
              <ul>
                {sharedInstances.length === 0 ? (
                  <li className="flex flex-col items-center gap-sm py-xl px-lg text-center">
                    <FileBox size={24} strokeWidth={1.25} className="text-fg-muted/30" aria-hidden="true" />
                    <p className="text-[0.875rem] text-fg-muted">No standalone shared blocks found.</p>
                  </li>
                ) : (
                  sharedInstances.map(inst => (
                    <li key={inst.key} className="flex items-center gap-md px-lg py-[11px] border-b border-fg/[0.06] last:border-none hover:bg-fg/[0.025] transition-colors duration-100">
                      <FileBox size={14} strokeWidth={1.75} className="shrink-0 text-fg-muted/40" aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.875rem] font-medium text-fg truncate">
                          {inst.displayName || inst.key}
                        </p>
                      </div>
                      <span className="text-[0.75rem] text-fg-muted/60 font-medium shrink-0">
                        {inst.locale ?? '—'}
                      </span>
                      <span className="text-[0.75rem] text-fg-muted shrink-0">
                        {inst.status ?? '—'}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Empty state (no search yet) */}
      {!result && !loading && !error && (
        <div className="mt-2xl flex flex-col items-center gap-md text-center">
          <Search size={32} strokeWidth={1} className="text-fg-muted/20" aria-hidden="true" />
          <div>
            <p className="text-[0.9375rem] font-medium text-fg-muted">Select a component type and click Search</p>
            <p className="text-[0.8125rem] text-fg-muted/60 mt-xs">Results show which pages use this component across your CMS.</p>
          </div>
        </div>
      )}
    </div>
  )
}
