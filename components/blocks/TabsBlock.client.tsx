'use client'

import Image        from 'next/image'
import { cn }       from '@/lib/utils'
import Button       from '@/components/ui/Button'
import { ICON_REGISTRY } from '@/components/icons/iconRegistry'
import { ArrowRight } from 'lucide-react'
import { RichText } from '@optimizely/cms-sdk/react/richText'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useId,
} from 'react'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import type { TabsStyleOptions } from '@/cms/styling/OT_TabsBlock.styling'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TabItemData = {
  tabLabel:  string
  tabIcon?:  string
  heading?:  string
  /** Rich-text JSON from the CMS, or a plain string (showcase / fallback). */
  body?:     Parameters<typeof RichText>[0]['content'] | string | null
  imageSrc?: string
  imageAlt?: string
  ctaLabel?: string
  ctaUrl?:   string
}

export type TabsBlockClientProps = {
  eyebrow?:     string
  heading?:     string
  tabs:         TabItemData[]
  styleOptions: TabsStyleOptions
}

// ─── Color helpers ────────────────────────────────────────────────────────────

type ColorCtx = 'canvas' | 'surface' | 'brand' | 'glass'
type TriggerState = 'inactive' | 'active'

// Inactive triggers are interactive controls — they hold the AA floor (no
// sub-70% opacity stacking); the hover step moves toward full strength.
function triggerTextClass(color: ColorCtx, state: TriggerState): string {
  if (state === 'inactive') {
    return color === 'brand'  ? 'text-fg-on-brand/75 hover:text-fg-on-brand'
         : color === 'glass'  ? 'text-white/70 hover:text-white/95'
         : 'text-fg-muted hover:text-fg'
  }
  return color === 'brand'  ? 'text-fg-on-brand'
       : color === 'glass'  ? 'text-white'
       : 'text-fg'
}

/** Active trigger text when the sliding indicator carries the background. */
function activeTextClass(tabStyle: TabsStyleOptions['tabStyle'], color: ColorCtx): string {
  if (tabStyle === 'pill') {
    return color === 'glass' ? 'text-white' : 'text-fg-on-brand'
  }
  if (tabStyle === 'buttonGroup') {
    return color === 'canvas' || color === 'surface' ? 'text-fg-on-brand' : 'text-brand'
  }
  return triggerTextClass(color, 'active')
}

/** Fill of the sliding indicator per trigger style. */
function indicatorBgClass(tabStyle: TabsStyleOptions['tabStyle'], color: ColorCtx): string {
  if (tabStyle === 'underline') return staticActiveLine(color)
  if (tabStyle === 'pill') {
    return color === 'canvas' || color === 'surface'
      ? 'bg-brand'
      : 'bg-white/15 [backdrop-filter:blur(16px)] [-webkit-backdrop-filter:blur(16px)]'
  }
  // buttonGroup
  return color === 'canvas' || color === 'surface' ? 'bg-brand' : 'bg-white/95'
}

function progressBarBg(color: ColorCtx): string {
  return color === 'canvas' || color === 'surface' ? 'bg-brand'
       : color === 'brand'  ? 'bg-white/60'
       : 'bg-white/50'
}

function staticActiveLine(color: ColorCtx): string {
  return color === 'canvas' || color === 'surface' ? 'bg-brand'
       : color === 'brand'  ? 'bg-white/80'
       : 'bg-white/70'
}

