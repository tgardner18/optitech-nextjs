'use client'

/**
 * DraftStateBanner
 *
 * Shown to external reviewers who open a blog post via an External Preview Link.
 * Appears as a fixed strip across the top of the viewport. Collapses to a small
 * floating pill anchored to the bottom-left corner (clear of nav CTAs) when dismissed.
 *
 * Styled with the OptiTech design system tokens. Uses a warm amber signal to
 * indicate "draft / unpublished" state — distinct from brand teal and signal green.
 */

import { useState } from 'react'
import { FileEdit, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  headline:    string
  topic?:      string
  version?:    string
  locale?:     string
  authorName?: string
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

// Warm amber — one-off signal color for draft state. Not a design token because
// it only appears in this preview-only utility component, never on brand surfaces.
const DRAFT_AMBER = 'oklch(76% 0.17 68)'

// ─── Component ────────────────────────────────────────────────────────────────

export function DraftStateBanner({ headline, topic, version, locale, authorName }: Props) {
  const [open, setOpen] = useState(true)
  const topicLabel = topic ? (TOPIC_LABELS[topic] ?? topic) : null

  return (
    <AnimatePresence initial={false} mode="wait">
      {open ? (

        // ── Expanded strip ────────────────────────────────────────────────────
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
          <div className="h-px w-full" style={{ background: DRAFT_AMBER }} aria-hidden />

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

              {/* Topic + author — secondary meta, hidden on small screens */}
              <div className="shrink-0 items-center gap-sm hidden sm:flex">
                {topicLabel && (
                  <span className="text-label uppercase tracking-label font-semibold text-fg-muted/55">
                    {topicLabel}
                  </span>
                )}
                {topicLabel && authorName && (
                  <span className="text-fg-muted/30" aria-hidden>·</span>
                )}
                {authorName && (
                  <span className="text-label text-fg-muted/55">{authorName}</span>
                )}
              </div>

              {/* Headline — takes remaining space, truncates */}
              <span className="truncate flex-1 text-body text-fg min-w-0">
                {headline}
              </span>

              {/* Locale / version — right-aligned meta */}
              <div className="shrink-0 items-center gap-sm text-label text-fg-muted/45 hidden md:flex">
                {locale && <span>{locale.toUpperCase()}</span>}
                {locale && version && <span aria-hidden>·</span>}
                {version && <span>v{version}</span>}
              </div>

              {/* Collapse */}
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

        // ── Collapsed pill — bottom-left, clear of nav CTAs ───────────────────
        <motion.button
          key="collapsed"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ ease: [0.25, 1, 0.5, 1], duration: 0.24 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-[9999] flex items-center gap-sm px-md py-2 bg-brand text-fg-on-brand shadow-[0_4px_20px_var(--ot-bloom-brand-faint),0_0_0_1px_var(--ot-bloom-brand-border)] hover:bg-brand-hover hover:shadow-[0_6px_28px_var(--ot-bloom-brand-ring),0_0_0_1px_var(--ot-bloom-brand-ring)] transition-all duration-200"
          aria-label="Show draft preview notice"
        >
          {/* Label */}
          <span className="text-label uppercase tracking-label font-semibold">
            Draft Preview
          </span>

          {/* Icon */}
          <FileEdit className="w-3.5 h-3.5 opacity-70" aria-hidden />
        </motion.button>

      )}
    </AnimatePresence>
  )
}
