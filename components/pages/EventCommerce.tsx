'use client'

import { useState, useEffect, startTransition } from 'react'
import { ShoppingCart, Check, Tag, ArrowRight } from 'lucide-react'

const COOKIE = 'aba_member_session'
const NAVY   = '#1D4B8C'
const NAVY_D = '#153970'
const GOLD   = '#C8962C'

function hasMemberCookie() {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some(c => c.trim().startsWith(`${COOKIE}=active`))
}

function parseDollars(s: string): number | null {
  const n = parseFloat(s.replace(/[^0-9.]/g, ''))
  return isNaN(n) ? null : n
}

function savings(nonMember: string, member: string): string {
  const a = parseDollars(nonMember)
  const b = parseDollars(member)
  if (a === null || b === null || a <= b) return ''
  const diff = a - b
  return `$${Number.isInteger(diff) ? diff : diff.toFixed(2)}`
}

interface Props {
  productId?:       string | null
  nonMemberPrice?:  string | null
  memberPrice?:     string | null
  registrationUrl?: string | null
  isVirtual?:       boolean
  initialIsMember?: boolean
}

export default function EventCommerce({
  productId,
  nonMemberPrice,
  memberPrice,
  registrationUrl,
  isVirtual = false,
  initialIsMember = false,
}: Props) {
  const [mounted,  setMounted]  = useState(false)
  const [isMember, setIsMember] = useState(initialIsMember)
  const [added,    setAdded]    = useState(false)

  const hasPricing = !!(nonMemberPrice || memberPrice)

  useEffect(() => {
    startTransition(() => {
      setMounted(true)
      setIsMember(hasMemberCookie())
    })
    const onIn  = () => setIsMember(true)
    const onOut = () => { setIsMember(false); setAdded(false) }
    window.addEventListener('aba-member-signed-in',  onIn)
    window.addEventListener('aba-member-signed-out', onOut)
    return () => {
      window.removeEventListener('aba-member-signed-in',  onIn)
      window.removeEventListener('aba-member-signed-out', onOut)
    }
  }, [])

  function addToCart() {
    setAdded(true)
    setTimeout(() => setAdded(false), 3500)
  }

  // ── Free event — just a Register / Join link ────────────────────────────────
  if (!hasPricing) {
    if (!registrationUrl) return null
    return (
      <a
        href={registrationUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-signal group flex items-center justify-center gap-xs rounded-ot-control bg-brand text-fg-on-brand px-lg py-md text-label uppercase tracking-label font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {isVirtual ? 'Join' : 'Register'}
        <ArrowRight size={16} strokeWidth={2} className="motion-safe:transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
      </a>
    )
  }

  // ── Paid event ───────────────────────────────────────────────────────────────
  const showMemberRate = mounted && isMember && !!memberPrice
  const saving         = showMemberRate && nonMemberPrice ? savings(nonMemberPrice, memberPrice!) : ''

  return (
    <>
      <style>{`
        .aba-cart-btn {
          transition: background-color 200ms ease, transform 150ms ease;
        }
        .aba-cart-btn:not(:disabled):hover { transform: translateY(-1px); }
        .aba-cart-btn:not(:disabled):active { transform: translateY(0); }
      `}</style>

      {/* Pricing section — inside the card, above the CTA */}
      <div className="px-lg pt-md pb-lg border-t border-fg/10">

        {/* Product ID — subtle data line */}
        {productId && (
          <p className="text-xs text-fg-muted/60 font-mono mb-4">ID: {productId}</p>
        )}

        {showMemberRate ? (
          /* ── Signed-in member view ──────────────────────────────────── */
          <div>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider mb-3"
              style={{ backgroundColor: `${GOLD}1a`, color: GOLD }}
            >
              <Tag size={10} strokeWidth={2.5} aria-hidden />
              Member Rate
            </span>

            <p className="text-3xl font-bold text-fg leading-none mb-1">
              {memberPrice}
            </p>

            {nonMemberPrice && (
              <p className="text-sm text-fg-muted/55 line-through">
                {nonMemberPrice} non-member
              </p>
            )}

            {saving && (
              <p className="mt-2 text-xs font-semibold" style={{ color: GOLD }}>
                You save {saving} with your member rate
              </p>
            )}
          </div>
        ) : (
          /* ── Anonymous / non-member view ────────────────────────────── */
          <div>
            {nonMemberPrice && (
              <>
                <p className="text-xs text-fg-muted/70 uppercase tracking-label font-semibold mb-1">
                  Non-Member
                </p>
                <p className="text-3xl font-bold text-fg leading-none mb-3">
                  {nonMemberPrice}
                </p>
              </>
            )}

            {memberPrice && (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('aba-open-signin'))}
                className="text-xs font-semibold transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ color: NAVY, outlineColor: NAVY }}
              >
                Sign in for member pricing →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add to Cart CTA */}
      <button
        type="button"
        onClick={addToCart}
        disabled={added}
        className="aba-cart-btn group flex w-full items-center justify-center gap-2 rounded-ot-control px-lg py-md text-label uppercase tracking-label font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-default"
        style={{
          backgroundColor: added ? '#15803d' : NAVY,
          outlineColor: NAVY,
        }}
        aria-live="polite"
      >
        {added ? (
          <>
            <Check size={16} strokeWidth={2.5} className="flex-none" aria-hidden />
            Added to Cart
          </>
        ) : (
          <>
            <ShoppingCart size={16} strokeWidth={1.75} className="flex-none motion-safe:transition-transform duration-150 group-hover:scale-110" aria-hidden />
            Add to Cart
          </>
        )}
      </button>
    </>
  )
}
