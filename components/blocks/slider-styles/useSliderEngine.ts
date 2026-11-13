'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import type { SliderStyleOptions } from '@/cms/styling/OT_SliderBlock.styling'

export type SliderRegionProps = {
  role: 'region'
  'aria-roledescription': string
  'aria-label': string
  tabIndex: number
  onKeyDown: (e: KeyboardEvent) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  onFocus: () => void
  onBlur: () => void
}

export type SliderEngine = {
  /** Attach to the Embla viewport element (the `overflow-hidden` wrapper). */
  viewportRef: (node: HTMLElement | null) => void
  activeIndex: number
  slideCount:  number
  /** Bumped on every index change (manual or autoplay) — key a CSS animation off it to restart a per-slide progress fill. */
  progressKey: number
  /** Only false when Loop Mode is "Stop at ends" and the active slide is first/last. */
  canPrev: boolean
  canNext: boolean
  goTo: (index: number) => void
  next: () => void
  prev: () => void
  /** Whether the persistent pause/play control should render at all (Auto-Play ≠ Off and motion isn't reduced). */
  showPlayToggle: boolean
  isPlaying: boolean
  /** True while auto-play is held (visitor paused, hovering, focus inside, or tab hidden) — pause any progress animation off it. */
  paused: boolean
  togglePlay: () => void
  reducedMotion: boolean
  /** Headline of the slide just navigated to — set on manual nav only, per WCAG carousel guidance (never on autoplay ticks). Consumed by a visually-hidden aria-live region. */
  announcement: string | null
  regionProps: SliderRegionProps
}

type Options = {
  slideCount: number
  loop:       SliderStyleOptions['loop']
  autoPlayMs: number | null
  ariaLabel?: string
  /** Slide headlines, indexed the same as the slides array — used for the manual-nav live-region announcement. */
  headlines: (string | undefined)[]
  /** Embla's scroll-transition speed (see embla-carousel `Options.duration`).
   *  Defaults to the ~700ms kinetic ease-out most styles want; a style with
   *  its own tighter transition budget (e.g. Story Rail's ~450ms rail shift)
   *  can tune it without affecting every other style sharing this hook. */
  scrollDuration?: number
  /** Embla's snap alignment. Every SliderBlock style peeks from one side only
   *  (align: 'start' — the default). The Row/Column carousel's symmetric
   *  "peek both sides" look needs the active slide centered in its (inset)
   *  viewport instead. */
  align?: 'start' | 'center'
}

