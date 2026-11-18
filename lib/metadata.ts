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
  /** Extracted at render time when schemaType === 'FAQPage' — populated by
   *  traversing the composition tree for OT_AccordionBlock items. */
  faqItems?:         Array<{ question: string; answer: string }> | null
  /** Populated for OT_PractitionerPage (schemaType 'Person') — drives the
   *  Person JSON-LD node. Built from the referenced practitioner record. */
  person?: {
    name?:        string
    jobTitle?:    string
    description?: string
    worksFor?:    string
  } | null
  /** Populated for catalog product pages (schemaType 'Product') — drives
   *  Product JSON-LD with offers, from the Graph catalog record. */
  product?: {
    name:          string
    description?:  string
    sku?:          string
    brand?:        string
    images?:       string[]
    rating?:       number
    reviewCount?:  number
    offers?: Array<{ sku: string; price: number; currency: string; inStock: boolean }>
  } | null
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
  /** Logo from the ThemeManager logo field — used in Organization JSON-LD */
  logo?:                   { url?: { default?: string | null } | null } | null
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
  // ── Title handling ─────────────────────────────────────────────────────────
  //
  // Next.js title templates work like this:
  //   layout  →  { default: "SiteName", template: "%s | SiteName" }
  //   page    →  title: "Using the SDK"          (plain string)
  //   result  →  <title>Using the SDK | SiteName</title>
  //
  // The template MUST live in the ROOT LAYOUT (app/layout.tsx generateMetadata).
  // Returning a TemplateString from a page applies the template to that page's
  // *children*, not to the page itself — so the current page's <title> falls
  // back to the layout's plain string, which is just "SiteName".
  //
  // Rule: page-level title = seoTitle only (the layout template adds "| SiteName").
  //       undefined when seoTitle is blank → layout `default` kicks in.
  const pageTitle = page.seoTitle ?? undefined

  // OG / Twitter need the fully-formatted "Page Title | Site Name" string
  // because social platforms don't apply any template logic.
  // Editors often type the brand into the SEO title ("Services | Opti Medical"), and the layout
  // template would then append it again ("Services | Opti Medical | Opti Medical"). When the title
  // already names the site (ignoring case, spaces and punctuation, so "OptiMedical" counts), use it as is.
  const squash = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, '')
  const namesSite = !!(pageTitle && site.siteName && squash(pageTitle).includes(squash(site.siteName)))

  const richTitle =
    pageTitle && site.siteName && !namesSite
      ? `${pageTitle} | ${site.siteName}`
      : pageTitle ?? site.siteName ?? 'Site Accelerator'

  const description = page.seoDescription ?? site.defaultSeoDescription ?? undefined

  const siteUrl   = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')
  const canonical = page.canonicalUrl?.default ?? `${siteUrl}${pagePath}`

  const imageUrl =
    page.ogImage?.url?.default ??
    site.defaultSocialImage?.url?.default ??
    undefined

  return {
    // Plain string — the root layout's template appends "| SiteName" automatically.
    title: namesSite && pageTitle ? { absolute: pageTitle } : pageTitle,

    description,

    alternates: {
      canonical,
    },

    openGraph: {
      title: richTitle,
      description,
      url: canonical,
      siteName: site.siteName ?? undefined,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
      type: 'website',
    },

    twitter: {
      card: 'summary_large_image',
      site: site.twitterHandle ?? undefined,
      title: richTitle,
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
