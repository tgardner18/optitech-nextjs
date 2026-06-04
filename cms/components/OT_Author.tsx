import { ContentProps } from '@optimizely/cms-sdk'
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server'
import { RichText } from '@optimizely/cms-sdk/react/richText'
import { OT_Author } from '@/cms/content-types/OT_Author'
import Image from 'next/image'
import { User } from 'lucide-react'

type Props = {
  content: ContentProps<typeof OT_Author>
  displaySettings?: Record<string, string | boolean>
}

function authorInitials(name: string): string {
  return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
}

/**
 * CMS adapter for OT_Author — renders a full-width author profile preview
 * inside the Optimizely editor when the block is opened as a shared item.
 *
 * Mirrors the "About the author" section at the bottom of OT_BlogPage.
 * Not used on the public site (blog pages render author data inline).
 */
export default function OT_Author({ content }: Props) {
  const { pa } = getPreviewUtils(content)

  const photoUrl: string | undefined = content.photo?.url?.default
  const name:     string = content.name ?? ''
  const role:     string = content.role ?? ''
  const bioJson          = content.bio?.json ?? undefined
  const linkedIn: string = content.linkedIn?.default ?? content.linkedIn ?? ''
  const twitter:  string = content.twitter?.default  ?? content.twitter  ?? ''
  const initials: string = name ? authorInitials(name) : ''

  return (
    /* Preview wrapper — fills the preview iframe with the site canvas background
       and pads the card so it reads in context. Mirrors the blog page author layout. */
    <div className="min-h-screen bg-canvas flex flex-col">

      {/* Brand-tinted top rule — matches the separator used above the author
          section at the bottom of blog posts */}
      <div className="h-px bg-brand/30" aria-hidden="true" />

      <section
        {...pa(content.__composition)}
        className="bg-surface flex-1 py-xl"
        aria-label="About the author"
      >
        <div className="mx-auto max-w-5xl px-md">

          {/* Section label */}
          <p className="text-label uppercase tracking-label text-fg-muted/50 mb-lg font-semibold">
            Author preview
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-[3.5rem_1fr] gap-lg items-start">

            {/* ── Photo / fallback ─────────────────────────────────────────── */}
            <div className="flex-none w-14 h-14 overflow-hidden border border-fg/10 bg-canvas">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={name || 'Author photo'}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              ) : initials ? (
                /* Initials monogram — brand tinted, matches blog page fallback */
                <div className="w-full h-full bg-brand/20 flex items-center justify-center">
                  <span className="text-title font-bold text-brand select-none">
                    {initials}
                  </span>
                </div>
              ) : (
                /* Generic person icon — shown when no name is set yet */
                <div className="w-full h-full bg-surface flex items-center justify-center">
                  <User size={24} strokeWidth={1.5} className="text-fg-muted/40" />
                </div>
              )}
            </div>

            {/* ── Text content ─────────────────────────────────────────────── */}
            <div>
              <p className="text-label uppercase tracking-label text-fg-muted/60 mb-xs">
                About the author
              </p>

              {name ? (
                <p
                  className="text-title font-semibold text-fg leading-tight"
                  {...pa('name')}
                >
                  {name}
                </p>
              ) : (
                <p className="text-title font-semibold text-fg-muted/40 leading-tight italic">
                  Name not set
                </p>
              )}

              {role && (
                <p className="text-label text-fg-muted mt-0.75" {...pa('role')}>
                  {role}
                </p>
              )}

              {bioJson ? (
                <div
                  className="
                    mt-md text-body leading-[1.65] text-fg-muted max-w-[52ch]
                    [&_p]:m-0 [&_p+p]:mt-[0.75em]
                    [&_strong]:font-semibold [&_strong]:text-fg
                    [&_em]:not-italic [&_em]:text-accent
                  "
                  {...pa('bio')}
                >
                  <RichText content={bioJson} />
                </div>
              ) : (
                <p
                  className="mt-md text-body text-fg-muted/40 italic"
                  {...pa('bio')}
                >
                  No bio set yet.
                </p>
              )}

              {(linkedIn || twitter) && (
                <div className="mt-md flex items-center gap-md">
                  {linkedIn && (
                    <a
                      href={linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        inline-flex items-center gap-xs
                        text-label uppercase tracking-label
                        text-fg-muted hover:text-fg
                        transition-colors duration-150 ease-quick
                      "
                    >
                      LinkedIn
                      <span aria-hidden className="text-accent text-[0.7rem]">↗</span>
                    </a>
                  )}
                  {twitter && (
                    <a
                      href={twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        inline-flex items-center gap-xs
                        text-label uppercase tracking-label
                        text-fg-muted hover:text-fg
                        transition-colors duration-150 ease-quick
                      "
                    >
                      X&hairsp;/&hairsp;Twitter
                      <span aria-hidden className="text-accent text-[0.7rem]">↗</span>
                    </a>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
