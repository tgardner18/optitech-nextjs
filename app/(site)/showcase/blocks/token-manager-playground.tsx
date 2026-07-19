'use client'

import { useState } from 'react'
import { replaceTokens } from '@/lib/token-replace'

// ─── Sample token sets ────────────────────────────────────────────────────────

const PRESET_TOKENS: Record<string, Record<string, string>> = {
  financial: {
    'product-name':      'Advantage Checking',
    'apy-rate':          '5.25%',
    'institution-name':  'First Meridian Bank',
    'min-balance':       '$500',
    'open-cta':          'Open an account today',
  },
  healthcare: {
    'product-name':      'WellCare Plus',
    'institution-name':  'Optimedical Group',
    'plan-type':         'PPO',
    'open-cta':          'Request a consultation',
    'coverage-note':     'Plans accepted at 200+ locations',
  },
  retail: {
    'product-name':      'ProMax Bundle',
    'institution-name':  'Apex Commerce',
    'discount-rate':     '20%',
    'open-cta':          'Shop the collection',
    'shipping-note':     'Free shipping on orders over $49',
  },
}

// ─── Sample content pieces that use tokens ─────────────────────────────────

const SAMPLE_CONTENT = [
  {
    label:    'Hero headline',
    raw:      'Open your {{product-name}} at {{institution-name}} today.',
  },
  {
    label:    'Product subheading',
    raw:      'Earn {{apy-rate}} APY with no hidden fees. {{open-cta}}.',
  },
  {
    label:    'Body copy',
    raw:      'The {{product-name}} from {{institution-name}} is designed for members who want more from their money. Minimum opening deposit of {{min-balance}}.',
  },
  {
    label:    'Meta description',
    raw:      '{{institution-name}} — {{product-name}}. {{coverage-note}}. {{open-cta}}.',
  },
  {
    label:    'CTA button label',
    raw:      '{{open-cta}}',
  },
]

// ─── Playground ───────────────────────────────────────────────────────────────

