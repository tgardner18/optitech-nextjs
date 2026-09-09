import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { RichText } from '@optimizely/cms-sdk/react/richText'
import { OT_ImageBlock as OT_ImageBlockContentType } from '@/cms/content-types/OT_ImageBlock'
import { getImageStyles } from '@/cms/styling/OT_ImageBlock.styling'
import ImageBlock from '@/components/blocks/ImageBlock'
import { sanitizeCmsHtml } from '@/lib/sanitizeHtml'

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
      <div
        {...pa(content.__composition)}
        className="w-full py-xl px-md lg:px-lg"
        data-stagger={staggerAttr}
      >
        <div className="mx-auto max-w-360">
          {standaloneImageEl}
        </div>
      </div>
    )
  }

  const bgColor  = String(displaySettings?.bgColor ?? 'canvas')
  const bgClass  = ({ surface: 'bg-surface', brand: 'bg-brand' } as Record<string,string>)[bgColor] ?? ''
  const hasBg    = Boolean(bgClass)
  const onBrand  = bgColor === 'brand'

  const textContent = (
    <>
      {content.eyebrow && (
        <span
          {...pa('eyebrow')}
          className={`text-label uppercase tracking-wide font-semibold ${onBrand ? 'text-fg-on-brand/70' : 'text-brand'}`}
        >
          {content.eyebrow}
        </span>
      )}

      {content.heading && (
        <h2
          {...pa('heading')}
          className={`text-headline font-bold text-wrap-balance leading-tight ${onBrand ? 'text-fg-on-brand' : 'text-fg'}`}
        >
          {content.heading}
        </h2>
      )}

      {content.body && (
        <div
          {...pa('body')}
          data-rich-text=""
          data-color={onBrand ? 'brand' : undefined}
          className={`text-body leading-relaxed max-w-[60ch] ${onBrand ? 'text-fg-on-brand/80' : 'text-fg-muted'}`}
        >
          {content.body.json
            ? <RichText content={content.body.json} />
            : <div dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(content.body.html) }} />
          }
        </div>
      )}

      {content.ctaUrl?.default && (
        <div className="mt-sm">
          <a
            href={content.ctaUrl.default}
            className={`btn-signal inline-flex items-center gap-sm px-lg py-sm text-label font-semibold uppercase tracking-wide motion-safe:transition-colors motion-safe:duration-200 ease-quick ${onBrand ? 'bg-fg-on-brand text-brand' : 'bg-brand text-fg-on-brand'}`}
          >
            {content.ctaLabel || 'Learn more'}
          </a>
        </div>
      )}
    </>
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

  // Editorial 2-column layout: image fills the column height so it matches
  // the text column regardless of the text's length.
  const mediaEl = !imageSrc ? placeholder : (
    <ImageBlock
      src={imageSrc}
      alt={content.alt ?? ''}
      caption={content.caption ?? undefined}
      styleOptions={styleOptions}
      previewAttrs={{ image: pa('image'), caption: pa('caption') }}
      fillHeight={true}
    />
  )

  const gridCols =
    mediaSide === 'right'
      ? 'md:grid-cols-[45fr_55fr]'
      : 'md:grid-cols-[55fr_45fr]'

  const mediaOrder =
    mediaSide === 'right' ? 'order-2' : 'order-2 md:order-1'
  const textOrder =
    mediaSide === 'right' ? 'order-1' : 'order-1 md:order-2'

  const textEdgePadding =
    mediaSide === 'right' ? 'pl-lg' : 'pr-lg'

  return (
    <div
      {...pa(content.__composition)}
      className={`w-full${bgClass ? ` ${bgClass}` : ''}`}
      data-stagger={staggerAttr}
    >
      <div className={`grid grid-cols-1 ${gridCols} gap-lg md:gap-xl items-stretch md:min-h-[max(31.25rem,30vw)] mx-auto max-w-360 px-lg py-xl`}>
        <div className={`min-w-0 flex flex-col min-h-125 ${mediaOrder}`}>
          {mediaEl}
        </div>

        <div className={`min-w-0 flex flex-col gap-md justify-center ${textOrder} ${textEdgePadding}`}>
          {textContent}
        </div>
      </div>
    </div>
  )
}
