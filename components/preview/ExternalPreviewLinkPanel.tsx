'use client'

/**
 * ExternalPreviewLinkPanel
 *
 * Shown in the Optimizely CMS preview when a blog page has
 * `enableExternalPreview` set to true. Presents a shareable URL that
 * enables Next.js draft mode for an external reviewer — no CMS login needed.
 *
 * Lives at the very top of the preview page, above the site chrome.
 */

import { useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  url:       string
  headline?: string
  topic?:    string
}

// ─── Copy button ─────────────────────────────────────────────────────────────

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Clipboard API may be unavailable in some contexts — silent fail
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-xs px-sm py-1 text-label text-fg-muted hover:text-fg border border-fg/12 hover:border-fg/25 transition-colors"
      aria-label={copied ? 'Link copied to clipboard' : 'Copy external preview link'}
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-accent" aria-hidden />
        : <Copy  className="w-3.5 h-3.5"             aria-hidden />
      }
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function ExternalPreviewLinkPanel({ url, topic }: Props) {
  return (
    <div className="w-full bg-brand/8 border-b border-brand/15">
      <div className="max-w-screen-xl mx-auto px-lg py-sm flex items-center gap-md flex-wrap min-h-[42px]">

        {/* Label */}
        <div className="flex items-center gap-sm shrink-0">
          {/* Brand bar accent — 2px wide vertical rule */}
          <div className="w-0.5 h-3.5 bg-brand rounded-full" aria-hidden />
          <span className="text-label uppercase tracking-label font-semibold text-brand">
            External Preview Link
          </span>
          {topic && (
            <>
              <span className="text-fg-muted/40" aria-hidden>·</span>
              <span className="text-label text-fg-muted capitalize">{topic}</span>
            </>
          )}
        </div>

        {/* URL — hidden on very small viewports, shown sm+ */}
        <code className="flex-1 text-label font-mono text-fg-muted truncate min-w-0 hidden sm:block">
          {url}
        </code>

        {/* Actions */}
        <div className="flex items-center gap-sm shrink-0 ml-auto sm:ml-0">
          <CopyButton url={url} />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-xs px-sm py-1 text-label text-fg-muted hover:text-fg border border-fg/12 hover:border-fg/25 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" aria-hidden />
            <span>Open</span>
          </a>
        </div>

      </div>
    </div>
  )
}
