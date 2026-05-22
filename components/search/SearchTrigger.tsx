'use client'

import { Search } from 'lucide-react'
import { useSearch } from './SearchProvider'

export default function SearchTrigger() {
  const { openSearch } = useSearch()

  return (
    <button
      type="button"
      onClick={openSearch}
      aria-label="Open search"
      className={[
        'flex items-center justify-center w-9 h-9',
        'text-fg-muted hover:text-fg',
        'transition-colors duration-150 ease-quick',
        'focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2',
      ].join(' ')}
    >
      <Search size={18} aria-hidden="true" />
    </button>
  )
}
