'use client'

import Image        from 'next/image'
import { cn }       from '@/lib/utils'
import Button       from '@/components/ui/Button'
import { ICON_REGISTRY } from '@/components/icons/iconRegistry'
import { ArrowRight, Pause, Play } from 'lucide-react'
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
  /**
   * Renders with a single tab instead of requiring 2+. Used by the
   * standalone OT_TabItemBlock element (isolated, or leading a column-group
   * of adjacent Tab Items) so a lone tab still renders in tabbed chrome
   * rather than disappearing. The array-driven OT_TabsBlock section keeps
   * the normal 2-minimum.
   */
  allowSingle?: boolean
  /**
   * Per-tab click-to-edit overlay attributes (from getPreviewUtils), indexed
   * the same as `tabs`. Set when tabs come from independently-editable
   * composition nodes grouped in a column, so each panel still highlights
   * for editing even though they render through one merged switcher.
   */
  panelEditAttrs?: Array<Record<string, unknown> | undefined>
}

// Visual styling lives in tabs.css (imported from app/globals.css), keyed on the data attributes below.

type ColorCtx = 'canvas' | 'surface' | 'brand' | 'glass'

function ctaVariant(color: ColorCtx): 'brand' | 'ghost' {
  return color === 'brand' || color === 'glass' ? 'ghost' : 'brand'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TabsBlockClient({
  eyebrow,
  heading,
  tabs,
  styleOptions,
  allowSingle = false,
  panelEditAttrs,
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
  const isEmpty       = visibleTabs.length < (allowSingle ? 1 : 2)

  const [activeTab,    setActiveTab]    = useState(0)
  const [progressKey,  setProgressKey]  = useState(0)
  // Auto-play pauses while the pointer is over the block, while focus is inside it, and when
  // the visitor presses the pause button (WCAG 2.2.2).
  const [hovered,      setHovered]      = useState(false)
  const [focused,      setFocused]      = useState(false)
  const [userPaused,   setUserPaused]   = useState(false)
  // Pressing Resume is an explicit choice: it wins over hover and focus until the pointer and focus leave the block
  // (the icon swap under the pointer fires a fresh hover that would otherwise re-pause it).
  const [forcePlay,    setForcePlay]    = useState(false)
  const isPaused = userPaused || (!forcePlay && (hovered || focused))
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

  // The lock only ever grows, so reset it when the width changes (rotation, resize) and let it re-measure.
  useEffect(() => {
    let w = window.innerWidth
    const onResize = () => { if (Math.abs(window.innerWidth - w) > 20) { w = window.innerWidth; setPanelMinHeight(0) } }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const goToTab = useCallback((idx: number) => {
    if (idx !== activeTab) setDir(idx > activeTab ? 'right' : 'left')
    setActiveTab(idx)
    setProgressKey(k => k + 1)
  }, [activeTab])

  // The timer starts a full interval whenever auto-play resumes, so the progress bar restarts with it.
  const restartProgress = () => setProgressKey(k => k + 1)

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

  // Entrance: data-in once the block scrolls into view
  const sectionRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    if (reducedMotion || !('IntersectionObserver' in window)) { el.setAttribute('data-in', ''); return }
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { el.setAttribute('data-in', ''); io.disconnect() } }, { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [reducedMotion])

  if (isEmpty) return null

  const showAutoPlay = autoPlay && !reducedMotion
  const hasHeader = Boolean(eyebrow || heading)
  const headingId = `tabs-h-${instanceId}`
  const panelId   = `panel-${instanceId}`
  const activeData = visibleTabs[activeTab]
  const layoutNow = activeData?.imageSrc && (contentLayout === 'imageRight' || contentLayout === 'imageLeft')
    ? contentLayout
    : 'textOnly'

  return (
    <section
      ref={sectionRef}
      data-block="tabs"
      data-style={tabStyle}
      data-position={tabPosition}
      data-color={color}
      data-layout={layoutNow}
      data-align={triggerAlign}
      data-auto={showAutoPlay ? 'on' : 'off'}
      // brand fill and glass ground are always dark
      data-theme={color === 'brand' || color === 'glass' ? 'dark' : undefined}
      data-paused={isPaused ? '' : undefined}
      data-animate=""
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); if (!focused) { if (!forcePlay && !userPaused) restartProgress(); setForcePlay(false) } }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) { setFocused(false); if (!hovered) { if (!forcePlay && !userPaused) restartProgress(); setForcePlay(false) } }
      }}
    >
      <div data-part="inner">

        {hasHeader && (
          <header data-part="head">
            {eyebrow && <p data-part="h-eyebrow">{eyebrow}</p>}
            {heading && <h2 data-part="h-title" id={headingId}>{heading}</h2>}
          </header>
        )}

        <div data-part="cols">
          <div data-part="bar">
            <TriggerBar
              tabs={visibleTabs}
              activeTab={activeTab}
              tabStyle={tabStyle}
              tabPosition={tabPosition}
              showAutoPlay={showAutoPlay}
              progressKey={progressKey}
              autoPlayDuration={autoPlayDuration}
              instanceId={instanceId}
              panelId={panelId}
              ariaLabel={heading ?? 'Tabs'}
              reducedMotion={reducedMotion}
              onSelect={goToTab}
            />
            {showAutoPlay && (
              <button
                type="button"
                data-part="pause"
                aria-pressed={userPaused}
                aria-label={userPaused ? 'Resume auto-play' : 'Pause auto-play'}
                onClick={() => {
                  if (userPaused) { setForcePlay(true); restartProgress() } else setForcePlay(false)
                  setUserPaused(p => !p)
                }}
              >
                {userPaused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
              </button>
            )}
          </div>

          <div
            data-part="panel"
            role="tabpanel"
            id={panelId}
            tabIndex={0}
            aria-labelledby={`tab-${instanceId}-${activeTab}`}
            style={panelMinHeight > 0 ? { minHeight: `${panelMinHeight}px` } : undefined}
          >
            <div
              key={activeTab}
              ref={panelContentRef}
              data-part="enter"
              data-dir={dir ?? undefined}
              {...panelEditAttrs?.[activeTab]}
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
  showAutoPlay:     boolean
  progressKey:      number
  autoPlayDuration: number
  instanceId:       string
  panelId:          string
  ariaLabel:        string
  reducedMotion:    boolean
  onSelect:         (idx: number) => void
}

