import { cache } from 'react'
import { getClient } from '@/lib/optimizely'

// ─── Slot item types ──────────────────────────────────────────────────────────

export type CampaignHeroSlot = {
  __typename: 'OT_HeroBlock'
  eyebrow?:           string | null
  headline:           string
  body?:              string | null
  primaryCtaLabel?:   string | null
  primaryCtaUrl?:     string | null
  secondaryCtaLabel?: string | null
  secondaryCtaUrl?:   string | null
  visualSrc?:         string | null
  visualAlt?:         string | null
}

export type CampaignBodyItem =
  | {
      __typename: 'OT_PrimaryTextBlock'
      eyebrow?:     string | null
      headline:     string
      headingLevel?: string | null
      body?:        any | null
    }
  | {
      __typename: 'OT_FeatureGridBlock'
      eyebrow?:    string | null
      heading?:    string | null
      subheading?: string | null
      features:    Array<{
        headline:  string
        body?:     any | null
        ctaLabel?: string | null
        ctaUrl?:   string | null
      }>
      ctaLabel?: string | null
      ctaUrl?:   string | null
    }
  | {
      __typename: 'OT_TabsBlock'
      eyebrow?: string | null
      heading?: string | null
      tabs: Array<{
        tabLabel:  string
        tabIcon?:  string | null
        heading?:  string | null
        body?:     any | null
        ctaLabel?: string | null
        ctaUrl?:   string | null
      }>
    }
  | { __typename: '__unknown__'; typeName: string }

export type CampaignClosingItem =
  | {
      __typename: 'OT_QuoteBlock'
      quote:             string
      attributionName?:  string | null
      attributionTitle?: string | null
    }
  | {
      __typename: 'OT_VideoBlock'
      src:      string
      title:    string
      caption?: string | null
    }
  | {
      __typename: 'OT_ImageBlock'
      src:      string
      alt:      string
      caption?: string | null
    }
  | { __typename: '__unknown__'; typeName: string }

// ─── Page type ────────────────────────────────────────────────────────────────

export type CampaignPageContent = {
  _metadata: {
    key:       string
    published: string
    url:       { default: string | null }
  }
  pageTitle?:    string | null
  pageSubtitle?: string | null
  heroSection?:    CampaignHeroSlot    | null
  bodySection?:    CampaignBodyItem[]
  closingSection?: CampaignClosingItem[]
  // SEO
  seoTitle?:         string | null
  seoDescription?:   string | null
  canonicalUrl?:     { default?: string | null } | null
  ogImage?:          { url?: { default?: string | null } | null } | null
  pageAnswer?:       string | null
  schemaType?:       string | null
  noIndex?:          boolean | null
  customSchemaJson?: string | null
}

export type CampaignPageMeta = Pick<
  CampaignPageContent,
  '_metadata' | 'seoTitle' | 'seoDescription' | 'canonicalUrl' | 'ogImage' | 'pageAnswer' | 'schemaType' | 'noIndex' | 'customSchemaJson'
>

// ─── GraphQL queries ──────────────────────────────────────────────────────────

// heroSection is a single contentReference — only the key is reliably accessible
// (ContentReference to _component returns "Data" for the resolved item in Content Graph).
// Hero data is fetched separately using that key.
//
// bodySection and closingSection are content-area arrays (type: 'content' items).
// Content areas in Content Graph support inline fragment resolution, so we can
// query the actual typed fields directly without a separate round-trip.
const PAGE_QUERY = `
  query GetCampaignPage($key: String!) {
    OT_CampaignPage(
      where: { _metadata: { key: { eq: $key } } }
      limit: 1
    ) {
      items {
        _metadata { key published url { default } }
        pageTitle
        pageSubtitle
        heroSection { key }
        bodySection {
          __typename
          ... on OT_PrimaryTextBlock {
            eyebrow
            headline
            headingLevel
            body { json }
          }
          ... on OT_FeatureGridBlock {
            eyebrow
            heading
            subheading
            ctaLabel
            ctaUrl { default }
            features {
              headline
              body     { json }
              ctaLabel
              ctaUrl   { default }
            }
          }
          ... on OT_TabsBlock {
            eyebrow
            heading
            tabs {
              tabLabel
              tabIcon
              heading
              body     { json }
              ctaLabel
              ctaUrl   { default }
            }
          }
        }
        closingSection {
          __typename
          ... on OT_QuoteBlock {
            quote
            attributionName
            attributionTitle
          }
          ... on OT_VideoBlock {
            videoUrl
            title
            caption
          }
          ... on OT_ImageBlock {
            image { url { default } }
            alt
            caption
          }
        }
        seoTitle
        seoDescription
        canonicalUrl { default }
        ogImage      { url { default } }
        pageAnswer
        schemaType
        noIndex
        customSchemaJson
      }
    }
  }
`

const META_QUERY = `
  query GetCampaignPageMeta($key: String!) {
    OT_CampaignPage(
      where: { _metadata: { key: { eq: $key } } }
      limit: 1
    ) {
      items {
        _metadata { key published url { default } }
        seoTitle
        seoDescription
        canonicalUrl { default }
        ogImage      { url { default } }
        pageAnswer
        schemaType
        noIndex
        customSchemaJson
      }
    }
  }
`

