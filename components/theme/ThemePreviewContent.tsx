import Image from 'next/image'
import BannerBlock from '@/components/blocks/BannerBlock'
import HeroBlock from '@/components/blocks/HeroBlock'
import Button from '@/components/ui/Button'
import Footer from '@/components/layout/Footer'
import ThemeChecks from '@/components/theme/ThemeChecks'
import { getFooterStyles } from '@/cms/styling/OT_FooterBlock.styling'
import {
  CORNER_STYLES, PRIMARY_FONTS, MOTION_INTENSITIES, resolveNavbarStyle,
} from '@/lib/theme-axes'

// The Theme Manager's CMS preview body (editor-only). Visuals: components/theme/theme-preview.css,
// keyed on data-block="theme-preview" / data-part. The footer is the real Footer component, rendered
// with the draft settings; the header is a static stand-in (the real one needs request context).

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// [token, label, field key, mode-specific field suffix]
const MODE_TOKENS = [
  ['canvas', 'Canvas', 'colorCanvas'],
  ['surface', 'Surface', 'colorSurface'],
  ['fg', 'Foreground', 'colorFg'],
  ['fg-muted', 'Foreground Muted', 'colorFgMuted'],
] as const

const SHARED_TOKENS = [
  ['brand', 'Brand', 'colorBrand'],
  ['brand-hover', 'Brand Hover', 'colorBrandHover'],
  ['accent', 'Accent', 'colorAccent'],
  ['accent-hover', 'Accent Hover', 'colorAccentHover'],
  ['fg-on-brand', 'On Brand', 'colorFgOnBrand'],
  ['fg-on-accent', 'On Accent', 'colorFgOnAccent'],
] as const

// [label, foreground token, background token, minimum ratio]
const CHECKS = [
  ['Body text on canvas', 'var(--ot-fg)', 'var(--ot-canvas)'],
  ['Muted text on canvas', 'var(--ot-fg-muted)', 'var(--ot-canvas)'],
  ['Muted text on surface', 'var(--ot-fg-muted)', 'var(--ot-surface)'],
  ['Text on Brand fills', 'var(--ot-fg-on-brand)', 'var(--ot-brand)'],
  ['Text on Accent fills', 'var(--ot-fg-on-accent)', 'var(--ot-accent)'],
  ['Brand as link text', 'var(--ot-brand-text, var(--ot-brand))', 'var(--ot-canvas)'],
  ['Accent as text', 'var(--ot-accent)', 'var(--ot-canvas)'],
] as const

function Swatch({ token, label, value, tag }: { token: string; label: string; value?: string; tag: 'Set' | 'Default' }) {
  return (
    <li data-part="sw">
      <span data-part="sw-chip" style={{ background: `var(--ot-${token})` }} />
      <span data-part="sw-t"><b>{label}</b><code>{value ?? 'token default'}</code></span>
      <span data-part="tag" data-tag={tag.toLowerCase()}>{tag}</span>
    </li>
  )
}

