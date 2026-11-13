import { cache } from 'react'
import { getClient } from '@/lib/optimizely'

// Types that exist in the CMS tree but have no front-end page of their own.
const NON_RENDERING = new Set(['OT_FolderPage'])

const QUERY = `
  query GetAncestorPages($urls: [String!]) {
    _Content(
      where: { _metadata: { url: { hierarchical: { in: $urls } }, status: { eq: "Published" } } }
      limit: 50
    ) {
      items { _metadata { types url { hierarchical base } } }
    }
  }
`

type AncestorResult = {
  _Content?: { items?: { _metadata?: { types?: string[]; url?: { hierarchical?: string | null; base?: string | null } } }[] }
}

/**
 * Where a post's "back to all articles" link should go: the nearest ancestor URL that is a
 * real, renderable page. "/insights/2026/my-post" -> "/insights/2026" if that is a page, else
 * "/insights" (when 2026 is a folder), else "/". Falls back to the plain parent on any failure.
 */
export const getBlogIndexUrl = cache(async function getBlogIndexUrl(
  pageUrl: string,
  siteBaseUrl?: string | null,
): Promise<string> {
  const segments = pageUrl.split('/').filter(Boolean)
  const ancestors: string[] = []
  for (let n = segments.length - 1; n >= 1; n--) ancestors.push('/' + segments.slice(0, n).join('/') + '/')
  const plain = ancestors[0]?.replace(/\/$/, '') || '/'
  if (!ancestors.length) return '/'

  try {
    const data = await getClient().request(QUERY, { urls: ancestors })
    const items = (data as AncestorResult)?._Content?.items ?? []
    const base = siteBaseUrl?.replace(/\/$/, '')
    const renderable = new Set<string>()
    for (const it of items) {
      const m = it._metadata
      const url = m?.url?.hierarchical
      if (!m || !url) continue
      // Content Graph indexes every site channel in the tenant: keep this site's pages only.
      const itemBase = m.url?.base?.replace(/\/$/, '')
      if (base && itemBase && itemBase !== base) continue
      if (m.types?.some(t => NON_RENDERING.has(t))) continue
      renderable.add(url)
    }
    const hit = ancestors.find(a => renderable.has(a))
    return hit ? hit.replace(/\/$/, '') || '/' : '/'
  } catch {
    return plain
  }
})
