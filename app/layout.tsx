import '@/lib/optimizely'
import '@/cms/registry'
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cookies, draftMode } from "next/headers";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { MotionObserver } from "@/components/providers/MotionObserver";
import { OptimizelyTracking } from "@/components/tracking/OptimizelyTracking";
import { getSiteSettings, getRequestDomain, getRequestBaseUrl, buildThemeCSS, getRequestLocale } from '@/lib/optimizely'
import Script from 'next/script'

// ── Fonts are SELF-HOSTED (next/font/local from @fontsource packages) ─────────
// They used to come from next/font/google, which downloads from fonts.googleapis.com on
// every build; a single transient network failure failed the whole deploy ("Can't resolve
// @vercel/turbopack-next/internal/font/google/font"). Local files make the build network-
// independent. Same families, same CSS variables, latin subset, so nothing downstream
// changes. Variable fonts cover the whole 300–800 weight ladder in one file; Poppins is
// not published as a variable font, so it ships one file per weight.
// NOTE: next/font/local needs literal `src` paths, so these can't be built in a loop.

// Weights are limited to the set the product UI actually renders:
// 300 (light — stat values, banner lede), 400 (body), 500 (medium — nav/UI),
// 600 (title/label), 700 (headline), 800 (display).
const poppins = localFont({
  src: [
    { path: "../node_modules/@fontsource/poppins/files/poppins-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../node_modules/@fontsource/poppins/files/poppins-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../node_modules/@fontsource/poppins/files/poppins-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../node_modules/@fontsource/poppins/files/poppins-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../node_modules/@fontsource/poppins/files/poppins-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../node_modules/@fontsource/poppins/files/poppins-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

// Syne — fixed accent/display font for very select areas (e.g. the Impact blog).
// No longer themeable: the ThemeManager font axis now swaps the PRIMARY family.
const syne = localFont({
  src: "../node_modules/@fontsource-variable/syne/files/syne-latin-wght-normal.woff2",
  variable: "--font-syne",
  weight: "400 800",
  display: "swap",
});

// ── Alternate PRIMARY fonts (ThemeManager "Primary Font" axis) ─────────────────
// Each is a full primary typeface — drives the entire hierarchy when selected, exactly
// like Poppins. All preloaded here because next/font is build-time; the CMS only selects
// among these via lib/theme-axes.ts and can never load an arbitrary font string.
// A: Source Serif 4 (institutional serif) · B: Sora (technical, squared geometric)
// C: Plus Jakarta Sans (warm geometric humanist) · D: Manrope (clean, minimal)
// E: Hanken Grotesk (quiet neo-grotesk) · F: Fraunces (soft, characterful serif)
const sourceSerif = localFont({
  src: "../node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2",
  variable: "--font-primary-a",
  weight: "300 800",
  display: "swap",
});

const sora = localFont({
  src: "../node_modules/@fontsource-variable/sora/files/sora-latin-wght-normal.woff2",
  variable: "--font-primary-b",
  weight: "300 800",
  display: "swap",
});

const plusJakarta = localFont({
  src: "../node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2",
  variable: "--font-primary-c",
  weight: "300 800",
  display: "swap",
});

const manrope = localFont({
  src: "../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
  variable: "--font-primary-d",
  weight: "300 800",
  display: "swap",
});

const hankenGrotesk = localFont({
  src: "../node_modules/@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2",
  variable: "--font-primary-e",
  weight: "300 800",
  display: "swap",
});

const fraunces = localFont({
  src: "../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2",
  variable: "--font-primary-f",
  weight: "300 800",
  display: "swap",
});

const geistMono = localFont({
  src: "../node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

// Signature font — Caveat: thin, handwriting feel. Used exclusively by LaserSignature on the QuoteBlock.
const caveat = localFont({
  src: "../node_modules/@fontsource-variable/caveat/files/caveat-latin-wght-normal.woff2",
  variable: "--font-signature",
  weight: "400 700",
  display: "swap",
});

// Neon font — Orbitron: wide, mechanical, legible under heavy glow. Display-only (PrimaryText "neon" effect, Neon campaign look).
const orbitron = localFont({
  src: "../node_modules/@fontsource-variable/orbitron/files/orbitron-latin-wght-normal.woff2",
  variable: "--font-orbitron",
  weight: "400 900",
  display: "swap",
});

// Dynamic metadata from the CMS ThemeManager.
// getSiteSettings is React cache()-wrapped so this share the same fetch
// as the RootLayout body below — no extra round-trip per request.
//
// Why generateMetadata (async) and not a static `metadata` export?
// The title template ("%s | SiteName") MUST be set at the layout level.
// Next.js applies a parent layout's template to child pages' string titles.
// If the template is returned from the page's own generateMetadata, Next.js
// treats it as applying to that page's *children*, so the page's own <title>
// falls back to whatever the layout declared — breaking the browser tab title.
export async function generateMetadata(): Promise<Metadata> {
  const domain   = await getRequestDomain()
  const locale   = await getRequestLocale()
  const settings = await getSiteSettings(domain, locale)
  const siteName = (settings?.siteName as string | null | undefined) ?? 'Site Accelerator'
  // Resolves relative canonical / og:url / og:image against THIS request's origin, so they
  // come out absolute on every demo domain without NEXT_PUBLIC_SITE_URL being set per deployment.
  const baseUrl = await getRequestBaseUrl()
  let metadataBase: URL | undefined
  try { metadataBase = baseUrl ? new URL(baseUrl) : undefined } catch { /* leave unset */ }
  return {
    metadataBase,
    title: {
      default:  siteName,
      // Applied automatically to every CMS page's string title:
      //   seoTitle "Using the SDK"  →  <title>Using the SDK | Site Accelerator</title>
      //   seoTitle blank            →  <title>Site Accelerator</title>  (the default above)
      template: `%s | ${siteName}`,
    },
    description: (settings?.defaultSeoDescription as string | null | undefined)
      ?? 'Site Accelerator — a configurable, multi-vertical site framework.',
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const domain      = await getRequestDomain()
  const locale      = await getRequestLocale()
  const settings    = await getSiteSettings(domain, locale)
  const themeCSS    = buildThemeCSS(settings)
  const defaultMode = (settings?.defaultMode as string | undefined) === 'light' ? 'light' : 'dark'

  // Cookie-based theme: ThemeProvider writes 'site-theme' on every toggle so
  // the server renders the correct theme without any client-side init script.
  // Falls back to the CMS default on first visit (no cookie yet).
  const cookieStore = await cookies()
  const themeCookie = cookieStore.get('site-theme')?.value
  const resolvedTheme = (themeCookie === 'light' || themeCookie === 'dark') ? themeCookie : defaultMode

  // Optimizely Web Experimentation — only inject when the project ID is a
  // non-empty numeric string. Must run blocking before React hydrates so
  // experiment activation logic fires before first paint (no flicker).
  const rawWebExpId = (settings?.webExperimentationProjectId as string | null | undefined)?.trim()
  const webExpProjectId = rawWebExpId && /^\d+$/.test(rawWebExpId) ? rawWebExpId : null

  // FX + ODP — skip entirely in CMS preview/draft so the editor iframe never
  // pollutes experiment or ODP data. Keys are validated against a safe charset
  // before being interpolated into inline scripts.
  const { isEnabled: isPreview } = await draftMode()
  const rawOdpKey = (settings?.odpPublicKey as string | null | undefined)?.trim()
  const odpPublicKey = !isPreview && rawOdpKey && /^[\w-]+$/.test(rawOdpKey) ? rawOdpKey : null
  const rawFxKey = (settings?.featureExperimentationSdkKey as string | null | undefined)?.trim()
  const fxSdkKey = !isPreview && rawFxKey && /^[\w-]+$/.test(rawFxKey) ? rawFxKey : null

  // Recommendations tracking (skipped in preview like FX/ODP). All values are
  // validated against a safe charset before being interpolated into scripts.
  // Product Recommendations (Peerius): shim must be set BEFORE the async script
  // so the engine can call smartRecs → dispatch the `peerius:recs` window event.
  const rawPeeriusUrl = (settings?.peeriusScriptUrl as string | null | undefined)?.trim()
  const peeriusScriptUrl = !isPreview && rawPeeriusUrl && /^https:\/\/[\w.\-/]+$/.test(rawPeeriusUrl) ? rawPeeriusUrl : null
  const peeriusShim = peeriusScriptUrl
    ? `window.PeeriusCallbacks=window.PeeriusCallbacks||{track:{type:'home',lang:${JSON.stringify(locale)}},apiVersion:'v1_4',smartRecs:function(j){window.__peeriusRecs=j;window.dispatchEvent(new CustomEvent('peerius:recs',{detail:j}))},info:function(j){window.__peeriusInfo=j}};`
    : null

  // Google Analytics 4 — skipped in preview so the editor never inflates GA data.
  const rawGaId = (settings?.googleAnalyticsId as string | null | undefined)?.trim()
  const gaId = !isPreview && rawGaId && /^[A-Za-z0-9-]+$/.test(rawGaId) ? rawGaId : null
  const gaInit = gaId
    ? `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(gaId)});`
    : null

  // Content Recommendations (Idio): ia.js builds the visitor profile and sets
  // the `iv` cookie the Content Recommendations block reads server-side.
  const rawIdioClient = (settings?.contentRecsClientId as string | null | undefined)?.trim()
  const idioClientId = !isPreview && rawIdioClient && /^[\w-]+$/.test(rawIdioClient) ? rawIdioClient : null
  const rawIdioDelivery = (settings?.contentRecsDeliveryId as string | null | undefined)?.trim()
  const idioDeliveryId = !isPreview && rawIdioDelivery && /^\d+$/.test(rawIdioDelivery) ? rawIdioDelivery : null
  const idioConfig = idioClientId && idioDeliveryId
    ? `window._iaq=[['client',${JSON.stringify(idioClientId)}],['delivery',${Number(idioDeliveryId)}],['track','consume']];`
    : null

  // Official ODP stub — queues method calls until zaius-min.js loads, so
  // window.zaius is usable immediately (pageview tracking + customer()).
  const odpStub = odpPublicKey
    ? `var zaius=window.zaius||(window.zaius=[]);zaius.methods=["initialize","onload","customer","entity","event","subscribe","unsubscribe","consent","identify","anonymize","dispatch"];zaius.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);zaius.push(t);return zaius}};(function(){for(var i=0;i<zaius.methods.length;i++){var method=zaius.methods[i];zaius[method]=zaius.factory(method)}var e=document.createElement("script");e.type="text/javascript";e.async=true;e.src="https://d1igp3oop3iho5.cloudfront.net/v2/${odpPublicKey}/zaius-min.js";var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t)})();`
    : null

  return (
    <html
      lang={locale}
      // Server-resolved from the site-theme cookie (set by ThemeProvider on every
      // toggle). No client-side init script needed — the correct theme is baked into
      // the SSR HTML so there is no FOUC even on first paint.
      data-theme={resolvedTheme}
      data-scroll-behavior="smooth"
      className={`${poppins.variable} ${geistMono.variable} ${syne.variable} ${sourceSerif.variable} ${sora.variable} ${plusJakarta.variable} ${manrope.variable} ${hankenGrotesk.variable} ${fraunces.variable} ${caveat.variable} ${orbitron.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {themeCSS && <style dangerouslySetInnerHTML={{ __html: themeCSS }} suppressHydrationWarning />}
        {/* ODP tracker stub — blocking so window.zaius exists before tracking runs. */}
        {odpStub && (
          <script dangerouslySetInnerHTML={{ __html: odpStub }} suppressHydrationWarning />
        )}
        {/* Hand the FX SDK key to the browser client without threading props. */}
        {fxSdkKey && (
          <script
            dangerouslySetInnerHTML={{ __html: `window.__OPTIMIZELY_FX_SDK_KEY__=${JSON.stringify(fxSdkKey)};` }}
            suppressHydrationWarning
          />
        )}
        {/* Web Experimentation command queue — events pushed before the async
            snippet loads are replayed by it (lib/commerce/track.ts). */}
        {webExpProjectId && (
          <script dangerouslySetInnerHTML={{ __html: 'window.optimizely=window.optimizely||[];' }} suppressHydrationWarning />
        )}
        {/* Content Recommendations (Idio) — inline config only; async engine loads after hydration below. */}
        {idioConfig && (
          <script dangerouslySetInnerHTML={{ __html: idioConfig }} suppressHydrationWarning />
        )}
        {/* Product Recommendations (Peerius) — shim only; engine loads after hydration below. */}
        {peeriusShim && peeriusScriptUrl && (
          <script dangerouslySetInnerHTML={{ __html: peeriusShim }} suppressHydrationWarning />
        )}
        {/* Google Analytics 4 — dataLayer init + config; external gtag.js loads after hydration below. */}
        {gaInit && (
          <script dangerouslySetInnerHTML={{ __html: gaInit }} suppressHydrationWarning />
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
          <MotionObserver />
        </ThemeProvider>
        {/* FX boot + ODP pageview tracking (client). Self-guards on window.zaius
            / the SDK key, so rendering it when only one of the two is set is safe. */}
        {(odpPublicKey || fxSdkKey) && <OptimizelyTracking />}
        {/* External scripts that must not trigger React 19's "Encountered a script tag"
            warning. next/script afterInteractive injects via useEffect after hydration —
            React never renders a <script> element during reconciliation, so no warning.
            Web Exp: loses before-paint blocking (needed for A/B flicker prevention on
            real sites) but acceptable here — this is a demo framework, not a live
            experiment host. Idio/Peerius were already async so behaviour is identical. */}
        {webExpProjectId && (
          <Script src={`https://cdn.optimizely.com/js/${webExpProjectId}.js`} strategy="afterInteractive" />
        )}
        {idioConfig && (
          <Script src="//s.usea01.idio.episerver.net/ia.js" strategy="afterInteractive" />
        )}
        {peeriusShim && peeriusScriptUrl && (
          <Script src={peeriusScriptUrl} strategy="afterInteractive" />
        )}
        {gaId && (
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
        )}
      </body>
    </html>
  );
}
