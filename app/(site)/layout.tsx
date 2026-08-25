import Header from "@/components/layout/Header"
import SplitHeader from "@/components/layout/SplitHeader"
import SidebarNav from "@/components/layout/SidebarNav"
import Footer from "@/components/layout/Footer"
import ScrollToTop from "@/components/ui/ScrollToTop"
import { SearchProvider } from "@/components/search/SearchProvider"
import SiteSearch from "@/components/search/SiteSearch"
import MemberWelcomeBanner from "@/components/auth/MemberWelcomeBanner"
import { LocaleProvider } from "@/lib/i18n/LocaleProvider"
import { getRequestLocale, getRequestDomain, getSiteSettings } from "@/lib/optimizely"
import { resolveNavbarStyle } from "@/lib/theme-axes"
import { getTokenMap } from "@/lib/tokens"
import { TokenProvider } from "@/components/providers/TokenProvider"

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale       = await getRequestLocale()
  const domain       = await getRequestDomain()
  const [settings, tokens] = await Promise.all([
    getSiteSettings(domain, locale),
    getTokenMap(locale),
  ])
  const navbarStyle  = resolveNavbarStyle(settings?.navbarStyle)

  if (navbarStyle === 'sidebar') {
    return (
      <TokenProvider tokens={tokens}>
        <LocaleProvider locale={locale}>
          <SearchProvider>
            {/* data-nav cascades --ot-site-header-h (globals.css) to every consumer
                on the page — e.g. the showcase nav's sticky offset — regardless of
                which nav style is active. display:contents keeps it out of the box
                tree so it can't affect this branch's own layout. */}
            <div data-nav={navbarStyle} className="contents">
              <SidebarNav />
              <SiteSearch />
              {/* Content shifts right of the fixed rail. The margin is driven by
                  --ot-sidebar-width (emitted by buildThemeCSS, 0px when not sidebar).
                  On mobile the rail is hidden, so no margin applies below lg. */}
              <div className="ot-sidebar-content flex flex-col min-h-dvh">
                <main id="main-content" className="flex-1">{children}</main>
                <Footer />
                <ScrollToTop />
              </div>
            </div>
          </SearchProvider>
        </LocaleProvider>
      </TokenProvider>
    )
  }

  return (
    <TokenProvider tokens={tokens}>
      <LocaleProvider locale={locale}>
        <SearchProvider>
          {/* See data-nav comment above — same cascade, needed here too since
              split-bar's own header already sets it on itself, but top-bar and
              anything below the header (e.g. showcase nav) need it as well. */}
          <div data-nav={navbarStyle} className="contents">
            {navbarStyle === 'split-bar' ? <SplitHeader /> : <Header />}
            <MemberWelcomeBanner />
            <SiteSearch />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
            <ScrollToTop />
          </div>
        </SearchProvider>
      </LocaleProvider>
    </TokenProvider>
  )
}
