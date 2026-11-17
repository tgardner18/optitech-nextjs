'use client'

import { useEffect, useMemo, useState } from 'react'
import { Award, Building2, BookOpen, Folder, Globe, GraduationCap, Heart, Lightbulb, MapPin, MessageSquare, Scale, Sparkles, Video, BarChart3, Check, ChevronDown, FileText, Layers, Newspaper, CalendarDays, Plus, Shapes, Sun, Tag, Users, X } from 'lucide-react'
import { slotFor } from './slots'
import { t } from '@/lib/i18n/t'
import type { SearchResult } from '@/lib/search'

export type TopicCategory = { key: string; name: string; slug: string; group: string }
export type Kind = 'blogs' | 'events' | 'experiences' | 'practitioners'
export type Bucket = { sectionHeadline: string; sectionIcon: string | null; sectionContentType: string }
export type TopicPage = {
  key: string; title: string; url: string; type: string; kind: Kind; published: string | null
  excerpt?: string | null; readTime?: string | null; categories: TopicCategory[]
  topic?: string; imageUrl?: string; eventType?: string; startDate?: string; endDate?: string; locationType?: string; locationLabel?: string
}
export type Match = 'any' | 'all'
export type TopicState = { sel: string[]; match: Match; from: string | null }

/**
 * One result, whichever way it was found (keyword hit or tagged page): the card fields, the bucket (kind) it belongs to
 * and its categories (empty for content that cannot be tagged, such as documents).
 */
export type HubItem = SearchResult & {
  key: string; kind: string; categories: TopicCategory[]; published?: string
  doc?: { extension: string | null; fileSize: number | null }
}

/** A tagged page as a result card item. */
export function fromTagged(p: TopicPage): HubItem {
  return {
    id: p.key, key: p.key, kind: p.kind, categories: p.categories, title: p.title, url: p.url,
    type: p.kind === 'blogs' ? 'Blog' : p.kind === 'events' ? 'Event' : 'Page',
    topic: p.topic, published: p.published ?? undefined, excerpt: p.excerpt ?? undefined, imageUrl: p.imageUrl,
    eventType: p.eventType, startDate: p.startDate, endDate: p.endDate, locationType: p.locationType, locationLabel: p.locationLabel,
  }
}

const GROUP_ICON: Record<string, typeof Tag> = { Audience: Users, Category: Layers, Theme: Sun, Format: Shapes }
// The icons an editor can pick on a Topic Hub content bucket (same names as the CMS "Section Icon" list)
const BUCKET_ICON: Record<string, typeof Tag> = {
  CalendarDays, Newspaper, FileText, BookOpen, Users, MapPin, Building2, Video, Globe, Award, Layers, Sparkles,
  GraduationCap, Heart, Scale, BarChart3, Lightbulb, Folder, Tag, MessageSquare,
}
const KINDS: Kind[] = ['blogs', 'events', 'experiences', 'practitioners']

/**
 * The hub's content buckets that apply to category browsing, in the editor's order. Document (assets) and location buckets
 * have no categories, so they are skipped. Empty means "no buckets": every page type is shown with default labels.
 */
export function categoryBuckets(buckets: Bucket[] | undefined): (Bucket & { kind: Kind })[] {
  const seen = new Set<string>()
  const out: (Bucket & { kind: Kind })[] = []
  for (const b of buckets ?? []) {
    const k = b.sectionContentType as Kind
    if (!KINDS.includes(k) || seen.has(k)) continue
    seen.add(k)
    out.push({ ...b, kind: k })
  }
  return out
}


// ─── Data ─────────────────────────────────────────────────────────────────────

export type GraphDebug = { query: string; variables: Record<string, unknown> }

/** Every tagged page on this site (null while loading), plus the Graph query that fetched them for the Query inspector. */
export function useTaggedPages(): { pages: TopicPage[] | null; graphql: GraphDebug | null } {
  const [res, setRes] = useState<{ pages: TopicPage[]; graphql: GraphDebug | null } | null>(null)
  useEffect(() => {
    let live = true
    fetch('/api/topics?view=all').then((r) => r.json()).then((d) => live && setRes({ pages: d.pages ?? [], graphql: d.graphql ?? null })).catch(() => live && setRes({ pages: [], graphql: null }))
    return () => { live = false }
  }, [])
  return { pages: res?.pages ?? null, graphql: res?.graphql ?? null }
}

type Topic = TopicCategory & { slot: 'brand' | 'accent' | 'ink' }
type Group = { name: string; topics: Topic[] }

