'use client'

import { useEffect, useRef } from 'react'

// ─── depth3d interactive headline ───────────────────────────────────────────────
//
// Renders the "3D Depth" header effect as real stacked DOM layers (see the
// .ot-extrude3d styles in globals.css). The receding layers swing LEFT/RIGHT with
// the cursor's horizontal position — a retro extrude that leans away from the
// pointer (the optimizely.com homepage feel), NOT a perspective tilt. The layers
// render statically as a straight-down stack with no JavaScript; this is also the
// touch / reduced-motion resting state. JS only drives the horizontal lean.
//
// Behaviour:
//   • element-relative tracking (this headline's own rect, so multiple instances
//     respond independently — no shared global mouse store)
//   • normalized cursor X → --ext, the per-layer horizontal-offset multiplier;
//     the stack leans AWAY from the cursor. Cursor Y is ignored (left/right only).
//   • rAF + lerp toward the target each frame (weighted, trailing feel)
//   • eases back to a straight-down stack when the cursor leaves
//   • coarse pointer OR prefers-reduced-motion → no listeners, static stack
//   • IntersectionObserver gates listener + rAF to while the headline is in view
//
// No @optimizely/cms-sdk import — pure presentational client component.

const LAYER_COUNT = 6  // 5 receding steps + 1 face (matches the CSS nth-child geometry)
const MAX_EXT = 1.8    // peak horizontal lean, as a multiple of each layer's vertical depth
const LERP = 0.12      // per-frame approach toward target (weighted trailing feel)
const EPS = 0.002      // "settled" threshold

const clamp = (v: number, min: number, max: number) => (v < min ? min : v > max ? max : v)

export default function PrimaryTextDepth3D({ text }: { text: string }) {
  const wrapRef = useRef<HTMLSpanElement>(null)
  const rotRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const rot = rotRef.current
    if (!wrap || !rot) return

    // Capability gate — touch / coarse pointer and reduced-motion both fall back
    // to the static straight-down stack with zero tracking.
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (coarse || reduce) return

    wrap.setAttribute('data-interactive', '')

    let raf = 0
    let running = false
    let cur = 0, tgt = 0

    const apply = () => { rot.style.setProperty('--ext', cur.toFixed(3)) }

    const frame = () => {
      cur += (tgt - cur) * LERP
      apply()
      if (Math.abs(tgt - cur) < EPS) {
        // Snap to the exact target and stop the loop until the next input.
        cur = tgt
        apply()
        running = false
        return
      }
      raf = requestAnimationFrame(frame)
    }
    const wake = () => {
      if (!running) { running = true; raf = requestAnimationFrame(frame) }
    }

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect()
      if (r.width === 0) return
      const nx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1)
      tgt = -nx * MAX_EXT // cursor right → stack leans left, and vice versa
      wake()
    }
    const rest = () => { tgt = 0; wake() }

    let attached = false
    const attach = () => {
      if (attached) return
      wrap.addEventListener('pointermove', onMove)
      wrap.addEventListener('pointerleave', rest)
      attached = true
    }
    const detach = () => {
      if (!attached) return
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerleave', rest)
      attached = false
      rest() // ease back to a straight-down stack when scrolled out of view
    }

    // Only track + animate while the headline is on screen.
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) attach(); else detach() },
      { threshold: 0 },
    )
    io.observe(wrap)

    return () => {
      io.disconnect()
      if (attached) {
        wrap.removeEventListener('pointermove', onMove)
        wrap.removeEventListener('pointerleave', rest)
      }
      cancelAnimationFrame(raf)
      wrap.removeAttribute('data-interactive')
    }
  }, [])

  return (
    <span ref={wrapRef} className="ot-extrude3d">
      <span ref={rotRef} className="ot-extrude3d__rot">
        {Array.from({ length: LAYER_COUNT }).map((_, i) => (
          <span
            key={i}
            className="ot-extrude3d__layer"
            // Only the face (last layer) is exposed to assistive tech; the
            // receding duplicates are decorative.
            aria-hidden={i < LAYER_COUNT - 1 ? true : undefined}
          >
            {text}
          </span>
        ))}
      </span>
    </span>
  )
}
