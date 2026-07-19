'use client'

import { createContext, useContext } from 'react'
import type { TokenMap } from '@/lib/token-replace'
import { replaceTokens } from '@/lib/token-replace'

const TokenContext = createContext<TokenMap>({})

export function useTokens(): TokenMap {
  return useContext(TokenContext)
}

/**
 * Returns a stable replace function bound to the current token map.
 * Call replaceTokens(text) in any client component to substitute {{key}} placeholders.
 */
export function useReplaceTokens(): (text: string) => string {
  const tokens = useTokens()
  return (text: string) => replaceTokens(text, tokens)
}

interface Props {
  tokens: TokenMap
  children: React.ReactNode
}

/**
 * Provides the site token map to client components.
 * Place this in the root layout after fetching tokens server-side.
 */
export function TokenProvider({ tokens, children }: Props) {
  return (
    <TokenContext.Provider value={tokens}>
      {children}
    </TokenContext.Provider>
  )
}
