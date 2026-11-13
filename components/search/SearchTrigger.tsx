'use client'

import { Search } from 'lucide-react'
import { useSearch } from './SearchProvider'
import { useTranslation } from '@/lib/i18n/useTranslation'

export default function SearchTrigger() {
  const { openSearch } = useSearch()
  const { t } = useTranslation()

  return (
    <button type="button" data-search-trigger onClick={openSearch} aria-label={t('search.trigger')}>
      <Search size={20} aria-hidden="true" />
    </button>
  )
}
