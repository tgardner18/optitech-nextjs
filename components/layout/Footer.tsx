import Link from 'next/link'
import Image from 'next/image'
import { getSiteSettings, getRequestDomain } from '@/lib/optimizely'

/**
 * Footer — driven by OT_FooterBlock via ThemeManager.footerRef.
 *
 * Structure:
 *   [brand accent bar]
 *   [description zone — mission statement as editorial statement]
 *   [logo + navigation zone]
 *   [year mark]
 *
 * Logo is sourced from ThemeManager (same as header — single source of truth).
 * Description and links come from the referenced OT_FooterBlock.
 * Both are independently optional. Graceful null state when footerRef is absent.
 *
 * Link auto-column: ≤5 links → 1 column. 6–10 links → 2 columns (desktop+).
 */
export default async function Footer() {
  const settings = await getSiteSettings(await getRequestDomain())

  // ── Logo (from ThemeManager — identical source to header) ──────────────────
  const logoSrc        = settings?.logo?.url?.default ?? '/brand/logo/OT.png'
  const logoAlt        = settings?.logoAlt ?? 'OptiTech'
  const logoFit        = (settings?.logoFit as string | undefined) ?? 'full'
  const logoInvertDark = settings?.logoInvertDark === true

  const LOGO_IMG_CLASS: Record<string, string> = {
    full:    'max-h-9 w-auto',
    icon:    'h-9 w-9 object-contain',
    compact: 'max-h-7 w-auto max-w-[120px]',
  }
  const logoImgClass = [
    LOGO_IMG_CLASS[logoFit] ?? LOGO_IMG_CLASS.full,
    logoInvertDark ? 'logo-invert-dark' : '',
  ].filter(Boolean).join(' ')

  // ── Footer block data (from OT_FooterBlock via contentReference) ───────────
  // footerRef is a ContentReference — the actual block data lives in .item
  const footerRef       = (settings?.footerRef?.item ?? settings?.footerRef) as any | undefined
  const descriptionHtml = (footerRef?.description?.html as string | undefined) ?? null

  type FooterLink = { label: string; href: string }
  const links: FooterLink[] = Array.isArray(footerRef?.links)
    ? (footerRef.links as any[])
        .map(l => ({ label: (l.label as string) ?? '', href: (l.url?.default as string) ?? '#' }))
        .filter(l => l.label)
        .slice(0, 10)
    : []

  const hasContent     = !!descriptionHtml || links.length > 0
  const twoColumnLinks = links.length > 5

  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden isolate bg-surface border-t border-fg/10">

      {/* ── Background depth layer ───────────────────────────────────────────
           Soft brand bloom from bottom-right: gives the footer a light-source
           quality without pattern clutter. Static — no motion concern. ────── */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        aria-hidden="true"
        style={{
          zIndex: -1,
          backgroundImage:
            'radial-gradient(ellipse 60% 80% at 95% 110%, var(--ot-bloom-brand-faint) 0%, transparent 65%)',
        }}
      />

      {/* ── Decorative Syne glyph — typographic depth ───────────────────────
           A large "/>" code-tag fragment sits at the back-right of the footer.
           References JSX/HTML syntax: on-brand for a dev-facing CMS demo.
           Syne at weight 400, brand color at 6% opacity — present but distant.
           aria-hidden; no interaction; font-syne loaded via next/font. ─────── */}
      <span
        className="absolute right-0 bottom-0 font-syne text-brand pointer-events-none select-none leading-none"
        aria-hidden="true"
        style={{
          fontSize: 'clamp(9rem, 22vw, 18rem)',
          fontWeight: 400,
          opacity: 0.06,
          transform: 'translate(8%, 20%)',
          zIndex: -1,
        }}
      >
        /&gt;
      </span>

      {/* ── Accent bar — 2 px gradient horizon: brand ➜ accent ──────────────
           At 1 px the gradient disappeared entirely. 2 px makes it readable. */}
      <div
        className="h-0.5"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(to right, transparent, var(--ot-brand) 20%, var(--ot-accent) 80%, transparent)',
        }}
      />

      {hasContent ? (
        <div className="px-md lg:px-lg">

          {/* ── Description zone ──────────────────────────────────────────── */}
          {descriptionHtml && (
            <div className="pt-xl pb-lg border-b border-fg/8">
              <div
                className="
                  text-[1.0625rem] font-medium leading-[1.65] text-fg
                  max-w-[52ch]
                  [&_p]:m-0
                  [&_p+p]:mt-[0.75em]
                  [&_strong]:font-semibold
                  [&_em]:not-italic [&_em]:text-accent
                  [&_a]:text-fg-muted [&_a]:underline [&_a]:decoration-fg/20
                  [&_a:hover]:text-fg [&_a:hover]:decoration-fg/50
                "
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            </div>
          )}

          {/* ── Logo + navigation zone ────────────────────────────────────── */}
          <div
            className={`
              flex flex-col gap-lg
              sm:flex-row sm:items-start sm:justify-between
              ${descriptionHtml ? 'py-lg' : 'pt-xl pb-lg'}
            `}
          >
            {/* Logo — linked home, slightly muted at rest */}
            <Link
              href="/"
              aria-label={`${logoAlt} — Home`}
              className="
                flex items-center h-9 shrink-0
                opacity-70 hover:opacity-100
                transition-opacity duration-200 ease-quick
              "
            >
              <Image
                src={logoSrc}
                alt={logoAlt}
                width={140}
                height={36}
                className={logoImgClass}
              />
            </Link>

            {/* Navigation links */}
            {links.length > 0 && (
              <nav aria-label="Footer navigation">
                <ul
                  className={`
                    grid grid-cols-1 gap-x-xl gap-y-xs
                    ${twoColumnLinks ? 'sm:grid-cols-2' : ''}
                  `}
                >
                  {links.map(link => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="
                          text-label tracking-label uppercase
                          text-fg-muted hover:text-fg
                          transition-colors duration-150 ease-quick
                        "
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>

        </div>
      ) : (
        /* ── Null state — no footer block configured ─────────────────────── */
        <div className="px-md lg:px-lg py-xl flex items-center justify-start">
          <Link
            href="/"
            aria-label={`${logoAlt} — Home`}
            className="opacity-40 hover:opacity-70 transition-opacity duration-200 ease-quick"
          >
            <Image
              src={logoSrc}
              alt={logoAlt}
              width={120}
              height={30}
              className={logoImgClass}
            />
          </Link>
        </div>
      )}

      {/* ── Year mark — label in brand color, quiet but present ──────────────── */}
      <div className="border-t border-fg/5 px-md lg:px-lg py-sm">
        <p className="text-label text-brand/50 tracking-label uppercase">
          {year}
        </p>
      </div>

    </footer>
  )
}
