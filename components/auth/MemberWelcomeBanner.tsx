'use client'

import { useState, useEffect } from 'react'

const COOKIE       = 'aba_member_type'
const DISMISS_KEY  = 'aba-banner-dismissed'
const NAVY         = '#1D4B8C'
const GOLD         = '#C8962C'

const ROLE_NAMES: Record<string, string> = {
  compliance_executive: 'Alex',
  compliance_analyst:   'Morgan',
}

function getRole(): string {
  if (typeof document === 'undefined') return ''
  const pair = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith(`${COOKIE}=`))
  return pair?.slice(COOKIE.length + 1) ?? ''
}

function isSignedIn() {
  return getRole().length > 0
}

function getFirstName(): string {
  return ROLE_NAMES[getRole()] ?? 'Alex'
}

export default function MemberWelcomeBanner() {
  const [visible,   setVisible]   = useState(false)
  const [animate,   setAnimate]   = useState(false)
  const [firstName, setFirstName] = useState('Alex')

  function show() {
    setFirstName(getFirstName())
    sessionStorage.removeItem(DISMISS_KEY)
    setVisible(true)
    // One rAF to paint the initial invisible state before animating in
    requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)))
  }

  function hide() {
    setAnimate(false)
    setVisible(false)
  }

  function check() {
    if (isSignedIn() && sessionStorage.getItem(DISMISS_KEY) !== '1') {
      show()
    } else {
      hide()
    }
  }

  useEffect(() => {
    if (isSignedIn()) setFirstName(getFirstName())
    check()
    window.addEventListener('aba-member-signed-in',  show)
    window.addEventListener('aba-member-signed-out', hide)
    return () => {
      window.removeEventListener('aba-member-signed-in',  show)
      window.removeEventListener('aba-member-signed-out', hide)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setAnimate(false)
    // Wait for exit animation before unmounting
    setTimeout(() => setVisible(false), 300)
  }

  if (!visible) return null

  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .aba-banner {
            transition: opacity 300ms ease, transform 300ms cubic-bezier(0.16, 1, 0.3, 1), max-height 300ms ease;
          }
        }
        .aba-banner {
          opacity: 0;
          transform: translateY(-6px);
          max-height: 0;
          overflow: hidden;
        }
        .aba-banner.in {
          opacity: 1;
          transform: translateY(0);
          max-height: 80px;
        }
      `}</style>
      <div
        className={`aba-banner${animate ? ' in' : ''}`}
        style={{ backgroundColor: NAVY }}
        role="status"
        aria-live="polite"
        aria-label="Member welcome notification"
      >
        <div className="flex items-center justify-between px-md py-3 lg:px-lg gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span
              aria-hidden="true"
              className="hidden sm:block w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: GOLD }}
            />
            <p className="text-sm text-white leading-snug truncate">
              <span className="font-semibold">Welcome back, {firstName}.</span>
              {' '}Your exclusive member resources are now accessible.
            </p>
          </div>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss welcome notification"
            className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors duration-150"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
