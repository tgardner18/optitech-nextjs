import '@/lib/optimizely'
import '@/cms/registry'
import type { Metadata } from "next";
import { Geist_Mono, Poppins, Syne } from "next/font/google";
import "./globals.css";
import Script from 'next/script'
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

  // Runs synchronously before first paint — localStorage preference wins; CMS defaultMode is the site default.
  const themeScript = `(function(){try{var t=localStorage.getItem("optitech-theme");document.documentElement.setAttribute("data-theme",t||"${defaultMode}")}catch(e){}})()`;

  return (
    <html
      lang={locale}
      className={`${poppins.variable} ${geistMono.variable} ${syne.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
        {themeCSS && <style dangerouslySetInnerHTML={{ __html: themeCSS }} suppressHydrationWarning />}
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
