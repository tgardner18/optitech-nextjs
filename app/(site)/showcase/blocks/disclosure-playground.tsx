'use client'

import OT_DisclosureBlock from '@/cms/components/OT_DisclosureBlock'

// ─── Demo items ───────────────────────────────────────────────────────────────

function item(html: string) {
  return { body: { html } }
}

const RATE_ITEMS = [
  item('<p>Annual Percentage Yield (APY) is accurate as of July 1, 2026 and is subject to change without notice. Fees may reduce earnings.</p>'),
  item('<p>Access Checking has no minimum balance requirement. Select Checking requires a $500 average daily balance to waive the $8 monthly fee; Preferred Checking requires $5,000 to waive the $25 monthly fee.</p>'),
  item('<p>MSUFCU accounts are federally insured up to $250,000 by the <a href="https://www.ncua.gov">National Credit Union Administration (NCUA)</a>. MSUFCU is a federally insured credit union and is not FDIC-insured.</p>'),
]

const ALPHA_ITEMS = [
  item('<p>Introductory APY applies for the first 12 months and requires a qualifying direct deposit. After the introductory period, the standard variable APY applies.</p>'),
  item('<p>ATM fee reimbursements are credited to your account at the end of each statement cycle and apply only to fees charged by other financial institutions for using their ATMs within the 50 United States.</p>'),
  item('<p>Priority support is available Monday through Friday, 7 a.m.–9 p.m. ET, and Saturday 9 a.m.–5 p.m. ET. After-hours support is available via secure message in Online Banking.</p>'),
]

const SINGLE_ITEM = [
  item('<p>This promotional rate is available to new members only and may be withdrawn at any time. Member eligibility requirements apply. <a href="/membership">Learn about membership</a>.</p>'),
]

const TERMS_ITEMS = [
  item('<p>By submitting this form you authorize MSUFCU to obtain your credit report. This is a soft inquiry and will not affect your credit score.</p>'),
  item('<p>Rates, terms, and conditions are subject to change. All loans subject to credit approval. Equal Housing Lender. NMLS #640881.</p>'),
]

// ─── Showcase ─────────────────────────────────────────────────────────────────

export default function DisclosurePlayground() {
  return (
    <div className="divide-y divide-fg/5">

      <div className="pb-lg">
        <p className="px-md lg:px-lg pt-md text-label tracking-label uppercase text-brand font-semibold mb-xs">
          Fine Print · Numeric · With heading
        </p>
        <p className="px-md lg:px-lg text-[0.8125rem] text-fg-muted mb-md">
          Default style — the whisper treatment. Ultra-subdued fine print at the page bottom.
        </p>
        <OT_DisclosureBlock
          content={{ heading: 'Rates & Fees', style: 'finePrint', markerStyle: 'numeric', items: RATE_ITEMS } as any}
          displaySettings={{}}
        />
      </div>

      <div className="pb-lg">
        <p className="px-md lg:px-lg pt-md text-label tracking-label uppercase text-brand font-semibold mb-xs">
          Fine Print · Alpha · No heading
        </p>
        <p className="px-md lg:px-lg text-[0.8125rem] text-fg-muted mb-md">
          Alpha marker variant — a. b. c. Useful when the inline reference uses letters instead of superscripts.
        </p>
        <OT_DisclosureBlock
          content={{ style: 'finePrint', markerStyle: 'alpha', items: ALPHA_ITEMS } as any}
          displaySettings={{}}
        />
      </div>

      <div className="pb-lg">
        <p className="px-md lg:px-lg pt-md text-label tracking-label uppercase text-brand font-semibold mb-xs">
          Section · Numeric · With heading
        </p>
        <p className="px-md lg:px-lg text-[0.8125rem] text-fg-muted mb-md">
          Slightly elevated — a visible zone with a proper label. Appropriate when disclosures are a primary trust signal.
        </p>
        <OT_DisclosureBlock
          content={{ heading: 'Important Disclosures', style: 'section', markerStyle: 'numeric', items: TERMS_ITEMS } as any}
          displaySettings={{}}
        />
      </div>

      <div className="pb-lg">
        <p className="px-md lg:px-lg pt-md text-label tracking-label uppercase text-brand font-semibold mb-xs">
          Single item · No marker
        </p>
        <p className="px-md lg:px-lg text-[0.8125rem] text-fg-muted mb-md">
          When there is only one disclosure, the marker is suppressed automatically.
        </p>
        <OT_DisclosureBlock
          content={{ heading: 'Promotional Offer', style: 'finePrint', markerStyle: 'numeric', items: SINGLE_ITEM } as any}
          displaySettings={{}}
        />
      </div>

    </div>
  )
}
