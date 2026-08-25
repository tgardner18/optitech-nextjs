import { cache } from 'react'
import { getClient } from '@/lib/optimizely'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type PracticeAreaData = {
  areaName:   string
  facility?:  string
  isPrimary?: boolean
}

/**
 * The flat shape consumed by the profile header (components/practitioner/
 * PractitionerHeader.tsx) and the directory listing (cards / rows / search /
 * filters). Resolved from OT_PractitionerProfile by the queries below.
 *
 * `bio` keeps its `{ html }` shape: the profile page renders it in full via
 * dangerouslySetInnerHTML; cards strip the HTML and truncate a ~200-char preview.
 *
 * `url` is the practitioner's OWN profile PAGE URL — OT_PractitionerProfile is a
 * shared component with no public URL of its own, so getAllPractitioners maps
 * each record to the OT_PractitionerPage that references it (see below).
 */
export type PractitionerData = {
  key:            string
  firstName:      string
  lastName:       string
  suffix?:        string
  credentials?:   string
  title?:         string
  headshotUrl?:   string
  bio?:           { html: string }
  practiceAreas:  PracticeAreaData[]
  phone?:         string
  email?:         string
  officeLocation?: string
  languages?:     string
  linkedIn?:      string
  url:            string
}

// Same shape — the listing needs every field for search and filtering.
export type PractitionerCardData = PractitionerData

// ─── GraphQL queries ──────────────────────────────────────────────────────────

// Shared selection of the profile record's fields. OT_PractitionerProfile is a
// `_component`; querying it by its root type returns the structured fields
// directly (practiceAreas resolves to the OT_PracticeArea sub-fields).
const PROFILE_FIELDS = `
  _metadata { key locale url { default } }
  firstName
  lastName
  suffix
  credentials
  title
  headshot { url { default } }
  bio { html }
  practiceAreas {
    areaName
    facility
    isPrimary
  }
  phone
  email
  officeLocation
  languages
  linkedIn { default }
`

const PRACTITIONER_QUERY = `
  query GetPractitioner($key: String!, $locale: String) {
    OT_PractitionerProfile(
      where: { _metadata: { key: { eq: $key }, locale: { eq: $locale } } }
      limit: 1
    ) {
      items { ${PROFILE_FIELDS} }
    }
  }
`

// Listing query — fetches up to Optimizely Graph's hard per-query cap of 100.
// When siteKey is provided, the Graph WHERE clause filters by the queryable
// siteKey field so only profiles belonging to this site are returned.
function buildPractitionersQuery(withSiteKey: boolean): string {
  const skVar    = withSiteKey ? ', $siteKey: String' : ''
  const skFilter = withSiteKey ? '\n      siteKey: { eq: $siteKey }' : ''
  return `
    query GetPractitioners($locale: String!${skVar}) {
      OT_PractitionerProfile(
        limit: 100,
        where: { _metadata: { locale: { eq: $locale } }${skFilter} }
      ) {
        items { ${PROFILE_FIELDS} }
      }
    }
  `
}

// Maps each practitioner record key → the URL of the OT_PractitionerPage that
// references it, so directory cards/rows link to the real profile page rather
// than the (URL-less) shared component.
const PRACTITIONER_PAGES_QUERY = `
  query GetPractitionerPages($locale: String!) {
    OT_PractitionerPage(
      limit: 100,
      where: { _metadata: { locale: { eq: $locale }, status: { eq: "Published" } } }
    ) {
      items {
        _metadata { url { default } }
        practitionerRef { key }
      }
    }
  }
`

// ─── Shaping ─────────────────────────────────────────────────────────────────────

