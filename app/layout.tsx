import '@/lib/optimizely'
import '@/cms/registry'
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Caveat, Geist_Mono, Manrope, Poppins, Sora, Source_Serif_4, Syne, Tilt_Neon } from "next/font/google";
import "./globals.css";
import { cookies, draftMode } from "next/headers";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { MotionObserver } from "@/components/providers/MotionObserver";
import { OptimizelyTracking } from "@/components/tracking/OptimizelyTracking";
import { getSiteSettings, getRequestDomain, buildThemeCSS, getRequestLocale } from '@/lib/optimizely'
import Script from 'next/script'

// Weights are limited to the set the product UI actually renders:
// 300 (light — stat values, banner lede), 400 (body), 500 (medium — nav/UI),
// 600 (title/label), 700 (headline), 800 (display). Thin/ExtraLight/Black
// (100/200/900) are unused in product and intentionally not shipped.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

// Syne — fixed accent/display font for very select areas (e.g. the Impact blog).
// No longer themeable: the ThemeManager font axis now swaps the PRIMARY family.
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// ── Alternate PRIMARY fonts (ThemeManager "Primary Font" axis) ─────────────────
// Each is a full primary typeface — drives the entire hierarchy (display headers
// down to body and labels) when selected, exactly like Poppins. All preloaded
// here because next/font is build-time; the CMS only selects among these via
// lib/theme-axes.ts and can never load an arbitrary font string. The 300–800
// weight ladder matches Poppins so every type level holds, and display: "swap" +
// variable assignment keeps the swap FOUT-free.
//
// Primary A — Source Serif 4: the lone serif. The institutional / editorial pole
// — gravitas for medical, financial, and legal verticals, and categorically
// distinct from the three sans. Strong 800 for display, legible 400 for body.
const sourceSerif = Source_Serif_4({
  variable: "--font-primary-a",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// Primary B — Sora: squared geometric sans engineered for technical brands.
// The precise / engineered pole; large display sizes read milled-from-metal.
const sora = Sora({
  variable: "--font-primary-b",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// Primary C — Plus Jakarta Sans: geometric humanist with wide weight ladder and
// strong legibility at all sizes. Warm, modern alternative to Poppins.
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-primary-c",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// Primary D — Manrope: variable-axis geometric sans. Clean, minimal, excellent
// legibility at small sizes and strong presence at display scale.
const manrope = Manrope({
  variable: "--font-primary-d",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Signature font — Caveat 400: thin, handwriting feel, less calligraphic than
// script fonts. Used exclusively by LaserSignature on the QuoteBlock.
const caveat = Caveat({
  variable: "--font-signature",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

// Neon font — Tilt Neon 400: a clean monoline display face that reads as a single
// bent glass tube, the foundation of the white-core / colored-glow neon sign look.
// Single weight, display-only. Used exclusively by the PrimaryText "neon" header
// effect (same scoped pattern as Caveat for the QuoteBlock signature).
const tiltNeon = Tilt_Neon({
  variable: "--font-tilt-neon",
  subsets: ["latin"],
  weight: ["400"],
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
  return {
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
      className={`${poppins.variable} ${geistMono.variable} ${syne.variable} ${sourceSerif.variable} ${sora.variable} ${plusJakarta.variable} ${manrope.variable} ${caveat.variable} ${tiltNeon.variable} h-full antialiased`}
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
        {/* Content Recommendations (Idio) — inline config only; async engine loads after hydration below. */}
        {idioConfig && (
          <script dangerouslySetInnerHTML={{ __html: idioConfig }} suppressHydrationWarning />
        )}
        {/* Product Recommendations (Peerius) — shim only; engine loads after hydration below. */}
        {peeriusShim && peeriusScriptUrl && (
          <script dangerouslySetInnerHTML={{ __html: peeriusShim }} suppressHydrationWarning />
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
      </body>
    </html>
  );
}
