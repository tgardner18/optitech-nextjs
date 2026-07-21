'use client'

import { useState, useEffect, startTransition } from 'react'
import { ShieldCheck, LogIn } from 'lucide-react'
import { sanitizeCmsHtml } from '@/lib/sanitizeHtml'

const COOKIE = 'aba_member_session'
const NAVY   = '#1D4B8C'
const NAVY_D = '#153970'

function hasMemberCookie() {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some(c => c.trim().startsWith(`${COOKIE}=active`))
}

interface Props {
  restrictions?:    string | null
  teaserHtml?:      string
  registrationUrl?: string | null
  initialIsMember?: boolean
  children:         React.ReactNode
}

export default function EventMemberGate({
  restrictions,
  teaserHtml,
  registrationUrl,
  initialIsMember = false,
  children,
}: Props) {
  const [mounted,   setMounted]   = useState(false)
  const [isMember,  setIsMember]  = useState(initialIsMember)

  const isRestricted = restrictions === 'bankMember'

  useEffect(() => {
    startTransition(() => {
      setMounted(true)
      setIsMember(hasMemberCookie())
    })
    const onIn  = () => setIsMember(true)
    const onOut = () => setIsMember(false)
    window.addEventListener('aba-member-signed-in',  onIn)
    window.addEventListener('aba-member-signed-out', onOut)
    return () => {
      window.removeEventListener('aba-member-signed-in',  onIn)
      window.removeEventListener('aba-member-signed-out', onOut)
    }
  }, [])

  // No restriction or member verified — full content
  if (!isRestricted || isMember) return <>{children}</>

  // Gated — show teaser paragraph with fade, then the sign-in wall
  return (
    <>
      {teaserHtml && (
        <div className="relative">
          <div
            data-rich-text=""
            data-color="canvas"
            className="max-w-(--ot-measure-wide) [&>p:first-of-type]:text-title [&>p:first-of-type]:leading-title [&>p:first-of-type]:text-fg-muted [&>p:first-of-type]:text-pretty"
            // CMS-managed rich text
            dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(teaserHtml) }}
          />
          {/* Gradient fade from content into wall */}
          <div
            className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, var(--ot-canvas, #fff))' }}
            aria-hidden
          />
        </div>
      )}

      {/* Sign-in wall */}
      <div
        className={`flex flex-col items-center text-center rounded-ot-surface border border-fg/10 bg-surface px-8 py-12 ${teaserHtml ? '-mt-4' : 'mt-0'}`}
      >
        <span
          className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-5"
          style={{ backgroundColor: `${NAVY}12` }}
          aria-hidden
        >
          <ShieldCheck size={22} strokeWidth={1.75} style={{ color: NAVY }} />
        </span>

        <h3 className="text-title font-semibold text-fg mb-2">
          Sign in to see additional details
        </h3>
        <p className="text-sm text-fg-muted mb-7 max-w-xs leading-relaxed">
          Full event details, agenda, and speakers are available to ABA Bank Members.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <style>{`
            .aba-wall-signin {
              background-color: ${NAVY};
              transition: background-color 150ms ease, transform 150ms ease;
            }
            .aba-wall-signin:hover { background-color: ${NAVY_D}; transform: translateY(-1px); }
            .aba-wall-signin:active { transform: translateY(0); }
            .aba-wall-register {
              border: 2px solid ${NAVY};
              color: ${NAVY};
              transition: background-color 150ms ease, transform 150ms ease;
            }
            .aba-wall-register:hover { background-color: ${NAVY}0f; transform: translateY(-1px); }
            .aba-wall-register:active { transform: translateY(0); }
          `}</style>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('aba-open-signin'))}
            className="aba-wall-signin inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold uppercase tracking-widest text-white focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ outlineColor: NAVY }}
          >
            <LogIn size={15} strokeWidth={2} aria-hidden />
            Sign In
          </button>

          {registrationUrl && (
            <a
              href={registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="aba-wall-register inline-flex items-center rounded-full px-8 py-3 text-sm font-bold uppercase tracking-widest focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ outlineColor: NAVY }}
            >
              Register
            </a>
          )}
        </div>

        {/* After hydration: if still not mounted, show nothing sensitive */}
        {!mounted && (
          <p className="mt-4 text-xs text-fg-muted/60">
            Already a member? Sign in above to access all event details.
          </p>
        )}
      </div>
    </>
  )
}