export default function TokenManagerPlayground() {
  const [preset,      setPreset]      = useState<keyof typeof PRESET_TOKENS>('financial')
  const [customKey,   setCustomKey]   = useState('')
  const [customValue, setCustomValue] = useState('')
  const [extraTokens, setExtraTokens] = useState<Record<string, string>>({})

  const tokens = { ...PRESET_TOKENS[preset], ...extraTokens }

  function addToken() {
    const k = customKey.trim()
    const v = customValue.trim()
    if (!k) return
    setExtraTokens(prev => ({ ...prev, [k]: v }))
    setCustomKey('')
    setCustomValue('')
  }

  function removeExtra(key: string) {
    setExtraTokens(prev => { const n = { ...prev }; delete n[key]; return n })
  }

  return (
    <div className="divide-y divide-fg/5">

      {/* ── Concept explainer ───────────────────────────────────────────── */}
      <div className="px-md pt-xl pb-lg lg:px-lg max-w-[70ch]">
        <h2 className="text-headline font-bold text-fg mb-sm">How tokens work</h2>
        <p className="text-body text-fg-muted leading-body mb-md">
          The Token Manager is a shared block (like Theme Manager) — one item in Shared Assets, applied globally.
          Authors place <code className="bg-fg/10 px-1.5 py-0.5 rounded font-mono text-[0.85em] text-brand">{'{{token-key}}'}</code> placeholders
          in any CMS field: headlines, body copy, CTA labels, meta descriptions, even image alt text.
          At render time — both in the CMS preview and on the published page — each placeholder is replaced with the token&apos;s current value.
        </p>
        <div className="grid sm:grid-cols-3 gap-md text-label">
          {[
            { step: '1', title: 'Define', body: 'Create a Token Manager in Shared Assets. Add key–value pairs. Keys are language-neutral; values translate per locale.' },
            { step: '2', title: 'Author', body: 'Place {{token-key}} in any content field. The CMS editor shows the raw token; preview and publish show the value.' },
            { step: '3', title: 'Update', body: 'Change the value in the Token Manager. Every page that references the token updates instantly — no page edits needed.' },
          ].map(({ step, title, body }) => (
            <div key={step} className="bg-surface border border-fg/10 rounded p-md">
              <div className="text-brand font-mono text-[0.75rem] font-semibold mb-xs">Step {step}</div>
              <div className="font-semibold text-fg mb-xs">{title}</div>
              <div className="text-fg-muted leading-relaxed">{body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Interactive demo ────────────────────────────────────────────── */}
      <div className="px-md pt-lg pb-xl lg:px-lg">
        <p className="text-label uppercase tracking-label text-fg-muted/50 font-semibold mb-md">
          Live replacement demo
        </p>

        {/* Vertical selector */}
        <div className="flex flex-wrap gap-sm mb-lg">
          <span className="text-label text-fg-muted self-center mr-xs">Preset vertical:</span>
          {(Object.keys(PRESET_TOKENS) as Array<keyof typeof PRESET_TOKENS>).map(p => (
            <button
              key={p}
              onClick={() => { setPreset(p); setExtraTokens({}) }}
              className={[
                'px-sm py-xs rounded text-label font-medium transition-colors',
                preset === p
                  ? 'bg-brand text-fg-on-brand'
                  : 'bg-surface border border-fg/10 text-fg-muted hover:text-fg',
              ].join(' ')}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-xl">

          {/* Left: token map */}
          <div>
            <p className="text-label text-fg-muted/50 uppercase tracking-label font-semibold mb-sm">
              Token definitions
            </p>
            <table className="w-full text-label border-collapse">
              <thead>
                <tr className="border-b border-fg/10">
                  <th className="text-left pb-xs pr-md text-fg-muted/50 font-semibold">Key</th>
                  <th className="text-left pb-xs text-fg-muted/50 font-semibold">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fg/5">
                {Object.entries(tokens).map(([k, v]) => (
                  <tr key={k}>
                    <td className="py-xs pr-md align-top">
                      <code className="font-mono text-brand text-[0.8rem]">{`{{${k}}}`}</code>
                    </td>
                    <td className="py-xs align-top flex items-center justify-between gap-sm">
                      <span className="text-fg">{v || <em className="text-fg-muted/40">empty</em>}</span>
                      {extraTokens[k] !== undefined && (
                        <button
                          onClick={() => removeExtra(k)}
                          className="text-fg-muted/40 hover:text-fg-muted text-[0.8rem] shrink-0"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Add custom token */}
            <div className="mt-md pt-md border-t border-fg/10">
              <p className="text-label text-fg-muted/50 uppercase tracking-label font-semibold mb-sm">
                Add a token
              </p>
              <div className="flex gap-sm flex-wrap">
                <input
                  type="text"
                  placeholder="token-key"
                  value={customKey}
                  onChange={e => setCustomKey(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addToken()}
                  className="flex-1 min-w-0 bg-surface border border-fg/15 rounded px-sm py-xs font-mono text-label text-fg placeholder:text-fg-muted/40 focus:outline-none focus:border-brand"
                />
                <input
                  type="text"
                  placeholder="value"
                  value={customValue}
                  onChange={e => setCustomValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addToken()}
                  className="flex-1 min-w-0 bg-surface border border-fg/15 rounded px-sm py-xs text-label text-fg placeholder:text-fg-muted/40 focus:outline-none focus:border-brand"
                />
                <button
                  onClick={addToken}
                  className="px-sm py-xs bg-brand text-fg-on-brand text-label font-medium rounded hover:bg-brand-hover transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Right: content rendered with replacements */}
          <div>
            <p className="text-label text-fg-muted/50 uppercase tracking-label font-semibold mb-sm">
              Content fields with replacements applied
            </p>
            <div className="flex flex-col gap-sm">
              {SAMPLE_CONTENT.map(({ label, raw }) => {
                const replaced = replaceTokens(raw, tokens)
                const changed  = replaced !== raw
                return (
                  <div key={label} className="bg-surface border border-fg/10 rounded p-sm">
                    <p className="text-[0.7rem] uppercase tracking-label text-fg-muted/40 font-semibold mb-xs">{label}</p>
                    <p className="text-label text-fg-muted/50 font-mono mb-xs leading-relaxed">{raw}</p>
                    <p className={['text-label leading-relaxed', changed ? 'text-fg' : 'text-fg-muted/40 italic'].join(' ')}>
                      {changed ? replaced : 'No tokens matched'}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Usage patterns ──────────────────────────────────────────────── */}
      <div className="px-md pt-lg pb-xl lg:px-lg">
        <p className="text-label uppercase tracking-label text-fg-muted/50 font-semibold mb-md">
          Usage patterns
        </p>
        <div className="grid sm:grid-cols-2 gap-md text-label">
          {[
            {
              title:   'Server components (adapters)',
              note:    'Call applyTokensToContent() to replace tokens across the full content object before passing to the UI component.',
              code:    `import { getTokenMap, applyTokensToContent } from '@/lib/tokens'\n\nexport default async function OT_HeroBlockAdapter({ content }) {\n  const tokens  = await getTokenMap()\n  const content = applyTokensToContent(rawContent, tokens)\n  return <HeroBlock {...content} />\n}`,
            },
            {
              title:   'Client components',
              note:    'Use the useReplaceTokens() hook — the token map is already in context from the site layout.',
              code:    `import { useReplaceTokens } from '@/components/providers/TokenProvider'\n\nexport function MyComponent({ text }) {\n  const replace = useReplaceTokens()\n  return <p>{replace(text)}</p>\n}`,
            },
          ].map(({ title, note, code }) => (
            <div key={title} className="bg-surface border border-fg/10 rounded p-md">
              <p className="font-semibold text-fg mb-xs">{title}</p>
              <p className="text-fg-muted leading-relaxed mb-sm">{note}</p>
              <pre className="bg-canvas rounded p-sm overflow-x-auto text-[0.75rem] font-mono text-fg-muted/80 leading-relaxed whitespace-pre-wrap">
                {code}
              </pre>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
