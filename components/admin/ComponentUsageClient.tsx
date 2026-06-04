'use client'

import { useState, useCallback, useMemo } from 'react'
import { Search, ExternalLink, Globe, FileBox, ChevronDown } from 'lucide-react'
import { ADMIN_BLOCK_TYPES } from '@/lib/admin/contentTypes'
import type { ComponentUsageResult, PageUsage } from '@/lib/admin/graph'

// ─── Sub-components ───────────────────────────────────────────────────────────

function CountBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center justify-center min-w-[26px] h-[26px] px-2 bg-brand/10 text-brand text-[0.75rem] font-semibold tabular-nums">
      {count}
    </span>
  )
}

function StatusChip({ status }: { status: string | null }) {
  const s = (status ?? '').toLowerCase()
  const cls =
    s === 'published' ? 'text-accent bg-accent/10' :
    s === 'scheduled' ? 'text-brand bg-brand/10'   :
    s === 'previous'  ? 'text-fg-muted bg-fg/6'    :
                        'text-fg-muted/60 bg-fg/4'
  return (
    <span className={`text-[0.75rem] font-semibold uppercase tracking-[0.05em] px-2 py-0.5 ${cls}`}>
      {status ?? '—'}
    </span>
  )
}

function PageRow({ page }: { page: PageUsage }) {
  const displayUrl = page.url
    ? page.url.replace(/^https?:\/\/[^/]+/, '') || '/'
    : null

  const host = page.baseUrl
    ? page.baseUrl.replace(/^https?:\/\//, '')
    : null

  const publishedDate = page.published
    ? new Date(page.published).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <li className="border-b border-fg/6 last:border-none">
      <div className="flex items-center gap-md px-lg py-4 hover:bg-fg/2.5 transition-colors duration-100">
        {/* Title + path + site pill */}
        <div className="flex-1 min-w-0">
          <p className="text-[1rem] font-semibold text-fg leading-snug truncate">
            {page.displayName || displayUrl || page.pageKey}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {displayUrl && (
              <span className="text-[0.8125rem] text-fg-muted font-mono truncate">{displayUrl}</span>
            )}
            {host && (
              <span className="inline-flex items-center text-[0.6875rem] font-medium px-2.5 py-0.5 bg-accent text-white shrink-0">
                {host}
              </span>
            )}
          </div>
          {publishedDate && (
            <p className="text-[0.75rem] text-fg mt-1">
              Published {publishedDate}
            </p>
          )}
        </div>

        {/* Language */}
        <span className="w-16 shrink-0 text-[0.8125rem] text-fg-muted/60 font-medium text-center hidden sm:block">
          {page.locale ?? '—'}
        </span>

        {/* Status */}
        <div className="w-28 shrink-0 hidden md:flex items-center">
          <StatusChip status={page.status} />
        </div>

        {/* Count */}
        <div className="w-12 shrink-0 flex justify-end">
          <CountBadge count={page.count} />
        </div>

        {/* Open button */}
        <div className="w-[76px] shrink-0 flex justify-end">
          {page.url ? (
            <a
              href={page.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${page.displayName || 'page'} in new tab`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[0.75rem] font-semibold text-fg-muted border border-fg/10 hover:text-brand hover:border-brand/30 hover:bg-brand/5 transition-colors duration-100"
            >
              <ExternalLink size={13} strokeWidth={2} aria-hidden="true" />
              Open
            </a>
          ) : null}
        </div>
      </div>
    </li>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type SiteFilter = 'current' | 'all'

export default function ComponentUsageClient({
  initialType,
  currentSiteBase,
}: {
  initialType?:     string
  currentSiteBase?: string | null
}) {
  const [selectedType, setSelectedType] = useState(initialType ?? ADMIN_BLOCK_TYPES[0].key)
  const [siteFilter,   setSiteFilter]   = useState<SiteFilter>(currentSiteBase ? 'current' : 'all')
  const [loading,      setLoading]      = useState(false)
  const [rawResult,    setRawResult]    = useState<ComponentUsageResult | null>(null)
  const [error,        setError]        = useState<string | null>(null)

  // Client-side site filtering — the API always returns all sites, we filter here.
  const result = useMemo<ComponentUsageResult | null>(() => {
    if (!rawResult) return null
    if (siteFilter === 'all' || !currentSiteBase) return rawResult
    const normalizedBase = currentSiteBase.replace(/\/$/, '')
    const pages = rawResult.pages.filter(p =>
      p.baseUrl ? p.baseUrl.replace(/\/$/, '') === normalizedBase : false
    )
    return { pages, total: pages.reduce((s, p) => s + p.count, 0) }
  }, [rawResult, siteFilter, currentSiteBase])

  const handleSearch = useCallback(async () => {
    setLoading(true)
    setError(null)
    setRawResult(null)

    try {
      const res  = await fetch(`/api/opti-admin/component-usage?type=${encodeURIComponent(selectedType)}`)
      const data = await res.json() as ComponentUsageResult & { error?: string }
      if (!res.ok) { setError(data.error ?? 'Search failed.'); return }
      setRawResult(data)
    } catch {
      setError('Could not reach the server.')
    } finally {
      setLoading(false)
    }
  }, [selectedType])

  const typeName = ADMIN_BLOCK_TYPES.find(t => t.key === selectedType)?.displayName ?? selectedType

  const inputCls = [
    'w-full appearance-none border border-fg/[0.12] bg-canvas px-md pr-[36px] py-[9px]',
    'text-[0.875rem] font-medium text-fg',
    'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20',
    'transition-[border-color,box-shadow] duration-150 rounded-input',
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
              className={inputCls}
            >
              {(['content', 'data', 'media', 'layout'] as const).map(cat => (
                <optgroup key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)}>
                  {ADMIN_BLOCK_TYPES.filter(t => t.category === cat).map(t => (
                    <option key={t.key} value={t.key}>{t.displayName}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown
              size={14} strokeWidth={1.75}
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
          {loading ? 'Scanning…' : 'Search'}
        </button>
      </div>

      {/* Site filter */}
      {currentSiteBase && (
        <div className="flex items-center gap-xs mt-sm">
          <span className="text-[0.75rem] text-fg-muted/60 mr-xs">Scope:</span>
          {([['current', 'This site'], ['all', 'All sites']] as const).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setSiteFilter(val)}
              className={[
                'px-sm py-[3px] text-[0.75rem] font-medium border transition-colors duration-100',
                siteFilter === val
                  ? 'bg-brand/[0.08] border-brand/20 text-brand'
                  : 'border-fg/[0.10] text-fg-muted hover:text-fg hover:border-fg/20',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
          {siteFilter === 'current' && (
            <span className="text-[0.6875rem] text-fg-muted/50 font-mono ml-xs truncate max-w-[260px]">
              {currentSiteBase.replace(/^https?:\/\//, '')}
            </span>
          )}
        </div>
      )}

      {/* Note for block types */}
      <p className="mt-xs text-[0.75rem] text-fg-muted/60">
        Block types are found by scanning Visual Builder experience compositions.
      </p>

      {/* ── Error ── */}
      {error && (
        <p role="alert" className="mt-lg text-[0.875rem] text-fg border border-fg/[0.08] px-md py-sm">
          {error}
        </p>
      )}

      {/* ── Results ── */}
      {result && (
        <div className="mt-xl">
          {/* Summary */}
          <p className="text-[0.875rem] text-fg-muted mb-md">
            <strong className="text-fg font-semibold">{result.pages.length}</strong>
            {' '}page{result.pages.length !== 1 ? 's' : ''} using{' '}
            <strong className="text-fg font-semibold">{typeName}</strong>
            {result.total !== result.pages.length && (
              <>&nbsp;·&nbsp;
                <strong className="text-fg font-semibold">{result.total}</strong>
                {' '}total instance{result.total !== 1 ? 's' : ''}
              </>
            )}
          </p>

          {/* Table */}
          <div className="border border-fg/[0.08]">
            {/* Header */}
            <div className="flex items-center gap-md px-lg py-2 bg-fg/2 border-b border-fg/6">
              <p className="flex-1 text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted/70">Page</p>
              <p className="w-16 text-center shrink-0 text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted/70 hidden sm:block">Language</p>
              <p className="w-28 shrink-0 text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted/70 hidden md:block">Status</p>
              <p className="w-12 text-right shrink-0 text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted/70">Uses</p>
              <div className="w-19 shrink-0" />
            </div>

            {/* Rows */}
            <ul>
              {result.pages.length === 0 ? (
                <li className="flex flex-col items-center gap-sm py-xl px-lg text-center">
                  <Globe size={24} strokeWidth={1.25} className="text-fg-muted/30" aria-hidden="true" />
                  <p className="text-[0.875rem] text-fg-muted">
                    No pages found using <strong>{typeName}</strong>.
                  </p>
                  <p className="text-[0.75rem] text-fg-muted/60">
                    This type may not be placed in any published experiences yet.
                  </p>
                </li>
              ) : (
                result.pages.map(page => <PageRow key={page.pageKey} page={page} />)
              )}
            </ul>
          </div>
        </div>
      )}

      {/* ── Pre-search empty state ── */}
      {!result && !loading && !error && (
        <div className="mt-2xl flex flex-col items-center gap-md text-center">
          <FileBox size={32} strokeWidth={1} className="text-fg-muted/20" aria-hidden="true" />
          <div>
            <p className="text-[0.9375rem] font-medium text-fg-muted">Select a component type and click Search</p>
            <p className="text-[0.8125rem] text-fg-muted/60 mt-xs">
              The scanner traverses all Visual Builder experiences to find where each block type is used.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
