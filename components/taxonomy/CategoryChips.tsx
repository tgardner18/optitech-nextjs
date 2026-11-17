import { useId } from 'react'
import { ArrowRight, Tag } from 'lucide-react'
import type { ResolvedCategory } from '@/lib/taxonomy'
import { t } from '@/lib/i18n/t'
import { slotFor } from './slots'
import TopicTracker from './TopicTracker.client'

type Props = {
  categories?: ResolvedCategory[] | null
  locale?: string
  /** Topic Hub URL. When empty, markers render as plain labels and the button is hidden. */
  hubUrl?: string | null
  /** Key of the page being read, so the hub can leave it out of the results. */
  fromKey?: string
  /** Set when the panel sits on a brand-coloured surface. */
  tone?: 'auto' | 'on-brand'
}

function hubHref(hub: string, slugs: string[], fromKey?: string) {
  const qs = `topics=${slugs.map(encodeURIComponent).join(',')}${fromKey ? `&from=${encodeURIComponent(fromKey)}` : ''}`
  return `${hub}${hub.includes('?') ? '&' : '?'}${qs}`
}

/**
 * "More on these topics": a glass end cap listing the page's categories as markers (tag tile, leaf name, page count),
 * with a one-line lead and a "View related content" button that opens the Topic Hub with every topic selected.
 * A topic only this page carries is a plain label (a link would land on the article just read).
 * Renders nothing when there are no public categories.
 */
export default function CategoryChips({ categories, locale = 'en', hubUrl, fromKey, tone = 'auto' }: Props) {
  const headingId = useId()
  if (!categories?.length) return null

  const groups = [...new Set(categories.map((c) => c.group))]
  const hub = hubUrl || null

  // No Topic Hub is linked in Theme Manager: nothing to explore, so show the categories as a quiet "Filed under" row
  // (no panel, no outline headline, no button) instead of promising related reading.
  if (!hub) {
    return (
      <div data-cc-stage data-variant="plain">
        <div data-block="category-chips" data-container="plain" role="group" aria-labelledby={headingId}>
          <p data-part="cc-eyebrow" id={headingId}>{t(locale, 'blog.filedUnder')}</p>
          <ul data-part="list" role="list">
            {categories.map((c) => (
              <li key={c.key} data-part="marker">
                <span data-part="cell" data-slot={slotFor(c.group, groups.indexOf(c.group))} data-static="">
                  <span data-part="tile" aria-hidden="true"><Tag /></span>
                  <span data-part="name">{c.name}</span>
                  <span data-part="sr"> ({c.group})</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div data-cc-stage data-block-wrap="category-chips">
      <TopicTracker />
      <div data-part="intro">
        <p data-part="cc-eyebrow">{t(locale, 'blog.relatedReading')}</p>
        <h2 data-part="heading" id={headingId} data-text={t(locale, 'blog.moreOnTheseTopics')}>
          {t(locale, 'blog.moreOnTheseTopics')}
        </h2>
      </div>
      <nav
        data-block="category-chips"
        data-container="endcap"
        data-surface={tone === 'on-brand' ? 'flat' : 'glass'}
        data-tone={tone === 'auto' ? undefined : tone}
        aria-labelledby={headingId}
      >
        <ul data-part="list" role="list">
            {categories.map((c) => {
              const slot = slotFor(c.group, groups.indexOf(c.group))
              const alone = c.count !== undefined && c.count <= 1
              const linked = hub && !alone
              const inner = (
                <>
                  <span data-part="tile" aria-hidden="true"><Tag /></span>
                  <span data-part="name">{c.name}</span>
                  {c.count !== undefined && c.count > 1 && <span data-part="count" aria-hidden="true">{c.count}</span>}
                  <span data-part="sr"> ({c.group}{c.count && c.count > 1 ? `, ${c.count} ${t(locale, 'blog.pagesCount')}` : ''})</span>
                </>
              )
              return (
                <li key={c.key} data-part="marker">
                  {linked ? (
                    <a data-part="cell" data-slot={slot} href={hubHref(hub, [c.slug])} data-topic-source="article_marker" data-topic-slug={c.slug} data-topic-group={c.group}>{inner}</a>
                  ) : (
                    <span data-part="cell" data-slot={slot} data-static="">{inner}</span>
                  )}
                </li>
              )
            })}
        </ul>
        {hub && (
          <div data-part="foot">
            <p data-part="lead">{t(locale, 'blog.hubLead')}</p>
            <a data-part="cta" href={hubHref(hub, categories.map((c) => c.slug), fromKey)} data-topic-source="article_cta" data-topic-slugs={categories.map((c) => c.slug).join(',')} data-topic-groups={categories.map((c) => c.group).join('|')}>
              {t(locale, 'blog.keepExploring')}
              <span data-part="sr"> {t(locale, 'blog.inTopicHub')}</span>
              <ArrowRight aria-hidden="true" />
            </a>
          </div>
        )}
      </nav>
    </div>
  )
}
