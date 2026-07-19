import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'

type TokenEntry = { tokenKey?: string; tokenValue?: string }

type Props = { content: any }

export default function OT_TokenManagerAdapter({ content }: Props) {
  const { pa }    = getPreviewUtils(content)
  const tokens    = (content?.tokens ?? []) as TokenEntry[]
  const domains   = (content?.domains ?? []) as string[]
  const defined   = tokens.filter(t => t?.tokenKey)

  return (
    <div
      {...pa(content.__composition)}
      className="min-h-screen bg-canvas text-fg"
      data-theme="dark"
    >
      {/* Header */}
      <div className="border-b border-fg/10 px-md py-sm bg-surface flex items-start gap-md">
        <div className="flex-1 min-w-0">
          <span className="text-label tracking-label uppercase font-semibold text-brand">
            Token Manager Preview
          </span>
          <p className="text-label text-fg-muted mt-xs leading-relaxed">
            Tokens replace <code className="bg-fg/10 px-1 rounded font-mono text-[0.75rem]">{'{{key}}'}</code> placeholders
            in any content field at render time — headlines, body copy, metadata, CTAs, anywhere.
            Token keys are language-neutral; values translate per locale.
          </p>
        </div>
        {domains.length > 0 && (
          <div className="shrink-0 text-right">
            <p className="text-label text-fg-muted/50 uppercase tracking-label text-[0.7rem] font-semibold mb-xs">
              Associated domains
            </p>
            {domains.map((d, i) => (
              <p key={i} className="font-mono text-label text-fg-muted/70">{d}</p>
            ))}
          </div>
        )}
      </div>

      {/* Token table */}
      <div className="px-md pt-lg pb-xl lg:px-lg">

        {/* Author instruction bar */}
        <div className="bg-brand/10 border border-brand/20 rounded px-md py-sm mb-lg flex items-start gap-sm">
          <span className="text-brand mt-px shrink-0 text-body">→</span>
          <p className="text-label text-fg-muted leading-relaxed">
            To use a token, copy the <strong className="text-fg font-semibold">How to use</strong> string exactly
            and paste it into any CMS text field. When the page renders the token will be replaced by its value.
            Editing the value here updates every page that references the token — no page edits needed.
          </p>
        </div>

        {defined.length === 0 ? (
          <div className="border border-fg/10 rounded px-lg py-xl text-center">
            <p className="text-title font-semibold text-fg/40 mb-sm">No tokens defined</p>
            <p className="text-label text-fg-muted/60">
              Click <strong className="text-fg/60 font-medium">+ Add item</strong> under Token Definitions in the editor to add your first token.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-label">
              <thead>
                <tr className="border-b border-fg/10">
                  <th className="text-left py-sm pr-lg text-label uppercase tracking-label text-fg-muted/60 font-semibold w-1/4">
                    Token Key
                  </th>
                  <th className="text-left py-sm pr-lg text-label uppercase tracking-label text-fg-muted/60 font-semibold w-1/3">
                    How to use in content
                  </th>
                  <th className="text-left py-sm text-label uppercase tracking-label text-fg-muted/60 font-semibold">
                    Renders as
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fg/5" {...pa('tokens')}>
                {defined.map((token, i) => {
                  const key   = token.tokenKey?.trim() ?? ''
                  const value = token.tokenValue ?? ''
                  return (
                    <tr key={i} className="group">
                      <td className="py-sm pr-lg align-middle">
                        <span className="font-mono text-fg/80">{key}</span>
                      </td>
                      <td className="py-sm pr-lg align-middle">
                        <code className="bg-fg/8 border border-fg/12 px-2 py-0.5 rounded font-mono text-brand text-[0.8125rem]">
                          {`{{${key}}}`}
                        </code>
                      </td>
                      <td className="py-sm align-middle">
                        {value ? (
                          <span className="text-fg">{value}</span>
                        ) : (
                          <span className="text-fg-muted/40 italic">no value set</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Quick-reference */}
        {defined.length > 0 && (
          <div className="mt-xl pt-lg border-t border-fg/10">
            <p className="text-label uppercase tracking-label text-fg-muted/50 font-semibold mb-sm">
              Quick reference — copy any token string
            </p>
            <div className="flex flex-wrap gap-sm">
              {defined.map((token, i) => {
                const key = token.tokenKey?.trim() ?? ''
                return (
                  <div
                    key={i}
                    className="bg-surface border border-fg/10 rounded px-sm py-xs flex items-center gap-xs"
                  >
                    <code className="font-mono text-brand text-[0.8125rem]">{`{{${key}}}`}</code>
                    <span className="text-fg-muted/40">→</span>
                    <span className="text-fg-muted text-label truncate max-w-[180px]">
                      {token.tokenValue ?? <em>empty</em>}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