function ctaVariant(color: ColorCtx): 'brand' | 'ghost' {
  return color === 'canvas' || color === 'surface' ? 'brand' : 'ghost'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TabsBlockClient({
  eyebrow,
  heading,
  tabs,
  styleOptions,
}: TabsBlockClientProps) {
  const {
    tabStyle,
    tabPosition,
    color,
    contentLayout,
    triggerAlign,
    autoPlay,
    autoPlayDuration,
  } = styleOptions

  const instanceId    = useId()
  const tabCount      = Math.min(tabs.length, 6)
  const visibleTabs   = tabs.slice(0, tabCount)
  const isEmpty       = visibleTabs.length < 2

  const [activeTab,    setActiveTab]    = useState(0)
  const [progressKey,  setProgressKey]  = useState(0)
  const [isPaused,     setIsPaused]     = useState(false)
  // Direction of the last tab change — drives the panel's directional entrance.
  const [dir,          setDir]          = useState<'left' | 'right' | null>(null)
  const reducedMotion = usePrefersReducedMotion()

  // Panel height lock — prevents layout shift on tab change
  const panelContentRef              = useRef<HTMLDivElement>(null)
  const [panelMinHeight, setPanelMinHeight] = useState(0)

  // Track max observed panel height to prevent layout shift
  useLayoutEffect(() => {
    if (panelContentRef.current) {
      const h = panelContentRef.current.offsetHeight
      if (h > panelMinHeight) setPanelMinHeight(h)
    }
  })

  const goToTab = useCallback((idx: number) => {
    if (idx !== activeTab) setDir(idx > activeTab ? 'right' : 'left')
    setActiveTab(idx)
    setProgressKey(k => k + 1)
  }, [activeTab])

  // Auto-play interval
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!autoPlay || reducedMotion || isPaused || isEmpty) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setDir('right') // autoplay always advances forward
      setActiveTab(prev => {
        const next = (prev + 1) % tabCount
        setProgressKey(k => k + 1)
        return next
      })
    }, autoPlayDuration * 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [autoPlay, autoPlayDuration, reducedMotion, isPaused, isEmpty, tabCount])

  if (isEmpty) return null

  const showAutoPlay = autoPlay && !reducedMotion

  // ── Root ──────────────────────────────────────────────────────────────────

  const rootClass = cn(
    'w-full',
    color === 'canvas'  && 'bg-canvas  py-xl px-md lg:px-lg',
    color === 'surface' && 'bg-surface py-xl px-md lg:px-lg',
    color === 'brand'   && 'bg-brand   py-xl px-md lg:px-lg',
    color === 'glass'   && 'py-xl px-md lg:px-lg',
  )

  return (
    <section
      className={rootClass}
      data-theme={color === 'brand' ? 'dark' : undefined}
      data-surface={color === 'glass' ? 'dark' : undefined}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >

      {/* Section color bleeds full width; content is capped so whitespace at
          the margins reads as composed rather than stretched on wide screens. */}
      <div className="max-w-[80rem] mx-auto">

      {/* ── Block header ─────────────────────────────────────────────────── */}
      {(eyebrow || heading) && (
        <header className="mb-xl max-w-screen-md">
          {eyebrow && (
            <p className={cn(
              'text-label tracking-label uppercase font-semibold mb-xs',
              color === 'brand'  ? 'text-fg-on-brand/85'
              : color === 'glass' ? 'text-white/75'
              : 'text-brand',
            )}>
              {eyebrow}
            </p>
          )}
          {heading && (
            <h2 className={cn(
              'text-headline font-bold tracking-headline leading-headline text-balance',
              color === 'brand'  ? 'text-fg-on-brand'
              : color === 'glass' ? 'text-white'
              : 'text-fg',
            )}>
              {heading}
            </h2>
          )}
        </header>
      )}

      {/* ── Tab layout ───────────────────────────────────────────────────── */}
      <div className={cn(
        'flex',
        tabPosition === 'side' ? 'flex-col md:flex-row' : 'flex-col',
        // Detached trigger styles breathe away from the panel; underline stays
        // flush so its trigger row and the panel share a single hairline.
        tabStyle !== 'underline' && 'gap-sm md:gap-md',
      )}>

        {/* ── Trigger area ───────────────────────────────────────────────── */}
        <TriggerBar
          tabs={visibleTabs}
          activeTab={activeTab}
          tabStyle={tabStyle}
          tabPosition={tabPosition}
          color={color}
          triggerAlign={triggerAlign}
          showAutoPlay={showAutoPlay}
          progressKey={progressKey}
          isPaused={isPaused}
          autoPlayDuration={autoPlayDuration}
          instanceId={instanceId}
          reducedMotion={reducedMotion}
          onSelect={goToTab}
        />

        {/* ── Panel area ─────────────────────────────────────────────────── */}
        <div
          className={cn(
            'flex-1 min-w-0 tab-panel-surface',
            color === 'canvas'  && 'bg-surface border border-fg/10 p-lg',
            color === 'surface' && 'bg-canvas  border border-fg/10 p-lg',
            color === 'brand'   && 'bg-white/10 border border-white/15 p-lg',
            color === 'glass'   && [
              'bg-white/10 border border-white/12 p-lg',
              '[backdrop-filter:blur(12px)] [-webkit-backdrop-filter:blur(12px)]',
              '[isolation:isolate] [will-change:transform]',
            ].join(' '),
            // Underline style: the trigger row's border and the panel edge merge
            // into one hairline (with the active indicator riding on top of it)
            // instead of stacking two parallel lines.
            tabStyle === 'underline' && (
              tabPosition === 'side'
                ? 'border-t-0 md:border-t md:border-l-0'
                : 'border-t-0'
            ),
          )}
          style={panelMinHeight > 0 ? { minHeight: `${panelMinHeight}px` } : undefined}
          role="tabpanel"
          id={`panel-${instanceId}-${activeTab}`}
          aria-labelledby={`tab-${instanceId}-${activeTab}`}
        >
          <div
            key={activeTab}
            ref={panelContentRef}
            className={reducedMotion ? undefined : 'tab-panel-enter'}
            data-dir={dir ?? undefined}
          >
            <PanelContent
              tab={visibleTabs[activeTab]}
              color={color}
              contentLayout={contentLayout}
            />
          </div>
        </div>

      </div>

      </div>
    </section>
  )
}

