'use client'

import { Children, useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const AUTOPLAY_MS: Record<string, number> = { slow: 8000, medium: 5000, fast: 3000 }

const PEEK_OUTER: Record<string, string> = {
  none: 'overflow-hidden',
  sm:   'overflow-hidden',
  md:   'overflow-hidden',
  lg:   'overflow-hidden',
}

const PEEK_INSET: Record<string, string> = {
  none: '',
  sm:   'px-[4%]',
  md:   'px-[8%]',
  lg:   'px-[14%]',
}

// Gap between slides, keyed to the row's Content Spacing dropdown. Applied as a
// per-slide gutter (half on each side) + a matching negative margin on the track
// so the outer slides still align flush with the container edge. Slides stay
// w-full, so the translateX(-active * 100%) step math is unaffected.
const GAP_VAR: Record<string, string> = {
  none:   '0px',
  small:  'var(--spacing-sm)',
  medium: 'var(--spacing-md)',
  large:  'var(--spacing-lg)',
  xl:     'var(--spacing-xl)',
}

type Props = {
  children:         ReactNode
  transition:       string
  controls:         string
  autoplay:         string
  loop:             string
  peek:             string
  gap:              string
  verticalPadding:  string
  bgColorClass:     string
  paProps?:         Record<string, unknown>
  staggerAttr?:     string | undefined
}

export default function SliderRow({
  children,
  transition      = 'slide',
  controls        = 'both',
  autoplay        = 'off',
  loop            = 'loop',
  peek            = 'none',
  gap             = 'none',
  verticalPadding = '',
  bgColorClass    = '',
  paProps         = {},
  staggerAttr,
}: Props) {
  const slides      = Children.toArray(children)
  const count       = slides.length
  const [active, setActive] = useState(0)
  const bounceDir   = useRef<1 | -1>(1)
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null)

  const clamp = (n: number) => Math.max(0, Math.min(n, count - 1))
  const wrap  = (n: number) => ((n % count) + count) % count

  const goTo = useCallback((next: number) => {
    setActive(loop === 'loop' ? wrap(next) : clamp(next))
  }, [count, loop]) // eslint-disable-line react-hooks/exhaustive-deps

  const advance = useCallback(() => {
    setActive(prev => {
      if (loop === 'bounce') {
        if (prev >= count - 1) bounceDir.current = -1
        if (prev <= 0)         bounceDir.current = 1
        return clamp(prev + bounceDir.current)
      }
      return loop === 'loop' ? wrap(prev + 1) : clamp(prev + 1)
    })
  }, [count, loop]) // eslint-disable-line react-hooks/exhaustive-deps

  const stopTimer  = () => { if (timerRef.current) clearInterval(timerRef.current) }
  const startTimer = useCallback(() => {
    stopTimer()
    if (autoplay === 'off') return
    timerRef.current = setInterval(advance, AUTOPLAY_MS[autoplay] ?? 5000)
  }, [autoplay, advance])

  useEffect(() => { startTimer(); return stopTimer }, [startTimer])

  const handleNav = (next: number) => { goTo(next); startTimer() }

  const showArrows  = controls === 'both' || controls === 'arrows'
  const showDots    = controls === 'both' || controls === 'dots'
  const isFadeBased = transition === 'fade' || transition === 'morph'
  const hasPeek     = peek !== 'none'
  const gapValue    = GAP_VAR[gap] ?? GAP_VAR.none
  const hasGap      = gapValue !== GAP_VAR.none
  const canPrev     = loop !== 'none' || active > 0
  const canNext     = loop !== 'none' || active < count - 1

  return (
    <div
      className={cn('vb:row w-full', bgColorClass, verticalPadding)}
      data-stagger={staggerAttr}
      {...paProps}
    >

      {/* Track */}
      <div className={cn('relative w-full', PEEK_OUTER[peek])}>
        <div className={cn(hasPeek && PEEK_INSET[peek])}>
          {isFadeBased ? (
            // Fade / Morph: slides stack; only active is visible
            <div className="relative">
              {slides.map((slide, i) => (
                <div
                  key={i}
                  aria-hidden={i !== active}
                  className={cn(
                    'w-full',
                    'transition-[opacity,filter,transform]',
                    'ease-[var(--ease-kinetic)]',
                    transition === 'morph' ? 'duration-700' : 'duration-500',
                    i === active
                      ? 'relative opacity-100'
                      : [
                          'absolute inset-0 pointer-events-none opacity-0',
                          transition === 'morph' && 'scale-[0.97] blur-[4px]',
                        ],
                  )}
                >
                  {slide}
                </div>
              ))}
            </div>
          ) : (
            // Slide / Cover: translate-based track
            <div
              className="flex transition-transform ease-[var(--ease-kinetic)] duration-500"
              style={{
                transform: `translateX(-${active * 100}%)`,
                // Negative track margin cancels the outer slides' gutter so the
                // first/last slides stay flush with the container edge.
                ...(hasGap ? { marginInline: `calc(${gapValue} / -2)` } : {}),
              }}
            >
              {slides.map((slide, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-full shrink-0',
                    transition === 'cover' && cn(
                      'transition-[transform,opacity] ease-[var(--ease-kinetic)] duration-500',
                      i !== active && 'scale-[0.88] opacity-40',
                    ),
                  )}
                  style={hasGap ? { paddingInline: `calc(${gapValue} / 2)` } : undefined}
                >
                  {slide}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation bar */}
      {(showArrows || showDots) && (
        <div
          className={cn(
            'flex items-center mt-lg',
            showArrows && showDots ? 'justify-between px-1' : 'justify-center',
          )}
        >
          {showArrows && (
            <button
              onClick={() => handleNav(active - 1)}
              disabled={!canPrev}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-fg/10 text-fg-muted hover:text-fg hover:border-fg/30 disabled:opacity-25 transition-colors"
              aria-label="Previous slide"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {showDots && (
            <div className="flex items-center gap-2" role="tablist" aria-label="Slides">
              {slides.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === active}
                  onClick={() => handleNav(i)}
                  className={cn(
                    'rounded-full transition-all ease-[var(--ease-kinetic)] duration-300',
                    i === active
                      ? 'w-5 h-[6px] bg-brand'
                      : 'w-[6px] h-[6px] bg-fg/20 hover:bg-fg/40',
                  )}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}

          {showArrows && (
            <button
              onClick={() => handleNav(active + 1)}
              disabled={!canNext}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-fg/10 text-fg-muted hover:text-fg hover:border-fg/30 disabled:opacity-25 transition-colors"
              aria-label="Next slide"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
