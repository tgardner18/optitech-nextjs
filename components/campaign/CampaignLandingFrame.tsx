import type { CSSProperties, ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import Footer from '@/components/layout/Footer'
import { LogoImage } from '@/components/layout/LogoImage'
import { LocaleSelector } from '@/components/layout/LocaleSelector'
import { getEnabledLanguages } from '@/lib/i18n/getEnabledLanguages'
import OptiFormsContainerDataAdapter from '@/cms/components/OptiFormsContainerData'
import CampaignAtmosphere from '@/components/campaign/CampaignAtmosphere'
import CampaignMobileBar from '@/components/campaign/CampaignMobileBar'
import CampaignMotionToggle from '@/components/campaign/CampaignMotionToggle'
import { getCampaignFooter } from '@/lib/campaignLanding'
import { resolveCampaignAppearance } from '@/lib/campaign-looks'
import { getRequestDomain, getSiteSettings } from '@/lib/optimizely'
import { localizedHref, type Locale } from '@/lib/i18n/config'
import { t } from '@/lib/i18n/t'
import './campaign-looks.css'

type Props = {
  locale:          Locale
  /** campaignLook select: blueprint | neon | comic | stage. Unknown values fall back to Blueprint. */
  look?:           string | null
  /** Optional hex that replaces the site brand colour as the look's seed. */
  accentOverride?: string | null
  /** motionLevel select: full | calm | still. */
  motionLevel?:    string | null
  ctaLabel?:       string | null
  ctaUrl?:         string | null
  returnLabel?:    string | null
  footerKey?:      string | null
  formKey?:        string | null
  formHeading?:    string | null
  /** Alternative to formKey: render this in the locked form section (used by the demo route). */
  formSlot?:       ReactNode
  /** The editor's Visual Builder composition. */
  children:        ReactNode
}

const FORM_ID = 'request-information'

/**
 * Frame for OT_CampaignLandingPage. The site shell is switched off for this type
 * (lib/shellMode.ts), so the page owns its whole viewport: a slim sticky strip, the
 * look's atmosphere, the editor's free composition, a locked conversion form and a
 * footer chosen on the page.
 *
 * The frame resolves the editor's look + the site's colours into a handful of
 * attributes (see lib/campaign-looks.ts) and every visual decision is made in
 * campaign-looks.css, so a page can wear a different identity from the rest of the
 * site while still being built from that site's own colours. The strip is not site
 * navigation: its only exits are the return link and the campaign's call to action.
 */
export default async function CampaignLandingFrame({
  locale, look, accentOverride, motionLevel, ctaLabel, ctaUrl, returnLabel, footerKey, formKey, formHeading, formSlot, children,
}: Props) {
  const [settings, footerBlock, enabledLocales] = await Promise.all([
    getRequestDomain().then(d => getSiteSettings(d, locale)),
    footerKey ? getCampaignFooter(footerKey, locale) : Promise.resolve(null),
    getEnabledLanguages(),
  ])

  const appearance = resolveCampaignAppearance({
    look,
    motion:         motionLevel,
    accentOverride,
    siteAccent:     settings?.colorAccent as string | undefined,
    siteBrand:      settings?.colorBrand as string | undefined,
  })

  const siteName    = (settings?.siteName as string | undefined) ?? ''
  const logoSrc     = settings?.logo?.url?.default as string | undefined
  const logoAlt     = (settings?.logoAlt as string | undefined) ?? siteName
  const logoInvert  = settings?.logoInvertDark === true
  const homeHref    = localizedHref('/', locale)
  const returnText  = returnLabel || t(locale, 'campaignLanding.returnToSite')
  const showCta     = !!(ctaLabel && ctaUrl)
  const hasForm     = !!(formKey || formSlot)
  // Logos are authored for the site's dark mode; they only need inverting on dark looks.
  const invertLogo  = logoInvert && appearance.theme === 'dark'

  // A plain anchor (full page load), not <Link>: leaving the standalone shell must
  // re-render the site layout so the header and footer come back.
  const renderReturnLink = (collapseOnPhones: boolean) => (
    <a
      href={homeHref}
      className="group inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-xs whitespace-nowrap rounded-ot-control text-[0.8125rem] sm:justify-start sm:text-label font-semibold uppercase tracking-label text-fg-muted transition-colors duration-200 ease-quick hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <ArrowLeft aria-hidden className="size-4 transition-transform duration-200 ease-quick group-hover:-translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
      {/* Below ~430px the strip also holds the language picker and the CTA, so the label
          collapses to the arrow (the footer shows the full label). Name stays accessible. */}
      <span className={collapseOnPhones ? 'sr-only min-[430px]:not-sr-only' : undefined}>
        {returnLabel ? returnText : (
          <>
            <span className="sm:hidden">{t(locale, 'campaignLanding.returnShort')}</span>
            <span className="hidden sm:inline">{returnText}</span>
          </>
        )}
      </span>
    </a>
  )

  return (
    // `contents` wrapper above the look scope: freezes the SITE's accent and brand before any look
    // re-points --ot-accent (see lib/campaign-looks.ts).
    <div className="contents" style={{ '--cl-site-accent': 'var(--ot-accent)', '--cl-site-brand': 'var(--ot-brand)' } as CSSProperties}>
    <div
      data-theme={appearance.theme}
      data-look={appearance.look}
      data-motion={appearance.motion}
      data-ot-standalone
      style={{ '--cl-seed': appearance.seed, '--cl-seed-2': appearance.seed2 } as CSSProperties}
      className="ot-campaign ot-campaign-frame flex min-h-dvh flex-col overflow-x-clip bg-canvas text-fg"
    >
      <header
        aria-label={t(locale, 'campaignLanding.strip')}
        className="ot-cl-strip sticky top-0 z-40"
      >
        <div className="mx-auto flex h-[var(--ot-site-header-h)] max-w-[90rem] items-center justify-between gap-md px-md lg:px-xl">
          <div className="flex min-w-0 items-center gap-md">
            {renderReturnLink(true)}
            {logoSrc && (
              <>
                <span aria-hidden className="hidden h-5 w-px bg-fg/20 sm:block" />
                {/* Decorative here: the strip is not navigation, so the mark is not a link. */}
                <LogoImage
                  src={logoSrc}
                  alt={logoAlt}
                  containerClass="ot-cl-logo hidden h-7 max-w-[160px] flex-shrink-0 sm:block"
                  imgClass={['h-full w-auto max-w-full object-contain object-left', invertLogo ? 'logo-invert-dark' : ''].filter(Boolean).join(' ')}
                />
              </>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-md">
            {/* Only the looks that move without end get the control (WCAG 2.2.2). */}
            {(appearance.look === 'neon' || appearance.look === 'stage') && appearance.motion !== 'still' && (
              <CampaignMotionToggle pauseLabel={t(locale, 'campaignLanding.pauseMotion')} playLabel={t(locale, 'campaignLanding.playMotion')} />
            )}
            {/* Same picker as the site header; renders nothing when only one language is enabled. */}
            <LocaleSelector enabledLocales={enabledLocales} />
            {showCta && (
              <Button variant="accent" size="sm" href={ctaUrl!} className="max-md:hidden shrink-0 whitespace-nowrap !px-md md:!px-7 !text-label">
                {ctaLabel}
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="ot-campaign-stage">
        <CampaignAtmosphere look={appearance.look} />
        <div className="ot-campaign-body">
          {children}

          {hasForm && (
            // Anchor target for the strip button (#request-information); scroll-mt clears the sticky strip.
            <section id={FORM_ID} aria-label={formHeading || t(locale, 'campaignLanding.formHeading')} className="ot-cl-form scroll-mt-[var(--ot-site-header-h)] bg-surface text-fg">
              <div className="mx-auto max-w-7xl px-md py-xl lg:px-lg lg:py-2xl">
                {/* The form block carries its own title; a heading here is optional and author-supplied. */}
                {formHeading && (
                  <h2 id="campaign-form-heading" className="mb-lg text-balance text-[clamp(1.75rem,4vw,2.75rem)] font-light leading-[1.05] tracking-[-0.02em]">
                    {formHeading}
                  </h2>
                )}
                {/* Lift the form card off the surface section. */}
                <div style={{ '--ot-form-card-bg': 'var(--ot-canvas)' } as CSSProperties} className="[&_[data-form-card]]:!my-0">
                  {formSlot ?? (
                    <OptiFormsContainerDataAdapter
                      locale={locale}
                      content={{ _metadata: { key: formKey! } }}
                      displaySettings={{ contentWidth: 'full', verticalSpacing: 'none', backgroundColor: 'none' }}
                    />
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {footerBlock ? (
        <div className="ot-campaign-footer">
          <div className="border-t border-fg/10">
            <div className="mx-auto max-w-[90rem] px-md py-sm lg:px-xl">{renderReturnLink(false)}</div>
          </div>
          <Footer footerBlock={footerBlock} />
        </div>
      ) : (
        <footer className="ot-campaign-footer border-t border-fg/10">
          <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-md px-md py-lg text-label tracking-label text-fg-muted lg:px-xl">
            {renderReturnLink(false)}
            <p>© {new Date().getFullYear()} {siteName}. {t(locale, 'campaignLanding.minimalFooter')}</p>
          </div>
        </footer>
      )}

      {showCta && (
        <CampaignMobileBar label={ctaLabel!} href={ctaUrl!} targetId={hasForm ? FORM_ID : undefined} />
      )}
    </div>
    </div>
  )
}
