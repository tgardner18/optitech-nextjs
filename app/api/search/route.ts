import { type NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/optimizely'
import { DEFAULT_LOCALE } from '@/lib/i18n/config'
import type { SearchResult } from '@/lib/search'
import { formatEventLocation } from '@/lib/eventFormat'

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 220)
}

// Lightweight scope query — isolated from the shared theme query so a
// new/unindexed ThemeManager field can never break theme loading.
const SCOPE_QUERY = `
  query GetSearchScope {
    OT_ThemeManager(limit: 20) {
      items {
        frontEndDomain
        searchScope
      }
    }
  }
`

// In semantic mode use a clean match only — no fuzzy/synonyms — so the
// vector model's intent-matching isn't diluted by keyword expansions.
function fulltextClause(semantic: boolean): string {
  return semantic
    ? '_fulltext: { match: $query }'
    : '_fulltext: { match: $query, fuzzy: true, synonyms: ONE }'
}

// Build a blog query with Graph-level locale scoping (always applied) and
// optional domain scoping. Locale is sourced from the x-locale request header
// so results are restricted to the site's active language.
// When withDomain=true, _metadata.url.base is compared against $domain so the
// CMS itself enforces site isolation — not a post-filter on relative paths.
// Adds fuzzy matching and synonym expansion for more forgiving keyword search.
function buildBlogQuery(withDomain: boolean, semantic: boolean): string {
  const domainVar    = withDomain ? ', $domain: String' : ''
  const metaFilter   = withDomain
    ? '_metadata: { locale: { eq: $locale }, url: { base: { eq: $domain } } }'
    : '_metadata: { locale: { eq: $locale } }'
  const ranking      = semantic
    ? 'orderBy: { _ranking: SEMANTIC, _semanticWeight: 0.8 }'
    : 'orderBy: { _ranking: RELEVANCE }'
  return `
    query SearchBlogs($query: String!, $limit: Int!, $locale: String!${domainVar}) {
      OT_BlogPage(
        ${ranking}
        where: {
          ${fulltextClause(semantic)}
          ${metaFilter}
        }
        limit: $limit
        tracking: { phrase: $query, source: "/search" }
        pinned: { phrase: $query }
      ) {
        items {
          _track
          _metadata { key published url { default base } }
          headline
          subHeadline
          topic
          featuredImage { url { default } }
          body { html }
        }
      }
    }
  `
}

function buildContentQuery(withDomain: boolean, semantic: boolean): string {
  const domainVar    = withDomain ? ', $domain: String' : ''
  const metaFilter   = withDomain
    ? '_metadata: { locale: { eq: $locale }, url: { base: { eq: $domain } } }'
    : '_metadata: { locale: { eq: $locale } }'
  const ranking      = semantic
    ? 'orderBy: { _ranking: SEMANTIC, _semanticWeight: 0.8 }'
    : 'orderBy: { _ranking: RELEVANCE }'
  return `
    query SearchContent($query: String!, $limit: Int!, $locale: String!${domainVar}) {
      _Content(
        ${ranking}
        where: {
          ${fulltextClause(semantic)}
          ${metaFilter}
        }
        limit: $limit
        tracking: { phrase: $query, source: "/search" }
      ) {
        items {
          _track
          _metadata { key url { default base } types displayName }
        }
      }
    }
  `
}

function buildBlankExperienceQuery(withDomain: boolean, semantic: boolean): string {
  const domainVar    = withDomain ? ', $domain: String' : ''
  const metaFilter   = withDomain
    ? '_metadata: { locale: { eq: $locale }, url: { base: { eq: $domain } } }'
    : '_metadata: { locale: { eq: $locale } }'
  const ranking      = semantic
    ? 'orderBy: { _ranking: SEMANTIC, _semanticWeight: 0.8 }'
    : 'orderBy: { _ranking: RELEVANCE }'
  return `
    query SearchBlankExperiences($query: String!, $limit: Int!, $locale: String!${domainVar}) {
      BlankExperience(
        ${ranking}
        where: {
          ${fulltextClause(semantic)}
          ${metaFilter}
        }
        limit: $limit
        tracking: { phrase: $query, source: "/search" }
        pinned: { phrase: $query }
      ) {
        items {
          _track
          _metadata { key url { default base } published displayName }
          seoDescription
          ogImage { url { default } }
        }
      }
    }
  `
}

