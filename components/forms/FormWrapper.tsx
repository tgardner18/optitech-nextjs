'use client'
import type { ReactNode } from 'react'
import { useState } from 'react'

type Status = 'idle' | 'submitting' | 'submitted' | 'error'

type Props = {
  children: ReactNode
  title?: string
  description?: string
  submitUrl?: string
  confirmationMessage?: string
}

export default function FormWrapper({ children, title, description, submitUrl, confirmationMessage }: Props) {
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    try {
      if (submitUrl) {
        const res = await fetch(submitUrl, { method: 'POST', body: new FormData(e.currentTarget) })
        if (!res.ok) throw new Error('Submission failed')
      }
      setStatus('submitted')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'submitted') {
    return (
      <div className="py-xl">
        <p className="text-body leading-body text-fg">
          {confirmationMessage ?? 'Thank you. Your submission has been received.'}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {(title || description) && (
        <header className="mb-lg">
          {title && (
            <h2 className="text-title leading-title tracking-title font-semibold text-fg">{title}</h2>
          )}
          {description && (
            <p className="text-body text-fg-muted leading-body mt-2">{description}</p>
          )}
        </header>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <fieldset disabled={status === 'submitting'} className="contents">
          {children}
        </fieldset>
        {status === 'error' && (
          <p
            className="text-label tracking-label text-[oklch(65%_0.2_25)] mt-md"
            role="alert"
          >
            Submission failed — please try again.
          </p>
        )}
      </form>
    </div>
  )
}
