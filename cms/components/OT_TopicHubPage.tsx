import { ContentProps } from '@optimizely/cms-sdk'
import { OT_TopicHubPage as OT_TopicHubPageContentType } from '@/cms/content-types/OT_TopicHubPage'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import TopicHubPage from '@/components/pages/TopicHubPage'

type Props = { content: ContentProps<typeof OT_TopicHubPageContentType> }

export default async function OT_TopicHubPageAdapter({ content }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = content as any
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
