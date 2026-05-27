/**
 * lib/metadata.ts
 *
 * Merges page-level SEO fields with site-level ThemeManager defaults into a
 * Next.js Metadata object.
 *
 * No @optimizely/cms-sdk imports — this file is deliberately CMS-agnostic so
 * it can be called from any server component or route handler without pulling
 * in SDK internals.
 */
import type { Metadata } from 'next'

// ── Field shapes ──────────────────────────────────────────────────────────────

/**
 * SEO fields present on both BlankExperience and OT_BlogPage.
 * All fields are optional — none is ever assumed to be populated.
 */
export type PageSeoFields = {
  seoTitle?:         string | null
  seoDescription?:   string | null
  canonicalUrl?:     { default?: string | null } | null
  ogImage?:          { url?: { default?: string | null } | null } | null
  pageAnswer?:       string | null
  schemaType?:       string | null
  noIndex?:          boolean | null
  customSchemaJson?: string | null
}

/**
 * Site-level SEO settings from OT_ThemeManager.
 * All fields are optional — ThemeManager may not be configured for every domain.
 */
export type SiteMetaSettings = {
  siteName?:               string | null
  defaultSeoDescription?:  string | null
  defaultSocialImage?:     { url?: { default?: string | null } | null } | null
  twitterHandle?:          string | null
  organizationDescription?: string | null
}

// ── Builder ───────────────────────────────────────────────────────────────────

/**
 * Builds a Next.js Metadata object by merging page-level fields with
 * site-level defaults. All fallback chains are explicit:
 *   page field → ThemeManager default → undefined (never throws)
 *
 * @param page     - SEO fields from the page content item
 * @param site     - Global defaults from OT_ThemeManager
 * @param pagePath - The URL pathname (e.g. "/about"), used to compute the
 *                   canonical URL when no override is set
 */
export function buildPageMetadata(
  page: PageSeoFields,
  site: SiteMetaSettings,
  pagePath: string,
): Metadata {
  const title       = page.seoTitle ?? site.siteName ?? 'OptiTech'
  const description = page.seoDescription ?? site.defaultSeoDescription ?? undefined

  const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const canonical = page.canonicalUrl?.default ?? `${siteUrl}${pagePath}`

  const imageUrl =
    page.ogImage?.url?.default ??
    site.defaultSocialImage?.url?.default ??
    undefined

  return {
    title: site.siteName
      ? { default: title, template: `%s | ${site.siteName}` }
      : title,

    description,

    alternates: {
      canonical,
    },

    openGraph: {
      title,
      description,
      url: canonical,
      siteName: site.siteName ?? undefined,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
      type: 'website',
    },

    twitter: {
      card: 'summary_large_image',
      site: site.twitterHandle ?? undefined,
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },

    robots: page.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },

    // ai-summary renders as <meta name="ai-summary" content="..."> —
    // a forward-looking GEO signal for AI engines that parse meta tags
    // (Perplexity, ChatGPT Browsing, Gemini).
    other: page.pageAnswer
      ? { 'ai-summary': page.pageAnswer }
      : undefined,
  }
}