/** Groups and topics are whatever this site's tagged pages actually use, so nothing from other sites can appear. */
function buildGroups(pages: TopicPage[]): Group[] {
  const bySlug = new Map<string, TopicCategory>()
  for (const p of pages) for (const c of p.categories) if (!bySlug.has(c.slug)) bySlug.set(c.slug, c)
  const names = [...new Set([...bySlug.values()].map((c) => c.group))].sort()
  return names.map((name, i) => ({
    name,
    topics: [...bySlug.values()].filter((c) => c.group === name).map((c) => ({ ...c, slot: slotFor(name, i) })).sort((a, b) => a.name.localeCompare(b.name)),
  }))
}

const has = (a: string[], k: string) => a.includes(k)
type Tagged = { key: string; categories: TopicCategory[] }
const carries = (p: Tagged, slug: string) => p.categories.some((c) => c.slug === slug)
export const score = (p: Tagged, sel: string[]) => sel.filter((s) => carries(p, s)).length
// the article a reader came from is not offered back to them
const live = (p: Tagged, st: TopicState) => !(st.from && p.key === st.from)
function topicOk(p: Tagged, sel: string[], match: Match) {
  if (!sel.length) return true
  const n = score(p, sel)
  return match === 'all' ? n === sel.length : n > 0
}

/** Items that pass the current topics and match mode. */
export function poolFor<T extends Tagged>(items: T[], st: TopicState): T[] {
  return items.filter((p) => live(p, st) && topicOk(p, st.sel, st.match))
}

// ─── Panel ────────────────────────────────────────────────────────────────────

function Marker({ topic, count, pressed, disabled, onClick, name, locale }: {
  topic: { slug: string; slot: string; name: string; group: string }; count?: number; pressed: boolean; disabled?: boolean; onClick: () => void; name?: string; locale: string
}) {
  return (
    <li data-part="marker">
      <button type="button" data-part="cell" data-slot={topic.slot} aria-pressed={pressed} disabled={disabled} onClick={onClick}>
        <span data-part="tile" aria-hidden="true">
          <Tag data-i="tag" /><Plus data-i="plus" /><Check data-i="check" />
        </span>
        <span data-part="name">{name ?? topic.name}</span>
        {count !== undefined && <span data-part="count" aria-hidden="true">{count}</span>}
        <span data-part="sr"> ({topic.group}{count !== undefined ? `, ${count} ${t(locale, count === 1 ? 'hub.page' : 'hub.pages')}` : ''})</span>
      </button>
    </li>
  )
}

/**
 * The Topics panel: one row per category group, every topic with its page count. Picked topics fill in place; collapsed,
 * the header lists them as removable chips. Any/All appears from two topics, and zero-result topics are disabled in All mode.
 */
export function TopicPanel({ pages, pool, st, open, onOpen, onToggle, onMatch, onClear, locale = 'en' }: {
  /** every tagged page (decides which topics exist) */ pages: TopicPage[]
  /** what the counts are taken from: this keyword's hits, or all tagged pages when there is no keyword */ pool: Tagged[]
  st: TopicState; open: boolean; locale?: string
  onOpen: (v: boolean) => void; onToggle: (slug: string) => void; onMatch: (m: Match) => void; onClear: () => void
}) {
  const groups = useMemo(() => buildGroups(pages), [pages])
  if (!groups.length) return null
  const all = groups.flatMap((g) => g.topics)
  const n = st.sel.length
  const countWhere = (fn: (p: Tagged) => boolean) => pool.filter((p) => live(p, st) && fn(p)).length
  const panelCount = (slug: string) => {
    if (st.match === 'all' && n && !has(st.sel, slug)) return countWhere((p) => topicOk(p, [...st.sel, slug], 'all'))
    return countWhere((p) => carries(p, slug))
  }
  const nAny = n > 1 ? countWhere((p) => topicOk(p, st.sel, 'any')) : 0
  const nAll = n > 1 ? countWhere((p) => topicOk(p, st.sel, 'all')) : 0

  return (
    <section data-part="tp-panel" aria-label={t(locale, 'hub.topics')}>
      <div data-part="tp-head">
        <button type="button" data-part="tp-toggle" aria-expanded={open} aria-controls="tp-body" onClick={() => onOpen(!open)}>
          <Tag aria-hidden="true" /><span>{t(locale, 'hub.topics')}</span>
          {n > 0 && <span data-part="tp-badge">{t(locale, 'hub.selectedCount', { count: n })}</span>}
          <ChevronDown data-part="tp-chev" aria-hidden="true" />
        </button>
        {!open && n > 0 && (
          <div data-part="tp-sum">
            {st.sel.map((slug) => {
              const tp = all.find((x) => x.slug === slug)
              return (
                <button key={slug} type="button" data-part="tp-rm" data-slot={tp?.slot ?? 'brand'} aria-label={t(locale, 'hub.remove', { name: tp?.name ?? slug })} onClick={() => onToggle(slug)}>
                  <span>{tp?.name ?? slug}</span><i aria-hidden="true"><X /></i>
                </button>
              )
            })}
          </div>
        )}
        {(n > 1 || n > 0) && (
          <div data-part="tp-tools">
            {n > 1 && (
              <div data-part="tp-mwrap">
                <span data-part="tp-mlbl" id="tp-mlbl">{t(locale, 'hub.match')}</span>
                <div data-part="tp-seg" role="group" aria-labelledby="tp-mlbl">
                  <button type="button" aria-pressed={st.match === 'any'} onClick={() => onMatch('any')}>{t(locale, 'hub.any')} <span>{nAny}</span></button>
                  <button type="button" aria-pressed={st.match === 'all'} onClick={() => onMatch('all')}>{t(locale, 'hub.all')} <span>{nAll}</span></button>
                </div>
              </div>
            )}
            <button type="button" data-part="tp-clear" onClick={onClear}>{t(locale, 'hub.clear')}</button>
          </div>
        )}
      </div>
      <div id="tp-body" data-part="tp-body" hidden={!open}>
        {groups.map((g) => {
          const Icon = GROUP_ICON[g.name] ?? Tag
          return (
            <div key={g.name} data-part="tp-row">
              <h3><Icon aria-hidden="true" />{g.name}</h3>
              <div data-block="category-chips" data-container="none">
                <ul data-part="list" role="list" aria-label={g.name}>
                  {g.topics.map((tp) => {
                    const c = panelCount(tp.slug)
                    const pressed = has(st.sel, tp.slug)
                    return <Marker key={tp.slug} topic={tp} count={c} pressed={pressed} disabled={c === 0 && !pressed} onClick={() => onToggle(tp.slug)} locale={locale} />
                  })}
                </ul>
              </div>
            </div>
          )
        })}
        {st.match === 'all' && n > 0 && <p data-part="tp-note">{t(locale, 'hub.allNote')}</p>}
      </div>
    </section>
  )
}

