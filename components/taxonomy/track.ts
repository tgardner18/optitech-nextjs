/**
 * ODP signal for category interest. A reader choosing a topic (a marker on an article, "Keep exploring", or a topic in the
 * Topic Hub) sends one ODP `navigation` event with action `topic_select`, so interest segments can be built from it.
 * It uses the standard `navigation` type (like the storefront's filter_apply), so no custom ODP event type has to exist.
 * Privacy: only the topic slug, its group, and where it was chosen are sent; nothing about the person.
 */
export type TopicSource = 'article_marker' | 'article_cta' | 'hub'

export function trackTopicSelect(topic: { slug: string; group?: string }, source: TopicSource): void {
  if (typeof window === 'undefined') return
  try {
    window.zaius?.event('navigation', { action: 'topic_select', topic: topic.slug, topic_group: topic.group ?? '', source })
  } catch {
    /* ODP not loaded on this site */
  }
}
