'use client'

import { useState, useEffect, useRef, startTransition } from 'react'
import { createPortal } from 'react-dom'

// ─── Personas ──────────────────────────────────────────────────────────────────

const PERSONAS = [
  {
    id:       'alex',
    role:     'compliance_executive',   // written to aba_member_role for Optimizely Web targeting
    first:    'Alex',
    full:     'Alex Reynolds',
    initials: 'AR',
    title:    'Chief Compliance Officer',
    email:    'alex.reynolds@aba.com',
    password: 'Member1234',
    since:    '2019',
  },
  {
    id:       'morgan',
    role:     'compliance_analyst',
    first:    'Morgan',
    full:     'Morgan Chen',
    initials: 'MC',
    title:    'Compliance Analyst',
    email:    'morgan.chen@aba.com',
    password: 'Member1234',
    since:    '2024',
  },
] as const

type Persona = typeof PERSONAS[number]

// ─── Cookies ───────────────────────────────────────────────────────────────────

const COOKIE      = 'aba_member_session'   // presence = signed in (existing behaviour)
const ROLE_COOKIE = 'aba_member_role'      // role slug — read by Optimizely Web targeting

function hasCookie(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some(c => c.trim().startsWith(`${COOKIE}=active`))
}

function getPersonaFromCookie(): Persona {
  if (typeof document === 'undefined') return PERSONAS[0]
  const pair = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith(`${ROLE_COOKIE}=`))
  const role = pair?.slice(ROLE_COOKIE.length + 1) ?? ''
  return (PERSONAS as readonly Persona[]).find(p => p.role === role) ?? PERSONAS[0]
}

function writeCookies(persona: Persona): void {
  const opts = `path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 30}`
  document.cookie = `${COOKIE}=active; ${opts}`
  document.cookie = `${ROLE_COOKIE}=${persona.role}; ${opts}`
}

