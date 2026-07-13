import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { RichText } from '@optimizely/cms-sdk/react/richText'
import { OT_ImageBlock as OT_ImageBlockContentType } from '@/cms/content-types/OT_ImageBlock'
import { getImageStyles } from '@/cms/styling/OT_ImageBlock.styling'
import ImageBlock from '@/components/blocks/ImageBlock'

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
  const hasEditorial = Boolean(
    content.eyebrow || content.heading || content.body || content.ctaUrl?.default
  )

  const mediaEl = !imageSrc ? (
    <div
      className="w-full flex items-center justify-center bg-surface border border-fg/10"
      style={{ minHeight: 200 }}
    >
      <p className="text-label text-fg-muted/60 font-mono">
        Image not available — publish the asset in CMS to display it
      </p>
    </div>
  ) : (
    <ImageBlock
      src={imageSrc}
      alt={content.alt ?? ''}
      caption={content.caption ?? undefined}
      styleOptions={styleOptions}
      previewAttrs={{ image: pa('image'), caption: pa('caption') }}
      fillHeight={true}
    />
  )

  if (!hasEditorial) {
    // Standalone image in a VB column: flex-1 + min-h-0 lets the wrapper grow to
    // fill its column (which self-stretches to the row height), so the image matches
    // the height of whatever sits in the adjacent column. The 400px floor in
    // ImageBlock ensures single-column sections have a comfortable visual presence.
    return (
      <div
        {...pa(content.__composition)}
        className="w-full flex-1 min-h-0 flex flex-col"
        data-stagger={staggerAttr}
      >
        {mediaEl}
      </div>
    )
  }

  // 55/45 split: when mediaSide=left the media column is first and wider;
  // when mediaSide=right the text column is first (left) and the wider media column is second.
  const gridCols =
    mediaSide === 'right'
      ? 'md:grid-cols-[45fr_55fr]'
      : 'md:grid-cols-[55fr_45fr]'

  // CSS order: text always renders first in DOM on mobile (order-1) so it
  // stacks on top. On desktop the order follows mediaSide.
  const mediaOrder =
    mediaSide === 'right' ? 'order-2' : 'order-2 md:order-1'
  const textOrder =
    mediaSide === 'right' ? 'order-1' : 'order-1 md:order-2'

  const textEdgePadding =
    mediaSide === 'right' ? 'pl-lg' : 'pr-lg'

  return (
    <div
      {...pa(content.__composition)}
      className={`w-full grid grid-cols-1 ${gridCols} gap-lg md:gap-xl items-stretch`}
      data-stagger={staggerAttr}
    >
      <div className={`min-w-0 self-stretch flex flex-col ${mediaOrder}`}>
        {mediaEl}
      </div>

      <div className={`min-w-0 flex flex-col gap-md ${textOrder} ${textEdgePadding}`}>
        {content.eyebrow && (
          <span
            {...pa('eyebrow')}
            className="text-label uppercase tracking-wide text-brand font-semibold"
          >
            {content.eyebrow}
          </span>
        )}

        {content.heading && (
          <h2
            {...pa('heading')}
            className="text-headline font-bold text-fg text-wrap-balance leading-tight"
          >
            {content.heading}
          </h2>
        )}

        {content.body && (
          <div
            {...pa('body')}
            data-rich-text=""
            className="text-body text-fg-muted leading-relaxed max-w-[60ch]"
          >
            {content.body.json
              ? <RichText content={content.body.json} />
              : <div dangerouslySetInnerHTML={{ __html: content.body.html ?? '' }} />
            }
          </div>
        )}

        {content.ctaUrl?.default && (
          <div className="mt-sm">
            <a
              href={content.ctaUrl.default}
              className="btn-signal inline-flex items-center gap-sm px-lg py-sm bg-brand text-fg-on-brand text-label font-semibold uppercase tracking-wide motion-safe:transition-colors motion-safe:duration-200 ease-quick"
            >
              {content.ctaLabel || 'Learn more'}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
