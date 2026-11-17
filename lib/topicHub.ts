import { getClient } from '@/lib/optimizely'
import { formatEventLocation } from '@/lib/eventFormat'
import { resolveCategories, categoryUriFromKey, categoryKeyFromUri, type ResolvedCategory } from '@/lib/taxonomy'

export type TopicHubRecommendation = {
  label: string
}

export type TopicHubBucket = {
  sectionHeadline:    string
  sectionIcon:        string | null
  sectionContentType: 'blogs' | 'events' | 'assets' | 'experiences' | 'locations' | 'practitioners'
}

export type TopicHubPageData = {
  _metadata:             { key: string; locale: string; url: { default: string } }
  headerName:            string | null
  headerEffect:          string | null
  damFolderContainerId:  string | null
  searchRecommendations: TopicHubRecommendation[]
  contentBuckets:        TopicHubBucket[]
  seoTitle:              string | null
  seoDescription:        string | null
  ogImage:               { url: { default: string } } | null
  noIndex:               boolean | null
}

const TOPIC_HUB_QUERY = `
  query GetTopicHubPage($key: String!, $locale: String) {
    OT_TopicHubPage(
      where: {
        _metadata: {
          key:    { eq: $key }
          locale: { eq: $locale }
          status: { eq: "Published" }
        }
      }
      limit: 1
    ) {
      items {
        _metadata { key locale url { default } }
        headerName
        headerEffect
        damFolderContainerId
        searchRecommendations {
          label
        }
        contentBuckets {
          sectionHeadline
          sectionIcon
          sectionContentType
        }
        seoTitle
        seoDescription
        ogImage { url { default } }
        noIndex
      }
    }
  }
`

export async function getTopicHubPage(
  key: string,
  locale: string,
): Promise<TopicHubPageData | null> {
  try {
    const data = await getClient().request(TOPIC_HUB_QUERY, { key, locale })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item = (data as any)?.OT_TopicHubPage?.items?.[0] ?? null
    if (!item) return null

    return {
      _metadata: {
        key:    item._metadata?.key ?? key,
        locale: item._metadata?.locale ?? locale,
        url:    { default: item._metadata?.url?.default ?? '' },
      },
      headerName:           (item.headerName as string | null) ?? null,
      headerEffect:         (item.headerEffect as string | null) ?? null,
      damFolderContainerId: (item.damFolderContainerId as string | null) ?? null,
      searchRecommendations: (item.searchRecommendations ?? [])
        .filter((r: { label?: unknown }) => r?.label)
        .map((r: { label: unknown }) => ({ label: String(r.label) })),
      contentBuckets: (item.contentBuckets ?? [])
        .filter((b: { sectionContentType?: unknown }) => b?.sectionContentType)
        .map((b: { sectionHeadline?: unknown; sectionIcon?: unknown; sectionContentType: unknown }) => ({
          sectionHeadline:    String(b.sectionHeadline ?? ''),
          sectionIcon:        (b.sectionIcon as string | null) ?? null,
          sectionContentType: b.sectionContentType as TopicHubBucket['sectionContentType'],
        })),
      seoTitle:      (item.seoTitle       as string | null) ?? null,
      seoDescription:(item.seoDescription as string | null) ?? null,
      ogImage:       item.ogImage?.url?.default
        ? { url: { default: item.ogImage.url.default } }
        : null,
      noIndex: (item.noIndex as boolean | null) ?? null,
    }
  } catch (err) {
    console.error('[topicHub] query failed:', err)
    return null
  }
}

// ─── Pages by category (Topic Hub "topic mode") ───────────────────────────────

export type TopicPage = {
  key:        string
  title:      string
  url:        string
  type:       string
  /** Which Topic Hub content bucket (sectionContentType) this page falls under. */
  kind:       'blogs' | 'events' | 'experiences' | 'practitioners'
  published:  string | null
  categories: ResolvedCategory[]
  /** One-line summary (sub-headline or meta description) when the page has one. */
  excerpt?:   string | null
  /** Display read time such as "6 min read" (articles). */
  readTime?:  string | null
  /** How many of the selected topics this page carries. */
  common:     number
  /** Card details, so a tagged page renders with the same card as a keyword hit. */
  topic?:        string
  imageUrl?:     string
  eventType?:    string
  startDate?:    string
  endDate?:      string
  locationType?: string
  locationLabel?: string
}

const plain = (html?: string | null) =>
  html ? html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim().slice(0, 200) : undefined

const KIND_BY_TYPE: Record<string, TopicPage['kind']> = {
  OT_BlogPage: 'blogs', OT_EventPage: 'events', OT_PractitionerPage: 'practitioners',
}
const kindOf = (types: string[]): TopicPage['kind'] => {
  const hit = types.find((t) => t in KIND_BY_TYPE)
  return hit ? KIND_BY_TYPE[hit] : 'experiences' // experiences, campaigns and other pages
}

const TYPE_LABELS: Record<string, string> = {
  OT_BlogPage: 'Article', OT_EventPage: 'Event', BlankExperience: 'Page', OT_CampaignLandingPage: 'Campaign',
  OT_CampaignPage: 'Campaign', OT_PractitionerPage: 'Person', OT_TopicHubPage: 'Hub',
}

