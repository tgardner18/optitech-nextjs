import { ContentProps } from '@optimizely/cms-sdk'
import { OT_TopicHubPage as OT_TopicHubPageContentType } from '@/cms/content-types/OT_TopicHubPage'
import { getSiteKey } from '@/lib/optimizely'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import TopicHubPage, { type TopicHubConfig } from '@/components/pages/TopicHubPage'

type Props = { content: ContentProps<typeof OT_TopicHubPageContentType> }

export default async function OT_TopicHubPageAdapter({ content }: Props) {
  const siteDomain = await getSiteKey()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = content as any

  const config: TopicHubConfig = {
    headerName:            raw.headerName            ?? null,
    headerEffect:          raw.headerEffect           ?? null,
    siteDomain,
    damFolderContainerId:  raw.damFolderContainerId  ?? null,
    searchRecommendations: Array.isArray(raw.searchRecommendations) ? raw.searchRecommendations : [],
    contentBuckets:        Array.isArray(raw.contentBuckets)        ? raw.contentBuckets        : [],
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <TopicHubPage config={config} />
      </main>
      <Footer />
    </>
  )
}
