import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import AccordionBlock, {
  type AccordionItem,
  type AccordionBlockStyleOptions,
} from '@/components/blocks/AccordionBlock'

type Props = {
  content:          any
  displaySettings?: Record<string, string | boolean>
}

/**
 * Maps display template settings to AccordionBlockStyleOptions.
 * The CMS stores booleans as 'true'/'false' strings in select editors.
 */
function buildStyleOptions(ds: Record<string, string | boolean>): AccordionBlockStyleOptions {
  const color = String(ds.color ?? 'canvas') as AccordionBlockStyleOptions['color']
  const borderStyle = String(ds.borderStyle ?? 'ruled') as AccordionBlockStyleOptions['borderStyle']
  const openMode = String(ds.openMode ?? 'single') as AccordionBlockStyleOptions['openMode']
  const defaultOpen = String(ds.defaultOpen) === 'true'

  return { color, borderStyle, openMode, defaultOpen }
}

/**
 * Normalises the items array from CMS content.
 * Supports the OT_AccordionItem component format (current CMS format).
 */
function buildItems(content: any): AccordionItem[] {
  if (!Array.isArray(content.items)) return []
  return (content.items as any[])
    .filter(item => item?.question && item?.answer)
    .map(item => ({
      question: String(item.question),
      answer:   String(item.answer),
    }))
}

export default function OT_AccordionBlockAdapter({ content, displaySettings = {} }: Props) {
  const { pa }         = getPreviewUtils(content)
  const styleOptions   = buildStyleOptions(displaySettings)
  const items          = buildItems(content)

  return (
    <div {...pa(content.__composition)} className="w-full">
      <AccordionBlock
        eyebrow={content.eyebrow   ?? undefined}
        headline={content.headline ?? undefined}
        items={items}
        styleOptions={styleOptions}
      />
    </div>
  )
}
