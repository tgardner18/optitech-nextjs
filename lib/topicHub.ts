import { getClient } from '@/lib/optimizely'

export type TopicHubRecommendation = {
  label: string
}

export type TopicHubBucket = {
  sectionHeadline:    string
  sectionIcon:        string | null
  sectionContentType: 'blogs' | 'events' | 'assets' | 'experiences' | 'locations' | 'practitioners'
}

export type TopicHubPageData = {
  _metadata:             { key: string; locale: string; url: { default: string } }
  headerName:            string | null
  headerEffect:          string | null
  damFolderContainerId:  string | null
  searchRecommendations: TopicHubRecommendation[]
  contentBuckets:        TopicHubBucket[]
  seoTitle:              string | null
  seoDescription:        string | null
  ogImage:               { url: { default: string } } | null
  noIndex:               boolean | null
}

const TOPIC_HUB_QUERY = `
  query GetTopicHubPage($key: String!, $locale: String) {
    OT_TopicHubPage(
      where: {
        _metadata: {
          key:    { eq: $key }
          locale: { eq: $locale }
          status: { eq: "Published" }
        }
      }
      limit: 1
    ) {
      items {
        _metadata { key locale url { default } }
        headerName
        headerEffect
        damFolderContainerId
        searchRecommendations {
          label
        }
        contentBuckets {
          sectionHeadline
          sectionIcon
          sectionContentType
        }
        seoTitle
        seoDescription
        ogImage { url { default } }
        noIndex
      }
    }
  }
`

export async function getTopicHubPage(
  key: string,
  locale: string,
): Promise<TopicHubPageData | null> {
  try {
    const data = await getClient().request(TOPIC_HUB_QUERY, { key, locale })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item = (data as any)?.OT_TopicHubPage?.items?.[0] ?? null
    if (!item) return null

    return {
      _metadata: {
        key:    item._metadata?.key ?? key,
        locale: item._metadata?.locale ?? locale,
        url:    { default: item._metadata?.url?.default ?? '' },
      },
      headerName:           (item.headerName as string | null) ?? null,
      headerEffect:         (item.headerEffect as string | null) ?? null,
      damFolderContainerId: (item.damFolderContainerId as string | null) ?? null,
      searchRecommendations: (item.searchRecommendations ?? [])
        .filter((r: { label?: unknown }) => r?.label)
        .map((r: { label: unknown }) => ({ label: String(r.label) })),
      contentBuckets: (item.contentBuckets ?? [])
        .filter((b: { sectionContentType?: unknown }) => b?.sectionContentType)
        .map((b: { sectionHeadline?: unknown; sectionIcon?: unknown; sectionContentType: unknown }) => ({
          sectionHeadline:    String(b.sectionHeadline ?? ''),
          sectionIcon:        (b.sectionIcon as string | null) ?? null,
          sectionContentType: b.sectionContentType as TopicHubBucket['sectionContentType'],
        })),
      seoTitle:      (item.seoTitle       as string | null) ?? null,
      seoDescription:(item.seoDescription as string | null) ?? null,
      ogImage:       item.ogImage?.url?.default
        ? { url: { default: item.ogImage.url.default } }
        : null,
      noIndex: (item.noIndex as boolean | null) ?? null,
    }
  } catch (err) {
    console.error('[topicHub] query failed:', err)
    return null
  }
}
