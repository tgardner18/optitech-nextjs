import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { OT_FooterBlock as OT_FooterBlockContentType } from '@/cms/content-types/OT_FooterBlock'
import Footer from '@/components/layout/Footer'
import { getFooterStyles, type FooterStyle } from '@/cms/styling/OT_FooterBlock.styling'

type Props = {
  content: ContentProps<typeof OT_FooterBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

const STYLE_LABEL: Record<FooterStyle, string> = { spotlight: 'Spotlight', centered: 'Centered', minimal: 'Minimal', columns: 'Columns' }
const BG_LABEL = { dark: 'Dark', light: 'Light', brand: 'Brand' } as const
const ALL_STYLES: FooterStyle[] = ['spotlight', 'centered', 'minimal', 'columns']

/**
 * CMS adapter for OT_FooterBlock: the editor preview of the footer block.
 *
 * The public site footer is rendered by components/layout/Footer.tsx. The preview
 * renders that same component with this block's own content, so editors see the
 * chosen Footer Style and Footer Background, plus the same content in the other
 * styles. Visuals: components/layout/site-footer.css (data-block="footer-preview").
 */
export default function OT_FooterBlockAdapter({ content }: Props) {
  const { pa, src } = getPreviewUtils(content)
  const { style, background } = getFooterStyles(content as unknown as Record<string, unknown>)

  const links = Array.isArray(content.links) ? (content.links as any[]).filter(l => l?.label) : []
  const logoSrc = src(content.footerLogo) ?? undefined
  const descriptionHtml = (content as any).description?.html as string | undefined

  // The record Footer.tsx reads (same shape as the Graph footer block).
  const block = {
    _metadata: (content as any)._metadata,
    footerStyle: style,
    footerLeftMode: background,
    footerLogo: logoSrc ? { url: { default: logoSrc } } : undefined,
    footerLogoSize: content.footerLogoSize,
    footerLogoInvertDark: content.footerLogoInvertDark,
    description: descriptionHtml ? { html: descriptionHtml } : undefined,
    links,
  }

  const empty = !descriptionHtml && links.length === 0
  const others = ALL_STYLES.filter(s => s !== style)

  return (
    <div data-block="footer-preview" {...pa(content.__composition)}>
      <div data-part="strip">
        <b>Footer block preview</b>
        <span data-part="tag">Style: {STYLE_LABEL[style]}</span>
        <span data-part="tag">Background: {BG_LABEL[background]}</span>
        <span data-part="tag">Footer Links: {links.length} of 10</span>
        <span data-part="tag">Logo: {logoSrc ? 'Footer Logo (override)' : 'site logo from Theme Manager'}</span>
      </div>
      {empty && (
        <p data-part="hint">
          This footer has no description or links yet, so visitors see the logo and copyright only.
          Add Footer Links (up to 10) or, for Columns, Link Columns.
        </p>
      )}
      <div data-part="stage"><Footer footerBlock={block} /></div>
      <details data-part="others">
        <summary>See this content in {others.map(o => STYLE_LABEL[o]).join(', ').replace(/, ([^,]*)$/, ', and $1')}</summary>
        {others.map(o => (
          <div key={o}>
            <p data-part="other-t">{STYLE_LABEL[o]}</p>
            <div data-part="stage"><Footer footerBlock={{ ...block, footerStyle: o }} /></div>
          </div>
        ))}
      </details>
    </div>
  )
}