function TriggerBar({
  tabs, activeTab, tabStyle, tabPosition,
  showAutoPlay, progressKey, autoPlayDuration, instanceId, panelId, ariaLabel,
  reducedMotion, onSelect,
}: TriggerBarProps) {

  const isSide = tabPosition === 'side'

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
      // Both pill and button-group follow the Corner Style axis (--radius-ot-control:
      // 0/4/8px for Sharp/Soft/Rounded) rather than a hardcoded 9999px — a literal pill
      // shape would bypass the theme's corner setting, the one axis DESIGN.md reserves
      // for controlling roundness. Under a "Rounded" theme this still reads as a pill.
      radius = 'var(--radius-ot-control)'
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

  return (
    <div
      ref={scrollerRef}
      data-part="list"
      className="tab-scroller"
      role="tablist"
      aria-label={ariaLabel}
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
          data-part="indicator"
          style={{ width: rect!.sw, height: rect!.sh, clipPath: indicatorClip }}
        />
      )}
      {tabs.map((tab, i) => {
        const IconComp = tab.tabIcon && tab.tabIcon !== 'none' ? ICON_REGISTRY[tab.tabIcon] : null
        const isActive = activeTab === i
        return (
          <button
            key={i}
            ref={(el) => { buttonsRef.current[i] = el }}
            type="button"
            role="tab"
            data-part="tab"
            id={`tab-${instanceId}-${i}`}
            aria-selected={isActive}
            // only the selected tab's panel is rendered, so only it can be referenced
            aria-controls={isActive ? panelId : undefined}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(i)}
          >
            {IconComp && <IconComp className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden />}
            <span data-part="label">{tab.tabLabel}</span>
            {isActive && showAutoPlay && (
              <span
                key={progressKey}
                data-part="progress"
                aria-hidden="true"
                style={{ '--tab-dur': `${autoPlayDuration}s` } as React.CSSProperties}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── PanelContent ─────────────────────────────────────────────────────────────

type PanelContentProps = {
  tab:           TabItemData
  color:         ColorCtx
  contentLayout: TabsStyleOptions['contentLayout']
}

function PanelContent({ tab, color, contentLayout }: PanelContentProps) {
  const hasImage = !!(tab.imageSrc && (contentLayout === 'imageRight' || contentLayout === 'imageLeft'))
  const layout = hasImage ? contentLayout : 'textOnly'

  return (
    <div data-part="content" data-layout={layout}>
      <div data-part="text">
        <p data-part="kicker">{tab.tabLabel}</p>
        {tab.heading && <h3 data-part="heading">{tab.heading}</h3>}
        {tab.body && (
          <div data-part="body" data-rich-text="">
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
      {hasImage && (
        <div data-part="media">
          <Image
            src={tab.imageSrc!}
            alt={tab.imageAlt || ''}
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
          />
        </div>
      )}
    </div>
  )
}
