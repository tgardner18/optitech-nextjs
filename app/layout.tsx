import '@/lib/optimizely'
import '@/cms/registry'
import type { Metadata } from "next";
import { Geist_Mono, Poppins, Syne } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { MotionObserver } from "@/components/providers/MotionObserver";
import { getSiteSettings, getRequestDomain, buildThemeCSS, getRequestLocale } from '@/lib/optimizely'

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OptiTech",
  description: "OptiTech — bold, forward-moving.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const domain      = await getRequestDomain()
  const settings    = await getSiteSettings(domain)
  const themeCSS    = buildThemeCSS(settings)
  const defaultMode = (settings?.defaultMode as string | undefined) === 'light' ? 'light' : 'dark'
  const locale      = await getRequestLocale()

  return (
    <html
      lang={locale}
      // Consumed by /public/scripts/theme-init.js which runs before React hydration.
      // The script sets data-theme = localStorage value || this attribute || 'dark'.
      data-default-theme={defaultMode}
      className={`${poppins.variable} ${geistMono.variable} ${syne.variable} h-full antialiased`}
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
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
          <MotionObserver />
        </ThemeProvider>
      </body>
    </html>
  );
}
