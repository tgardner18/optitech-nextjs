'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { RichText } from '@optimizely/cms-sdk/react/richText'
import BannerBackgroundVideo from '@/components/blocks/BannerBackgroundVideo'
import { useSliderEngine, type SliderEngine } from './slider-styles/useSliderEngine'
import type { SlideData, SliderBlockProps } from './SliderBlock'

// Markup only: presentation lives in slider.css, keyed on data-block and data-part. Heights are minimums
// (--sl-h per data-height), so a slide grows to fit its text; the Embla surface in the engine is an invisible
// drag/swipe layer, and the visible slide is a plain element swapped on index change.

const hasMedia = (s: SlideData) => Boolean(s.backgroundImageSrc || s.backgroundVideoSrc)

function Media({ slide, active, priority }: { slide: SlideData; active: boolean; priority: boolean }) {
  if (!hasMedia(slide)) return <div data-part="media" data-empty aria-hidden="true" />
  return (
    <div data-part="media" aria-hidden="true">
      {active && slide.backgroundVideoSrc ? (
        <BannerBackgroundVideo src={slide.backgroundVideoSrc} poster={slide.backgroundImageSrc} className="absolute inset-0 h-full w-full object-cover object-center" />
      ) : slide.backgroundImageSrc ? (
        <Image src={slide.backgroundImageSrc} alt="" fill sizes="100vw" priority={priority} quality={85} className="object-cover object-center" />
      ) : null}
    </div>
  )
}

function Content({ slide, index, count, level, split }: { slide: SlideData; index: number; count: number; level: 'h1' | 'h2'; split?: boolean }) {
  const Heading = level
  const placement = split ? 'left' : (slide.contentPlacement ?? 'left')
  return (
    <div data-part="content" data-place={placement} data-on-media={!split && hasMedia(slide) ? '' : undefined} role="group" aria-roledescription="slide" aria-label={`Slide ${index + 1} of ${count}`}>
      {slide.eyebrow && <p data-part="eyebrow">{slide.eyebrow}</p>}
      {slide.headline && <Heading data-part="headline">{slide.headline}</Heading>}
      {slide.body && (
        <div data-part="body">
          {typeof slide.body === 'string' ? <p>{slide.body}</p> : <RichText content={slide.body} />}
        </div>
      )}
      {((slide.buttonLabel && slide.buttonUrl) || (slide.secondaryLabel && slide.secondaryUrl)) && (
        <div data-part="ctas">
          {slide.buttonLabel && slide.buttonUrl && (
            <Link href={slide.buttonUrl} data-part="primary">{slide.buttonLabel}<ArrowRight aria-hidden strokeWidth={2} /></Link>
          )}
          {slide.secondaryLabel && slide.secondaryUrl && <Link href={slide.secondaryUrl} data-part="secondary">{slide.secondaryLabel}</Link>}
        </div>
      )}
    </div>
  )
}

function Controls({ engine, slides, navigation, autoDots, ms, inline, forceArrows }: {
  engine: Omit<SliderEngine, 'viewportRef'>; slides: SlideData[]; navigation: SliderBlockProps['styleOptions']['navigation']
  autoDots: boolean; ms: number | null; inline?: boolean; forceArrows?: boolean
}) {
  const { activeIndex, slideCount, progressKey, canPrev, canNext, prev, next, goTo, showPlayToggle, isPlaying, togglePlay } = engine
  const arrows = navigation === 'both' || navigation === 'arrows' || (forceArrows === true && navigation !== 'none')
  const dots = navigation === 'both' || navigation === 'dots'
  if (slideCount < 2 || (navigation === 'none' && !showPlayToggle)) return null
  return (
    <div data-part="controls" data-inline={inline ? '' : undefined}>
      {showPlayToggle && (
        <button type="button" data-part="ctl" data-play="" onClick={togglePlay} aria-pressed={!isPlaying}>
          <span className="sr-only">{isPlaying ? 'Pause slideshow' : 'Play slideshow'}</span>
          {isPlaying ? <Pause aria-hidden fill="currentColor" strokeWidth={0} /> : <Play aria-hidden fill="currentColor" strokeWidth={0} />}
        </button>
      )}
      {arrows && <button type="button" data-part="ctl" onClick={prev} disabled={!canPrev} aria-label="Previous slide"><ChevronLeft aria-hidden strokeWidth={2} /></button>}
      {dots ? (
        <div data-part="dots" role="group" aria-label="Choose a slide">
          {slides.map((s, k) => (
            <button key={k} type="button" data-part="dot" aria-current={k === activeIndex ? 'true' : undefined} onClick={() => goTo(k)} aria-label={`Slide ${k + 1} of ${slideCount}${s.headline ? `: ${s.headline}` : ''}`}>
              {k === activeIndex && autoDots && ms !== null && <span key={progressKey} data-part="progress" style={{ '--dur': `${ms}ms` } as React.CSSProperties} />}
            </button>
          ))}
        </div>
      ) : (
        <span data-part="count" aria-hidden="true">{activeIndex + 1} / {slideCount}</span>
      )}
      {arrows && <button type="button" data-part="ctl" onClick={next} disabled={!canNext} aria-label="Next slide"><ChevronRight aria-hidden strokeWidth={2} /></button>}
    </div>
  )
}

