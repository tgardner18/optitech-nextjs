// Pure token-replacement utilities — no server-only imports.
// Safe to import from both server and client components.

export type TokenMap = Record<string, string>

/**
 * Replace all {{key}} occurrences in `text` with their values from `tokens`.
 * Unmatched tokens are left as-is so authors can spot typos.
 */
export function replaceTokens(text: string, tokens: TokenMap): string {
  if (!text || !Object.keys(tokens).length) return text
  return text.replace(/\{\{([^}]+)\}\}/g, (match, raw) => {
    const k = raw.trim()
    return Object.prototype.hasOwnProperty.call(tokens, k) ? tokens[k] : match
  })
}

/**
 * Walk a plain content object and replace token placeholders in every
 * string value (recursive — handles nested objects and arrays).
 * Safe to call with null / undefined — returns the value unchanged.
 */
export function applyTokensToContent<T>(content: T, tokens: TokenMap): T {
  if (!content || !Object.keys(tokens).length) return content
  return deepReplace(content, tokens) as T
}

function deepReplace(value: unknown, tokens: TokenMap): unknown {
  if (typeof value === 'string') return replaceTokens(value, tokens)
  if (Array.isArray(value))     return value.map(v => deepReplace(v, tokens))
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = deepReplace(v, tokens)
    }
    return out
  }
  return value
}
