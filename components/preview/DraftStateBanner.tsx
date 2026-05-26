'use client'

/**
 * DraftStateBanner
 *
 * Shown to external reviewers who open a blog post via an External Preview Link.
 * Appears as a fixed strip across the top of the viewport. Collapses to a small
 * floating button when dismissed; clicking it re-expands the banner.
 *
 * Styled with the OptiTech design system tokens. Uses a warm amber accent to
 * signal "draft / unpublished" state — distinct from the brand teal and signal green.
 */

import { useState } from 'react'
import { Eye, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  headline: string
  topic?:   string
  version?: string
  locale?:  string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TOPIC_LABELS: Record<string, string> = {
  news:       'News',
  insights:   'Insights',
  leadership: 'Leadership',
  stories:    'Stories',
  innovation: 'Innovation',
  culture:    'Culture',
  events:     'Events',
  resources:  'Resources',
}

// Draft amber — warm signal, not part of brand palette.
// Using inline oklch values so the component is self-contained and doesn't
// pollute the design token namespace with a one-off utility color.
const DRAFT_AMBER = 'oklch(78% 0.18 75)'

// ─── Component ────────────────────────────────────────────────────────────────

export function DraftStateBanner({ headline, topic, version, locale }: Props) {
  const [open, setOpen] = useState(true)
  const topicLabel = topic ? (TOPIC_LABELS[topic] ?? topic) : null

  return (
    <AnimatePresence initial={false} mode="wait">
      {open ? (
        <motion.div
          key="expanded"
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.38 }}
          className="fixed top-0 inset-x-0 z-[9999]"
          role="status"
          aria-label="Draft preview notice"
        >
          {/* Amber top rule */}
          <div
            className="h-px w-full"
            style={{ background: DRAFT_AMBER }}
            aria-hidden
          />

          {/* Panel body */}
          <div className="bg-surface/[0.97] backdrop-blur-md border-b border-fg/8 shadow-[0_2px_24px_oklch(0_0_0/0.22)]">
            <div className="max-w-screen-xl mx-auto px-lg flex items-center gap-md py-2.5">

              {/* Draft badge */}
              <span
                className="shrink-0 px-sm py-0.5 text-label uppercase tracking-label font-semibold border"
                style={{
                  color:           DRAFT_AMBER,
                  borderColor:     `color-mix(in oklch, ${DRAFT_AMBER} 35%, transparent)`,
                  backgroundColor: `color-mix(in oklch, ${DRAFT_AMBER} 10%, transparent)`,
                }}
              >
                Draft
              </span>

              {/* Topic */}
              {topicLabel && (
                <span className="shrink-0 text-label uppercase tracking-label font-semibold text-fg-muted/60 hidden sm:block">
                  {topicLabel}
                </span>
              )}

              {/* Headline — truncates on small screens */}
              <span className="truncate flex-1 text-body text-fg min-w-0">
                {headline}
              </span>

              {/* Locale / version meta */}
              <div className="shrink-0 items-center gap-sm text-label text-fg-muted/50 hidden md:flex">
                {locale && <span>{locale.toUpperCase()}</span>}
                {locale && version && <span aria-hidden>·</span>}
                {version && <span>v{version}</span>}
              </div>

              {/* Collapse button */}
              <button
                onClick={() => setOpen(false)}
                className="shrink-0 p-1 -mr-1 text-fg-muted hover:text-fg transition-colors"
                aria-label="Collapse draft preview notice"
              >
                <X className="w-4 h-4" />
              </button>

            </div>
          </div>
        </motion.div>

      ) : (

        <motion.button
          key="collapsed"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.88 }}
          transition={{ ease: [0.25, 1, 0.5, 1], duration: 0.22 }}
          onClick={() => setOpen(true)}
          className="fixed top-4 right-4 z-[9999] flex items-center gap-xs px-md py-2 bg-surface/95 backdrop-blur-sm border border-fg/10 text-fg-muted hover:text-fg shadow-[0_4px_20px_oklch(0_0_0/0.28)] transition-colors"
          aria-label="Show draft preview notice"
        >
          <Eye className="w-3.5 h-3.5" aria-hidden />
          <span
            className="text-label uppercase tracking-label font-semibold"
            style={{ color: DRAFT_AMBER }}
          >
            Draft
          </span>
        </motion.button>

      )}
    </AnimatePresence>
  )
}
