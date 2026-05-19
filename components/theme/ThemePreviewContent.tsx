import Image from 'next/image'

// ── Helpers ───────────────────────────────────────────────────────────────────

const LOGO_IMG_CLASS: Record<string, string> = {
  full:    'max-h-10 w-auto',
  icon:    'h-10 w-10 object-contain',
  compact: 'max-h-7 w-auto max-w-[160px]',
}

const LOGO_IMG_CLASS_SM: Record<string, string> = {
  full:    'max-h-9 w-auto',
  icon:    'h-9 w-9 object-contain',
  compact: 'max-h-6 w-auto max-w-[140px]',
}

type ColorField = { key: string; label: string; mode: 'dark' | 'light' | 'both' }

const COLOR_FIELDS: ColorField[] = [
  { key: 'colorBrand',        label: 'Brand',          mode: 'both'  },
  { key: 'colorBrandHover',   label: 'Brand Hover',    mode: 'both'  },
  { key: 'colorAccent',       label: 'Accent',         mode: 'both'  },
  { key: 'colorCanvas',       label: 'Canvas (dark)',  mode: 'dark'  },
  { key: 'colorSurface',      label: 'Surface (dark)', mode: 'dark'  },
  { key: 'colorCanvasLight',  label: 'Canvas (light)', mode: 'light' },
  { key: 'colorSurfaceLight', label: 'Surface (light)', mode: 'light' },
]

// Stock images from Unsplash — used in component previews
const CARD_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=70',
    alt: 'Earth city lights from orbit',
  },
  {
    src: 'https://images.unsplash.com/photo-1488229297570-58520851e868?auto=format&fit=crop&w=800&q=70',
    alt: 'Abstract data visualization',
  },
]