// Practitioner search — OT_PractitionerProfile holds the searchable identity
// (name, credentials, bio) plus the headshot + bio we want to surface. It is a
// URL-less shared component, so it is NOT domain-scoped here; site isolation is
// enforced on the page side (buildPractitionerPagesQuery), and only profiles
// that map to an in-scope page are emitted. Locale is always applied.
function buildPractitionerProfileQuery(semantic: boolean): string {
  const ranking = semantic
    ? 'orderBy: { _ranking: SEMANTIC, _semanticWeight: 0.8 }'
    : 'orderBy: { _ranking: RELEVANCE }'
  return `
    query SearchPractitioners($query: String!, $limit: Int!, $locale: String!) {
      OT_PractitionerProfile(
        ${ranking}
        where: {
          ${fulltextClause(semantic)}
          _metadata: { locale: { eq: $locale } }
        }
        limit: $limit
        tracking: { phrase: $query, source: "/search" }
      ) {
        items {
          _track
          _metadata { key }
          firstName
          lastName
          credentials
          headshot { url { default } }
          bio { html }
        }
      }
    }
  `
}

// Resolves each practitioner record key → its published profile-page URL +
// displayName. OT_PractitionerProfile has no URL of its own, so search results
// must link to the OT_PractitionerPage that references it. Domain-scoped (when
// withDomain) so a profile only surfaces on the site whose page is in scope.
function buildPractitionerPagesQuery(withDomain: boolean): string {
  const domainVar  = withDomain ? ', $domain: String' : ''
  const metaFilter = withDomain
    ? '_metadata: { locale: { eq: $locale }, status: { eq: "Published" }, url: { base: { eq: $domain } } }'
    : '_metadata: { locale: { eq: $locale }, status: { eq: "Published" } }'
  return `
    query GetPractitionerPages($locale: String!, $limit: Int!${domainVar}) {
      OT_PractitionerPage(
        limit: $limit
        where: { ${metaFilter} }
      ) {
        items {
          _metadata { key url { default base } displayName published }
          practitionerRef { key }
        }
      }
    }
  `
}

// Event search — surfaces OT_EventPage with the fields that matter for events
// (date + location carry as much weight as the title). description is HTML-stripped
// to a short excerpt by the caller.
function buildEventQuery(withDomain: boolean, semantic: boolean): string {
  const domainVar    = withDomain ? ', $domain: String' : ''
  const metaFilter   = withDomain
    ? '_metadata: { locale: { eq: $locale }, url: { base: { eq: $domain } } }'
    : '_metadata: { locale: { eq: $locale } }'
  const ranking      = semantic
    ? 'orderBy: { _ranking: SEMANTIC, _semanticWeight: 0.8 }'
    : 'orderBy: { _ranking: RELEVANCE }'
  return `
    query SearchEvents($query: String!, $limit: Int!, $locale: String!${domainVar}) {
      OT_EventPage(
        ${ranking}
        where: {
          ${fulltextClause(semantic)}
          ${metaFilter}
        }
        limit: $limit
        tracking: { phrase: $query, source: "/search" }
        pinned: { phrase: $query }
      ) {
        items {
          _track
          _metadata { key url { default base } }
          title
          eventType
          startDate
          endDate
          locationType
          venueName
          city
          description { html }
          featuredImage { url { default } }
        }
      }
    }
  `
}

// Content Graph may return a relative path for url.default when the site's
// base URL is not embedded in the path. Combine with url.base to get an
// absolute URL so cross-site search results navigate to the correct origin.
function absoluteUrl(defaultUrl: string | null | undefined, base: string | null | undefined): string | null {
  if (!defaultUrl) return null
  if (defaultUrl.startsWith('http')) return defaultUrl
  if (base) return base.replace(/\/$/, '') + defaultUrl
  return defaultUrl
}

function withTrackAuth(url: string | null | undefined): string | null {
  if (!url) return null
  const key = process.env.OPTIMIZELY_GRAPH_SINGLE_KEY
  return key ? `${url}&auth=${key}` : null
}

