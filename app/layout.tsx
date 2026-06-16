import '@/lib/optimizely'
import '@/cms/registry'
import type { Metadata } from "next";
import { Bricolage_Grotesque, Caveat, Geist_Mono, Poppins, Sora, Source_Serif_4, Syne, Tilt_Neon } from "next/font/google";
import "./globals.css";
import { draftMode } from "next/headers";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { MotionObserver } from "@/components/providers/MotionObserver";
import { OptimizelyTracking } from "@/components/tracking/OptimizelyTracking";
import { getSiteSettings, getRequestDomain, buildThemeCSS, getRequestLocale } from '@/lib/optimizely'

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

// Primary C — Bricolage Grotesque: contemporary grotesque with irregular detail.
// The character / expressive pole; exceptional display presence under gradient fills.
const bricolage = Bricolage_Grotesque({
  variable: "--font-primary-c",
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

  // Official ODP stub — queues method calls until zaius-min.js loads, so
  // window.zaius is usable immediately (pageview tracking + customer()).
  const odpStub = odpPublicKey
    ? `var zaius=window.zaius||(window.zaius=[]);zaius.methods=["initialize","onload","customer","entity","event","subscribe","unsubscribe","consent","identify","anonymize","dispatch"];zaius.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);zaius.push(t);return zaius}};(function(){for(var i=0;i<zaius.methods.length;i++){var method=zaius.methods[i];zaius[method]=zaius.factory(method)}var e=document.createElement("script");e.type="text/javascript";e.async=true;e.src="https://d1igp3oop3iho5.cloudfront.net/v2/${odpPublicKey}/zaius-min.js";var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t)})();`
    : null

  return (
    <html
      lang={locale}
      // Consumed by /public/scripts/theme-init.js which runs before React hydration.
      // The script sets data-theme = localStorage value || this attribute || 'dark'.
      // data-theme is also declared here so React tracks it as a managed prop — if
      // Optimizely causes a hydration mismatch (error #418) and React falls back to a
      // full client re-render, React would otherwise strip data-theme (it only removes
      // attributes it doesn't know about), leaving the CSS tokens without a theme
      // anchor and falling back to dark. suppressHydrationWarning silences the
      // client/server diff when localStorage overrides the CMS default.
      data-default-theme={defaultMode}
      data-theme={defaultMode}
      className={`${poppins.variable} ${geistMono.variable} ${syne.variable} ${sourceSerif.variable} ${sora.variable} ${bricolage.variable} ${caveat.variable} ${tiltNeon.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {themeCSS && <style dangerouslySetInnerHTML={{ __html: themeCSS }} suppressHydrationWarning />}
        {/*
          Plain blocking <script src> in <head> — no next/script wrapper.
          Why not next/script strategy="beforeInteractive"?
            That component renders an inline (self.__next_s||[]).push(...) tracking script
            in the <body> position of the React tree, but Next.js physically injects the
            actual script into <head>. The DOM position mismatch causes React 19's hydration
            reconciler to hit the "create new element" path for a <script> element, which
            triggers the "Encountered a script tag" console error.
          A plain <script src> declared HERE, inside <head>, is SSR'd and hydrated at
          the exact same DOM position — React's popHydrationState() matches it, the
          creation path is never taken, and the warning never fires.
          No async/defer → browser executes it synchronously before painting → FOUC prevented.
          suppressHydrationWarning → silences any residual server/client attr diff.
        */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/scripts/theme-init.js" suppressHydrationWarning />
        {webExpProjectId && (
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script src={`https://cdn.optimizely.com/js/${webExpProjectId}.js`} suppressHydrationWarning />
        )}
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
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
          <MotionObserver />
        </ThemeProvider>
        {/* FX boot + ODP pageview tracking (client). Self-guards on window.zaius
            / the SDK key, so rendering it when only one of the two is set is safe. */}
        {(odpPublicKey || fxSdkKey) && <OptimizelyTracking />}
      </body>
    </html>
  );
}
