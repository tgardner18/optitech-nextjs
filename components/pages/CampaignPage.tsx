import type { CampaignPageContent, CampaignBodyItem, CampaignClosingItem } from '@/lib/campaign'
import HeroBlock        from '@/components/blocks/HeroBlock'
import PrimaryTextBlock from '@/components/blocks/PrimaryTextBlock'
import FeatureGridBlock from '@/components/blocks/FeatureGridBlock'
import TabsBlock        from '@/components/blocks/TabsBlock'
import QuoteBlock       from '@/components/blocks/QuoteBlock'
import VideoBlock       from '@/components/blocks/VideoBlock'
import ImageBlock       from '@/components/blocks/ImageBlock'
import type { TabsStyleOptions } from '@/cms/styling/OT_TabsBlock.styling'

// ─── Default TabsBlock style when used as a campaign body slot ────────────────

const DEFAULT_TABS_STYLE: TabsStyleOptions = {
  tabStyle:         'underline',
  tabPosition:      'top',
  color:            'canvas',
  contentLayout:    'textOnly',
  triggerAlign:     'left',
  autoPlay:         false,
  autoPlayDuration: 5,
}

// ─── Slot renderers ───────────────────────────────────────────────────────────

function renderHeroSlot(hero: CampaignPageContent['heroSection']) {
  if (!hero) return null
  return (
    <HeroBlock
      eyebrow={hero.eyebrow         ?? undefined}
      headline={hero.headline}
      body={hero.body               ?? undefined}
      primaryCta={
        hero.primaryCtaUrl
          ? { label: hero.primaryCtaLabel ?? 'Learn more', href: hero.primaryCtaUrl }
          : undefined
      }
      secondaryCta={
        hero.secondaryCtaUrl
          ? { label: hero.secondaryCtaLabel ?? 'See more', href: hero.secondaryCtaUrl }
          : undefined
      }
      visualSrc={hero.visualSrc ?? undefined}
      visualAlt={hero.visualAlt ?? undefined}
    />
  )
}

function renderBodyItem(item: CampaignBodyItem, index: number) {
  switch (item.__typename) {
    case 'OT_PrimaryTextBlock':
      return (
        <PrimaryTextBlock
          key={index}
          eyebrow={item.eyebrow ?? undefined}
          headline={item.headline}
          headingLevel={(item.headingLevel as 'h1' | 'h2') ?? 'h2'}
          body={item.body ?? null}
        />
      )

    case 'OT_FeatureGridBlock':
      return (
        <FeatureGridBlock
          key={index}
          eyebrow={item.eyebrow     ?? undefined}
          heading={item.heading     ?? undefined}
          subheading={item.subheading ?? undefined}
          ctaLabel={item.ctaLabel   ?? undefined}
          ctaUrl={item.ctaUrl       ?? undefined}
          features={(item.features ?? []).map(f => ({
            headline: f.headline,
            body:     f.body     ?? null,
            ctaLabel: f.ctaLabel ?? undefined,
            ctaUrl:   f.ctaUrl   ?? undefined,
          }))}
        />
      )

    case 'OT_TabsBlock':
      return (
        <TabsBlock
          key={index}
          eyebrow={item.eyebrow ?? undefined}
          heading={item.heading ?? undefined}
          tabs={(item.tabs ?? []).map(t => ({
            tabLabel: t.tabLabel,
            tabIcon:  t.tabIcon  ?? undefined,
            heading:  t.heading  ?? undefined,
            body:     t.body     ?? null,
            ctaLabel: t.ctaLabel ?? undefined,
            ctaUrl:   t.ctaUrl   ?? undefined,
          }))}
          styleOptions={DEFAULT_TABS_STYLE}
        />
      )

    case '__unknown__':
      return (
        <div
          key={index}
          className="px-md lg:px-lg py-lg border-y border-fg/10"
          aria-hidden="true"
        >
          <p className="text-label text-fg-muted/40 font-mono text-center">
            Block type &ldquo;{item.typeName}&rdquo; is not supported in this slot
          </p>
        </div>
      )
  }
}

function renderClosingItem(item: CampaignClosingItem, index: number) {
  switch (item.__typename) {
    case 'OT_QuoteBlock':
      return (
        <QuoteBlock
          key={index}
          quote={item.quote}
          attribution={{
            name:  item.attributionName  ?? '',
            title: item.attributionTitle ?? undefined,
          }}
        />
      )

    case 'OT_VideoBlock':
      return (
        <VideoBlock
          key={index}
          src={item.src}
          title={item.title}
          caption={item.caption ?? undefined}
        />
      )

    case 'OT_ImageBlock':
      return (
        <ImageBlock
          key={index}
          src={item.src}
          alt={item.alt}
          caption={item.caption ?? undefined}
        />
      )

    case '__unknown__':
      return (
        <div
          key={index}
          className="px-md lg:px-lg py-md border-y border-fg/10"
          aria-hidden="true"
        >
          <p className="text-label text-fg-muted/40 font-mono text-center">
            Block type &ldquo;{item.typeName}&rdquo; is not supported in this slot
          </p>
        </div>
      )
  }
}

// ─── Page component ───────────────────────────────────────────────────────────

export type CampaignPageProps = {
  heroSection?:    CampaignPageContent['heroSection']
  bodySection?:    CampaignBodyItem[]
  closingSection?: CampaignClosingItem[]
}

export default function CampaignPage({
  heroSection,
  bodySection = [],
  closingSection = [],
}: CampaignPageProps) {
  const hasHero    = !!heroSection
  const hasBody    = bodySection.length > 0
  const hasClosing = closingSection.length > 0

  return (
    // Ambient brand tint layers behind all sections — the page reads as one
    // cohesive surface rather than disconnected blocks.
    <div
      className="relative min-h-screen"
      style={{
        background:
          'radial-gradient(ellipse at 60% 0%, var(--ot-bloom-brand-faint) 0%, transparent 55%)',
      }}
    >
      {/* ── Hero: edge-to-edge, no extra wrapper ─────────────────────────── */}
      {hasHero && (
        <section aria-label="Hero">
          {renderHeroSlot(heroSection)}
        </section>
      )}

      {/* ── Body: stacked blocks, thin top rule transitions from hero ─────── */}
      {hasBody && (
        <section
          aria-label="Body"
          className={hasHero ? 'border-t border-fg/5' : undefined}
        >
          {bodySection.map((item, i) => renderBodyItem(item, i))}
        </section>
      )}

      {/* ── Closing: elevated surface, page finale ───────────────────────── */}
      {hasClosing && (
        <section
          aria-label="Closing"
          className="bg-surface/50 py-xl"
        >
          {closingSection.map((item, i) => renderClosingItem(item, i))}
        </section>
      )}
    </div>
  )
}
