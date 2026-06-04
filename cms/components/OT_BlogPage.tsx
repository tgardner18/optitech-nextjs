import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_BlogPage as OT_BlogPageContentType } from '@/cms/content-types/OT_BlogPage'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BlogPage from '@/components/pages/BlogPage'

type Props = { content: ContentProps<typeof OT_BlogPageContentType> }

// CMS Visual Editor adapter for OT_BlogPage.
// Renders the full blog page (with Header/Footer) so the editor preview shows
// the real layout. latestPosts is omitted to avoid an extra Graph round-trip.
//
// pa() is passed to BlogPage so each field element gets a data-epi-edit
// attribute — enabling the CMS editor to scroll/highlight the matching DOM
// node when a field is selected in the sidebar.
export default async function OT_BlogPageAdapter({ content }: Props) {
  const { pa } = getPreviewUtils(content)

  return (
    <>
      <Header />
      <main className="flex-1" {...pa(content.__composition)}>
        <BlogPage content={content as any} latestPosts={[]} pa={pa} />
      </main>
      <Footer />
    </>
  )
}
