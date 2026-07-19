import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { TokenCopyButton } from './TokenCopyButton'

type TokenEntry = { tokenKey?: string; tokenValue?: string }
type Props = { content: any }

export default function OT_TokenManagerAdapter({ content }: Props) {
  const { pa }  = getPreviewUtils(content)
  const tokens  = (content?.tokens ?? []) as TokenEntry[]
  const domains = (content?.domains ?? []) as string[]
  const defined = tokens.filter(t => t?.tokenKey)

  return (
    <div
      {...pa(content.__composition)}
      className="min-h-screen bg-canvas text-fg"
      data-theme="light"
    >
      {/* ── Header — matches ThemeManager style ───────────────────────────── */}
      <div className="border-b border-fg/10 px-md py-sm bg-surface flex items-center gap-md">
        <span className="text-label tracking-label uppercase font-semibold text-brand">
          Token Manager
        </span>
        <span className="text-label text-fg-muted">
          Paste <code className="font-mono text-[0.8em] bg-fg/8 border border-fg/10 px-1 rounded">{'{{key}}'}</code> into any CMS text field — values update everywhere automatically
        </span>
        {domains.length > 0 && (
          <div className="ml-auto flex items-center gap-xs shrink-0">
            <span className="text-[0.625rem] uppercase tracking-[0.15em] text-fg-muted/50 font-semibold">
              Domain
            </span>
            {domains.map((d, i) => (
              <span
                key={i}
                className="font-mono text-[0.75rem] bg-fg/5 border border-fg/10 text-fg-muted px-2 py-0.5 rounded"
              >
                {d}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="px-md pt-lg pb-xl lg:px-lg">

        {defined.length === 0 ? (
          <div className="rounded-md border border-fg/8 bg-surface/40 px-lg py-xl text-center">
            <p className="text-title font-semibold text-fg/25 mb-sm">No tokens defined</p>
            <p className="text-label text-fg-muted/45 leading-relaxed">
              Click{' '}
              <strong className="text-fg/50 font-medium">+ Add item</strong>{' '}
              under Token Definitions in the editor panel to add your first token.
            </p>
          </div>
        ) : (
          <>
            {/* ── Token table ──────────────────────────────────────────────── */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-label min-w-120">
                <thead>
                  <tr className="border-b-2 border-fg/10">
                    <th className="w-[22%] pb-sm pr-lg text-left text-xs font-bold uppercase tracking-widest text-fg/55">
                      Token Key
                    </th>
                    <th className="w-[36%] pb-sm pr-lg text-left text-xs font-bold uppercase tracking-widest text-fg/55">
                      Paste into Content
                    </th>
                    <th className="pb-sm text-left text-xs font-bold uppercase tracking-widest text-fg/55">
                      Renders As
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fg/5" {...pa('tokens')}>
                  {defined.map((token, i) => {
                    const key         = token.tokenKey?.trim() ?? ''
                    const value       = token.tokenValue ?? ''
                    const placeholder = `{{${key}}}`
                    return (
                      <tr key={i} className="hover:bg-fg/2 transition-colors duration-75">
                        <td className="py-3 pr-lg align-middle">
                          <span className="font-mono text-[0.8125rem] font-semibold text-fg/80">{key}</span>
                        </td>
                        <td className="py-3 pr-lg align-middle">
                          <TokenCopyButton text={placeholder} />
                        </td>
                        <td className="py-3 align-middle">
                          {value ? (
                            <span className="text-fg/75 leading-snug">{value}</span>
                          ) : (
                            <span className="text-[0.8125rem] italic text-fg/30">no value set</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Quick copy ───────────────────────────────────────────────── */}
            <div className="mt-xl border-t border-fg/8 pt-lg">
              <p className="mb-sm text-[0.625rem] font-bold uppercase tracking-widest text-fg/40">
                Quick Copy
              </p>
              <div className="flex flex-wrap gap-xs">
                {defined.map((token, i) => {
                  const key         = token.tokenKey?.trim() ?? ''
                  const placeholder = `{{${key}}}`
                  return (
                    <span key={i} className="inline-flex items-center gap-xs text-label">
                      <TokenCopyButton text={placeholder} />
                      {token.tokenValue && (
                        <span
                          className="max-w-[14ch] truncate text-fg-muted/50"
                          title={token.tokenValue}
                        >
                          {token.tokenValue}
                        </span>
                      )}
                    </span>
                  )
                })}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
