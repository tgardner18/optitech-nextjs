import Image    from 'next/image'
import Link     from 'next/link'
import { ArrowRight } from 'lucide-react'
import { RichText } from '@optimizely/cms-sdk/react/richText'
import BannerVideo from './BannerVideo.client'
import EntranceTrigger from './EntranceTrigger.client'
import { stableId } from '@/lib/stableId'

// ─── Style option types ───────────────────────────────────────────────────────

export type BannerStyleOptions = {
  color?:      'canvas' | 'surface' | 'brand' | 'brandDeep' | 'accent'
  alignment?:  'center' | 'left'
  size?:       'large'  | 'compact' | 'display'
  treatment?:  'scrim'  | 'glass' | 'none'
  imageBlend?: 'overlay' | 'multiply'
}

// Visual styling lives in banner.css (imported from app/globals.css), keyed on the data attributes below.

// ─── Component ────────────────────────────────────────────────────────────────

export type BannerBlockProps = {
  heading:       string
  headingLevel?: 'h1' | 'h2'
  eyebrow?:      string
  body?:         Parameters<typeof RichText>[0]['content'] | null
  bgImageSrc?:   string
  bgVideoSrc?:   string
  primaryCta?:   { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  styleOptions?: BannerStyleOptions
  pa?:           (prop?: string | { key: string }) => Record<string, string | undefined>
}

export default function BannerBlock({
  heading,
  headingLevel = 'h2',
  eyebrow,
  body,
  bgImageSrc,
  bgVideoSrc,
  primaryCta,
  secondaryCta,
  styleOptions = {},
  pa           = () => ({}),
}: BannerBlockProps) {
  const {
    color      = 'canvas',
    alignment  = 'center',
    size       = 'large',
    treatment  = 'scrim',
    imageBlend = 'overlay',
  } = styleOptions

  const hasImage = Boolean(bgImageSrc)
  const hasVideo = Boolean(bgVideoSrc)
  const hasMedia = hasImage || hasVideo
  const Heading  = headingLevel
  const headingId = stableId('banner', `${eyebrow ?? ''}|${heading}`)

  // Media is a dark ground; brand and brand deep are always dark; accent is always light.
  // Canvas and surface follow the page's own theme.
  const forcedTheme = hasMedia || color === 'brand' || color === 'brandDeep'
    ? 'dark'
    : color === 'accent'
      ? 'light'
      : undefined

  return (
    <section
      data-block="banner"
      data-treatment={treatment}
      data-color={color}
      data-align={alignment}
      data-size={size}
      data-media={hasVideo ? 'video' : hasImage ? 'image' : 'none'}
      data-blend={imageBlend}
      data-theme={forcedTheme}
      data-animate=""
      aria-labelledby={headingId}
    >
      {hasVideo ? (
        <BannerVideo src={bgVideoSrc!} poster={bgImageSrc} />
      ) : hasImage ? (
        <div data-part="media" aria-hidden="true">
          <Image
            src={bgImageSrc!}
            alt=""
            fill
            sizes="100vw"
            // Only the hero banner (h1) is the LCP candidate; secondary banners lazy-load.
            priority={headingLevel === 'h1'}
            quality={85}
          />
        </div>
      ) : null}

      {/* One scrim layer shaped to the text replaces the old tint, vignette and bloom */}
      <div data-part="scrim" aria-hidden="true" />

      <div data-part="inner">
        <div data-part="content">
          {eyebrow && <p data-part="eyebrow" {...pa('eyebrow')}>{eyebrow}</p>}
          <Heading data-part="heading" id={headingId} {...pa('heading')}>{heading}</Heading>
          {body && (
            <div data-part="body" data-rich-text="" {...pa('body')}>
              <RichText content={body} />
            </div>
          )}
          {(primaryCta || secondaryCta) && (
            <div data-part="ctas">
              {primaryCta && (
                <Link href={primaryCta.href} data-part="cta" data-kind="primary" {...pa('primaryCtaLabel')}>
                  {primaryCta.label}
                  <ArrowRight aria-hidden="true" />
                </Link>
              )}
              {secondaryCta && (
                <Link href={secondaryCta.href} data-part="cta" data-kind="secondary" {...pa('secondaryCtaLabel')}>
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
      <EntranceTrigger block="banner" />
    </section>
  )
}
