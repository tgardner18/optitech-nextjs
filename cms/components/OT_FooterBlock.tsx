import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { RichText } from '@optimizely/cms-sdk/react/richText'
import { OT_FooterBlock as OT_FooterBlockContentType } from '@/cms/content-types/OT_FooterBlock'
import Image from 'next/image'
import Link from 'next/link'

type Props = {
  content: ContentProps<typeof OT_FooterBlockContentType>
  displaySettings?: Record<string, string | boolean>
}

/**
 * CMS adapter for OT_FooterBlock — renders a preview of the footer block
 * when editing it as a shared item in the Optimizely editor.
 *
 * Not used for the public site footer (which is rendered by components/layout/Footer.tsx).
 * This exists solely to give editors a visual preview pane in the CMS.
 */
export default function OT_FooterBlockAdapter({ content }: Props) {
  const { pa, src } = getPreviewUtils(content)

  const descriptionJson            = content.description?.json ?? undefined
  const logoSrc:  string | null   = src(content.footerLogo) ?? null
  const logoSize: string          = (content.footerLogoSize as string | undefined) ?? 'md'
  const logoInvert: boolean       = content.footerLogoInvertDark === true

  const LOGO_SIZE: Record<string, string> = {
    sm: 'max-h-10 w-auto',
    md: 'max-h-14 w-auto',
    lg: 'max-h-20 w-auto',
    xl: 'max-h-28 w-auto',
  }
  const logoClass = [
    LOGO_SIZE[logoSize] ?? LOGO_SIZE.md,
    logoInvert ? 'logo-invert-dark' : '',
  ].filter(Boolean).join(' ')

  type FooterLink = { label: string; href: string }
  const links: FooterLink[] = Array.isArray(content.links)
    ? (content.links as any[])
        .map((l: any) => ({ label: l.label ?? '', href: l.url?.default ?? '#' }))
        .filter((l: FooterLink) => l.label)
    : []

  const twoColumn = links.length > 5

  return (
    <div
      {...pa(content.__composition)}
      className="bg-canvas border border-fg/10 p-lg max-w-3xl"
    >
      {/* Logo preview */}
      {logoSrc && (
        <div className="mb-lg" {...pa('footerLogo')}>
          <Image
            src={logoSrc}
            alt="Footer logo preview"
            width={300}
            height={90}
            className={logoClass}
          />
        </div>
      )}

      {/* Description */}
      {descriptionJson && (
        <div
          className="
            text-[1rem] font-medium leading-[1.65] text-fg
            max-w-[52ch] mb-lg
            [&_p]:m-0 [&_p+p]:mt-[0.75em]
            [&_strong]:font-semibold
            [&_em]:not-italic [&_em]:text-accent
          "
        >
          <RichText content={descriptionJson} />
        </div>
      )}

      {/* Links grid */}
      {links.length > 0 && (
        <nav aria-label="Footer navigation preview">
          <ul
            className={`grid grid-cols-1 gap-x-xl gap-y-xs ${
              twoColumn ? 'sm:grid-cols-2' : ''
            }`}
          >
            {links.map(link => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-label tracking-label uppercase text-fg-muted hover:text-fg transition-colors duration-150"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {!descriptionJson && links.length === 0 && (
        <p className="text-sm text-fg-muted/60 italic">
          Add a description or links to preview the footer.
        </p>
      )}
    </div>
  )
}
