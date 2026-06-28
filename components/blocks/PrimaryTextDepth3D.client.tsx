'use client'

import { useEffect, useRef } from 'react'

// ─── depth3d interactive headline ───────────────────────────────────────────────
//
// Renders the "3D Depth" header effect as real stacked DOM layers (see the
// .ot-extrude3d styles in globals.css) so the extrusion genuinely separates in
// 3D when the headline rotates toward the cursor — a flat text-shadow stack
// cannot. The layers render statically with no JavaScript (this is also the
// touch / reduced-motion resting state); JS only adds the cursor-driven tilt.
//
// Behaviour, per spec:
//   • element-relative tracking (this headline's own rect, so multiple instances
//     respond independently — no shared global mouse store)
//   • normalized cursor → rotateY ±10° (dominant) and rotateX ±4° (subtle)
//   • rAF + lerp toward the target each frame (weighted, trailing feel — never a
//     raw 1:1 jump on every mousemove)
//   • eases back to neutral when the cursor leaves the headline
//   • coarse pointer OR prefers-reduced-motion → no listeners at all, static
//     resting treatment (hard requirement)
//   • IntersectionObserver gates listener + rAF to while the headline is in view
//
// No @optimizely/cms-sdk import — pure presentational client component.

const LAYER_COUNT = 6 // 5 receding shadow steps + 1 face (matches the CSS nth-child geometry)
const MAX_RY = 10 // deg — horizontal tilt, the dominant axis
const MAX_RX = 4  // deg — vertical tilt, deliberately subtler
const LERP = 0.1  // per-frame approach toward target (weighted trailing feel)
const EPS = 0.01  // deg — "settled" threshold

const clamp = (v: number, min: number, max: number) => (v < min ? min : v > max ? max : v)

export default function PrimaryTextDepth3D({ text }: { text: string }) {
  const wrapRef = useRef<HTMLSpanElement>(null)
  const rotRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const rot = rotRef.current
    if (!wrap || !rot) return

    // Capability gate — touch / coarse pointer and reduced-motion both fall back
    // to the static resting treatment with zero tracking.
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (coarse || reduce) return

    wrap.setAttribute('data-interactive', '') // turns on perspective + preserve-3d

    let raf = 0
    let running = false
    let curRx = 0, curRy = 0, tgtRx = 0, tgtRy = 0

    const apply = () => {
      rot.style.setProperty('--rx', `${curRx.toFixed(3)}deg`)
      rot.style.setProperty('--ry', `${curRy.toFixed(3)}deg`)
    }

    const frame = () => {
      curRx += (tgtRx - curRx) * LERP
      curRy += (tgtRy - curRy) * LERP
      apply()
      const settled = Math.abs(tgtRx - curRx) < EPS && Math.abs(tgtRy - curRy) < EPS
      if (settled) {
        // Snap to the exact target and stop the loop until the next input.
        curRx = tgtRx; curRy = tgtRy
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
      if (r.width === 0 || r.height === 0) return
      const nx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1)
      const ny = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1)
      tgtRy = nx * MAX_RY        // cursor right → rotateY+ (right edge recedes)
      tgtRx = -ny * MAX_RX       // cursor up → rotateX+ (top tilts toward viewer)
      wake()
    }
    const rest = () => { tgtRx = 0; tgtRy = 0; wake() }

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
      rest() // ease back to neutral when scrolled out of view
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