const SETTINGS_TYPES = new Set([
  'OT_SiteSettings',
  'OT_ThemeManager',
  'OT_NavigationItem',
  'OT_NavigationSubItem',
  'OT_FooterColumn',
  'OT_FooterLink',
])

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q        = (searchParams.get('q') ?? '').trim()
  const type     = (searchParams.get('type') ?? 'all') as 'all' | 'Blog' | 'Page' | 'Event'
  const semantic = searchParams.get('semantic') === 'true'
  const limit    = 16

  if (q.length < 2) return NextResponse.json([])

  // ── Locale resolution ────────────────────────────────────────────────────
  // x-locale is set by middleware for every request. Falls back to the default
  // locale so search always has a locale constraint even without a prefix.
  const locale = req.headers.get('x-locale') ?? DEFAULT_LOCALE

  // ── Site scope resolution ────────────────────────────────────────────────
  // filterBase is built from ThemeManager's canonical frontEndDomain, NOT the
  // request host — so localhost dev still resolves the correct production domain
  // that was stored as url.base in Content Graph when content was published.
  const host = req.nextUrl.host

  let allSites   = false
  let filterBase: string | null = null

  try {
    const scopeData  = await getClient().request(SCOPE_QUERY, {})
    const themeItems: any[] = (scopeData as any)?.OT_ThemeManager?.items ?? []
    const matched = themeItems.find((i: any) => i.frontEndDomain === host) ?? themeItems[0] ?? null
    if (matched) {
      allSites = matched.searchScope === 'allSites'
      const domain = (matched.frontEndDomain as string | undefined) ?? ''
      if (domain) {
        const proto = domain.startsWith('localhost') ? 'http' : 'https'
        filterBase = `${proto}://${domain}`
      }
    }
  } catch {
    // scope unavailable — proceed without domain restriction
  }

  // Domain filter is applied in the GraphQL WHERE clause (not post-filtered)
  // so Content Graph handles site isolation natively.
  const withDomain = !allSites && filterBase !== null
  const domainVars = withDomain ? { domain: filterBase } : {}

  // locale is always included — every query builder declares $locale: String!
  const baseVars = { query: q, limit, locale, ...domainVars }

  const results: SearchResult[] = []
  const seen = new Set<string>()

  // ── Blog results ─────────────────────────────────────────────────────────
  if (type === 'all' || type === 'Blog') {
    try {
      const blogQuery = buildBlogQuery(withDomain, semantic)
      const data = await getClient().request(blogQuery, baseVars)
      const items: any[] = (data as any)?.OT_BlogPage?.items ?? []
      for (const item of items) {
        if (!item._metadata?.url?.default) continue
        if (seen.has(item._metadata.key)) continue
        seen.add(item._metadata.key)
        const subHead  = (item.subHeadline as string | undefined) || undefined
        const bodyHtml = (item.body?.html  as string | undefined) || undefined
        const excerpt  = subHead ?? (bodyHtml ? stripHtml(bodyHtml) : undefined)
        results.push({
          id:        item._metadata.key,
          title:     item.headline ?? 'Untitled',
          url:       absoluteUrl(item._metadata.url.default, item._metadata.url.base) as string,
          type:      'Blog',
          topic:     item.topic || undefined,
          published: item._metadata.published || undefined,
          excerpt,
          imageUrl:  item.featuredImage?.url?.default || undefined,
          _track:    withTrackAuth(item._track),
        })
      }
    } catch (err) {
      console.error('[search] blog query failed:', err)
    }
  }

  // ── Event results ──────────────────────────────────────────────────────────
  if (type === 'all' || type === 'Event') {
    try {
      const eventQuery = buildEventQuery(withDomain, semantic)
      const data = await getClient().request(eventQuery, baseVars)
      const items: any[] = (data as any)?.OT_EventPage?.items ?? []
      for (const item of items) {
        if (!item._metadata?.url?.default) continue
        if (seen.has(item._metadata.key)) continue
        seen.add(item._metadata.key)
        const summaryHtml = (item.description?.html as string | undefined) || undefined
        const locationLabel = formatEventLocation({
          locationType: item.locationType,
          venueName:    item.venueName,
          city:         item.city,
        }) || undefined
        results.push({
          id:            item._metadata.key,
          title:         item.title ?? 'Untitled',
          url:           absoluteUrl(item._metadata.url.default, item._metadata.url.base) as string,
          type:          'Event',
          excerpt:       summaryHtml ? stripHtml(summaryHtml).slice(0, 160) : undefined,
          imageUrl:      item.featuredImage?.url?.default || undefined,
          eventType:     item.eventType || undefined,
          startDate:     item.startDate || undefined,
          endDate:       item.endDate || undefined,
          locationType:  item.locationType || undefined,
          locationLabel,
          _track:        withTrackAuth(item._track),
        })
      }
    } catch (err) {
      console.error('[search] event query failed:', err)
    }
  }

  // ── Practitioner results ────────────────────────────────────────────────
  // OT_PractitionerProfile carries the searchable identity (name, credentials,
  // bio) but has no URL; it surfaces via the OT_PractitionerPage that references
  // it. Two queries + a client-side join: full-text the profiles, then resolve
  // each matched profile key → its in-scope published page. Runs before the
  // BlankExperience/_Content blocks so the resolved page keys land in `seen`
  // first — OT_PractitionerPage is an _experience, so the generic _Content
  // fallback would otherwise re-emit it as a bare Page without the headshot.
  if (type === 'all' || type === 'Page') {
    try {
      const profileVars = { query: q, limit, locale }
      const profileData = await getClient().request(buildPractitionerProfileQuery(semantic), profileVars)
      const profiles: any[] = (profileData as any)?.OT_PractitionerProfile?.items ?? []

      if (profiles.length > 0) {
        // Resolve profile key → page. Fetch up to the Graph limit cap so the
        // join isn't truncated by the default 16-row result window.
        const pageVars = { locale, limit: 100, ...domainVars }
        const pageData = await getClient().request(buildPractitionerPagesQuery(withDomain), pageVars)
        const pages: any[] = (pageData as any)?.OT_PractitionerPage?.items ?? []

        const pageByProfile = new Map<string, any>()
        for (const page of pages) {
          const refKey = page.practitionerRef?.key
          if (refKey && page._metadata?.url?.default && !pageByProfile.has(refKey)) {
            pageByProfile.set(refKey, page)
          }
        }

        // Emit in profile relevance order; only profiles with an in-scope page.
        for (const profile of profiles) {
          const profileKey = profile._metadata?.key
          if (!profileKey) continue
          const page = pageByProfile.get(profileKey)
          if (!page) continue
          const pageKey = page._metadata.key
          if (seen.has(pageKey)) continue
          seen.add(pageKey)

          const name        = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim()
          const credentials = (profile.credentials as string | undefined)?.trim()
          const title       = name
            ? (credentials ? `${name}, ${credentials}` : name)
            : (page._metadata.displayName ?? 'Untitled')
          const bioHtml     = (profile.bio?.html as string | undefined) || undefined

          results.push({
            id:        pageKey,
            title,
            url:       absoluteUrl(page._metadata.url.default, page._metadata.url.base) as string,
            type:      'Page',
            published: page._metadata.published || undefined,
            excerpt:   bioHtml ? stripHtml(bioHtml) : undefined,
            imageUrl:  profile.headshot?.url?.default || undefined,
            _track:    withTrackAuth(profile._track),
          })
        }
      }
    } catch (err) {
      console.error('[search] practitioner query failed:', err)
    }
  }

  // ── Experience results (typed — enriched with seoDescription / ogImage) ──
  // Runs before the generic _Content query so enriched data wins the seen-Set
  // deduplication; _Content then fills in any remaining non-experience pages.
  if (type === 'all' || type === 'Page') {
    try {
      const expQuery = buildBlankExperienceQuery(withDomain, semantic)
      const data = await getClient().request(expQuery, baseVars)
      const items: any[] = (data as any)?.BlankExperience?.items ?? []
      for (const item of items) {
        if (!item._metadata?.url?.default) continue
        if (seen.has(item._metadata.key)) continue
        seen.add(item._metadata.key)
        results.push({
          id:        item._metadata.key,
          title:     item._metadata.displayName ?? 'Untitled',
          url:       absoluteUrl(item._metadata.url.default, item._metadata.url.base) as string,
          type:      'Page',
          published: item._metadata.published || undefined,
          excerpt:   (item.seoDescription as string | undefined) || undefined,
          imageUrl:  item.ogImage?.url?.default || undefined,
          _track:    withTrackAuth(item._track),
        })
      }
    } catch (err) {
      console.error('[search] BlankExperience query failed:', err)
    }

    // ── Generic page fallback (_Content) ────────────────────────────────────
    // Catches _page-typed content not covered by the typed query above.
    try {
      const contentQuery = buildContentQuery(withDomain, semantic)
      const data = await getClient().request(contentQuery, baseVars)
      const items: any[] = (data as any)?._Content?.items ?? []
      for (const item of items) {
        const types: string[] = item._metadata?.types ?? []
        if (!types.includes('_Page') && !types.includes('_Experience')) continue
        if (types.includes('OT_BlogPage')) continue
        if (types.includes('OT_EventPage')) continue
        if (types.some(t => SETTINGS_TYPES.has(t))) continue
        if (!item._metadata?.url?.default) continue
        if (seen.has(item._metadata.key)) continue
        seen.add(item._metadata.key)
        results.push({
          id:     item._metadata.key,
          title:  item._metadata.displayName ?? 'Untitled',
          url:    absoluteUrl(item._metadata.url.default, item._metadata.url.base) as string,
          type:   'Page',
          _track: withTrackAuth(item._track),
        })
      }
    } catch (err) {
      console.error('[search] content query failed:', err)
    }
  }

  return NextResponse.json(results)
}