function SectionHead({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-lg pb-md border-b border-fg/10">
      <p className="text-label tracking-label uppercase text-fg-muted mb-xs font-semibold">{label}</p>
      <h2 className="text-headline font-bold leading-headline tracking-headline text-fg">{title}</h2>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ThemePreviewContent({ settings }: { settings: any }) {
  const logoSrc     = settings?.logo?.url?.default ?? '/brand/logo/OT.png'
  const logoAlt     = settings?.logoAlt ?? 'OptiTech'
  const logoFit     = (settings?.logoFit as string | undefined) ?? 'full'
  const invertDark  = settings?.logoInvertDark === true
  const ctaLabel    = settings?.ctaLabel ?? 'Get Started'
  const copyright   = settings?.copyright ?? `© ${new Date().getFullYear()} OptiTech. All rights reserved.`
  const defaultMode = (settings?.defaultMode as string | undefined) ?? 'dark'
  const brandColor  = settings?.colorBrand as string | undefined

  const navItems: { label: string; href: string }[] = settings?.primaryNavigation?.length
    ? settings.primaryNavigation.map((i: any) => ({ label: i.menuLink?.text ?? '', href: i.menuLink?.url?.default ?? '#' }))
    : [{ label: 'Product', href: '#' }, { label: 'Pricing', href: '#' }, { label: 'About', href: '#' }]

  const hasAnyColor = COLOR_FIELDS.some(f => !!settings?.[f.key])

  return (
    <>
      {/* ── 01 Logo Rendering ── */}
      <section id="logo" className="px-md py-xl lg:px-lg">
        <SectionHead label="01 · Theme" title="Logo Rendering" />

        <div className="space-y-lg">
          <div>
            <p className="text-label tracking-label uppercase text-fg-muted mb-md font-semibold">
              Header size — <code className="font-mono text-fg">logoFit: {logoFit}</code>
            </p>
            <div className="bg-canvas/80 border border-fg/10 px-md py-md flex items-center justify-between">
              <div className="flex items-center h-10">
                <Image
                  src={logoSrc}
                  alt={logoAlt}
                  width={200}
                  height={40}
                  className={LOGO_IMG_CLASS[logoFit] ?? LOGO_IMG_CLASS.full}
                  style={invertDark ? { filter: 'brightness(0) invert(1)' } : undefined}
                />
              </div>
              <div className="hidden sm:flex items-center gap-lg">
                {navItems.slice(0, 3).map(n => (
                  <span key={n.label} className="text-sm font-normal text-fg-muted">{n.label}</span>
                ))}
              </div>
              <span className="bg-brand text-fg-on-brand text-label font-semibold tracking-label uppercase px-7 py-3">
                {ctaLabel}
              </span>
            </div>
          </div>

          <div>
            <p className="text-label tracking-label uppercase text-fg-muted mb-md font-semibold">Footer size</p>
            <div className="bg-canvas border border-fg/10 px-md py-lg flex items-start justify-between gap-lg">
              <div className="flex items-center h-9">
                <Image
                  src={logoSrc}
                  alt={logoAlt}
                  width={200}
                  height={40}
                  className={LOGO_IMG_CLASS_SM[logoFit] ?? LOGO_IMG_CLASS_SM.full}
                  style={invertDark ? { filter: 'brightness(0) invert(1)' } : undefined}
                />
              </div>
              <p className="text-label tracking-label uppercase text-fg-muted self-end">{copyright}</p>
            </div>
          </div>

          <div>
            <p className="text-label tracking-label uppercase text-fg-muted mb-md font-semibold">
              All logo fit options — same image
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
              {(['full', 'icon', 'compact'] as const).map(fit => (
                <div key={fit} className="bg-surface border border-fg/10 p-md">
                  <p className="text-label tracking-label uppercase font-semibold text-brand mb-md">
                    {fit}{fit === logoFit ? ' · active' : ''}
                  </p>
                  <div className="flex items-center h-10 mb-sm">
                    <Image
                      src={logoSrc}
                      alt={logoAlt}
                      width={200}
                      height={40}
                      className={LOGO_IMG_CLASS[fit]}
                      style={invertDark ? { filter: 'brightness(0) invert(1)' } : undefined}
                    />
                  </div>
                  <p className="font-mono text-label text-fg-muted/60">{LOGO_IMG_CLASS[fit]}</p>
                </div>
              ))}
            </div>
          </div>

          {invertDark && (
            <div>
              <p className="text-label tracking-label uppercase text-fg-muted mb-md font-semibold">
                Dark-mode invert — active
              </p>
              <div className="grid grid-cols-2 gap-md">
                <div className="p-md flex flex-col gap-md" style={{ background: 'oklch(12% 0.012 195)' }}>
                  <p className="text-label tracking-label uppercase font-semibold" style={{ color: 'oklch(68% 0.06 195)' }}>Dark mode — filter applied</p>
                  <Image src={logoSrc} alt={logoAlt} width={200} height={40}
                    className={LOGO_IMG_CLASS[logoFit] ?? LOGO_IMG_CLASS.full}
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                </div>
                <div className="p-md flex flex-col gap-md" style={{ background: 'oklch(97% 0.005 195)' }}>
                  <p className="text-label tracking-label uppercase font-semibold" style={{ color: 'oklch(38% 0.05 195)' }}>Light mode — no filter</p>
                  <Image src={logoSrc} alt={logoAlt} width={200} height={40}
                    className={LOGO_IMG_CLASS[logoFit] ?? LOGO_IMG_CLASS.full}
                    style={{ filter: 'none' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 02 Color Theme ── */}
      <section id="colors" className="px-md py-xl lg:px-lg">
        <SectionHead label="02 · Theme" title="Color Theme" />

        {!hasAnyColor ? (
          <div className="bg-surface border border-fg/10 px-md py-lg">
            <p className="text-body text-fg-muted">
              No color overrides are set. Using default OptiTech design tokens.
            </p>
            <p className="text-label text-fg-muted/60 mt-sm font-mono">styles/tokens.css</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-lg">
            {COLOR_FIELDS.map(f => {
              const value = settings?.[f.key] as string | undefined
              if (!value) return null
              return (
                <div key={f.key}>
                  <div className="h-16 w-full border border-fg/10" style={{ background: value }} />
                  <div className="mt-sm space-y-xs">
                    <div className="flex items-center gap-sm flex-wrap">
                      <p className="text-title font-semibold leading-title text-fg">{f.label}</p>
                      <span className="text-label tracking-label uppercase font-semibold text-fg-muted/50">{f.mode}</span>
                    </div>
                    <p className="font-mono text-label text-fg-muted">{value}</p>
                    <p className="font-mono text-label text-fg-muted/50">{f.key}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── 03 CTA Button ── */}
      <section id="cta" className="px-md py-xl lg:px-lg">
        <SectionHead label="03 · Theme" title="CTA Button" />
        <div className="flex flex-wrap items-center gap-lg">
          <div className="flex flex-col gap-sm items-start">
            <span className="bg-brand hover:bg-brand-hover text-fg-on-brand text-label font-semibold tracking-label uppercase px-12 py-4 transition-colors duration-150 ease-quick">
              {ctaLabel}
            </span>
            <p className="text-label text-fg-muted">Primary · Canvas surface</p>
          </div>
          <div className="bg-brand p-lg flex flex-col gap-sm items-start">
            <span className="bg-brand-hover text-fg-on-brand text-label font-semibold tracking-label uppercase px-12 py-4 transition-colors duration-150 ease-quick">
              {ctaLabel}
            </span>
            <p className="text-label text-fg-on-brand/60">Primary · Brand surface</p>
          </div>
        </div>
      </section>

      {/* ── 04 Component Preview ── */}
      <section id="components" className="px-md py-xl lg:px-lg">
        <SectionHead label="04 · Theme" title="Component Preview" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">

          {/* Card — image + body */}
          <div className="bg-surface border border-fg/10 flex flex-col">
            <div className="aspect-video relative overflow-hidden">
              <Image
                src={CARD_IMAGES[0].src}
                alt={CARD_IMAGES[0].alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
            <div className="p-md flex flex-col gap-sm flex-1">
              <p className="text-label tracking-label uppercase text-brand font-semibold">Product</p>
              <h3 className="text-title font-semibold leading-title text-fg">
                Intelligent Optimization at Scale
              </h3>
              <p className="text-sm text-fg-muted leading-body">
                Our platform adapts to your traffic patterns in real time, delivering personalized experiences without engineering overhead.
              </p>
              <span className="mt-sm self-start bg-brand text-fg-on-brand text-label font-semibold tracking-label uppercase px-7 py-3">
                {ctaLabel}
              </span>
            </div>
          </div>

          {/* Card — image + feature */}
          <div className="bg-surface border border-fg/10 flex flex-col">
            <div className="aspect-video relative overflow-hidden">
              <Image
                src={CARD_IMAGES[1].src}
                alt={CARD_IMAGES[1].alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
            <div className="p-md flex flex-col gap-sm flex-1">
              <div className="w-10 h-10 bg-accent/20 border border-accent/30 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent" aria-hidden="true">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 className="text-title font-semibold leading-title text-fg mt-sm">
                Built for Enterprise Teams
              </h3>
              <p className="text-sm text-fg-muted leading-body">
                Role-based access, audit logs, SSO, and SLA-backed uptime — everything your security and compliance teams require.
              </p>
            </div>
            <div className="border-t border-fg/10 px-md py-sm flex items-center justify-between">
              <p className="text-label text-fg-muted">Enterprise tier</p>
              <span className="text-label font-semibold text-accent tracking-label uppercase">Learn more →</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── 05 Default Mode ── */}
      <section id="mode" className="px-md py-xl lg:px-lg">
        <SectionHead label="05 · Theme" title="Default Theme Mode" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
          {(['dark', 'light'] as const).map(mode => {
            const isActive = defaultMode === mode
            const bg   = mode === 'dark'  ? 'oklch(12% 0.012 195)'  : 'oklch(97% 0.005 195)'
            const fg   = mode === 'dark'  ? 'oklch(97% 0.005 195)'  : 'oklch(12% 0.012 195)'
            const sub  = mode === 'dark'  ? 'oklch(68% 0.06 195)'   : 'oklch(38% 0.05 195)'
            const surf = mode === 'dark'  ? 'oklch(20% 0.022 195)'  : 'oklch(93% 0.008 195)'
            // Use the configured brand color for the button; fall back to the default teal
            const btnBg = brandColor ?? 'oklch(55% 0.18 195)'
            return (
              <div key={mode} className={`border-2 ${isActive ? 'border-brand' : 'border-fg/10'}`}>
                {isActive && (
                  <div className="bg-brand px-md py-xs">
                    <p className="text-label tracking-label uppercase font-semibold text-fg-on-brand">Active default</p>
                  </div>
                )}
                <div className="p-md" style={{ background: bg }}>
                  <div className="flex items-center justify-between mb-md" style={{ background: surf, padding: '8px 12px' }}>
                    <span className="text-label font-semibold" style={{ color: fg }}>OptiTech</span>
                    <span className="text-label font-semibold tracking-label uppercase" style={{ background: btnBg, color: fg, padding: '2px 10px' }}>
                      {ctaLabel}
                    </span>
                  </div>
                  <div style={{ background: surf, padding: '16px', marginBottom: '8px' }}>
                    <p className="text-label tracking-label uppercase font-semibold mb-xs" style={{ color: btnBg }}>Hero</p>
                    <p className="font-bold" style={{ color: fg, fontSize: '1.25rem' }}>Your headline goes here</p>
                    <p className="text-sm mt-xs" style={{ color: sub }}>Supporting body copy that adapts to the active mode.</p>
                  </div>
                  <p className="text-label text-center capitalize" style={{ color: sub }}>{mode} mode</p>
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-label text-fg-muted mt-md">
          Users can override this with the toggle in the header — their preference is stored in localStorage.
        </p>
      </section>
    </>
  )
}
