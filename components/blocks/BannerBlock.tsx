import Image    from 'next/image'
import Link     from 'next/link'
import { cva } from 'class-variance-authority'
import { cn }  from '@/lib/utils'
import { RichText } from '@optimizely/cms-sdk/react/richText'
import BannerEntrance from './BannerEntrance'

// ─── Style option types ───────────────────────────────────────────────────────

export type BannerStyleOptions = {
  color?:      'canvas' | 'surface' | 'brand'
  alignment?:  'center' | 'left'
  size?:       'large'  | 'compact' | 'display'
  treatment?:  'scrim'  | 'glass'
  imageBlend?: 'overlay' | 'multiply'
}

// ─── CVA configs ─────────────────────────────────────────────────────────────

const sectionCva = cva(
  'relative overflow-hidden flex items-center border-y border-fg/5',
  {
    variants: {
      size: {
        large:   'min-h-[clamp(400px,50vh,560px)] py-xl',
        compact: 'min-h-[clamp(240px,30vh,360px)] py-lg',
        display: 'min-h-[clamp(480px,60vh,720px)] py-2xl',
      },
    },
    defaultVariants: { size: 'large' },
  }
)

const eyebrowCva = cva(
  'text-label font-semibold tracking-label uppercase',
  {
    variants: {
      color: {
        canvas:  'text-accent',
        surface: 'text-accent',
        brand:   'text-fg-on-brand/70',
      },
    },
    defaultVariants: { color: 'canvas' },
  }
)

const headingCva = cva(
  'font-sans font-bold tracking-headline leading-headline text-balance',
  {
    variants: {
      color: {
        canvas:  'text-fg',
        surface: 'text-fg',
        brand:   'text-fg-on-brand',
      },
      size: {
        large:   'text-[clamp(2.5rem,5vw,3.75rem)]',
        compact: 'text-headline',
        // leading-[1.05] overrides the leading-headline base — at display scale
        // (up to 6rem) the 0.9 token would clip descenders against overflow-hidden.
        display: 'text-display leading-[1.15] tracking-display font-extrabold',
      },
    },
    defaultVariants: { color: 'canvas', size: 'large' },
  }
)

const bodyCva = cva(
  'font-sans font-light text-body leading-body text-pretty max-w-[55ch] [&_p]:mt-0',
  {
    variants: {
      color: {
        canvas:  'text-fg-muted',
        surface: 'text-fg-muted',
        brand:   'text-fg-on-brand/80',
      },
    },
    defaultVariants: { color: 'canvas' },
  }
)

const primaryCtaCva = cva(
  [
    'inline-block text-label font-semibold tracking-label uppercase',
    'px-12 py-4 transition duration-150 ease-quick',
    'hover:-translate-y-0.5 hover:shadow-hover-lift active:translate-y-0',
    'focus-visible:outline-2 focus-visible:outline-offset-[3px]',
  ],
  {
    variants: {
      color: {
        canvas:  'bg-accent text-fg-on-accent hover:bg-accent-hover focus-visible:outline-accent',
        surface: 'bg-accent text-fg-on-accent hover:bg-accent-hover focus-visible:outline-accent',
        brand:   'bg-fg-on-brand text-canvas hover:opacity-90 focus-visible:outline-fg-on-brand',
      },
    },
    defaultVariants: { color: 'canvas' },
  }
)

const secondaryCtaCva = cva(
  [
    'inline-block border text-label font-semibold tracking-label uppercase',
    'px-12 py-4 transition duration-150 ease-quick',
    'hover:-translate-y-0.5 active:translate-y-0',
    'focus-visible:outline-2 focus-visible:outline-offset-[3px]',
  ],
  {
    variants: {
      color: {
        canvas:  'border-fg/25 text-fg hover:border-fg/55 hover:bg-fg/5 focus-visible:outline-fg',
        surface: 'border-fg/25 text-fg hover:border-fg/55 hover:bg-fg/5 focus-visible:outline-fg',
        brand:   'border-fg-on-brand/35 text-fg-on-brand hover:border-fg-on-brand/65 hover:bg-fg-on-brand/5 focus-visible:outline-fg-on-brand',
      },
    },
    defaultVariants: { color: 'canvas' },
  }
)

// ─── Scrim class helper ───────────────────────────────────────────────────────
//
// Scrim mode:    one dark overlay directly on the image; opacity scales with
//               imageBlend (overlay = lighter, multiply = heavier press)
// Glass mode:   a lighter scrim + a separate base darkener (bg-canvas/35)
//               so the image still breathes while the glass panel handles
//               text legibility.

function getScrimClass(
  color:       string,
  imageBlend:  string,
  treatment:   string,
): string {
  if (treatment === 'glass') {
    const map: Record<string, string> = {
      canvas:  'bg-canvas/45',
      surface: 'bg-surface/45',
      brand:   'bg-brand/40',
    }
    return map[color] ?? 'bg-canvas/45'
  }
  const isMultiply = imageBlend === 'multiply'
  const map: Record<string, [string, string]> = {
    canvas:  ['bg-canvas/80',  'bg-canvas/90'],
    surface: ['bg-surface/80', 'bg-surface/88'],
    brand:   ['bg-brand/70',   'bg-brand/80'],
  }
  const [ov, mu] = map[color as keyof typeof map] ?? map.canvas
  return isMultiply ? mu : ov
}

