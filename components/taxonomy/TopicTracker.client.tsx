'use client'

import { useEffect } from 'react'
import { trackTopicSelect, type TopicSource } from './track'

/**
 * Renders nothing. The article's category panel is server-rendered, so this listens for clicks on its links
 * (elements marked data-topic-source) and reports the chosen topics to ODP.
 * A marker carries one topic (data-topic-slug / data-topic-group); "Keep exploring" lists all of them (data-topic-slugs, with data-topic-groups in the same order, separated by |).
 */
export default function TopicTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-topic-source]')
      if (!el) return
      const source = el.dataset.topicSource as TopicSource
      const slugs = (el.dataset.topicSlugs ?? el.dataset.topicSlug ?? '').split(',').filter(Boolean)
      const groups = (el.dataset.topicGroups ?? '').split('|')
      slugs.forEach((slug, i) => trackTopicSelect({ slug, group: groups[i] ?? el.dataset.topicGroup }, source))
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
  return null
}
