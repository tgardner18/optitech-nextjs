/**
 * lib/structured-data.ts
 *
 * Builds JSON-LD structured data objects from page + site fields.
 *
 * No @optimizely/cms-sdk imports — this file is deliberately CMS-agnostic so
 * it can be called from any server component or route handler without pulling
 * in SDK internals.
 */
import type { PageSeoFields, SiteMetaSettings } from '@/lib/metadata'

// ── Builder ───────────────────────────────────────────────────────────────────

/**
 * Builds a schema.org JSON-LD graph from page-level and site-level fields.
 *
 * Always includes an Organization node. If page.schemaType is set (and not
 * "none"), a page-specific node is added to the graph.
 *
 * customSchemaJson is merged in as an additional node when valid JSON is
 * provided — parsing errors are swallowed with a console.warn; they never
 * crash the page.
 *
 * @param page    - SEO fields from the page content item
 * @param site    - Global settings from OT_ThemeManager
 * @param pageUrl - The full canonical URL of the page (e.g. "https://example.com/about")
 */
export function buildJsonLd(
  page: PageSeoFields,
  site: SiteMetaSettings,
  pageUrl: string,
): object {
  // Derive the site origin (protocol + host) from the full page URL.
  let origin = ''
  try {
    origin = new URL(pageUrl).origin
  } catch {
    // pageUrl may be relative or empty in edge cases — leave origin blank.
  }

  // ── Organization node (always emitted) ─────────────────────────────────────
  const organizationNode: Record<string, unknown> = {
    '@type': 'Organization',
    name:    site.siteName ?? undefined,
    url:     origin || undefined,
    description: site.organizationDescription ?? undefined,
  }

  // ── Early return when no page-specific schema is requested ─────────────────
  if (!page.schemaType || page.schemaType === 'none') {
    return { '@context': 'https://schema.org', '@graph': [organizationNode] }
  }

  // ── Page-specific node ─────────────────────────────────────────────────────
  let pageNode: Record<string, unknown>

  switch (page.schemaType) {
    case 'WebPage':
      pageNode = {
        '@type': 'WebPage',
        name:    page.seoTitle ?? undefined,
        description: page.pageAnswer ?? page.seoDescription ?? undefined,
        url: pageUrl,
      }
      break

    case 'Article':
      pageNode = {
        '@type': 'Article',
        headline: page.seoTitle ?? undefined,
        description: page.pageAnswer ?? page.seoDescription ?? undefined,
        url: pageUrl,
      }
      break

    case 'FAQPage':
      pageNode = {
        '@type': 'FAQPage',
        name: page.seoTitle ?? undefined,
        url:  pageUrl,
        // TODO: mainEntity will be populated by AccordionBlock in a future
        // enhancement when schemaType === 'FAQPage' and the block emits
        // Question/Answer pairs into the page's structured data context.
        mainEntity: [],
      }
      break

    case 'Product':
      pageNode = {
        '@type': 'Product',
        name:    page.seoTitle ?? undefined,
        description: page.pageAnswer ?? page.seoDescription ?? undefined,
        url: pageUrl,
      }
      break

    case 'Event':
      pageNode = {
        '@type': 'Event',
        name:    page.seoTitle ?? undefined,
        description: page.pageAnswer ?? page.seoDescription ?? undefined,
        url: pageUrl,
      }
      break

    default:
      // Unknown schemaType — emit only Organization node.
      return { '@context': 'https://schema.org', '@graph': [organizationNode] }
  }

  // ── Base graph ─────────────────────────────────────────────────────────────
  const graph: unknown[] = [organizationNode, pageNode]

  // ── Merge customSchemaJson ─────────────────────────────────────────────────
  if (page.customSchemaJson && page.customSchemaJson.trim()) {
    try {
      const parsed = JSON.parse(page.customSchemaJson)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        graph.push(parsed)
      }
    } catch {
      // Invalid JSON — log a warning but never throw or break the page.
      console.warn(
        '[structured-data] customSchemaJson contains invalid JSON and will be ignored.',
        page.customSchemaJson,
      )
    }
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}