function ModePanel({ mode, settings, isDefault }: { mode: 'light' | 'dark'; settings: any; isDefault: boolean }) {
  const sfx = mode === 'light' ? 'Light' : ''
  return (
    <div data-part="mode" data-theme={mode}>
      <p data-part="mode-t">{cap(mode)} mode{isDefault && <span>Default</span>}</p>
      <ul data-part="sws">
        {MODE_TOKENS.map(([token, label, key]) => {
          const v = settings?.[key + sfx] as string | undefined
          return <Swatch key={token} token={token} label={label} value={v} tag={v ? 'Set' : 'Default'} />
        })}
      </ul>
      <ul data-part="checks">
        {CHECKS.map(([label, fg, bg]) => (
          <li key={label} data-part="check" data-min="4.5" data-label={label} data-mode={mode}>
            <span data-part="probe" style={{ color: fg, background: bg }}>Aa</span>
            <span data-part="check-t">{label}</span>
            <span data-part="ratio" />
            <span data-part="verdict" />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function ThemePreviewContent({
  settings, footerBlock, rootId,
}: { settings: any; footerBlock?: unknown; rootId: string }) {
  const siteName    = (settings?.siteName as string | undefined) ?? 'Site Accelerator'
  const logoSrc     = (settings?.logo?.url?.default as string | undefined) ?? '/brand/logo/OT.png'
  const logoAlt     = settings?.logoAlt ?? siteName
  const invertDark  = settings?.logoInvertDark === true
  const ctaLabel    = (settings?.ctaLabel as string | undefined) ?? 'Get Started'
  const mode        = ((settings?.defaultMode as string | undefined) === 'light' ? 'light' : 'dark') as 'light' | 'dark'

  const navItems: string[] = settings?.primaryNavigation?.length
    ? (settings.primaryNavigation as any[]).map(i => i.menuLink?.text ?? '').filter(Boolean)
    : ['Product', 'Pricing', 'About']

  const corner   = (settings?.cornerStyle as keyof typeof CORNER_STYLES | undefined) ?? 'sharp'
  const fontKey  = (settings?.primaryFont as keyof typeof PRIMARY_FONTS | undefined) ?? 'poppins'
  const motion   = (settings?.motionIntensity as keyof typeof MOTION_INTENSITIES | undefined) ?? 'default'
  const motionScale = MOTION_INTENSITIES[motion] ?? 1
  const fontLabel = (PRIMARY_FONTS[fontKey]?.label ?? 'Poppins').replace(' (default)', '')
  const { style: footerStyle, background: footerBg } = getFooterStyles(footerBlock as Record<string, unknown> | undefined)
  const footerLabel = footerBlock ? `${cap(footerStyle)} on ${cap(footerBg)}` : 'None assigned'
  const navStyle = resolveNavbarStyle(settings?.navbarStyle)
  const half = Math.ceil(Math.min(navItems.length, 6) / 2)
  const leftNav = navItems.slice(0, half)
  const rightNav = navItems.slice(half, 6)
  const navLabel = cap(resolveNavbarStyle(settings?.navbarStyle)).replace('-b', ' B')

  const sample = 'Build experiences that adapt'
  const hostLabel = (settings?.frontEndDomain as string | undefined) ?? 'your-site.example'

  return (
    <div data-block="theme-preview" data-theme={mode}>
      <ThemeChecks rootId={rootId} />

      <header data-part="top">
        <div>
          <p data-part="kicker">Theme Manager preview · draft</p>
          <h1>{siteName}</h1>
          <p data-part="lede">Everything below uses the colors and settings saved on this Theme Manager, including values that aren’t published yet. Save in the editor to refresh.</p>
        </div>
        <ul data-part="facts">
          <li><span>Default mode</span><b>{cap(mode)}</b></li>
          <li><span>Corner Style</span><b>{cap(corner)}</b></li>
          <li><span>Primary Font</span><b>{fontLabel}</b></li>
          <li><span>Motion</span><b>{cap(motion)}</b></li>
          <li><span>Navbar Style</span><b>{navLabel}</b></li>
          <li><span>Footer</span><b>{footerLabel}</b></li>
        </ul>
        <nav data-part="jump" aria-label="Preview sections">
          <a href="#tp-chrome">Site chrome</a><a href="#tp-colors">Colors and contrast</a>
          <a href="#tp-shape">Type, corners, and motion</a><a href="#tp-comp">Components</a><a href="#tp-logo">Logo</a>
        </nav>
      </header>

      <p data-part="alert" role="status" hidden>
        <b data-part="alert-n" /> <span data-part="alert-list" /> See Colors and contrast.
      </p>

      <section data-part="sec" id="tp-chrome">
        <h2>Site chrome</h2>
        <p data-part="sub">The header and footer as visitors see them, with this theme’s colors. The footer is the one assigned in Footer.</p>
        <div data-part="browser" data-theme={mode}>
          <div data-part="bar-dots" aria-hidden="true"><i /><i /><i /><span>{hostLabel}</span></div>
          <div data-part="frame" data-nav={navStyle}>
            <div data-part="hdr">
              {navStyle === 'split-bar' && <ul data-part="wing">{leftNav.map((n, i) => <li key={n} data-on={i === 0 ? '' : undefined}>{n}</li>)}</ul>}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} alt={logoAlt} data-invert={invertDark && mode === 'dark' ? '' : undefined} />
              <ul data-part={navStyle === 'split-bar' ? 'wing' : 'links'}>
                {(navStyle === 'split-bar' ? rightNav : navItems.slice(0, 6)).map((n, i) => <li key={n} data-on={navStyle !== 'split-bar' && i === 0 ? '' : undefined}>{n}</li>)}
              </ul>
              <span data-part="btn" data-v="brand" data-size="sm">{ctaLabel}</span>
            </div>
            <div data-part="page">
              <div data-part="hero">
                <p data-part="eyebrow">Platform</p>
                <p data-part="h">{sample}</p>
                <p data-part="p">Supporting copy in the muted text color, so a weak muted color shows up here first.</p>
              </div>
              <Footer settings={settings} footerBlock={footerBlock} />
            </div>
          </div>
        </div>
      </section>

      <section data-part="sec" id="tp-colors">
        <h2>Colors and contrast</h2>
        <p data-part="sub">Both modes side by side, with every color field (set or default) and the checks that matter for reading. Text needs 4.5:1.</p>
        <ul data-part="shared">
          {SHARED_TOKENS.map(([token, label, key]) => {
            const v = settings?.[key] as string | undefined
            return <Swatch key={token} token={token} label={label} value={v} tag={v ? 'Set' : 'Default'} />
          })}
        </ul>
        <div data-part="modes">
          <ModePanel mode="light" settings={settings} isDefault={mode === 'light'} />
          <ModePanel mode="dark" settings={settings} isDefault={mode === 'dark'} />
        </div>
      </section>

      <section data-part="sec" id="tp-shape">
        <h2>Type, corners, and motion</h2>
        <p data-part="sub">The three theme axes, plus the type scale in the Primary Font.</p>
        <div data-part="spec">
          <p data-s="display">{sample}</p>
          <p data-s="headline">Headline · Find the plan that fits</p>
          <p data-s="title">Title · Questions customers ask</p>
          <p data-s="body">Body · Earn more from every visit with personalized, tested experiences across every channel.</p>
          <p data-s="label">Label · Updated weekly</p>
        </div>
        <div data-part="axes">
          {(Object.keys(CORNER_STYLES) as (keyof typeof CORNER_STYLES)[]).map(c => (
            <div key={c} data-part="corner" data-on={corner === c ? '' : undefined}
              style={{ ['--r-s' as string]: CORNER_STYLES[c].surface, ['--r-c' as string]: CORNER_STYLES[c].control }}>
              <p>{cap(c)}{corner === c && <span>Active</span>}</p>
              <div data-part="mini"><i /><b>{ctaLabel}</b></div>
              <small>{CORNER_STYLES[c].surface} surface · {CORNER_STYLES[c].control} control</small>
            </div>
          ))}
          <div data-part="motion" style={{ ['--scale' as string]: motionScale }}>
            <p>Motion Intensity: {cap(motion)}<span>{motionScale}× duration</span></p>
            <div data-part="track"><i /></div>
            <small>Visitors who ask for reduced motion always get still.</small>
          </div>
        </div>
      </section>

      <section data-part="sec" id="tp-comp">
        <h2>Components</h2>
        <p data-part="sub">Your Button, Hero, and Banner blocks (the most used), rendered by the real components with this theme.</p>
        <div data-part="comp">
          <div data-part="btns">
            <Button variant="brand">{ctaLabel}</Button>
            <Button variant="accent">Learn more</Button>
          </div>
          <div data-part="btns" data-surface="dark">
            <Button variant="accent">{ctaLabel}</Button>
            <Button variant="ghost">Contact us</Button>
          </div>
        </div>
        <div data-part="blocks">
          <div data-part="blk">
            <p data-part="blk-t">Hero · Brand</p>
            <div data-part="blk-frame">
              <HeroBlock
                eyebrow="Platform"
                headline="Build experiences that adapt"
                body="A hero as visitors meet it: headline, supporting copy, and two calls to action, in this theme's colors and type."
                primaryCta={{ label: ctaLabel, href: '#' }}
                secondaryCta={{ label: 'Learn more', href: '#' }}
                visual={<div data-part="art" aria-hidden="true" />}
                styleOptions={{ direction: 'editorialSplit', layout: 'imageRight', color: 'brand', animation: 'none' }}
              />
            </div>
          </div>
          <div data-part="blk">
            <p data-part="blk-t">Banner · Brand</p>
            <div data-part="blk-frame">
              <BannerBlock
                eyebrow="Now Available"
                heading="Optimize Every Visitor Experience"
                primaryCta={{ label: ctaLabel, href: '#' }}
                secondaryCta={{ label: 'Learn More', href: '#' }}
                styleOptions={{ color: 'brand', alignment: 'center', size: 'compact' }}
              />
            </div>
          </div>
        </div>
      </section>

      <section data-part="sec" id="tp-logo">
        <h2>Logo</h2>
        <p data-part="sub">At the sizes the header and footer use, on this theme’s own light and dark canvases.</p>
        <div data-part="logos">
          <div data-theme="light"><p>Light canvas</p>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={logoSrc} alt="" style={{ height: 40 }} /></div>
          <div data-theme="dark"><p>Dark canvas{invertDark ? ' · Invert Logo in Dark Mode is on' : ''}</p>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={logoSrc} alt="" style={{ height: 40 }} data-invert={invertDark ? '' : undefined} /></div>
        </div>
      </section>
    </div>
  )
}
