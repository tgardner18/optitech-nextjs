/**
 * Dynamic llms.txt route — served at /llms.txt
 *
 * The llms.txt specification (llmstxt.org) defines a plain-text file at the
 * site root that gives AI language models a structured, concise summary of
 * the site's purpose, content areas, and key pages — the same function that
 * robots.txt serves for traditional crawlers.
 *
 * This route generates the file from live ThemeManager settings so it stays
 * accurate as the CMS content evolves. Update the "Key Pages" and "Services"
 * sections below when new content areas are added.
 */

import { NextResponse }                           from 'next/server'
import { getSiteSettings, getRequestDomain, getRequestBaseUrl } from '@/lib/optimizely'

export const dynamic = 'force-dynamic'

export async function GET() {
  const domain   = await getRequestDomain()
  const baseUrl  = await getRequestBaseUrl()
  const settings = await getSiteSettings(domain)

  const siteUrl      = process.env.NEXT_PUBLIC_SITE_URL ?? baseUrl ?? `https://${domain}`
  const siteName     = (settings?.siteName as string | null)               ?? 'OptiTech'
  const orgDesc      = (settings?.organizationDescription as string | null) ?? ''
  const seoDesc      = (settings?.defaultSeoDescription as string | null)   ?? ''
  const description  = orgDesc || seoDesc

  // Build the llms.txt document following the spec:
  //   # Title           — name of the site
  //   > Blockquote      — one-line summary (what it is)
  //   ## Section        — named content groups with URLs
  const lines: string[] = [
    `# ${siteName}`,
    '',
    description ? `> ${description}` : `> ${siteName} — official website.`,
    '',
    '## Key Pages',
    '',
    `- [Homepage](${siteUrl}/)`,
    `- [Plans Overview](${siteUrl}/plans/)`,
    `- [Individual & Family Plans](${siteUrl}/plans/individual-overview/)`,
    `- [Medicare Plans](${siteUrl}/plans/medicare-overview/)`,
    `- [Employer Plans](${siteUrl}/plans/employer-overview/)`,
    '',
    '## About This Site',
    '',
    `${siteName} is a health insurance provider. This site offers information about`,
    'available health insurance plans, coverage options, and resources for individuals,',
    'families, Medicare beneficiaries, and employer groups.',
    '',
    '## Contact',
    '',
    `Website: ${siteUrl}`,
  ]

  const body = lines.join('\n').trimEnd()

  return new NextResponse(body, {
    headers: {
      'Content-Type':  'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
