import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import CampaignLandingFrame from '@/components/campaign/CampaignLandingFrame'
import HeroBlock from '@/components/blocks/HeroBlock'
import StatBlock from '@/components/blocks/StatBlock'
import QuoteBlock from '@/components/blocks/QuoteBlock'
import AccordionBlock from '@/components/blocks/AccordionBlock'
import BannerBlock from '@/components/blocks/BannerBlock'
import CampaignDemoForm from '@/components/campaign/CampaignDemoForm'
import { getRequestLocale } from '@/lib/optimizely'
import { CAMPAIGN_LOOKS, resolveLook } from '@/lib/campaign-looks'

/**
 * Live demo of the Campaign Landing Page type: the real frame wrapped around a sample
 * composition built from the real blocks, with the look, accent and motion switchable
 * from the URL. This is what the Showcase "Campaign Landing" page links to, and it is
 * the quickest way to show a prospect how one page type can wear four identities.
 *
 *   /campaign-preview?look=neon&accent=%23e4572e&motion=calm
 *
 * Not a CMS page: it renders from static copy, so it never needs content in Graph.
 */
export const metadata: Metadata = {
  title: 'Campaign Landing Page demo',
  robots: { index: false, follow: false },
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

const LABELS: Record<(typeof CAMPAIGN_LOOKS)[number], string> = {
  blueprint: 'Blueprint', neon: 'Neon', comic: 'Comic', stage: 'Stage',
}

function one(v: string | string[] | undefined) { return typeof v === 'string' ? v : undefined }

// The same stock photos the Hero and Banner showcase demos use (showcase/blocks/hero-playground,
// banner-playground), so the campaign demo matches the rest of the showcase.
const HERO_IMG   = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&fit=crop'
const BANNER_IMG = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&fit=crop'

function HeroArt() {
  return (
    <Image
      src={HERO_IMG}
      alt="Glass skyscrapers in a modern city financial district"
      fill
      unoptimized
      sizes="(min-width: 1024px) 50vw, 100vw"
      className="object-cover"
    />
  )
}


export default async function CampaignPreviewPage({ searchParams }: Props) {
  const sp     = await searchParams
  const locale = await getRequestLocale()
  const look   = resolveLook(one(sp.look))
  const accent = one(sp.accent)
  const motion = one(sp.motion)

  return (
    // The look switcher is sticky demo chrome (h-12), so the neon frame is pushed below it (--cl-frame-top = 3rem + 10px).
    <div className="contents" style={{ '--cl-frame-top': 'calc(3rem + 10px)' } as CSSProperties}>
      {/* Demo chrome only (not part of the page type): switch looks. */}
      <nav aria-label="Switch look" className="sticky top-0 z-[80] flex h-12 items-center gap-sm overflow-x-auto border-b border-fg/10 bg-canvas px-md text-label text-fg-muted lg:px-xl">
        <span className="font-semibold uppercase tracking-label">Look</span>
        {CAMPAIGN_LOOKS.map(l => (
          <Link
            key={l}
            href={{ pathname: '/campaign-preview', query: { look: l, ...(accent ? { accent } : {}), ...(motion ? { motion } : {}) } }}
            aria-current={l === look ? 'page' : undefined}
            className={`rounded-ot-control border px-md py-xs font-semibold uppercase tracking-label transition-colors ${l === look ? 'border-brand bg-brand text-fg-on-brand' : 'border-fg/25 hover:border-fg/60 hover:text-fg'}`}
          >
            {LABELS[l]}
          </Link>
        ))}
      </nav>

      <CampaignLandingFrame
        locale={locale}
        look={look}
        accentOverride={accent}
        motionLevel={motion}
        ctaLabel="Request an invitation"
        ctaUrl="#request-information"
        formHeading="Request an invitation"
        formSlot={<CampaignDemoForm />}
      >
        <HeroBlock
          eyebrow="Preview weekend · October 24 to 26"
          headline="Come see it first"
          body="Three days of private walkthroughs, live demonstrations and time with the people who built it. Places are held for guests we invite."
          primaryCta={{ label: 'Request an invitation', href: '#request-information' }}
          secondaryCta={{ label: 'See the schedule', href: '#schedule' }}
          visual={<HeroArt />}
          styleOptions={{ direction: 'editorialSplit', layout: 'imageRight', color: 'brand', animation: 'fade' }}
        />

        <div id="schedule" />
        <StatBlock
          eyebrow="The weekend in numbers"
          heading="Small on purpose"
          stats={[
            { value: '3', label: 'Days', context: 'Friday through Sunday' },
            { value: '120', label: 'Guests', context: 'By invitation only' },
            { value: '12', label: 'Live sessions', context: 'Led by the product team' },
          ]}
          styleOptions={{ columns: 3, color: 'canvas', animate: true }}
        />

        <QuoteBlock
          quote="It felt less like a launch and more like being let into the workshop. I left with answers I could not have found anywhere else."
          attribution={{ name: 'Jordan Ellis', title: 'Guest, last year’s preview' }}
          styleOptions={{ treatment: 'default', color: 'canvas', alignment: 'left', size: 'large' }}
        />

        <AccordionBlock
          eyebrow="Before you request"
          headline="Good to know"
          items={[
            { question: 'Who is invited?', answer: 'Customers, partners and members of the press. Every request is reviewed and confirmed individually, usually within two working days.' },
            { question: 'What does it cost?', answer: 'Nothing. Travel and accommodation are at your own expense; we can recommend nearby places to stay.' },
            { question: 'Can I bring a colleague?', answer: 'Yes. Add their name in the request and we will confirm both places together.' },
          ]}
          styleOptions={{ color: 'canvas', borderStyle: 'ruled', openMode: 'single' }}
        />

        <BannerBlock
          heading="Seats are limited"
          eyebrow="Closes October 17"
          bgImageSrc={BANNER_IMG}
          primaryCta={{ label: 'Request an invitation', href: '#request-information' }}
          styleOptions={{ color: 'brand', alignment: 'center', size: 'display', treatment: 'scrim' }}
        />
      </CampaignLandingFrame>
    </div>
  )
}
