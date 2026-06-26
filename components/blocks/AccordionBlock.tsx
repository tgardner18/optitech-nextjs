'use client'

/**
 * AccordionBlock
 *
 * FAQ, disclosure, and general expandable content. Uses Radix UI Accordion
 * for keyboard navigation and ARIA semantics.
 *
 * Display settings:
 *   color       — canvas | surface | brand
 *   borderStyle — ruled | boxed | clean
 *   openMode    — single | multiple
 *   defaultOpen — false (all closed) | true (first item open)
 *
 * Min items: 2 | Max items: 12 (capped silently; empty state below minimum).
 */

import * as RadixAccordion from '@radix-ui/react-accordion'
import { cva }              from 'class-variance-authority'
import { cn }               from '@/lib/utils'
import { Plus }             from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AccordionItem = {
  question: string
  answer:   string
}

export type AccordionBlockStyleOptions = {
  color?:       'canvas' | 'surface' | 'brand'
  borderStyle?: 'ruled' | 'boxed' | 'clean'
  openMode?:    'single' | 'multiple'
  defaultOpen?: boolean
}

export type AccordionBlockProps = {
  eyebrow?:     string
  headline?:    string
  items:        AccordionItem[]
  styleOptions?: AccordionBlockStyleOptions
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_ITEMS = 2
const MAX_ITEMS = 12

// ─── CVA variants ─────────────────────────────────────────────────────────────

const sectionCva = cva('w-full px-md lg:px-lg', {
  variants: {
    color: {
      canvas:  'bg-canvas py-xl',
      surface: 'bg-surface py-xl',
      brand:   'bg-brand   py-xl',
    },
  },
  defaultVariants: { color: 'canvas' },
})

const eyebrowCva = cva('text-label tracking-label uppercase font-semibold mb-xs', {
  variants: {
    color: {
      canvas:  'text-brand',
      surface: 'text-brand',
      brand:   'text-fg-on-brand/70',
    },
  },
  defaultVariants: { color: 'canvas' },
})

const headlineCva = cva('text-headline tracking-headline font-bold leading-headline mb-xl', {
  variants: {
    color: {
      canvas:  'text-fg',
      surface: 'text-fg',
      brand:   'text-fg-on-brand',
    },
  },
  defaultVariants: { color: 'canvas' },
})

// Outer item wrapper — carries borders in "ruled" and "boxed" modes
const itemWrapperCva = cva('', {
  variants: {
    borderStyle: {
      ruled:  'border-t border-fg/10 last:border-b',
      boxed:  'border border-fg/10 mb-xs last:mb-0',
      clean:  'mb-sm last:mb-0',
    },
  },
  defaultVariants: { borderStyle: 'ruled' },
})

// Trigger row
const triggerCva = cva(
  [
    'group flex w-full items-start justify-between gap-md',
    'py-md text-left',
    // Focus ring — keyboard-accessible, never show on mouse. Ring color is set
    // per surface (below) so it never lands brand-on-brand and vanishes.
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
    // Transition
    'transition-colors duration-150',
  ].join(' '),
  {
    variants: {
      borderStyle: {
        ruled:  '',
        boxed:  'px-md',
        clean:  '',
      },
      color: {
        canvas:  'focus-visible:ring-brand',
        surface: 'focus-visible:ring-brand',
        brand:   'focus-visible:ring-fg-on-brand',
      },
    },
    defaultVariants: { borderStyle: 'ruled', color: 'canvas' },
  },
)

const questionCva = cva(
  // Title-scale tokens (leading-title / tracking-title) match every other title in
  // the system; the old leading-snug / tracking-tight were generic Tailwind defaults
  // that read cramped at 20px Poppins and diverged from the type scale.
  'text-title font-semibold leading-title tracking-title flex-1 text-balance transition-colors duration-150',
  {
    variants: {
      color: {
        canvas:  'text-fg group-data-[state=open]:text-brand',
        surface: 'text-fg group-data-[state=open]:text-brand',
        brand:   'text-fg-on-brand group-data-[state=open]:text-fg-on-brand',
      },
    },
    defaultVariants: { color: 'canvas' },
  },
)

const iconCva = cva(
  [
    'shrink-0 mt-0.5',
    // Rotate +45° → × when open, on the same slower, smooth curve as the row reveal.
    'transition-transform [transition-duration:var(--ot-dur-accordion)]',
    'group-data-[state=open]:rotate-45',
    '[transition-timing-function:var(--ot-ease-accordion)]',
  ].join(' '),
  {
    variants: {
      color: {
        canvas:  'text-fg-muted/50 group-data-[state=open]:text-brand',
        surface: 'text-fg-muted/50 group-data-[state=open]:text-brand',
        brand:   'text-fg-on-brand/60 group-data-[state=open]:text-fg-on-brand',
      },
    },
    defaultVariants: { color: 'canvas' },
  },
)

// Content element is the grid container (set by global CSS via [data-radix-accordion-content]).
// The animation classes target grid-template-rows — no height/layout property animated.
const contentClasses = [
  'motion-safe:data-[state=open]:animate-accordion-open',
  'motion-safe:data-[state=closed]:animate-accordion-close',
].join(' ')

const answerCva = cva(
  'text-body leading-body max-w-(--ot-measure-wide) text-pretty',
  {
    variants: {
      color: {
        canvas:  'text-fg-muted',
        surface: 'text-fg-muted',
        brand:   'text-fg-on-brand/75',
      },
      borderStyle: {
        ruled:  'pb-md',
        boxed:  'px-md pb-md',
        clean:  'pb-sm',
      },
    },
    defaultVariants: { color: 'canvas', borderStyle: 'ruled' },
  },
)

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ color }: { color: 'canvas' | 'surface' | 'brand' }) {
  const msgClass = color === 'brand' ? 'text-fg-on-brand/50' : 'text-fg-muted/40'
  return (
    <p className={cn('text-body py-xl text-center', msgClass)}>
      Add at least {MIN_ITEMS} accordion items to display this block.
    </p>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AccordionBlock({
  eyebrow,
  headline,
  items,
  styleOptions = {},
}: AccordionBlockProps) {
  const {
    color       = 'canvas',
    borderStyle = 'ruled',
    openMode    = 'single',
    defaultOpen = false,
  } = styleOptions

  // Cap at MAX_ITEMS; enforce minimum for empty state
  const visibleItems = items.slice(0, MAX_ITEMS)
  const isEmpty      = visibleItems.length < MIN_ITEMS

  // Brand fill is always dark — assert dark theme so tokens resolve correctly
  const isDarkSurface = color === 'brand'

  // Default value for Radix (single mode opens first item; multiple opens none)
  const defaultValue =
    defaultOpen && visibleItems.length > 0
      ? (openMode === 'single' ? 'item-0' : ['item-0'])
      : (openMode === 'single' ? undefined  : [])

  return (
    <section
      className={sectionCva({ color })}
      data-theme={isDarkSurface ? 'dark' : undefined}
    >
      <div className="max-w-screen-md mx-auto">

        {/* ── Block header ─────────────────────────────────────────────────── */}
        {(eyebrow || headline) && (
          <header className="mb-lg">
            {eyebrow && (
              <p className={eyebrowCva({ color })}>{eyebrow}</p>
            )}
            {headline && (
              <h2 className={headlineCva({ color })}>{headline}</h2>
            )}
          </header>
        )}

        {/* ── Empty state ──────────────────────────────────────────────────── */}
        {isEmpty && <EmptyState color={color} />}

        {/* ── Accordion ────────────────────────────────────────────────────── */}
        {!isEmpty && openMode === 'single' && (
          <RadixAccordion.Root
            type="single"
            collapsible
            defaultValue={typeof defaultValue === 'string' ? defaultValue : undefined}
          >
            {visibleItems.map((item, i) => (
              <AccordionItemNode
                key={i}
                value={`item-${i}`}
                item={item}
                color={color}
                borderStyle={borderStyle}
              />
            ))}
          </RadixAccordion.Root>
        )}

        {!isEmpty && openMode === 'multiple' && (
          <RadixAccordion.Root
            type="multiple"
            defaultValue={Array.isArray(defaultValue) ? defaultValue : []}
          >
            {visibleItems.map((item, i) => (
              <AccordionItemNode
                key={i}
                value={`item-${i}`}
                item={item}
                color={color}
                borderStyle={borderStyle}
              />
            ))}
          </RadixAccordion.Root>
        )}

      </div>
    </section>
  )
}

// ─── AccordionItemNode ────────────────────────────────────────────────────────

type ItemNodeProps = {
  value:       string
  item:        AccordionItem
  color:       'canvas' | 'surface' | 'brand'
  borderStyle: 'ruled' | 'boxed' | 'clean'
}

function AccordionItemNode({ value, item, color, borderStyle }: ItemNodeProps) {
  return (
    <RadixAccordion.Item
      value={value}
      className={itemWrapperCva({ borderStyle })}
    >
      <RadixAccordion.Header asChild>
        <h3>
          <RadixAccordion.Trigger className={triggerCva({ borderStyle, color })}>
            <span className={questionCva({ color })}>
              {item.question}
            </span>
            <Plus
              className={cn(iconCva({ color }), 'w-5 h-5')}
              aria-hidden
              strokeWidth={1.75}
            />
          </RadixAccordion.Trigger>
        </h3>
      </RadixAccordion.Header>

      {/* Grid container (display:grid set by global CSS on [data-radix-accordion-content]).
          Inner div has min-h-0 + overflow-hidden to complete the grid-rows reveal trick. */}
      <RadixAccordion.Content className={contentClasses}>
        <div className="min-h-0 overflow-hidden">
          {/* acc-answer-reveal: content settles in (fade + rise) as the row expands,
              so the answer arrives rather than being unveiled by the height clip alone.
              Motion-safe; reduced-motion users see it immediately. */}
          <p className={cn(answerCva({ color, borderStyle }), 'acc-answer-reveal')}>
            {item.answer}
          </p>
        </div>
      </RadixAccordion.Content>
    </RadixAccordion.Item>
  )
}
