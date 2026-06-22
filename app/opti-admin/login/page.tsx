import { Suspense } from 'react'
import { Settings2 } from 'lucide-react'
import type { Metadata } from 'next'
import LoginForm from '@/components/admin/LoginForm'

export const metadata: Metadata = { title: 'Sign In — Accelerator Admin' }

// LoginForm uses useSearchParams, which requires Suspense wrapping
// to satisfy Next.js's static rendering constraints.
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-md py-xl">
      <div className="w-full max-w-[360px]">
        {/* Brand mark */}
        <div className="flex items-center gap-sm mb-xl">
          <div className="w-8 h-8 bg-brand flex items-center justify-center shrink-0">
            <Settings2 size={16} strokeWidth={2} className="text-fg-on-brand" aria-hidden="true" />
          </div>
          <div className="leading-none">
            <span className="text-[0.875rem] font-semibold tracking-[0.04em] uppercase text-fg">Opti</span>
            <span className="text-[0.875rem] font-semibold tracking-[0.04em] uppercase text-brand">Admin</span>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-xl">
          <h1 className="text-[1.375rem] font-semibold text-fg tracking-[-0.01em] leading-tight">
            Admin Access
          </h1>
          <p className="text-[0.875rem] text-fg-muted mt-xs leading-relaxed">
            Sign in to manage your Optimizely CMS content and reports.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-fg/[0.08] mb-xl" />

        {/* Form */}
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
