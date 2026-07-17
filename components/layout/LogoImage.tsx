'use client'

import { useRef } from 'react'

interface Props {
  src: string
  alt: string
  containerClass: string
  imgClass: string
}

/**
 * Renders the navbar logo inside a fixed-height container so the image
 * never needs to carry its own intrinsic dimensions. Works for SVG (with or
 * without explicit dimensions), PNG, WebP, and any aspect ratio.
 *
 * Uses a plain <img> instead of next/image so the container — not the asset —
 * owns all sizing. The onLoad handler warns when an SVG has no viewBox or
 * explicit dimensions and therefore cannot determine its aspect ratio.
 */
export function LogoImage({ src, alt, containerClass, imgClass }: Props) {
  const ref = useRef<HTMLImageElement>(null)

  function handleLoad() {
    const img = ref.current
    if (!img || img.naturalWidth !== 0) return
    const isSvg = src.split('?')[0].toLowerCase().endsWith('.svg')
    if (isSvg) {
      console.warn(
        `[Site Accelerator] Navbar logo at "${src}" rendered at 0×0.\n` +
        `The SVG root element is missing a viewBox or explicit width/height attributes,\n` +
        `so the browser cannot determine its intrinsic aspect ratio.\n` +
        `Fix: add viewBox="0 0 {W} {H}" to the root <svg> element in the source file.`,
      )
    }
  }

  return (
    <div className={containerClass}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={imgClass}
        style={{ color: 'transparent' }}
        onLoad={handleLoad}
        fetchPriority="high"
        decoding="async"
      />
    </div>
  )
}