// The category filter is written into the query text: Graph silently ignores a filter passed through a variable here.
// Keys are JSON-escaped strings, so nothing from the request can break out of the literal.
const pagesQuery = (filter: string) => `
  query TopicPages($locale: String!, $base: String!, $limit: Int!) {
    _Content(
      where: { _and: [
        { _metadata: { locale: { eq: $locale }, status: { eq: "Published" }, url: { base: { eq: $base } }, types: { in: ["_Page"] } } }
        ${filter}
      ] }
      orderBy: { _metadata: { published: DESC } }
      limit: $limit
    ) {
      items { _metadata { key displayName types published url { default } } _itemMetadata { categories } }
    }
  }
`

/**
 * Published pages on this site that carry the selected topics.
 * `groups` is one array of term keys per selected topic (a topic can map to several keys); match "any" keeps pages with at
 * least one selected topic, "all" needs every one. With no topics selected it returns the latest pages.
 */
/** The category part of a Graph where-clause, written inline (Graph ignores a filter passed as a variable). */
function categoryFilter(groups: string[][], match: 'any' | 'all'): string {
  const clause = (keys: string[]) => `{ _itemMetadata: { categories: { in: [${keys.map((k) => JSON.stringify(categoryUriFromKey(k))).join(', ')}] } } }`
  const live = groups.filter((g) => g.length)
  if (!live.length) return ''
  return match === 'all' ? live.map(clause).join('\n') : `{ _or: [${live.map(clause).join(', ')}] }`
}

export async function findTopicPages(opts: {
  groups: string[][]; match: 'any' | 'all'; locale: string; base: string; excludeKey?: string; limit?: number
}): Promise<TopicPage[]> {
  const { groups, match, locale, base, excludeKey, limit = 60 } = opts
  const live = groups.filter((g) => g.length)
  const filter = categoryFilter(groups, match)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await getClient().request(pagesQuery(filter), { locale, base, limit: limit + 1 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = data?._Content?.items ?? []
  const out: TopicPage[] = []
  for (const it of items) {
    const key: string = it._metadata?.key
    if (!key || key === excludeKey) continue
    const tags: string[] = it._itemMetadata?.categories ?? []
    if ((it._metadata?.types as string[] | undefined)?.includes('OT_TopicHubPage')) continue
    const cats = await resolveCategories(tags, locale)
    const tagKeys = new Set(tags.map(categoryKeyFromUri))
    const type = (it._metadata?.types as string[] | undefined)?.find((t) => t in TYPE_LABELS)
    out.push({
      key, title: it._metadata?.displayName ?? '', url: it._metadata?.url?.default ?? '#',
      type: type ? TYPE_LABELS[type] : 'Page', kind: kindOf((it._metadata?.types as string[] | undefined) ?? []), published: it._metadata?.published ?? null, categories: cats,
      common: live.filter((g) => g.some((k) => tagKeys.has(k))).length,
    })
  }
  return out.slice(0, limit)
}

export const TAGGED_QUERY = `
  query TaggedPages($locale: String!, $base: String!, $skip: Int!) {
    _Content(
      where: { _and: [
        { _metadata: { locale: { eq: $locale }, status: { eq: "Published" }, url: { base: { eq: $base } }, types: { in: ["_Page"] } } }
        { _itemMetadata: { categories: { exist: true } } }
      ] }
      orderBy: { _metadata: { published: DESC } }
      skip: $skip
      limit: 100
    ) {
      items {
        _metadata { key displayName types published url { default } }
        _itemMetadata { categories }
        ... on OT_BlogPage { subHeadline readTime topic featuredImage { url { default } } }
        ... on OT_EventPage { seoDescription eventType startDate endDate locationType venueName city description { html } featuredImage { url { default } } }
        ... on BlankExperience { seoDescription ogImage { url { default } } }
      }
    }
  }
`

/**
 * Every published page on this site that carries at least one public category, newest first. The Topic Hub loads this once
 * and does its filtering, counting and ranking in the browser, so counts always match the results.
 */
export async function findTaggedPages(opts: { locale: string; base: string; limit?: number }): Promise<TopicPage[]> {
  // Graph returns at most 100 per request: page through (up to 300 tagged pages, plenty for a demo site)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = []
  for (let skip = 0; skip < (opts.limit ?? 300); skip += 100) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await getClient().request(TAGGED_QUERY, { locale: opts.locale, base: opts.base, skip })
    const page = data?._Content?.items ?? []
    items.push(...page)
    if (page.length < 100) break
  }
  const out: TopicPage[] = []
  for (const it of items) {
    const key: string = it._metadata?.key
    const types = (it._metadata?.types as string[] | undefined) ?? []
    if (!key || types.includes('OT_TopicHubPage')) continue
    const categories = await resolveCategories(it._itemMetadata?.categories ?? [], opts.locale)
    if (!categories.length) continue // only internal or unknown tags
    const type = types.find((t) => t in TYPE_LABELS)
    out.push({
      key, title: it._metadata?.displayName ?? '', url: it._metadata?.url?.default ?? '#',
      type: type ? TYPE_LABELS[type] : 'Page', kind: kindOf((it._metadata?.types as string[] | undefined) ?? []), published: it._metadata?.published ?? null, categories,
      excerpt: it.subHeadline ?? it.seoDescription ?? plain(it.description?.html) ?? null, readTime: it.readTime ?? null, common: 0,
      topic: it.topic || undefined,
      imageUrl: it.featuredImage?.url?.default || it.ogImage?.url?.default || undefined,
      eventType: it.eventType || undefined, startDate: it.startDate || undefined, endDate: it.endDate || undefined,
      locationType: it.locationType || undefined,
      locationLabel: types.includes('OT_EventPage') ? (formatEventLocation({ locationType: it.locationType, venueName: it.venueName, city: it.city }) || undefined) : undefined,
    })
  }
  return out
}
