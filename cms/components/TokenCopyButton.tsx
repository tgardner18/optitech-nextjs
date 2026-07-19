'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function TokenCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    let ok = false
    // navigator.clipboard is blocked inside the CMS Visual Builder iframe
    // (no clipboard-write permission on the iframe). Fall back to the legacy
    // execCommand approach which works in all iframe contexts.
    try {
      await navigator.clipboard.writeText(text)
      ok = true
    } catch {
      try {
        const el = document.createElement('textarea')
        el.value = text
        el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0'
        document.body.appendChild(el)
        el.focus()
        el.select()
        ok = document.execCommand('copy')
        document.body.removeChild(el)
      } catch {}
    }
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={copy}
      aria-label={`Copy ${text} to clipboard`}
      title={copied ? 'Copied!' : 'Click to copy'}
      className={[
        'group inline-flex items-center gap-1.5 px-2 py-0.5 rounded cursor-copy',
        'font-mono text-[0.8125rem] leading-none whitespace-nowrap',
        'transition-colors duration-100 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        copied
          ? 'bg-brand/10 border border-brand/25 text-brand'
          : 'bg-fg/6 border border-fg/12 text-brand hover:bg-brand/8 hover:border-brand/20',
      ].join(' ')}
    >
      {copied ? (
        <Check size={11} className="shrink-0" aria-hidden />
      ) : (
        <Copy
          size={11}
          className="shrink-0 opacity-35 group-hover:opacity-60 transition-opacity duration-100"
          aria-hidden
        />
      )}
      <span>{text}</span>
    </button>
  )
}
