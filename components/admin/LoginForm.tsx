'use client'

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react'

export default function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get('from') ?? '/opti-admin'

  const usernameRef = useRef<HTMLInputElement>(null)
  const [showPass,  setShowPass]  = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [loading,   setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form     = e.currentTarget
    const username = (form.elements.namedItem('username') as HTMLInputElement).value.trim()
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    try {
      const res = await fetch('/api/opti-admin/auth', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, password }),
      })

      if (res.ok) {
        router.push(redirectTo)
        router.refresh()
        return
      }

      const data = await res.json() as { error?: string }
      setError(data.error ?? 'Something went wrong.')
    } catch {
      setError('Could not reach the server. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = [
    'w-full border border-fg/[0.12] bg-canvas px-md py-[10px]',
    'text-[0.9375rem] font-medium text-fg placeholder:text-fg-muted/40',
    'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20',
    'transition-[border-color,box-shadow] duration-150',
    'rounded-input',
  ].join(' ')

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-md">
      {/* Username */}
      <div className="flex flex-col gap-xs">
        <label
          htmlFor="username"
          className="text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-fg-muted"
        >
          Username
        </label>
        <input
          ref={usernameRef}
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          autoFocus
          required
          className={inputClass}
          placeholder="admin"
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-xs">
        <label
          htmlFor="password"
          className="text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-fg-muted"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPass ? 'text' : 'password'}
            autoComplete="current-password"
            required
            className={`${inputClass} pr-[44px]`}
            placeholder="••••••••"
          />
          <button
            type="button"
            aria-label={showPass ? 'Hide password' : 'Show password'}
            onClick={() => setShowPass(v => !v)}
            className="absolute right-[12px] top-1/2 -translate-y-1/2 text-fg-muted/50 hover:text-fg-muted transition-colors duration-150"
            tabIndex={-1}
          >
            {showPass
              ? <EyeOff size={16} strokeWidth={1.75} />
              : <Eye    size={16} strokeWidth={1.75} />
            }
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-sm px-md py-sm bg-fg/[0.04] border border-fg/[0.10] text-[0.8125rem] text-fg"
        >
          <AlertCircle size={14} strokeWidth={2} className="shrink-0 mt-[1px] text-fg-muted" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className={[
          'flex items-center justify-center gap-sm px-lg py-[11px]',
          'bg-brand text-fg-on-brand text-[0.8125rem] font-semibold uppercase tracking-[0.06em]',
          'hover:bg-brand-hover transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'mt-xs',
        ].join(' ')}
      >
        {loading ? 'Signing in…' : (
          <>
            Sign in
            <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  )
}
