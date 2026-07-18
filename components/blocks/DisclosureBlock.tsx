'use client'

import { cva } from 'class-variance-authority'
import { cn }  from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DisclosureItem = {
  html: string
}

export type DisclosureStyleOptions = {
  style?:       'finePrint' | 'section'
  markerStyle?: 'numeric' | 'alpha'
}

export type DisclosureBlockProps = {
  heading?:      string
  items:         DisclosureItem[]
  styleOptions?: DisclosureStyleOptions
}

// ─── Marker helpers ───────────────────────────────────────────────────────────

const SUPERSCRIPTS = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹']

function getMarker(index: number, style: 'numeric' | 'alpha'): string {
  if (style === 'numeric') {
    return index < SUPERSCRIPTS.length ? SUPERSCRIPTS[index] : `${index + 1}.`
  }
  return `${String.fromCharCode(97 + index)}.`
}

// ─── CVA variants ─────────────────────────────────────────────────────────────

const wrapperCva = cva('w-full border-t', {
  variants: {
    style: {
      finePrint: 'pt-sm pb-md',
      section:   'pt-md pb-lg bg-surface/60',
    },
  },
  defaultVariants: { style: 'finePrint' },
})

const innerCva = cva('px-md lg:px-lg', {
  variants: {
    style: {
      finePrint: '',
      section:   '',
    },
  },
  defaultVariants: { style: 'finePrint' },
})

const headingCva = cva('font-sans font-semibold uppercase', {
  variants: {
    style: {
      finePrint: 'text-[0.625rem] tracking-widest text-fg-muted/70 mb-[6px]',
      section:   'text-label tracking-label text-fg-muted mb-xs',
    },
  },
  defaultVariants: { style: 'finePrint' },
})

const listCva = cva('list-none m-0 p-0', {
  variants: {
    style: {
      finePrint: 'space-y-[4px]',
      section:   'space-y-xs',
    },
  },
  defaultVariants: { style: 'finePrint' },
})

const itemCva = cva(
  [
    'font-sans text-fg-muted leading-[1.65]',
    '[&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-fg-muted/30',
    '[&_a:hover]:decoration-fg-muted/70 [&_a]:transition-[text-decoration-color]',
    '[&_strong]:font-semibold [&_em]:italic',
    '[&_p]:m-0 [&_p+p]:mt-[0.25em]',
  ].join(' '),
  {
    variants: {
      style: {
        finePrint: 'text-[0.75rem]',
        section:   'text-[0.8125rem]',
      },
    },
    defaultVariants: { style: 'finePrint' },
  }
)

const markerCva = cva('shrink-0 select-none font-sans font-semibold text-fg-muted/50', {
  variants: {
    style: {
      finePrint: 'text-[0.625rem] mt-[0.12em] mr-[0.35em]',
      section:   'text-[0.6875rem] mt-[0.1em]  mr-[0.4em]',
    },
  },
  defaultVariants: { style: 'finePrint' },
})

// ─── Border color by style ────────────────────────────────────────────────────

const BORDER_COLOR: Record<'finePrint' | 'section', string> = {
  finePrint: 'oklch(from var(--ot-fg) l c h / 0.08)',
  section:   'oklch(from var(--ot-fg) l c h / 0.12)',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DisclosureBlock({
  heading,
  items,
  styleOptions = {},
}: DisclosureBlockProps) {
  const { style = 'finePrint', markerStyle = 'numeric' } = styleOptions
  const showMarkers = items.length > 1

  if (!items.length) return null

  return (
    <section
      aria-label="Legal disclosures"
      className={wrapperCva({ style })}
      style={{ borderTopColor: BORDER_COLOR[style] }}
    >
      <div className={innerCva({ style })}>
        {heading && (
          <p className={headingCva({ style })}>
            {heading}
          </p>
        )}
        <ol className={listCva({ style })}>
          {items.map((item, i) => (
            <li key={i} className="flex items-start">
              {showMarkers && (
                <span aria-hidden="true" className={markerCva({ style })}>
                  {getMarker(i, markerStyle)}
                </span>
              )}
              <span
                className={cn(itemCva({ style }), 'min-w-0')}
                dangerouslySetInnerHTML={{ __html: item.html }}
              />
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