// ─── TriggerBar ───────────────────────────────────────────────────────────────

type TriggerBarProps = {
  tabs:             TabItemData[]
  activeTab:        number
  tabStyle:         TabsStyleOptions['tabStyle']
  tabPosition:      TabsStyleOptions['tabPosition']
  color:            ColorCtx
  triggerAlign:     TabsStyleOptions['triggerAlign']
  showAutoPlay:     boolean
  progressKey:      number
  isPaused:         boolean
  autoPlayDuration: number
  instanceId:       string
  reducedMotion:    boolean
  onSelect:         (idx: number) => void
}

function TriggerBar({
  tabs, activeTab, tabStyle, tabPosition, color, triggerAlign,
  showAutoPlay, progressKey, isPaused, autoPlayDuration, instanceId,
  reducedMotion, onSelect,
}: TriggerBarProps) {

  const isSide = tabPosition === 'side'
  const isGlass = color === 'glass'
  const isBrand = color === 'brand'

  // ── Scroll affordance ───────────────────────────────────────────────────
  // The mobile trigger row scrolls horizontally with a hidden scrollbar; on its
  // own there is no cue that tabs continue off-canvas. We track which edges have
  // hidden content and feather them via a mask-image (see .tab-scroller), and we
  // keep the active tab scrolled into view so autoplay / selection never lands
  // on an invisible trigger.
  const scrollerRef = useRef<HTMLDivElement>(null)
  const buttonsRef  = useRef<(HTMLButtonElement | null)[]>([])
  const [fade, setFade] = useState({ left: false, right: false })

  // ── Sliding active indicator ────────────────────────────────────────────
  // One element per tablist, sized to the strip's scroll content and revealed
  // through an animated clip-path matching the active trigger (see
  // .tab-indicator in globals.css). Measured in the strip's content
  // coordinates, so it scrolls with the triggers. null until first measure —
  // the per-button static indicators cover SSR and reduced-motion.
  const [rect, setRect] = useState<
    { x: number; y: number; w: number; h: number; sw: number; sh: number } | null
  >(null)

  // The side layout switches the underline indicator's axis at md.
  const [mdUp, setMdUp] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const sync = () => setMdUp(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const measure = useCallback(() => {
    const el  = scrollerRef.current
    const btn = buttonsRef.current[activeTab]
    if (!el || !btn) return
    setRect({
      x:  btn.offsetLeft - el.clientLeft,
      y:  btn.offsetTop  - el.clientTop,
      w:  btn.offsetWidth,
      h:  btn.offsetHeight,
      sw: el.scrollWidth,
      sh: el.scrollHeight,
    })
  }, [activeTab])

  useLayoutEffect(() => { measure() }, [measure, tabs.length, mdUp])

  // Re-measure when the strip or any trigger resizes (viewport, font load).
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    buttonsRef.current.slice(0, tabs.length).forEach(b => b && ro.observe(b))
    return () => ro.disconnect()
  }, [measure, tabs.length])

  // Underline + autoplay: the progress bar itself is the active line (it fills
  // 0→100% in the same color), so the sliding line would sit under it invisibly
  // — defer to the sweep there. Pill/buttonGroup progress overlays translucently
  // on top of the sliding chip, so those keep both.
  const slideIndicator =
    !reducedMotion && rect !== null && !(tabStyle === 'underline' && showAutoPlay)

  let indicatorClip: string | undefined
  if (rect) {
    const { x, y, w, h, sw, sh } = rect
    const bottom = sh - y - h
    let top = y, right = sw - x - w, left = x
    let radius = '0'
    if (tabStyle === 'underline') {
      if (isSide && mdUp) { left = 0; right = sw - 3 }  // vertical bar on the strip's left edge
      else                { top = y + h - 3 }           // 3px strip under the active trigger
    } else {
      radius = tabStyle === 'pill' ? '9999px' : 'var(--radius-ot-control)'
    }
    indicatorClip = `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius})`
  }

  const updateFade = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    // Side layout at md+ scrolls vertically (if at all) — no horizontal feather.
    const max = el.scrollWidth - el.clientWidth
    if (max <= 1) { setFade({ left: false, right: false }); return }
    setFade({ left: el.scrollLeft > 1, right: el.scrollLeft < max - 1 })
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    updateFade()
    el.addEventListener('scroll', updateFade, { passive: true })
    const ro = new ResizeObserver(updateFade)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', updateFade); ro.disconnect() }
  }, [updateFade, tabs.length])

  // Keep the active trigger centered WITHIN the strip. Scroll only the strip
  // element (never via element.scrollIntoView, which bubbles to the document):
  // otherwise loading a page with a below-the-fold Tabs block jumps the whole
  // viewport down to it. scrollBy on the strip moves only its own content; the
  // unused axis clamps to 0, so this works for both the top and side layouts.
  useEffect(() => {
    const strip = scrollerRef.current
    const btn   = buttonsRef.current[activeTab]
    if (!strip || !btn) return
    const stripRect = strip.getBoundingClientRect()
    const btnRect   = btn.getBoundingClientRect()
    const dx = (btnRect.left + btnRect.width  / 2) - (stripRect.left + stripRect.width  / 2)
    const dy = (btnRect.top  + btnRect.height / 2) - (stripRect.top  + stripRect.height / 2)
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return
    strip.scrollBy({ left: dx, top: dy, behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [activeTab, reducedMotion])

  // ── Keyboard navigation (WAI-ARIA tabs pattern) ─────────────────────────
  // Roving tabindex is wired on the triggers; this moves focus + selection
  // between them. Both axes are handled so it works in top and side layouts.
  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const count = tabs.length
    let next: number | null = null
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown': next = (activeTab + 1) % count; break
      case 'ArrowLeft':
      case 'ArrowUp':   next = (activeTab - 1 + count) % count; break
      case 'Home':      next = 0; break
      case 'End':       next = count - 1; break
      default: return
    }
    e.preventDefault()
    onSelect(next)
    buttonsRef.current[next]?.focus()
  }, [tabs.length, activeTab, onSelect])

  // ── Trigger row wrapper ─────────────────────────────────────────────────

  const rowClass = cn(
    // Mobile: always horizontal scroll strip, with snap + edge feather
    // (relative: positioning context for the sliding indicator)
    'relative flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    'tab-scroller snap-x snap-proximity',
    // Side position: stack vertically at md+, fixed width column
    isSide && 'md:flex-col md:overflow-x-visible md:w-[220px] md:shrink-0',
    // Alignment (top position only)
    !isSide && triggerAlign === 'center' && 'md:justify-center',
    // Style-specific wrapper treatment
    tabStyle === 'underline' && [
      !isGlass && 'border-b border-fg/10',
      isGlass  && [
        'border-b border-white/15',
        'bg-white/5 [backdrop-filter:blur(12px)] [-webkit-backdrop-filter:blur(12px)]',
        '[isolation:isolate]',
      ].join(' '),
      isSide   && 'md:border-b-0 md:border-r',
      isSide && isGlass ? 'md:border-white/15' : isSide ? 'md:border-fg/10' : '',
    ].join(' '),
    tabStyle === 'pill' && [
      'gap-xs p-xs',
      isGlass && 'bg-white/5 [backdrop-filter:blur(12px)] [-webkit-backdrop-filter:blur(12px)] [isolation:isolate]',
    ].join(' '),
    tabStyle === 'buttonGroup' && [
      // rounded-ot-surface ties border-radius to the site's Corner Style axis:
      // 0px on Sharp, 4px on Soft, 10px on Rounded.
      'p-1 gap-0.5 rounded-ot-surface',
      !isGlass && !isBrand && 'bg-fg/[0.07] border border-fg/[0.10]',
      isBrand  && 'bg-black/25 border border-white/15',
      isGlass  && [
        'bg-black/25 border border-white/15',
        '[backdrop-filter:blur(12px)] [-webkit-backdrop-filter:blur(12px)]',
        'isolate',
      ].join(' '),
      isSide && 'md:flex-col',
    ].join(' '),
  )

  return (
    <div
      ref={scrollerRef}
      className={rowClass}
      role="tablist"
      aria-orientation={isSide ? 'vertical' : 'horizontal'}
      onKeyDown={onKeyDown}
      style={{
        '--fade-l': fade.left  ? 'var(--tab-fade-size)' : '0px',
        '--fade-r': fade.right ? 'var(--tab-fade-size)' : '0px',
      } as React.CSSProperties}
    >
      {/* Sliding active indicator — first in DOM so triggers paint above it */}
      {slideIndicator && (
        <span
          aria-hidden="true"
          className={cn('tab-indicator', indicatorBgClass(tabStyle, color))}
          style={{ width: rect!.sw, height: rect!.sh, clipPath: indicatorClip }}
        />
      )}
      {tabs.map((tab, i) => (
        <TriggerButton
          key={i}
          tab={tab}
          index={i}
          isActive={activeTab === i}
          tabStyle={tabStyle}
          tabPosition={tabPosition}
          color={color}
          showAutoPlay={showAutoPlay}
          progressKey={progressKey}
          isPaused={isPaused}
          autoPlayDuration={autoPlayDuration}
          instanceId={instanceId}
          tabCount={tabs.length}
          slideIndicator={slideIndicator}
          buttonRef={(el) => { buttonsRef.current[i] = el }}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

// ─── TriggerButton ────────────────────────────────────────────────────────────

type TriggerButtonProps = {
  tab:              TabItemData
  index:            number
  isActive:         boolean
  tabStyle:         TabsStyleOptions['tabStyle']
  tabPosition:      TabsStyleOptions['tabPosition']
  color:            ColorCtx
  showAutoPlay:     boolean
  progressKey:      number
  isPaused:         boolean
  autoPlayDuration: number
  instanceId:       string
  tabCount:         number
  /** True when the tablist-level sliding indicator carries the active visuals. */
  slideIndicator:   boolean
  buttonRef:        (el: HTMLButtonElement | null) => void
  onSelect:         (idx: number) => void
}

function TriggerButton({
  tab, index, isActive, tabStyle, tabPosition, color,
  showAutoPlay, progressKey, isPaused, autoPlayDuration,
  instanceId, slideIndicator, buttonRef, onSelect,
}: TriggerButtonProps) {
  const isSide = tabPosition === 'side'

  const IconComp = tab.tabIcon && tab.tabIcon !== 'none'
    ? ICON_REGISTRY[tab.tabIcon]
    : null

  // ── Focus ring color adjusts for dark surfaces ──────────────────────────
  const focusRing = (color === 'brand' || color === 'glass')
    ? 'focus-visible:ring-white/80'
    : 'focus-visible:ring-brand'

  const baseClass = cn(
    'relative flex items-center gap-xs shrink-0 snap-start transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
    'focus-visible:ring-offset-transparent cursor-pointer group',
    focusRing,
  )

  // ── underline ─────────────────────────────────────────────────────────

  if (tabStyle === 'underline') {
    return (
      <button
        ref={buttonRef}
        role="tab"
        id={`tab-${instanceId}-${index}`}
        aria-selected={isActive}
        aria-controls={`panel-${instanceId}-${index}`}
        tabIndex={isActive ? 0 : -1}
        onClick={() => onSelect(index)}
        className={cn(
          baseClass,
          'px-lg py-md text-base font-semibold',
          triggerTextClass(color, isActive ? 'active' : 'inactive'),
          // Glass active: frosted bg (static fallback only — the sliding
          // indicator's line + text color carry the active state when live)
          isActive && !slideIndicator && color === 'glass' && [
            'bg-white/15',
            '[backdrop-filter:blur(16px)] [-webkit-backdrop-filter:blur(16px)]',
            'isolate',
          ].join(' '),
          // Side position: no bottom border indicator, uses left bar instead
          isSide && 'md:px-md md:py-sm md:w-full md:text-left',
        )}
      >
        {IconComp && <IconComp className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden />}
        <span>{tab.tabLabel}</span>

        {/* Hover ghost — a low-opacity underline grows from center on hover,
            so hover feels kinetic rather than a bare color nudge */}
        {!isActive && (
          <span
            aria-hidden="true"
            className={cn(
              'absolute bottom-0 h-0.5 bg-current pointer-events-none',
              isSide ? 'left-lg right-lg md:left-md md:right-md' : 'left-lg right-lg',
              'opacity-0 scale-x-0 origin-center transition-[transform,opacity] duration-200',
              'group-hover:opacity-30 group-hover:scale-x-100 motion-reduce:transition-none',
            )}
          />
        )}

        {/* Static active underline (top position, sliding indicator off) */}
        {isActive && !slideIndicator && !showAutoPlay && !isSide && (
          <span className={cn(
            'absolute bottom-0 left-0 right-0 h-0.75',
            staticActiveLine(color),
          )} />
        )}

        {/* Static active left bar (side position, sliding indicator off) */}
        {isActive && !slideIndicator && !showAutoPlay && isSide && (
          <span className={cn(
            'hidden md:block absolute left-0 top-0 bottom-0 w-0.75',
            staticActiveLine(color),
          )} />
        )}

        {/* Auto-play progress bar — top position (horizontal) */}
        {isActive && showAutoPlay && !isSide && (
          <span
            key={progressKey}
            className={cn('tab-progress-bar', progressBarBg(color))}
            style={{
              '--tab-dur':  `${autoPlayDuration}s`,
              '--tab-play': isPaused ? 'paused' : 'running',
            } as React.CSSProperties}
          />
        )}

        {/* Auto-play progress bar — side position: vertical at md+, horizontal below */}
        {isActive && showAutoPlay && isSide && (
          <>
            {/* md+: vertical fill along left accent bar */}
            <span
              key={`v-${progressKey}`}
              className={cn(
                'tab-progress-bar-v hidden md:block',
                progressBarBg(color),
              )}
              style={{
                '--tab-dur':  `${autoPlayDuration}s`,
                '--tab-play': isPaused ? 'paused' : 'running',
              } as React.CSSProperties}
            />
            {/* < md: horizontal at bottom (collapsed to top layout) */}
            <span
              key={`h-${progressKey}`}
              className={cn(
                'tab-progress-bar md:hidden',
                progressBarBg(color),
              )}
              style={{
                '--tab-dur':  `${autoPlayDuration}s`,
                '--tab-play': isPaused ? 'paused' : 'running',
              } as React.CSSProperties}
            />
          </>
        )}
      </button>
    )
  }

  // ── pill ──────────────────────────────────────────────────────────────

  if (tabStyle === 'pill') {
    const pillActive = cn(
      color === 'canvas' || color === 'surface' ? 'bg-brand text-fg-on-brand'
      : color === 'brand' ? [
          'bg-white/15 text-fg-on-brand',
          '[backdrop-filter:blur(16px)] [-webkit-backdrop-filter:blur(16px)]',
        ].join(' ')
      : /* glass */ [
          'bg-white/15 text-white',
          '[backdrop-filter:blur(16px)] [-webkit-backdrop-filter:blur(16px)]',
        ].join(' '),
    )

    const pillInactive = cn(
      triggerTextClass(color, 'inactive'),
      color === 'canvas' || color === 'surface' ? 'hover:bg-surface'
      : 'hover:bg-white/10',
    )

    return (
      <button
        ref={buttonRef}
        role="tab"
        id={`tab-${instanceId}-${index}`}
        aria-selected={isActive}
        aria-controls={`panel-${instanceId}-${index}`}
        tabIndex={isActive ? 0 : -1}
        onClick={() => onSelect(index)}
        className={cn(
          baseClass,
          // Actual pill geometry — matches the sliding indicator's round 9999px.
          // overflow-hidden keeps the autoplay sweep inside the curved ends.
          'rounded-full overflow-hidden px-md py-sm text-sm font-semibold tracking-label uppercase',
          isActive
            ? (slideIndicator ? activeTextClass('pill', color) : pillActive)
            : pillInactive,
        )}
      >
        {IconComp && <IconComp className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden />}
        <span>{tab.tabLabel}</span>

        {/* Progress bar — inset within pill, sweeps over active fill */}
        {isActive && showAutoPlay && (
          <span
            key={progressKey}
            className="tab-progress-bar bg-white/30"
            style={{
              left: '4px',
              right: '4px',
              width: 'auto',
              '--tab-dur':  `${autoPlayDuration}s`,
              '--tab-play': isPaused ? 'paused' : 'running',
            } as React.CSSProperties}
          />
        )}
      </button>
    )
  }

  // ── buttonGroup ───────────────────────────────────────────────────────
  // Segmented track control: chips float inside a tinted container.
  // Active state on dark surfaces (brand/glass) uses a near-white chip
  // with brand-colored text — distinct from pill's solid brand fill.

  const bgActive = cn(
    // Slightly raised: shadow layers give depth; translate-y lifts the chip above the track.
    // rounded-ot-control follows the Corner Style axis: 0px Sharp, 4px Soft, 8px Rounded.
    'rounded-ot-control transition-[box-shadow,transform] duration-150',
    color === 'canvas' || color === 'surface'
      ? [
          'bg-brand text-fg-on-brand',
          'shadow-[0_1px_2px_rgba(0,0,0,0.25),0_4px_18px_color-mix(in_oklch,var(--ot-brand)_45%,transparent)]',
          '-translate-y-px',
        ].join(' ')
      : [
          'bg-white/95 text-brand',
          'shadow-[0_1px_2px_rgba(0,0,0,0.2),0_3px_10px_rgba(255,255,255,0.12)]',
          '-translate-y-px',
        ].join(' '),
  )

  const progressOverlay =
    color === 'canvas' || color === 'surface' ? 'bg-white/25' : 'bg-brand/20'

  return (
    <button
      ref={buttonRef}
      role="tab"
      id={`tab-${instanceId}-${index}`}
      aria-selected={isActive}
      aria-controls={`panel-${instanceId}-${index}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => onSelect(index)}
      className={cn(
        baseClass,
        'flex-1 justify-center rounded-ot-control px-md py-sm text-sm font-semibold tracking-label uppercase overflow-hidden',
        isSide && 'md:flex-none md:w-full md:justify-start md:text-left',
        isActive
          ? (slideIndicator ? activeTextClass('buttonGroup', color) : bgActive)
          : cn(triggerTextClass(color, 'inactive'), 'hover:bg-fg/6 rounded-ot-control'),
      )}
    >
      {IconComp && <IconComp className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden />}
      <span>{tab.tabLabel}</span>

      {/* Progress bar — sweeps over active chip */}
      {isActive && showAutoPlay && (
        <span
          key={progressKey}
          className={cn('tab-progress-bar', progressOverlay)}
          style={{
            '--tab-dur':  `${autoPlayDuration}s`,
            '--tab-play': isPaused ? 'paused' : 'running',
          } as React.CSSProperties}
        />
      )}
    </button>
  )
}

// ─── PanelContent ─────────────────────────────────────────────────────────────

type PanelContentProps = {
  tab:           TabItemData
  color:         ColorCtx
  contentLayout: TabsStyleOptions['contentLayout']
}

function PanelContent({ tab, color, contentLayout }: PanelContentProps) {

  const headingClass = cn(
    'text-[clamp(1.5rem,3vw,2rem)] font-bold leading-[1.1] tracking-[-0.02em] text-balance',
    color === 'brand'  ? 'text-fg-on-brand'
    : color === 'glass' ? 'text-white'
    : 'text-fg',
  )

  const bodyClass = cn(
    'text-body leading-body text-pretty',
    color === 'brand'  ? 'text-fg-on-brand/80'
    : color === 'glass' ? 'text-white/75'
    : 'text-fg-muted',
  )

  const hasImage = !!(tab.imageSrc && (contentLayout === 'imageRight' || contentLayout === 'imageLeft'))

  // Fall back to textOnly if the active tab has no image
  const resolvedLayout = hasImage ? contentLayout : 'textOnly'

  const eyebrowClass = cn(
    'text-label tracking-label uppercase font-semibold',
    color === 'brand'  ? 'text-fg-on-brand/85'
    : color === 'glass' ? 'text-white/75'
    : 'text-brand',
  )

  const textContent = (
    <div className="flex flex-col gap-sm flex-1 max-w-[65ch]">
      <p className={eyebrowClass}>{tab.tabLabel}</p>
      {tab.heading && <h3 className={headingClass}>{tab.heading}</h3>}
      {tab.body    && (
        <div
          data-rich-text=""
          data-color={color === 'brand' ? 'brand' : color === 'glass' ? 'glass' : undefined}
          className={bodyClass}
        >
          {typeof tab.body === 'string'
            ? <p>{tab.body}</p>
            : <RichText content={tab.body} />}
        </div>
      )}
      {tab.ctaLabel && tab.ctaUrl && (
        <div className="mt-sm">
          <Button
            variant={ctaVariant(color)}
            size="sm"
            href={tab.ctaUrl}
            trailingIcon={<ArrowRight className="w-4 h-4" />}
          >
            {tab.ctaLabel}
          </Button>
        </div>
      )}
    </div>
  )

  if (resolvedLayout === 'textOnly') {
    return <div className="flex flex-col gap-sm">{textContent}</div>
  }

  // imageRight or imageLeft — text 55%, image 45%
  // DOM order: text first, then image. Flex-row-reverse puts image on left for imageLeft.
  return (
    <div className={cn(
      'flex flex-col gap-lg',
      resolvedLayout === 'imageRight' ? 'md:flex-row md:items-center' : 'md:flex-row-reverse md:items-center',
    )}>
      <div className="flex-1 md:basis-[55%] md:max-w-[55%] min-w-0">
        {textContent}
      </div>
      <div className="w-full md:basis-[45%] md:max-w-[45%] shrink-0">
        <div className="relative w-full aspect-4/3 overflow-hidden">
          <Image
            src={tab.imageSrc!}
            alt={tab.imageAlt || ''}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 45vw, 100vw"
          />
        </div>
      </div>
    </div>
  )
}
