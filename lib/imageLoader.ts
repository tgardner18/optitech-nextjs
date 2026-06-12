'use client'

import type { ImageLoaderProps } from 'next/image'

/**
 * Custom next/image loader.
 *
 * Why this exists: Vercel's built-in Image Optimization API is quota/spend
 * capped per project. When the cap is hit, `/_next/image` returns HTTP 402
 * (`OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED`) and images silently fail to
 * render. This loader bypasses Vercel's optimizer entirely by returning a URL
 * the browser fetches directly from the source, so image delivery no longer
 * depends on the Vercel optimization quota.
 *
 * - Optimizely SaaS CMS media (`*.optimizely.com`): served directly. This
 *   instance does not perform server-side resizing (width/quality params are
 *   ignored and the original is always returned), so we return the canonical
 *   URL unchanged — a single cacheable file rather than N identical copies in
 *   the srcset.
 * - Unsplash (`images.unsplash.com`): supports native resizing via query
 *   params, so we keep responsive behaviour by passing width/quality/auto.
 * - Local/relative assets (`/...`) and anything else: returned as-is.
 */
export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  // Local/static assets under /public — serve as-is.
  if (src.startsWith('/')) return src

  let url: URL
  try {
    url = new URL(src)
  } catch {
    return src
  }

  // Unsplash resizes on its own CDN — keep images responsive.
  if (url.hostname === 'images.unsplash.com') {
    url.searchParams.set('w', String(width))
    url.searchParams.set('q', String(quality ?? 75))
    url.searchParams.set('auto', 'format')
    return url.toString()
  }

  // Optimizely SaaS CMS media (and any other optimizely.com host): the CMS
  // ignores resize params and returns the original, so serve the canonical URL
  // directly — straight from the CMS, never through Vercel's optimizer.
  if (url.hostname.endsWith('.optimizely.com')) {
    return src
  }

  return src
}