// ─── Component ────────────────────────────────────────────────────────────────

export type BannerBlockProps = {
  heading:       string
  headingLevel?: 'h1' | 'h2'
  eyebrow?:      string
  body?:         Parameters<typeof RichText>[0]['content'] | null
  bgImageSrc?:   string
  primaryCta?:   { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  styleOptions?: BannerStyleOptions
  pa?:           (prop: string) => { 'data-epi-property-name'?: string }
}

export default function BannerBlock({
  heading,
  headingLevel = 'h2',
  eyebrow,
  body,
  bgImageSrc,
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

  const isGlass    = treatment === 'glass'
  const isBrand    = color === 'brand'
  const isCentered = alignment === 'center'
  const hasImage   = Boolean(bgImageSrc)
  const scrimClass = getScrimClass(color, imageBlend, treatment)
  const Heading    = headingLevel

  // ── Content elements (shared between scrim and glass layouts) ──────────────
  const eyebrowEl = eyebrow ? (
    <p className={cn('banner-eyebrow', eyebrowCva({ color }))} {...pa('eyebrow')}>
      {eyebrow}
    </p>
  ) : null

  const headingEl = (
    <Heading className={cn('banner-heading', headingCva({ color, size }))} {...pa('heading')}>
      {heading}
    </Heading>
  )

  const bodyEl = body ? (
    <div
      className={cn('banner-body', bodyCva({ color }))}
      {...pa('body')}
    >
      <RichText content={body} />
    </div>
  ) : null

  const ctasEl = (primaryCta || secondaryCta) ? (
    <div className={cn(
      'banner-ctas flex flex-wrap gap-sm',
      isCentered ? 'justify-center' : 'justify-start',
    )}>
      {primaryCta && (
        <Link href={primaryCta.href} className={primaryCtaCva({ color })} {...pa('primaryCtaLabel')}>
          {primaryCta.label}
        </Link>
      )}
      {secondaryCta && (
        <Link href={secondaryCta.href} className={secondaryCtaCva({ color })} {...pa('secondaryCtaLabel')}>
          {secondaryCta.label}
        </Link>
      )}
    </div>
  ) : null

  const gapClass = size === 'large' || size === 'display' ? 'gap-lg' : 'gap-md'
  const isDisplay = size === 'display'

  return (
    <section
      className={sectionCva({ size })}
      data-theme={isBrand || hasImage ? 'dark' : undefined}
    >

      {/* ── Background layer (z-0, absolute inset) ─────────────────────── */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {/* Background image */}
        {hasImage && (
          <Image
            src={bgImageSrc!}
            alt=""
            fill
            sizes="100vw"
            priority
            quality={85}
            className="object-cover object-center"
          />
        )}

        {/* Glass mode: extra base darkener so the panel has something to
            contrast against even when the image is light */}
        {isGlass && hasImage && (
          <div className="absolute inset-0 bg-canvas/35" />
        )}

        {/* Scrim: color identity layer (controls how brand/canvas/surface reads) */}
        <div className={cn('absolute inset-0', scrimClass)} />

        {/* Vignette: subtle radial corner darkening; only with an image */}
        {hasImage && <div className="banner-vignette absolute inset-0" />}

        {/* Brand bloom: radial warm halo centered behind content */}
        {isBrand && <div className="banner-brand-bloom absolute inset-0" />}
      </div>

      {/* ── Content layer (z-10) ────────────────────────────────────────── */}
      <BannerEntrance className={cn(
        'relative z-10 w-full px-md lg:px-lg',
        isCentered ? 'flex justify-center' : 'flex justify-start',
      )}>

        {isGlass ? (
          /* Glass treatment: content inside a frosted glass panel */
          <div className={cn(
            'flex flex-col',
            gapClass,
            size === 'large' ? 'px-xl py-xl' : isDisplay ? 'px-xl py-2xl' : 'px-lg py-lg',
            isCentered
              ? `items-center text-center ${isDisplay ? 'max-w-250' : 'max-w-160'} w-full`
              : `items-start text-left  ${isDisplay ? 'max-w-225' : 'max-w-140'} w-full`,
            isBrand ? 'banner-glass-brand' : 'banner-glass',
          )}>
            {eyebrowEl}
            {headingEl}
            {bodyEl}
            {ctasEl}
          </div>
        ) : (
          /* Scrim treatment: content sits directly on the scrimmed image */
          <div className={cn(
            'flex flex-col',
            gapClass,
            isCentered
              ? `items-center text-center ${isDisplay ? 'max-w-250' : 'max-w-190'} w-full mx-auto`
              : `items-start text-left  ${isDisplay ? 'max-w-225' : 'max-w-160'} w-full`,
          )}>
            {eyebrowEl}
            {headingEl}
            {bodyEl}
            {ctasEl}
          </div>
        )}

      </BannerEntrance>

    </section>
  )
}
