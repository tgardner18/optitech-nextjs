import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { RichText } from '@optimizely/cms-sdk/react/richText'
import { OT_VideoBlock as OT_VideoBlockContentType } from '@/cms/content-types/OT_VideoBlock'
import { getVideoStyles } from '@/cms/styling/OT_VideoBlock.styling'
import VideoBlock from '@/components/blocks/VideoBlock'

type Props = {
  content: ContentProps<typeof OT_VideoBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

export default function OT_VideoBlock({ content, displaySettings = {} }: Props) {
  const { pa }            = getPreviewUtils(content)
  const styleOptions      = getVideoStyles(displaySettings)
  const entranceAnimation = String(displaySettings?.entranceAnimation ?? 'none')
  const staggerAttr       = entranceAnimation !== 'none' ? entranceAnimation : undefined

  const mediaSide = (content.mediaSide ?? displaySettings?.mediaSide ?? 'left') as 'left' | 'right'
  const hasEditorial = Boolean(
    content.eyebrow || content.heading || content.body || content.ctaUrl?.default
  )

  const mediaEl = (
    <VideoBlock
      src={content.videoUrl ?? ''}
      title={content.title ?? ''}
      caption={content.caption ?? undefined}
      styleOptions={styleOptions}
      previewAttrs={{ caption: pa('caption') }}
    />
  )

  if (!hasEditorial) {
    return (
      <div {...pa(content.__composition)} className="w-full" data-stagger={staggerAttr}>
        {mediaEl}
      </div>
    )
  }

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
      className={`w-full grid grid-cols-1 ${gridCols} gap-lg md:gap-xl items-center`}
      data-stagger={staggerAttr}
    >
      <div className={`min-w-0 ${mediaOrder}`}>
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
            className="text-body text-fg-muted leading-relaxed max-w-[60ch]"
          >
            <RichText content={content.body.json ?? undefined} />
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
