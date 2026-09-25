'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/components/ui/Button'
import { inputBase } from '@/components/forms/fieldStyles'
import { cn } from '@/lib/utils'
import { normalizeFormKey } from '@/lib/formKey'

const EXAMPLE_KEY = 'c8f200bda122468993b91aea1a19235f'

/**
 * Lets someone paste any published OptiFormsContainerData content key/GUID
 * and re-render this page with it, instead of the demo depending on one
 * hardcoded form that may not exist on every connected CMS instance.
 *
 * Validates client-side for immediate feedback only — `page.tsx` re-validates
 * the same way server-side before it ever reaches the Graph query, since a
 * URL query param is just as editable by hand as this input.
 */
export default function FormKeyLookup() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeKey = searchParams.get('formKey') ?? ''

  const [value, setValue] = useState(activeKey)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function navigate(key: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (key) params.set('formKey', key)
    else params.delete('formKey')
    const query = params.toString()
    startTransition(() => router.push(query ? `?${query}` : '?'))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) {
      setError(null)
      navigate(null)
      return
    }
    const normalized = normalizeFormKey(value)
    if (!normalized) {
      setError('Enter a valid content key — 32 hex characters, with or without dashes.')
      return
    }
    setError(null)
    navigate(normalized)
  }

  function handleClear() {
    setValue('')
    setError(null)
    navigate(null)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-xs max-w-144" noValidate>
      <label htmlFor="form-key-lookup" className="text-label font-medium text-fg-muted tracking-label uppercase">
        Form content key
      </label>
      <div className="flex flex-col sm:flex-row gap-sm">
        <input
          id="form-key-lookup"
          type="text"
          value={value}
          onChange={e => { setValue(e.target.value); setError(null) }}
          placeholder={`e.g. ${EXAMPLE_KEY}`}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'form-key-lookup-error' : undefined}
          className={cn(inputBase, 'font-mono text-[13px]')}
        />
        <div className="flex gap-sm shrink-0">
          <Button type="submit" variant="brand" size="sm" disabled={isPending}>
            Render form
          </Button>
          {activeKey && (
            <Button type="button" variant="ghost" size="sm" onClick={handleClear} disabled={isPending}>
              Clear
            </Button>
          )}
        </div>
      </div>
      {error && (
        <p id="form-key-lookup-error" role="alert" className="text-label text-[oklch(65%_0.2_25)]">
          {error}
        </p>
      )}
      <p className="text-label text-fg-muted/60">
        Find this on any Forms container in the CMS&rsquo;s content info panel — paste it with or without dashes.
      </p>
    </form>
  )
}
