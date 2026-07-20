import 'server-only'
import { getRequestLocale, getRequestDomain } from '@/lib/optimizely'
import { getTokenMap, applyTokensToContent } from '@/lib/tokens'

type AnyAdapter = (props: any) => any

function wrapWithTokens(Adapter: AnyAdapter): AnyAdapter {
  return async function TokenAwareAdapter(props: any) {
    const locale = await getRequestLocale()
    const domain = await getRequestDomain()
    const tokens = await getTokenMap(locale, domain)
    // Fast path: no tokens defined — skip the deep-replace entirely.
    if (!Object.keys(tokens).length) return Adapter(props)
    const content = props.content != null
      ? applyTokensToContent(props.content, tokens)
      : props.content
    return Adapter({ ...props, content })
  }
}

/**
 * Wrap every adapter in a registry resolver map so {{token-key}} placeholders
 * are replaced before each adapter receives its content prop.
 *
 * getTokenMap() is React-cached — all adapters in a single request share
 * one Graph fetch regardless of how many components render on the page.
 */
export function createTokenAwareResolver(
  resolver: Record<string, AnyAdapter>
): Record<string, AnyAdapter> {
  return Object.fromEntries(
    Object.entries(resolver).map(([key, Adapter]) => [key, wrapWithTokens(Adapter)])
  )
}