function toPractitionerData(item: any, url: string): PractitionerData {
  const areas: PracticeAreaData[] = (item.practiceAreas ?? [])
    .filter((a: any) => a && (a.areaName || a.facility))
    .map((a: any) => ({
      areaName:  a.areaName ?? '',
      facility:  a.facility ?? undefined,
      isPrimary: a.isPrimary ?? undefined,
    }))

  return {
    key:            item._metadata?.key ?? '',
    firstName:      item.firstName ?? '',
    lastName:       item.lastName ?? '',
    suffix:         item.suffix ?? undefined,
    credentials:    item.credentials ?? undefined,
    title:          item.title ?? undefined,
    headshotUrl:    item.headshot?.url?.default ?? undefined,
    bio:            item.bio?.html ? { html: item.bio.html } : undefined,
    practiceAreas:  areas,
    phone:          item.phone ?? undefined,
    email:          item.email ?? undefined,
    officeLocation: item.officeLocation ?? undefined,
    languages:      item.languages ?? undefined,
    linkedIn:       item.linkedIn?.default ?? undefined,
    url,
  }
}

// ─── Data access ──────────────────────────────────────────────────────────────────

/**
 * Fetches a single OT_PractitionerProfile by content key, with English
 * fallback. Used by the profile page route to populate the locked header from
 * the practitionerRef target. React-cached so generateMetadata and the page
 * component share one round-trip within the same request.
 */
export const getPractitioner = cache(async function getPractitioner(
  key: string,
  locale = 'en',
): Promise<PractitionerData | null> {
  try {
    const data = await getClient().request(PRACTITIONER_QUERY, { key, locale })
    let item = (data as any)?.OT_PractitionerProfile?.items?.[0] ?? null
    if (!item && locale !== 'en') {
      const fallback = await getClient().request(PRACTITIONER_QUERY, { key, locale: 'en' })
      item = (fallback as any)?.OT_PractitionerProfile?.items?.[0] ?? null
    }
    if (!item) return null
    return toPractitionerData(item, item._metadata?.url?.default ?? '')
  } catch {
    return null
  }
})

/**
 * Fetches published practitioner records for the directory listing.
 * When siteKey is provided the Graph WHERE clause restricts results to profiles
 * whose siteKey field matches — isolating one site on a shared CMS instance.
 * Dedups by key, resolves each record's profile-page URL, and applies the
 * optional limit last. React-cached so multiple listing blocks share a round-trip.
 */
export const getAllPractitioners = cache(async function getAllPractitioners(
  options?: { siteKey?: string; limit?: number; locale?: string },
): Promise<PractitionerCardData[]> {
  const locale  = options?.locale ?? 'en'
  const siteKey = options?.siteKey
  const query   = buildPractitionersQuery(!!siteKey)
  const vars    = { locale, ...(siteKey ? { siteKey } : {}) }
  try {
    const [profilesData, pagesData] = await Promise.all([
      getClient().request(query, vars),
      getClient().request(PRACTITIONER_PAGES_QUERY, { locale }).catch(() => null),
    ])

    const items: any[] = (profilesData as any)?.OT_PractitionerProfile?.items ?? []

    // key → profile-page URL map (a practitioner may have no page yet)
    const pageItems: any[] = (pagesData as any)?.OT_PractitionerPage?.items ?? []
    const pageUrlByKey = new Map<string, string>()
    for (const p of pageItems) {
      const refKey = p.practitionerRef?.key as string | undefined
      const url    = p._metadata?.url?.default as string | undefined
      if (refKey && url && !pageUrlByKey.has(refKey)) pageUrlByKey.set(refKey, url)
    }

    // Dedup by key (Graph returns one row per locale variant).
    const seen = new Set<string>()
    const unique = items.filter(p => {
      const k = p._metadata?.key as string | undefined
      if (!k || seen.has(k)) return false
      seen.add(k)
      return true
    })

    const mapped = unique
      .map(item => toPractitionerData(item, pageUrlByKey.get(item._metadata?.key) ?? ''))
      .sort((a, b) =>
        (a.lastName || a.firstName).localeCompare(b.lastName || b.firstName),
      )

    return typeof options?.limit === 'number' && options.limit > 0
      ? mapped.slice(0, options.limit)
      : mapped
  } catch {
    return []
  }
})
