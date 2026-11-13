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
import { Plus }             from 'lucide-react'

// Presentation lives in components/blocks/accordion.css, keyed on the data
// attributes below. Radix owns state, keyboard and ARIA; it writes data-state.

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
  const hasHead      = Boolean(eyebrow || headline)

  // Default value for Radix (single mode opens first item; multiple opens none)
  const defaultValue =
    defaultOpen && visibleItems.length > 0
      ? (openMode === 'single' ? 'item-0' : visibleItems.length >= 2 ? ['item-0', 'item-1'] : ['item-0'])
      : (openMode === 'single' ? undefined  : [])

  const nodes = visibleItems.map((item, i) => (
    <AccordionItemNode key={i} value={`item-${i}`} item={item} />
  ))

  return (
    <section
      data-block="accordion"
      data-color={color}
      data-border={borderStyle}
      data-open={openMode}
      data-head={hasHead ? '' : undefined}
      data-theme={color === 'brand' ? 'dark' : undefined}
    >
      <div data-part="inner">

        {hasHead && (
          <header data-part="head">
            {eyebrow && <p data-part="eyebrow">{eyebrow}</p>}
            {headline && <h2 data-part="headline">{headline}</h2>}
          </header>
        )}

        {isEmpty && (
          <p data-part="empty">Add at least {MIN_ITEMS} accordion items to display this block.</p>
        )}

        {!isEmpty && openMode === 'single' && (
          <RadixAccordion.Root
            data-part="list"
            type="single"
            collapsible
            defaultValue={typeof defaultValue === 'string' ? defaultValue : undefined}
          >
            {nodes}
          </RadixAccordion.Root>
        )}

        {!isEmpty && openMode === 'multiple' && (
          <RadixAccordion.Root
            data-part="list"
            type="multiple"
            defaultValue={Array.isArray(defaultValue) ? defaultValue : []}
          >
            {nodes}
          </RadixAccordion.Root>
        )}

      </div>
    </section>
  )
}

// ─── AccordionItemNode ────────────────────────────────────────────────────────

function AccordionItemNode({ value, item }: { value: string; item: AccordionItem }) {
  return (
    <RadixAccordion.Item value={value} data-part="item">
      <RadixAccordion.Header asChild>
        <h3>
          <RadixAccordion.Trigger data-part="trigger">
            <span data-part="question">{item.question}</span>
            <span data-part="icon" aria-hidden="true">
              <Plus strokeWidth={1.75} />
            </span>
          </RadixAccordion.Trigger>
        </h3>
      </RadixAccordion.Header>

      {/* forceMount keeps every answer in the server-rendered HTML for crawlers;
          accordion.css collapses closed panels (grid row 0fr, then hidden after the transition). */}
      <RadixAccordion.Content forceMount data-part="panel">
        <div data-part="answer-wrap">
          <div data-part="answer-clip">
            <p data-part="answer">{item.answer}</p>
          </div>
        </div>
      </RadixAccordion.Content>
    </RadixAccordion.Item>
  )
}
