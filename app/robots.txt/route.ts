/**
 * Dynamic robots.txt, served at /robots.txt.
 *
 * This is a route handler instead of app/robots.ts because Next's robots() helper cannot emit the
 * Content-Signal directive (contentsignals.org), which has to sit inside the robots.txt group to
 * be picked up by crawlers and audit tools.
 */
import { getRequestBaseUrl } from '@/lib/optimizely'
import { AI_CRAWLERS, INDEXING_ALLOWED } from '@/lib/indexing'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Per request host: one deployment serves several demo domains, and each
  // must point crawlers at its own sitemap.
  const siteUrl = await getRequestBaseUrl()

  const lines = [
    // Crawling stays open on purpose. Keeping search results clean is done with a
    // noindex header (see lib/indexing.ts), which a crawler only sees if it may fetch the page.
    'User-Agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /opti-admin/',
    // Reading and answering from the site is fine; search indexing and model training are not
    // (search flips to yes only when a deployment sets ALLOW_INDEXING=true).
    `Content-Signal: search=${INDEXING_ALLOWED ? 'yes' : 'no'}, ai-input=yes, ai-train=no`,
    '',
    // AI answer engines and assistants: explicitly permitted for demo analysis
    ...AI_CRAWLERS.flatMap(userAgent => [`User-Agent: ${userAgent}`, 'Allow: /', '']),
  ]
  // Do not hand search engines a sitemap unless indexing is enabled.
  if (INDEXING_ALLOWED && siteUrl) lines.push(`Sitemap: ${siteUrl}/sitemap.xml`, '')

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=3600' },
  })
}
