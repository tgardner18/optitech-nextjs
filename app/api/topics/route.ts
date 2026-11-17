import { NextRequest, NextResponse } from 'next/server'
import { getRequestBaseUrl, getRequestLocale } from '@/lib/optimizely'
import { getTopicGroups, keysForSlugs } from '@/lib/taxonomy'
import { findTopicPages, findTaggedPages, TAGGED_QUERY } from '@/lib/topicHub'

/**
 * Topic Hub data from CMS categories.
 *   GET /api/topics?view=all            -> { pages }          every tagged page on this site (the hub filters in the browser)
 *   GET /api/topics?view=groups          -> { groups }          topics to browse, grouped by top-level category
 *   GET /api/topics?topics=a,b&match=all&from=<key> -> { pages } pages carrying the topics, newest first, with topics in common
 * Without `topics` the pages are simply the latest ones. Never throws: failures return empty lists.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  try {
    const locale = (sp.get('locale') || (await getRequestLocale())) as string
    if (sp.get('view') === 'all') {
      const base = await getRequestBaseUrl()
      // the query text is returned too, so the hub's Query inspector can show exactly what Graph was asked
      return NextResponse.json({
        pages: await findTaggedPages({ locale, base }),
        graphql: { query: TAGGED_QUERY.trim().replace(/^ {2}/gm, ''), variables: { locale, base, skip: 0 } },
      })
    }
    if (sp.get('view') === 'groups') return NextResponse.json({ groups: await getTopicGroups(locale) })

    const slugs = (sp.get('topics') ?? '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 12)
    const bySlug = await keysForSlugs(slugs, locale)
    // topics were asked for but none exist: nothing matches (not "everything")
    if (slugs.length && slugs.every((x) => !(bySlug[x]?.length))) return NextResponse.json({ pages: [] })
    const pages = await findTopicPages({
      groups: slugs.map((s) => bySlug[s] ?? []),
      match: sp.get('match') === 'all' ? 'all' : 'any',
      locale, base: await getRequestBaseUrl(), excludeKey: sp.get('from') || undefined,
    })
    return NextResponse.json({ pages })
  } catch (err) {
    console.error('[api/topics]', err)
    return NextResponse.json({ groups: [], pages: [] })
  }
}