// Hero uses a separate query because heroSection is a single contentReference
// and _component types don't resolve via inline fragments in Content Graph.
const HERO_QUERY = `
  query GetCampaignHero($key: String!) {
    OT_HeroBlock(
      where: { _metadata: { key: { eq: $key } } }
      limit: 1
    ) {
      items {
        eyebrow
        headline
        body
        primaryCtaLabel
        primaryCtaUrl    { default }
        secondaryCtaLabel
        secondaryCtaUrl  { default }
        visual           { url { default } }
        visualAlt
      }
    }
  }
`

// ─── Raw item mappers ─────────────────────────────────────────────────────────

function mapBodyItem(raw: any): CampaignBodyItem {
  switch (raw.__typename) {
    case 'OT_PrimaryTextBlock':
      return {
        __typename:   'OT_PrimaryTextBlock',
        eyebrow:      raw.eyebrow     ?? null,
        headline:     raw.headline    ?? '',
        headingLevel: raw.headingLevel ?? null,
        body:         raw.body?.json   ?? null,
      }
    case 'OT_FeatureGridBlock':
      return {
        __typename: 'OT_FeatureGridBlock',
        eyebrow:    raw.eyebrow    ?? null,
        heading:    raw.heading    ?? null,
        subheading: raw.subheading ?? null,
        ctaLabel:   raw.ctaLabel   ?? null,
        ctaUrl:     raw.ctaUrl?.default ?? null,
        features: (raw.features ?? []).map((f: any) => ({
          headline: f.headline ?? '',
          body:     f.body?.json ?? null,
          ctaLabel: f.ctaLabel  ?? null,
          ctaUrl:   f.ctaUrl?.default ?? null,
        })),
      }
    case 'OT_TabsBlock':
      return {
        __typename: 'OT_TabsBlock',
        eyebrow:    raw.eyebrow ?? null,
        heading:    raw.heading ?? null,
        tabs: (raw.tabs ?? []).map((t: any) => ({
          tabLabel: t.tabLabel ?? '',
          tabIcon:  t.tabIcon  ?? null,
          heading:  t.heading  ?? null,
          body:     t.body?.json ?? null,
          ctaLabel: t.ctaLabel ?? null,
          ctaUrl:   t.ctaUrl?.default ?? null,
        })),
      }
    default:
      return { __typename: '__unknown__', typeName: raw.__typename ?? 'Unknown' }
  }
}

function mapClosingItem(raw: any): CampaignClosingItem {
  switch (raw.__typename) {
    case 'OT_QuoteBlock':
      return {
        __typename:       'OT_QuoteBlock',
        quote:            raw.quote            ?? '',
        attributionName:  raw.attributionName  ?? null,
        attributionTitle: raw.attributionTitle ?? null,
      }
    case 'OT_VideoBlock':
      return {
        __typename: 'OT_VideoBlock',
        src:        raw.videoUrl ?? '',
        title:      raw.title   ?? '',
        caption:    raw.caption ?? null,
      }
    case 'OT_ImageBlock':
      return {
        __typename: 'OT_ImageBlock',
        src:        raw.image?.url?.default ?? '',
        alt:        raw.alt     ?? '',
        caption:    raw.caption ?? null,
      }
    default:
      return { __typename: '__unknown__', typeName: raw.__typename ?? 'Unknown' }
  }
}

// ─── Data access ──────────────────────────────────────────────────────────────

export const getCampaignPage = cache(async function getCampaignPage(
  key: string,
): Promise<CampaignPageContent | null> {
  if (!key) return null
  try {
    const data = await getClient().request(PAGE_QUERY, { key })
    const item = (data as any)?.OT_CampaignPage?.items?.[0] ?? null
    if (!item) return null

    // Fetch hero separately (single contentReference → Content Graph "Data" issue)
    const heroKey = item.heroSection?.key as string | undefined
    let heroSection: CampaignHeroSlot | null = null
    if (heroKey) {
      try {
        const heroData = await getClient().request(HERO_QUERY, { key: heroKey })
        const raw = (heroData as any)?.OT_HeroBlock?.items?.[0]
        if (raw) {
          heroSection = {
            __typename:        'OT_HeroBlock',
            eyebrow:           raw.eyebrow           ?? null,
            headline:          raw.headline          ?? '',
            body:              raw.body              ?? null,
            primaryCtaLabel:   raw.primaryCtaLabel   ?? null,
            primaryCtaUrl:     raw.primaryCtaUrl?.default ?? null,
            secondaryCtaLabel: raw.secondaryCtaLabel ?? null,
            secondaryCtaUrl:   raw.secondaryCtaUrl?.default ?? null,
            visualSrc:         raw.visual?.url?.default ?? null,
            visualAlt:         raw.visualAlt         ?? null,
          }
        }
      } catch { /* hero fetch failed — render without it */ }
    }

    const bodySection: CampaignBodyItem[] =
      (item.bodySection ?? []).map(mapBodyItem)

    const closingSection: CampaignClosingItem[] =
      (item.closingSection ?? []).map(mapClosingItem)

    return {
      ...item,
      heroSection,
      bodySection,
      closingSection,
    }
  } catch {
    return null
  }
})

export const getCampaignPageMeta = cache(async function getCampaignPageMeta(
  key: string,
): Promise<CampaignPageMeta | null> {
  if (!key) return null
  try {
    const data = await getClient().request(META_QUERY, { key })
    const item = (data as any)?.OT_CampaignPage?.items?.[0] ?? null
    return item ?? null
  } catch {
    return null
  }
})