export function useSliderEngine({ slideCount, loop, autoPlayMs, ariaLabel, headlines, scrollDuration, align }: Options): SliderEngine {
  const reducedMotion = usePrefersReducedMotion()

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop:      loop === 'loop',
    align:     align ?? 'start',
    watchDrag: slideCount > 1,
    // Embla's animation is physics-based, not a literal CSS cubic-bezier — this
    // is a tuned approximation of the ~700ms kinetic ease-out the design spec
    // calls for, snappier under reduced motion.
    duration: reducedMotion ? 4 : (scrollDuration ?? 25),
  })

  const [activeIndex, setActiveIndex] = useState(0)
  const [progressKey, setProgressKey] = useState(0)
  const [announcement, setAnnouncement] = useState<string | null>(null)
  const [userPaused, setUserPaused]   = useState(false)
  const [isHover, setIsHover]         = useState(false)
  const [isFocusWithin, setIsFocusWithin] = useState(false)
  const [isTabHidden, setIsTabHidden] = useState(false)
  // Pressing Play is explicit: it wins over the hover and focus the press itself caused, until the pointer and focus leave.
  const [forcePlay, setForcePlay] = useState(false)
  const bounceDir = useRef<1 | -1>(1)

  const clamp = useCallback((n: number) => Math.max(0, Math.min(n, slideCount - 1)), [slideCount])
  const wrap  = useCallback((n: number) => ((n % slideCount) + slideCount) % slideCount, [slideCount])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => {
      setActiveIndex(emblaApi.selectedScrollSnap())
      setProgressKey(k => k + 1)
    }
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => { emblaApi.off('select', onSelect); emblaApi.off('reInit', onSelect) }
  }, [emblaApi])

  const scrollToIndex = useCallback((index: number, manual: boolean) => {
    if (!emblaApi) return
    emblaApi.scrollTo(index)
    // Falls back to a generic "Slide X of Y" when there's no per-slide title
    // to announce (e.g. Row/Column carousels, whose slides are arbitrary
    // composed content with no headline field).
    setAnnouncement(manual ? (headlines[index] ?? `Slide ${index + 1} of ${slideCount}`) : null)
  }, [emblaApi, headlines, slideCount])

  const goTo = useCallback((index: number) => {
    scrollToIndex(loop === 'loop' ? wrap(index) : clamp(index), true)
  }, [loop, wrap, clamp, scrollToIndex])

  const next = useCallback(() => goTo(activeIndex + 1), [goTo, activeIndex])
  const prev = useCallback(() => goTo(activeIndex - 1), [goTo, activeIndex])

  // Autoplay-only advance. Manual nav (goTo/next/prev above) always wraps or
  // clamps and never touches bounceDir — only the autoplay tick ping-pongs
  // direction in Bounce mode (mirrors cms/compositions/SliderRow.tsx's advance()).
  const advanceAutoplay = useCallback(() => {
    let nextIndex: number
    if (loop === 'bounce') {
      if (activeIndex >= slideCount - 1) bounceDir.current = -1
      if (activeIndex <= 0)              bounceDir.current = 1
      nextIndex = clamp(activeIndex + bounceDir.current)
    } else {
      nextIndex = loop === 'loop' ? wrap(activeIndex + 1) : clamp(activeIndex + 1)
    }
    scrollToIndex(nextIndex, false)
  }, [loop, activeIndex, slideCount, clamp, wrap, scrollToIndex])

  const effectivelyPaused = userPaused || (!forcePlay && (isHover || isFocusWithin)) || isTabHidden
  const autoplayActive    = autoPlayMs !== null && !reducedMotion && slideCount > 1

  useEffect(() => {
    if (!autoplayActive || effectivelyPaused) return
    const id = setInterval(advanceAutoplay, autoPlayMs!)
    return () => clearInterval(id)
  }, [autoplayActive, effectivelyPaused, autoPlayMs, advanceAutoplay])

  // Pause on tab-backgrounded (WCAG 2.2.2 + requirements §4).
  useEffect(() => {
    const onVisibility = () => setIsTabHidden(document.visibilityState === 'hidden')
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight')      { e.preventDefault(); next() }
    else if (e.key === 'ArrowLeft')  { e.preventDefault(); prev() }
  }, [next, prev])

  const canPrev = loop !== 'none' || activeIndex > 0
  const canNext = loop !== 'none' || activeIndex < slideCount - 1

  return {
    viewportRef: emblaRef,
    activeIndex,
    slideCount,
    progressKey,
    canPrev,
    canNext,
    goTo,
    next,
    prev,
    showPlayToggle: autoplayActive,
    isPlaying: autoplayActive && !userPaused,
    paused: effectivelyPaused,
    togglePlay: () => { if (userPaused) setForcePlay(true); else setForcePlay(false); setUserPaused(p => !p) },
    reducedMotion,
    announcement,
    regionProps: {
      role: 'region',
      'aria-roledescription': 'carousel',
      'aria-label': ariaLabel || 'Slideshow',
      tabIndex: 0,
      onKeyDown,
      onMouseEnter: () => setIsHover(true),
      onMouseLeave: () => { setIsHover(false); if (!isFocusWithin) setForcePlay(false) },
      onFocus: () => setIsFocusWithin(true),
      onBlur: () => { setIsFocusWithin(false); if (!isHover) setForcePlay(false) },
    },
  }
}
