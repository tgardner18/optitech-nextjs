import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteSettings, getRequestDomain, getRequestLocale } from '@/lib/optimizely'
import { SectionLabel } from '../components'
import ThemePreviewContent from '@/components/theme/ThemePreviewContent'
import ThemeAxesPreview from '@/components/theme/ThemeAxesPreview'

export const metadata: Metadata = {
  title: 'Theme Preview — Design System — OptiTech',
}

export default async function ThemePreviewPage() {
  const settings = await getSiteSettings(await getRequestDomain(), await getRequestLocale())

  return (
    <>
      <ThemePreviewContent settings={settings} />

      <ThemeAxesPreview
        activeCorner={settings?.cornerStyle}
        activeFont={settings?.displayFont}
        activeMotion={settings?.motionIntensity}
      />

      {/* ── Link to CMS ── */}
      <section className="px-md py-xl lg:px-lg">
        <div className="bg-surface border border-fg/10 px-md py-lg flex flex-col gap-sm">
          <p className="text-label tracking-label uppercase text-fg-muted font-semibold">
            Edit these settings
          </p>
          <p className="text-sm text-fg-muted leading-body">
            Open the Optimizely CMS and navigate to Shared Content → Theme Manager.
            Changes publish instantly; refresh this page to see updates.
          </p>
        </div>
      </section>
    </>
  )
}
