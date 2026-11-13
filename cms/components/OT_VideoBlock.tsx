import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { RichText } from '@optimizely/cms-sdk/react/richText'
import { OT_VideoBlock as OT_VideoBlockContentType } from '@/cms/content-types/OT_VideoBlock'
import { getVideoStyles } from '@/cms/styling/OT_VideoBlock.styling'
import { stableId } from '@/lib/stableId'
import VideoBlock from '@/components/blocks/VideoBlock'
import MediaEditorial from '@/components/blocks/MediaEditorial'
import { sanitizeCmsHtml } from '@/lib/sanitizeHtml'
import { resolveCmsUrl } from '@/lib/resolveCmsUrl'

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
  const hasBody      = Boolean(content.body?.html?.replace(/<[^>]*>/g, '').trim())
  const hasEditorial = Boolean(content.eyebrow || content.heading || hasBody || content.ctaUrl?.default)

  const bgColor    = String(displaySettings?.bgColor ?? 'canvas')
  const headingId  = stableId('video', `${content.heading ?? ''}|${content.eyebrow ?? ''}|${content.title ?? ''}`)
  const themeAttr  = bgColor === 'brand' ? 'dark' : undefined

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
        <section data-block="video" data-layout="full" data-color={bgColor} data-theme={themeAttr} aria-label={`Video: ${content.title ?? ''}`}>
          <div data-part="wrap">{mediaEl}</div>
        </section>
      </div>
    )
  }

  return (
    <div {...pa(content.__composition)} className="w-full" data-stagger={staggerAttr}>
      <section
        data-block="video"
        data-layout="editorial"
        data-side={mediaSide}
        data-color={bgColor}
        data-theme={themeAttr}
        {...(content.heading ? { 'aria-labelledby': headingId } : { 'aria-label': `Video: ${content.title ?? ''}` })}
      >
        <div data-part="grid">
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
          <div data-part="media">{mediaEl}</div>
        </div>
      </section>
    </div>
  )
}
