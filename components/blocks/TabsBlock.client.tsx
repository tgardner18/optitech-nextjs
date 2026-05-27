'use client'

import Image        from 'next/image'
import { cn }       from '@/lib/utils'
import Button       from '@/components/ui/Button'
import { ICON_REGISTRY } from '@/components/icons/iconRegistry'
import { ArrowRight } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useId,
} from 'react'
import type { TabsStyleOptions } from '@/cms/styling/OT_TabsBlock.styling'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TabItemData = {
  tabLabel:  string
  tabIcon?:  string
  heading?:  string
  body?:     string
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

function triggerTextClass(color: ColorCtx, state: TriggerState): string {
  if (state === 'inactive') {
    return color === 'brand'  ? 'text-fg-on-brand/55 hover:text-fg-on-brand/80'
         : color === 'glass'  ? 'text-white/45 hover:text-white/70'
         : 'text-fg-muted/60 hover:text-fg-muted'
  }
  return color === 'brand'  ? 'text-fg-on-brand'
       : color === 'glass'  ? 'text-white'
       : 'text-fg'
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
  const [reducedMotion, setReducedMotion] = useState(false)

  // Panel height lock — prevents layout shift on tab change
  const panelContentRef              = useRef<HTMLDivElement>(null)
  const [panelMinHeight, setPanelMinHeight] = useState(0)

  // Detect reduced motion
  useEffect(() => {
    const mq      = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Track max observed panel height to prevent layout shift
  useLayoutEffect(() => {
    if (panelContentRef.current) {
      const h = panelContentRef.current.offsetHeight
      if (h > panelMinHeight) setPanelMinHeight(h)
    }
  })

  const goToTab = useCallback((idx: number) => {
    setActiveTab(idx)
    setProgressKey(k => k + 1)
  }, [])

  // Auto-play interval
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!autoPlay || reducedMotion || isPaused || isEmpty) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
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

      {/* ── Block header ─────────────────────────────────────────────────── */}
      {(eyebrow || heading) && (
        <header className="mb-xl max-w-screen-md">
          {eyebrow && (
            <p className={cn(
              'text-label tracking-label uppercase font-semibold mb-xs',
              color === 'brand'  ? 'text-fg-on-brand/70'
              : color === 'glass' ? 'text-white/60'
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
          onSelect={goToTab}
        />

        {/* ── Panel area ─────────────────────────────────────────────────── */}
        <div
          className={cn(
            'flex-1 min-w-0',
            color === 'canvas'  && 'bg-surface border border-fg/10 p-lg',
            color === 'surface' && 'bg-canvas  border border-fg/10 p-lg',
            color === 'brand'   && 'bg-white/10 border border-white/15 p-lg',
            color === 'glass'   && [
              'bg-white/10 border border-white/12 p-lg',
              '[backdrop-filter:blur(12px)] [-webkit-backdrop-filter:blur(12px)]',
              '[isolation:isolate] [will-change:transform]',
            ].join(' '),
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
          >
            <PanelContent
              tab={visibleTabs[activeTab]}
              color={color}
              contentLayout={contentLayout}
            />
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
  onSelect:         (idx: number) => void
}

function TriggerBar({
  tabs, activeTab, tabStyle, tabPosition, color, triggerAlign,
  showAutoPlay, progressKey, isPaused, autoPlayDuration, instanceId, onSelect,
}: TriggerBarProps) {

  const isSide = tabPosition === 'side'
  const isGlass = color === 'glass'
  const isBrand = color === 'brand'

  // ── Trigger row wrapper ─────────────────────────────────────────────────

  const rowClass = cn(
    // Mobile: always horizontal scroll strip
    'flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
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
      !isGlass && !isBrand && 'border border-fg/15',
      isBrand  && 'border border-white/20',
      isGlass  && [
        'border border-white/15',
        'bg-white/5 [backdrop-filter:blur(12px)] [-webkit-backdrop-filter:blur(12px)]',
        '[isolation:isolate]',
      ].join(' '),
      isSide && 'md:flex-col',
    ].join(' '),
  )

  return (
    <div className={rowClass} role="tablist" aria-orientation={isSide ? 'vertical' : 'horizontal'}>
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
  onSelect:         (idx: number) => void
}

function TriggerButton({
  tab, index, isActive, tabStyle, tabPosition, color,
  showAutoPlay, progressKey, isPaused, autoPlayDuration,
  instanceId, tabCount, onSelect,
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
    'relative flex items-center gap-xs shrink-0 transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
    'focus-visible:ring-offset-transparent cursor-pointer',
    focusRing,
  )

  // ── underline ─────────────────────────────────────────────────────────

  if (tabStyle === 'underline') {
    return (
      <button
        role="tab"
        id={`tab-${instanceId}-${index}`}
        aria-selected={isActive}
        aria-controls={`panel-${instanceId}-${index}`}
        tabIndex={isActive ? 0 : -1}
        onClick={() => onSelect(index)}
        className={cn(
          baseClass,
          'px-lg py-sm text-label font-semibold tracking-label uppercase',
          triggerTextClass(color, isActive ? 'active' : 'inactive'),
          // Glass active: frosted bg
          isActive && color === 'glass' && [
            'bg-white/15',
            '[backdrop-filter:blur(16px)] [-webkit-backdrop-filter:blur(16px)]',
            '[isolation:isolate]',
          ].join(' '),
          // Side position: no bottom border indicator, uses left bar instead
          isSide && 'md:px-md md:py-sm md:w-full md:text-left',
        )}
      >
        {IconComp && <IconComp className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden />}
        <span>{tab.tabLabel}</span>

        {/* Static active underline (top position, autoPlay off) */}
        {isActive && !showAutoPlay && !isSide && (
          <span className={cn(
            'absolute bottom-0 left-0 right-0 h-[3px]',
            staticActiveLine(color),
          )} />
        )}

        {/* Static active left bar (side position, autoPlay off) */}
        {isActive && !showAutoPlay && isSide && (
          <span className={cn(
            'hidden md:block absolute left-0 top-0 bottom-0 w-[3px]',
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
        role="tab"
        id={`tab-${instanceId}-${index}`}
        aria-selected={isActive}
        aria-controls={`panel-${instanceId}-${index}`}
        tabIndex={isActive ? 0 : -1}
        onClick={() => onSelect(index)}
        className={cn(
          baseClass,
          'px-md py-sm text-label font-semibold tracking-label uppercase',
          isActive ? pillActive : pillInactive,
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

  const isFirst = index === 0
  const isLast  = index === tabCount - 1

  const bgActive = cn(
    color === 'canvas' || color === 'surface' ? 'bg-brand text-fg-on-brand'
    : color === 'brand' ? 'bg-white/15 text-fg-on-brand'
    : /* glass */ 'bg-white/15 text-white',
  )

  const separatorClass = cn(
    !isLast && 'border-r',
    color === 'glass' || color === 'brand' ? 'border-white/20' : 'border-fg/15',
  )

  return (
    <button
      role="tab"
      id={`tab-${instanceId}-${index}`}
      aria-selected={isActive}
      aria-controls={`panel-${instanceId}-${index}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => onSelect(index)}
      className={cn(
        baseClass,
        'px-md py-sm text-label font-semibold tracking-label uppercase',
        separatorClass,
        isSide && 'md:w-full md:text-left md:border-r-0 md:border-b last:md:border-b-0',
        isSide && (color === 'glass' || color === 'brand') ? 'md:border-white/20' : isSide ? 'md:border-fg/15' : '',
        isActive ? bgActive : triggerTextClass(color, 'inactive'),
      )}
    >
      {IconComp && <IconComp className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden />}
      <span>{tab.tabLabel}</span>

      {/* Progress bar — bottom edge of active segment */}
      {isActive && showAutoPlay && (
        <span
          key={progressKey}
          className={cn('tab-progress-bar', progressBarBg(color))}
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
    'text-title font-semibold leading-title tracking-title text-balance',
    color === 'brand'  ? 'text-fg-on-brand'
    : color === 'glass' ? 'text-white'
    : 'text-fg',
  )

  const bodyClass = cn(
    'text-body leading-body text-pretty max-w-[65ch]',
    color === 'brand'  ? 'text-fg-on-brand/80'
    : color === 'glass' ? 'text-white/75'
    : 'text-fg-muted',
  )

  const hasImage = !!(tab.imageSrc && (contentLayout === 'imageRight' || contentLayout === 'imageLeft'))

  // Fall back to textOnly if the active tab has no image
  const resolvedLayout = hasImage ? contentLayout : 'textOnly'

  const textContent = (
    <div className="flex flex-col gap-sm flex-1">
      {tab.heading && <h3 className={headingClass}>{tab.heading}</h3>}
      {tab.body    && <p  className={bodyClass}>{tab.body}</p>}
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
      resolvedLayout === 'imageRight' ? 'md:flex-row'         : 'md:flex-row-reverse',
    )}>
      <div className="flex-1 md:basis-[55%] md:max-w-[55%] min-w-0">
        {textContent}
      </div>
      <div className="w-full md:basis-[45%] md:max-w-[45%] shrink-0">
        <div className="relative w-full aspect-[4/3] overflow-hidden">
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
