'use client'

import { useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  json:    string
  label?:  string
}

export default function JsonCopyBlock({ json, label = 'CMS JSON Data' }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(json)
    } catch {
      // execCommand fallback for restricted contexts
      const el = document.createElement('textarea')
      el.value = json
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.focus()
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [json])

  return (
    <div className="bg-surface border border-fg/8 mt-3">

      {/* Header */}
      <div className="flex items-center justify-between px-md py-2 border-b border-fg/6">
        <span className="text-label uppercase tracking-label font-semibold text-fg-muted/50">
          {label}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied to clipboard' : 'Copy JSON to clipboard'}
          className={cn(
            'flex items-center gap-1.5 px-xs py-1 -mr-1',
            'text-[0.6875rem] font-semibold tracking-[0.05em] uppercase leading-none',
            'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand',
            copied ? 'text-accent' : 'text-fg-muted/45 hover:text-fg-muted',
          )}
        >
          {copied
            ? <><Check    size={12} strokeWidth={2.5}  aria-hidden /><span>Copied</span></>
            : <><Copy     size={12} strokeWidth={1.75} aria-hidden /><span>Copy</span></>
          }
        </button>
      </div>

      {/* Code body */}
      <pre
        className="m-0 px-md py-sm font-mono text-[0.6875rem] leading-relaxed text-fg-muted/65 overflow-x-auto overflow-y-auto"
        style={{ maxHeight: 168, whiteSpace: 'pre' }}
      >
        {json}
      </pre>

    </div>
  )
}
