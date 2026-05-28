import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import Link from 'next/link'

type Props = {
  content: any
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
  const { pa } = getPreviewUtils(content)

  const descriptionHtml: string = content.description?.html ?? ''

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
      {/* Description */}
      {descriptionHtml && (
        <div
          className="
            text-[1rem] font-medium leading-[1.65] text-fg
            max-w-[52ch] mb-lg
            [&_p]:m-0 [&_p+p]:mt-[0.75em]
            [&_strong]:font-semibold
            [&_em]:not-italic [&_em]:text-accent
          "
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
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

      {!descriptionHtml && links.length === 0 && (
        <p className="text-sm text-fg-muted/60 italic">
          Add a description or links to preview the footer.
        </p>
      )}
    </div>
  )
}
