import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { RichText } from '@optimizely/cms-sdk/react/richText'
import { OT_ImageBlock as OT_ImageBlockContentType } from '@/cms/content-types/OT_ImageBlock'
import { getImageStyles } from '@/cms/styling/OT_ImageBlock.styling'
import { stableId } from '@/lib/stableId'
import ImageBlock from '@/components/blocks/ImageBlock'
import MediaEditorial from '@/components/blocks/MediaEditorial'
import { sanitizeCmsHtml } from '@/lib/sanitizeHtml'
import { resolveCmsUrl } from '@/lib/resolveCmsUrl'

type Props = {
  content: ContentProps<typeof OT_ImageBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

export default function OT_ImageBlock({ content, displaySettings = {} }: Props) {
  const { pa, src }       = getPreviewUtils(content)
  const styleOptions      = getImageStyles(displaySettings)
  const imageSrc          = src(content.image)
  const entranceAnimation = String(displaySettings?.entranceAnimation ?? 'none')
  const staggerAttr       = entranceAnimation !== 'none' ? entranceAnimation : undefined

  const mediaSide    = (content.mediaSide ?? displaySettings?.mediaSide ?? 'right') as 'left' | 'right'
  const hasBody      = Boolean(content.body?.html?.replace(/<[^>]*>/g, '').trim())
  const hasEditorial = Boolean(content.eyebrow || content.heading || hasBody || content.ctaUrl?.default)

  // "Media size" other than Fill sizes the image to its own content — the
  // generous section-level spacing below (meant for a full-bleed hero image)
  // would otherwise dwarf a small logo/icon in whitespace.
  const isCompactMedia = Boolean(styleOptions.mediaSize && styleOptions.mediaSize !== 'fill')

  const bgColor = String(displaySettings?.bgColor ?? 'canvas')
  const headingId = stableId('image', `${content.heading ?? ''}|${content.eyebrow ?? ''}|${content.alt ?? ''}`)

  const placeholder = (
    <div
      className="w-full flex items-center justify-center bg-surface border border-fg/10"
      style={{ minHeight: 200 }}
    >
      <p className="text-label text-fg-muted/60 font-mono">
        Image not available — publish the asset in CMS to display it
      </p>
    </div>
  )

  if (!hasEditorial) {
    const standaloneImageEl = !imageSrc ? placeholder : (
      <ImageBlock
        src={imageSrc}
        alt={content.alt ?? ''}
        caption={content.caption ?? undefined}
        styleOptions={styleOptions}
        previewAttrs={{ image: pa('image'), caption: pa('caption') }}
      />
    )

    if (isCompactMedia) {
      return (
        <div {...pa(content.__composition)} data-stagger={staggerAttr}>
          {standaloneImageEl}
        </div>
      )
    }

    return (
      <div {...pa(content.__composition)} className="w-full" data-stagger={staggerAttr}>
        <section data-block="image" data-layout="full" data-color={bgColor} data-theme={bgColor === 'brand' ? 'dark' : undefined} aria-label={content.alt || 'Image'}>
          <div data-part="wrap">{standaloneImageEl}</div>
        </section>
      </div>
    )
  }

  const bgClass  = ({ surface: 'bg-surface', brand: 'bg-brand' } as Record<string,string>)[bgColor] ?? ''

  const textContent = (
    <MediaEditorial
      eyebrow={content.eyebrow}
      heading={content.heading}
      headingId={headingId}
      ctaHref={content.ctaUrl?.default ? resolveCmsUrl(content.ctaUrl) : undefined}
      ctaLabel={content.ctaLabel}
      attrs={{ eyebrow: pa('eyebrow'), heading: pa('heading'), body: pa('body') }}
      body={content.body
        ? (content.body.json
            ? <RichText content={content.body.json} />
            : <div dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(content.body.html) }} />)
        : undefined}
    />
  )

  // isCompactMedia (computed above) overrides the side-by-side editorial grid
  // below — a compact logo/icon reads as a masthead above the text, not a
  // media column stretched to match it.
  if (isCompactMedia) {
    const compactMediaEl = !imageSrc ? placeholder : (
      <ImageBlock
        src={imageSrc}
        alt={content.alt ?? ''}
        caption={content.caption ?? undefined}
        styleOptions={styleOptions}
        previewAttrs={{ image: pa('image'), caption: pa('caption') }}
      />
    )

    return (
      <div
        {...pa(content.__composition)}
        className={`w-full${bgClass ? ` ${bgClass}` : ''}`}
        data-stagger={staggerAttr}
      >
        <div className="flex flex-col items-start gap-md">
          {compactMediaEl}
          {textContent}
        </div>
      </div>
    )
  }

  // Editorial 2-column layout: the media keeps its aspect ratio and centers against the text.
  const mediaEl = !imageSrc ? placeholder : (
    <ImageBlock
      src={imageSrc}
      alt={content.alt ?? ''}
      caption={content.caption ?? undefined}
      styleOptions={styleOptions}
      previewAttrs={{ image: pa('image'), caption: pa('caption') }}
    />
  )

  return (
    <div {...pa(content.__composition)} className="w-full" data-stagger={staggerAttr}>
      <section
        data-block="image"
        data-layout="editorial"
        data-side={mediaSide}
        data-color={bgColor}
        data-theme={bgColor === 'brand' ? 'dark' : undefined}
        {...(content.heading ? { 'aria-labelledby': headingId } : { 'aria-label': content.alt || 'Image' })}
      >
        <div data-part="grid">
          {textContent}
          <div data-part="media">{mediaEl}</div>
        </div>
      </section>
    </div>
  )
}