export default function SliderBlockClient({ presentationStyle, slides, styleOptions }: SliderBlockProps) {
  const headlines = useMemo(() => slides.map(s => s.headline), [slides])
  // viewportRef (Embla's drag surface) is split off so the rest of the engine reads as plain state.
  const { viewportRef, ...engine } = useSliderEngine({
    slideCount: slides.length,
    loop: styleOptions.loop,
    autoPlayMs: styleOptions.autoPlayMs,
    ariaLabel: slides[0]?.headline ? `Slideshow: ${slides[0].headline}` : undefined,
    headlines,
    scrollDuration: presentationStyle === 'storyRail' ? 16 : undefined,
  })
  if (slides.length < 2) return null

  const { activeIndex, slideCount } = engine
  const s = slides[activeIndex] ?? slides[0]
  const level = styleOptions.headingLevel
  const auto = styleOptions.autoPlayMs !== null && engine.showPlayToggle
  const ctl = (inline?: boolean, forceArrows?: boolean) => (
    <Controls engine={engine} slides={slides} navigation={styleOptions.navigation} autoDots={auto} ms={styleOptions.autoPlayMs} inline={inline} forceArrows={forceArrows} />
  )
  const slideProps = (c: SlideData) => ({
    'data-part': 'slide', 'data-color': c.backgroundColor, 'data-overlay': c.overlay, 'data-media': hasMedia(c) ? '' : undefined,
  })

  let stage: React.ReactNode
  if (presentationStyle === 'editorialSplit') {
    stage = (
      <div key={activeIndex} data-part="split" data-color={s.backgroundColor} data-flip={s.contentPlacement === 'right'}>
        <div data-part="panel">
          <Content slide={s} index={activeIndex} count={slideCount} level={level} split />
          {ctl(true)}
        </div>
        <div data-part="figure">
          {s.backgroundImageSrc ? <Image src={s.backgroundImageSrc} alt="" fill sizes="(min-width: 768px) 55vw, 100vw" priority={level === 'h1'} quality={85} className="object-cover object-center" /> : <div data-part="fallback" aria-hidden="true" />}
        </div>
      </div>
    )
  } else if (presentationStyle === 'storyRail') {
    stage = (
      <>
        <div data-part="rail-view">
          <div data-part="track" style={{ '--i': activeIndex } as React.CSSProperties}>
            {slides.map((c, k) => {
              const on = k === activeIndex, H = on ? level : 'h3'
              return (
                <div key={c.key || k} data-part="card" data-color={c.backgroundColor} data-media={hasMedia(c) ? '' : undefined} data-active={on ? '' : undefined}
                  {...(on ? {} : { 'aria-hidden': true, inert: true })} role="group" aria-roledescription="slide" aria-label={`Slide ${k + 1} of ${slideCount}`}>
                  <Media slide={c} active={on} priority={on && level === 'h1'} />
                  <div data-part="tint" aria-hidden="true" />
                  <div data-part="card-body">
                    {c.eyebrow && <p data-part="chip">{c.eyebrow}</p>}
                    {c.headline && <H data-part="headline">{c.headline}</H>}
                    {c.body && <div data-part="body">{typeof c.body === 'string' ? <p>{c.body}</p> : <RichText content={c.body} />}</div>}
                    {c.buttonLabel && c.buttonUrl && <Link href={c.buttonUrl} data-part="link">{c.buttonLabel}<ArrowRight aria-hidden strokeWidth={2} /></Link>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {ctl(true, true)}
      </>
    )
  } else {
    const slide = (
      <div key={activeIndex} {...slideProps(s)}>
        <Media slide={s} active priority={level === 'h1' && activeIndex === 0} />
        <div data-part="tint" aria-hidden="true" />
        <Content slide={s} index={activeIndex} count={slideCount} level={level} />
      </div>
    )
    stage = presentationStyle === 'emerge' ? (
      <>
        {slide}
        <div data-part="rail">
          {ctl(true, true)}
          <ol data-part="thumbs" role="list">
            {slides.map((c, k) => (
              <li key={c.key || k}>
                <button type="button" data-part="thumb" aria-current={k === activeIndex ? 'true' : undefined} disabled={styleOptions.navigation === 'none'} onClick={() => engine.goTo(k)}>
                  <span data-part="thumb-num" aria-hidden="true">{String(k + 1).padStart(2, '0')}</span>
                  <span data-part="thumb-title">{c.headline}</span>
                  {c.eyebrow && <span data-part="thumb-eyebrow">{c.eyebrow}</span>}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </>
    ) : (
      <>{slide}{ctl()}</>
    )
  }

  return (
    <section
      data-block="slider"
      data-style={presentationStyle}
      data-height={styleOptions.height}
      data-width={styleOptions.width}
      data-paused={engine.paused ? '' : undefined}
    >
      <div data-part="region" {...engine.regionProps}>
        {/* Manual-navigation-only announcement (WCAG carousel guidance: never announce autoplay ticks). */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">{engine.announcement}</div>
        <div ref={viewportRef} data-part="drag" aria-hidden="true">
          <div>{slides.map((c, i) => <div key={c.key || i} />)}</div>
        </div>
        {stage}
      </div>
    </section>
  )
}
