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

  const logoUrl = site.logo?.url?.default ?? undefined

  // ── Organization node (always emitted) ─────────────────────────────────────
  const organizationNode: Record<string, unknown> = {
    '@type': 'Organization',
    name:    site.siteName ?? undefined,
    url:     origin || undefined,
    description: site.organizationDescription ?? undefined,
    ...(logoUrl ? { logo: { '@type': 'ImageObject', url: logoUrl } } : {}),
  }

  // ── WebSite node (always emitted) ──────────────────────────────────────────
  const webSiteNode: Record<string, unknown> = {
    '@type': 'WebSite',
    name:    site.siteName ?? undefined,
    url:     origin || undefined,
  }

  // ── Base graph (always emitted) ────────────────────────────────────────────
  const graph: unknown[] = [organizationNode, webSiteNode]

  // ── Page-specific schema node ──────────────────────────────────────────────
  // schemaType selects the semantic type of the page itself (WebPage, Article,
  // Product, etc.). 'FAQPage' here means the *entire* page is a FAQ page — a
  // legitimate but uncommon choice. In most cases pages that happen to contain
  // an accordion should use their natural type (WebPage, Product, etc.) and
  // let the FAQ node be added automatically below.
  if (page.schemaType && page.schemaType !== 'none') {
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
        // Explicitly selected — skip the automatic FAQ node below (no duplicate).
        graph.push({
          '@type': 'FAQPage',
          name: page.seoTitle ?? undefined,
          url:  pageUrl,
          mainEntity: buildFaqMainEntity(page.faqItems),
        })
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
        pageNode = undefined as unknown as Record<string, unknown>
    }

    if (pageNode!) graph.push(pageNode)
  }

  // ── Auto FAQ node ──────────────────────────────────────────────────────────
  // When accordion blocks are present on the page AND the editor has not
  // explicitly selected 'FAQPage' as the schema type, add a FAQPage node
  // to the graph automatically. This means a product page, landing page, or
  // service page that happens to include an FAQ accordion gets both its
  // natural schema type AND the FAQPage rich-result eligibility — without
  // the editor needing to choose between them.
  if (
    page.schemaType !== 'FAQPage' &&
    page.faqItems?.length
  ) {
    graph.push({
      '@type': 'FAQPage',
      url:  pageUrl,
      mainEntity: buildFaqMainEntity(page.faqItems),
    })
  }

  // ── Merge customSchemaJson ─────────────────────────────────────────────────
  if (page.customSchemaJson && page.customSchemaJson.trim()) {
    try {
      const parsed = JSON.parse(page.customSchemaJson)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        graph.push(parsed)
      }
    } catch {
      console.warn(
        '[structured-data] customSchemaJson contains invalid JSON and will be ignored.',
        page.customSchemaJson,
      )
    }
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildFaqMainEntity(
  items: PageSeoFields['faqItems'],
): unknown[] {
  return (items ?? []).map(item => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  }))
}