function eraseCookies(): void {
  document.cookie = `${COOKIE}=; path=/; max-age=0; SameSite=Lax`
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`
}

function fire(type: 'signed-in' | 'signed-out') {
  window.dispatchEvent(new CustomEvent(`aba-member-${type}`))
}

// ─── Colours ───────────────────────────────────────────────────────────────────

const LOGO_SRC  = 'https://app-epsaastroti73molt001.cms.optimizely.com/siteassets/f1eee953a1dd47f184819db5f8f02699/theme/aba-logo.svg'
const NAVY      = '#1D4B8C'
const NAVY_DARK = '#153970'
const GOLD      = '#C8962C'

// ─── Component ─────────────────────────────────────────────────────────────────

interface Props {
  mobile?:      boolean
  onMenuClose?: () => void
}

export default function MemberAuth({ mobile = false, onMenuClose }: Props) {
  const [ready,          setReady]          = useState(false)
  const [signedIn,       setSignedIn]       = useState(false)
  const [open,           setOpen]           = useState(false)
  const [dropOpen,       setDropOpen]       = useState(false)
  const [showPw,         setShowPw]         = useState(false)
  const [activePersona,  setActivePersona]  = useState<Persona>(PERSONAS[0])
  const [selectedPersona, setSelectedPersona] = useState<Persona>(PERSONAS[0])
  const [email,          setEmail]          = useState(PERSONAS[0].email)
  const [pass,           setPass]           = useState(PERSONAS[0].password)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    startTransition(() => {
      const isIn = hasCookie()
      setReady(true)
      setSignedIn(isIn)
      if (isIn) setActivePersona(getPersonaFromCookie())
    })
    const onOpenSignIn = () => setOpen(true)
    window.addEventListener('aba-open-signin', onOpenSignIn)
    return () => window.removeEventListener('aba-open-signin', onOpenSignIn)
  }, [])

  useEffect(() => {
    if (!dropOpen) return
    const fn = (e: MouseEvent) => {
      if (!dropRef.current?.contains(e.target as Node)) setDropOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [dropOpen])

  useEffect(() => {
    if (!open) return
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [open])

  function selectPersona(p: Persona) {
    setSelectedPersona(p)
    setEmail(p.email)
    setPass(p.password)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    writeCookies(selectedPersona)
    setActivePersona(selectedPersona)
    setSignedIn(true)
    setOpen(false)
    fire('signed-in')
    onMenuClose?.()
  }

  function signOut() {
    eraseCookies()
    setSignedIn(false)
    setDropOpen(false)
    fire('signed-out')
  }

  // Skeleton during SSR / hydration
  if (!ready) {
    return (
      <div
        className="rounded-ot-control bg-fg/5 animate-pulse"
        style={{ width: mobile ? '100%' : '68px', height: mobile ? '52px' : '30px' }}
      />
    )
  }

  // ── Signed-in · mobile ──────────────────────────────────────────────────────
  if (signedIn && mobile) {
    return (
      <div>
        <div
          className="mb-4 pb-4 border-b border-fg/10"
          style={{ borderLeft: `3px solid ${GOLD}`, paddingLeft: '12px' }}
        >
          <p className="text-sm font-semibold text-fg">{activePersona.full}</p>
          <p className="text-xs text-fg-muted mt-0.5">{activePersona.title}</p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="text-sm text-fg-muted hover:text-fg transition-colors duration-150"
        >
          Sign out
        </button>
      </div>
    )
  }

  // ── Signed-in · desktop ─────────────────────────────────────────────────────
  if (signedIn) {
    return (
      <div ref={dropRef} className="relative">
        <button
          type="button"
          onClick={() => setDropOpen(v => !v)}
          aria-expanded={dropOpen}
          aria-label={`Account menu for ${activePersona.full}`}
          className="flex items-center gap-2 rounded-full pl-1 pr-2.5 py-1 text-fg hover:bg-fg/8 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <span
            aria-hidden="true"
            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[11px] font-bold tracking-wide shrink-0"
            style={{ backgroundColor: NAVY }}
          >
            {activePersona.initials}
          </span>
          <span className="text-sm font-medium hidden xl:block">{activePersona.first}</span>
          <svg
            aria-hidden="true"
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            className={`text-fg-muted shrink-0 transition-transform duration-150 ${dropOpen ? 'rotate-180' : ''}`}
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {dropOpen && (
          <div className="absolute right-0 top-full mt-2 w-60 rounded-lg bg-canvas border border-fg/10 shadow-xl py-1 z-50">
            <div className="px-4 py-3 border-b border-fg/8">
              <p className="text-sm font-semibold text-fg leading-snug">{activePersona.full}</p>
              <p className="text-xs text-fg-muted mt-0.5">{activePersona.title}</p>
              <p className="text-xs mt-1" style={{ color: GOLD }}>Member since {activePersona.since}</p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="w-full text-left px-4 py-2.5 text-sm text-fg-muted hover:text-fg hover:bg-fg/5 transition-colors duration-150"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── Not signed in — trigger button ──────────────────────────────────────────
  const trigger = mobile ? (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="w-full flex items-center justify-center rounded-ot-control border border-fg/20 text-label font-semibold uppercase tracking-label text-fg px-12 py-4 hover:border-fg/40 hover:bg-fg/5 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      Member Sign In
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="inline-flex items-center gap-1.5 rounded-ot-control border border-fg/20 text-label font-semibold uppercase tracking-label text-fg px-7 py-3 hover:border-fg/40 hover:bg-fg/5 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      Sign In
    </button>
  )

  // ── Modal ───────────────────────────────────────────────────────────────────
  const modal = open ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Member Sign In"
      className="fixed inset-0 z-300 flex items-center justify-center p-4"
      style={{ backgroundColor: 'oklch(5% 0.01 255 / 0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
    >
      <div
        className="aba-dialog relative"
        style={{
          width: '100%',
          maxWidth: '30rem',
          overflow: 'hidden',
          borderRadius: '12px',
          boxShadow: '0 32px 80px rgba(4, 5, 20, 0.6)',
        }}
      >
        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            .aba-dialog {
              animation: aba-in 240ms cubic-bezier(0.16, 1, 0.3, 1) both;
            }
            @keyframes aba-in {
              from { opacity: 0; transform: scale(0.96) translateY(10px); }
              to   { opacity: 1; transform: scale(1)    translateY(0);    }
            }
          }
          .aba-input {
            transition: border-color 150ms ease, box-shadow 150ms ease;
          }
          .aba-input:focus {
            outline: none;
            border-color: ${NAVY};
            box-shadow: 0 0 0 3px ${NAVY}22;
          }
          .aba-signin-btn {
            background-color: ${NAVY};
            transition: background-color 150ms ease, transform 150ms ease, box-shadow 150ms ease;
          }
          .aba-signin-btn:hover {
            background-color: ${NAVY_DARK};
            transform: translateY(-1px);
            box-shadow: 0 6px 20px ${NAVY}55;
          }
          .aba-signin-btn:active {
            transform: translateY(0);
            box-shadow: none;
          }
          .aba-persona-card {
            border: 1.5px solid #e5e7eb;
            border-radius: 8px;
            padding: 12px;
            cursor: pointer;
            transition: border-color 150ms ease, background-color 150ms ease;
            text-align: left;
            width: 100%;
            background: transparent;
          }
          .aba-persona-card:hover {
            border-color: ${GOLD}88;
            background-color: ${GOLD}08;
          }
          .aba-persona-card.selected {
            border-color: ${GOLD};
            background-color: ${GOLD}12;
          }
        `}</style>

        {/* Close */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close sign in dialog"
          className="absolute top-3.5 right-3.5 z-10 w-7 h-7 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-150"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Navy header */}
        <div
          className="flex items-center justify-center px-8 py-8"
          style={{ backgroundColor: NAVY }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_SRC}
            alt="American Bankers Association"
            className="h-12 w-auto"
            loading="eager"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>

        {/* Gold accent stripe */}
        <div style={{ height: '3px', background: `linear-gradient(90deg, ${GOLD}, ${GOLD}cc)` }} />

        {/* Form */}
        <div className="bg-white px-8 py-7">
          <h2 className="text-xl font-semibold mb-1.5" style={{ color: '#111827' }}>
            Member Sign In
          </h2>
          <p className="text-sm mb-5 leading-relaxed" style={{ color: '#6b7280' }}>
            Access exclusive member resources and benefits.
          </p>

          {/* Persona selector */}
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: '#9ca3af' }}>
              Sign in as
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {PERSONAS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectPersona(p)}
                  className={`aba-persona-card${selectedPersona.id === p.id ? ' selected' : ''}`}
                  aria-pressed={selectedPersona.id === p.id}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: NAVY }}
                    >
                      {p.initials}
                    </span>
                    <span className="text-sm font-semibold leading-tight" style={{ color: '#111827' }}>
                      {p.full}
                    </span>
                  </div>
                  <p className="text-[11px] leading-snug pl-9" style={{ color: '#6b7280' }}>
                    {p.title}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submit} noValidate>
            <div className="mb-4">
              <label
                htmlFor="aba-member-email"
                className="block text-sm font-semibold mb-1.5"
                style={{ color: '#374151' }}
              >
                Email
              </label>
              <input
                id="aba-member-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="aba-input w-full rounded-lg border px-4 py-2.5 text-sm"
                style={{ borderColor: '#d1d5db', color: '#111827' }}
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="aba-member-password"
                className="block text-sm font-semibold mb-1.5"
                style={{ color: '#374151' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="aba-member-password"
                  type={showPw ? 'text' : 'password'}
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="aba-input w-full rounded-lg border px-4 py-2.5 pr-16 text-sm"
                  style={{ borderColor: '#d1d5db', color: '#111827' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold transition-opacity hover:opacity-70"
                  style={{ color: NAVY }}
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="aba-signin-btn w-full rounded-full py-3.5 text-sm font-bold uppercase tracking-widest text-white">
              Sign In
            </button>
          </form>

          <p className="mt-5 flex items-center gap-1.5 text-xs" style={{ color: '#9ca3af' }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25"/>
              <path d="M8 7.5v3.5M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Demo — select a profile and credentials are pre-filled
          </p>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      {trigger}
      {ready && createPortal(modal, document.body)}
    </>
  )
}
