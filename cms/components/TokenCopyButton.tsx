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

  // Split {{key}} into styled parts so the key pops out from the braces
  const tokenMatch = text.match(/^\{\{(.+)\}\}$/)
  const inner = tokenMatch?.[1]

  return (
    <button
      onClick={copy}
      aria-label={`Copy ${text} to clipboard`}
      title={copied ? 'Copied!' : 'Click to copy'}
      className={[
        'group inline-flex items-center gap-1.5 px-2.5 py-1 rounded cursor-copy',
        'font-mono text-[0.8125rem] leading-none whitespace-nowrap',
        'transition-colors duration-100 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        copied
          ? 'bg-brand/12 border border-brand/30 text-brand'
          : 'bg-brand/6 border border-brand/18 text-brand hover:bg-brand/12 hover:border-brand/30',
      ].join(' ')}
    >
      {copied ? (
        <Check size={11} className="shrink-0" aria-hidden />
      ) : (
        <Copy
          size={11}
          className="shrink-0 opacity-40 group-hover:opacity-70 transition-opacity duration-100"
          aria-hidden
        />
      )}
      {inner ? (
        <span>
          <span className="opacity-40">{'{{'}</span>
          <span className="font-semibold">{inner}</span>
          <span className="opacity-40">{'}}'}</span>
        </span>
      ) : (
        <span>{text}</span>
      )}
    </button>
  )
}
