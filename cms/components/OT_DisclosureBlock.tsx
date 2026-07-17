import { ContentProps }    from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_DisclosureBlock as OT_DisclosureBlockContentType } from '@/cms/content-types/OT_DisclosureBlock'
import DisclosureBlock, {
  type DisclosureItem,
  type DisclosureStyleOptions,
} from '@/components/blocks/DisclosureBlock'

type Props = {
  content:          ContentProps<typeof OT_DisclosureBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

// Add target="_blank" to links that don't already have a target attribute.
function processLinks(html: string): string {
  return html.replace(/<a\s(?![^>]*\btarget=)/gi, '<a target="_blank" rel="noopener noreferrer" ')
}

function buildItems(content: any): DisclosureItem[] {
  if (!Array.isArray(content.items)) return []
  return (content.items as any[])
    .map((item): DisclosureItem | null => {
      const html = item?.body?.html ?? item?.html ?? ''
      return html ? { html: processLinks(String(html)) } : null
    })
    .filter((item): item is DisclosureItem => item !== null)
}

export default function OT_DisclosureBlockAdapter({ content, displaySettings = {} }: Props) {
  const { pa }  = getPreviewUtils(content)
  const items   = buildItems(content)

  const styleOptions: DisclosureStyleOptions = {
    style:       (content.style as DisclosureStyleOptions['style'])             ?? 'finePrint',
    markerStyle: (content.markerStyle as DisclosureStyleOptions['markerStyle']) ?? 'numeric',
  }

  return (
    <div {...pa(content.__composition)} className="w-full">
      <DisclosureBlock
        heading={content.heading ?? undefined}
        items={items}
        styleOptions={styleOptions}
      />
    </div>
  )
}
