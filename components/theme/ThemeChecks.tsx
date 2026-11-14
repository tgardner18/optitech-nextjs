'use client'

import { useEffect } from 'react'

// WCAG contrast from the colors the browser actually rendered (hex, oklch, var() chains
// all resolve through a canvas pixel). Fills each [data-part="check"] row inside the
// preview, and reveals the alert banner naming how many checks fail.
function rgba(g: CanvasRenderingContext2D, c: string): [number, number, number] {
  g.clearRect(0, 0, 1, 1)
  g.fillStyle = '#000'
  g.fillStyle = c
  g.fillRect(0, 0, 1, 1)
  const d = g.getImageData(0, 0, 1, 1).data
  return [d[0], d[1], d[2]]
}
const lum = (c: number[]) => {
  const a = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) })
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
}
const ratio = (a: number[], b: number[]) => {
  const x = lum(a), y = lum(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

export default function ThemeChecks({ rootId }: { rootId: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId)
    if (!root) return
    const cv = document.createElement('canvas')
    cv.width = cv.height = 1
    const g = cv.getContext('2d', { willReadFrequently: true })
    if (!g) return
    const run = () => {
      let failing = 0
      const names: string[] = []
      root.querySelectorAll<HTMLElement>('[data-part="check"]').forEach(li => {
        const probe = li.querySelector<HTMLElement>('[data-part="probe"]')
        if (!probe) return
        const cs = getComputedStyle(probe)
        const r = ratio(rgba(g, cs.color), rgba(g, cs.backgroundColor))
        const min = Number(li.dataset.min) || 4.5
        const state = r >= min ? 'pass' : r >= 3 ? 'large' : 'fail'
        li.dataset.state = state
        const ratioEl = li.querySelector('[data-part="ratio"]')
        const verdict = li.querySelector('[data-part="verdict"]')
        if (ratioEl) ratioEl.textContent = `${r.toFixed(1)}:1`
        if (verdict) verdict.textContent = state === 'pass' ? 'Passes' : state === 'large' ? 'Large text only' : 'Fails'
        if (state === 'fail') { failing++; names.push(`${li.dataset.mode} mode: ${li.dataset.label}`) }
      })
      const alert = root.querySelector<HTMLElement>('[data-part="alert"]')
      if (alert) {
        alert.hidden = failing === 0
        const n = alert.querySelector('[data-part="alert-n"]')
        if (n) n.textContent = `${failing} contrast check${failing === 1 ? '' : 's'} fail${failing === 1 ? 's' : ''}.`
        const l = alert.querySelector('[data-part="alert-list"]')
        if (l) l.textContent = names.length ? `Failing: ${names.join('; ')}.` : ''
      }
    }
    run()
    // The editor re-renders the preview as fields change; re-measure when styles or content change.
    const opts = { childList: true, subtree: true, characterData: true }
    const mo = new MutationObserver(() => { mo.disconnect(); run(); mo.observe(root, opts) })
    mo.observe(root, opts)
    return () => mo.disconnect()
  }, [rootId])
  return null
}