// ─── Results helpers ──────────────────────────────────────────────────────────

const TYPE_KEY: Record<string, 'hub.typeArticle' | 'hub.typeEvent' | 'hub.typeCampaign' | 'hub.typePage' | 'hub.typePerson'> = {
  Article: 'hub.typeArticle', Event: 'hub.typeEvent', Campaign: 'hub.typeCampaign', Page: 'hub.typePage', Person: 'hub.typePerson',
}
export const typeLabel = (type: string, locale: string) => (TYPE_KEY[type] ? t(locale, TYPE_KEY[type]) : type + 's')

/** The default label for a bucket the editor did not configure. */
export const defaultBucketName = (k: string, locale: string) =>
  typeLabel(k === 'blogs' ? 'Article' : k === 'events' ? 'Event' : k === 'practitioners' ? 'Person' : 'Page', locale)

/** The icon for a bucket (editor-picked name, or a sensible default by kind). */
export function bucketIcon(name: string | null | undefined, kind: string): typeof Tag {
  if (name && BUCKET_ICON[name]) return BUCKET_ICON[name]
  return kind === 'blogs' ? Newspaper : kind === 'events' ? CalendarDays : kind === 'assets' ? FileText : Layers
}

export function Names({ slugs, all, joiner }: { slugs: string[]; all: { slug: string; name: string }[]; joiner: string }) {
  const nm = slugs.map((s) => all.find((x) => x.slug === s)?.name ?? s)
  return (
    <>
      {nm.map((n, i) => (
        <span key={i}>
          {i > 0 && (i === nm.length - 1 ? (nm.length > 2 ? `, ${joiner} ` : ` ${joiner} `) : ', ')}
          <span data-part="tp-nm">{n}</span>
        </span>
      ))}
    </>
  )
}

/** Every topic on this site's tagged pages (flat), for naming selected slugs. */
export const topicsOf = (pages: TopicPage[]) => buildGroups(pages).flatMap((g) => g.topics)

/**
 * The categories a result carries, shown on its card. Plain labels (the card itself is the link): the topics the reader
 * has selected come first and are filled, so it is clear why a result matched.
 */
export function CardTags({ item, sel, max = 3 }: { item: { categories: TopicCategory[] }; sel: string[]; max?: number }) {
  if (!item.categories.length) return null
  const picked = item.categories.filter((c) => has(sel, c.slug))
  const rest = item.categories.filter((c) => !has(sel, c.slug))
  const ordered = [...picked, ...rest]
  const shown = ordered.slice(0, Math.max(max, picked.length))
  const more = ordered.length - shown.length
  return (
    <span data-part="card-tags">
      {shown.map((c) => <span key={c.slug} data-part="card-tag" data-on={has(sel, c.slug) ? '' : undefined}>{c.name}</span>)}
      {more > 0 && <span data-part="card-tag" data-more="">+{more}</span>}
    </span>
  )
}
