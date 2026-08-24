import Image  from 'next/image'
import { cn } from '@/lib/utils'
import Button  from '@/components/ui/Button'
import SliderRow from '@/cms/compositions/SliderRow'
import type { CarouselStyleOptions } from '@/cms/styling/OT_CarouselBlock.styling'

export type CarouselSlideData = {
  imageSrc?: string
  imageAlt?: string
  eyebrow?:  string
  heading?:  string
  body?:     string
  ctaLabel?: string
  ctaUrl?:   string
}

export type CarouselBlockProps = {
  eyebrow?:     string
  heading?:     string
  slides:       CarouselSlideData[]
  styleOptions: CarouselStyleOptions
}

export default function CarouselBlock({
  eyebrow,
  heading,
  slides,
  styleOptions,
}: CarouselBlockProps) {
  const { slideLayout, overlay, transition, controls, autoplay, loop, peek, gap, color } = styleOptions

  if (slides.length === 0) return null

  return (
    <section className="w-full">
      {(eyebrow || heading) && (
        <div className="container mb-lg">
          {eyebrow && (
            <p className="text-label tracking-label uppercase font-semibold text-brand mb-sm">
              {eyebrow}
            </p>
          )}
          {heading && (
            <h2 className="text-display font-display leading-display text-fg">{heading}</h2>
          )}
        </div>
      )}

      <SliderRow
        transition={transition}
        controls={controls}
        autoplay={autoplay}
        loop={loop}
        peek={peek}
        gap={gap}
        verticalPadding=""
        bgColorClass=""
      >
        {slides.map((slide, i) =>
          slideLayout === 'split'
            ? <SplitSlide key={i} slide={slide} color={color} />
            : <FullBleedSlide key={i} slide={slide} overlay={overlay} />
        )}
      </SliderRow>
    </section>
  )
}

// ─── Full-bleed slide ─────────────────────────────────────────────────────────
// Image fills the slide; left-to-right gradient gives the text panel contrast.

function FullBleedSlide({ slide, overlay }: { slide: CarouselSlideData; overlay: 'gradient' | 'none' }) {
  return (
    <div className="relative w-full aspect-[16/7] min-h-[280px] max-h-[560px] overflow-hidden bg-fg/10">
      {slide.imageSrc && (
        <Image
          src={slide.imageSrc}
          alt={slide.imageAlt ?? ''}
          fill
          className="object-cover"
          sizes="100vw"
          priority={false}
        />
      )}
      {overlay === 'gradient' && (
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"
        />
      )}
      {/* Text content */}
      <div className="absolute inset-0 flex items-center px-8 md:px-16">
        <div className="w-full max-w-[var(--ot-measure-tight)]">
          {slide.eyebrow && (
            <p className="text-label tracking-label uppercase font-semibold text-white/70 mb-2">
              {slide.eyebrow}
            </p>
          )}
          {slide.heading && (
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-white mb-4">
              {slide.heading}
            </h3>
          )}
          {slide.body && (
            <p className="text-sm md:text-base leading-relaxed text-white/80 mb-6">
              {slide.body}
            </p>
          )}
          {slide.ctaLabel && slide.ctaUrl && (
            <Button href={slide.ctaUrl} variant="ghost" size="md">
              {slide.ctaLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Split slide ──────────────────────────────────────────────────────────────
// Image on the left half; content panel on the right.

type PanelColor = 'canvas' | 'surface' | 'brand'

const PANEL_BG: Record<PanelColor, string> = {
  canvas:  'bg-canvas',
  surface: 'bg-surface',
  brand:   'bg-brand',
}

function SplitSlide({ slide, color }: { slide: CarouselSlideData; color: PanelColor }) {
  const isOnBrand = color === 'brand'
  const textFg    = isOnBrand ? 'text-fg-on-brand'    : 'text-fg'
  const eyebrowFg = isOnBrand ? 'text-fg-on-brand/70' : 'text-brand'
  const bodyFg    = isOnBrand ? 'text-fg-on-brand/80' : 'text-fg-muted'

  return (
    <div className="flex flex-col md:flex-row min-h-[360px]">
      {/* Image */}
      <div className="relative w-full md:w-[55%] aspect-[4/3] md:aspect-auto overflow-hidden bg-fg/10">
        {slide.imageSrc && (
          <Image
            src={slide.imageSrc}
            alt={slide.imageAlt ?? ''}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 55vw"
            priority={false}
          />
        )}
      </div>

      {/* Content panel */}
      <div
        className={cn(
          'flex-1 flex flex-col justify-center gap-sm',
          'px-section-x py-xl',
          PANEL_BG[color],
        )}
      >
        {slide.eyebrow && (
          <p className={cn('text-label tracking-label uppercase font-semibold', eyebrowFg)}>
            {slide.eyebrow}
          </p>
        )}
        {slide.heading && (
          <h3 className={cn('text-headline font-display leading-headline', textFg)}>
            {slide.heading}
          </h3>
        )}
        {slide.body && (
          <p className={cn('text-body leading-body max-w-lg', bodyFg)}>
            {slide.body}
          </p>
        )}
        {slide.ctaLabel && slide.ctaUrl && (
          <div className="mt-sm">
            <Button
              href={slide.ctaUrl}
              variant={isOnBrand ? 'ghost' : 'brand'}
              size="md"
            >
              {slide.ctaLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
